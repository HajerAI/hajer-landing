/**
 * PostHog project (EU cloud). The token is public by design: it identifies
 * the project and can only write events. Shared by instrumentation-client.ts
 * (browser) and lib/posthog-server.ts (Node) so the two can never drift.
 */
export const POSTHOG_PROJECT_TOKEN = "phc_v5g7amb8U5dw8ZmcM8YpSpnYwYhH5pLouSz5v6ZbDNaK";
export const POSTHOG_HOST = "https://eu.i.posthog.com";
