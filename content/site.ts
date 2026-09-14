/**
 * Document-shell metadata shared by Next and the Hajer brand mark.
 *
 * Visitor-facing page copy belongs to content/copy.ts, which is the Replit
 * frontend's single source of truth. Keeping this file deliberately small
 * prevents the discarded frontend from becoming a competing copy source.
 */
export const site = {
  name: "Hajer",
  category: "Eval & Harness Maintenance Agent",
  title: "Hajer — The agent that maintains your evals and harnesses",
  tagline: "Nobody maintains their evals. Hajer does.",
  description:
    "Hajer is an agent that keeps your evals and harnesses in step with your product—adding cases for what changed, retiring what’s dead, and telling you when something actually broke.",
  url: "https://hajer.ai",
} as const;
