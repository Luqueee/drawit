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
import { palette } from "@/shared/colors";
import { createPixelsAction } from "@/actions/canvas";
import Image from "next/image";
import { envs } from "@/env";
import { Colors } from "./Colors";
import { Color } from "@/@types/color";
import { Button } from "../ui/button";
import { IconColorPicker, IconTrashFilled } from "@tabler/icons-react";

type Point = { x: number; y: number };
type Offset = Point;
type Rect = { x: number; y: number; w: number; h: number };
type ChunkId = string;
type TouchPt = { x: number; y: number };

export type BoardCanvasProps = {
  width: number;
  height: number;
  initialScale?: number;
};

const MAX_SCALE = 100;
const MIN_SCALE = 1.5;
const ZOOM_SPEED = 0.0018;

// ---- Tiling / LOD ----
const BASE_CHUNK = 64;
const PREFETCH_RING = 1;
const MAX_VISIBLE_CHUNKS = 100; // cap para zoom-out (reduce peticiones)
function chunkSizeForScale(scale: number) {
  if (scale < 0.4) return BASE_CHUNK * 4; // 256
  if (scale < 0.75) return BASE_CHUNK * 2; // 128
  return BASE_CHUNK; // 64
}

const cid = (cx: number, cy: number, size: number) => `${size}:${cx},${cy}`;
const parseCid = (id: string) => {
  const [sz, rest] = id.split(":");
  const [a, b] = rest.split(",");
  return { size: Number(sz), cx: Number(a), cy: Number(b) };
};

type Chunk = {
  id: ChunkId;
  size: number; // CHUNK_SIZE efectivo por LOD
  cx: number;
  cy: number;
  w: number;
  h: number;
  canvas: OffscreenCanvas | HTMLCanvasElement;
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  imgData: ImageData;
  buffer: Uint8Array;
  dirty: boolean;
  dirtyRects: Rect[];
  version: number;
};

const BoardCanvas: React.FC<BoardCanvasProps> = ({
  width,
  height,
  initialScale = 0.5,
}) => {
  const { data: session } = useSession();
  const { fetchPixelData, cleanData, userData } = usePixelData();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedCells, setSelectedCells] = useState<Color[]>([]);
  const [colorPicker, setColorPicker] = useState(false);
  const [color, setColor] = useState<number>(1);

  const [scale, _setScale] = useState<number>(initialScale);
  const [offset, _setOffset] = useState<Offset>({ x: 0, y: 0 });
  const scaleRef = useRef(initialScale);
  const offsetRef = useRef<Offset>({ x: 0, y: 0 });
  const skipNextMoveRef = useRef(false); // ignora el primer move tras soltar un dedo del pinch

  const committedKeysRef = useRef<Set<string>>(new Set()); // todo lo ya enviado/confirmado

  const setScaleImmediate = useCallback((s: number) => {
    scaleRef.current = s;
    _setScale(s);
  }, []);
  const setOffsetImmediate = useCallback((o: Offset) => {
    offsetRef.current = o;
    _setOffset(o);
  }, []);

  const isPanningRef = useRef(false);
  const lastPanRef = useRef<Point | null>(null);

  const activeTouches = useRef<Map<number, TouchPt>>(new Map());
  const pinchRef = useRef<null | {
    // mundo bajo el punto medio al INICIAR el pinch
    worldX: number;
    worldY: number;
    // pantalla (px) del punto medio cuando empezó
    startMidX: number;
    startMidY: number;
    // distancia inicial entre dedos
    startDist: number;
    // escala/offset iniciales (solo para referencia)
    startScale: number;
    startOffset: Offset;
  }>(null);
  // Tap detection (toque corto = toggle)
  const tapStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const tapMovedRef = useRef(false);

  const TAP_MAX_MS = 250;
  const TAP_MAX_MOVE = 8; // px de pantalla para distinguir tap de pan
  const panningActiveRef = useRef(false); // sólo true cuando superas el umbral

  const wsRef = useRef<Socket | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const chunksRef = useRef<Map<ChunkId, Chunk>>(new Map());
  const subscribedRef = useRef<Set<ChunkId>>(new Set());
  const rafRenderRef = useRef<number | null>(null);

  // ---- refs auxiliares ----
  const inflightRef = useRef<Set<ChunkId>>(new Set());
  const fetchFallbackTimersRef = useRef<Map<ChunkId, number>>(new Map());

  // Tengo datos ya cargados (snapshot aplicado) para ese id?
  function hasData(id: ChunkId) {
    const ch = chunksRef.current.get(id);
    // ajusta la condición a tu modelo: version>0 suele bastar
    return !!(ch && ch.version > 0);
  }

  // Programa un fetch de respaldo (si el servidor no manda snapshot por WS a tiempo)
  function scheduleFetchFallback(ids: ChunkId[], delayMs = 250) {
    if (!workerRef.current || !ids.length) return;

    for (const id of ids) {
      // evita duplicados de timer
      if (fetchFallbackTimersRef.current.has(id)) continue;

      const t = window.setTimeout(() => {
        fetchFallbackTimersRef.current.delete(id);

        // si mientras esperábamos llegó el snapshot o ya hay fetch en vuelo, no pedir
        if (hasData(id) || inflightRef.current.has(id)) return;

        inflightRef.current.add(id);
        const knownVersion = chunksRef.current.get(id)?.version ?? 0;

        workerRef.current?.postMessage({
          type: "FETCH",
          ids: [id],
          preferBatch: false,
          knownVersions: [{ id, version: knownVersion }],
        });
      }, delayMs);

      fetchFallbackTimersRef.current.set(id, t);
    }
  }

  // Cancela timers pendientes de fallback para una lista de ids
  function cancelFetchFallback(ids: ChunkId[]) {
    for (const id of ids) {
      const t = fetchFallbackTimersRef.current.get(id);
      if (t) {
        clearTimeout(t);
        fetchFallbackTimersRef.current.delete(id);
      }
    }
  }

  // ------- Medidas / viewport
  const getViewSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { vw: 0, vh: 0 };
    const r = canvas.getBoundingClientRect();
    return { vw: r.width, vh: r.height };
  }, []);

  // ------- Chunks factory (perezosa por id)
  const ensureChunk = useCallback(
    (id: ChunkId) => {
      if (chunksRef.current.has(id)) return chunksRef.current.get(id)!;
      const { size, cx, cy } = parseCid(id);
      const px = cx * size;
      const py = cy * size;
      const cw = Math.min(size, width - px);
      const ch = Math.min(size, height - py);

      const canvas =
        typeof OffscreenCanvas !== "undefined"
          ? new OffscreenCanvas(cw, ch)
          : (() => {
              const c = document.createElement("canvas");
              c.width = cw;
              c.height = ch;
              return c;
            })();

      const ctx = canvas.getContext("2d", { alpha: false })!;
      (ctx as any).imageSmoothingEnabled = false;

      //@ts-expect-error aaaaaaaaa
      const imgData = ctx.createImageData(cw, ch);
      const buffer = new Uint8Array(cw * ch);

      const chunk: Chunk = {
        id,
        size,
        cx,
        cy,
        w: cw,
        h: ch,
        canvas,
        //@ts-expect-error aaaaaaaa
        ctx,
        imgData,
        buffer,
        dirty: true,
        dirtyRects: [{ x: 0, y: 0, w: cw, h: ch }],
        version: 0,
      };
      chunksRef.current.set(id, chunk);
      return chunk;
    },
    [width, height]
  );

  // ------- Raster: flush sucios
  const flushDirty = useCallback(() => {
    for (const ch of chunksRef.current.values()) {
      if (!ch.dirty) continue;
      const data = ch.imgData.data;
      const buf = ch.buffer;
      while (ch.dirtyRects.length) {
        const { x, y, w, h } = ch.dirtyRects.pop()!;
        for (let yy = y; yy < y + h; yy++) {
          const rb = yy * ch.w;
          const db = rb * 4;
          for (let xx = x; xx < x + w; xx++) {
            const bi = rb + xx;
            const di = db + xx * 4;
            const palIndex = buf[bi];
            const rgb = palette.get(palIndex) || [0, 0, 0];
            data[di] = rgb[0];
            data[di + 1] = rgb[1];
            data[di + 2] = rgb[2];
            data[di + 3] = 255;
          }
        }
      }
      ch.ctx.putImageData(ch.imgData, 0, 0);
      ch.dirty = false;
    }
  }, []);

  // ------- Render visibles
  const renderVisible = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    flushDirty();

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(offsetRef.current.x, offsetRef.current.y);
    ctx.scale(scaleRef.current, scaleRef.current);
    (ctx as CanvasRenderingContext2D).imageSmoothingEnabled = false;

    const { vw, vh } = getViewSize();
    const invS = 1 / scaleRef.current;

    const left = Math.floor(-offsetRef.current.x * invS);
    const top = Math.floor(-offsetRef.current.y * invS);
    const right = Math.ceil((vw - offsetRef.current.x) * invS);
    const bottom = Math.ceil((vh - offsetRef.current.y) * invS);

    const S = chunkSizeForScale(scaleRef.current);
    const cLeft = Math.max(0, Math.floor(left / S) - PREFETCH_RING);
    const cTop = Math.max(0, Math.floor(top / S) - PREFETCH_RING);
    const cRight = Math.min(
      Math.ceil(width / S),
      Math.ceil(right / S) + PREFETCH_RING
    );
    const cBottom = Math.min(
      Math.ceil(height / S),
      Math.ceil(bottom / S) + PREFETCH_RING
    );

    for (let cy = cTop; cy < cBottom; cy++) {
      for (let cx = cLeft; cx < cRight; cx++) {
        const id = cid(cx, cy, S);
        const ch = ensureChunk(id);
        ctx.drawImage(ch.canvas as any, cx * S, cy * S);
      }
    }
  }, [flushDirty, ensureChunk, getViewSize, width, height]);

  const renderSoon = useCallback(() => {
    if (rafRenderRef.current != null) return;
    rafRenderRef.current = requestAnimationFrame(() => {
      rafRenderRef.current = null;
      renderVisible();
    });
  }, [renderVisible]);

  // ------- WS subscribe coalesced
  const subAddPending = useRef<Set<ChunkId>>(new Set());
  const subRemovePending = useRef<Set<ChunkId>>(new Set());
  const subScheduled = useRef<number | null>(null);

  const scheduleSubscribeFlush = useCallback(() => {
    if (subScheduled.current != null) return;
    subScheduled.current = requestAnimationFrame(() => {
      subScheduled.current = null;
      const ws = wsRef.current;
      if (!ws || !ws.connected) return;

      const add = Array.from(subAddPending.current);
      const remove = Array.from(subRemovePending.current);
      if (!add.length && !remove.length) return;

      ws.emit("chunks:subscribe", { add, remove });

      // Commit
      for (const id of add) subscribedRef.current.add(id);
      for (const id of remove) subscribedRef.current.delete(id);
      subAddPending.current.clear();
      subRemovePending.current.clear();
    });
  }, []);

  // ------- Cálculo visibles + cap + prioridad centro
  const computeVisibleIds = useCallback((): ChunkId[] => {
    const { vw, vh } = getViewSize();
    if (!vw || !vh) return [];
    const S = chunkSizeForScale(scaleRef.current);

    const inv = 1 / scaleRef.current;
    const left = Math.floor(-offsetRef.current.x * inv);
    const top = Math.floor(-offsetRef.current.y * inv);
    const right = Math.ceil((vw - offsetRef.current.x) * inv);
    const bottom = Math.ceil((vh - offsetRef.current.y) * inv);

    const cLeft = Math.max(0, Math.floor(left / S) - PREFETCH_RING);
    const cTop = Math.max(0, Math.floor(top / S) - PREFETCH_RING);
    const cRight = Math.min(
      Math.ceil(width / S),
      Math.ceil(right / S) + PREFETCH_RING
    );
    const cBottom = Math.min(
      Math.ceil(height / S),
      Math.ceil(bottom / S) + PREFETCH_RING
    );

    const midX = (left + right) / 2;
    const midY = (top + bottom) / 2;
    const list: { id: ChunkId; dist: number }[] = [];

    for (let cy = cTop; cy < cBottom; cy++) {
      for (let cx = cLeft; cx < cRight; cx++) {
        const id = cid(cx, cy, S);
        const centerX = cx * S + S / 2;
        const centerY = cy * S + S / 2;
        const dx = centerX - midX,
          dy = centerY - midY;
        list.push({ id, dist: dx * dx + dy * dy });
      }
    }
    list.sort((a, b) => a.dist - b.dist);
    // Cap para no pedir miles de tiles al hacer zoom-out
    return list.slice(0, MAX_VISIBLE_CHUNKS).map((x) => x.id);
  }, [getViewSize, width, height]);

  // --- syncViewport: suscribe por WS y SOLO hace fetch si no llega snapshot a tiempo ---
  const syncViewport = useCallback(() => {
    try {
      const ids = computeVisibleIds();
      const current = subscribedRef.current;

      const add: ChunkId[] = [];
      const remove: ChunkId[] = [];

      // calcular altas/bajas
      for (const id of ids) if (!current.has(id)) add.push(id);
      for (const id of current) if (!ids.includes(id)) remove.push(id);

      // WS: coalesce de suscripciones
      for (const id of add) subAddPending.current.add(id);
      for (const id of remove) subRemovePending.current.add(id);
      scheduleSubscribeFlush();

      // Fallback fetch: sólo si no tenemos datos ni hay una petición en vuelo
      if (add.length) {
        const needFallback = add.filter(
          (id) => !hasData(id) && !inflightRef.current.has(id)
        );
        if (needFallback.length) scheduleFetchFallback(needFallback);
      }

      // Si se des-suscribe, cancela timers de fallback de esos ids
      if (remove.length) {
        cancelFetchFallback(remove);
      }
    } catch (e) {
      console.log("syncViewport error", e);
    }
  }, [computeVisibleIds, scheduleSubscribeFlush]);

  // ------- Socket IO
  useEffect(() => {
    const ws = io(`${envs.API_URL}/rplace`, {
      auth: { token: `Bearer ${session?.accessToken}` },
    });
    wsRef.current = ws;

    ws.on("connect", () => {
      syncViewport();
    });

    ws.on(
      "chunk:snapshot",
      (msg: {
        id: string;
        w: number;
        h: number;
        version: number;
        data: Uint8Array;
      }) => {
        const ch = ensureChunk(msg.id);
        if (ch.w !== msg.w || ch.h !== msg.h) return;
        if (msg.version < ch.version) return;
        ch.buffer.set(msg.data);
        ch.version = msg.version;
        ch.dirtyRects.length = 0;
        ch.dirtyRects.push({ x: 0, y: 0, w: ch.w, h: ch.h });
        ch.dirty = true;
        renderVisible();
        inflightRef.current.delete(msg.id);
        cancelFetchFallback([msg.id]);
      }
    );

    ws.on(
      "chunk:update",
      (msg: {
        id: string;
        version: number;
        pixels: Array<[number, number, number]>;
      }) => {
        const ch = chunksRef.current.get(msg.id);
        if (!ch) return;
        if (msg.version < ch.version) return;
        ch.version = msg.version;
        for (const [lx, ly, pal] of msg.pixels) {
          if (lx < 0 || ly < 0 || lx >= ch.w || ly >= ch.h) continue;
          ch.buffer[ly * ch.w + lx] = pal;
          ch.dirtyRects.push({ x: lx, y: ly, w: 1, h: 1 });
          ch.dirty = true;
        }
        renderVisible();
      }
    );

    return () => {
      ws.close();
    };
  }, [ensureChunk, renderVisible, syncViewport, session?.accessToken]);

  // ------- Worker
  useEffect(() => {
    const worker = new Worker(new URL("./chunkWorker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    worker.postMessage({
      type: "INIT",
      apiUrl: envs.API_URL,
      token: session?.accessToken,
    });

    worker.onmessage = (ev: MessageEvent) => {
      const data = ev.data;
      if (data?.type === "SNAPSHOT") {
        inflightRef.current.delete(data.id); // <-- importante
        cancelFetchFallback([data.id]);
        const ch = ensureChunk(data.id);
        if (data.payload.length !== ch.w * ch.h) return;
        if (data.version < ch.version) return;
        ch.buffer.set(data.payload);
        ch.version = data.version;
        ch.dirtyRects.length = 0;
        ch.dirtyRects.push({ x: 0, y: 0, w: ch.w, h: ch.h });
        ch.dirty = true;
        renderVisible();
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [ensureChunk, renderVisible, session?.accessToken]);

  // ------- Resize / DPR
  useEffect(() => {
    const canvas = canvasRef.current!;
    const overlay = overlayRef.current!;
    if (!canvas || !overlay) return;

    const apply = () => {
      const parent = canvas.parentElement!;
      const w = parent.clientWidth,
        h = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      overlay.width = canvas.width;
      overlay.height = canvas.height;
      overlay.style.width = canvas.style.width;
      overlay.style.height = canvas.style.height;

      // Re-render/sync
      renderVisible();
      syncViewport();
    };

    const ro = new ResizeObserver(apply);
    ro.observe(canvas.parentElement as Element);
    window.addEventListener("resize", apply, { passive: true });
    apply();

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [renderVisible, syncViewport]);

  // ------- First run: centrar y pintar
  useEffect(() => {
    const sc = Math.max(scaleRef.current, 1);
    setScaleImmediate(sc);
    const { vw, vh } = getViewSize();
    const worldW = width * sc,
      worldH = height * sc;
    setOffsetImmediate({ x: (vw - worldW) / 2, y: (vh - worldH) / 2 });
    renderVisible();
    syncViewport();
  }, [
    getViewSize,
    setOffsetImmediate,
    setScaleImmediate,
    width,
    height,
    renderVisible,
    syncViewport,
  ]);

  // ------- Interacción (igual que tienes; omitido detalle por brevedad — mantiene schedule de sync)
  const clamp = (v: number, a: number, b: number) =>
    Math.max(a, Math.min(b, v));
  const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
  const midpoint = (a: Point, b: Point) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });
  const worldToChunk = (x: number, y: number, size: number) => ({
    cx: Math.floor(x / size),
    cy: Math.floor(y / size),
  });

  const screenToCell = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const cx = clientX - rect.left,
      cy = clientY - rect.top;
    const s = scaleRef.current,
      off = offsetRef.current;
    return { x: Math.floor((cx - off.x) / s), y: Math.floor((cy - off.y) / s) };
  }, []);

  const scheduleViewportSync = useCallback(() => {
    // simple alias para claridad en handlers
    syncViewport();
  }, [syncViewport]);

  // ... (handlers de pointer/wheel exactamente como ya tienes, llamando a renderVisible() y scheduleViewportSync())
  // Para mantener la respuesta corta, no repito todo; tu bloque de handlers actual encaja 1:1.

  // ------- Overlay de selección (igual que tu implementación actual)
  const drawOverlay = useCallback(
    (cellX: number, cellY: number, colorOverlay: number) => {
      const overlay = overlayRef.current;
      const ctx = overlay?.getContext("2d");
      if (!overlay || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.translate(offsetRef.current.x, offsetRef.current.y);
      ctx.scale(scaleRef.current, scaleRef.current);
      (ctx as CanvasRenderingContext2D).imageSmoothingEnabled = false;

      const fillRgb = palette.get(colorOverlay) || [0, 0, 0];
      ctx.fillStyle = `rgba(${fillRgb.join(",")},1)`;
      ctx.fillRect(cellX, cellY, 1, 1);

      const strokeRgb = palette.get(color === 0 ? 2 : 1) || [0, 0, 0];
      ctx.strokeStyle = `rgba(${strokeRgb.join(",")},1)`;
      ctx.lineWidth = 2 / scaleRef.current;
      ctx.strokeRect(cellX, cellY, 1, 1);
    },
    [color]
  );

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (selectedCells.length)
      selectedCells.forEach((c) => drawOverlay(c.x, c.y, c.color));
  }, [selectedCells, scale, offset, drawOverlay]);

  // ------- Pintado local (igual que antes, sólo cambiamos lookup por LOD actual)
  const placePixelLocal = useCallback(
    (x: number, y: number, palIndex: number) => {
      const S = chunkSizeForScale(scaleRef.current);
      const cx = Math.floor(x / S),
        cy = Math.floor(y / S);
      const id = cid(cx, cy, S);
      const ch = ensureChunk(id);
      const lx = x - cx * S,
        ly = y - cy * S;
      if (lx < 0 || ly < 0 || lx >= ch.w || ly >= ch.h) return;
      ch.buffer[ly * ch.w + lx] = palIndex;
      ch.dirtyRects.push({ x: lx, y: ly, w: 1, h: 1 });
      ch.dirty = true;
    },
    [ensureChunk]
  );

  const handlePaint = async () => {
    if (!selectedCells.length) return;
    selectedCells.forEach((c) => placePixelLocal(c.x, c.y, c.color));
    renderVisible();
    await createPixelsAction({ pixels: selectedCells });
    const overlay = overlayRef.current;
    if (overlay)
      overlay.getContext("2d")?.clearRect(0, 0, overlay.width, overlay.height);
    setSelectedCells([]);
  };

  const cleanSelectedCells = useCallback(
    (commit = true) => {
      if (!selectedCells.length) return;

      // borra local
      for (const { x, y } of selectedCells) {
        placePixelLocal(x, y, 0);
        committedKeysRef.current.delete(`${x},${y}`);
      }
      renderVisible();

      // limpia overlay/estado
      setSelectedCells([]);
      const overlay = overlayRef.current;
      overlay?.getContext("2d")?.clearRect(0, 0, overlay.width, overlay.height);

      // opcional: persiste el borrado
      if (commit) {
        createPixelsAction({
          pixels: selectedCells.map(({ x, y }) => ({ x, y, color: 0 })),
        }).catch(console.error);
      }
    },
    [selectedCells, placePixelLocal, renderVisible]
  );

  // ---- helpers pan/zoom

  // ---- pointer state
  const spaceDownRef = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceDownRef.current = e.type === "keydown";
      }
      if (e.key === "i" || e.key === "I") {
        // I de "eyedropper"
        setColorPicker((v) => !v);
      }
      if (e.key === "Escape") {
        setColorPicker(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  // --- límites del mundo (en px de mundo, no de pantalla)
  const clampOffset = (ox: number, oy: number, s: number) => {
    const { vw, vh } = getViewSize();
    // bordes (deja "padding" de viewport, para que no desaparezca el tablero)
    const minX = Math.min(0, vw - width * s);
    const minY = Math.min(0, vh - height * s);
    const maxX = Math.max(0, vw - (vw - width * s)); // == 0 si tablero > viewport
    const maxY = Math.max(0, vh - (vh - height * s)); // == 0 si tablero > viewport
    return {
      x: clamp(ox, minX, maxX),
      y: clamp(oy, minY, maxY),
    };
  };

  const setView = useCallback(
    (nextScale: number, nextOffset: Offset) => {
      const clampedOffset = clampOffset(nextOffset.x, nextOffset.y, nextScale);
      setScaleImmediate(nextScale);
      setOffsetImmediate(clampedOffset);
      renderVisible();
      scheduleViewportSync();
    },
    [renderVisible, scheduleViewportSync, setScaleImmediate, setOffsetImmediate]
  );

  const zoomAt = useCallback(
    (clientX: number, clientY: number, deltaY: number) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;

      const oldS = scaleRef.current;
      // normaliza el delta y aplica límites
      const dz = typeof deltaY === "number" ? deltaY : 0;
      const newS = clamp(oldS * (1 - dz * ZOOM_SPEED), MIN_SCALE, MAX_SCALE);
      if (newS === oldS) return;

      // Mantener el punto bajo el cursor
      const ox = offsetRef.current.x;
      const oy = offsetRef.current.y;
      const wx = (mx - ox) / oldS;
      const wy = (my - oy) / oldS;
      const newOx = mx - wx * newS;
      const newOy = my - wy * newS;

      setView(newS, { x: newOx, y: newOy });
    },
    [setView]
  );

  const toggleCellAtPointer = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const { x, y } = screenToCell(e.clientX, e.clientY);
      if (x < 0 || y < 0 || x >= width || y >= height) return;

      const key = `${x},${y}`;
      const already = committedKeysRef.current.has(key);

      if (already) {
        // --- borrar ---
        committedKeysRef.current.delete(key);
        placePixelLocal(x, y, 0); // 0 = transparente/negro según tu paleta
        renderVisible();

        // quita del estado
        setSelectedCells((prev) =>
          prev.filter((c) => !(c.x === x && c.y === y))
        );
      } else {
        // --- pintar ---
        committedKeysRef.current.add(key);
        placePixelLocal(x, y, color);
        renderVisible();

        const newCell: Color = { x, y, color };
        setSelectedCells((prev) => [...prev, newCell]);
      }
    },
    [screenToCell, width, height, color, placePixelLocal, renderVisible]
  );

  // Lee el índice de paleta en una celda del mundo
  const getPalIndexAt = useCallback(
    (x: number, y: number): number | null => {
      if (x < 0 || y < 0 || x >= width || y >= height) return null;
      const S = chunkSizeForScale(scaleRef.current);
      const cx = Math.floor(x / S),
        cy = Math.floor(y / S);
      const id = cid(cx, cy, S);
      // si no existe el chunk aún, lo creamos (quedará lleno de 0 hasta que lleguen snapshots)
      const ch = chunksRef.current.get(id) || ensureChunk(id);
      const lx = x - cx * S,
        ly = y - cy * S;
      if (lx < 0 || ly < 0 || lx >= ch.w || ly >= ch.h) return null;
      return ch.buffer[ly * ch.w + lx] ?? 0;
    },
    [width, height, ensureChunk]
  );

  // Pick al hacer click/tap
  const pickColorAtPointer = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const { x, y } = screenToCell(e.clientX, e.clientY);
      const pal = getPalIndexAt(x, y);
      if (pal == null) return;
      setColor(pal);
      setColorPicker(false); // cerramos el modo picker tras elegir
    },
    [screenToCell, getPalIndexAt, setColor, setColorPicker]
  );

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

  const ensurePinchStart = useCallback(() => {
    if (activeTouches.current.size < 2 || pinchRef.current) return false;

    const [a, b] = Array.from(activeTouches.current.values());
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const dist = Math.hypot(a.x - b.x, a.y - b.y);

    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = midX - rect.left;
    const my = midY - rect.top;

    const s = scaleRef.current;
    const ox = offsetRef.current.x,
      oy = offsetRef.current.y;

    // “clavamos” el punto de mundo bajo el centro inicial del pinch
    pinchRef.current = {
      worldX: (mx - ox) / s,
      worldY: (my - oy) / s,
      startMidX: midX,
      startMidY: midY,
      startDist: Math.max(1, dist),
      startScale: s,
      startOffset: { x: ox, y: oy },
    };

    // al entrar en pinch, cancelamos pan/tap
    isPanningRef.current = false;
    panningActiveRef.current = false;
    tapStartRef.current = null;
    tapMovedRef.current = true;
    return true;
  }, []);
  // ------- UI
  const a11yLabel = useMemo(
    () => `Editable pixel board ${width} by ${height}`,
    [width, height]
  );

  useEffect(() => {
    setColorPicker(false);
  }, [color]);

  return (
    <div
      className="relative w-full h-full overflow-hidden touch-none select-none"
      role="application"
      aria-label={a11yLabel}
      style={{ touchAction: "none" }} // <— añade esto al wrapper
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ touchAction: "none" }}
        onContextMenu={(e) => e.preventDefault()}
        // --- ZOOM con rueda (desktop/trackpad)
        onWheel={(e) => {
          const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
          zoomAt(e.clientX, e.clientY, dy);
        }}
        // --- POINTER DOWN
        onPointerDown={(e) => {
          e.preventDefault();
          if (colorPicker) {
            const isTouch = e.pointerType === "touch";

            if (isTouch) {
              // si entran 2 dedos, permite pinch-zoom; no hagas pick
              activeTouches.current.set(e.pointerId, {
                x: e.clientX,
                y: e.clientY,
              });
              e.currentTarget.setPointerCapture(e.pointerId);

              if (activeTouches.current.size >= 2) {
                ensurePinchStart();
                return;
              }

              // 1 dedo = pick inmediato
              pickColorAtPointer(e);
              return;
            }

            // Desktop: cualquier botón = pick
            pickColorAtPointer(e);
            return;
          }

          const isTouch = e.pointerType === "touch";
          if (isTouch) {
            activeTouches.current.set(e.pointerId, {
              x: e.clientX,
              y: e.clientY,
            });
            e.currentTarget.setPointerCapture(e.pointerId);

            if (activeTouches.current.size === 1) {
              // preparar tap y pan (pero pan aún NO activo)
              isPanningRef.current = true;
              panningActiveRef.current = false;
              lastPanRef.current = { x: e.clientX, y: e.clientY };
              tapStartRef.current = {
                x: e.clientX,
                y: e.clientY,
                t: performance.now(),
              };
              tapMovedRef.current = false;

              return;
            }
            if (activeTouches.current.size >= 2) {
              ensurePinchStart(); // tu helper de pinch estable
              return;
            }
          }

          // --- Desktop igual que antes ---
          if (e.button === 0) {
            isPanningRef.current = true;
            lastPanRef.current = { x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);

            return;
          }
          if (e.button === 2) {
            e.currentTarget.setPointerCapture(e.pointerId);
            toggleCellAtPointer(e);

            return;
          }
        }}
        // --- POINTER MOVE
        onPointerMove={(e) => {
          const isTouch = e.pointerType === "touch";

          if (isTouch) {
            if (!activeTouches.current.has(e.pointerId)) return;
            activeTouches.current.set(e.pointerId, {
              x: e.clientX,
              y: e.clientY,
            });

            // --- PINCH (siempre activo con 2 dedos, haya picker o no) ---
            if (activeTouches.current.size === 2) {
              if (!pinchRef.current) {
                if (!ensurePinchStart()) return; // inicia pinch si no estaba
              }

              const [p1, p2] = Array.from(activeTouches.current.values());
              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;
              const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

              const factorRaw = dist / Math.max(1, pinchRef.current!.startDist);
              const factor = Math.min(2, Math.max(0.5, factorRaw));
              const targetScale = clamp(
                pinchRef.current!.startScale * factor,
                MIN_SCALE,
                MAX_SCALE
              );

              const rect = canvasRef.current!.getBoundingClientRect();
              const mx = midX - rect.left;
              const my = midY - rect.top;

              const newOx = mx - pinchRef.current!.worldX * targetScale;
              const newOy = my - pinchRef.current!.worldY * targetScale;

              setScaleImmediate(targetScale);
              setOffsetImmediate({ x: newOx, y: newOy });
              renderSoon();
              scheduleViewportSync();
              return;
            }

            // --- 1 dedo ---
            if (activeTouches.current.size === 1) {
              // Si el picker está activo: no pan (solo permitimos pinch con 2 dedos arriba)
              if (colorPicker) return;

              // Pan con umbral (para no robar taps)
              if (isPanningRef.current) {
                if (!panningActiveRef.current && tapStartRef.current) {
                  const dx0 = e.clientX - tapStartRef.current.x;
                  const dy0 = e.clientY - tapStartRef.current.y;
                  if (Math.hypot(dx0, dy0) > TAP_MAX_MOVE) {
                    panningActiveRef.current = true;
                    tapMovedRef.current = true;
                    lastPanRef.current = { x: e.clientX, y: e.clientY };
                  } else {
                    return; // aún puede ser tap
                  }
                }

                if (panningActiveRef.current && lastPanRef.current) {
                  const dx = e.clientX - lastPanRef.current.x;
                  const dy = e.clientY - lastPanRef.current.y;
                  lastPanRef.current = { x: e.clientX, y: e.clientY };
                  setOffsetImmediate({
                    x: offsetRef.current.x + dx,
                    y: offsetRef.current.y + dy,
                  });
                  renderSoon();
                  scheduleViewportSync();
                }
              }
            }
            return;
          }

          // --- Desktop PAN (igual que tenías) ---
          if (isPanningRef.current && lastPanRef.current) {
            const dx = e.clientX - lastPanRef.current.x;
            const dy = e.clientY - lastPanRef.current.y;
            lastPanRef.current = { x: e.clientX, y: e.clientY };
            setOffsetImmediate({
              x: offsetRef.current.x + dx,
              y: offsetRef.current.y + dy,
            });
            renderVisible();
            scheduleViewportSync();
          }
        }}
        // --- POINTER UP / CANCEL
        onPointerUp={(e) => {
          const isTouch = e.pointerType === "touch";
          e.currentTarget.releasePointerCapture?.(e.pointerId);

          if (colorPicker && e.pointerType === "touch") {
            e.currentTarget.releasePointerCapture?.(e.pointerId);
            activeTouches.current.delete(e.pointerId);
            if (activeTouches.current.size < 2) pinchRef.current = null;
            return;
          }

          if (isTouch) {
            activeTouches.current.delete(e.pointerId);

            // si estabas en pinch y pasas a 1 dedo: ya lo tienes con reanclaje
            if (pinchRef.current && activeTouches.current.size === 1) {
              pinchRef.current = null;
              const [rest] = Array.from(activeTouches.current.values());
              isPanningRef.current = true;
              panningActiveRef.current = false; // el dedo que queda aún no pannea
              lastPanRef.current = rest ? { x: rest.x, y: rest.y } : null;
              skipNextMoveRef.current = true; // evita salto
              tapStartRef.current = null; // no hay tap tras pinch
              tapMovedRef.current = true;
              return;
            }

            // fin total: 0 dedos -> evaluar TAP
            if (activeTouches.current.size === 0) {
              const start = tapStartRef.current;
              const dt = start ? performance.now() - start.t : Infinity;
              if (start && !tapMovedRef.current && dt <= TAP_MAX_MS) {
                // TAP = toggle (pintar/borrar) en móvil
                toggleCellAtPointer(e);
              }
              // reset
              pinchRef.current = null;
              isPanningRef.current = false;
              panningActiveRef.current = false;
              lastPanRef.current = null;
              tapStartRef.current = null;
              tapMovedRef.current = false;
              return;
            }

            return;
          }

          // --- Desktop ---
          if (isPanningRef.current) {
            isPanningRef.current = false;
            lastPanRef.current = null;
          }
        }}
        onPointerCancel={(e) => {
          e.currentTarget.releasePointerCapture?.(e.pointerId);
          activeTouches.current.delete(e.pointerId);
          if (activeTouches.current.size < 2) pinchRef.current = null;

          isPanningRef.current = false;
          lastPanRef.current = null;
          tapStartRef.current = null;
          tapMovedRef.current = false;
        }}
      />

      <canvas
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      <Colors
        setColor={setColor}
        color={color}
        setSelectedCells={setSelectedCells}
        selectedCells={selectedCells}
        handlePaint={handlePaint}
      >
        <Button
          disabled={selectedCells.length === 0}
          className="bg-red-700 text-white hover:bg-red-500"
          onClick={() => cleanSelectedCells()}
        >
          <IconTrashFilled stroke={2} />
        </Button>
        <Button
          onClick={() => setColorPicker(true)}
          style={{
            backgroundColor: colorPicker
              ? "rgb(216,216,216)"
              : "rgb(178,178,178)",
          }}
        >
          <IconColorPicker stroke={2} />
        </Button>

        <div className="bg-black/30 flex items-center px-2 rounded-md">
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
        </div>
      </Colors>
    </div>
  );
};

export default memo(BoardCanvas);
