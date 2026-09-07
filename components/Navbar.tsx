"use client";

import React, { useEffect, useState } from 'react';
import { Mail, Menu, Search, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { SectionRail } from './SectionRail';

interface NavbarProps {
  onOpenCmd: () => void;
  onOpenResume: () => void;
  onOpenContact: () => void;
}

const SECTIONS = [
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'stack', label: 'Stack' }
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCmd,
  onOpenResume,
  onOpenContact
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // The menu is a single-screen anchor list; closing on Escape costs nothing
  // and is what a keyboard user will try first.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-200 ${
        scrolled
          ? 'border-rule bg-paper/92 backdrop-blur-md'
          : 'border-transparent bg-paper/75 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#hero" className="flex min-h-11 items-center gap-2.5" id="brand-logo-link">
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 2L28 8.9V23.1L16 30L4 23.1V8.9L16 2Z" className="fill-ink" />
            <path d="M16 2L28 8.9L16 15.8L4 8.9L16 2Z" className="fill-ink" opacity="0.72" />
            <path d="M16 15.8V30L4 23.1V8.9L16 15.8Z" className="fill-ink" opacity="0.9" />
            <path d="M28 8.9V23.1L16 30V15.8L28 8.9Z" className="fill-ink" opacity="0.82" />
            <circle cx="16" cy="16" r="3" className="fill-mint" />
          </svg>
          <span className="text-sm font-extrabold tracking-tight text-ink-hover">
            Roshan Muhammed R
          </span>
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-8 md:flex">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              {section.label}
            </a>
          ))}
          <button
            onClick={onOpenResume}
            id="nav-resume-btn"
            className="cursor-pointer text-sm font-medium text-ink-muted transition-colors hover:text-ink"
          >
            R&eacute;sum&eacute;
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            onClick={onOpenCmd}
            id="cmd-palette-btn"
            aria-label="Search this page"
            className="hidden cursor-pointer items-center gap-2 rounded-full border border-rule px-3 py-2 text-sm text-ink-muted transition-colors hover:border-ink hover:text-ink sm:flex"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Search</span>
            <kbd className="font-mono text-xs text-ink-ghost">&#8984;K</kbd>
          </button>

          <button
            onClick={onOpenContact}
            id="nav-contact-btn"
            className="hidden cursor-pointer items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-on-ink transition-colors hover:bg-ink-hover sm:inline-flex"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            <span>Contact</span>
          </button>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-rule text-ink-hover transition-colors hover:border-ink md:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Sections live here on a phone, always visible, rather than folded
          behind the menu — this page is seven thousand pixels long. */}
      <SectionRail />

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Actions"
          className="border-t border-rule bg-paper px-4 py-2 md:hidden"
        >
          <div className="flex flex-wrap gap-2 py-3">
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenContact();
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-on-ink"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span>Contact</span>
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenResume();
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-rule px-5 py-3 text-sm font-semibold text-ink-hover"
            >
              R&eacute;sum&eacute;
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
