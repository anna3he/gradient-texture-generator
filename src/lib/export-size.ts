import { EXPORT_SCALE } from "./panel-config";
import type { GeneratorState } from "./types";

export function exportPixelSize(state: GeneratorState) {
  return {
    width: Math.min(8192, Math.round(state.canvas.width * EXPORT_SCALE)),
    height: Math.min(8192, Math.round(state.canvas.height * EXPORT_SCALE)),
  };
}
