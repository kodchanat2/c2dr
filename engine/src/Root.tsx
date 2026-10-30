import { Composition } from "remotion";
import { AssetLab } from "@clip/lab";
import { ReelVideo } from "./Video";
import { buildTimeline } from "./timeline";
import { FPS, HEIGHT, WIDTH } from "./theme";

export function RemotionRoot() {
  return (
    <>
    <Composition id="AssetLab" component={AssetLab} durationInFrames={30} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition
      id="Reel"
      component={ReelVideo}
      durationInFrames={buildTimeline().totalFrames}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    </>
  );
}
