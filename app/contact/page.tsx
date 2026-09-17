import type { Metadata } from "next";
import {
  SplitPage,
  BackCrumb,
  PageHeading,
} from "@/components/shell/SplitPage";
import { identityData } from "@/content/portfolioData";

export const metadata: Metadata = { title: "Message me" };

export default function ContactPage() {
  return (
    <SplitPage
      copy={
        <>
          <BackCrumb />
          <PageHeading title="Message me">
            The fastest route is email.
          </PageHeading>
          <a
            href={`mailto:${identityData.email}`}
            className="prose-link mt-[19px] inline-block text-[15px] tracking-[-0.01em]"
          >
            {identityData.email}
          </a>
        </>
      }
    />
  );
}
