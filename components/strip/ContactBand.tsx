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
      className="relative px-4 pt-24 pb-7 sm:px-6 lg:px-8 lg:pt-28"
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
          <div className="mb-6 flex h-3.5 items-center gap-2.5">
            <span aria-hidden="true" className="h-[7px] w-[7px] bg-[#00FF9D]" />
            <span className="font-mono text-[11px] tracking-[0.17em] text-[#868C93]">
              05 &mdash; CONTACT
            </span>
          </div>

          <h2
            id="contact-heading"
            className="text-[30px] font-bold leading-[1.14] tracking-[-0.032em] text-[#ECEEE9] sm:text-[38px] lg:text-[45px]"
          >
            If this is the kind of problem you are hiring for, I would like to hear about
            it.
          </h2>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onOpenContact}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-[#00FF9D] px-6 py-4 text-[15px] font-semibold text-[#121316] transition-colors hover:bg-[#00E88C]"
            >
              <span>Start a conversation</span>
              <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onOpenResume}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-[#ECEEE9]/30 px-6 py-3.5 text-[15px] text-[#ECEEE9] transition-colors hover:border-[#ECEEE9]/75 hover:text-white"
            >
              <FileText className="h-[15px] w-[15px]" aria-hidden="true" />
              <span>R&eacute;sum&eacute;</span>
            </button>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="cursor-pointer border-b border-[#ECEEE9]/15 pb-0.5 font-mono text-[13.5px] text-[#A2A8AF] transition-colors hover:border-[#00FF9D] hover:text-[#00FF9D]"
            >
              {copiedEmail ? 'Copied to clipboard' : identityData.email}
            </button>
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-2 font-mono text-[11px] tracking-[0.14em] text-[#868C93] sm:flex-row sm:items-center sm:justify-between lg:mt-32">
          <span>ROSHAN MUHAMMED R</span>
          <span>CHENNAI, INDIA</span>
        </div>
      </div>
    </section>
  );
};
