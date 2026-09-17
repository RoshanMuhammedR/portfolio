import type { Metadata } from "next";
import Link from "next/link";
import {
  SplitPage,
  BackCrumb,
  PageHeading,
} from "@/components/shell/SplitPage";
import { InterestsScene } from "@/components/about/InterestsScene";
import { InterestsCollage } from "@/components/about/InterestsCollage";
import { toSceneObject } from "@/components/about/sceneTypes";
import { aboutSections, educationFacts } from "@/content/about";
import { siteIdentity } from "@/content/site";
import { getInterests } from "@/lib/content";
import { getSiteConfig } from "@/lib/settings";

export const metadata: Metadata = { title: "About" };

/** Favourites added in the studio appear within the minute. */
export const revalidate = 60;

/** Just enough tilt to read as pinned up rather than laid out. */
const TILTS = [-2.5, 1.8, -1.2, 2.6, -1.9];

export default async function AboutPage() {
  const [interests, config] = await Promise.all([
    getInterests(),
    getSiteConfig(),
  ]);
  const objects = interests.map(toSceneObject);

  // Nothing is invented here: with no favourites entered, the page keeps the
  // record it has always shown rather than a scene of made-up ones.
  const facts = (
    <div className="flex h-full items-center">
      <ul className="flex flex-wrap content-center gap-4 lg:max-w-[560px]">
        {educationFacts.map((fact, i) => (
          <li
            key={fact.label}
            style={{ rotate: `${TILTS[i]}deg` }}
            className="rounded-lg border border-n200 bg-n100 px-5 py-4 shadow-[var(--panel-shadow)] transition-transform duration-300 hover:rotate-0"
          >
            <span className="block text-[12px] font-medium uppercase tracking-[-0.01em] text-n500">
              {fact.label}
            </span>
            <span className="mt-1.5 block text-[28px] font-bold leading-[1.3] tracking-[-0.02em] text-n900">
              {fact.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <SplitPage
      mediaClassName={objects.length > 0 ? "page-media-scene" : undefined}
      copy={
        <>
          <BackCrumb />
          <PageHeading title="About me" />

          {aboutSections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-n900">
                {section.heading}
              </h2>
              <div className="mt-3 flex flex-col gap-5">
                {section.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-[15px] leading-[23px] tracking-[-0.01em] text-n900"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <p className="mt-8 text-[15px] leading-[23px] tracking-[-0.01em] text-n900">
            Based in {siteIdentity.location}.{" "}
            <Link href="/contact" className="prose-link">
              Message me
            </Link>{" "}
            or{" "}
            <a href={siteIdentity.resumeUrl} className="prose-link">
              read the résumé
            </a>
            .
          </p>
        </>
      }
      media={
        objects.length > 0 ? (
          <InterestsScene
            objects={objects}
            config={config.about.scene}
            fallback={<InterestsCollage objects={objects} />}
          />
        ) : (
          facts
        )
      }
    />
  );
}
