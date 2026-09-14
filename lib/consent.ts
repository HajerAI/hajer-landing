/**
 * ANALYTICS CONSENT.
 *
 * One record decides whether Google Analytics and PostHog may run:
 * `localStorage["hajer:consent"]`, holding "granted" or "denied". Absent means
 * the visitor has not chosen yet. PostHog keeps its own consent flag, but that
 * flag is derived from this one (see components/consent/CookieBanner.tsx),
 * never the other way round: PostHog's key is scoped to the project token, so
 * rotating the token would otherwise silently reset every visitor's choice.
 *
 * This module is deliberately free of React and posthog-js imports so that
 * `node --test` can exercise it with a stubbed `localStorage`, and so that the
 * server (app/api/waitlist/route.ts) can import the sentinel constant.
 */

export type ConsentStatus = "granted" | "denied" | "pending";

export const CONSENT_KEY = "hajer:consent";
export const CONSENT_EVENT = "hajer:consent";

/** posthog-js registers this distinct_id after a decline (cookieless mode). */
export const POSTHOG_COOKIELESS_SENTINEL = "$posthog_cookieless";

function store(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function readConsent(): ConsentStatus {
  try {
    const value = store()?.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : "pending";
  } catch {
    return "pending";
  }
}

function notify(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function writeConsent(status: "granted" | "denied"): void {
  try {
    store()?.setItem(CONSENT_KEY, status);
  } catch {
    // Private mode or quota: the choice still applies to this page load.
  }
  notify();
}

export function clearConsent(): void {
  try {
    store()?.removeItem(CONSENT_KEY);
  } catch {
    // ignore
  }
  notify();
}

/** Same-tab changes arrive via CONSENT_EVENT; other tabs via the storage event. */
export function subscribeConsent(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === CONSENT_KEY) onChange();
  };
  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Expire Google Analytics cookies on withdrawal. gtag only stops writing them
 * once consent is denied; it never removes what it already set. Cookies may
 * have been written for the host or any parent domain, so every candidate is
 * expired.
 */
export function expireGaCookies(): void {
  if (typeof document === "undefined" || typeof location === "undefined") return;
  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));
  if (names.length === 0) return;
  const parts = location.hostname.split(".");
  const domains = [""].concat(
    parts.map((_, index) => parts.slice(index).join(".")).filter((d) => d.includes(".")),
  );
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

/**
 * Google Consent Mode v2 defaults. Injected as a raw inline script at the top
 * of <head> so it runs at parse time, before @next/third-parties calls
 * gtag('config'). A returning visitor who accepted earlier gets "granted" on
 * the very first hit, with no denied-then-granted flip. The ad_* signals are
 * always denied: the site runs no advertising and never asks for it.
 */
export const CONSENT_DEFAULT_SCRIPT = [
  "window.dataLayer=window.dataLayer||[];",
  "function gtag(){dataLayer.push(arguments)}",
  `var c=null;try{c=localStorage.getItem(${JSON.stringify(CONSENT_KEY)})}catch(e){}`,
  'gtag("consent","default",{',
  'analytics_storage:c==="granted"?"granted":"denied",',
  'ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});',
].join("");
