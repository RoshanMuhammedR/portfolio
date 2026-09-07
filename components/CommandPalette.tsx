"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Copy, ExternalLink, FileText, Hash, Mail, Search, X } from 'lucide-react';
import {
  experienceData,
  identityData,
  projectsData,
  stackCategories
} from '@/content/portfolioData';
import { useDialog } from '@/lib/useDialog';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenResume: () => void;
  onOpenContact: () => void;
}

type Entry = {
  id: string;
  group: string;
  label: string;
  hint: string;
  /** Extra words that should match but need not be shown. */
  terms: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Shown at the right edge; the outcome, not decoration. */
  trailing?: string;
  run: () => void;
};

const jumpTo = (id: string) => () => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenResume,
  onOpenContact
}) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);
  const listRef = useRef<HTMLDivElement>(null);

  const panelRef = useDialog(isOpen, onClose);

  // A palette opens empty. Adjusting during render rather than in an effect
  // means the first paint is already the reset state — no flash of the last
  // search, and no second render to get there.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setQuery('');
      setActive(0);
    }
  }

  // ⌘K / Ctrl-K toggles. Escape is the dialog's job, not this one's.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else document.getElementById('cmd-palette-btn')?.click();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  /**
   * Everything the page can actually do or show, in one flat list. Built from
   * the same content the page renders, so the palette can never advertise a
   * project or a tool that is not really there.
   */
  const entries = useMemo<Entry[]>(() => {
    const copyEmail = () => {
      navigator.clipboard.writeText(identityData.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const actions: Entry[] = [
      {
        id: 'a-resume',
        group: 'Actions',
        label: 'View résumé',
        hint: 'Experience, projects and stack in one page',
        terms: 'cv resume pdf download',
        icon: FileText,
        run: () => {
          onOpenResume();
          onClose();
        }
      },
      {
        id: 'a-contact',
        group: 'Actions',
        label: 'Contact Roshan',
        hint: 'Write a message, or copy the email and phone',
        terms: `email hire message ${identityData.email}`,
        icon: Mail,
        run: () => {
          onOpenContact();
          onClose();
        }
      },
      {
        id: 'a-copy',
        group: 'Actions',
        label: 'Copy email address',
        hint: identityData.email,
        terms: `${identityData.email} clipboard`,
        icon: Copy,
        trailing: copied ? 'Copied' : 'Copy',
        run: copyEmail
      }
    ];

    const sections: Entry[] = [
      { id: 's-exp', label: 'Experience', hint: 'Where the systems reflex came from', anchor: 'experience' },
      { id: 's-proj', label: 'Projects', hint: 'Things that are running', anchor: 'projects' },
      { id: 's-stack', label: 'Stack', hint: 'What the work is made of', anchor: 'stack' }
    ].map((s) => ({
      id: s.id,
      group: 'Go to',
      label: s.label,
      hint: s.hint,
      terms: `section jump ${s.anchor}`,
      icon: Hash,
      run: () => {
        jumpTo(s.anchor)();
        onClose();
      }
    }));

    const projects: Entry[] = projectsData.map((p) => ({
      id: `p-${p.id}`,
      group: 'Projects',
      label: p.title,
      hint: p.subtitle,
      terms: `${p.stack.join(' ')} ${p.tagline}`,
      icon: ExternalLink,
      trailing: p.liveUrl ? 'Open live' : undefined,
      run: () => {
        if (p.liveUrl) window.open(p.liveUrl, '_blank', 'noreferrer');
        else jumpTo('projects')();
        onClose();
      }
    }));

    // Every tool the page claims, so searching "redis" or "pgvector" lands.
    const tools: Entry[] = stackCategories.flatMap((cat) =>
      cat.skills.map((skill) => ({
        id: `t-${cat.layer}-${skill.name}`,
        group: 'Stack',
        label: skill.name,
        hint: skill.useCase ?? cat.title,
        terms: `${cat.title} ${cat.layer}`,
        icon: Hash,
        run: () => {
          jumpTo('stack')();
          onClose();
        }
      }))
    );

    const highlights: Entry[] = experienceData[0].highlights.map((h) => ({
      id: `h-${h.title}`,
      group: 'Experience',
      label: h.title,
      hint: h.description,
      terms: `${experienceData[0].company} ${h.badge ?? ''}`,
      icon: Hash,
      run: () => {
        jumpTo('experience')();
        onClose();
      }
    }));

    return [...actions, ...sections, ...projects, ...highlights, ...tools];
  }, [copied, onClose, onOpenContact, onOpenResume]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.filter((e) => e.group === 'Actions' || e.group === 'Go to');
    return entries.filter((e) =>
      `${e.label} ${e.hint} ${e.terms}`.toLowerCase().includes(q)
    );
  }, [entries, query]);

  // Grouped for display, but the keyboard walks one flat order.
  const groups = useMemo(() => {
    const out: { name: string; items: Entry[] }[] = [];
    for (const entry of results) {
      const last = out[out.length - 1];
      if (last && last.name === entry.group) last.items.push(entry);
      else out.push({ name: entry.group, items: [entry] });
    }
    return out;
  }, [results]);

  // Keep the highlighted row in view as the selection walks past the fold.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!isOpen) return null;

  // Results can shrink under a stale index (a filter change, the copy label
  // flipping), so the highlight is clamped rather than trusted.
  const activeIndex = results.length ? Math.min(active, results.length - 1) : 0;
  const activeEntry = results[activeIndex];
  let index = -1;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      results[activeIndex]?.run();
    }
  };

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-start justify-center bg-[var(--overlay)] px-4 pt-20 backdrop-blur-xs duration-150"
      onClick={onClose}
    >
      <div
        className="panel flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cmdk-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="cmdk-title" className="sr-only">
          Search this page
        </h2>

        <div className="flex items-center gap-3 border-b border-rule px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
          <input
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={activeEntry?.id}
            aria-label="Search projects, tools and actions"
            placeholder="Search projects, tools and actions"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            data-autofocus
            autoComplete="off"
            className="w-full bg-transparent font-mono text-sm text-ink placeholder-ink-faint focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="cursor-pointer rounded-full p-1 text-ink-faint transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div id="cmdk-list" role="listbox" aria-label="Results" ref={listRef} className="overflow-y-auto p-2">
          {groups.map((group) => (
            <div key={group.name} className="mb-1 last:mb-0">
              <div className="px-2.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.14em] text-ink-faint uppercase">
                {group.name}
              </div>
              {group.items.map((entry) => {
                index += 1;
                const isActive = index === activeIndex;
                const Icon = entry.icon;
                return (
                  <button
                    key={entry.id}
                    id={entry.id}
                    role="option"
                    aria-selected={isActive}
                    data-active={isActive}
                    onMouseMove={() => setActive(results.indexOf(entry))}
                    onClick={entry.run}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-2.5 text-left transition-colors ${
                      isActive ? 'bg-paper' : ''
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${isActive ? 'text-mint-ink' : 'text-ink-faint'}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {entry.label}
                        </span>
                        <span className="block truncate text-xs text-ink-faint">{entry.hint}</span>
                      </span>
                    </span>

                    {entry.trailing ? (
                      <span className="shrink-0 font-mono text-[11px] font-semibold text-mint-ink">
                        {entry.trailing}
                      </span>
                    ) : (
                      <ArrowRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isActive ? 'translate-x-0.5 text-mint-ink' : 'text-ink-ghost'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {results.length === 0 && (
            <p className="px-3 py-10 text-center text-sm text-ink-faint">
              Nothing matches <span className="font-mono text-ink">{query}</span>.
              <span className="mt-1 block text-xs">
                Try a tool, a project name, or &ldquo;résumé&rdquo;.
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-rule px-4 py-2.5 font-mono text-[11px] text-ink-faint">
          <span className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-rule bg-paper px-1.5 py-0.5 text-[10px]">
                &uarr;&darr;
              </kbd>{' '}
              to move
            </span>
            <span>
              <kbd className="rounded border border-rule bg-paper px-1.5 py-0.5 text-[10px]">
                &crarr;
              </kbd>{' '}
              to select
            </span>
            <span>
              <kbd className="rounded border border-rule bg-paper px-1.5 py-0.5 text-[10px]">
                esc
              </kbd>{' '}
              to close
            </span>
          </span>
          <span aria-live="polite">
            {results.length} {results.length === 1 ? 'result' : 'results'}
          </span>
        </div>
      </div>
    </div>
  );
};
