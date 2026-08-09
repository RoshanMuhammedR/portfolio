"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/content/site";
import { useActiveSection } from "@/lib/useActiveSection";
import { cn } from "@/lib/cn";

const sectionIds = nav.map((item) => item.id);
/** Stable identity so the observer effect doesn't re-run off the landing page. */
const NO_SECTIONS: string[] = [];

export function SiteHeader() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const active = useActiveSection(isLanding ? sectionIds : NO_SECTIONS);
  const [open, setOpen] = useState(false);

  // Every link inside the panel closes it explicitly, so the only remaining
  // dismissal path is Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const href = (id: string) => (isLanding ? `#${id}` : `/#${id}`);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="group/home flex items-baseline gap-2 font-mono text-xs tracking-widest whitespace-nowrap uppercase"
        >
          <span className="text-accent">R</span>
          <span className="text-ink transition-colors group-hover/home:text-accent">
            Roshan Muhammed
          </span>
        </Link>

        <span aria-hidden="true" className="hidden h-px flex-1 bg-line sm:block" />

        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => {
              const isActive = isLanding && active === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={href(item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "group/nav flex items-baseline gap-1.5 px-2.5 py-2 font-mono text-[0.6875rem] tracking-widest uppercase transition-colors",
                      isActive ? "text-accent" : "text-ink-dim hover:text-ink",
                    )}
                  >
                    <span
                      className={cn(
                        "tabular transition-colors",
                        isActive ? "text-accent" : "text-ink-faint",
                      )}
                    >
                      {item.index}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <a
          href={site.resume}
          target="_blank"
          rel="noreferrer noopener"
          className="ml-auto hidden border border-line px-3 py-1.5 font-mono text-[0.6875rem] tracking-widest text-ink uppercase transition-colors hover:border-accent hover:text-accent sm:ml-0 sm:inline-block"
        >
          Résumé
        </a>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="ml-auto border border-line px-3 py-1.5 font-mono text-[0.6875rem] tracking-widest text-ink uppercase transition-colors hover:border-accent hover:text-accent md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-line bg-canvas md:hidden"
      >
        <nav aria-label="Sections">
          <ul className="mx-auto max-w-6xl px-5 py-2 sm:px-8">
            {nav.map((item) => (
              <li key={item.id} className="border-b border-line last:border-0">
                <Link
                  href={href(item.id)}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-3 py-3 font-mono text-xs tracking-widest text-ink-dim uppercase"
                >
                  <span className="tabular text-accent">{item.index}</span>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-line">
              <a
                href={site.resume}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-3 py-3 font-mono text-xs tracking-widest text-ink uppercase"
              >
                <span className="tabular text-accent">06</span>
                Résumé
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
