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
          className="text-[28px] font-bold leading-[1.1] tracking-[-0.032em] text-[#121316] sm:text-[36px]"
        >
          What the work is made of
        </h2>

        <p className="mt-3.5 max-w-[640px] text-base leading-[1.62] text-[#4E5564] sm:text-[16.5px]">
          A bill of materials, not a rating. No bars, no percentages, no invented levels
          &mdash; these are the tools the work above was actually built with.
        </p>

        <div
          {...groupProps}
          className={`${groupProps.className} mt-13 grid grid-cols-1 items-start gap-9 sm:grid-cols-2 lg:grid-cols-4`}
        >
          {stackCategories.map((cat) => {
            const pick = itemProps(cat.layer);
            return (
              <div
                key={cat.layer}
                className="strip-item strip-col flex flex-col"
                data-on={pick['data-on']}
              >
                <h3 className="pb-3 text-base font-semibold tracking-[-0.012em]">
                  <button
                    type="button"
                    onClick={pick.onClick}
                    aria-pressed={pick['aria-pressed']}
                    className="strip-col-title w-full cursor-pointer text-left text-[#121316]"
                  >
                    {cat.title}
                  </button>
                </h3>

                <div aria-hidden="true" className="h-0.5 bg-[#121316]" />

                <p className="pt-4 pb-5 text-[13.5px] leading-[1.6] text-[#62697A]">
                  {cat.description}
                </p>

                <dl>
                  {cat.skills.map((skill) => (
                    <div key={skill.name} className="strip-row flex flex-col gap-1.5 py-3.5">
                      <dt className="strip-row-name text-[14.5px] font-semibold tracking-[-0.008em] text-[#121316]">
                        {skill.name}
                      </dt>
                      {skill.useCase && (
                        <dd className="strip-row-detail font-mono text-[11.5px] leading-[1.55] text-[#62697A]">
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
