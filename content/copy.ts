/**
 * Public website copy. Hajer is an agent that maintains evals and harnesses.
 * The voice is cheeky, but every claim stays modest: the customer still
 * decides what ships, and no eval suite proves the absence of failures.
 */

export const site = {
  name: "Hajer",
  category: "Eval & Harness Maintenance Agent",
  tagline: "Nobody maintains their evals. Hajer does.",
  description:
    "Hajer is an agent that keeps your evals and harnesses in step with your product—adding cases for what changed, retiring what’s dead, and telling you when something actually broke.",
} as const;

export const nav = {
  /**
   * Root-relative fragments so the same links work from /privacy, /terms and
   * /thank-you. On the home page "/#main" is still a same-document jump to the
   * hero, where the inline early-access form lives.
   */
  homeHref: "/#main",
  cta: "Get early access",
  ctaHref: "/#main",
} as const;

export const hero = {
  headline: "Nobody maintains their evals. Hajer does.",
  headlineLead: "Nobody maintains their evals.",
  headlineAction: "Hajer does.",
  body: "Prompts change. Models get swapped. Tools show up. Your evals stay exactly where you left them, green, confident, and wrong. Hajer is an agent that keeps your evals and harnesses in step with your product.",
} as const;

export const waitlist = {
  submitLabel: "Get early access",
  consent:
    "By joining, you agree to receive Hajer product updates. You can unsubscribe at any time.",
  privacyLabel: "Privacy policy",
  privacyHref: "/privacy",
  successHeadline: "You’re in.",
  successBody:
    "We’ll be in touch as Hajer opens up. The optional fields tell us what your evals look like today, so we know what we’re walking into.",
  fields: {
    emailLabel: "Work email",
    emailPlaceholder: "you@company.com",
    company: { label: "Company", placeholder: "Acme" },
    role: { label: "Role", placeholder: "Engineering lead" },
    tracePlatform: {
      label: "What your evals look like today",
      placeholder: "promptfoo, Braintrust, pytest, a spreadsheet, vibes",
    },
    currentModel: {
      label: "Models in production",
      placeholder: "What runs today",
    },
    candidateModel: {
      label: "Models you’re eyeing",
      placeholder: "What you’d switch to if the evals let you",
    },
    deadline: {
      label: "How urgent is this",
      placeholder: "Curious, this quarter, or it’s already on fire",
    },
    designPartner: { label: "I’m open to being a design partner" },
  },
} as const;

export const footer = {
  tagline: "Nobody maintains their evals. Hajer does.",
  category: "Eval & Harness Maintenance Agent",
  contactLabel: "Contact",
  email: "hello@hajer.ai",
  emailNote: "Early access, partnerships, and strong opinions about evals.",
  availability: "Built by people who also stopped maintaining their evals",
  copyright: `© ${new Date().getFullYear()} Hajer. All rights reserved.`,
  legalLabel: "Legal",
  privacyLabel: "Privacy",
  termsLabel: "Terms",
} as const;

/** /thank-you: every successful signup lands here. */
export const thankYou = {
  label: "Request received",
  title: "You’re on the list",
  description:
    "We’ve got your request. Your evals don’t know it yet, but help is coming.",
  detailsHeadline: "Tell us about your setup",
  detailsBody:
    "Optional. A few details about your stack and what’s changing help us figure out where Hajer earns its keep before we reach out.",
  detailsReceivedHeadline: "Details received.",
  detailsReceivedBody: "Thanks. We’ll read them before we get in touch.",
  homeLabel: "Back to hajer.ai",
} as const;
