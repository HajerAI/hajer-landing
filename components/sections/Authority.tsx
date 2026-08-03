import { authority } from "@/content/copy";

export function Authority() {
  return (
    <section id="authority" className="section-anchor border-b border-hairline bg-carbon py-20 md:py-28">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(340px,0.55fr)] lg:gap-24">
          <h2 className="text-4xl font-medium tracking-[-0.03em] text-white text-balance md:text-6xl">
            {authority.headline}
          </h2>
          <p className="max-w-xl text-lg leading-8 text-muted lg:pt-2">{authority.intro}</p>
        </div>

        <div className="mt-14 grid gap-px border border-hairline bg-hairline lg:grid-cols-2">
          <ResponsibilityList title={authority.hajerLabel} items={authority.hajer} tone="hajer" />
          <ResponsibilityList title={authority.customerLabel} items={authority.customer} tone="customer" />
        </div>

        <p className="mt-8 max-w-4xl text-base font-medium leading-7 text-white">{authority.closing}</p>
      </div>
    </section>
  );
}

function ResponsibilityList({
  title,
  items,
  tone,
}: {
  title: string;
  items: readonly string[];
  tone: "hajer" | "customer";
}) {
  const isHajer = tone === "hajer";

  return (
    <div className={`${isHajer ? "bg-vermilion" : "bg-void"} p-6 md:p-9`}>
      <h3 className={isHajer ? "text-void" : "text-white"}>{title}</h3>
      <ul
        className={`mt-7 divide-y border-y ${
          isHajer ? "divide-void/20 border-void/20" : "divide-hairline border-hairline"
        }`}
      >
        {items.map((item) => (
          <li
            key={item}
            className={`grid grid-cols-[0.5rem_1fr] gap-3 py-4 text-sm leading-6 md:text-base ${
              isHajer ? "text-void/85" : "text-muted"
            }`}
          >
            <span
              className={`mt-2 h-1.5 w-1.5 ${isHajer ? "bg-void" : "border border-white/70"}`}
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
