"use client";
import { usePixelData } from "@/hooks/usePixelData";
import { useSession } from "next-auth/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import { io, Socket } from "socket.io-client";
import { Colors, palette } from "./Colors";
import { createPixelsAction } from "@/actions/canvas";
import Image from "next/image";
import { envs } from "@/env";

/* =========================
 * Types & Constants
 * ========================= */
type RGB = [number, number, number];
type Palette = RGB[];

type Point = { x: number; y: number };
type Offset = Point;
type Rect = { x: number; y: number; w: number; h: number };

export type BoardCanvasProps = {
  /** World size in cells */
  width: number;
  height: number;
  /** Initial zoom (will be clamped to min scale dynamically) */
  initialScale?: number;
  /** How many random test points to seed at start (0 to disable) */
  initRandomPoints?: number;
};

const MAX_SCALE = 100;
const MIN_SCALE = 1.5;
const ZOOM_SPEED = 0.0018;

/* =========================
 * Pure helpers (no React)
 * ========================= */
function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function dist(a: Point, b: Point) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function midpoint(a: Point, b: Point) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/* =========================
 * Component
 * ========================= */
const BoardCanvas: React.FC<BoardCanvasProps> = ({
  width,
  height,
  initialScale = 0.5,
  initRandomPoints = 800,
}) => {
  // Visible canvases

  const { data: session } = useSession();

  const { fetchPixelData, cleanData, pixelData, userData } = usePixelData();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const touchStartRef = useRef<Point | null>(null);

  // NUEVO estado para la celda seleccionada
  const [selectedCells, setSelectedCells] = useState<
    {
      x: number;
      y: number;
      color: number;
    }[]
  >([]);

  // Backing 1:1 (offscreen if available; otherwise an in-memory <canvas>)
  const backingCanvasRef = useRef<HTMLCanvasElement | OffscreenCanvas | null>(
    null
  );
  const backingCtxRef = useRef<
    CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null
  >(null);

  // Board data
  const imgDataRef = useRef<ImageData | null>(null);
  const bufferRef = useRef<Uint8Array>(new Uint8Array(width * height));

  // View state + refs for immediate painting
  const [scale, _setScale] = useState<number>(initialScale);
  const [offset, _setOffset] = useState<Offset>({ x: 0, y: 0 });
  const scaleRef = useRef<number>(initialScale);
  const offsetRef = useRef<Offset>({ x: 0, y: 0 });

  // Current drawing color (palette index)
  const [color, setColor] = useState<number>(1);

  // Dirty rectangles to re-blit into ImageData -> backing
  const dirtyRef = useRef<Rect[]>([]);

  // Pan / drag
  const isPanningRef = useRef(false);
  const lastPanRef = useRef<Point | null>(null);

  // Touch/Pinch
  const activeTouches = useRef<Map<number, Point>>(new Map());
  const fingers = useRef<number>(0);

  const pinchRef = useRef<{
    startDist: number;
    startScale: number;
    startOffset: Offset;
    startMid: Point;
  } | null>(null);

  const wsRef = useRef<Socket | null>(null);

  // Paint white the background

  /* =========================
   * Setters that keep refs in sync
   * ========================= */
  const setScaleImmediate = useCallback((next: number) => {
    scaleRef.current = next;
    _setScale(next);
  }, []);

  const setOffsetImmediate = useCallback((next: Offset) => {
    offsetRef.current = next;
    _setOffset(next);
  }, []);

  useEffect(() => {
    const ws = io(`${envs.API_URL}/rplace`, {
      auth: {
        token: `Bearer ${session?.accessToken}`,
      },
    });
    wsRef.current = ws;

    ws.on("connect", () => {
      console.log("[WS] Connected");
    });

    ws.on("disconnect", () => {
      console.log("[WS] Disconnected");
    });

    ws.on("updatePixel", (data: { x: number; y: number; color: number }) => {
      placePixelLocal(data.x, data.y, data.color, true);
      paintDirty();
    });

    ws.on("pixels", (data: { x: number; y: number; color: number }[]) => {
      console.log("[WS] Received pixels batch", data);
      data.forEach((pixel) => {
        // console.log(pixel);
        placePixelLocal(pixel.x, pixel.y, pixel.color, true);
      });
      paintDirty();
    });

    return () => {
      ws.close();
    };
  }, []);

  /* =========================
   * View / Geometry helpers
   * ========================= */
  const getViewSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { vw: 0, vh: 0 };
    const rect = canvas.getBoundingClientRect();
    return { vw: rect.width, vh: rect.height };
  }, []);

  const getMinScale = useCallback(() => {
    const { vw, vh } = getViewSize();
    if (vw === 0 || vh === 0) return 1;
    return Math.max(vw / width, vh / height);
  }, [getViewSize, width, height]);

  const clampOffsetForScale = useCallback(
    (off: Offset, sc: number): Offset => {
      const { vw, vh } = getViewSize();
      const worldW = width * sc;
      const worldH = height * sc;

      // If world is smaller than view, min can be negative (center), max positive.
      const minX = Math.min(0, vw - worldW);
      const maxX = Math.max(0, vw - worldW);
      const minY = Math.min(0, vh - worldH);
      const maxY = Math.max(0, vh - worldH);

      return {
        x: clamp(off.x, minX, maxX),
        y: clamp(off.y, minY, maxY),
      };
    },
    [getViewSize, width, height]
  );

  const enforceMinScaleAndCenter = useCallback(
    (currentScale?: number) => {
      const minS = getMinScale();
      const sc = Math.max(currentScale ?? scaleRef.current, minS);
      setScaleImmediate(sc);

      // Center world in view
      const { vw, vh } = getViewSize();
      const worldW = width * sc;
      const worldH = height * sc;
      const nx = (vw - worldW) / 2;
      const ny = (vh - worldH) / 2;
      setOffsetImmediate({ x: nx, y: ny });
    },
    [
      getMinScale,
      getViewSize,
      setOffsetImmediate,
      setScaleImmediate,
      width,
      height,
    ]
  );

  const screenToCell = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const cx = clientX - rect.left;
    const cy = clientY - rect.top;
    const s = scaleRef.current;
    const off = offsetRef.current;
    const worldX = (cx - off.x) / s;
    const worldY = (cy - off.y) / s;
    return { x: Math.floor(worldX), y: Math.floor(worldY) };
  }, []);

  /* =========================
   * Board write helpers
   * ========================= */
  const markDirty = useCallback((x: number, y: number, w = 1, h = 1) => {
    dirtyRef.current.push({ x, y, w, h });
  }, []);

  const placePixelLocal = useCallback(
    (x: number, y: number, palIndex: number, mark = true) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      bufferRef.current[y * width + x] = palIndex;
      if (mark) markDirty(x, y, 1, 1);
    },
    [height, markDirty, width]
  );

  /* =========================
   * Painting
   * ========================= */
  const paintDirty = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const backing = backingCanvasRef.current;
    const bctx = backingCtxRef.current;

    const imgData = imgDataRef.current;
    if (!canvas || !ctx || !backing || !bctx || !imgData || !imgDataRef.current)
      return;
    const buf = bufferRef.current;
    // console.log(buf);

    // for (let i = 0; i < imgDataRef.current.data.length; i += 4) {
    //   imgDataRef.current.data[i] = 255; // R
    //   imgDataRef.current.data[i + 1] = 255; // G
    //   imgDataRef.current.data[i + 2] = 255; // B
    //   imgDataRef.current.data[i + 3] = 255; // A
    // }

    // 1) Flush dirty rects into ImageData
    let rect: Rect | undefined;
    let wrote = false;
    while ((rect = dirtyRef.current.pop())) {
      const { x, y, w, h } = rect;
      for (let yy = y; yy < y + h; yy++) {
        const rowBase = yy * width;
        const dataBase = rowBase * 4;
        for (let xx = x; xx < x + w; xx++) {
          const idx = rowBase + xx;
          const palIndex = buf[idx]!;
          const [r, g, b] = palette[palIndex].rgb || [0, 0, 0];
          const di = dataBase + xx * 4;
          imgData.data[di] = r;
          imgData.data[di + 1] = g;
          imgData.data[di + 2] = b;
          imgData.data[di + 3] = 255;
          wrote = true;
        }
      }
    }
    if (wrote) {
      // putImageData positions the top-left corner at (0, 0)
      bctx.putImageData(imgData, 0, 0);
    }

    // 2) Draw backing into visible canvas using DPR + pan + zoom
    const dpr = window.devicePixelRatio || 1;

    // Clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // DPR -> pan -> zoom
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(offsetRef.current.x, offsetRef.current.y);
    ctx.scale(scaleRef.current, scaleRef.current);

    // Disable smoothing for crisp pixels
    (ctx as CanvasRenderingContext2D).imageSmoothingEnabled = false;

    // OffscreenCanvas is compatible with drawImage
    ctx.drawImage(backing as unknown as CanvasImageSource, 0, 0);
  }, [palette, width]);

  const drawOverlay = useCallback(
    (cellX: number, cellY: number, colorOverlay: number) => {
      const overlay = overlayRef.current;
      const ctx = overlay?.getContext("2d");
      if (!overlay || !ctx) return;

      const dpr = window.devicePixelRatio || 1;
      // // Clear
      // ctx.setTransform(1, 0, 0, 1, 0, 0);
      // ctx.clearRect(0, 0, overlay.width, overlay.height);

      // DPR -> pan -> zoom
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(offsetRef.current.x, offsetRef.current.y);
      ctx.scale(scaleRef.current, scaleRef.current);
      (ctx as CanvasRenderingContext2D).imageSmoothingEnabled = false;

      // Fill the selected cell
      ctx.fillStyle = `rgba(${palette[colorOverlay].rgb.join(", ")})`;
      ctx.fillRect(cellX, cellY, 1, 1);

      // Cell-aligned border (no 0.5px offsets)
      ctx.strokeStyle = `rgba(${palette[color === 0 ? 2 : 1].rgb.join(
        ", "
      )}, 1)`;
      ctx.lineWidth = 2 / scaleRef.current;
      ctx.strokeRect(cellX, cellY, 1, 1);
    },
    []
  );

  /* =========================
   * Init backing & seed data
   * ========================= */
  useEffect(() => {
    // Create backing canvas (offscreen if available)
    const backing: HTMLCanvasElement | OffscreenCanvas =
      typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(width, height)
        : (() => {
            const c = document.createElement("canvas");
            c.width = width;
            c.height = height;
            return c;
          })();

    const bctx = backing.getContext("2d", { alpha: false }) as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null;
    if (!bctx) return;

    // Disable smoothing for crisp pixels
    (
      bctx as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
    ).imageSmoothingEnabled = false as unknown as boolean;

    backingCanvasRef.current = backing;
    backingCtxRef.current = bctx;
    imgDataRef.current = bctx.createImageData(width, height);

    // First full repaint
    dirtyRef.current = [{ x: 0, y: 0, w: width, h: height }];

    // Optional: seed random points + central cross
    // if (initRandomPoints && initRandomPoints > 0) {
    //   const buf = bufferRef.current;
    //   buf.fill(0);
    //   for (let i = 0; i < initRandomPoints; i++) {
    //     const x = (Math.random() * width) | 0;
    //     const y = (Math.random() * height) | 0;
    //     const c = Math.random() < 0.5 ? 1 : 2; // black or red
    //     placePixelLocal(x, y, c, true);
    //   }
    //   const cx = (width / 2) | 0;
    //   const cy = (height / 2) | 0;
    //   for (let x = 0; x < width; x++) placePixelLocal(x, cy, 1, true);
    //   for (let y = 0; y < height; y++) placePixelLocal(cx, y, 1, true);
    // }

    paintDirty();
  }, [height, width, initRandomPoints, placePixelLocal, paintDirty]);

  /* =========================
   * Resize handling via ResizeObserver (with window fallback)
   * ========================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const dpr = () => window.devicePixelRatio || 1;

    const applySize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;

      const ratio = dpr();
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      overlay.width = canvas.width;
      overlay.height = canvas.height;
      overlay.style.width = canvas.style.width;
      overlay.style.height = canvas.style.height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      }

      // Respect min scale & center after layout changes
      // enforceMinScaleAndCenter();
      paintDirty();
    };

    // Prefer ResizeObserver for more reliable container-based sizing
    const ro = new ResizeObserver(applySize);
    ro.observe(canvas.parentElement as Element);

    // Fallback in case DPR changes without resize
    window.addEventListener("resize", applySize);
    applySize();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", applySize);
    };
  }, [paintDirty]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    // limpiar overlay completo
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    console.log("selectedCells", selectedCells, scale, offset);

    if (selectedCells.length > 0) {
      selectedCells.forEach((cell) => {
        console.log("drawOverlay", cell.x, cell.y, cell.color);
        drawOverlay(cell.x, cell.y, cell.color);
      });
      // const { x, y } = selectedCell;
      // const dpr = window.devicePixelRatio || 1;
      // ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // ctx.translate(offsetRef.current.x, offsetRef.current.y);
      // ctx.scale(scaleRef.current, scaleRef.current);
      // (ctx as CanvasRenderingContext2D).imageSmoothingEnabled = false;

      // // ctx.fillStyle = "rgba(0, 200, 255, 0.35)"; // azul semitransparente
      // // ctx.fillRect(x, y, 1, 1);

      // ctx.strokeStyle = "black";
      // ctx.lineWidth = 0.2;
      // ctx.strokeRect(x, y, 1, 1);
    }
  }, [selectedCells, scale, offset]); // 👈 IMPORTANTES

  /* =========================
   * First-run: clamp to min scale & paint
   * ========================= */
  useEffect(() => {
    enforceMinScaleAndCenter(scaleRef.current);
    paintDirty();
  }, [enforceMinScaleAndCenter, paintDirty]);

  /* =========================
   * Global pointer safety (lost pointerup, etc.)
   * ========================= */
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        lastPanRef.current = null;
        setOffsetImmediate(
          clampOffsetForScale(offsetRef.current, scaleRef.current)
        );
        paintDirty();
      }
    };
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);
    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, [clampOffsetForScale, paintDirty, setOffsetImmediate]);

  /* =========================
   * Context menu disable on canvas (optional UX)
   * ========================= */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const handler = (e: MouseEvent) => e.preventDefault();
    c.addEventListener("contextmenu", handler);
    return () => c.removeEventListener("contextmenu", handler);
  }, []);

  // ======================
  // KEYDOWN SPACE = pintar
  // ======================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (selectedCells.length > 0) {
          handlePaint();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCells, color]);

  /* =========================
   * Pointer & Wheel Handlers
   * ========================= */

  const placePixelAndBroadcast = useCallback(
    (x: number, y: number, palIndex: number) => {
      placePixelLocal(x, y, palIndex, true);
      paintDirty();

      // enviar al servidor
      // const ws = wsRef.current;
      // if (ws && ws.connected) {
      //   ws.emit("placePixel", { x, y, color: palIndex });
      // }
    },
    [placePixelLocal, paintDirty]
  );

  const handlePaint = async () => {
    if (selectedCells) {
      selectedCells.forEach((selectedCell) => {
        placePixelAndBroadcast(
          selectedCell.x,
          selectedCell.y,
          selectedCell.color
        );
        const overlay = overlayRef.current;
        if (overlay) {
          const ctx = overlay.getContext("2d");
          ctx?.clearRect(0, 0, overlay.width, overlay.height);
        }
      });

      await createPixelsAction({
        pixels: selectedCells,
      });

      setSelectedCells([]); // limpiar selección
    }
  };

  const select = (x: number, y: number, color: number) => {
    setSelectedCells((prev) => {
      if (prev.length === 0) {
        fetchPixelData(x, y);
      }
      const exists = prev.some((p) => p.x === x && p.y === y);
      console.log("click cell", x, y, color, exists);

      if (exists) {
        cleanData();
        return prev.filter((p) => !(p.x === x && p.y === y));
      }

      return [...prev, { x, y, color }];
    });
  };

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      const ws = wsRef.current;
      if (!ws || !ws.connected) return;

      if (e.pointerType === "touch") {
        const { x, y } = screenToCell(e.clientX, e.clientY);
        activeTouches.current.set(e.pointerId, {
          x: e.clientX,
          y: e.clientY,
        });
        (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);

        // ws.emit("log", {
        //   message: "touch",
        //   type: e.pointerType,
        //   activeTouches: {
        //     size: activeTouches.current.size,
        //     values: JSON.stringify(Array.from(activeTouches.current.values())),
        //     one: activeTouches.current.size === 1,
        //     two: activeTouches.current.size === 2,
        //     zero: activeTouches.current.size === 0,
        //   },
        //   pos: { x, y },
        //   timestamp: new Date().toISOString(),
        // });

        fingers.current = activeTouches.current.size;

        if (activeTouches.current.size === 2) {
          // pinch zoom
          const [p1, p2] = Array.from(activeTouches.current.values());
          pinchRef.current = {
            startDist: dist(p1, p2),
            startScale: scaleRef.current,
            startOffset: { ...offsetRef.current },
            startMid: midpoint(p1, p2),
          };
          return;
        }

        if (activeTouches.current.size === 1) {
          touchStartRef.current = { x: e.clientX, y: e.clientY };
          return;
        }

        return;
      }

      if (e.button === 0 && !e.ctrlKey) {
        isPanningRef.current = true;
        lastPanRef.current = { x: e.clientX, y: e.clientY };
      } else {
        const { x, y } = screenToCell(e.clientX, e.clientY);
        select(x, y, color);
      }
    },
    [screenToCell, color]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const ws = wsRef.current;
      if (!ws || !ws.connected) return;

      if (e.pointerType === "touch") {
        const { x, y } = screenToCell(e.clientX, e.clientY);

        // First remove the touch from activeTouches
        activeTouches.current.delete(e.pointerId);

        // Update fingers count after removal
        fingers.current = activeTouches.current.size;

        // ws.emit("log", {
        //   message: "touch mobile up",
        //   type: e.pointerType,
        //   startClick: touchStartRef.current,
        //   fingers: fingers.current,
        //   activeTouches: {
        //     size: activeTouches.current.size,
        //     values: JSON.stringify(Array.from(activeTouches.current.values())),
        //     one: activeTouches.current.size === 1,
        //     two: activeTouches.current.size === 2,
        //     zero: activeTouches.current.size === 0,
        //   },
        //   pos: { x, y },
        //   timestamp: new Date().toISOString(),
        // });

        // If this was the last finger, check if it was a tap (not a pan/pinch)
        if (activeTouches.current.size === 0 && touchStartRef.current) {
          const dragDistance = Math.hypot(
            e.clientX - touchStartRef.current.x,
            e.clientY - touchStartRef.current.y
          );

          // If it was a short tap (less than 10px movement), treat as selection
          if (dragDistance < 10) {
            select(x, y, color);
          }

          touchStartRef.current = null;
        }

        // Clear pinch when no more touches
        if (activeTouches.current.size < 2) {
          pinchRef.current = null;
        }
      } else if (e.button === 0) {
        isPanningRef.current = false;
        lastPanRef.current = null;
      }
    },
    [screenToCell, color, cleanData, fetchPixelData]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.pointerType === "touch") {
        const touches = activeTouches.current;
        const prev = touches.get(e.pointerId);
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY });

        // Pinch with two fingers
        if (touches.size >= 2 && pinchRef.current) {
          const [a, b] = Array.from(touches.values());
          const curDist = dist(a, b);
          const curMid = midpoint(a, b);

          const minS = getMinScale();
          const target = clamp(
            pinchRef.current.startScale *
              (curDist / pinchRef.current.startDist),
            minS,
            MAX_SCALE
          );

          // Keep the world point under the pinch midpoint
          const worldX =
            (pinchRef.current.startMid.x - pinchRef.current.startOffset.x) /
            pinchRef.current.startScale;
          const worldY =
            (pinchRef.current.startMid.y - pinchRef.current.startOffset.y) /
            pinchRef.current.startScale;

          setScaleImmediate(target);

          if (target <= minS + 1e-6) {
            // enforceMinScaleAndCenter(target);
          } else {
            const nx = curMid.x - worldX * target;
            const ny = curMid.y - worldY * target;
            setOffsetImmediate(clampOffsetForScale({ x: nx, y: ny }, target));
          }

          paintDirty();
          return;
        }

        // One-finger pan
        if (touches.size === 1 && prev) {
          const dx = e.clientX - prev.x;
          const dy = e.clientY - prev.y;
          const next = {
            x: offsetRef.current.x + dx,
            y: offsetRef.current.y + dy,
          };
          setOffsetImmediate(clampOffsetForScale(next, scaleRef.current));
          paintDirty();
        }
        return;
      }

      // Mouse/pen
      // const { x, y } = screenToCell(e.clientX, e.clientY);
      // drawOverlay(x, y);

      if (isPanningRef.current && lastPanRef.current) {
        const dx = e.clientX - lastPanRef.current.x;
        const dy = e.clientY - lastPanRef.current.y;
        const next = {
          x: offsetRef.current.x + dx,
          y: offsetRef.current.y + dy,
        };
        setOffsetImmediate(clampOffsetForScale(next, scaleRef.current));
        paintDirty();
        lastPanRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [
      clampOffsetForScale,
      drawOverlay,
      enforceMinScaleAndCenter,
      getMinScale,
      paintDirty,
      screenToCell,
      setOffsetImmediate,
      setScaleImmediate,
    ]
  );

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      const isPinch = e.ctrlKey;
      const modeFactor = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 160 : 1;
      const deltaY = e.deltaY * modeFactor;

      const prev = scaleRef.current;
      const zoomAmount = Math.exp(-(isPinch ? 3 : 1) * ZOOM_SPEED * deltaY);

      const next = clamp(prev * zoomAmount, MIN_SCALE, MAX_SCALE);
      console.log(zoomAmount, next);

      if (next === prev) return;

      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      const worldX = (cx - offsetRef.current.x) / prev;
      const worldY = (cy - offsetRef.current.y) / prev;

      setScaleImmediate(next);

      if (next <= MIN_SCALE + 1e-6) {
        const minS = getMinScale();
        const sc = Math.max(next ?? scaleRef.current, minS);
        setScaleImmediate(sc);

        // Al llegar al mínimo, mantener el punto del mundo bajo el cursor
        // en la misma posición: recalcular el offset desde worldX/worldY y
        // luego clamp para que el mundo quede dentro de la vista.
        const nx = cx - worldX * sc;
        const ny = cy - worldY * sc;
        setOffsetImmediate(clampOffsetForScale({ x: nx, y: ny }, sc));
      } else {
        const nx = cx - worldX * next;
        const ny = cy - worldY * next;
        setOffsetImmediate(clampOffsetForScale({ x: nx, y: ny }, next));
      }

      paintDirty();
      // drawOverlay(Math.floor(worldX), Math.floor(worldY));
    },
    [
      clampOffsetForScale,
      drawOverlay,
      enforceMinScaleAndCenter,
      paintDirty,
      setOffsetImmediate,
      setScaleImmediate,
    ]
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.pointerType === "touch") {
        activeTouches.current.delete(e.pointerId);
        pinchRef.current = null;
      }
    },
    []
  );

  const onPointerLeave = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      lastPanRef.current = null;
      setOffsetImmediate(
        clampOffsetForScale(offsetRef.current, scaleRef.current)
      );
      paintDirty();
    }
  }, [clampOffsetForScale, paintDirty, setOffsetImmediate]);

  /* =========================
   * Derived values / memo
   * ========================= */
  const a11yLabel = useMemo(
    () => `Editable pixel board ${width} by ${height}`,
    [width, height]
  );

  /* =========================
   * Render
   * ========================= */
  return (
    <div
      className="relative w-full h-full overflow-hidden touch-none select-none"
      role="application"
      aria-label={a11yLabel}
    >
      {/* Base canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerLeave}
        onWheel={onWheel}
        // Helpful for screen readers to skip
        aria-hidden="true"
      />
      {/* Overlay canvas */}
      <canvas
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Toolbar */}
      {/* Paint button */}

      <Colors
        setColor={setColor}
        color={color}
        selectedCells={selectedCells}
        handlePaint={handlePaint}
      >
        <div className="flex gap-2 items-center min-w-20">
          {userData && (
            <>
              <Image
                src={userData.picture}
                className="rounded-full"
                width={30}
                height={30}
                alt="user pixel avatar"
              />
              <p>{userData.name}</p>
            </>
          )}
        </div>
      </Colors>

      {/* Simple UI example for color switching (optional) */}
    </div>
  );
};

export default memo(BoardCanvas);
