import assert from "node:assert/strict";
import { describe, it } from "node:test";
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

  it("blends the three colors instead of leaving a wash field", () => {
    const state = createInitialState();
    const samples = buildCurve(state.palette);
    const glow = sampleArc(state.palette.glow.x / 100, state.palette.glow.y / 100, samples);
    const glowRgb = samples[Math.floor(samples.length / 2)]?.rgb;
    assert.ok(glowRgb);
    const distance =
      Math.abs(glow.r - glowRgb.r) + Math.abs(glow.g - glowRgb.g) + Math.abs(glow.b - glowRgb.b);
    assert.ok(distance < 90);
  });

  it("shifts the mesh when motion origin moves", () => {
    const state = createInitialState();
    const moved = shiftedPalette({
      ...state,
      motion: { ...state.motion, originX: 62, originY: 41 },
    });
    assert.equal(moved.glow.x, state.palette.glow.x + 12);
    assert.equal(moved.glow.y, state.palette.glow.y - 9);
  });
});
