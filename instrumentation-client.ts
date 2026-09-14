import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!token || !host) {
  if (process.env.NODE_ENV === "development") {
    const variable = !token
      ? "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN"
      : "NEXT_PUBLIC_POSTHOG_HOST";
    throw new Error(
      `${variable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variable} is configured`,
    );
  }
} else {
  posthog.init(token, {
    api_host: host,
    defaults: "2026-05-30",
    capture_exceptions: true,
    // Nothing is captured or stored until the visitor answers the cookie
    // notice (components/consent). A decline keeps counting under a daily
    // hashed id with no cookie; an accept turns on persistence and replay.
    cookieless_mode: "on_reject",
    // Stated in the privacy policy, so it is pinned here rather than left to
    // the dashboard default.
    session_recording: { maskAllInputs: true },
    debug: process.env.NODE_ENV === "development",
  });
}
