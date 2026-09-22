# Vellum

A browser studio for smooth color-theory gradients with a light grain finish.

The control panel is built with the [DialKit](https://www.dialkit.dev/) design system — same sliders, toggles, selects, folders, and type hierarchy.

## Features

- **Arc** is the default: a soft mesh through three draggable color points (glow, deep, wash). Click a point to recolor it.
- Linear and radial stay available. Radial is centered: wash → glow → deep from the middle out.
- Colors mix evenly — deep, glow, and wash blur together instead of sitting in hard bands.
- Named style presets: Sea, Sunrise, Dawn, Dusk, Ember, Mist, Sage, Linen
- Optional grain: on/off and opacity
- Play/stop plus speed for a gentle live drift
- Export **PNG at 2×** or **copy CSS**

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43217](http://127.0.0.1:43217).
