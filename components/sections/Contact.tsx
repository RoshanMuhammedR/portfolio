import { site } from "@/content/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/sections/ContactForm";

const directLinks = [
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "Phone", value: site.phone, href: `tel:${site.phoneHref}` },
  { label: "GitHub", value: "RoshanMuhammedR", href: site.socials.github },
  { label: "LinkedIn", value: "roshan2004", href: site.socials.linkedin },
];

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24"
    >
      <Reveal>
        <SectionHeader
          index="05"
          label="Contact"
          meta="Open to opportunities"
          headingId="contact-heading"
        />
      </Reveal>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_18rem] lg:gap-16">
        <Reveal>
          <p className="max-w-measure text-lg leading-relaxed text-ink text-balance sm:text-xl">
            If you are hiring, building something interesting, or just want to compare
            notes on retrieval systems and job queues — send a message.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </Reveal>

        <Reveal delay={80}>
          <dl className="border-t border-line">
            {directLinks.map((link) => (
              <div key={link.label} className="border-b border-line py-3.5">
                <dt className="mono-label">{link.label}</dt>
                <dd className="mt-1.5">
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                    className="text-sm break-all text-ink transition-colors hover:text-accent"
                  >
                    {link.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>

          <a
            href={site.resume}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 inline-flex w-full items-center justify-between border border-line px-4 py-3 font-mono text-[0.6875rem] tracking-widest text-ink uppercase transition-colors hover:border-accent hover:text-accent"
          >
            Download résumé
            <span aria-hidden="true">↓</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
