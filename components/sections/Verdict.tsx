import { verdict } from "@/content/copy";

export function Verdict() {
  return (
    <section id="record" className="section-anchor on-paper border-b border-hairline py-20 md:py-28">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.82fr)_minmax(340px,0.52fr)] lg:gap-24">
          <div>
            <h2 className="max-w-4xl text-3xl font-medium tracking-[-0.03em] text-white text-balance md:text-5xl">
              {verdict.headline}
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">{verdict.intro}</p>
          </div>
          <p className="self-end border-t border-vermilion pt-5 text-base leading-7 text-white">
            {verdict.bounded}
          </p>
        </div>

        <div className="mt-14 grid border-y border-hairline-strong lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.62fr)]">
          <div className="py-8 lg:pr-12">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-vermilion">{verdict.recordLabel}</p>
            <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
              {verdict.states.map((state, index) => (
                <li key={state} className="grid grid-cols-[2rem_1fr] gap-3 border-t border-hairline py-4 text-sm leading-6 text-white">
                  <span className="font-mono text-[11px] text-graphite">{String(index + 1).padStart(2, "0")}</span>
                  <span>{state}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="border-t border-hairline-strong py-8 lg:border-l lg:border-t-0 lg:pl-12">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-vermilion">{verdict.scenario.label}</p>
            <h3 className="mt-4 text-2xl font-medium tracking-[-0.02em] text-white">{verdict.scenario.headline}</h3>
            <p className="mt-5 text-base leading-7 text-muted">{verdict.scenario.body}</p>
            <p className="mt-7 border-t border-hairline pt-4 text-xs text-graphite">{verdict.scenario.disclaimer}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
