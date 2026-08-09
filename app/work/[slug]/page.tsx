import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkItem, work, type WorkItem } from "@/content/work";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TechChipRow } from "@/components/ui/TechChip";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/ui/Reveal";
import { SagaDiagram } from "@/components/work/diagrams/SagaDiagram";
import { TripDiagram } from "@/components/work/diagrams/TripDiagram";
import { KonnectifyDiagram } from "@/components/work/diagrams/KonnectifyDiagram";

const diagrams = {
  saga: SagaDiagram,
  trip: TripDiagram,
  konnectify: KonnectifyDiagram,
} as const;

export function generateStaticParams() {
  return work.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getWorkItem(slug);

  if (!item) return {};

  return {
    title: item.name,
    description: item.tagline,
    openGraph: {
      title: item.name,
      description: item.tagline,
      type: "article",
      url: `/work/${item.slug}`,
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getWorkItem(slug);

  if (!item) notFound();

  const Diagram = diagrams[item.diagram];
  const index = work.findIndex((entry) => entry.slug === item.slug);
  const next = work[(index + 1) % work.length];

  return (
    <article className="mx-auto max-w-6xl px-5 pt-12 pb-20 sm:px-8 sm:pt-16 sm:pb-24">
      <Reveal>
        <Link
          href="/#work"
          className="group/back inline-flex items-center gap-2 font-mono text-xs tracking-wider text-ink-dim uppercase transition-colors hover:text-accent"
        >
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-300 group-hover/back:-translate-x-1"
          >
            ←
          </span>
          All work
        </Link>
      </Reveal>

      <Reveal delay={60}>
        <header className="mt-8">
          <p className="mono-label flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span aria-hidden="true" className="text-ink-faint">
              /
            </span>
            <span>{item.kind === "experience" ? "Experience" : "Project"}</span>
            <span aria-hidden="true" className="inline-block h-px w-8 bg-line" />
            <span>{item.tag}</span>
          </p>

          <h1 className="mt-6 text-[2.25rem] leading-[1.06] font-medium tracking-[-0.03em] sm:text-6xl">
            {item.name}
          </h1>

          <p className="mt-6 max-w-measure text-lg leading-relaxed text-ink-dim text-balance sm:text-xl">
            {item.tagline}
          </p>

          <Meta item={item} />

          {(item.links.live || item.links.repo) && (
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              {item.links.live ? (
                <ArrowLink href={item.links.live} className="text-ink">
                  Live site
                </ArrowLink>
              ) : null}
              {item.links.repo ? (
                <ArrowLink href={item.links.repo}>Source code</ArrowLink>
              ) : null}
            </div>
          )}
        </header>
      </Reveal>

      {item.image ? (
        <Reveal delay={120}>
          <Figure item={item} />
        </Reveal>
      ) : null}

      <Section index="A" label="Context">
        {item.caseStudy.context.map((paragraph) => (
          <p
            key={paragraph.slice(0, 32)}
            className="max-w-measure text-[1.0625rem] leading-relaxed text-ink-dim"
          >
            {paragraph}
          </p>
        ))}
      </Section>

      <Section index="B" label="What I built">
        <dl className="max-w-measure border-t border-line">
          {item.caseStudy.build.map((entry) => (
            <div key={entry.title} className="border-b border-line py-5">
              <dt className="text-base font-medium text-ink">{entry.title}</dt>
              <dd className="mt-2 text-[0.9375rem] leading-relaxed text-ink-dim">
                {entry.body}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section index="C" label="Architecture">
        <Diagram />
      </Section>

      <Section index="D" label="Stack">
        <dl className="border-t border-line">
          {item.caseStudy.stackTable.map((row) => (
            <div
              key={row.name}
              className="grid gap-1 border-b border-line py-4 sm:grid-cols-[14rem_1fr] sm:gap-8"
            >
              <dt className="font-mono text-[0.8125rem] text-accent">{row.name}</dt>
              <dd className="text-[0.9375rem] leading-relaxed text-ink-dim">
                {row.role}
              </dd>
            </div>
          ))}
        </dl>
        <TechChipRow items={item.stack} className="mt-6" />
      </Section>

      <Reveal>
        <nav
          aria-label="More work"
          className="mt-20 flex items-baseline justify-between gap-6 border-t border-line pt-8"
        >
          <span className="mono-label">Next</span>
          <ArrowLink
            href={`/work/${next.slug}`}
            direction="next"
            className="text-base tracking-normal text-ink normal-case"
          >
            {next.name}
          </ArrowLink>
        </nav>
      </Reveal>
    </article>
  );
}

function Meta({ item }: { item: WorkItem }) {
  const rows = [
    item.role ? { key: "Role", value: item.role } : null,
    item.period ? { key: "Period", value: item.period } : null,
    { key: "Type", value: item.kind === "experience" ? "Internship" : "Personal project" },
  ].filter((row): row is { key: string; value: string } => row !== null);

  return (
    <dl className="mt-10 max-w-measure border-t border-line">
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-baseline sm:gap-6"
        >
          <dt className="mono-label sm:w-32 sm:shrink-0">{row.key}</dt>
          <dd className="text-sm text-ink sm:text-[0.9375rem]">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Figure({ item }: { item: WorkItem }) {
  const image = item.image;
  if (!image) return null;

  if (image.placeholder) {
    return (
      <div
        aria-hidden="true"
        className="mt-12 flex aspect-[1907/929] w-full items-center justify-center border border-line bg-surface"
      >
        <span className="mono-label text-center leading-relaxed">
          Screenshot pending
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
      sizes="(min-width: 1152px) 64rem, 100vw"
      priority
      className="mt-12 w-full border border-line"
    />
  );
}

function Section({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  const headingId = `section-${index.toLowerCase()}`;

  return (
    <Reveal as="section" className="mt-16 sm:mt-20">
      <SectionHeader index={index} label={label} headingId={headingId} />
      <div className="mt-8 space-y-5">{children}</div>
    </Reveal>
  );
}
