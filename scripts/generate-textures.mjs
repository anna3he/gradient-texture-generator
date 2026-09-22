import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const SIZE = 512;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "textures");

function fade(t) {
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function wrap(n, max) {
  return ((n % max) + max) % max;
}

function hash2(ix, iy, seed) {
  const n = Math.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

function valueNoise(x, y, cell, seed) {
  const cells = SIZE / cell;
  const gx = x / cell;
  const gy = y / cell;
  const x0 = wrap(Math.floor(gx), cells);
  const y0 = wrap(Math.floor(gy), cells);
  const x1 = wrap(x0 + 1, cells);
  const y1 = wrap(y0 + 1, cells);
  const fx = fade(gx - Math.floor(gx));
  const fy = fade(gy - Math.floor(gy));
  return lerp(
    lerp(hash2(x0, y0, seed), hash2(x1, y0, seed), fx),
    lerp(hash2(x0, y1, seed), hash2(x1, y1, seed), fx),
    fy
  );
}

function fbm(x, y, startCell, seed, octaves = 4) {
  let value = 0;
  let amp = 1;
  let norm = 0;
  let cell = startCell;
  for (let i = 0; i < octaves; i += 1) {
    value += valueNoise(x, y, cell, seed + i * 19) * amp;
    norm += amp;
    amp *= 0.5;
    cell = Math.max(4, cell / 2);
  }
  return value / norm;
}

function fiber(x, y, freq, phase, weight = 1) {
  return (0.5 + 0.5 * Math.sin(((x + y) * freq * Math.PI * 2) / SIZE + phase)) * weight;
}

function fiberAxis(coord, freq, phase, weight = 1) {
  return (0.5 + 0.5 * Math.sin((coord * freq * Math.PI * 2) / SIZE + phase)) * weight;
}

function writePng(name, paint) {
  const png = new PNG({ width: SIZE, height: SIZE });
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const [r, g, b] = paint(x, y);
      const idx = (SIZE * y + x) << 2;
      png.data[idx] = Math.max(0, Math.min(255, Math.round(r)));
      png.data[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      png.data[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
      png.data[idx + 3] = 255;
    }
  }
  writeFileSync(join(OUT, name), PNG.sync.write(png));
}

function tracingPaper(x, y) {
  const paper = fbm(x, y, 64, 11, 5);
  const fine = fbm(x, y, 16, 29, 3);
  const fibers =
    fiberAxis(x + y * 0.08, 38, 0.4, 0.45) +
    fiberAxis(y + x * 0.05, 52, 1.1, 0.35) +
    fiber(x, y, 17, 2.2, 0.2);
  const speck = hash2(Math.floor(x / 2), Math.floor(y / 2), 91) > 0.992 ? 18 : 0;
  const tone = 228 + paper * 18 + fine * 8 + fibers * 10 - speck;
  return [tone - 2, tone - 1, tone - 6];
}

function vellum(x, y) {
  const paper = fbm(x, y, 64, 7, 5);
  const pulp = fbm(x, y, 12, 41, 3);
  const fibers =
    fiberAxis(x, 26, 0.2, 0.4) +
    fiberAxis(y, 31, 1.7, 0.35) +
    fiber(x, -y, 13, 0.6, 0.25);
  const speck = hash2(x, y, 17) > 0.985 ? 22 : 0;
  const warmth = 18 + paper * 10;
  const tone = 214 + paper * 22 + pulp * 10 + fibers * 12 - speck;
  return [tone + warmth * 0.35, tone + warmth * 0.05, tone - 16];
}

function canvasWeave(x, y) {
  const warp = 0.55 + 0.45 * Math.sin((x * Math.PI * 2 * 28) / SIZE);
  const weft = 0.55 + 0.45 * Math.sin((y * Math.PI * 2 * 28) / SIZE);
  const irregular = fbm(x, y, 32, 53, 3);
  const thread = warp * 0.52 + weft * 0.48 + irregular * 0.16;
  const ridge =
    Math.pow(Math.abs(Math.sin((x * Math.PI * 2 * 28) / SIZE)), 0.45) * 0.15 +
    Math.pow(Math.abs(Math.sin((y * Math.PI * 2 * 28) / SIZE)), 0.45) * 0.12;
  const tone = 186 + thread * 48 + ridge * 30;
  return [tone + 8, tone + 2, tone - 10];
}

function filmGrain(x, y) {
  const clump = fbm(x, y, 16, 73, 4);
  const fine = hash2(x, y, 3);
  const mid = hash2(x * 3, y * 2, 61);
  const grain = (fine * 0.62 + mid * 0.22 + clump * 0.16) * 255;
  const tone = 118 + (grain - 128) * 0.85;
  return [tone + 2, tone, tone - 1];
}

mkdirSync(OUT, { recursive: true });
writePng("tracing-paper.png", tracingPaper);
writePng("vellum.png", vellum);
writePng("canvas-weave.png", canvasWeave);
writePng("film-grain.png", filmGrain);
console.log(`Wrote 4 tileable textures to ${OUT}`);
