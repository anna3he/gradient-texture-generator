import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hexToHsl, wrapHue } from "./color";
import { generateStops } from "./harmony";
import type { Harmony } from "./types";

const HARMONIES: Harmony[] = [
  "analogous",
  "complementary",
  "split-complementary",
  "triadic",
  "monochromatic",
];

describe("generateStops", () => {
  for (const harmony of HARMONIES) {
    it(`keeps ${harmony} hues inside the scheme`, () => {
      const stops = generateStops({
        harmony,
        stopCount: 5,
        lockHue: true,
        baseHue: 40,
        satMin: 30,
        satMax: 70,
        lightMin: 25,
        lightMax: 75,
      });

      assert.equal(stops.length, 5);
      for (const stop of stops) {
        const hsl = hexToHsl(stop.color);
        assert.ok(hsl);
        assert.ok(hsl.s >= 25 && hsl.s <= 75);
        assert.ok(hsl.l >= 20 && hsl.l <= 80);

        const delta = Math.min(
          Math.abs(wrapHue(hsl.h - 40)),
          360 - Math.abs(wrapHue(hsl.h - 40))
        );

        if (harmony === "monochromatic") {
          assert.ok(delta <= 10);
        } else if (harmony === "analogous") {
          assert.ok(delta <= 50);
        } else if (harmony === "complementary") {
          assert.ok(delta <= 20 || Math.abs(delta - 180) <= 20);
        } else if (harmony === "triadic") {
          const nearest = [0, 120, 240].some(
            (offset) => Math.abs(delta - offset) <= 16 || Math.abs(delta - (360 - offset)) <= 16
          );
          assert.ok(nearest);
        }
      }
    });
  }

  it("respects locked positions when shuffling", () => {
    const stops = generateStops({
      harmony: "analogous",
      stopCount: 3,
      lockHue: true,
      baseHue: 200,
      satMin: 40,
      satMax: 60,
      lightMin: 30,
      lightMax: 70,
      positions: [0, 40, 100],
    });
    assert.deepEqual(
      stops.map((stop) => stop.position),
      [0, 40, 100]
    );
  });
});
