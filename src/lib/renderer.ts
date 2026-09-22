import { clamp, hexToRgb } from "./color";
import { fillArcField } from "./field-gradient";
import { paletteToStops, sortStops } from "./palette";
import { EXPORT_SCALE, GRAIN_DEFAULTS } from "./panel-config";
import type { GeneratorState } from "./types";

const grainTileCache = new Map<string, HTMLCanvasElement>();

function cssAngleToRadians(angle: number) {
  return ((angle - 90) * Math.PI) / 180;
}

function fillCanvasGradient(
  ctx: CanvasRenderingContext2D,
  state: GeneratorState,
  width: number,
  height: number
) {
  const stops = sortStops(
    paletteToStops(state.palette, state.gradientType, state.motion.playing ? state.motion.phase : undefined)
  );
  const cx = 0.5 * width;
  const cy = 0.5 * height;
  let gradient: CanvasGradient;

  if (state.gradientType === "radial") {
    gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(width, height) / 1.15);
  } else {
    const theta = cssAngleToRadians(state.angle);
    const length = Math.hypot(width, height) / 2;
    gradient = ctx.createLinearGradient(
      cx - Math.cos(theta) * length,
      cy - Math.sin(theta) * length,
      cx + Math.cos(theta) * length,
      cy + Math.sin(theta) * length
    );
  }

  for (const stop of stops) {
    const rgb = hexToRgb(stop.color);
    if (!rgb) continue;
    gradient.addColorStop(
      clamp(stop.position / 100, 0, 1),
      `rgb(${Math.round(rgb.r)} ${Math.round(rgb.g)} ${Math.round(rgb.b)})`
    );
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function fillGradient(
  ctx: CanvasRenderingContext2D,
  state: GeneratorState,
  width: number,
  height: number,
  quality: "preview" | "export"
) {
  if (state.gradientType === "arc") {
    fillArcField(ctx, state, width, height, quality);
    return;
  }
  fillCanvasGradient(ctx, state, width, height);
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let result = t;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function getGrainTile(state: GeneratorState) {
  const size = GRAIN_DEFAULTS.size;
  const key = [
    state.grain.seed,
    GRAIN_DEFAULTS.colored ? "c" : "m",
    GRAIN_DEFAULTS.intensity.toFixed(1),
    size.toFixed(2),
  ].join(":");

  const cached = grainTileCache.get(key);
  if (cached) return cached;

  const tile = document.createElement("canvas");
  const sourceSize = 256;
  const cell = Math.max(1, Math.round(size));
  tile.width = sourceSize;
  tile.height = sourceSize;
  const ctx = tile.getContext("2d", { willReadFrequently: true });
  if (!ctx) return tile;

  const image = ctx.createImageData(sourceSize, sourceSize);
  const random = mulberry32(state.grain.seed || 1);
  const amplitude = (GRAIN_DEFAULTS.intensity / 100) * 126;
  const data = image.data;

  for (let y = 0; y < sourceSize; y += cell) {
    for (let x = 0; x < sourceSize; x += cell) {
      const mono = 128 + (random() * 2 - 1) * amplitude;
      const r = GRAIN_DEFAULTS.colored ? 128 + (random() * 2 - 1) * amplitude : mono;
      const g = GRAIN_DEFAULTS.colored ? 128 + (random() * 2 - 1) * amplitude : mono;
      const b = GRAIN_DEFAULTS.colored ? 128 + (random() * 2 - 1) * amplitude : mono;

      for (let dy = 0; dy < cell; dy += 1) {
        for (let dx = 0; dx < cell; dx += 1) {
          const px = x + dx;
          const py = y + dy;
          if (px >= sourceSize || py >= sourceSize) continue;
          const index = (py * sourceSize + px) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(image, 0, 0);
  grainTileCache.set(key, tile);
  if (grainTileCache.size > 24) {
    const first = grainTileCache.keys().next().value;
    if (first) grainTileCache.delete(first);
  }
  return tile;
}

function drawTiled(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  width: number,
  height: number,
  sourceSize: number
) {
  for (let y = 0; y < height; y += sourceSize) {
    for (let x = 0; x < width; x += sourceSize) {
      ctx.drawImage(source, x, y, sourceSize, sourceSize);
    }
  }
}

export async function renderGradient(
  canvas: HTMLCanvasElement,
  state: GeneratorState,
  options?: { width?: number; height?: number; quality?: "preview" | "export" }
) {
  const width = Math.max(1, Math.round(options?.width ?? state.canvas.width));
  const height = Math.max(1, Math.round(options?.height ?? state.canvas.height));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not available in this browser.");
  }

  ctx.clearRect(0, 0, width, height);
  fillGradient(ctx, state, width, height, options?.quality ?? "preview");

  if (state.grain.enabled && state.grain.opacity > 0) {
    const tile = getGrainTile(state);
    ctx.save();
    ctx.globalAlpha = clamp(state.grain.opacity / 100, 0, 1);
    ctx.globalCompositeOperation = "soft-light";
    const tileScale = Math.max(96, 220 * GRAIN_DEFAULTS.size);
    drawTiled(ctx, tile, width, height, tileScale);
    ctx.restore();
  }
}

export function previewSize(
  canvasWidth: number,
  canvasHeight: number,
  maxWidth: number,
  maxHeight: number
) {
  const scale = Math.min(maxWidth / canvasWidth, maxHeight / canvasHeight, 1);
  return {
    width: Math.max(1, Math.round(canvasWidth * scale)),
    height: Math.max(1, Math.round(canvasHeight * scale)),
  };
}

export async function exportPngBlob(state: GeneratorState) {
  const width = Math.min(8192, Math.round(state.canvas.width * EXPORT_SCALE));
  const height = Math.min(8192, Math.round(state.canvas.height * EXPORT_SCALE));
  const canvas = document.createElement("canvas");
  await renderGradient(canvas, state, { width, height, quality: "export" });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("PNG export failed."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}
