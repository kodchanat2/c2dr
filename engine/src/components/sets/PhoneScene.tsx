import { AbsoluteFill } from "remotion";
import { DepthLayer } from "../style/StyleKit";
import { PhoneInHands } from "../toon/Phone3D";
import { RuinsBackdrop } from "./Wasteland";

export function PhoneScene({ mode, deadAt = 60 }: { mode: "emp" | "cracked"; deadAt?: number }) {
  return (
    <AbsoluteFill style={{ background: "#0d0f18" }}>
      <DepthLayer blur={10}>
        <RuinsBackdrop dark={mode === "cracked" ? 0.85 : 0.6} />
      </DepthLayer>
      <PhoneInHands mode={mode === "emp" ? "lock" : "cracked"} deadAt={deadAt} />
    </AbsoluteFill>
  );
}
