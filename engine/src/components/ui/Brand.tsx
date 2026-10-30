import { Img, staticFile } from "remotion";
import { COLORS, FONTS } from "../../theme";
import brand from "@config/brand.json";

export const BrandOverlay = () => (
  <>
    <Img
      src={staticFile("brand/logo.svg")}
      style={{ position: "absolute", top: 28, right: 28, width: 64, height: 64, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.4))" }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 150,
        width: "100%",
        textAlign: "center",
        fontFamily: FONTS.display,
        fontWeight: 700,
        fontSize: 34,
        color: COLORS.white,
        opacity: 0.22,
      }}
    >
      {brand.watermark}
    </div>
  </>
);
