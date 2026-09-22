import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hexToHsl } from "./color";
import { deriveFamily, generatePalette, paletteFromColors, paletteFromGlow, paletteToStops, relatedHues, washLightness } from "./palette";
import { STYLE_PRESETS } from "./presets";

describe("palette", () => {
  it("keeps wash near white", () => {
    for (let i = 0; i < 8; i += 1) {
      const palette = generatePalette(210);
      assert.ok(washLightness(palette) >= 90);
    }
  });

  it("keeps glow and deep on the same undertone", () => {
    const palette = generatePalette(200);
    assert.ok(relatedHues(palette) <= 16);
  });

  it("builds a mixed deep → glow → wash ramp with extra wash", () => {
    const palette = paletteFromColors({
      deep: "#0f3d3a",
      glow: "#2fe0c8",
      wash: "#f4fbfa",
    });
    const stops = paletteToStops(palette, "linear");
    assert.equal(stops[0]?.color, palette.deep.color);
    assert.equal(stops.at(-1)?.color, palette.wash.color);
    const glow = stops.find((stop) => stop.color === palette.glow.color);
    const washStart = stops.find((stop) => stop.color === palette.wash.color)?.position ?? 100;
    assert.ok(glow);
    assert.ok(glow.position > 24 && glow.position < 50);
    assert.ok(washStart <= 64);
  });

  it("builds a centered radial wash → glow → deep ramp", () => {
    const palette = paletteFromColors({
      deep: "#0f3d3a",
      glow: "#2fe0c8",
      wash: "#f4fbfa",
    });
    const stops = paletteToStops(palette, "radial");
    assert.equal(stops[0]?.color, palette.wash.color);
    assert.equal(stops.at(-1)?.color, palette.deep.color);
    const glow = stops.find((stop) => stop.color === palette.glow.color);
    assert.ok(glow);
    assert.ok(glow.position > 30 && glow.position < 60);
  });

  it("derives a brighter glow and a matching deep from one hue", () => {
    const family = deriveFamily("#1e6e68");
    const glow = hexToHsl(family.glow);
    const deep = hexToHsl(family.deep);
    assert.ok(glow && deep);
    assert.ok(glow.l > 54);
    assert.ok(glow.s > 60);
    assert.ok(deep.l < 32);
    assert.ok(relatedHues(paletteFromGlow("#1e6e68")) <= 12);
  });

  it("defaults every named preset to a vivid same-undertone arc", () => {
    for (const preset of STYLE_PRESETS) {
      assert.equal(preset.gradientType, "arc");
      assert.ok(relatedHues(preset.palette) <= 12);
      const glow = hexToHsl(preset.palette.glow.color);
      assert.ok(glow);
      assert.ok(glow.s >= 68);
      assert.ok(glow.l >= 56);
    }
  });
});
