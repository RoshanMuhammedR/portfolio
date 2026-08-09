import { roles } from "@/content/work";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechChipRow } from "@/components/ui/TechChip";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/ui/Reveal";

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24"
    >
      <Reveal>
        <SectionHeader
          index="02"
          label="Experience"
          meta="2026"
          headingId="experience-heading"
        />
      </Reveal>

      {roles.map((role) => (
        <Reveal key={role.slug} delay={60}>
          <article className="mt-10 border-t border-line pt-8">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
              <div>
                <h3 className="text-2xl font-medium tracking-tight sm:text-[1.75rem]">
                  {role.name}
                </h3>
                <p className="mt-1 text-[0.9375rem] text-ink-dim">{role.role}</p>
              </div>
              <p className="mono-label tabular shrink-0">{role.period}</p>
            </header>

            <p className="mt-6 max-w-measure text-[0.9375rem] leading-relaxed text-ink">
              {role.tagline}
            </p>

            {/* The résumé bullets, given titles so they scan in two seconds. */}
            <dl className="mt-8 max-w-measure">
              {role.caseStudy.build.map((item) => (
                <div key={item.title} className="border-t border-line py-4">
                  <dt className="text-[0.9375rem] font-medium text-ink">{item.title}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-ink-dim">
                    {item.body}
                  </dd>
                </div>
              ))}
            </dl>

            <TechChipRow items={role.stack} className="mt-6" />

            <div className="mt-7">
              <ArrowLink
                href={`/work/${role.slug}`}
                direction="next"
                className="text-ink"
              >
                Read the case study
              </ArrowLink>
            </div>
          </article>
        </Reveal>
      ))}
    </section>
  );
}
