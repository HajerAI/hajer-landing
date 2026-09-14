import { SkipLink } from "@/components/sections/SkipLink";
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
      <SkipLink />
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
