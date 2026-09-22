import type { GeneratorState } from "./types";

export function exportPixelSize(state: GeneratorState) {
  const scale = state.resolutionScale;
  return {
    width: Math.min(8192, Math.round(state.canvas.width * scale)),
    height: Math.min(8192, Math.round(state.canvas.height * scale)),
  };
}
