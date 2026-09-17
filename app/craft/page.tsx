import type { Metadata } from "next";
import { Hand } from "lucide-react";
import { InfiniteCraftBoard } from "@/components/craft/InfiniteCraftBoard";
import { getCraftItems } from "@/lib/content";
import { getSiteConfig } from "@/lib/settings";

export const metadata: Metadata = { title: "Craft" };

/** New cards appear within the minute, without a redeploy. */
export const revalidate = 60;

export default async function CraftPage() {
  const [craftItems, config] = await Promise.all([
    getCraftItems(),
    getSiteConfig(),
  ]);
  const empty = craftItems.length === 0;

  return (
    <div className="relative">
      {empty ? (
        <div className="dot-field h-dvh w-full bg-n50" aria-hidden="true" />
      ) : (
        <InfiniteCraftBoard items={craftItems} config={config.craft.board} />
      )}

      {/* Rides above the board rather than on it, so the intro stays put while
          the work moves underneath. On the phone the rail is a bar, so the
          panel comes back to the left margin. */}
      <div className="site-panel absolute left-5 top-[76px] z-[5] flex w-[min(calc(100vw-40px),311px)] flex-col gap-2 min-[1050px]:left-[245px] min-[1050px]:top-[19px]">
        <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-n600">
          Craft
        </h1>
        <p className="text-[14px] font-normal tracking-[-0.01em] text-n500">
          Explorations, unreleased work, and small things built for the fun of
          it. :)
        </p>
        {empty ? (
          <p className="text-[14px] font-medium tracking-[-0.01em] text-n600">
            Nothing pinned to the board yet.
          </p>
        ) : (
          <p className="inline-flex items-center gap-1.5 whitespace-nowrap text-[14px] font-medium tracking-[-0.01em] text-n600">
            <span className="shrink-0">Drag to explore</span>
            <Hand className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </p>
        )}
      </div>
    </div>
  );
}
