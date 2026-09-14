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
   * /thank-you. On the home page "/#problem" is still a same-document jump.
   */
  homeHref: "/#main",
  links: [
    { label: "The Problem", href: "/#problem" },
    { label: "What Breaks", href: "/#changes" },
    { label: "Assessment", href: "/#building" },
    { label: "Deliverables", href: "/#deliverables" },
    { label: "Responsibility", href: "/#authority" },
    { label: "For Teams", href: "/#status" },
  ],
  cta: "Request Assessment",
  ctaHref: "/#waitlist",
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

export const problem = {
  headline: "The API can keep working while your product quietly changes.",
  body: [
    "Replacing an AI model is not the same as upgrading an ordinary software dependency. The candidate may return valid, convincing responses while changing behavior your customers, workflows, or business rules depend on.",
    "Traditional tests may confirm that the request succeeds, the schema is valid, and the service remains online. They may not reveal that instructions are interpreted differently, tool arguments move, refusals shift, or the business outcome changes.",
  ],
  simpleQuestion: "Does the new model work?",
  realQuestion:
    "What changed in our actual system, does it matter, and is the available evidence strong enough to support proceeding?",
} as const;

export type DiffSegment = { text: string; changed?: boolean };
export type DiffLine = {
  segments: DiffSegment[];
  dim?: boolean;
  lit?: boolean;
  ind?: boolean;
};

export const changeDiffLabels = {
  example: "Example request",
  current: "Current behavior",
  candidate: "Candidate behavior",
} as const;

export const changeExplorer = {
  headline: "See what breaks.",
  intro:
    "A replacement can return polished, valid responses while changing behavior the product depends on. Choose a pattern to compare the current and candidate behavior.",
  patterns: [
    {
      name: "Tool argument drift",
      summary: "The right tool receives different arguments.",
      what:
        "Numbers become strings, optional fields disappear, enum casing changes, or dates use a different format even though the tool call still validates.",
      why:
        "The request succeeds at the model boundary. The break appears later when application logic depends on the missing or changed value.",
    },
    {
      name: "Call-shape change",
      summary: "One interaction becomes several calls, or the reverse.",
      what:
        "The candidate splits one tool call into a sequence, emits several calls at once, or uses a different route to produce the same visible answer.",
      why:
        "The final response can look correct while retries, side effects, agent state, or downstream assumptions change.",
    },
    {
      name: "Refusal-boundary shift",
      summary: "A different slice of legitimate traffic gets refused.",
      what:
        "A domain, phrasing, or document type the current model handles begins receiving a refusal, or previously refused traffic starts receiving an answer.",
      why:
        "A narrow but business-critical group of users can be affected without moving a broad average enough to attract attention.",
    },
    {
      name: "Instruction-priority change",
      summary: "Competing instructions resolve differently.",
      what:
        "A message the current model ignores starts winning, or a higher-priority constraint stops controlling formatting or workflow behavior.",
      why:
        "Each instruction may work in isolation. The changed priority is what alters the product outcome.",
    },
    {
      name: "Silent truncation",
      summary: "The response stays valid but loses required content.",
      what:
        "A longer answer reaches an output limit, drops a required delimiter, or ends before every requested item is present.",
      why:
        "The API still reports success. The missing content appears only when a parser, customer, or business rule needs it.",
    },
    {
      name: "Semantic drift",
      summary: "The answer sounds right while its effect changes.",
      what:
        "The candidate hedges where the current model commits, changes an operational outcome, or uses language that downstream automation reads differently.",
      why:
        "Fluent wording can hide the one difference that changes what the product actually does.",
    },
    {
      name: "Cost-per-task change",
      summary: "A cheaper model costs more after retries and extra work.",
      what:
        "The candidate is cheaper per token but takes more turns, writes longer answers, retries more often, or invokes extra tools to finish the task.",
      why:
        "Token price is not the operating unit. The engineering owner pays for the completed task.",
    },
    {
      name: "Reliability change",
      summary: "Average quality holds while repeated attempts vary more.",
      what:
        "The candidate works on average but produces a wider spread of outcomes across equivalent runs, including occasional failures on important cases.",
      why:
        "One replay can look fine while repeated use reveals behavior the workflow cannot depend on.",
    },
  ],
  closing:
    "These are illustrative patterns, not customer results. A real assessment stays bounded to the customer’s workflow, evidence, and agreed conditions.",
} as const;

export type ChangePatternName = (typeof changeExplorer.patterns)[number]["name"];

export const changeDiffs: Record<
  ChangePatternName,
  { example: string; current: DiffLine[]; candidate: DiffLine[] }
> = {
  "Tool argument drift": {
    example: "Book tomorrow’s 3pm sync with the design team.",
    current: [
      { segments: [{ text: "create_event" }] },
      { segments: [{ text: 'time: "15:00"' }], ind: true },
      { segments: [{ text: 'tz: "UTC"' }], ind: true },
      { segments: [{ text: "notify: true" }], ind: true },
    ],
    candidate: [
      { segments: [{ text: "create_event" }] },
      { segments: [{ text: 'time: "15:00"' }], ind: true },
      { segments: [{ text: 'tz: "UTC"' }], ind: true },
      { segments: [{ text: "notify: missing — invites never send", changed: true }], ind: true },
    ],
  },
  "Call-shape change": {
    example: "What is the status of order A-402?",
    current: [
      { segments: [{ text: 'One call — get_order("A-402")' }] },
      { segments: [{ text: '"Shipped, arrives Thursday."' }], lit: true },
    ],
    candidate: [
      { segments: [{ text: "Two calls — list_orders, then filter", changed: true }] },
      { segments: [{ text: '"Shipped, arrives Thursday."' }], lit: true },
      { segments: [{ text: "Same answer. Different agent loop.", changed: true }], dim: true },
    ],
  },
  "Refusal-boundary shift": {
    example: "Summarize the termination clauses in this contract.",
    current: [
      { segments: [{ text: '"Termination needs 30 days notice' }], lit: true },
      { segments: [{ text: 'and settles outstanding fees."' }], lit: true },
    ],
    candidate: [
      { segments: [{ text: '"I can’t analyze contracts, but here', changed: true }] },
      { segments: [{ text: 'is some general information…"', changed: true }] },
      { segments: [{ text: "A softened refusal, mid-workflow.", changed: true }], dim: true },
    ],
  },
  "Instruction-priority change": {
    example: "System rule: always answer in German. The customer writes in English.",
    current: [
      { segments: [{ text: '"Ihre Bestellung wurde versandt."' }], lit: true },
      { segments: [{ text: "System rule wins." }], dim: true },
    ],
    candidate: [
      { segments: [{ text: '"Your order has shipped."', changed: true }] },
      { segments: [{ text: "The customer message wins.", changed: true }], dim: true },
    ],
  },
  "Silent truncation": {
    example: "List all 40 line items on this invoice.",
    current: [
      { segments: [{ text: "Items 1 through 40." }], lit: true },
      { segments: [{ text: "Complete." }], dim: true },
    ],
    candidate: [
      { segments: [{ text: "Items 1 through 28." }] },
      { segments: [{ text: '"…and 12 more."', changed: true }] },
      { segments: [{ text: "Nothing marks the missing items.", changed: true }], dim: true },
    ],
  },
  "Semantic drift": {
    example: "Is this transaction fraud? Answer yes or no.",
    current: [{ segments: [{ text: '"Yes."' }], lit: true }],
    candidate: [
      { segments: [{ text: '"It shows several suspicious', changed: true }] },
      { segments: [{ text: 'indicators, though context…"', changed: true }] },
      { segments: [{ text: "The automation expected a decision.", changed: true }], dim: true },
    ],
  },
  "Cost-per-task change": {
    example: "Summarize this support thread.",
    current: [
      { segments: [{ text: "One pass, summary returned." }], lit: true },
      { segments: [{ text: "145 tokens." }], dim: true },
    ],
    candidate: [
      { segments: [{ text: "Four passes — plans, retries, re-checks.", changed: true }] },
      { segments: [{ text: "3,241 tokens for the same summary.", changed: true }], dim: true },
    ],
  },
  "Reliability change": {
    example: "Route the same urgent billing case five times.",
    current: [
      { segments: [{ text: "billing_escalation × 5" }], lit: true },
      { segments: [{ text: "Consistent across repeated attempts." }], dim: true },
    ],
    candidate: [
      { segments: [{ text: "billing_escalation × 3", changed: true }] },
      { segments: [{ text: "general_support × 2", changed: true }] },
      { segments: [{ text: "The average hides unstable routing.", changed: true }], dim: true },
    ],
  },
};

export const building = {
  headline: "A focused assessment for one model change.",
  body:
    "Hajer keeps the engagement tied to one concrete production decision and the evidence available for it.",
  focusLabel: "The engagement stays bounded",
  focus: [
    "One agreed migration scope",
    "The production behavior your team depends on",
    "Observed changes in the candidate",
    "Limitations in the available evidence",
  ],
  boundary:
    "Hajer will not rank every model, choose the customer’s provider, certify a system as safe, or authorize a release.",
} as const;

export const deliverables = {
  label: "What you receive",
  headline: "A clear record for the decision in front of you.",
  intro: "Each assessment stays tied to one agreed migration scope.",
  items: [
    {
      title: "Scoped findings",
      copy: "A focused account of the agreed migration scope.",
    },
    {
      title: "Observed changes",
      copy: "A clear record of what changed and what remained consistent.",
    },
    {
      title: "Explicit limitations",
      copy: "What the available evidence could not determine.",
    },
    {
      title: "Recommended next action",
      copy: "The next step supported by the findings and remaining uncertainty.",
    },
  ],
  authority: "Your team retains authority over model choice, deployment, and release.",
} as const;

export const authority = {
  headline: "We assess. You decide.",
  intro:
    "Hajer can provide a defensible basis for a production decision without becoming the customer’s release authority.",
  hajerLabel: "Hajer’s responsibility",
  hajer: [
    "Examine the supplied evidence independently",
    "Design and challenge the assessment method",
    "Preserve configurations, provenance, and limitations",
    "Separate observations from supported attribution",
    "Disclose incomplete or inconclusive evidence",
    "Recommend the smallest responsible next action",
  ],
  customerLabel: "The customer’s responsibility",
  customer: [
    "Authorize access to relevant evidence",
    "Confirm the baseline and candidate under review",
    "Confirm business obligations and unacceptable outcomes",
    "Correct missing or inaccurate business context",
    "Decide which risks are acceptable",
    "Authorize, delay, or reject the production change",
  ],
  closing:
    "Hajer does not choose the customer’s model, deploy it, certify it, or press the release button.",
} as const;

export const verdict = {
  headline: "A traceable decision record—not “Model B won.”",
  intro:
    "The decision record gives the engineering owner a clear account of the migration, with every conclusion tied to the evidence and limitations behind it.",
  bounded:
    "A responsible conclusion may support proceeding, require further review, identify a blocker, or state that the evidence is insufficient. Uncertainty is not converted into a passing score.",
  recordLabel: "Decision record",
  states: [
    "What was assessed",
    "Which baseline and candidate configurations were used",
    "What evidence was available—and what it represented",
    "What remained consistent",
    "What materially changed",
    "Which agreed conditions were satisfied or violated",
    "What could not be determined",
    "What should happen next",
  ],
  scenario: {
    label: "Constructed example",
    headline: "The support agent that still looked correct.",
    body:
      "A candidate model connects correctly and gives polished answers, but stops handing a narrow class of refund questions to a human. Hajer’s job is to show the changed behavior, the agreed condition it affected, the supporting evidence, and the limits of what was tested.",
    disclaimer: "Illustrative only. This is not a customer result.",
  },
} as const;

export const status = {
  headline: "Built for one consequential model change.",
  intro:
    "Hajer is for technical founders, CTOs, and engineering leaders who own a production model change and need a defensible basis for the decision.",
  focusLabel: "The engagement stays narrow",
  focus: [
    "One production workflow",
    "One accepted baseline",
    "One candidate configuration",
    "One traceable decision record",
  ],
  fitLabel: "Strongest fit",
  fit: [
    "An AI workflow already runs in production",
    "A model change has become a real engineering decision",
    "An accountable technical owner keeps release authority",
    "Authorized workflow evidence is available for assessment",
  ],
  nextLabel: "Start with the migration",
  next:
    "Tell us which model change your team is evaluating, why it matters, and what evidence exists in the workflow today.",
} as const;

export const faq = {
  headline: "Questions engineering leaders ask first.",
  items: [
    {
      q: "What is Hajer?",
      a: "Hajer is an independent, founder-led model-migration assessment for engineering teams that need to evaluate one production AI change.",
    },
    {
      q: "What kind of change is in scope?",
      a: "One concrete production AI change: a defined workflow, the behavior the current configuration already produces, and one candidate configuration the engineering owner needs to evaluate.",
    },
    {
      q: "What evidence would Hajer use?",
      a: "Authorized, replayable evidence from the customer’s real workflow. During scoping, both sides establish what the evidence represents, what is missing, and which conclusions it could responsibly support.",
    },
    {
      q: "What happens when the evidence is incomplete?",
      a: "The record separates supported findings from missing, uncertain, or out-of-scope questions. If the evidence cannot support a conclusion, Hajer says so.",
    },
    {
      q: "Will Hajer choose or approve the replacement model?",
      a: "No. The customer defines the candidate and keeps authority for model choice, deployment, release, and production monitoring.",
    },
    {
      q: "Does the assessment eliminate migration risk?",
      a: "No. Testing cannot prove the absence of every untested failure. Hajer’s role is to show what was assessed, what the evidence supports, and which limitations or risks remain.",
    },
  ],
} as const;

export const waitlist = {
  headline: "Bring us the model change your team needs to defend.",
  body:
    "We want to speak with technical founders, CTOs, and engineering leaders evaluating a real AI-system change—whether driven by cost, latency, capability, provider availability, or product requirements.",
  note: "Assessments are scoped directly with the engineering owner responsible for the change.",
  submitLabel: "Request an assessment",
  consent:
    "By joining, you agree to receive Hajer product updates. You can unsubscribe at any time.",
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
  exploreLabel: "Explore",
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

/** Cookie notice. One sentence, two choices; see components/consent. */
export const consent = {
  region: "Cookie consent",
  body: "We use analytics cookies to understand how this site is used.",
  privacyLabel: "Privacy policy",
  privacyHref: "/privacy",
  accept: "Accept",
  decline: "Decline",
  manage: "Cookie preferences",
} as const;
