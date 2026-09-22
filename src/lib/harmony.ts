import {
  clamp,
  createId,
  hslToHex,
  lerp,
  mixHex,
  randomBetween,
  wrapHue,
} from "./color";
import type { ColorStop, Harmony } from "./types";

const HUE_FAMILIES: Record<Harmony, number[]> = {
  analogous: [-30, 0, 30],
  complementary: [0, 180],
  "split-complementary": [0, 150, 210],
  triadic: [0, 120, 240],
  monochromatic: [0],
};

export const HARMONY_LABELS: Record<Harmony, string> = {
  analogous: "Analogous",
  complementary: "Complementary",
  "split-complementary": "Split complementary",
  triadic: "Triadic",
  monochromatic: "Monochromatic",
};

export const HARMONY_BLURBS: Record<Harmony, string> = {
  analogous: "Neighboring hues, about 30° apart — calm and usable.",
  complementary: "Opposites on the wheel for a clean, high-contrast pair.",
  "split-complementary": "A base hue plus the two neighbors of its opposite.",
  triadic: "Three hues equally spaced — lively without going random.",
  monochromatic: "One hue, shifted through saturation and lightness.",
};

function shuffleInPlace<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = items[i];
    const next = items[j];
    if (current === undefined || next === undefined) continue;
    items[i] = next;
    items[j] = current;
  }
  return items;
}

function hueJitter(harmony: Harmony) {
  if (harmony === "monochromatic") return randomBetween(-4, 4);
  if (harmony === "analogous") return randomBetween(-6, 6);
  return randomBetween(-8, 8);
}

function distributedValues(count: number, min: number, max: number) {
  if (count <= 1) return [lerp(min, max, 0.5)];

  const values = Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    const wobble = randomBetween(-0.08, 0.08);
    return clamp(lerp(min, max, clamp(t + wobble, 0, 1)), min, max);
  });

  return shuffleInPlace(values);
}

function huesForHarmony(harmony: Harmony, count: number, baseHue: number) {
  if (harmony === "analogous") {
    const span = count <= 2 ? 24 : 36;
    return Array.from({ length: count }, (_, index) => {
      const t = count === 1 ? 0.5 : index / (count - 1);
      return wrapHue(baseHue + lerp(-span, span, t) + hueJitter(harmony));
    });
  }

  const family = HUE_FAMILIES[harmony];
  return Array.from({ length: count }, (_, index) => {
    const offset = family[index % family.length] ?? 0;
    return wrapHue(baseHue + offset + hueJitter(harmony));
  });
}

export function generateStops(options: {
  harmony: Harmony;
  stopCount: number;
  lockHue: boolean;
  baseHue: number;
  satMin: number;
  satMax: number;
  lightMin: number;
  lightMax: number;
  positions?: number[];
}): ColorStop[] {
  const stopCount = clamp(Math.round(options.stopCount), 2, 8);
  const satMin = clamp(Math.min(options.satMin, options.satMax), 8, 92);
  const satMax = clamp(Math.max(options.satMin, options.satMax), 12, 96);
  const lightMin = clamp(Math.min(options.lightMin, options.lightMax), 6, 88);
  const lightMax = clamp(Math.max(options.lightMin, options.lightMax), 12, 94);
  const baseHue = options.lockHue
    ? wrapHue(options.baseHue)
    : wrapHue(randomBetween(0, 360));

  const hues = huesForHarmony(options.harmony, stopCount, baseHue);
  const saturations = distributedValues(stopCount, satMin, satMax);
  const lights = distributedValues(stopCount, lightMin, lightMax);
  const positions =
    options.positions?.slice(0, stopCount) ??
    Array.from({ length: stopCount }, (_, index) =>
      stopCount === 1 ? 0 : (index / (stopCount - 1)) * 100
    );

  while (positions.length < stopCount) {
    const last = positions[positions.length - 1] ?? 0;
    positions.push(clamp(last + 100 / stopCount, 0, 100));
  }

  return hues.map((hue, index) => ({
    id: createId(),
    color: hslToHex({
      h: hue,
      s: saturations[index] ?? satMin,
      l: lights[index] ?? lightMin,
    }),
    position: clamp(positions[index] ?? (index / (stopCount - 1)) * 100, 0, 100),
  }));
}

export function sampleGradientColor(stops: ColorStop[], position: number) {
  const sorted = [...stops].sort((a, b) => a.position - b.position);
  if (sorted.length === 0) return "#888888";
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return "#888888";
  if (position <= first.position) return first.color;
  if (position >= last.position) return last.color;

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const left = sorted[i];
    const right = sorted[i + 1];
    if (!left || !right) continue;
    if (position >= left.position && position <= right.position) {
      const span = right.position - left.position || 1;
      const t = (position - left.position) / span;
      return mixHex(left.color, right.color, t);
    }
  }

  return last.color;
}

export function sortStops(stops: ColorStop[]) {
  return [...stops].sort((a, b) => a.position - b.position);
}

export function resizeStops(
  stops: ColorStop[],
  nextCount: number,
  options: {
    harmony: Harmony;
    lockHue: boolean;
    baseHue: number;
    satMin: number;
    satMax: number;
    lightMin: number;
    lightMax: number;
  }
) {
  const count = clamp(Math.round(nextCount), 2, 8);
  const sorted = sortStops(stops);

  if (count === sorted.length) return sorted;

  if (count < sorted.length) {
    const kept = [sorted[0], ...sorted.slice(1, -1).slice(0, count - 2), sorted[sorted.length - 1]];
    return kept.filter((stop): stop is ColorStop => Boolean(stop));
  }

  const extras = generateStops({
    ...options,
    stopCount: count - sorted.length + 2,
    positions: [],
  }).slice(2);

  const merged = [...sorted];
  for (const extra of extras) {
    const used = new Set(merged.map((stop) => Math.round(stop.position)));
    let position = 50;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      position = randomBetween(8, 92);
      if (!used.has(Math.round(position))) break;
    }
    merged.push({ ...extra, position });
  }

  return sortStops(merged);
}
