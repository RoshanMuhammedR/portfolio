import React from 'react';

/**
 * The mint light that travels along a seam hairline. The hairline itself is
 * drawn on the canvas; this rides on top of it, inset to the same content
 * gutter so the two line up at every width.
 */
export const SeamSweep: React.FC<{ delay: string }> = ({ delay }) => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 top-0 px-4 sm:px-6 lg:px-8"
  >
    <div className="mx-auto max-w-7xl">
      <div className="strip-sweep-track h-px w-full">
        <div className="strip-sweep" style={{ animationDelay: delay }} />
      </div>
    </div>
  </div>
);
