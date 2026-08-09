import { site } from "@/content/site";

const links = [
  { label: "Email", href: `mailto:${site.email}` },
  { label: "GitHub", href: site.socials.github },
  { label: "LinkedIn", href: site.socials.linkedin },
  { label: "Résumé", href: site.resume },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="mono-label">
          {site.name} · Built with Next.js &amp; Tailwind
        </p>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer noopener"
                className="font-mono text-[0.6875rem] tracking-widest text-ink-dim uppercase transition-colors hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#top"
              className="font-mono text-[0.6875rem] tracking-widest text-ink-faint uppercase transition-colors hover:text-accent"
            >
              Top ↑
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
