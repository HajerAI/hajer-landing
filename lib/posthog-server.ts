import { PostHog } from "posthog-node";

import { POSTHOG_HOST, POSTHOG_PROJECT_TOKEN } from "@/lib/posthog-config";

export function createPostHogClient(): PostHog {
  return new PostHog(POSTHOG_PROJECT_TOKEN, {
    host: POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
    enableExceptionAutocapture: true,
  });
}
