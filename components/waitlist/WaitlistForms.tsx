"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";

import {
  postWaitlist,
  createIdempotencyKey,
  readCaptureHandoff,
  SYSTEM_COPY,
  THANK_YOU_PATH,
  validateEmailValue,
  writeCaptureHandoff,
} from "@/components/waitlist/shared";
import { thankYou, waitlist } from "@/content/copy";
import {
  EMAIL_MAX,
  FIELD_MAX,
  HONEYPOT_FIELD,
  normalizeEmail,
} from "@/lib/waitlist/schema";

type FormState = "idle" | "submitting" | "success" | "error";

/**
 * Conversion events are captured here, in the browser, and nowhere else.
 * PostHog runs cookieless (instrumentation-client.ts): the visitor's id is a
 * server-side hash the browser never sees, so a server-captured event could
 * not be joined to the pageview that led to it. Properties are flags only;
 * never the address or anything typed into a field.
 */
function reportSignup(
  event: "waitlist_joined" | "waitlist_details_submitted",
  properties: Record<string, boolean | string>,
): void {
  posthog.capture(event, properties);
}

function ConsentNote({ className }: { className: string }) {
  return (
    <p className={className}>
      {waitlist.consent}{" "}
      <Link
        href={waitlist.privacyHref}
        prefetch={false}
        className="underline underline-offset-4 transition-colors hover:text-white"
      >
        {waitlist.privacyLabel}
      </Link>
    </p>
  );
}

export function WaitlistInline() {
  const baseId = useId();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const idempotencyKeyRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);

  function getIdempotencyKey(): string {
    idempotencyKeyRef.current ??=
      readCaptureHandoff()?.idempotencyKey ?? createIdempotencyKey();
    return idempotencyKeyRef.current;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlightRef.current) return;

    const validationError = validateEmailValue(email);
    if (validationError) {
      setState("error");
      setErrorMsg(validationError);
      emailRef.current?.focus();
      return;
    }

    inFlightRef.current = true;
    setState("submitting");
    const address = normalizeEmail(email);
    const idempotencyKey = getIdempotencyKey();
    const result = await postWaitlist(
      {
        email: address,
        source: "hero",
        [HONEYPOT_FIELD]: honeypot,
      },
      idempotencyKey,
    );

    if (result.ok) {
      const previous = readCaptureHandoff();
      writeCaptureHandoff({
        confirmed: true,
        email: address,
        idempotencyKey,
        detailsSubmitted:
          previous?.email === address && previous.detailsSubmitted === true,
      });
      if (honeypot.length === 0) {
        reportSignup("waitlist_joined", { form_location: "hero" });
      }
      // inFlightRef stays true: the page is leaving, and a second click while
      // the transition runs must not re-POST.
      router.push(THANK_YOU_PATH);
      return;
    }

    inFlightRef.current = false;
    setState("error");
    setErrorMsg(result.message || SYSTEM_COPY.unknown);
    emailRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 w-full max-w-xl" noValidate>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden"
      >
        <label htmlFor={`${baseId}-company-website`}>
          {SYSTEM_COPY.honeypotLabel}
        </label>
        <input
          id={`${baseId}-company-website`}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <label htmlFor={`${baseId}-email`} className="mb-2 block text-sm text-muted">
        {waitlist.fields.emailLabel}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-0">
        <input
          ref={emailRef}
          id={`${baseId}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={EMAIL_MAX}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => router.prefetch(THANK_YOU_PATH)}
          placeholder={waitlist.fields.emailPlaceholder}
          className="flex-1 h-12 px-4 bg-void border border-hairline-strong text-white placeholder-muted-dim focus-visible:outline-none focus-visible:border-white transition-colors"
          disabled={state === "submitting"}
          required
          aria-invalid={state === "error" ? true : undefined}
          aria-describedby={state === "error" ? `${baseId}-error` : undefined}
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="h-12 px-6 bg-vermilion text-void font-medium hover:bg-white transition-colors disabled:opacity-50"
        >
          {state === "submitting" ? SYSTEM_COPY.submitting : waitlist.submitLabel}
        </button>
      </div>
      {state === "error" && (
        <p id={`${baseId}-error`} aria-live="polite" className="mt-3 text-danger text-sm">
          {errorMsg}
        </p>
      )}
      <ConsentNote className="mt-3 text-xs leading-5 text-graphite" />
    </form>
  );
}

type WaitlistFullProps = {
  /**
   * "redirect" (home page): a confirmed submit pushes /thank-you.
   * "inline" (thank-you page): the form only adds detail to a signup the
   * server already confirmed. It requires at least one detail and swaps
   * itself for the details-received panel.
   */
  onSuccess?: "redirect" | "inline";
};

export function WaitlistFull({ onSuccess = "redirect" }: WaitlistFullProps) {
  const baseId = useId();
  const router = useRouter();
  const inline = onSuccess === "inline";
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [tracePlatform, setTracePlatform] = useState("");
  const [currentModel, setCurrentModel] = useState("");
  const [candidateModel, setCandidateModel] = useState("");
  const [deadline, setDeadline] = useState("");
  const [designPartner, setDesignPartner] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const idempotencyKeyRef = useRef<string | null>(null);
  const confirmedEmailRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handoff = readCaptureHandoff();
    if (!handoff?.confirmed) return;
    idempotencyKeyRef.current = handoff.idempotencyKey;
    confirmedEmailRef.current = handoff.email;
    queueMicrotask(() => setEmail(handoff.email));
  }, []);

  function getIdempotencyKey(): string {
    idempotencyKeyRef.current ??= createIdempotencyKey();
    return idempotencyKeyRef.current;
  }

  function hasDetails(): boolean {
    return (
      company.trim().length > 0 ||
      role.trim().length > 0 ||
      tracePlatform.trim().length > 0 ||
      currentModel.trim().length > 0 ||
      candidateModel.trim().length > 0 ||
      deadline.trim().length > 0 ||
      designPartner
    );
  }

  function detailPayload(address: string): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      email: address,
      [HONEYPOT_FIELD]: honeypot,
    };
    const values = {
      company,
      role,
      tracePlatform,
      currentModel,
      candidateModel,
      deadline,
    };
    for (const [key, raw] of Object.entries(values)) {
      const value = raw.trim();
      if (value.length > 0) payload[key] = value;
    }
    if (designPartner) payload.designPartner = true;
    return payload;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlightRef.current) return;

    const validationError = validateEmailValue(email);
    if (validationError) {
      setState("error");
      setErrorMsg(validationError);
      emailRef.current?.focus();
      return;
    }

    if (inline && !hasDetails()) {
      setState("error");
      setErrorMsg(SYSTEM_COPY.detailsRequired);
      return;
    }

    inFlightRef.current = true;
    setState("submitting");

    const address = normalizeEmail(email);
    const idempotencyKey = getIdempotencyKey();
    const alreadyConfirmed = confirmedEmailRef.current === address;

    if (!alreadyConfirmed) {
      const capture = await postWaitlist(
        {
          email: address,
          source: "form",
          [HONEYPOT_FIELD]: honeypot,
        },
        idempotencyKey,
      );

      if (!capture.ok) {
        inFlightRef.current = false;
        setState("error");
        setErrorMsg(capture.message || SYSTEM_COPY.unknown);
        emailRef.current?.focus();
        return;
      }

      confirmedEmailRef.current = address;
      writeCaptureHandoff({
        confirmed: true,
        email: address,
        idempotencyKey,
      });
      if (honeypot.length === 0) {
        reportSignup("waitlist_joined", { form_location: "form" });
      }
    }

    if (hasDetails()) {
      const enrichment = await postWaitlist(
        detailPayload(address),
        idempotencyKey,
      );
      if (!enrichment.ok) {
        inFlightRef.current = false;
        setState("error");
        setErrorMsg(
          `${SYSTEM_COPY.detailsFailure} ${enrichment.message || SYSTEM_COPY.unknown}`,
        );
        return;
      }
      writeCaptureHandoff({
        confirmed: true,
        email: address,
        idempotencyKey,
        detailsSubmitted: true,
      });
      if (honeypot.length === 0) {
        reportSignup("waitlist_details_submitted", {
          has_company: company.trim().length > 0,
          has_role: role.trim().length > 0,
          has_trace_platform: tracePlatform.trim().length > 0,
          has_current_model: currentModel.trim().length > 0,
          has_candidate_model: candidateModel.trim().length > 0,
          has_deadline: deadline.trim().length > 0,
          design_partner_interest: designPartner,
        });
      }
    }

    if (!inline) {
      // inFlightRef stays true while the page leaves; see WaitlistInline.
      router.push(THANK_YOU_PATH);
      return;
    }

    inFlightRef.current = false;
    setState("success");
  }

  if (state === "success") {
    return (
      <div
        aria-live="polite"
        role="status"
        className="p-8 border border-[var(--color-ready)] bg-carbon text-white"
      >
        <h3 className="text-xl font-medium mb-2">{thankYou.detailsReceivedHeadline}</h3>
        <p className="text-muted leading-relaxed">{thankYou.detailsReceivedBody}</p>
      </div>
    );
  }

  const submitting = state === "submitting";
  const submitLabel = inline
    ? submitting
      ? SYSTEM_COPY.detailsSubmitting
      : SYSTEM_COPY.detailsSubmit
    : submitting
      ? SYSTEM_COPY.submitting
      : waitlist.submitLabel;
  const textFieldClass =
    "h-12 px-4 bg-void border border-hairline-strong focus-visible:border-white transition-colors";

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${baseId}-email`} className="text-sm text-muted">
            {waitlist.fields.emailLabel} *
          </label>
          <input
            ref={emailRef}
            id={`${baseId}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={EMAIL_MAX}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => {
              if (!inline) router.prefetch(THANK_YOU_PATH);
            }}
            placeholder={waitlist.fields.emailPlaceholder}
            required
            disabled={submitting}
            aria-invalid={state === "error" ? true : undefined}
            aria-describedby={state === "error" ? `${baseId}-error` : undefined}
            className={textFieldClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${baseId}-company`} className="text-sm text-muted">
            {waitlist.fields.company.label}
          </label>
          <input id={`${baseId}-company`} name="company" type="text" maxLength={FIELD_MAX} value={company} onChange={e => setCompany(e.target.value)} placeholder={waitlist.fields.company.placeholder} disabled={submitting} className={textFieldClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${baseId}-role`} className="text-sm text-muted">
            {waitlist.fields.role.label}
          </label>
          <input id={`${baseId}-role`} name="role" type="text" maxLength={FIELD_MAX} value={role} onChange={e => setRole(e.target.value)} placeholder={waitlist.fields.role.placeholder} disabled={submitting} className={textFieldClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${baseId}-trace-platform`} className="text-sm text-muted">
            {waitlist.fields.tracePlatform.label}
          </label>
          <input id={`${baseId}-trace-platform`} name="tracePlatform" type="text" maxLength={FIELD_MAX} value={tracePlatform} onChange={e => setTracePlatform(e.target.value)} placeholder={waitlist.fields.tracePlatform.placeholder} disabled={submitting} className={textFieldClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${baseId}-current-model`} className="text-sm text-muted">
            {waitlist.fields.currentModel.label}
          </label>
          <input id={`${baseId}-current-model`} name="currentModel" type="text" maxLength={FIELD_MAX} value={currentModel} onChange={e => setCurrentModel(e.target.value)} placeholder={waitlist.fields.currentModel.placeholder} disabled={submitting} className={textFieldClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${baseId}-candidate-model`} className="text-sm text-muted">
            {waitlist.fields.candidateModel.label}
          </label>
          <input id={`${baseId}-candidate-model`} name="candidateModel" type="text" maxLength={FIELD_MAX} value={candidateModel} onChange={e => setCandidateModel(e.target.value)} placeholder={waitlist.fields.candidateModel.placeholder} disabled={submitting} className={textFieldClass} />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor={`${baseId}-deadline`} className="text-sm text-muted">
            {waitlist.fields.deadline.label}
          </label>
          <input id={`${baseId}-deadline`} name="deadline" type="text" maxLength={FIELD_MAX} value={deadline} onChange={e => setDeadline(e.target.value)} placeholder={waitlist.fields.deadline.placeholder} disabled={submitting} className={textFieldClass} />
        </div>
      </div>

      <label
        htmlFor={`${baseId}-design-partner`}
        className="flex items-center gap-3 text-sm text-muted cursor-pointer select-none mb-2"
      >
        <input
          id={`${baseId}-design-partner`}
          name="designPartner"
          type="checkbox"
          checked={designPartner}
          onChange={e => setDesignPartner(e.target.checked)}
          disabled={submitting}
          className="w-4 h-4 shrink-0 accent-[var(--color-vermilion)]"
        />
        {waitlist.fields.designPartner.label}
      </label>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden"
      >
        <label htmlFor={`${baseId}-company-website`}>
          {SYSTEM_COPY.honeypotLabel}
        </label>
        <input
          id={`${baseId}-company-website`}
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={e => setHoneypot(e.target.value)}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <button
          type="submit"
          disabled={submitting}
          className="h-12 px-8 bg-vermilion text-void font-medium hover:bg-white transition-colors disabled:opacity-50 w-full sm:w-auto shrink-0"
        >
          {submitLabel}
        </button>
        {!inline && (
          <ConsentNote className="text-xs text-graphite text-center sm:text-right max-w-sm ml-auto" />
        )}
      </div>
      {state === "error" && (
        <p id={`${baseId}-error`} aria-live="polite" className="mt-4 text-center text-sm text-danger sm:text-left">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
