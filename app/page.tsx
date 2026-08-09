import { Hero } from "@/components/sections/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Experience } from "@/components/sections/Experience";
import { Stack } from "@/components/sections/Stack";
import { Education } from "@/components/sections/Education";
import { Contact } from "@/components/sections/Contact";
import { site } from "@/content/site";
import { work } from "@/content/work";

/** Structured data so search results carry the role, links and projects. */
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  email: `mailto:${site.email}`,
  url: site.url,
  address: { "@type": "PostalAddress", addressLocality: "Tanjore", addressCountry: "IN" },
  sameAs: [site.socials.github, site.socials.linkedin],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "SASTRA Deemed University",
  },
  knowsAbout: work.flatMap((item) => item.stack),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <Hero />
      <SelectedWork />
      <Experience />
      <Stack />
      <Education />
      <Contact />
    </>
  );
}
