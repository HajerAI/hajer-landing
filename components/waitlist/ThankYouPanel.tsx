"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

import { WaitlistFull } from "@/components/waitlist/WaitlistForms";
import { readCaptureHandoff } from "@/components/waitlist/shared";
import { thankYou, waitlist } from "@/content/copy";

/**
 * What /thank-you shows depends on how the visitor arrived, which only the
 * session handoff knows. The server snapshot is "pending", so SSR and
 * hydration render the same markup; React then reads the real stage from
 * sessionStorage on the client. The record only changes inside a submit
 * handler, never during render, so no subscription is needed.
 *
 *   hero signup            -> "details":  confirmation + prefilled details form
 *   full form with details -> "complete": confirmation + "Details received."
 *   full form, email only  -> "details"
 *   direct visit           -> "none":     confirmation + link home
 */
type Stage = "pending" | "details" | "complete" | "none";

const subscribe = () => () => {};
const serverStage = (): Stage => "pending";

function readStage(): Stage {
  const handoff = readCaptureHandoff();
  if (!handoff?.confirmed) return "none";
  return handoff.detailsSubmitted ? "complete" : "details";
}

export function ThankYouPanel() {
  const stage = useSyncExternalStore<Stage>(subscribe, readStage, serverStage);

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className="border border-[var(--color-ready)] bg-carbon p-8 md:p-12"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-ready)]">
          {thankYou.label}
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-[-0.03em] text-white text-balance md:text-5xl">
          {waitlist.successHeadline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          {waitlist.successBody}
        </p>
      </div>

      {stage === "details" && (
        <section className="mt-10 border border-hairline-strong bg-carbon p-6 sm:p-9 md:p-12">
          <h2 className="text-xl font-medium tracking-[-0.02em] text-white md:text-2xl">
            {thankYou.detailsHeadline}
          </h2>
          <p className="mb-8 mt-3 max-w-2xl text-base leading-7 text-muted">
            {thankYou.detailsBody}
          </p>
          <WaitlistFull onSuccess="inline" />
        </section>
      )}

      {stage === "complete" && (
        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-graphite">
          {thankYou.detailsReceivedHeadline}
        </p>
      )}

      <p className="mt-10">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm font-medium text-white transition-colors hover:text-vermilion"
        >
          {thankYou.homeLabel}
        </Link>
      </p>
    </>
  );
}
