import { ImageResponse } from "next/og";

/**
 * iOS home-screen icon.
 *
 * Geometry mirrors components/brand/HajerMark.tsx exactly (viewBox 0 0 160 128,
 * 16px base unit). Tone: inverse — white rails on void, vermilion candidate rail.
 * Margins are generous because iOS masks the corners of this square.
 */

// Rendered once at build time: the site is a static export (next.config.ts).
export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const VOID = "#090B0D";
const RAIL = "#FFFFFF";
const CANDIDATE = "#FF5A36";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: VOID,
        }}
      >
        <svg
          width={130}
          height={104}
          viewBox="0 0 160 128"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* current model rail */}
          <rect x="0" y="0" width="32" height="128" fill={RAIL} />
          {/* controlled crossing: rail -> step up -> gate */}
          <path
            d="M32 102 H48 V76 H64"
            fill="none"
            stroke={RAIL}
            strokeWidth="14"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />
          {/* evidence boundary */}
          <rect
            x="67"
            y="63"
            width="26"
            height="26"
            fill="none"
            stroke={RAIL}
            strokeWidth="6"
          />
          {/* behavioral step: gate -> step up -> candidate */}
          <path
            d="M96 76 H112 V50 H128"
            fill="none"
            stroke={RAIL}
            strokeWidth="14"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />
          {/* candidate model rail */}
          <rect x="128" y="0" width="32" height="128" fill={CANDIDATE} />
        </svg>
      </div>
    ),
    { ...size },
  );
}
