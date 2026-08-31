import React from 'react';

/** The mint tick and numbered label that opens every band after the hero. */
export const BandLabel: React.FC<{ children: string }> = ({ children }) => (
  <div className="mb-4 flex h-3.5 items-center gap-2.5">
    <span aria-hidden="true" className="h-[7px] w-[7px] bg-[#00FF9D]" />
    <span className="font-mono text-[11px] tracking-[0.17em] text-[#62697A]">
      {children}
    </span>
  </div>
);
