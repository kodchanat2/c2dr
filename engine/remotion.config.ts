// One Remotion project ("engine") renders every clip. The clip is chosen with the CLIP env var
// (folder name under ../clips); without it, the bundled ./sample clip is used.
//   @clip   -> the clip folder (shots.json, storyboard.tsx, lab.tsx, sets/, public/)
//   @lib    -> engine/src (component library)
//   @config -> repo config/ (brand.json)
import path from "node:path";
import { Config } from "@remotion/cli/config";

const ENGINE = process.cwd();
const CLIP_DIR = process.env.CLIP ? path.resolve(ENGINE, "..", "clips", process.env.CLIP) : path.join(ENGINE, "sample");

Config.setVideoImageFormat("jpeg");
Config.setConcurrency(4);
Config.setPublicDir(path.join(CLIP_DIR, "public"));
Config.overrideWebpackConfig((current) => ({
  ...current,
  resolve: {
    ...current.resolve,
    alias: {
      ...(current.resolve?.alias as Record<string, string> | undefined),
      "@clip": CLIP_DIR,
      "@lib": path.join(ENGINE, "src"),
      "@config": path.resolve(ENGINE, "..", "config"),
    },
    // clip files live outside engine/, so let them resolve packages from engine/node_modules
    modules: [...(current.resolve?.modules ?? ["node_modules"]), path.join(ENGINE, "node_modules")],
  },
}));
