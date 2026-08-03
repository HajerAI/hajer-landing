import { WaitlistInline } from "@/components/waitlist/WaitlistForms";
import { RunwayBand } from "@/components/motion/runway-band";
import { hero, runway } from "@/content/copy";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-hairline bg-void">
      <div className="relative border-b border-hairline pb-16 pt-32 md:pb-20 md:pt-40">
        <div className="shell relative z-10">
          <h1 className="max-w-6xl text-[clamp(2.75rem,12.3vw,3rem)] font-medium leading-[0.98] tracking-[-0.04em] text-white md:text-7xl xl:text-[5.75rem]">
            <span className="block text-balance lg:whitespace-nowrap">
              {hero.headlineLead}
            </span>
            {" "}
            <span className="block text-balance">{hero.headlineAction}</span>
          </h1>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.48fr)] lg:items-end lg:gap-20">
            <div>
              <p className="max-w-3xl text-lg leading-8 text-muted md:text-xl md:leading-9">
                {hero.body}
              </p>
              <WaitlistInline />
            </div>

            <div className="border-t border-hairline-strong pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="text-xl font-medium leading-snug text-white md:text-2xl">
                {hero.authority}
              </p>
              <p className="mt-4 text-sm leading-6 text-graphite">{hero.microcopy}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="bg-void py-4">
          <div className="shell flex items-baseline gap-x-6">
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-vermilion">
              {runway.label}
            </span>
            <p className="max-w-4xl text-xs leading-5 text-graphite">
              {runway.caption}
            </p>
          </div>
        </div>

        <div className="relative h-[34vh] min-h-[280px] w-full max-h-[420px]">
          <RunwayBand />
        </div>
      </div>
    </section>
  );
}
