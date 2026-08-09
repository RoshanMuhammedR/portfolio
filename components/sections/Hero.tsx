import { site } from "@/content/site";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/ui/Reveal";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28"
    >
      <Reveal>
        <p className="mono-label flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-accent">00</span>
          <span aria-hidden="true" className="text-ink-faint">
            /
          </span>
          <span>{site.name}</span>
          <span aria-hidden="true" className="inline-block h-px w-8 bg-line" />
          <span>{site.role}</span>
        </p>
      </Reveal>

      <Reveal delay={60}>
        <h1
          id="hero-heading"
          className="mt-7 max-w-4xl text-[2.5rem] leading-[1.04] font-medium tracking-[-0.03em] text-balance sm:text-6xl lg:text-7xl"
        >
          I build full-stack products
          <span className="text-ink-faint"> — </span>
          <span className="text-accent">end to end.</span>
        </h1>
      </Reveal>

      <Reveal delay={120}>
        <p className="mt-7 max-w-measure text-lg leading-relaxed text-ink-dim sm:text-xl">
          Product surfaces in <Term>Next.js</Term> and <Term>React</Term>, APIs in{" "}
          <Term>NestJS</Term> and <Term>FastAPI</Term>, and the <Term>PostgreSQL</Term>,{" "}
          <Term>Redis</Term> and queue layers underneath that keep them fast.
        </p>
      </Reveal>

      {/* Spec block — the résumé header, rendered as a datasheet. */}
      <Reveal delay={180}>
        <dl className="mt-12 max-w-measure border-t border-line">
          {site.spec.map((row) => (
            <div
              key={row.key}
              className="flex flex-col gap-1 border-b border-line py-3 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <dt className="mono-label sm:w-32 sm:shrink-0">{row.key}</dt>
              <dd className="text-sm text-ink sm:text-[0.9375rem]">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal delay={240}>
        <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
          <ArrowLink href="#work" direction="next" className="text-ink">
            Selected work
          </ArrowLink>
          <ArrowLink href={site.resume}>Résumé</ArrowLink>
          <ArrowLink href={site.socials.github}>GitHub</ArrowLink>
          <ArrowLink href={site.socials.linkedin}>LinkedIn</ArrowLink>
          <ArrowLink href={`mailto:${site.email}`} direction="out">
            Email
          </ArrowLink>
        </div>
      </Reveal>
    </section>
  );
}

/** Lifts a technology name out of the lede without turning it into a link. */
function Term({ children }: { children: React.ReactNode }) {
  return <span className="text-ink">{children}</span>;
}
