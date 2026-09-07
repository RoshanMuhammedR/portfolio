"use client";

import React, { useState } from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import { identityData } from '@/content/portfolioData';

interface ContactBandProps {
  onOpenResume: () => void;
  onOpenContact: () => void;
}

/**
 * The night the page ends on. This band paints no background of its own — the
 * dark is the canvas underneath, rising out of the tilted ground.
 */
export const ContactBand: React.FC<ContactBandProps> = ({
  onOpenResume,
  onOpenContact
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(identityData.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <section
      data-band="night"
      aria-labelledby="contact-heading"
      className="relative px-4 pt-20 pb-7 sm:px-6 lg:px-8 lg:pt-24"
    >
      {/* Rides across the tilted ground the dark rises out of, drifting up by
          the same 58px the horizon does. */}
      <div
        aria-hidden="true"
        className="strip-sweep-track pointer-events-none absolute inset-x-0 -top-[180px] h-[180px]"
      >
        <div className="strip-sweep strip-sweep-diag" style={{ animationDelay: '1.2s' }} />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-[880px]">
          <div className="mb-5 flex h-4 items-center gap-2.5">
            <span aria-hidden="true" className="h-[7px] w-[7px] bg-mint" />
            <span className="font-mono text-[12px] font-medium tracking-[0.13em] text-night-muted">
              05 &mdash; CONTACT
            </span>
          </div>

          <h2
            id="contact-heading"
            className="text-[30px] font-bold leading-[1.14] tracking-[-0.032em] text-on-night sm:text-[38px] lg:text-[45px]"
          >
            If this is the kind of problem you are hiring for, I would like to hear about
            it.
          </h2>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onOpenContact}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-mint px-6 py-4 text-[15px] font-semibold text-on-mint transition-colors hover:bg-mint-hover"
            >
              <span>Start a conversation</span>
              <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onOpenResume}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-on-night/30 px-6 py-3.5 text-[15px] text-on-night transition-colors hover:border-on-night/70 hover:bg-on-night/5"
            >
              <FileText className="h-[15px] w-[15px]" aria-hidden="true" />
              <span>R&eacute;sum&eacute;</span>
            </button>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="cursor-pointer border-b border-on-night/15 pb-0.5 font-mono text-[13.5px] text-night-muted transition-colors hover:border-mint hover:text-mint"
            >
              {copiedEmail ? 'Copied to clipboard' : identityData.email}
            </button>
          </div>
        </div>

        {/* A rule, so the name strip closes the page instead of floating
            unattached below a large field of empty dark. */}
        <div className="mt-16 flex flex-col gap-2 border-t border-[color:var(--on-night)]/12 pt-5 font-mono text-[12px] tracking-[0.12em] text-night-faint sm:flex-row sm:items-center sm:justify-between lg:mt-20">
          <span>ROSHAN MUHAMMED R</span>
          <span>CHENNAI, INDIA</span>
        </div>
      </div>
    </section>
  );
};
