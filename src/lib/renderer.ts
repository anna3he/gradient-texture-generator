import { clamp, hexToRgb } from "./color";
import { sortStops } from "./harmony";
import { TEXTURE_BY_ID } from "./textures";
import type { BlendMode, GeneratorState } from "./types";

const grainTileCache = new Map<string, HTMLCanvasElement>();
const textureImageCache = new Map<string, HTMLImageElement | Promise<HTMLImageElement>>();

function cssAngleToRadians(angle: number) {
  return ((angle - 90) * Math.PI) / 180;
}

function fillGradient(
  ctx: CanvasRenderingContext2D,
  state: GeneratorState,
  width: number,
  height: number
) {
  const stops = sortStops(state.stops);
  const cx = (clamp(state.motion.originX, 0, 100) / 100) * width;
  const cy = (clamp(state.motion.originY, 0, 100) / 100) * height;
  let gradient: CanvasGradient;

  if (state.gradientType === "radial") {
    gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(width, height) / 1.15);
  } else if (state.gradientType === "conic") {
    gradient = ctx.createConicGradient((state.angle * Math.PI) / 180, cx, cy);
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
  const size = clamp(state.grain.size, 0.6, 6);
  const key = [
    state.grain.seed,
    state.grain.colored ? "c" : "m",
    state.grain.intensity.toFixed(1),
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
  const amplitude = (clamp(state.grain.intensity, 0, 100) / 100) * 126;
  const data = image.data;

  for (let y = 0; y < sourceSize; y += cell) {
    for (let x = 0; x < sourceSize; x += cell) {
      const mono = 128 + (random() * 2 - 1) * amplitude;
      const r = state.grain.colored ? 128 + (random() * 2 - 1) * amplitude : mono;
      const g = state.grain.colored ? 128 + (random() * 2 - 1) * amplitude : mono;
      const b = state.grain.colored ? 128 + (random() * 2 - 1) * amplitude : mono;

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

function loadTexture(src: string) {
  const cached = textureImageCache.get(src);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      textureImageCache.set(src, image);
      resolve(image);
    };
    image.onerror = () => {
      textureImageCache.delete(src);
      reject(new Error(`Could not load texture ${src}`));
    };
    image.src = src;
  });

  textureImageCache.set(src, promise);
  return promise;
}

const BLEND_MAP: Record<BlendMode, GlobalCompositeOperation> = {
  multiply: "multiply",
  overlay: "overlay",
  "soft-light": "soft-light",
  screen: "screen",
};

export async function renderGradient(
  canvas: HTMLCanvasElement,
  state: GeneratorState,
  options?: { width?: number; height?: number }
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
  fillGradient(ctx, state, width, height);

  const grainAlpha =
    (clamp(state.grain.opacity, 0, 100) / 100) *
    (clamp(state.grain.intensity, 0, 100) / 100 > 0 ? 1 : 0);

  if (grainAlpha > 0 && state.grain.intensity > 0) {
    const tile = getGrainTile(state);
    ctx.save();
    ctx.globalAlpha = clamp(state.grain.opacity / 100, 0, 1);
    ctx.globalCompositeOperation = state.grain.colored ? "overlay" : "soft-light";
    const tileScale = Math.max(96, 220 * clamp(state.grain.size, 0.6, 6));
    drawTiled(ctx, tile, width, height, tileScale);
    ctx.restore();
  }

  if (state.texture.id !== "none" && state.texture.opacity > 0) {
    const asset = TEXTURE_BY_ID[state.texture.id];
    try {
      const image = await loadTexture(asset.src);
      ctx.save();
      ctx.globalAlpha = clamp(state.texture.opacity / 100, 0, 1);
      ctx.globalCompositeOperation = BLEND_MAP[state.texture.blend];
      const tileSize = Math.max(image.width, 256);
      drawTiled(ctx, image, width, height, tileSize);
      ctx.restore();
    } catch {
      // Preview still works if a texture file failed to load.
    }
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
  const scale = clamp(state.resolutionScale, 0.5, 4);
  const width = Math.min(8192, Math.round(state.canvas.width * scale));
  const height = Math.min(8192, Math.round(state.canvas.height * scale));
  const canvas = document.createElement("canvas");
  await renderGradient(canvas, state, { width, height });

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
