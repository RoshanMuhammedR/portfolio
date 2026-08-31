"use client";

import React from 'react';
import { ExternalLink, GitBranch } from 'lucide-react';
import { projectsData } from '@/content/portfolioData';
import { useFocusGroup } from '@/lib/useFocusGroup';
import { BandLabel } from './BandLabel';
import { SeamSweep } from './SeamSweep';

/** Shown beside a project title, deliberately outside the heading element so
 *  the accessible name stays the project name alone. */
const projectOrigin: Record<string, string> = {
  saga: 'saga.dedyn.io',
  'ai-trip-planner': 'ai-trip-planner.vercel.app'
};

export const ProjectsBand: React.FC = () => {
  const { groupProps, itemProps } = useFocusGroup('proj');

  return (
    <section
      id="projects"
      data-band="proj"
      aria-labelledby="projects-heading"
      className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
    >
      <SeamSweep delay="2.4s" />

      <div className="mx-auto max-w-7xl">
        <BandLabel>03 &mdash; PROJECTS</BandLabel>

        <h2
          id="projects-heading"
          className="text-[28px] font-bold leading-[1.1] tracking-[-0.032em] text-[#121316] sm:text-[36px]"
        >
          Things that are running
        </h2>

        <p className="mt-3.5 max-w-[620px] text-base leading-[1.62] text-[#4E5564] sm:text-[16.5px]">
          Both are deployed and open source. Each one moves its expensive work off the
          request path.
        </p>

        <div {...groupProps} className={`${groupProps.className} mt-10 flex flex-col gap-11`}>
          {projectsData.map((project) => {
            const pick = itemProps(project.id);
            return (
              <article
                key={project.id}
                className="strip-item strip-proj"
                data-on={pick['data-on']}
              >
                <div aria-hidden="true" className="h-0.5 bg-[#121316]" />

                <div className="flex flex-col gap-5 pt-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[24px] font-bold tracking-[-0.028em] sm:text-[27px]">
                      <button
                        type="button"
                        onClick={pick.onClick}
                        aria-pressed={pick['aria-pressed']}
                        className="strip-proj-name cursor-pointer text-left text-[#121316]"
                      >
                        {project.title}
                      </button>
                    </h3>
                    <p className="flex flex-wrap items-center gap-2.5 text-[14.5px] text-[#62697A]">
                      <span>{project.subtitle}</span>
                      <span aria-hidden="true" className="text-[#8B93A0]">
                        &middot;
                      </span>
                      <span className="font-mono text-[12.5px] text-[#62697A]">
                        {projectOrigin[project.id]}
                      </span>
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2.5">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-md bg-[#00FF9D] px-4 py-3 text-[13.5px] font-semibold text-[#121316] transition-colors hover:bg-[#00E88C]"
                      >
                        <span>Open live</span>
                        <ExternalLink className="h-[13px] w-[13px]" aria-hidden="true" />
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-md border border-[#D4D8CF] bg-[#F4F6F1] px-4 py-3 text-[13.5px] text-[#4E5564] transition-colors hover:border-[#121316] hover:text-[#121316]"
                      >
                        <GitBranch className="h-[13px] w-[13px]" aria-hidden="true" />
                        <span>Source</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-16 gap-y-7 pt-6 lg:grid-cols-12">
                  <p className="text-[15px] leading-[1.66] text-[#383E4B] lg:col-span-5">
                    {project.description}
                  </p>

                  <ul className="flex flex-col lg:col-span-7">
                    {project.architectureHighlights.map((item) => (
                      <li key={item} className="strip-feat flex flex-col">
                        <span aria-hidden="true" className="strip-feat-rule w-full" />
                        <span className="flex gap-3.5 py-3.5">
                          <span
                            aria-hidden="true"
                            className="strip-feat-dash font-mono text-sm"
                          >
                            &mdash;
                          </span>
                          <span className="text-[14.5px] leading-[1.6]">{item}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="pt-7 font-mono text-[13px] leading-relaxed text-[#62697A]">
                  {project.stack.map((tool, i) => (
                    <React.Fragment key={tool}>
                      {i > 0 && <span className="text-[#8B93A0]"> &middot; </span>}
                      <span className="strip-tok">{tool}</span>
                    </React.Fragment>
                  ))}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
