import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generatePalette, paletteFromColors, paletteToStops, relatedHues, washLightness } from "./palette";
import { STYLE_PRESETS } from "./presets";

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

  it("builds a mixed deep → glow → wash ramp", () => {
    const palette = paletteFromColors({
      deep: "#1c2d9c",
      glow: "#1e6e68",
      wash: "#f5f8fa",
    });
    const stops = paletteToStops(palette, "linear");
    assert.equal(stops[0]?.color, palette.deep.color);
    assert.equal(stops.at(-1)?.color, palette.wash.color);
    assert.equal(stops[0]?.position, 0);
    assert.equal(stops.at(-1)?.position, 100);
    const glow = stops.find((stop) => stop.color === palette.glow.color);
    assert.ok(glow);
    assert.ok(glow.position > 30 && glow.position < 60);
  });

  it("builds a centered radial wash → glow → deep ramp", () => {
    const palette = paletteFromColors({
      deep: "#1c2d9c",
      glow: "#1e6e68",
      wash: "#f5f8fa",
    });
    const stops = paletteToStops(palette, "radial");
    assert.equal(stops[0]?.color, palette.wash.color);
    assert.equal(stops.at(-1)?.color, palette.deep.color);
    const glow = stops.find((stop) => stop.color === palette.glow.color);
    assert.ok(glow);
    assert.ok(glow.position > 30 && glow.position < 60);
  });

  it("defaults every named preset to arc", () => {
    for (const preset of STYLE_PRESETS) {
      assert.equal(preset.gradientType, "arc");
      assert.ok(preset.palette.glow.color.startsWith("#"));
    }
  });
});
