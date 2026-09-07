"use client";

import React from 'react';
import { experienceData } from '@/content/portfolioData';
import { useFocusGroup } from '@/lib/useFocusGroup';
import { BandLabel } from './BandLabel';
import { SeamSweep } from './SeamSweep';
import { BandRule } from './BandRule';

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
          className="text-[28px] font-bold leading-[1.1] tracking-[-0.032em] text-ink sm:text-[36px]"
        >
          Where the systems reflex came from
        </h2>

        {/* 600px, not 640: at 16.5px the wider measure ran to 78 characters. */}
        <p className="mt-4 max-w-[600px] text-base leading-[1.62] text-ink-muted sm:text-[16.5px]">
          A full-stack internship on an iPaaS platform: access control, task accounting,
          and the state layer behind a large automation canvas.
        </p>

        <div className="mt-12">
          <BandRule />
        </div>

        <div className="strip-row-head mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex flex-wrap items-baseline gap-3.5">
            <h3 className="text-[22px] font-bold tracking-[-0.026em] text-ink sm:text-[26px]">
              {role.company}
            </h3>
            <p className="text-[15px] text-ink-faint">{role.role}</p>
          </div>
          {/* The dates as a dimension callout — the one block on this band with
              no artwork of its own needed something to anchor it. */}
          <p className="tabular inline-flex shrink-0 items-center gap-2 self-start rounded-md border border-rule bg-card px-3 py-1.5 font-mono text-[12px] tracking-[0.06em] whitespace-nowrap text-ink-muted sm:self-auto">
            <span aria-hidden="true" className="h-[7px] w-px bg-ink-ghost" />
            {role.period}
            <span aria-hidden="true" className="h-[7px] w-px bg-ink-ghost" />
          </p>
        </div>

        <p className="mt-5 text-base leading-[1.6] text-ink-body sm:text-[16.5px]">
          {role.summary}
        </p>

        <ul
          {...groupProps}
          className={`${groupProps.className} mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-14`}
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
                    className="strip-hl-title w-full cursor-pointer text-left text-ink"
                  >
                    {h.title}
                  </button>
                </h4>
                <p className="text-[14.5px] leading-[1.62] text-ink-muted">
                  {h.description}
                </p>
              </li>
            );
          })}
        </ul>

        <p className="mt-12 border-t border-rule pt-5 font-mono text-[13px] leading-relaxed tracking-[0.02em] text-ink-muted">
          {role.stack.map((tool, i) => (
            <React.Fragment key={tool}>
              {i > 0 && <span className="text-ink-faint"> &middot; </span>}
              <span className="strip-tok">{tool}</span>
            </React.Fragment>
          ))}
        </p>
      </div>
    </section>
  );
};
