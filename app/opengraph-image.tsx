import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/**
 * Social preview card (1200x630).
 *
 * Void field, hairline technical grid, the horizontal lockup top-left, the
 * tagline set large, a thin Muted rule, then the category line. Every string
 * comes from content/site.ts.
 *
 * BRAND: the name is "Hajer". No ".ai" suffix and no vermilion dot — the only
 * vermilion on this card is the mark's candidate rail, which is where the
 * accent has always belonged. The rule under the tagline used to be Vermilion
 * too, which made the card carry a sixth accent object and made the sentence
 * above it false; it is Muted now. Mark geometry mirrors
 * components/brand/HajerMark.tsx exactly (viewBox 0 0 160 128, 16px base unit).
 *
 * Lockup proportions follow the brand sheet: wordmark = mark height / 1.2,
 * gap = 3u where the mark is 8u tall.
 *
 * Satori constraints observed here: flexbox only, explicit `display: "flex"` on
 * every element that has children, plain rects and paths, and no font fetched
 * at build time — so the renderer's single-weight default sans is used and
 * `fontWeight` is effectively a no-op. Hierarchy is carried by size, tracking
 * and colour. Swap in a real Geist face here if a weight-bearing card is ever
 * needed.
 */

export const runtime = "nodejs";

export const alt = `${site.name} — ${site.tagline} ${site.category}.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const VOID = "#090B0D";
const RAIL = "#FFFFFF";
const CANDIDATE = "#FF5A36";
const MUTED = "#AEB4BC";
const HAIRLINE = "rgba(243,241,234,0.055)";

const GRID_STEP = 60;

/** Mark is 10:8. Wordmark and gap are derived from its height, per the brand sheet. */
const MARK_HEIGHT = 60;
const MARK_WIDTH = (MARK_HEIGHT * 160) / 128;
const WORD_SIZE = Math.round(MARK_HEIGHT / 1.2);
const LOCKUP_GAP = Math.round(MARK_HEIGHT * 0.375);

/**
 * Satori centres a text box by its line box, not by the glyphs inside it. With
 * `lineHeight: 1` the descender room sits below the baseline, so the visible
 * word rides high against the mark; this nudge puts the two optical centres
 * together. Measured against the rendered PNG, not guessed.
 */
const WORD_OPTICAL_DROP = 4;

// Half-pixel offsets keep the 1px hairlines from straddling two device pixels.
const gridPath = [
  ...Array.from(
    { length: Math.ceil(size.width / GRID_STEP) - 1 },
    (_, i) => `M${(i + 1) * GRID_STEP + 0.5} 0V${size.height}`,
  ),
  ...Array.from(
    { length: Math.ceil(size.height / GRID_STEP) - 1 },
    (_, i) => `M0 ${(i + 1) * GRID_STEP + 0.5}H${size.width}`,
  ),
].join(" ");

/** Break the tagline before its pivot word rather than letting it wrap loosely. */
function taglineLines(tagline: string): string[] {
  const pivot = tagline.indexOf(". ");
  if (pivot <= 0) return [tagline];
  return [tagline.slice(0, pivot + 1), tagline.slice(pivot + 1).trim()];
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          backgroundColor: VOID,
          fontFamily: "sans-serif",
        }}
      >
        {/* thin technical grid */}
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <path d={gridPath} fill="none" stroke={HAIRLINE} strokeWidth="1" />
        </svg>

        {/* lockup: mark + wordmark, monochrome except the candidate rail */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg
            width={MARK_WIDTH}
            height={MARK_HEIGHT}
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

          <div
            style={{
              display: "flex",
              marginLeft: LOCKUP_GAP,
              marginTop: WORD_OPTICAL_DROP,
              fontSize: WORD_SIZE,
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: RAIL,
            }}
          >
            {site.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* tagline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 1040,
              fontSize: 80,
              fontWeight: 600,
              lineHeight: 1.06,
              letterSpacing: "-0.035em",
              color: RAIL,
            }}
          >
            {taglineLines(site.tagline).map((line) => (
              <div key={line} style={{ display: "flex" }}>
                {line}
              </div>
            ))}
          </div>

          {/* rule — Muted, so the candidate rail stays the only accent here */}
          <div
            style={{
              display: "flex",
              width: 148,
              height: 3,
              marginTop: 34,
              backgroundColor: MUTED,
            }}
          />

          {/* category */}
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 22,
              letterSpacing: "0.18em",
              color: MUTED,
            }}
          >
            {site.category.toUpperCase()}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
