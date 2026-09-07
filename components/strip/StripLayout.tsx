"use client";

import React, { useRef } from 'react';
import { StripCanvas } from './StripCanvas';
import { HeroBand } from './HeroBand';
import { ExperienceBand } from './ExperienceBand';
import { ProjectsBand } from './ProjectsBand';
import { StackBand } from './StackBand';
import { ContactBand } from './ContactBand';

interface StripLayoutProps {
  onOpenResume: () => void;
  onOpenContact: () => void;
}

/**
 * One page, five bands, one drawing behind all of them.
 *
 * The canvas is a sibling of the copy rather than a child of any band: that is
 * the whole point of the design. Painted per section, anything reaching a
 * section edge got cut by it — here the cast shadow, the roads and three of the
 * concrete bodies cross the boundaries and finish where they should.
 */
export const StripLayout: React.FC<StripLayoutProps> = ({
  onOpenResume,
  onOpenContact
}) => {
  const hostRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={hostRef} className="relative w-full overflow-hidden bg-paper">
      <StripCanvas hostRef={hostRef} />

      <div className="relative z-10">
        <HeroBand onOpenContact={onOpenContact} />
        <ExperienceBand />
        <ProjectsBand />
        <StackBand />
        <ContactBand onOpenResume={onOpenResume} onOpenContact={onOpenContact} />
      </div>
    </div>
  );
};
