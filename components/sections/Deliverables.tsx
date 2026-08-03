import { deliverables } from "@/content/copy";

export function Deliverables() {
  return (
    <section
      id="deliverables"
      data-deliverables
      className="section-anchor border-b border-hairline bg-carbon py-20 md:py-28"
    >
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(360px,0.55fr)] lg:gap-20">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-vermilion">
              {deliverables.label}
            </p>
            <h2 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-[-0.03em] text-white md:text-5xl">
              {deliverables.headline}
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-muted lg:pt-7">
            {deliverables.intro}
          </p>
        </div>

        <ul className="mt-12 grid border-t border-hairline-strong md:grid-cols-2">
          {deliverables.items.map((item, index) => (
            <li
              key={item.title}
              data-deliverable
              className={`border-b border-hairline py-7 md:pr-10 ${
                index % 2 === 1 ? "md:border-l md:pl-10 md:pr-0" : ""
              }`}
            >
              <h3 className="text-lg font-medium text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted md:text-base md:leading-7">
                {item.copy}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-8 border-l-2 border-vermilion pl-5 text-base leading-7 text-white">
          {deliverables.authority}
        </p>
      </div>
    </section>
  );
}
