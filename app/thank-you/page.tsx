import type { Metadata } from "next";

import { SiteFooter } from "@/components/sections/Footer";
import { SiteNav } from "@/components/sections/SiteNav";
import { SkipLink } from "@/components/sections/SkipLink";
import { ThankYouPanel } from "@/components/waitlist/ThankYouPanel";
import { thankYou } from "@/content/copy";

export const metadata: Metadata = {
  title: thankYou.title,
  description: thankYou.description,
  // Post-submit page: never indexed. A child segment replaces the root's
  // `robots` and `alternates` wholesale, so the canonical must be cleared
  // explicitly or this page would claim to be "/".
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function ThankYouPage() {
  return (
    <>
      <SkipLink />
      <SiteNav />
      <main id="main" className="flex w-full flex-col">
        <section className="bg-void pb-20 pt-32 md:pb-28 md:pt-40">
          <div className="shell">
            <div className="max-w-3xl">
              <ThankYouPanel />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
