/**
 * PostHog project (EU cloud). The token is public by design: it identifies
 * the project and can only write events. Shared by instrumentation-client.ts
 * (browser), lib/posthog-server.ts (Node) and next.config.ts (proxy) so they
 * can never drift.
 *
 * The browser does not talk to PostHog directly. Tracker blocklists match
 * `*.posthog.com`, so posthog-js is pointed at `/ingest` on our own origin and
 * next.config.ts rewrites that to the two PostHog hosts below. The server SDK
 * is never blocked and keeps using POSTHOG_HOST directly.
 */
export const POSTHOG_PROJECT_TOKEN = "phc_v5g7amb8U5dw8ZmcM8YpSpnYwYhH5pLouSz5v6ZbDNaK";
export const POSTHOG_HOST = "https://eu.i.posthog.com";
export const POSTHOG_ASSETS_HOST = "https://eu-assets.i.posthog.com";
export const POSTHOG_UI_HOST = "https://eu.posthog.com";
export const POSTHOG_BROWSER_API_HOST = "/ingest";
