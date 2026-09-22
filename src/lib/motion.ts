import { clamp, wrapHue } from "./color";
import type { GeneratorState } from "./types";

export function applyMotion(state: GeneratorState, elapsedSec: number): GeneratorState {
  if (!state.motion.playing || elapsedSec <= 0) return state;

  const t = elapsedSec * state.motion.speed;

  return {
    ...state,
    angle: wrapHue(state.angle + t * 16),
    motion: {
      ...state.motion,
      originX: clamp(50 + Math.sin(t * 0.55) * 10, 8, 92),
      originY: clamp(50 + Math.cos(t * 0.4) * 8, 8, 92),
    },
  };
}

export function motionDurationSec(speed: number) {
  return Number((18 / Math.max(0.25, speed)).toFixed(1));
}
