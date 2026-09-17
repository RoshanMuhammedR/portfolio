import type { Metadata } from "next";
import {
  SplitPage,
  BackCrumb,
  PageHeading,
} from "@/components/shell/SplitPage";
import { WorksList, type WorkEntry } from "@/components/works/WorksList";
import { getWorkItems } from "@/lib/content";
import { getSiteConfig } from "@/lib/settings";

export const metadata: Metadata = { title: "Works" };

/** New works appear within the minute, without a redeploy. */
export const revalidate = 60;

export default async function WorksPage() {
  const [works, config] = await Promise.all([getWorkItems(), getSiteConfig()]);

  const entries: WorkEntry[] = works
    .filter((work) => work.showOnWorks)
    .map((work) => ({
      id: work.id,
      name: work.title,
      tags: work.tags.slice(0, 2),
      href: work.href,
      glow: work.glow,
      image: work.image,
      caption: work.image
        ? `${work.subtitle} · live site`
        : work.kind === "experience"
          ? work.subtitle
          : `${work.subtitle} · source on GitHub`,
    }));

  return (
    <SplitPage
      copy={
        <>
          <BackCrumb />
          <PageHeading title="Works">
            An internship and the projects built end to end around it. Every
            one is public on GitHub, except the internship.
          </PageHeading>
          <WorksList entries={entries} config={config.works.ring} />
        </>
      }
    />
  );
}
