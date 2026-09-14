/**
 * Public website copy. Hajer is marketed through the decision it supports,
 * while customer authority and evidence limits remain explicit.
 */

export const site = {
  name: "Hajer",
  category: "Independent Model-Migration Assessment",
  tagline: "Don’t switch AI models blind. See what breaks first.",
  description:
    "Hajer gives engineering leaders an independent, evidence-backed assessment of one production AI model migration.",
} as const;

export const nav = {
  /**
   * Root-relative fragments so the same links work from /privacy, /terms and
   * /thank-you. On the home page "/#main" is still a same-document jump to the
   * hero, where the inline assessment-request form lives.
   */
  homeHref: "/#main",
  cta: "Request Assessment",
  ctaHref: "/#main",
} as const;

export const hero = {
  headline: "Don’t switch AI models blind. See what breaks first.",
  headlineLead: "Don’t switch AI models\u00a0blind.",
  headlineAction: "See what breaks first.",
  body:
    "Hajer gives engineering leaders an independent assessment of one production model migration. We compare a candidate with the behavior your system already depends on and produce a traceable record of what held, what changed, and what the evidence cannot determine.",
  authority: "Your team keeps the final release decision.",
  microcopy:
    "Founder-led assessments for technical teams evaluating a real model change.",
} as const;

export const runway = {
  label: "Illustrative assessment replay",
  caption:
    "Requests move left to right. Hajer marks concerning changes in orange and removes them from the candidate stream while consistent behavior continues. This illustrates assessment—not runtime enforcement or a customer result.",
  zones: {
    current: "GPT-5",
    gate: "Hajer",
    candidate: "Claude Sonnet 4.5",
  },
  packets: {
    lane1: [
      { label: "score_lead", delay: "0s", status: "success" },
      { label: "route_case", delay: "-4s", status: "success" },
    ],
    lane2: [
      { label: "draft_reply", delay: "-2s", status: "blocked" },
      { label: "analyze_sentiment", delay: "-9.5s", status: "blocked" },
      { label: "triage_ticket", delay: "-6s", status: "success" },
    ],
    lane3: [
      { label: "summarize_call", delay: "-6s", status: "success" },
      { label: "extract_entities", delay: "-1s", status: "success" },
      { label: "parse_invoice", delay: "-10s", status: "success" },
    ],
  },
} as const;

export const waitlist = {
  headline: "Bring us the model change your team needs to defend.",
  body:
    "We want to speak with technical founders, CTOs, and engineering leaders evaluating a real AI-system change—whether driven by cost, latency, capability, provider availability, or product requirements.",
  note: "Assessments are scoped directly with the engineering owner responsible for the change.",
  submitLabel: "Request an assessment",
  consent:
    "By joining, you agree to receive Hajer product updates. You can unsubscribe at any time.",
  privacyLabel: "Privacy policy",
  privacyHref: "/privacy",
  successHeadline: "You’re on the list.",
  successBody:
    "We’ll be in touch as Hajer begins early assessments. If a migration is already under consideration, the optional fields help us understand the fit.",
  fields: {
    emailLabel: "Work email",
    emailPlaceholder: "you@company.com",
    company: { label: "Company", placeholder: "Acme" },
    role: { label: "Role", placeholder: "Engineering lead" },
    tracePlatform: {
      label: "Available workflow evidence",
      placeholder: "Examples, logs, traces, test cases, or not sure",
    },
    currentModel: { label: "Current model", placeholder: "What runs today" },
    candidateModel: { label: "Candidate model", placeholder: "What you’re evaluating" },
    deadline: { label: "Decision timing", placeholder: "Exploring, this quarter, or a hard date" },
    designPartner: { label: "I’m open to discussing a founder-led design-partner assessment" },
  },
} as const;

export const footer = {
  tagline: "Don’t switch AI models blind. See what breaks first.",
  category: "Independent Model-Migration Assessment",
  contactLabel: "Contact",
  email: "hello@hajer.ai",
  emailNote: "Assessments, partnerships, and questions.",
  availability: "Founder-led model-migration assessments",
  copyright: `© ${new Date().getFullYear()} Hajer. All rights reserved.`,
  legalLabel: "Legal",
  privacyLabel: "Privacy",
  termsLabel: "Terms",
} as const;

/** /thank-you: every successful signup lands here. */
export const thankYou = {
  label: "Request received",
  title: "You’re on the list",
  description: "Your Hajer assessment request has been received.",
  detailsHeadline: "Tell us about the migration",
  detailsBody:
    "Optional. If a model change is already under consideration, these details help us understand the fit before we reach out.",
  detailsReceivedHeadline: "Details received.",
  detailsReceivedBody: "Thanks. We’ll read them before we get in touch.",
  homeLabel: "Back to hajer.ai",
} as const;
