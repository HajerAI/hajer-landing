"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import posthog from "posthog-js";
import { HajerLockup } from "@/components/brand/HajerMark";
import { nav } from "@/content/copy";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || open ? "bg-void/95 backdrop-blur-md border-b border-hairline py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="shell flex justify-between items-center">
        <a href={nav.homeHref} aria-label="Hajer home" className="flex min-h-11 items-center group outline-none">
          <HajerLockup tone="inverse" size="nav" markClassName="transition-transform group-hover:scale-95" />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex xl:gap-8">
          {nav.links.map((link) => (
            <a key={link.href} href={link.href} className="nav-link text-sm font-medium text-muted hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border border-hairline-strong text-white hover:border-white lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
          <a
            href={nav.ctaHref}
            onClick={() => {
              posthog.capture("waitlist_cta_clicked", {
                navigation_surface: open ? "mobile_menu" : "header",
              });
              setOpen(false);
            }}
            className="inline-flex min-h-11 items-center bg-white px-4 py-2 text-sm font-medium text-void transition-colors hover:bg-vermilion"
          >
            {nav.cta}
          </a>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        aria-label="Mobile"
        hidden={!open}
        className="shell border-t border-hairline bg-void py-4 lg:hidden"
      >
        <div className="grid grid-cols-1 divide-y divide-hairline">
          {nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center py-2 text-sm text-muted transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
