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

function presetPalette(
  colors: { deep: string; glow: string; wash: string },
  points: { deep: { x: number; y: number }; glow: { x: number; y: number }; wash: { x: number; y: number } }
): Palette {
  return paletteFromColors(colors, points);
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "sea",
    name: "Sea",
    gradientType: "arc",
    angle: 180,
    grain: { enabled: true, opacity: 12 },
    palette: presetPalette(
      { deep: "#1c2d9c", glow: "#1e6e68", wash: "#f5f8fa" },
      { deep: { x: 20, y: 16 }, glow: { x: 44, y: 50 }, wash: { x: 80, y: 84 } }
    ),
  },
  {
    id: "sunrise",
    name: "Sunrise",
    gradientType: "arc",
    angle: 180,
    grain: { enabled: true, opacity: 10 },
    palette: presetPalette(
      { deep: "#c47a52", glow: "#f0b27a", wash: "#fff8f1" },
      { deep: { x: 18, y: 70 }, glow: { x: 52, y: 36 }, wash: { x: 84, y: 18 } }
    ),
  },
  {
    id: "dawn",
    name: "Dawn",
    gradientType: "arc",
    angle: 172,
    grain: { enabled: true, opacity: 10 },
    palette: presetPalette(
      { deep: "#8a6b8c", glow: "#e8b4b8", wash: "#fff6f4" },
      { deep: { x: 16, y: 28 }, glow: { x: 48, y: 58 }, wash: { x: 82, y: 78 } }
    ),
  },
  {
    id: "dusk",
    name: "Dusk",
    gradientType: "arc",
    angle: 186,
    grain: { enabled: true, opacity: 14 },
    palette: presetPalette(
      { deep: "#3d3a6b", glow: "#c9898b", wash: "#f7f3f0" },
      { deep: { x: 24, y: 14 }, glow: { x: 62, y: 42 }, wash: { x: 76, y: 86 } }
    ),
  },
  {
    id: "ember",
    name: "Ember",
    gradientType: "arc",
    angle: 168,
    grain: { enabled: true, opacity: 14 },
    palette: presetPalette(
      { deep: "#6b2e22", glow: "#e07a3d", wash: "#fbf4ec" },
      { deep: { x: 14, y: 22 }, glow: { x: 40, y: 54 }, wash: { x: 86, y: 80 } }
    ),
  },
  {
    id: "mist",
    name: "Mist",
    gradientType: "arc",
    angle: 180,
    grain: { enabled: true, opacity: 16 },
    palette: presetPalette(
      { deep: "#5a6e78", glow: "#a8c4c8", wash: "#f7fafb" },
      { deep: { x: 28, y: 20 }, glow: { x: 50, y: 46 }, wash: { x: 74, y: 82 } }
    ),
  },
  {
    id: "sage",
    name: "Sage",
    gradientType: "arc",
    angle: 180,
    grain: { enabled: true, opacity: 12 },
    palette: presetPalette(
      { deep: "#4a5c4e", glow: "#9bb09a", wash: "#f5f7f2" },
      { deep: { x: 32, y: 78 }, glow: { x: 58, y: 40 }, wash: { x: 78, y: 16 } }
    ),
  },
  {
    id: "linen",
    name: "Linen",
    gradientType: "arc",
    angle: 160,
    grain: { enabled: true, opacity: 8 },
    palette: presetPalette(
      { deep: "#a89078", glow: "#d4c4a8", wash: "#fbf8f2" },
      { deep: { x: 22, y: 62 }, glow: { x: 46, y: 34 }, wash: { x: 80, y: 22 } }
    ),
  },
];
