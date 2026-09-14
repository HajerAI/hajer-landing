import { SkipLink } from "@/components/sections/SkipLink";
import { SiteNav } from "@/components/sections/SiteNav";
import { Hero } from "@/components/sections/Hero";
import { SiteFooter } from "@/components/sections/Footer";

export default function App() {
  return (
    <>
      <SkipLink />
      <SiteNav />
      <main id="main" className="flex flex-col w-full">
        <Hero />
      </main>
      <SiteFooter />
    </>
  );
}
