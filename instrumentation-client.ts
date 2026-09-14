import posthog from "posthog-js";

import { POSTHOG_BROWSER_API_HOST, POSTHOG_PROJECT_TOKEN, POSTHOG_UI_HOST } from "@/lib/posthog-config";

posthog.init(POSTHOG_PROJECT_TOKEN, {
  // Same-origin path proxied to PostHog by next.config.ts; see lib/posthog-config.ts.
  api_host: POSTHOG_BROWSER_API_HOST,
  ui_host: POSTHOG_UI_HOST,
  defaults: "2026-05-30",
  person_profiles: "identified_only",
  // No cookie, no local or session storage, no banner. Visitors are counted
  // by a hash PostHog computes on its servers from IP, user agent, host and a
  // daily salt (content/legal.ts describes this). Session replay is not
  // available in this mode; the project must have "cookieless server hash
  // mode" enabled or every event is dropped at ingestion.
  cookieless_mode: "always",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});
