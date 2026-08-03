/**
 * X / Twitter summary_large_image card.
 *
 * Identical to the Open Graph card — one artwork, two meta tags. Re-exported
 * explicitly (rather than with `export * from`) so Next can read the metadata
 * config values off this module.
 */

import OpengraphImage, {
  alt as ogAlt,
  size as ogSize,
  contentType as ogContentType,
} from "./opengraph-image";

export const runtime = "nodejs";

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default function TwitterImage() {
  return OpengraphImage();
}
