"use client";

import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { identityData } from '@/content/portfolioData';

interface HeroBandProps {
  onOpenContact: () => void;
}

/**
 * The copy column sits in the left 44% of the band, over the wash the canvas
 * paints there. Its width is capped rather than fixed so the measure stays
 * readable while the pyramid keeps the space to its right.
 */
export const HeroBand: React.FC<HeroBandProps> = ({ onOpenContact }) => (
  /* The generous bottom padding is the pyramid's room: narrow, it stands below
     the copy rather than behind it. */
  <section
    id="hero"
    aria-labelledby="hero-heading"
    className="relative px-4 pt-36 pb-64 sm:px-6 sm:pt-32 sm:pb-56 lg:px-8 lg:pt-40 lg:pb-52"
  >
    <div className="mx-auto max-w-7xl">
      <div className="max-w-[640px]">
        <p className="rise text-lg tracking-[-0.01em] text-ink-muted sm:text-xl">
          {identityData.name}
        </p>

        <h1
          id="hero-heading"
          className="rise rise-1 mt-3 text-[44px] font-bold leading-[0.95] tracking-[-0.042em] text-ink sm:text-[62px] lg:text-[82px]"
        >
          The Full-Stack
          <br />
          Engineer.
        </h1>

        <p className="rise rise-2 mt-6 max-w-[470px] text-base leading-[1.62] text-ink-body sm:text-[17.5px]">
          Full-stack engineer building production systems end to end &mdash; product
          surfaces in <strong className="font-semibold">Next.js</strong> and{' '}
          <strong className="font-semibold">React</strong>, APIs in{' '}
          <strong className="font-semibold">NestJS</strong> and{' '}
          <strong className="font-semibold">FastAPI</strong>, and the{' '}
          <strong className="font-semibold">PostgreSQL</strong>,{' '}
          <strong className="font-semibold">Redis</strong> and{' '}
          <strong className="font-semibold">queue layers</strong> underneath that keep
          them fast.
        </p>

        <div className="rise rise-3 mt-8 flex flex-wrap gap-3.5">
          <button
            type="button"
            onClick={onOpenContact}
            id="hero-contact-btn"
            className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-ink px-6 py-4 text-[15px] text-on-ink transition-colors hover:bg-ink-hover"
          >
            <span>Contact Roshan</span>
            <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" />
          </button>

          <a
            href="#projects"
            id="hero-projects-btn"
            className="inline-flex items-center gap-2.5 rounded-full bg-mint px-6 py-4 text-[15px] font-semibold text-on-mint transition-colors hover:bg-mint-hover"
          >
            <span>See the work</span>
            <ArrowUpRight className="h-[15px] w-[15px]" aria-hidden="true" />
          </a>
        </div>

        {/* Mint earns its place above the fold by carrying a real signal —
            that he is actually open to work — rather than decorating. */}
        <p className="rise rise-4 mt-9 flex flex-wrap items-center gap-2.5 text-sm text-ink-faint">
          <span aria-hidden="true" className="h-[7px] w-[7px] shrink-0 bg-mint" />
          <span>Chennai, India &middot; Open to full-time engineering roles</span>
        </p>
      </div>
    </div>
  </section>
);
