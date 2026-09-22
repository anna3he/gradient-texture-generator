import { clamp, wrapHue } from "./color";
import type { GeneratorState } from "./types";

export const MOTION_MODE_LABELS = {
  spin: "Spin",
  drift: "Drift",
  both: "Spin + drift",
} as const;

export function applyMotion(state: GeneratorState, elapsedSec: number): GeneratorState {
  if (!state.motion.playing || elapsedSec <= 0) return state;

  const t = elapsedSec * state.motion.speed;
  const next = { ...state, motion: { ...state.motion } };

  if (state.motion.mode === "spin" || state.motion.mode === "both") {
    next.angle = wrapHue(state.angle + t * 28);
  }

  if (state.motion.mode === "drift" || state.motion.mode === "both") {
    next.motion.originX = clamp(state.motion.originX + Math.sin(t * 0.65) * 14, 4, 96);
    next.motion.originY = clamp(state.motion.originY + Math.cos(t * 0.48) * 12, 4, 96);
  }

  return next;
}

export function motionDurationSec(speed: number) {
  return Number((18 / Math.max(0.25, speed)).toFixed(1));
}
