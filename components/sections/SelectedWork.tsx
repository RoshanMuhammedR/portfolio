import Image from "next/image";
import Link from "next/link";
import { projects } from "@/content/work";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechChipRow } from "@/components/ui/TechChip";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/ui/Reveal";

export function SelectedWork() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24"
    >
      <Reveal>
        <SectionHeader
          index="01"
          label="Selected work"
          meta={`${projects.length} projects`}
          headingId="work-heading"
        />
      </Reveal>

      {/* Hovering one row dims its siblings, so attention lands on one thing. */}
      <ul className="group/list mt-10 border-t border-line">
        {projects.map((project, index) => (
          <li key={project.slug}>
            <Reveal delay={index * 80}>
              <article className="group/item border-b border-line py-8 transition-opacity duration-300 group-hover/list:opacity-45 hover:opacity-100! sm:py-10">
                <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:gap-10">
                  <div className="order-2 lg:order-1">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <h3 className="text-2xl font-medium tracking-tight sm:text-[1.75rem]">
                        <Link
                          href={`/work/${project.slug}`}
                          className="transition-colors group-hover/item:text-accent"
                        >
                          {project.name}
                        </Link>
                      </h3>
                      <span className="mono-label">{project.tag}</span>
                    </div>

                    <p className="mt-3 max-w-measure text-[0.9375rem] leading-relaxed text-ink sm:text-base">
                      {project.tagline}
                    </p>

                    <p className="mt-3 max-w-measure text-sm leading-relaxed text-ink-dim">
                      {project.summary}
                    </p>

                    <TechChipRow items={project.stack} className="mt-5" />

                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                      <ArrowLink
                        href={`/work/${project.slug}`}
                        direction="next"
                        className="text-ink"
                      >
                        Case study
                      </ArrowLink>
                      {project.links.live ? (
                        <ArrowLink href={project.links.live}>Live site</ArrowLink>
                      ) : null}
                      {project.links.repo ? (
                        <ArrowLink href={project.links.repo}>Source</ArrowLink>
                      ) : null}
                    </div>
                  </div>

                  <div className="order-1 lg:order-2">
                    <Thumbnail project={project} priority={index === 0} />
                  </div>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Thumbnail({
  project,
  priority,
}: {
  project: (typeof projects)[number];
  priority: boolean;
}) {
  const image = project.image;

  if (!image || image.placeholder) {
    return (
      <div
        aria-hidden="true"
        className="flex aspect-[1907/929] w-full items-center justify-center border border-line bg-surface"
      >
        <span className="mono-label text-center leading-relaxed">
          Figure
          <br />
          pending
        </span>
      </div>
    );
  }

  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={1907}
      height={929}
      sizes="(min-width: 1024px) 20rem, 100vw"
      priority={priority}
      className="w-full border border-line transition-[border-color] duration-300 group-hover/item:border-line-strong"
    />
  );
}
