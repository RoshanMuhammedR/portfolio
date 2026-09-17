import { identityData } from "@/content/portfolioData";

export type NavItem = { label: string; href: string };

/** The five pages, in sidebar order. */
export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Works", href: "/works" },
  { label: "About", href: "/about" },
  { label: "Writings", href: "/writings" },
  { label: "Craft", href: "/craft" },
];

export type ConnectItem = {
  label: string;
  href: string;
  external?: boolean;
};

/** "Message me" opens the contact panel; the résumé is the site's own PDF, in a
 *  new tab; the rest leave the site. */
export const connectItems: ConnectItem[] = [
  { label: "Message me", href: "/contact" },
  { label: "Résumé", href: identityData.resumeUrl, external: true },
  { label: "Github", href: identityData.githubUrl, external: true },
  { label: "Linkedin", href: identityData.linkedinUrl, external: true },
  { label: "Email", href: `mailto:${identityData.email}`, external: true },
];

export const siteIdentity = {
  name: "Roshan",
  fullName: identityData.name,
  role: "Full-stack engineer",
  roleLabel: "FULL-STACK ENGINEER",
  location: identityData.location,
  email: identityData.email,
  resumeUrl: identityData.resumeUrl,
  /** Shown beside the "Let's talk" button. Factual, not a claim about demand. */
  availability: "Open to full-time roles",
} as const;
