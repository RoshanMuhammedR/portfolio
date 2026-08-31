"use client";

import React, { useEffect, useState } from 'react';
import { Mail, Menu, Search, X } from 'lucide-react';

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
          ? 'border-[#D4D8CF] bg-[#ECEEE9]/92 backdrop-blur-md'
          : 'border-transparent bg-[#ECEEE9]/75 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#hero" className="flex min-h-11 items-center gap-2.5" id="brand-logo-link">
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M16 2L28 8.9V23.1L16 30L4 23.1V8.9L16 2Z" fill="#232832" />
            <path d="M16 2L28 8.9L16 15.8L4 8.9L16 2Z" fill="#363E4D" />
            <path d="M16 15.8V30L4 23.1V8.9L16 15.8Z" fill="#1C2029" />
            <path d="M28 8.9V23.1L16 30V15.8L28 8.9Z" fill="#29303D" />
            <circle cx="16" cy="16" r="3" fill="#00FF9D" />
          </svg>
          <span className="text-sm font-extrabold tracking-tight text-[#16181D]">
            Roshan Muhammed R
          </span>
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-8 md:flex">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-sm font-medium text-[#4E5564] transition-colors hover:text-[#121316]"
            >
              {section.label}
            </a>
          ))}
          <button
            onClick={onOpenResume}
            id="nav-resume-btn"
            className="cursor-pointer text-sm font-medium text-[#4E5564] transition-colors hover:text-[#121316]"
          >
            R&eacute;sum&eacute;
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCmd}
            id="cmd-palette-btn"
            aria-label="Search this page"
            className="hidden cursor-pointer items-center gap-2 rounded-full border border-[#C6CCC0] px-3 py-2 text-sm text-[#4E5564] transition-colors hover:border-[#121316] hover:text-[#121316] sm:flex"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Search</span>
            <kbd className="font-mono text-xs text-[#7C8494]">&#8984;K</kbd>
          </button>

          <button
            onClick={onOpenContact}
            id="nav-contact-btn"
            className="hidden cursor-pointer items-center gap-2 rounded-full bg-[#232832] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#16181F] sm:inline-flex"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            <span>Contact</span>
          </button>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#C6CCC0] text-[#232832] transition-colors hover:border-[#121316] md:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Sections"
          className="border-t border-[#D4D8CF] bg-[#ECEEE9] px-4 py-2 md:hidden"
        >
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => setMenuOpen(false)}
              className="block border-b border-[#DFE2DA] py-3.5 text-base font-medium text-[#232832] last:border-0"
            >
              {section.label}
            </a>
          ))}
          <div className="flex flex-wrap gap-2 py-3">
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenContact();
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#232832] px-5 py-3 text-sm font-bold text-white"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span>Contact</span>
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenResume();
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#C6CCC0] px-5 py-3 text-sm font-semibold text-[#232832]"
            >
              R&eacute;sum&eacute;
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
