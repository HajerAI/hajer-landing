/**
 * Legal documents for hajer.ai. Kept apart from content/copy.ts on purpose:
 * marketing copy has its own truth tests, and legal prose answers to a
 * different standard, accuracy against the code rather than the pitch.
 *
 * Every statement below describes what app/api/waitlist/route.ts,
 * lib/waitlist/*, instrumentation-client.ts, components/waitlist/* and
 * app/layout.tsx actually do. Change the code, change the document, and move
 * the effective date.
 *
 * No entity name beyond "Hajer", no postal address and no named governing
 * jurisdiction yet: those are deliberate omissions until the company details
 * are settled, not placeholders to be filled by hand.
 */

export const LEGAL_CONTACT = "hello@hajer.ai";
export const LEGAL_EFFECTIVE_DATE = "2026-09-14";

export type LegalLink = { label: string; href: string };

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  /** Paragraphs rendered after the bullets. */
  notes?: string[];
  /** Related links rendered last. */
  links?: LegalLink[];
};

export type LegalDocument = {
  slug: "privacy" | "terms";
  title: string;
  description: string;
  effectiveDate: string;
  intro: string[];
  sections: LegalSection[];
};

export const privacyPolicy: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  description:
    "How Hajer handles the information you share through hajer.ai and its assessment-request form.",
  effectiveDate: LEGAL_EFFECTIVE_DATE,
  intro: [
    "Hajer operates hajer.ai and the assessment-request form on it. This policy explains what information the site collects, why, who processes it, and the choices you have. It covers the website and the form only. An assessment engagement is governed by a separate written agreement.",
    "Questions or requests about your information go to hello@hajer.ai.",
  ],
  sections: [
    {
      heading: "Information you give us",
      paragraphs: [
        "The request form asks for a work email address. Addresses from personal email providers are rejected, and that check runs both in your browser and on our server.",
        "Everything else on the form is optional: company, role, the kind of workflow evidence you have available, the model you run today, the candidate model you are evaluating, your decision timing, and whether you are open to a design-partner assessment.",
        "The form states: “By joining, you agree to receive Hajer product updates. You can unsubscribe at any time.” Submitting the form is how you give that consent.",
        "Please do not put confidential information, credentials, production data, or other people’s personal data into the form. Those belong in a scoped engagement, not a web form.",
      ],
    },
    {
      heading: "Information recorded with a submission",
      paragraphs: [
        "When you submit the form, our server records a few technical details alongside your answers:",
      ],
      bullets: [
        "The page that referred you and a coarse description of your browser, each cut to 300 characters.",
        "The time of the submission and which of the two forms you used.",
        "A random submission key that your browser generates, so that a retry or a later follow-up with more detail updates the same record instead of creating a second one. It is not derived from anything about you.",
        "The domain part of your email address, stored as a separate field so we can see which organisations are asking without collecting anything extra.",
      ],
      notes: [
        "Your IP address is read from the request to enforce a rate limit of five attempts per ten minutes. It is hashed in memory for that purpose and is not written to our database. Our hosting provider keeps its own request logs under its own policy.",
        "Submitting the form again with the same email address updates your existing record rather than creating a duplicate.",
      ],
    },
    {
      heading: "Analytics and cookies",
      paragraphs: [
        "We use one analytics service, PostHog, hosted in the European Union, to count visits and see how the page is used. It runs without cookies: the site sets no analytics cookie and stores no analytics identifier in your browser, which is why there is no cookie notice.",
        "Instead of an identifier, PostHog derives a hash on its own servers from your IP address, your browser’s user-agent string, the site’s hostname, and a random value that changes daily and is then deleted. That hash cannot be turned back into your IP address or browser details, and it changes every day, so there is no record that follows you from one day to the next.",
        "Against that hash, PostHog records the pages you view, where you click and how far you scroll, information about your browser and device, an approximate location derived from your IP address, and any errors the page throws so we can see where the site breaks. There is no session replay.",
        "Events Hajer sends on its own account carry only flags: that a request was submitted, which form was used, and whether optional details were included. They never carry your email address or the text you typed.",
        "The only thing the site keeps in your browser is a session-only record of your own submission, so the two forms can share it; it is deleted when the tab closes. We do not respond to Do Not Track signals. Blocking analytics with a browser extension or a content blocker works as expected: the site does not depend on it.",
      ],
      links: [
        { label: "PostHog Privacy Policy", href: "https://posthog.com/privacy" },
      ],
    },
    {
      heading: "How we use the information",
      paragraphs: ["We use what you share and what the site records for these purposes:"],
      bullets: [
        "To respond to your request and understand whether an assessment fits.",
        "To send one follow-up email after your address is stored.",
        "To send occasional product updates, which you agreed to when you submitted the form.",
        "To operate and protect the site: rate limiting, abuse prevention, and error tracking.",
        "To understand how the site is used, through the cookieless analytics described above.",
      ],
    },
    {
      heading: "Email from Hajer",
      paragraphs: [
        "After your address is stored, you receive one plain-text follow-up from omar@hajer.ai, sent through Google Workspace, with replies going to hello@hajer.ai. Adding details later does not trigger a second copy.",
        "Product updates are occasional. To stop receiving them, reply to any message or write to hello@hajer.ai and we will remove you from the list. There is no automated unsubscribe link; a person handles each request.",
      ],
    },
    {
      heading: "Legal bases",
      paragraphs: [
        "Where the GDPR or UK GDPR applies, we rely on your consent for product updates; on our legitimate interest in answering inbound requests, keeping the site secure, and measuring how the site is used with the cookieless, non-identifying analytics described above; and, when scoping an assessment, on taking steps at your request before entering a contract.",
      ],
    },
    {
      heading: "Who processes your information",
      paragraphs: ["A small number of service providers run the site on our behalf:"],
      bullets: [
        "Vercel hosts the website and runs the form’s server code.",
        "Supabase stores form submissions in a database that only our server can write to.",
        "Google provides Workspace, which sends our email.",
        "PostHog provides cookieless product analytics and error tracking, hosted in the EU.",
      ],
      notes: [
        "We do not sell personal information and we do not use it for targeted advertising. We disclose information when the law requires it, to protect rights or safety, or as part of a business transfer, in which case this policy continues to apply.",
      ],
    },
    {
      heading: "International transfers",
      paragraphs: [
        "Our providers may process information in the United States and other countries. Where the GDPR or UK GDPR applies, we rely on the contractual safeguards those providers offer, such as standard contractual clauses.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        "We keep your submission while your request is open and while your address remains on the list. Ask, and we delete it. Analytics data is retained for the period configured with PostHog.",
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "The site is served over HTTPS. Database writes require server-side credentials that are never sent to the browser, and the database enforces row-level security so that no public key can read or write submissions. No method of storage or transmission is completely secure, and we cannot promise otherwise.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "Depending on where you live, you may have the right to access the information we hold about you, correct it, delete it, restrict or object to how we use it, receive a copy in a portable format, and withdraw consent you gave earlier. If you are in the EU or the UK, you can also complain to your data-protection authority. California residents have the right to know what we collect, to delete it, to correct it, and not to be treated differently for exercising those rights. We do not sell personal information.",
        "To exercise any of these, email hello@hajer.ai. We may ask you to confirm the request from the address on file, and we respond within the time the applicable law allows.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "The site is for engineering teams and is not directed at anyone under 16. We do not knowingly collect information from children.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "When this policy changes, we update the effective date at the top. If a change materially affects how we use information already collected, we tell the addresses on the list.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: ["Hajer, hello@hajer.ai."],
    },
  ],
};

export const termsOfService: LegalDocument = {
  slug: "terms",
  title: "Terms of Service",
  description:
    "The terms that apply when you use hajer.ai or submit an assessment request.",
  effectiveDate: LEGAL_EFFECTIVE_DATE,
  intro: [
    "These terms are an agreement between you and Hajer, the operator of hajer.ai. They cover your use of the site and of the assessment-request form. Read them together with the Privacy Policy, which explains how information you share is handled.",
  ],
  sections: [
    {
      heading: "Acceptance",
      paragraphs: [
        "By using the site or submitting the form, you accept these terms. If you do not accept them, do not use the site.",
      ],
      links: [{ label: "Privacy Policy", href: "/privacy" }],
    },
    {
      heading: "What the site is",
      paragraphs: [
        "The site describes Hajer’s model-migration assessment and lets you request one. A submission tells us you are interested; it does not create an engagement, and Hajer is not obliged to respond to or accept any request.",
        "Any assessment Hajer performs is governed by a separate written agreement. Nothing on the site is an offer, a quotation, or a guarantee of availability, timing, scope, or price.",
      ],
    },
    {
      heading: "Eligibility",
      paragraphs: [
        "You must be at least 18 to use the form. If you submit on behalf of an organisation, you confirm that you are authorised to do so. The site has no user accounts.",
      ],
    },
    {
      heading: "Your submissions",
      paragraphs: ["When you use the form:"],
      bullets: [
        "Provide accurate information, and only information you are entitled to share.",
        "Do not submit confidential information, credentials, production data, or personal data about other people.",
        "Hajer may use what you submit as described in the Privacy Policy and may decline or remove any entry.",
      ],
    },
    {
      heading: "Illustrative content",
      paragraphs: [
        "The change patterns, the assessment replay, and the decision-record example on the site are illustrations. They are not customer results, benchmarks, or predictions about your system.",
        "The site is not engineering, legal, or compliance advice. Your team keeps full responsibility for choosing a model, deploying it, and deciding whether to release.",
      ],
    },
    {
      heading: "Intellectual property",
      paragraphs: [
        "The site, its content, and the Hajer name and mark belong to Hajer. You may view the site and share links to it; you may not copy, modify, or redistribute its content without permission.",
        "Names of third-party models and providers that appear on the site belong to their owners. Their appearance does not imply affiliation with, sponsorship of, or endorsement by those owners.",
      ],
    },
    {
      heading: "Acceptable use",
      paragraphs: ["You agree not to:"],
      bullets: [
        "Make automated, bulk, or false submissions.",
        "Interfere with the site or its infrastructure, or scrape it.",
        "Test the site’s security without prior written permission.",
        "Use the site in any way that is unlawful where you are.",
      ],
    },
    {
      heading: "Third-party services",
      paragraphs: [
        "The site relies on hosting, database, email, and analytics providers, each governed by its own terms. Hajer is not responsible for those services.",
      ],
    },
    {
      heading: "Disclaimers",
      paragraphs: [
        "The site is provided as is and as available. To the extent the law allows, Hajer makes no warranty that the site is accurate, complete, uninterrupted, or free of errors.",
        "No assessment can eliminate the risk of a model migration. Testing cannot prove the absence of untested failures, and nothing on this site claims otherwise.",
      ],
    },
    {
      heading: "Limitation of liability",
      paragraphs: [
        "To the extent the law allows, Hajer is not liable for indirect, incidental, special, or consequential loss arising from the site, including lost profits, lost data, or business interruption. Hajer’s total liability for claims relating to the site is limited to the greater of one hundred US dollars or the amount you paid Hajer for use of the site.",
        "Nothing in these terms limits liability that cannot be limited by law.",
      ],
    },
    {
      heading: "Indemnity",
      paragraphs: [
        "You agree to cover Hajer against claims arising from a submission that breaks these terms or the law.",
      ],
    },
    {
      heading: "Termination",
      paragraphs: [
        "Hajer may suspend access to the site or remove a list entry at any time, with or without notice.",
      ],
    },
    {
      heading: "Changes to these terms",
      paragraphs: [
        "Hajer may change these terms by updating the effective date at the top. Continuing to use the site after a change means you accept the new terms.",
      ],
    },
    {
      heading: "Governing law and disputes",
      paragraphs: [
        "These terms are governed by the laws of the jurisdiction in which Hajer is established, without regard to conflict-of-law rules. Any dispute arising from these terms or the site will be brought in the courts of that jurisdiction. Nothing in this section limits rights you have under mandatory consumer-protection law where you live.",
      ],
    },
    {
      heading: "General",
      paragraphs: [
        "These terms and the Privacy Policy are the entire agreement between you and Hajer about the site. If any part is found unenforceable, the rest still applies. Hajer’s failure to enforce a term is not a waiver of it. Hajer may assign these terms; you may not. No one other than you and Hajer has rights under them.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: ["Hajer, hello@hajer.ai."],
    },
  ],
};
