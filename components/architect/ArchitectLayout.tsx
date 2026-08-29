"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, ChevronDown, ExternalLink, FileText, Github } from 'lucide-react';
import {
  identityData,
  experienceData,
  projectsData,
  stackCategories,
  recruiterFaq
} from '@/content/portfolioData';

const vintageArtwork = '/images/vintage-stipple-etching.jpg';

interface ArchitectLayoutProps {
  onOpenResume: () => void;
  onOpenContact: () => void;
}

/** Shown beside a project title, deliberately outside the heading element so
 *  the accessible name stays the project name alone. */
const projectOrigin: Record<string, string> = {
  saga: 'saga.dedyn.io',
  'ai-trip-planner': 'ai-trip-planner.vercel.app'
};

export const ArchitectLayout: React.FC<ArchitectLayoutProps> = ({
  onOpenResume,
  onOpenContact
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(identityData.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const role = experienceData[0];

  return (
    <div className="w-full bg-plate text-[#121316]">
      {/* ================= HERO ================= */}
      <section
        id="hero"
        aria-labelledby="hero-heading"
        className="relative px-4 sm:px-6 lg:px-8 pt-28 pb-20 sm:pb-24"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7">
              <h1 id="hero-heading" className="rise">
                <span className="block text-lg sm:text-xl font-medium tracking-tight text-[#4E5564]">
                  {identityData.name}
                </span>
                <span className="mt-2 block text-5xl sm:text-7xl lg:text-[84px] font-black leading-[0.94] tracking-[-0.035em] text-[#111214]">
                  The Full-Stack
                  <br />
                  Engineer.
                </span>
              </h1>

              <p className="rise rise-1 mt-7 max-w-xl text-base sm:text-lg leading-relaxed text-[#4E5564]">
                Full-stack engineer building production systems end to end &mdash; product surfaces in{' '}
                <strong className="font-semibold text-[#111214]">Next.js</strong> and{' '}
                <strong className="font-semibold text-[#111214]">React</strong>, APIs in{' '}
                <strong className="font-semibold text-[#111214]">NestJS</strong> and{' '}
                <strong className="font-semibold text-[#111214]">FastAPI</strong>, and the{' '}
                <strong className="font-semibold text-[#111214]">PostgreSQL</strong>,{' '}
                <strong className="font-semibold text-[#111214]">Redis</strong> and{' '}
                <strong className="font-semibold text-[#111214]">queue layers</strong> underneath that
                keep them fast.
              </p>

              <div className="rise rise-2 mt-9 flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenContact}
                  id="hero-contact-btn"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#232832] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#16181F]"
                >
                  <span>Contact Roshan</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <a
                  href="#projects"
                  id="hero-projects-btn"
                  className="inline-flex items-center gap-2 rounded-full bg-[#00FF9D] px-6 py-3.5 text-sm font-bold text-[#121316] transition-colors hover:bg-[#00E88C]"
                >
                  <span>See the work</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>

              <p className="rise rise-3 mt-8 text-sm text-[#62697A]">
                Chennai, India &middot; Open to full-time engineering roles
              </p>
            </div>

            {/* The plate. It is an engraving, not an instrument: nothing here
                reports a measurement, so nothing here is labelled like one. */}
            <div className="rise rise-2 lg:col-span-5">
              <figure className="relative mx-auto w-full max-w-[420px]">
                <div className="relative aspect-square overflow-hidden border border-[#D4D8CF] bg-[#ECEEE9] p-3">
                  <div className="bg-plate-fine pointer-events-none absolute inset-0 opacity-60" />
                  <img
                    src={vintageArtwork}
                    alt="A stipple engraving of a horned chameleon gripping a flowering branch, drawn in the manner of a Victorian natural-history specimen plate."
                    className="relative h-full w-full object-contain mix-blend-multiply"
                    fetchPriority="high"
                  />
                </div>
                <figcaption className="mt-3 flex items-baseline justify-between border-t border-[#D4D8CF] pt-2 font-mono text-[13px] text-[#62697A]">
                  <span>Pl. I &mdash; specimen plate</span>
                  <span>Stipple engraving</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EXPERIENCE ================= */}
      <section
        id="experience"
        aria-labelledby="experience-heading"
        className="border-t border-[#D4D8CF] bg-[#ECEEE9] px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="max-w-7xl mx-auto">
          <h2
            id="experience-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#121316]"
          >
            Where the systems reflex came from
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#4E5564]">
            A full-stack internship on an iPaaS platform: access control, task accounting, and the
            state layer behind a large automation canvas.
          </p>

          <article className="mt-10 border-t-2 border-[#121316] pt-7">
            <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <h3 className="inline text-xl sm:text-2xl font-bold text-[#121316]">
                  {role.company}
                </h3>
                <p className="ml-2 inline text-base text-[#4E5564]">{role.role}</p>
              </div>
              <p className="tabular font-mono text-sm text-[#62697A]">{role.period}</p>
            </header>

            <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#383E4B]">{role.summary}</p>

            <dl className="mt-9 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-3">
              {role.highlights.map((h) => (
                <div key={h.title}>
                  <dt className="text-base font-bold text-[#121316]">{h.title}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-[#4E5564]">{h.description}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-9 border-t border-[#D4D8CF] pt-4 font-mono text-sm leading-relaxed text-[#62697A]">
              {role.stack.join('  ·  ')}
            </p>
          </article>
        </div>
      </section>

      {/* ================= PROJECTS ================= */}
      <section
        id="projects"
        aria-labelledby="projects-heading"
        className="border-t border-[#D4D8CF] bg-[#E9ECE6] px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="max-w-7xl mx-auto">
          <h2
            id="projects-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#121316]"
          >
            Things that are running
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#4E5564]">
            Both are deployed and open source. Each one moves its expensive work off the request path.
          </p>

          <div className="mt-12 space-y-16">
            {projectsData.map((project) => (
              <article key={project.id} className="border-t-2 border-[#121316] pt-7">
                <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-[#121316]">
                      {project.title}
                    </h3>
                    <p className="mt-1.5 text-base text-[#4E5564]">
                      {project.subtitle}
                      <span aria-hidden="true" className="mx-2 text-[#62697A]">
                        &middot;
                      </span>
                      <span className="font-mono text-sm text-[#62697A]">
                        {projectOrigin[project.id]}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#00FF9D] px-4 py-3 text-sm font-bold text-[#121316] transition-colors hover:bg-[#00E88C]"
                      >
                        <span>Open live</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#C6CCC0] px-4 py-3 text-sm font-semibold text-[#232832] transition-colors hover:border-[#121316]"
                      >
                        <Github className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Source</span>
                      </a>
                    )}
                  </div>
                </header>

                <div className="mt-7 grid grid-cols-1 gap-x-14 gap-y-8 lg:grid-cols-12">
                  <p className="text-base leading-relaxed text-[#383E4B] lg:col-span-5">
                    {project.description}
                  </p>

                  <ul className="space-y-3.5 lg:col-span-7">
                    {project.architectureHighlights.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3.5 border-b border-[#D4D8CF] pb-3.5 text-base leading-relaxed text-[#383E4B] last:border-0"
                      >
                        <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-[#121316]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-7 font-mono text-sm leading-relaxed text-[#62697A]">
                  {project.stack.join('  ·  ')}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STACK ================= */}
      <section
        id="stack"
        aria-labelledby="stack-heading"
        className="border-t border-[#D4D8CF] bg-[#ECEEE9] px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="max-w-7xl mx-auto">
          <h2
            id="stack-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#121316]"
          >
            What the work is made of
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#4E5564]">
            A bill of materials, not a rating. No bars, no percentages, no invented levels &mdash;
            these are the tools the work above was actually built with.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {stackCategories.map((cat) => (
              <div key={cat.layer}>
                <h3 className="border-b-2 border-[#121316] pb-2.5 text-base font-bold text-[#121316]">
                  {cat.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#62697A]">{cat.description}</p>
                <dl className="mt-5 space-y-3.5">
                  {cat.skills.map((skill) => (
                    <div key={skill.name} className="border-b border-[#DFE2DA] pb-3 last:border-0">
                      <dt className="text-sm font-semibold text-[#121316]">{skill.name}</dt>
                      {skill.useCase && (
                        <dd className="mt-0.5 font-mono text-[13px] leading-snug text-[#62697A]">
                          {skill.useCase}
                        </dd>
                      )}
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="border-t border-[#D4D8CF] bg-[#E9ECE6] px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="max-w-3xl mx-auto">
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#121316]"
          >
            Questions people ask
          </h2>

          <div className="mt-10 border-t border-[#121316]">
            {recruiterFaq.map((faq, index) => {
              const isOpen = openFaq === index;
              const panelId = `faq-panel-${index}`;
              const buttonId = `faq-button-${index}`;
              return (
                <div key={faq.question} className="border-b border-[#D4D8CF]">
                  <h3>
                    <button
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left text-base font-semibold text-[#121316] transition-colors hover:text-[#076B39]"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-5 w-5 shrink-0 text-[#62697A] transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 pr-10 text-base leading-relaxed text-[#4E5564]">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CLOSE ================= */}
      <section
        aria-labelledby="close-heading"
        className="border-t border-[#D4D8CF] bg-[#ECEEE9] px-4 sm:px-6 lg:px-8 py-24"
      >
        <div className="max-w-3xl mx-auto">
          <h2
            id="close-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.05] tracking-[-0.035em] text-[#121316]"
          >
            If this is the kind of problem you are hiring for, I would like to hear about it.
          </h2>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenContact}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#232832] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#16181F]"
            >
              <span>Start a conversation</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              onClick={onOpenResume}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#C6CCC0] px-6 py-3.5 text-sm font-semibold text-[#232832] transition-colors hover:border-[#121316]"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span>R&eacute;sum&eacute;</span>
            </button>

            <button
              onClick={handleCopyEmail}
              className="cursor-pointer rounded-full px-3 py-3.5 font-mono text-sm text-[#62697A] underline decoration-[#B9BFB2] underline-offset-4 transition-colors hover:text-[#121316] hover:decoration-[#121316]"
            >
              {copiedEmail ? 'Copied to clipboard' : identityData.email}
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[#D4D8CF] bg-[#E4E7E1] px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col items-start justify-between gap-2 font-mono text-[13px] text-[#4E5564] sm:flex-row sm:items-center">
          <p>{identityData.name} &middot; Full-stack engineer</p>
          <p>Chennai, India</p>
          <a
            href={`mailto:${identityData.email}`}
            className="underline decoration-[#B9BFB2] underline-offset-4 transition-colors hover:text-[#121316] hover:decoration-[#121316]"
          >
            {identityData.email}
          </a>
        </div>
      </footer>
    </div>
  );
};
