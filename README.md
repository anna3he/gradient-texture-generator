# Vellum

A browser studio for wash-heavy gradients with a bright glow, a light grain finish, and a live S-curve warp.

The control panel is built with the [DialKit](https://www.dialkit.dev/) design system — same sliders, toggles, selects, folders, and type hierarchy.

## Features

- **Arc** is the default: a squiggly field through three draggable color points (glow, deep, wash). Click a point to recolor it.
- Linear and radial stay available. Conic is gone.
- Mix is wash-first — about 60% wash, 20% glow, 10% deep — with a brighter, more saturated glow.
- Named style presets: Sea, Sunrise, Dawn, Dusk, Ember, Mist, Sage, Linen
- Optional grain: on/off and opacity
- Play/stop plus speed. Speed bends the field into traveling S-shaped lines instead of spinning a straight gradient.
- Export **PNG at 2×** or **copy CSS** (arc CSS is a layered approximation; PNG is the source of truth)

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43217](http://127.0.0.1:43217).
