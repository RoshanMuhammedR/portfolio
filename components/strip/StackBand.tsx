"use client";

import React from 'react';
import { stackCategories } from '@/content/portfolioData';
import { useFocusGroup } from '@/lib/useFocusGroup';
import { BandLabel } from './BandLabel';
import { SeamSweep } from './SeamSweep';

export const StackBand: React.FC = () => {
  const { groupProps, itemProps } = useFocusGroup('col');

  return (
    <section
      id="stack"
      data-band="stack"
      aria-labelledby="stack-heading"
      className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <SeamSweep delay="4.8s" />

      <div className="mx-auto max-w-7xl">
        <BandLabel>04 &mdash; STACK</BandLabel>

        <h2
          id="stack-heading"
          className="text-[28px] font-bold leading-[1.1] tracking-[-0.032em] text-ink sm:text-[36px]"
        >
          What the work is made of
        </h2>

        <p className="mt-4 max-w-[600px] text-base leading-[1.62] text-ink-muted sm:text-[16.5px]">
          A bill of materials, not a rating. No bars, no percentages, no invented levels
          &mdash; these are the tools the work above was actually built with.
        </p>

        {/*
          Reference material, set as reference material. All four categories
          stay on one row — split across two columns they stack, and the band
          gets taller, not shorter — and the generic per-category blurb is gone.
          What is left is the 22 tools and what each was actually used for, at
          roughly two thirds of the height this band used to take.
        */}
        <div
          {...groupProps}
          className={`${groupProps.className} mt-12 grid grid-cols-1 items-start gap-x-9 gap-y-10 sm:grid-cols-2 lg:grid-cols-4`}
        >
          {stackCategories.map((cat) => {
            const pick = itemProps(cat.layer);
            return (
              <div key={cat.layer} className="strip-item strip-col" data-on={pick['data-on']}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pb-2.5">
                  <h3 className="text-[15px] font-semibold tracking-[-0.012em]">
                    <button
                      type="button"
                      onClick={pick.onClick}
                      aria-pressed={pick['aria-pressed']}
                      className="strip-col-title cursor-pointer text-left text-ink"
                    >
                      {cat.title}
                    </button>
                  </h3>
                  <p className="font-mono text-[11px] tracking-[0.1em] text-ink-ghost uppercase">
                    {cat.skills.length} tools
                  </p>
                </div>

                <div aria-hidden="true" className="h-0.5 bg-ink" />

                <dl>
                  {cat.skills.map((skill) => (
                    <div key={skill.name} className="strip-row py-2">
                      <dt className="strip-row-name text-[14px] font-semibold tracking-[-0.008em] text-ink">
                        {skill.name}
                      </dt>
                      {skill.useCase && (
                        <dd className="strip-row-detail mt-0.5 font-mono text-[10.5px] leading-[1.4] text-ink-faint">
                          {skill.useCase}
                        </dd>
                      )}
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
