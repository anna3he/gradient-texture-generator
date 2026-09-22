import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generatePalette, paletteFromColors, paletteToStops, punchGlow, relatedHues, washLightness } from "./palette";
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

  it("builds a wash-heavy deep → glow → wash ramp", () => {
    const palette = paletteFromColors({
      deep: "#1c2d9c",
      glow: "#1e6e68",
      wash: "#f5f8fa",
    });
    const stops = paletteToStops(palette);
    assert.equal(stops[0]?.color, palette.deep.color);
    assert.equal(stops.at(-1)?.color, palette.wash.color);
    assert.equal(stops[0]?.position, 0);
    assert.equal(stops.at(-1)?.position, 100);
    const washStart = stops.find((stop) => stop.color === palette.wash.color)?.position ?? 100;
    assert.ok(washStart <= 42);
    assert.ok((stops[2]?.position ?? 0) <= 20);
  });

  it("punches glow brighter and more saturated", () => {
    const punched = punchGlow("#1e6e68");
    assert.notEqual(punched.toLowerCase(), "#1e6e68");
  });

  it("defaults every named preset to arc", () => {
    for (const preset of STYLE_PRESETS) {
      assert.equal(preset.gradientType, "arc");
      assert.ok(preset.palette.glow.color.startsWith("#"));
    }
  });
});
