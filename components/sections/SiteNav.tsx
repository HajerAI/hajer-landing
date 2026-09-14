"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { HajerLockup } from "@/components/brand/HajerMark";
import { nav } from "@/content/copy";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-void/95 backdrop-blur-md border-b border-hairline py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="shell flex justify-between items-center">
        <a href={nav.homeHref} aria-label="Hajer home" className="flex min-h-11 items-center group outline-none">
          <HajerLockup tone="inverse" size="nav" markClassName="transition-transform group-hover:scale-95" />
        </a>

        <a
          href={nav.ctaHref}
          onClick={() => {
            posthog.capture("waitlist_cta_clicked", {
              navigation_surface: "header",
            });
          }}
          className="inline-flex min-h-11 items-center bg-white px-4 py-2 text-sm font-medium text-void transition-colors hover:bg-vermilion"
        >
          {nav.cta}
        </a>
      </div>
    </header>
  );
}
