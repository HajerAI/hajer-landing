/**
 * HAJER MARK + LOCKUP
 *
 * ── THE MARK (brand-locked, do not alter) ──────────────────────────────────
 * Reconstructed from the brand board construction grid (panel 13).
 * Grid: base unit u. Overall 10u × 8u.
 *   rail (current)   2u wide, 8u tall
 *   clear space      2u
 *   boundary         2u square, 0.375u stroke
 *   clear space      2u
 *   rail (candidate) 2u wide, 8u tall
 *   step line        ~0.875u stroke, all joins 90°
 * With u = 16 the viewBox is 160 × 128 and every edge lands on the grid.
 *
 * Semantics: current model → evidence boundary → one observed behavioral
 * step → candidate model. The mark represents comparison, not release control.
 *
 * ── THE LOCKUP (two-tier, monochrome) ──────────────────────────────────────
 * The company is Hajer. `hajer.ai` is a domain, never the name, so the old
 * `Hajer` + vermilion period + mono `ai` wordmark is retired. What made that
 * wordmark work was never the dot — it was Geist Semibold set against tracked
 * JetBrains Mono. Tier 2 reproduces that exact contrast and says something
 * true instead of naming a TLD.
 *
 *   Tier 1  `Hajer`  — Geist Sans 600, sentence case, tracking −0.03em.
 *                      White on dark, Void on Paper. NO VERMILION, EVER.
 *                      The mark's candidate rail is the lockup's only colour.
 *   Tier 2  category — JetBrains Mono 500, uppercase, +0.18em, 0.33× tier 1,
 *                      floor 10px. Muted on dark, Graphite on Paper.
 *
 * Tier 2 renders ONCE per surface — the footer lockup only. The nav suppresses
 * it (`showCategory` defaults to false).
 *
 * ── SIZING ─────────────────────────────────────────────────────────────────
 * One number drives the whole lockup. Given mark height h, u = h / 8:
 *   mark      h tall × 10u wide          wordmark  h / 1.2
 *   gap       3u  (NOT 4u — `gap-3` was wrong)     category  0.33 × wordmark
 * Nav    h = 24 → mark 24×30, wordmark 20px, gap 9px,  category suppressed.
 * Footer h = 40 → mark 40×50, wordmark 33px, gap 15px, category 11px.
 * Geometry is applied as inline style so it cannot drift with utility classes.
 */

import type { CSSProperties } from "react";
import { site } from "@/content/site";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type Tone = "ink" | "inverse" | "mono" | "mono-inverse" | "accent";

const TONES: Record<Tone, { rail: string; candidate: string }> = {
  /* Void rails on light surfaces. The candidate rail MUST be the ink
     vermilion here: #FF5A36 is 2.75:1 on Paper and fails even the 3:1
     non-text threshold. #B83512 is 5.23:1. */
  ink: { rail: "#090B0D", candidate: "#B83512" },
  // White rails on dark surfaces, signal vermilion candidate rail.
  inverse: { rail: "#FFFFFF", candidate: "#FF5A36" },
  // Pure monochrome (panel 07)
  mono: { rail: "#090B0D", candidate: "#090B0D" },
  "mono-inverse": { rail: "#FFFFFF", candidate: "#FFFFFF" },
  // Signal-vermilion accent (panel 06). Dark surfaces only.
  accent: { rail: "#FF5A36", candidate: "#FF5A36" },
};

/** Tones that sit on a light surface — Paper, or any white master. */
const LIGHT_TONES: readonly Tone[] = ["ink", "mono"];

export function HajerMark({
  tone = "inverse",
  className,
  style,
  title = "Hajer",
  decorative = false,
}: {
  tone?: Tone;
  className?: string;
  style?: CSSProperties;
  title?: string;
  decorative?: boolean;
}) {
  const { rail, candidate } = TONES[tone];

  return (
    <svg
      viewBox="0 0 160 128"
      className={className}
      style={style}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {!decorative && <title>{title}</title>}

      {/* current model rail */}
      <rect x="0" y="0" width="32" height="128" fill={rail} />

      {/* controlled crossing: rail → step up → evidence boundary */}
      <path
        d="M32 102 H48 V76 H64"
        stroke={rail}
        strokeWidth="14"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />

      {/* evidence boundary */}
      <rect x="67" y="63" width="26" height="26" stroke={rail} strokeWidth="6" />

      {/* behavioral step: boundary → step up → candidate */}
      <path
        d="M96 76 H112 V50 H128"
        stroke={rail}
        strokeWidth="14"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />

      {/* candidate model rail — the only licensed colour in the lockup */}
      <rect x="128" y="0" width="32" height="128" fill={candidate} />
    </svg>
  );
}

/** Mark height in px for each surface. Everything else derives from it. */
const MARK_HEIGHT = { nav: 24, footer: 40 } as const;

export function HajerLockup({
  tone = "inverse",
  size = "footer",
  markHeight,
  showCategory = false,
  className,
  markClassName,
  wordClassName,
}: {
  tone?: Tone;
  /** Surface preset. `nav` = 24px mark, `footer` = 40px mark. */
  size?: keyof typeof MARK_HEIGHT;
  /** Explicit mark height in px. Overrides `size`. */
  markHeight?: number;
  /** Tier 2. Licensed on the footer lockup only — once per surface. */
  showCategory?: boolean;
  className?: string;
  /** Incidental classes only — geometry comes from `size`/`markHeight`. */
  markClassName?: string;
  wordClassName?: string;
}) {
  const h = markHeight ?? MARK_HEIGHT[size];
  const u = h / 8;
  const wordSize = h / 1.2;
  const categorySize = Math.max(10, wordSize * 0.33);

  const isLight = LIGHT_TONES.includes(tone);

  return (
    <span
      className={cx("inline-flex items-center", className)}
      style={{ gap: `${u * 3}px` }}
    >
      <HajerMark
        tone={tone}
        decorative
        className={cx("block shrink-0", markClassName)}
        style={{ height: `${h}px`, width: `${h * 1.25}px` }}
      />

      <span
        className="inline-flex flex-col"
        style={showCategory ? { gap: `${u * 1.2}px` } : undefined}
      >
        {/* Tier 1. Monochrome by contract. */}
        <span
          className={cx(
            "font-sans font-semibold leading-none tracking-[-0.03em]",
            isLight ? "text-void" : "text-white",
            wordClassName,
          )}
          style={{ fontSize: `${wordSize}px` }}
        >
          {site.name}
        </span>

        {/* Tier 2. Footer only. */}
        {showCategory ? (
          <span
            className={cx(
              "font-mono font-medium uppercase leading-none tracking-[0.18em]",
              isLight ? "text-graphite" : "text-muted",
            )}
            style={{ fontSize: `${categorySize}px` }}
          >
            {site.category}
          </span>
        ) : null}
      </span>
    </span>
  );
}

export default HajerMark;
