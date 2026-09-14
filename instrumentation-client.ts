import posthog from "posthog-js";

import { POSTHOG_HOST, POSTHOG_PROJECT_TOKEN } from "@/lib/posthog-config";

posthog.init(POSTHOG_PROJECT_TOKEN, {
  api_host: POSTHOG_HOST,
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
