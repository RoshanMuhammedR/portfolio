"use client";

import React, { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'stack', label: 'Stack' },
  { id: 'contact-heading', label: 'Contact' }
];

/**
 * Wayfinding on small screens.
 *
 * The desktop nav carries these links, but on a phone they were folded behind
 * a hamburger — across a page that runs to seven thousand pixels. This is the
 * same set, always visible under the bar, marking where you currently are.
 */
export const SectionRail: React.FC = () => {
  const [current, setCurrent] = useState<string>('');

  useEffect(() => {
    const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!targets.length) return;

    // A band counts as current once it crosses the upper third of the screen,
    // which is where the eye actually is while scrolling.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        }
      },
      { rootMargin: '-33% 0px -60% 0px', threshold: 0 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections"
      className="border-t border-rule/70 md:hidden"
    >
      <ul className="flex snap-x gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((section) => {
          const active = current === section.id;
          return (
            <li key={section.id} className="snap-start">
              <a
                href={`#${section.id}`}
                aria-current={active ? 'true' : undefined}
                className={`flex min-h-9 items-center gap-2 rounded-full px-3 font-mono text-[12px] whitespace-nowrap transition-colors ${
                  active ? 'bg-ink text-on-ink' : 'text-ink-muted'
                }`}
              >
                {active && <span aria-hidden="true" className="h-[6px] w-[6px] bg-mint" />}
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
