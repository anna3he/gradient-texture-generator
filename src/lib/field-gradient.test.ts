import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hexToRgb } from "./color";
import { createInitialState } from "./default-state";
import { buildCurve, quadraticPoint, sampleArc, shiftedPalette } from "./field-gradient";

describe("field gradient", () => {
  it("places the glow between deep and wash on the arc", () => {
    const palette = createInitialState().palette;
    const mid = quadraticPoint(palette.deep, palette.glow, palette.wash, 0.5);
    assert.ok(mid.x > 0 && mid.x < 1);
    const samples = buildCurve(palette);
    const nearest = samples.reduce(
      (best, sample) => {
        const dist = Math.hypot(mid.x - sample.x, mid.y - sample.y);
        return dist < best.dist ? { dist, t: sample.t } : best;
      },
      { dist: Number.POSITIVE_INFINITY, t: 0 }
    );
    assert.ok(nearest.dist < 0.08);
    assert.ok(nearest.t > 0.2 && nearest.t < 0.8);
  });

  it("keeps deep saturated next to its point", () => {
    const state = createInitialState();
    const samples = buildCurve(state.palette);
    const wash = hexToRgb(state.palette.wash.color) ?? { r: 245, g: 248, b: 250 };
    const deep = hexToRgb(state.palette.deep.color);
    assert.ok(deep);
    const sampled = sampleArc(state.palette.deep.x / 100, state.palette.deep.y / 100, samples, wash);
    const toDeep =
      Math.abs(sampled.r - deep.r) + Math.abs(sampled.g - deep.g) + Math.abs(sampled.b - deep.b);
    const toWash =
      Math.abs(sampled.r - wash.r) + Math.abs(sampled.g - wash.g) + Math.abs(sampled.b - wash.b);
    assert.ok(toDeep < toWash);
    assert.ok(toDeep < 140);
  });

  it("drifts interior points from phase, not a whole-field slide", () => {
    const state = createInitialState();
    const moved = shiftedPalette({
      ...state,
      motion: { ...state.motion, playing: true, phase: 1.2 },
    });
    assert.notEqual(moved.glow.x, state.palette.glow.x);
    assert.ok(Math.abs(moved.glow.x - state.palette.glow.x) < 8);
    assert.ok(Math.abs(moved.wash.x - state.palette.wash.x) < Math.abs(moved.glow.x - state.palette.glow.x) + 0.01);
  });
});
