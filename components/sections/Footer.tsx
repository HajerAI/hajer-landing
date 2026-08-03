import { footer, nav } from "@/content/copy";
import { HajerMark } from "@/components/brand/HajerMark";

export function SiteFooter() {
  return (
    <footer id="footer" className="on-paper border-t border-hairline">
      <div className="shell py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
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

          <div className="md:col-span-2 md:pt-2">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-white">
              {footer.exploreLabel}
            </p>
            <ul className="space-y-2.5">
              {nav.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="inline-flex min-h-11 items-center text-sm text-white transition-colors hover:text-vermilion"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 md:pt-2">
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

        <div className="mt-16 flex flex-col justify-between gap-2 border-t border-hairline pt-6 font-mono text-xs text-graphite md:flex-row">
          <span>{footer.copyright}</span>
          <span>{footer.availability}</span>
        </div>
      </div>
    </footer>
  );
}
