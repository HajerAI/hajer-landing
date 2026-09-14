import Link from "next/link";

import { HajerMark } from "@/components/brand/HajerMark";
import { footer } from "@/content/copy";

const LEGAL_LINK_CLASS =
  "inline-flex min-h-11 items-center transition-colors hover:text-vermilion md:min-h-0";

export function SiteFooter() {
  return (
    <footer id="footer" className="on-paper border-t border-hairline">
      <div className="shell py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-8">
            <HajerMark
              tone="ink"
              className="block h-24 w-32 md:h-32 md:w-40"
              title="Hajer"
            />
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-white">
              {footer.tagline}
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-graphite">
              {footer.category}
            </p>
          </div>

          <div className="md:col-span-4 md:pt-2">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white">
              {footer.contactLabel}
            </p>
            <a
              href={`mailto:${footer.email}`}
              className="inline-flex min-h-11 items-center text-sm font-medium text-white transition-colors hover:text-vermilion"
            >
              {footer.email}
            </a>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {footer.emailNote}
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-hairline pt-6 font-mono text-xs text-graphite md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <span>{footer.copyright}</span>
            <nav aria-label={footer.legalLabel} className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <Link href="/privacy" prefetch={false} className={LEGAL_LINK_CLASS}>
                {footer.privacyLabel}
              </Link>
              <Link href="/terms" prefetch={false} className={LEGAL_LINK_CLASS}>
                {footer.termsLabel}
              </Link>
            </nav>
          </div>
          <span>{footer.availability}</span>
        </div>
      </div>
    </footer>
  );
}
