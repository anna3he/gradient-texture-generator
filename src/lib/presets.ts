import type { CanvasPresetId, StylePreset } from "./types";

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

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "sea",
    name: "Sea",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 12 },
    palette: { deep: "#1c2d9c", glow: "#1e6e68", wash: "#f5f8fa" },
  },
  {
    id: "sunrise",
    name: "Sunrise",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 10 },
    palette: { deep: "#c47a52", glow: "#f0b27a", wash: "#fff8f1" },
  },
  {
    id: "dawn",
    name: "Dawn",
    gradientType: "linear",
    angle: 172,
    grain: { enabled: true, opacity: 10 },
    palette: { deep: "#8a6b8c", glow: "#e8b4b8", wash: "#fff6f4" },
  },
  {
    id: "dusk",
    name: "Dusk",
    gradientType: "linear",
    angle: 186,
    grain: { enabled: true, opacity: 14 },
    palette: { deep: "#3d3a6b", glow: "#c9898b", wash: "#f7f3f0" },
  },
  {
    id: "ember",
    name: "Ember",
    gradientType: "linear",
    angle: 168,
    grain: { enabled: true, opacity: 14 },
    palette: { deep: "#6b2e22", glow: "#e07a3d", wash: "#fbf4ec" },
  },
  {
    id: "mist",
    name: "Mist",
    gradientType: "linear",
    angle: 180,
    grain: { enabled: true, opacity: 16 },
    palette: { deep: "#5a6e78", glow: "#a8c4c8", wash: "#f7fafb" },
  },
  {
    id: "sage",
    name: "Sage",
    gradientType: "radial",
    angle: 180,
    grain: { enabled: true, opacity: 12 },
    palette: { deep: "#4a5c4e", glow: "#9bb09a", wash: "#f5f7f2" },
  },
  {
    id: "linen",
    name: "Linen",
    gradientType: "linear",
    angle: 160,
    grain: { enabled: true, opacity: 8 },
    palette: { deep: "#a89078", glow: "#d4c4a8", wash: "#fbf8f2" },
  },
];
