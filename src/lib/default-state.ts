import { generateStops } from "./harmony";
import { STYLE_PRESETS } from "./presets";
import type { GeneratorState } from "./types";

const dusk = STYLE_PRESETS[0];

export function createInitialState(): GeneratorState {
  const preset = dusk ?? STYLE_PRESETS[0];
  if (!preset) {
    throw new Error("No style presets defined.");
  }

  return {
    gradientType: preset.gradientType,
    angle: preset.angle,
    stops: generateStops({
      harmony: preset.harmony,
      stopCount: 4,
      lockHue: preset.lockHue,
      baseHue: preset.baseHue,
      satMin: preset.satMin,
      satMax: preset.satMax,
      lightMin: preset.lightMin,
      lightMax: preset.lightMax,
      positions: [0, 34, 68, 100],
    }),
    harmony: preset.harmony,
    lockHue: preset.lockHue,
    baseHue: preset.baseHue,
    satMin: preset.satMin,
    satMax: preset.satMax,
    lightMin: preset.lightMin,
    lightMax: preset.lightMax,
    grain: { ...preset.grain, seed: 1204 },
    texture: { ...preset.texture },
    canvas: { preset: "16:9", width: 1920, height: 1080 },
    resolutionScale: 1,
    motion: {
      originX: 50,
      originY: 50,
      playing: false,
      mode: "both",
      speed: 0.8,
    },
  };
}
