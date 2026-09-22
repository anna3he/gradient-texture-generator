import { STYLE_PRESETS } from "./presets";
import type { GeneratorState } from "./types";

export function createInitialState(): GeneratorState {
  const preset = STYLE_PRESETS[0];
  if (!preset) {
    throw new Error("No style presets defined.");
  }

  return {
    presetId: preset.id,
    palette: {
      deep: { ...preset.palette.deep },
      glow: { ...preset.palette.glow },
      wash: { ...preset.palette.wash },
    },
    gradientType: preset.gradientType,
    angle: preset.angle,
    grain: { ...preset.grain, seed: 1204 },
    canvas: { preset: "16:9", width: 1920, height: 1080 },
    motion: {
      playing: false,
      speed: 0.8,
      originX: 50,
      originY: 50,
    },
  };
}
