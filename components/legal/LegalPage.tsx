import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/sections/Footer";
import { SiteNav } from "@/components/sections/SiteNav";
import { SkipLink } from "@/components/sections/SkipLink";
import { LEGAL_CONTACT, type LegalDocument, type LegalLink } from "@/content/legal";
import { site } from "@/content/site";

const LINK_CLASS =
  "text-white underline underline-offset-4 transition-colors hover:text-vermilion";
const PARAGRAPH_CLASS = "mt-4 text-base leading-7 text-muted";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-09-14" -> "14 September 2026", without depending on ICU data. */
function formatEffectiveDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** Wrap every occurrence of the contact address in a mailto link. */
function linkify(text: string): ReactNode {
  const parts = text.split(LEGAL_CONTACT);
  if (parts.length === 1) return text;
  return parts.flatMap((part, index) =>
    index === 0
      ? [part]
      : [
          <a key={index} href={`mailto:${LEGAL_CONTACT}`} className={LINK_CLASS}>
            {LEGAL_CONTACT}
          </a>,
          part,
        ],
  );
}

function LegalAnchor({ link }: { link: LegalLink }) {
  if (link.href.startsWith("/")) {
    return (
      <Link href={link.href} prefetch={false} className={LINK_CLASS}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={link.href} rel="noopener noreferrer" className={LINK_CLASS}>
      {link.label}
    </a>
  );
}

export function legalMetadata(doc: LegalDocument): Metadata {
  const path = `/${doc.slug}`;
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: path },
    // A child `openGraph` replaces the root's entirely, so it is spelled out.
    openGraph: {
      type: "website",
      url: path,
      siteName: site.name,
      title: `${doc.title} — ${site.name}`,
      description: doc.description,
    },
  };
}

export function LegalPage({ doc }: { doc: LegalDocument }) {
  return (
    <>
      <SkipLink />
      <SiteNav />
      <main id="main" className="flex w-full flex-col">
        <article className="bg-void pb-20 pt-32 md:pb-28 md:pt-40">
          <div className="shell">
            {/* `.shell` outranks max-w-* utilities, so the measure lives one level down. */}
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-widest text-graphite">
                Effective date{" "}
                <time dateTime={doc.effectiveDate} className="text-muted">
                  {formatEffectiveDate(doc.effectiveDate)}
                </time>
              </p>
              <h1 className="mt-4 text-3xl font-medium tracking-[-0.03em] text-white text-balance md:text-5xl">
                {doc.title}
              </h1>
              {doc.intro.map((paragraph) => (
                <p key={paragraph} className="mt-6 text-lg leading-8 text-muted">
                  {linkify(paragraph)}
                </p>
              ))}

              {doc.sections.map((section, index) => (
                <section key={section.heading} className="mt-14 border-t border-hairline pt-8">
                  <h2 className="text-xl font-medium tracking-[-0.02em] text-white md:text-2xl">
                    <span className="mr-3 font-mono text-sm text-graphite">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {section.heading}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className={PARAGRAPH_CLASS}>
                      {linkify(paragraph)}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="mt-4 list-[square] space-y-2 pl-5 text-base leading-7 text-muted marker:text-graphite">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{linkify(bullet)}</li>
                      ))}
                    </ul>
                  )}
                  {section.notes?.map((paragraph) => (
                    <p key={paragraph} className={PARAGRAPH_CLASS}>
                      {linkify(paragraph)}
                    </p>
                  ))}
                  {section.links && (
                    <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      {section.links.map((link) => (
                        <li key={link.href}>
                          <LegalAnchor link={link} />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
