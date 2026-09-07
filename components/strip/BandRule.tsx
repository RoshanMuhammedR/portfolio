import React from 'react';

/**
 * A section rule carrying a drafting tick at each end — the same mark the seam
 * hairlines carry on the canvas. It is what makes a band read as a measured
 * span on one drawing rather than a row of unrelated content.
 */
export const BandRule: React.FC = () => (
  <div aria-hidden="true" className="relative h-0.5 bg-ink">
    <span className="absolute -top-2 left-0 h-2 w-px bg-ink" />
    <span className="absolute -top-2 right-0 h-2 w-px bg-ink" />
  </div>
);
