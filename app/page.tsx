import { SiteNav } from "@/components/sections/SiteNav";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { ChangeExplorer } from "@/components/sections/ChangeExplorer";
import { Building } from "@/components/sections/Building";
import { Deliverables } from "@/components/sections/Deliverables";
import { Authority } from "@/components/sections/Authority";
import { Verdict } from "@/components/sections/Verdict";
import { Status } from "@/components/sections/Status";
import { FAQ } from "@/components/sections/FAQ";
import { Waitlist } from "@/components/sections/Waitlist";
import { SiteFooter } from "@/components/sections/Footer";

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[60] -translate-y-24 bg-white px-4 py-3 text-sm font-medium text-void transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <SiteNav />
      <main id="main" className="flex flex-col w-full">
        <Hero />
        <Problem />
        <ChangeExplorer />
        <Building />
        <Deliverables />
        <Authority />
        <Verdict />
        <Status />
        <FAQ />
        <Waitlist />
      </main>
      <SiteFooter />
    </>
  );
}
