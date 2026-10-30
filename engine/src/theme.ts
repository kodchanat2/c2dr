import { loadFont as loadKanit } from "@remotion/google-fonts/Kanit";
import { loadFont as loadPlexThai } from "@remotion/google-fonts/IBMPlexSansThai";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const FPS = 30;
export const WIDTH = 720;
export const HEIGHT = 1280;

export const COLORS = {
  navyDeep: "#141a2e",
  navy: "#1d2438",
  navyGrid: "rgba(127,167,217,0.10)",
  blueprint: "#7fa7d9",
  cream: "#f4e9d4",
  creamEdge: "#e4d6bb",
  ink: "#1d2438",
  inkSoft: "#5b6275",
  yellow: "#f2c14e",
  red: "#e5484d",
  white: "#ffffff",
  earthSea: "#3a7bd5",
  earthLand: "#7cc47f",
  moon: "#d9d6cf",
  moonShade: "#2a2f40",
  sun: "#ffd36b",
  shirt: "#f2b632",
  skin: "#c98b5e",
  hair: "#1f1a17",
  pants: "#2f3a56",
} as const;

export const FONTS = {
  display: loadKanit("normal", { weights: ["500", "700", "800"], subsets: ["thai", "latin"] }).fontFamily,
  body: loadPlexThai("normal", { weights: ["500", "700"], subsets: ["thai", "latin"] }).fontFamily,
  caps: loadInter("normal", { weights: ["600", "800"], subsets: ["latin"] }).fontFamily,
};

export const LAYOUT = {
  subtitleY: 0.62,
  hudTop: 96,
  gutter: 36,
};
