import { education } from "@/content/education";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

export function Education() {
  return (
    <section
      id="education"
      aria-labelledby="education-heading"
      className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24"
    >
      <Reveal>
        <SectionHeader
          index="04"
          label="Education"
          meta="2010 — 2026"
          headingId="education-heading"
        />
      </Reveal>

      <ol className="mt-10 border-t border-line">
        {education.map((entry, index) => (
          <li key={entry.institution}>
            <Reveal delay={index * 60}>
              <article className="grid gap-3 border-b border-line py-6 sm:grid-cols-[10rem_1fr] sm:gap-8 sm:py-7">
                <div className="mono-label tabular flex gap-3 pt-1 sm:flex-col sm:gap-1.5">
                  <span>{entry.period}</span>
                  <span className="text-ink-faint">{entry.location}</span>
                </div>

                <div>
                  <h3 className="text-lg font-medium tracking-tight text-ink">
                    {entry.institution}
                  </h3>
                  <p className="mt-1 text-[0.9375rem] text-ink-dim">
                    {entry.qualification}
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {entry.facts.map((fact) => (
                      <li
                        key={fact}
                        className="flex gap-2.5 text-sm leading-relaxed text-ink-dim"
                      >
                        <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-line-strong" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
