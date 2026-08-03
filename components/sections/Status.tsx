import { status } from "@/content/copy";

export function Status() {
  return (
    <section id="status" className="section-anchor border-b border-hairline bg-void py-20 md:py-28">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-vermilion">
              For engineering owners
            </p>
            <h2 className="mt-6 text-3xl font-medium tracking-[-0.03em] text-white text-balance md:text-5xl">
              {status.headline}
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted">{status.intro}</p>
          </div>

          <div className="grid gap-px border border-hairline bg-hairline md:grid-cols-2">
            <StatusList title={status.focusLabel} items={status.focus} tone="focus" />
            <StatusList title={status.fitLabel} items={status.fit} tone="fit" />
          </div>
        </div>

        <div className="mt-12 grid gap-4 border-t border-vermilion/50 pt-6 md:grid-cols-[12rem_1fr] md:gap-10">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-vermilion">{status.nextLabel}</p>
          <p className="max-w-4xl text-lg leading-8 text-white">{status.next}</p>
        </div>
      </div>
    </section>
  );
}

function StatusList({
  title,
  items,
  tone,
}: {
  title: string;
  items: readonly string[];
  tone: "focus" | "fit";
}) {
  return (
    <div className="bg-carbon p-6 md:p-8">
      <h3 className={tone === "focus" ? "text-vermilion" : "text-white"}>{title}</h3>
      <ul className="mt-6 space-y-5">
        {items.map((item) => (
          <li key={item} className="grid grid-cols-[0.5rem_1fr] gap-3 text-sm leading-6 text-muted">
            <span
              className={tone === "focus" ? "mt-2 h-1.5 w-1.5 bg-vermilion" : "mt-2 h-1.5 w-1.5 bg-white"}
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
