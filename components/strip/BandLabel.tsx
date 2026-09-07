import React from 'react';

/**
 * The mint tick and numbered label that opens every band after the hero.
 *
 * 12px at 0.13em in --ink-muted, not 11px at 0.17em in --ink-faint: heavily
 * tracked mono, that small, in the lighter grey was sitting on the legibility
 * floor — and this label is wayfinding, so it has to survive a phone held at
 * arm's length.
 */
export const BandLabel: React.FC<{ children: string }> = ({ children }) => (
  <div className="mb-4 flex h-4 items-center gap-2.5">
    <span aria-hidden="true" className="h-[7px] w-[7px] bg-mint" />
    <span className="font-mono text-[12px] font-medium tracking-[0.13em] text-ink-muted">
      {children}
    </span>
  </div>
);
