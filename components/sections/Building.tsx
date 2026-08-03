import { building } from "@/content/copy";

export function Building() {
  return (
    <section id="building" className="section-anchor border-b border-hairline bg-void py-20 md:py-28">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(420px,1fr)] lg:gap-24">
          <div>
            <h2 className="max-w-3xl text-3xl font-medium tracking-[-0.03em] text-white text-balance md:text-5xl">
              {building.headline}
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted">{building.body}</p>
          </div>

          <div className="border-t border-hairline-strong">
            <p className="py-4 font-mono text-xs uppercase tracking-[0.16em] text-graphite">
              {building.focusLabel}
            </p>
            <ul className="divide-y divide-hairline border-y border-hairline">
              {building.focus.map((item, index) => (
                <li key={item} className="grid grid-cols-[2rem_1fr] gap-4 py-4 text-sm leading-6 text-muted md:text-base">
                  <span className="font-mono text-xs text-vermilion">{String(index + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-12 max-w-4xl border-t border-hairline-strong pt-6 text-base font-medium leading-7 text-white">
          {building.boundary}
        </p>
      </div>
    </section>
  );
}
