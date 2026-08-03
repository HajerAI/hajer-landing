import { problem } from "@/content/copy";

export function Problem() {
  return (
    <section id="problem" className="section-anchor border-b border-hairline bg-carbon py-20 md:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)] lg:gap-24">
        <div>
          <h2 className="max-w-3xl text-3xl font-medium tracking-[-0.03em] text-white text-balance md:text-5xl">
            {problem.headline}
          </h2>
          <div className="mt-8 max-w-2xl space-y-5 text-base leading-7 text-muted md:text-lg md:leading-8">
            {problem.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="self-end border-y border-hairline-strong py-8">
          <p className="text-sm text-graphite">The easy question</p>
          <p className="mt-2 text-xl text-muted line-through decoration-vermilion/70 decoration-1">
            “{problem.simpleQuestion}”
          </p>
          <p className="mt-8 text-sm text-graphite">The decision-bearing question</p>
          <p className="mt-3 text-xl font-medium leading-snug text-white md:text-2xl">
            “{problem.realQuestion}”
          </p>
        </div>
      </div>
    </section>
  );
}
