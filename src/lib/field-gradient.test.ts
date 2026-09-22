import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInitialState } from "./default-state";
import {
  buildCurve,
  closestCurveT,
  createFieldContext,
  fieldWarp,
  lerpStops,
  quadraticPoint,
  sampleField,
  warpUV,
} from "./field-gradient";
import { paletteToStops, sortStops } from "./palette";

describe("field gradient", () => {
  it("bends a vertical line into an S", () => {
    const left = warpUV(0.5, 0.15, 0.2, 0.12);
    const mid = warpUV(0.5, 0.5, 0.2, 0.12);
    const right = warpUV(0.5, 0.85, 0.2, 0.12);
    assert.ok(Math.abs(left.u - right.u) > 0.02);
    assert.ok(Math.abs(mid.u - left.u) > 0.005);
  });

  it("places the glow between deep and wash on the arc", () => {
    const palette = createInitialState().palette;
    const mid = quadraticPoint(palette.deep, palette.glow, palette.wash, 0.5);
    assert.ok(mid.x > 0 && mid.x < 1);
    const samples = buildCurve(palette);
    const nearest = closestCurveT(samples, mid.x, mid.y);
    assert.ok(nearest.dist < 0.08);
    assert.ok(nearest.t > 0.2 && nearest.t < 0.8);
  });

  it("keeps wash as the far-field color", () => {
    const state = createInitialState();
    const context = createFieldContext(state);
    const far = sampleField(0.96, 0.08, context);
    const wash = context.wash;
    const distance = Math.abs(far.r - wash.r) + Math.abs(far.g - wash.g) + Math.abs(far.b - wash.b);
    assert.ok(distance < 80);
  });

  it("increases warp when motion is playing", () => {
    const state = createInitialState();
    const rest = fieldWarp(state);
    const live = fieldWarp({
      ...state,
      motion: { ...state.motion, playing: true, speed: 1.6, phase: 0.4 },
    });
    assert.ok(live.amount > rest.amount);
  });

  it("interpolates wash-heavy stops", () => {
    const state = createInitialState();
    const stops = sortStops(paletteToStops(state.palette));
    const colors = stops.map((stop, index) => ({ r: index * 20, g: 10, b: 10 }));
    const late = lerpStops(stops, colors, 1);
    const last = colors.at(-1);
    assert.ok(last);
    assert.equal(Math.round(late.r), last.r);
  });
});
