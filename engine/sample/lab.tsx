import { AbsoluteFill } from "remotion";
import { SkinnedHand, SKIN_POSES } from "@lib/components/toon/SkinnedHand";
import { ToonLights, ToonStage } from "@lib/components/toon/toon";

// Asset lab: build and inspect new assets in isolation before placing them in shots. Default content: hand poses. (camera at +Z sees the back of the hand by convention)
export function AssetLab() {
  const poses = Object.entries(SKIN_POSES);
  return (
    <AbsoluteFill style={{ background: "#2a2d38" }}>
      <ToonStage camera={[0, 0, 13]} fov={34}>
        <ToonLights />
        {poses.map(([name, pose], i) => (
          <SkinnedHand key={name} side="right" pose={pose} position={[(i % 2) * 2.6 - 1.3, i < 2 ? 1.2 : -2.6, 0]} scale={0.9} forearm={1.2} />
        ))}
      </ToonStage>
    </AbsoluteFill>
  );
}
