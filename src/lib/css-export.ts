import type { GeneratorState } from "./types";
import { exportPixelSize } from "./export-size";
import { sortStops } from "./harmony";
import { motionDurationSec } from "./motion";

export { exportPixelSize };

function stopList(state: GeneratorState) {
  return sortStops(state.stops)
    .map((stop) => `${stop.color} ${round(stop.position)}%`)
    .join(", ");
}

function round(value: number) {
  return Number(value.toFixed(1));
}

function origin(state: GeneratorState) {
  return `${round(state.motion.originX)}% ${round(state.motion.originY)}%`;
}

export function gradientCss(state: GeneratorState, animated = false) {
  const stops = stopList(state);
  const at = animated ? "var(--vellum-x) var(--vellum-y)" : origin(state);
  const angle = animated ? "var(--vellum-angle)" : `${round(state.angle)}deg`;

  switch (state.gradientType) {
    case "radial":
      return `radial-gradient(circle at ${at}, ${stops})`;
    case "conic":
      return `conic-gradient(from ${angle} at ${at}, ${stops})`;
    default:
      return `linear-gradient(${angle}, ${stops})`;
  }
}

export function exportCssSnippet(state: GeneratorState) {
  const animate =
    state.motion.playing ||
    state.motion.originX !== 50 ||
    state.motion.originY !== 50;
  const duration = motionDurationSec(state.motion.speed);
  const lines: string[] = [
    `/* Vellum · ${state.harmony} ${state.gradientType} */`,
  ];

  if (state.motion.playing) {
    lines.push(
      `@property --vellum-angle {`,
      `  syntax: "<angle>";`,
      `  inherits: false;`,
      `  initial-value: ${round(state.angle)}deg;`,
      `}`,
      `@property --vellum-x {`,
      `  syntax: "<percentage>";`,
      `  inherits: false;`,
      `  initial-value: ${round(state.motion.originX)}%;`,
      `}`,
      `@property --vellum-y {`,
      `  syntax: "<percentage>";`,
      `  inherits: false;`,
      `  initial-value: ${round(state.motion.originY)}%;`,
      `}`
    );
  }

  lines.push(`.surface {`);
  lines.push(`  background: ${gradientCss(state, state.motion.playing)};`);

  if (state.motion.playing) {
    const spin = state.motion.mode !== "drift";
    const drift = state.motion.mode !== "spin";
    lines.push(
      `  --vellum-angle: ${round(state.angle)}deg;`,
      `  --vellum-x: ${round(state.motion.originX)}%;`,
      `  --vellum-y: ${round(state.motion.originY)}%;`,
      `  animation: vellum-move ${duration}s ${spin && !drift ? "linear" : "ease-in-out"} infinite${spin && drift ? " alternate" : ""};`
    );
  } else if (animate && state.gradientType === "linear") {
    lines.push(
      `  background-size: 160% 160%;`,
      `  background-position: ${origin(state)};`
    );
  }

  if (state.grain.enabled && state.grain.opacity > 0) {
    lines.push(`  /* Grain @ ${round(state.grain.opacity)}% */`);
  }

  lines.push(`}`);

  if (state.motion.playing) {
    const spin = state.motion.mode !== "drift";
    const drift = state.motion.mode !== "spin";
    lines.push(`@keyframes vellum-move {`);
    if (spin && !drift) {
      lines.push(`  to { --vellum-angle: ${round(state.angle + 360)}deg; }`);
    } else if (drift && !spin) {
      lines.push(
        `  0% { --vellum-x: ${round(clampPct(state.motion.originX - 12))}%; --vellum-y: ${round(clampPct(state.motion.originY + 8))}%; }`,
        `  100% { --vellum-x: ${round(clampPct(state.motion.originX + 12))}%; --vellum-y: ${round(clampPct(state.motion.originY - 8))}%; }`
      );
    } else {
      lines.push(
        `  0% { --vellum-angle: ${round(state.angle)}deg; --vellum-x: ${round(clampPct(state.motion.originX - 10))}%; --vellum-y: ${round(clampPct(state.motion.originY + 8))}%; }`,
        `  100% { --vellum-angle: ${round(state.angle + 180)}deg; --vellum-x: ${round(clampPct(state.motion.originX + 10))}%; --vellum-y: ${round(clampPct(state.motion.originY - 8))}%; }`
      );
    }
    lines.push(`}`);
  }

  return lines.join("\n");
}

function clampPct(value: number) {
  return Math.min(96, Math.max(4, value));
}
