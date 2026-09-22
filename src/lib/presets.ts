import { paletteFromColors } from "./palette";
import type { CanvasPresetId, Palette, StylePreset } from "./types";

export const CANVAS_PRESETS: Record<
  CanvasPresetId,
  { width: number; height: number; label: string }
> = {
  "16:9": { width: 1920, height: 1080, label: "16:9 · 1920×1080" },
  "4:3": { width: 1600, height: 1200, label: "4:3 · 1600×1200" },
  "1:1": { width: 1080, height: 1080, label: "1:1 · 1080×1080" },
  "9:16": { width: 1080, height: 1920, label: "9:16 · 1080×1920" },
  "3:2": { width: 1800, height: 1200, label: "3:2 · 1800×1200" },
  og: { width: 1200, height: 630, label: "OG · 1200×630" },
};

const TOKYO_POINTS = {
  deep: { x: 50, y: 12 },
  glow: { x: 50, y: 46 },
  wash: { x: 50, y: 86 },
} as const;

function presetPalette(
  colors: { deep: string; glow: string; wash: string },
  points: { deep: { x: number; y: number }; glow: { x: number; y: number }; wash: { x: number; y: number } }
): Palette {
  return paletteFromColors(colors, points);
}

export function presetPreviewCss(preset: StylePreset) {
  const { deep, glow, wash } = preset.palette;
  return `linear-gradient(180deg, ${deep.color} 0%, ${glow.color} 46%, ${wash.color} 100%)`;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "sea",
    name: "Sea",
    collection: "studio",
    gradientType: "arc",
    angle: 180,
    grain: { enabled: true, opacity: 12 },
    palette: presetPalette(
      { deep: "#1c2d9c", glow: "#2ad4c0", wash: "#f5f8fa" },
      { deep: { x: 16, y: 14 }, glow: { x: 36, y: 44 }, wash: { x: 78, y: 76 } }
    ),
  },
  {
    id: "sunrise",
    name: "Sunrise",
    collection: "studio",
    gradientType: "arc",
    angle: 180,
    grain: { enabled: true, opacity: 10 },
    palette: presetPalette(
      { deep: "#a85a30", glow: "#ffc078", wash: "#fff8f1" },
      { deep: { x: 16, y: 72 }, glow: { x: 40, y: 38 }, wash: { x: 80, y: 20 } }
    ),
  },
  {
    id: "dawn",
    name: "Dawn",
    collection: "studio",
    gradientType: "arc",
    angle: 172,
    grain: { enabled: true, opacity: 10 },
    palette: presetPalette(
      { deep: "#70405e", glow: "#ff9eb0", wash: "#fff6f4" },
      { deep: { x: 15, y: 24 }, glow: { x: 38, y: 52 }, wash: { x: 80, y: 78 } }
    ),
  },
  {
    id: "dusk",
    name: "Dusk",
    collection: "studio",
    gradientType: "arc",
    angle: 186,
    grain: { enabled: true, opacity: 14 },
    palette: presetPalette(
      { deep: "#3d3a6b", glow: "#e89aa4", wash: "#f7f3f0" },
      { deep: { x: 18, y: 14 }, glow: { x: 42, y: 40 }, wash: { x: 78, y: 80 } }
    ),
  },
  {
    id: "ember",
    name: "Ember",
    collection: "studio",
    gradientType: "arc",
    angle: 168,
    grain: { enabled: true, opacity: 14 },
    palette: presetPalette(
      { deep: "#6b2e22", glow: "#ff7e3a", wash: "#fbf4ec" },
      { deep: { x: 14, y: 18 }, glow: { x: 34, y: 48 }, wash: { x: 82, y: 78 } }
    ),
  },
  {
    id: "mist",
    name: "Mist",
    collection: "studio",
    gradientType: "arc",
    angle: 180,
    grain: { enabled: true, opacity: 16 },
    palette: presetPalette(
      { deep: "#3a5060", glow: "#7ad4e0", wash: "#f7fafb" },
      { deep: { x: 20, y: 16 }, glow: { x: 40, y: 42 }, wash: { x: 76, y: 78 } }
    ),
  },
  {
    id: "sage",
    name: "Sage",
    collection: "studio",
    gradientType: "arc",
    angle: 180,
    grain: { enabled: true, opacity: 12 },
    palette: presetPalette(
      { deep: "#2f4a38", glow: "#8fd4a0", wash: "#f5f7f2" },
      { deep: { x: 22, y: 80 }, glow: { x: 42, y: 40 }, wash: { x: 78, y: 18 } }
    ),
  },
  {
    id: "linen",
    name: "Linen",
    collection: "studio",
    gradientType: "arc",
    angle: 160,
    grain: { enabled: true, opacity: 8 },
    palette: presetPalette(
      { deep: "#8a6240", glow: "#efc888", wash: "#fbf8f2" },
      { deep: { x: 18, y: 64 }, glow: { x: 38, y: 34 }, wash: { x: 80, y: 22 } }
    ),
  },
  {
    id: "kasumi",
    name: "Kasumi",
    collection: "tokyo",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 6 },
    palette: presetPalette(
      { deep: "#c8c4d8", glow: "#ddd6e6", wash: "#f3eef4" },
      TOKYO_POINTS
    ),
  },
  {
    id: "sora",
    name: "Sora",
    collection: "tokyo",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 6 },
    palette: presetPalette(
      { deep: "#b7d0ec", glow: "#d8e6f4", wash: "#f6eef1" },
      TOKYO_POINTS
    ),
  },
  {
    id: "sumi",
    name: "Sumi",
    collection: "tokyo",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 8 },
    palette: presetPalette(
      { deep: "#16181a", glow: "#5c6368", wash: "#e8ecea" },
      TOKYO_POINTS
    ),
  },
  {
    id: "washi",
    name: "Washi",
    collection: "tokyo",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 5 },
    palette: presetPalette(
      { deep: "#c4b09a", glow: "#e6d8c8", wash: "#f7f1e8" },
      TOKYO_POINTS
    ),
  },
  {
    id: "tsuki",
    name: "Tsuki",
    collection: "tokyo",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 4 },
    palette: presetPalette(
      { deep: "#efe4a8", glow: "#f7efc4", wash: "#fffaf0" },
      TOKYO_POINTS
    ),
  },
  {
    id: "kon",
    name: "Kon",
    collection: "tokyo",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 7 },
    palette: presetPalette(
      { deep: "#0a1228", glow: "#1f3f8c", wash: "#d7dfec" },
      TOKYO_POINTS
    ),
  },
  {
    id: "akane",
    name: "Akane",
    collection: "tokyo",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 6 },
    palette: presetPalette(
      { deep: "#c03a3a", glow: "#e87878", wash: "#f6f2f0" },
      TOKYO_POINTS
    ),
  },
  {
    id: "ai",
    name: "Ai",
    collection: "tokyo",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 6 },
    palette: presetPalette(
      { deep: "#163a9c", glow: "#4d74d6", wash: "#e8eef8" },
      TOKYO_POINTS
    ),
  },
  {
    id: "ume",
    name: "Ume",
    collection: "tokyo",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 8 },
    palette: presetPalette(
      { deep: "#14080e", glow: "#c04050", wash: "#f4eef0" },
      TOKYO_POINTS
    ),
  },
  {
    id: "kogane",
    name: "Kogane",
    collection: "tokyo",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 6 },
    palette: presetPalette(
      { deep: "#160c08", glow: "#e87838", wash: "#f2e8e0" },
      TOKYO_POINTS
    ),
  },
  {
    id: "hai",
    name: "Hai",
    collection: "tokyo",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 7 },
    palette: presetPalette(
      { deep: "#2a2e2e", glow: "#8a9290", wash: "#eef2ee" },
      TOKYO_POINTS
    ),
  },
  {
    id: "yuki",
    name: "Yuki",
    collection: "tokyo",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 4 },
    palette: presetPalette(
      { deep: "#e4e0dc", glow: "#f0ece8", wash: "#faf8f6" },
      TOKYO_POINTS
    ),
  },
];
