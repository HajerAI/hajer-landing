"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import posthog from "posthog-js";

import { consent as copy } from "@/content/copy";
import {
  clearConsent,
  expireGaCookies,
  readConsent,
  subscribeConsent,
  writeConsent,
  type ConsentStatus,
} from "@/lib/consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * The banner and the gate read the same store. The server snapshot differs on
 * purpose: the banner renders nothing during SSR and hydration (no flash for
 * returning visitors, no layout cost), while the gate treats the server as
 * "pending" so analytics never load before the client has read the decision.
 */
function useConsent(serverSnapshot: ConsentStatus | null) {
  return useSyncExternalStore<ConsentStatus | null>(
    subscribeConsent,
    readConsent,
    () => serverSnapshot,
  );
}

/** Push a decision into Google Analytics and PostHog. Safe if PostHog never initialised. */
function applyConsent(status: ConsentStatus): void {
  const granted = status === "granted";
  window.gtag?.("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
  if (!granted) expireGaCookies();
  if (!posthog.__loaded) return;
  if (granted) {
    // Persistence on, queue on, session replay starts, $opt_in + $pageview.
    posthog.opt_in_capturing();
  } else if (status === "denied") {
    // ph_* storage removed; events continue under the cookieless sentinel.
    posthog.opt_out_capturing();
  } else {
    // Back to pending: events are dropped and storage stays empty.
    posthog.clear_opt_in_out_capturing();
  }
}

/** Renders its children only once the visitor has accepted analytics. */
export function ConsentGate({ children }: { children: ReactNode }) {
  return useConsent("pending") === "granted" ? <>{children}</> : null;
}

const BANNER_ID = "cookie-consent";

export function CookieBanner() {
  const status = useConsent(null);

  useEffect(() => {
    // hajer:consent is the source of truth. Heal PostHog when the two disagree
    // (token rotated, or PostHog was not loaded when the visitor clicked).
    if (!posthog.__loaded) return;
    const stored = readConsent();
    if (stored !== posthog.get_explicit_consent_status()) applyConsent(stored);
  }, []);

  if (status !== "pending") return null;

  const decide = (choice: "granted" | "denied") => {
    writeConsent(choice);
    applyConsent(choice);
  };

  return (
    <section
      id={BANNER_ID}
      role="region"
      aria-label={copy.region}
      tabIndex={-1}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline-strong bg-carbon px-6 py-4 sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-[360px] sm:border sm:p-5"
    >
      <p className="text-sm leading-6 text-muted">
        {copy.body}{" "}
        <Link
          href={copy.privacyHref}
          prefetch={false}
          className="text-white underline underline-offset-4 transition-colors hover:text-vermilion"
        >
          {copy.privacyLabel}
        </Link>
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => decide("granted")}
          className="inline-flex min-h-11 items-center bg-white px-4 py-2 text-sm font-medium text-void transition-colors hover:bg-vermilion"
        >
          {copy.accept}
        </button>
        <button
          type="button"
          onClick={() => decide("denied")}
          className="inline-flex min-h-11 items-center px-2 text-sm text-muted transition-colors hover:text-white"
        >
          {copy.decline}
        </button>
      </div>
    </section>
  );
}

/** Footer control: withdraw the current choice and show the banner again. */
export function ManageCookiesButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        // Revoke first so nothing keeps running while the visitor decides.
        applyConsent("pending");
        clearConsent();
        requestAnimationFrame(() => document.getElementById(BANNER_ID)?.focus());
      }}
    >
      {copy.manage}
    </button>
  );
}
