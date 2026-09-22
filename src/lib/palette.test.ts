import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hexToHsl } from "./color";
import { deriveFamily, generatePalette, paletteFromColors, paletteToStops, relatedHues, washLightness } from "./palette";
import { STYLE_PRESETS } from "./presets";

describe("palette", () => {
  it("keeps wash near white", () => {
    for (let i = 0; i < 8; i += 1) {
      const palette = generatePalette(210);
      assert.ok(washLightness(palette) >= 90);
    }
  });

  it("pairs glow with a saturated companion deep", () => {
    const family = deriveFamily("#2ad4c0");
    const glow = hexToHsl(family.glow);
    const deep = hexToHsl(family.deep);
    assert.ok(glow && deep);
    assert.ok(glow.l > 52);
    assert.ok(deep.l < 32);
    assert.ok(deep.s >= 55);
    assert.ok(relatedHues(paletteFromColors(family)) > 20);
  });

  it("builds a mixed deep → glow → wash ramp with extra wash", () => {
    const palette = paletteFromColors({
      deep: "#1c2d9c",
      glow: "#2ad4c0",
      wash: "#f5f8fa",
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

  it("nudges interior linear stops without moving the ends", () => {
    const palette = paletteFromColors({
      deep: "#1c2d9c",
      glow: "#2ad4c0",
      wash: "#f5f8fa",
    });
    const rest = paletteToStops(palette, "linear");
    const live = paletteToStops(palette, "linear", 0.8);
    assert.equal(live[0]?.position, 0);
    assert.equal(live.at(-1)?.position, 100);
    const restGlow = rest.find((stop) => stop.color === palette.glow.color)?.position ?? 0;
    const liveGlow = live.find((stop) => stop.color === palette.glow.color)?.position ?? 0;
    assert.ok(Math.abs(liveGlow - restGlow) > 0.2);
  });

  it("builds a centered radial wash → glow → deep ramp", () => {
    const palette = paletteFromColors({
      deep: "#1c2d9c",
      glow: "#2ad4c0",
      wash: "#f5f8fa",
    });
    const stops = paletteToStops(palette, "radial");
    assert.equal(stops[0]?.color, palette.wash.color);
    assert.equal(stops.at(-1)?.color, palette.deep.color);
    const glow = stops.find((stop) => stop.color === palette.glow.color);
    assert.ok(glow);
    assert.ok(glow.position > 30 && glow.position < 60);
  });

  it("keeps studio preset deeps saturated", () => {
    assert.ok(STYLE_PRESETS.length >= 8);
    for (const preset of STYLE_PRESETS) {
      assert.equal(preset.gradientType, "arc");
      const deep = hexToHsl(preset.palette.deep.color);
      const glow = hexToHsl(preset.palette.glow.color);
      assert.ok(deep && glow);
      assert.ok(deep.s >= 22);
      assert.ok(deep.l < 50);
      assert.ok(glow.l >= 48);
    }
    assert.equal(STYLE_PRESETS[0]?.palette.deep.color, "#1c2d9c");
    assert.equal(STYLE_PRESETS[0]?.palette.glow.color, "#2ad4c0");
    assert.ok(!STYLE_PRESETS.some((preset) => preset.id === "sumi"));
  });
});
