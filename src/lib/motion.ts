import type { GeneratorState } from "./types";

export function applyMotion(state: GeneratorState, elapsedSec: number): GeneratorState {
  if (!state.motion.playing || elapsedSec <= 0) return state;

  return {
    ...state,
    motion: {
      ...state.motion,
      phase: elapsedSec * state.motion.speed,
    },
  };
}

export function motionDurationSec(speed: number) {
  return Number((18 / Math.max(0.25, speed)).toFixed(1));
}
