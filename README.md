# Vellum

A browser studio for **color-theory gradients** with live grain and paper textures. Shuffle stays inside a real harmony rule (analogous, complementary, split-complementary, triadic, or monochromatic) instead of rolling raw RGB.

## Features

- Linear, radial, and conic gradients with manual stop editing
- Harmony-constrained shuffle, optional locked base hue, saturation/lightness ranges
- Procedural grain: intensity, opacity, size, mono or colored
- Built-in texture library: tracing paper, vellum, canvas weave, film grain
- Canvas presets (16:9, 4:3, 1:1, 9:16, 3:2, OG) plus custom size
- Export **PNG** at a resolution scale, or **copy CSS** for the gradient

## Run locally

```bash
npm install
npm run textures   # regenerates the bundled paper/film tiles
npm run dev
```

Open [http://127.0.0.1:43217](http://127.0.0.1:43217).

## How it works

Harmony generation picks a base hue, then places the other stops on standard color-wheel offsets. Saturation and lightness stay inside the ranges you set so results stay usable instead of neon or muddy.

Grain is a tiled canvas noise pass (overlay / soft-light). Textures are tileable PNG scans generated once and composited with multiply, overlay, soft-light, or screen.

PNG export re-renders the same stack at the chosen canvas size × resolution scale (capped at 8192px). CSS export copies the live gradient string plus comments for grain/texture settings.
