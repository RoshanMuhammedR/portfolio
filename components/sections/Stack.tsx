import { skillGroups } from "@/content/skills";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

export function Stack() {
  return (
    <section
      id="stack"
      aria-labelledby="stack-heading"
      className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24"
    >
      <Reveal>
        <SectionHeader
          index="03"
          label="Stack"
          meta="Working knowledge"
          headingId="stack-heading"
        />
      </Reveal>

      {/* A ledger, not a rating. No bars, no percentages, no invented levels. */}
      <dl className="mt-10 border-t border-line">
        {skillGroups.map((group, index) => (
          <Reveal key={group.label} delay={index * 60}>
            <div className="grid gap-2 border-b border-line py-5 sm:grid-cols-[10rem_1fr] sm:gap-8 sm:py-6">
              <dt className="mono-label pt-1 text-accent">{group.label}</dt>
              <dd className="flex flex-wrap items-baseline gap-x-1 gap-y-2">
                {group.items.map((item, itemIndex) => (
                  <span key={item} className="text-[0.9375rem] text-ink">
                    {item}
                    {itemIndex < group.items.length - 1 ? (
                      <span aria-hidden="true" className="px-2 text-ink-faint">
                        ·
                      </span>
                    ) : null}
                  </span>
                ))}
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
