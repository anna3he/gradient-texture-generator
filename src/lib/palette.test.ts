import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generatePalette, paletteToStops, relatedHues, washLightness } from "./palette";

describe("palette", () => {
  it("keeps wash near white", () => {
    for (let i = 0; i < 8; i += 1) {
      const palette = generatePalette(210);
      assert.ok(washLightness(palette) >= 90);
    }
  });

  it("keeps glow near the deep hue", () => {
    const palette = generatePalette(200);
    assert.ok(relatedHues(palette) <= 80);
  });

  it("builds a deep → glow → wash stop ramp", () => {
    const palette = {
      deep: "#1c2d9c",
      glow: "#1e6e68",
      wash: "#f5f8fa",
    };
    const stops = paletteToStops(palette);
    assert.equal(stops[0]?.color, palette.deep);
    assert.equal(stops[1]?.color, palette.glow);
    assert.equal(stops.at(-1)?.color, palette.wash);
    assert.equal(stops[0]?.position, 0);
    assert.equal(stops.at(-1)?.position, 100);
  });
});
