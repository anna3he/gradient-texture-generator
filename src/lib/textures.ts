import type { BlendMode, TextureId } from "./types";

export type TextureAsset = {
  id: Exclude<TextureId, "none">;
  name: string;
  blurb: string;
  src: string;
  recommendedBlend: BlendMode;
};

export const TEXTURE_LIBRARY: TextureAsset[] = [
  {
    id: "tracing-paper",
    name: "Tracing paper",
    blurb: "Translucent fibers, cool and slightly cloudy.",
    src: "/textures/tracing-paper.png",
    recommendedBlend: "multiply",
  },
  {
    id: "vellum",
    name: "Vellum",
    blurb: "Warmer pulp, more tooth than tracing paper.",
    src: "/textures/vellum.png",
    recommendedBlend: "multiply",
  },
  {
    id: "canvas-weave",
    name: "Canvas",
    blurb: "Woven warp and weft for a painted-ground feel.",
    src: "/textures/canvas-weave.png",
    recommendedBlend: "overlay",
  },
  {
    id: "film-grain",
    name: "Film grain",
    blurb: "Scanned-style silver halide clumps.",
    src: "/textures/film-grain.png",
    recommendedBlend: "soft-light",
  },
];

export const TEXTURE_BY_ID = Object.fromEntries(
  TEXTURE_LIBRARY.map((texture) => [texture.id, texture])
) as Record<Exclude<TextureId, "none">, TextureAsset>;
