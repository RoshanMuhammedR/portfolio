"use client";

import React from 'react';
import { experienceData } from '@/content/portfolioData';
import { useFocusGroup } from '@/lib/useFocusGroup';
import { BandLabel } from './BandLabel';
import { SeamSweep } from './SeamSweep';

const role = experienceData[0];

export const ExperienceBand: React.FC = () => {
  const { groupProps, itemProps } = useFocusGroup('hl');

  return (
    <section
      id="experience"
      data-band="exp"
      aria-labelledby="experience-heading"
      className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <SeamSweep delay="0s" />

      <div className="mx-auto max-w-7xl">
        <BandLabel>02 &mdash; EXPERIENCE</BandLabel>

        <h2
          id="experience-heading"
          className="text-[28px] font-bold leading-[1.1] tracking-[-0.032em] text-[#121316] sm:text-[36px]"
        >
          Where the systems reflex came from
        </h2>

        <p className="mt-3.5 max-w-[640px] text-base leading-[1.62] text-[#4E5564] sm:text-[16.5px]">
          A full-stack internship on an iPaaS platform: access control, task accounting,
          and the state layer behind a large automation canvas.
        </p>

        <div aria-hidden="true" className="mt-11 h-0.5 bg-[#121316]" />

        <div className="strip-row-head mt-8 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <div className="flex flex-wrap items-baseline gap-3.5">
            <h3 className="text-[22px] font-bold tracking-[-0.026em] text-[#121316] sm:text-[26px]">
              {role.company}
            </h3>
            <p className="text-[15px] text-[#62697A]">{role.role}</p>
          </div>
          <p className="tabular font-mono text-[12.5px] tracking-[0.08em] whitespace-nowrap text-[#62697A]">
            {role.period}
          </p>
        </div>

        <p className="mt-5 text-base leading-[1.6] text-[#383E4B] sm:text-[16.5px]">
          {role.summary}
        </p>

        <ul
          {...groupProps}
          className={`${groupProps.className} mt-11 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-14`}
        >
          {role.highlights.map((h, i) => {
            const pick = itemProps(h.title);
            return (
              <li
                key={h.title}
                className="strip-item strip-hl flex flex-col gap-2.5"
                data-on={pick['data-on']}
              >
                <span aria-hidden="true" className="strip-hl-rule w-full" />
                <span
                  aria-hidden="true"
                  className="strip-hl-num pt-3.5 font-mono text-[11.5px] tracking-[0.1em]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h4 className="text-[16.5px] font-semibold tracking-[-0.012em]">
                  <button
                    type="button"
                    onClick={pick.onClick}
                    aria-pressed={pick['aria-pressed']}
                    className="strip-hl-title w-full cursor-pointer text-left text-[#121316]"
                  >
                    {h.title}
                  </button>
                </h4>
                <p className="text-[14.5px] leading-[1.62] text-[#4E5564]">
                  {h.description}
                </p>
              </li>
            );
          })}
        </ul>

        <p className="mt-11 border-t border-[#D4D8CF] pt-5 font-mono text-[13px] leading-relaxed tracking-[0.02em] text-[#62697A]">
          {role.stack.map((tool, i) => (
            <React.Fragment key={tool}>
              {i > 0 && <span className="text-[#8B93A0]"> &middot; </span>}
              <span className="strip-tok">{tool}</span>
            </React.Fragment>
          ))}
        </p>
      </div>
    </section>
  );
};
