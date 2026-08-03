import { WaitlistFull } from "@/components/waitlist/WaitlistForms";
import { waitlist } from "@/content/copy";

export function Waitlist() {
  return (
    <section id="waitlist" className="section-anchor bg-void py-20 md:py-28">
      <div className="shell max-w-5xl">
        <div className="border border-hairline-strong bg-carbon p-6 sm:p-9 md:p-12">
          <h2 className="max-w-3xl text-3xl font-medium tracking-[-0.03em] text-white text-balance md:text-5xl">
            {waitlist.headline}
          </h2>
          <p className="mb-8 mt-6 max-w-3xl text-lg leading-8 text-muted">
            {waitlist.body}
          </p>

          <WaitlistFull />
          <p className="mt-6 text-xs leading-5 text-graphite">{waitlist.note}</p>
        </div>
      </div>
    </section>
  );
}
