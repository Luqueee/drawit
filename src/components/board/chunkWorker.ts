// chunkWorker.ts
// Web Worker: descarga y decodifica snapshots de tiles SOLO en batch.
// Protocolo:
//  - INIT : { type: 'INIT', apiUrl: string, token?: string, path?: string }
//  - FETCH: { type: 'FETCH', ids: string[] }           // ids: "cx,cy" o "64:cx,cy"
//  - CLEAR: { type: 'CLEAR' }

type InitMsg = { type: 'INIT'; apiUrl: string; token?: string; path?: string };
type FetchMsg = { type: 'FETCH'; ids: string[] };
type ClearMsg = { type: 'CLEAR' };
type InMsg = InitMsg | FetchMsg | ClearMsg;

type OutOk = { type: 'SNAPSHOT'; id: string; version: number; payload: Uint8Array };
type OutErr = { type: 'ERROR'; error: string };

let API_URL = '';
let AUTH: Record<string, string> | undefined;
// endpoint batch (por defecto "/tiles/tiles.bin")
let BATCH_PATH = '/tiles/tiles.bin';

// -------------- Config batch --------------
const DECODER = new TextDecoder();
// cuántos tiles mete en una request
const BATCH_SIZE = 64;
// cuántas requests batch en paralelo
const PARALLEL_BATCHES = 3;

// -------------- Cola y control --------------
const queue: string[] = [];                 // ids pendientes
const inflightBatches = new Set<number>();  // ids de lote en vuelo
let batchSeq = 0;                           // id incremental para cada lote enviado

// -------------- helpers binarios --------------
const u16le = (buf: Uint8Array, off: number) => buf[off] | (buf[off + 1] << 8);
const u32le = (buf: Uint8Array, off: number) =>
    (buf[off]) | (buf[off + 1] << 8) | (buf[off + 2] << 16) | (buf[off + 3] << 24);

/**
 * Descarga un batch de tiles y emite SNAPSOT por cada tile.
 * ids: "cx,cy" o "size:cx,cy"
 */
async function fetchBatch(ids: string[]): Promise<void> {
    try {
        console.log('[worker] fetchBatch', ids.length, 'tiles');
        if (!ids.length) return;

        const qs = encodeURIComponent(ids.join(';'));
        const headers: Record<string, string> = AUTH ? { ...AUTH } : {};
        const url = `${API_URL.replace(/\/+$/, '')}${BATCH_PATH}?ids=${qs}`;

        const res = await fetch(url, { headers, cache: 'no-store' });
        if (!res.ok) throw new Error(`http_${res.status}`);

        const buf = new Uint8Array(await res.arrayBuffer());
        let off = 0;

        // Formato por tile:
        // [idLen: U8] [id ascii] [w: U16LE] [h: U16LE] [version: U32LE] [payload: w*h bytes]
        while (off < buf.length) {
            if (off + 1 > buf.length) break;

            const idLen = buf[off]; off += 1;
            if (idLen === 0) continue;
            if (off + idLen + 8 > buf.length) break;

            const id = DECODER.decode(buf.subarray(off, off + idLen)); off += idLen;

            const w = u16le(buf, off); off += 2;
            const h = u16le(buf, off); off += 2;
            const version = u32le(buf, off); off += 4;

            const size = w * h;
            if (size <= 0) continue;
            if (off + size > buf.length) break;

            const payloadView = buf.subarray(off, off + size);
            off += size;

            const ab = new ArrayBuffer(size);
            new Uint8Array(ab).set(payloadView);

            (postMessage as any)(
                { type: 'SNAPSHOT', id, version, payload: new Uint8Array(ab) } as OutOk,
                [ab]
            );
        }

    } catch (e: any) {
        console.log('[worker] fetchBatch error:', e?.message || e);
    }
}

/**
 * Saca lotes de la cola y los dispara en paralelo (solo batch).
 */
function pump() {
    while (inflightBatches.size < PARALLEL_BATCHES && queue.length) {
        // coalesce: toma hasta BATCH_SIZE ids únicos
        const take: string[] = [];
        const seen = new Set<string>();
        while (take.length < BATCH_SIZE && queue.length) {
            const id = queue.shift()!;
            if (seen.has(id)) continue;
            seen.add(id);
            take.push(id);
        }
        if (!take.length) break;

        const ticket = ++batchSeq;
        inflightBatches.add(ticket);

        fetchBatch(take)
            .catch((e) => {
                // si falla, NO hacemos fallback a singles (requisito)
                // opcional: requeue con límite de reintentos si quieres
                console.error('[worker] batch error:', e?.message || e);
            })
            .finally(() => {
                inflightBatches.delete(ticket);
                // encadenamos siguiente
                if (queue.length) setTimeout(pump, 0);
            });
    }
}

// -------------- Mensajería --------------
self.onmessage = (ev: MessageEvent<InMsg>) => {
    const msg = ev.data;

    if (msg.type === 'INIT') {
        API_URL = msg.apiUrl.replace(/\/+$/, '');
        AUTH = msg.token ? { Authorization: `Bearer ${msg.token}` } : undefined;
        if (msg.path) BATCH_PATH = msg.path.startsWith('/') ? msg.path : `/${msg.path}`;
        return;
    }

    if (msg.type === 'CLEAR') {
        queue.length = 0;
        inflightBatches.clear();
        batchSeq = 0;
        return;
    }

    if (msg.type === 'FETCH') {
        // mete ids (sin duplicar dentro de la cola)
        for (const id of msg.ids) {
            if (!queue.includes(id)) queue.push(id);
        }
        // dispara
        pump();
        return;
    }
};

// (Opcional) expone una API directa si te viene bien en debug
(self as any).pump = pump;
(self as any).setBatchPath = (p: string) => { BATCH_PATH = p.startsWith('/') ? p : `/${p}`; };
