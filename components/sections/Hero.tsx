import { WaitlistInline } from "@/components/waitlist/WaitlistForms";
import { hero } from "@/content/copy";

export function Hero() {
  return (
    <section className="relative flex min-h-dvh flex-col overflow-hidden bg-void">
      <div className="relative flex flex-1 flex-col justify-center pb-16 pt-32 md:pb-20 md:pt-40">
        <div className="shell relative z-10">
          <h1 className="max-w-7xl text-[clamp(2.75rem,12.3vw,3rem)] font-medium leading-[0.98] tracking-[-0.04em] text-white md:text-7xl xl:text-[5.75rem]">
            <span className="block text-balance lg:whitespace-nowrap">
              {hero.headlineLead}
            </span>
            {" "}
            <span className="block text-balance">{hero.headlineAction}</span>
          </h1>

          <p className="mt-10 max-w-3xl text-lg leading-8 text-muted md:text-xl md:leading-9">
            {hero.body}
          </p>
          <WaitlistInline />
        </div>
      </div>
    </section>
  );
}
