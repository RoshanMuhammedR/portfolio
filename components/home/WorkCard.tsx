"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useSound } from "@/lib/sound";
import type { ProjectImage } from "@/content/projects";

export type WorkCardProps = {
  title: string;
  subtitle: string;
  tags: string[];
  /** Absent for proprietary work - the card then carries no link at all. */
  href?: string;
  /** Two tuned stops behind the title, used when there is no screenshot. */
  glow: string;
  image?: ProjectImage;
  /** How wide the screenshot is drawn, from the row it sits in. */
  sizes?: string;
  /** For the rows on screen at load: fetched first instead of lazily. */
  priority?: boolean;
};

/**
 * A live screenshot when the deployment could be captured, a title card when it
 * could not. Never a mocked-up browser frame - that would read as a capture.
 */
export function WorkCard({
  title,
  subtitle,
  tags,
  href,
  glow,
  image,
  sizes = "(max-width: 1049px) calc(100vw - 40px), calc(100vw - 692px)",
  priority = false,
}: WorkCardProps) {
  const { play } = useSound();

  const card = (
    <>
      <div
        className="relative flex h-[345px] items-center justify-center overflow-hidden rounded-lg border border-n200 max-[1439px]:aspect-[16/10] max-[1439px]:h-auto"
        style={image ? { background: "#0E0F13" } : { backgroundImage: glow }}
      >
        {image ? (
          <Image
            src={image.src}
            alt={`${title}, screenshot of the live site`}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
            style={{ objectPosition: image.position ?? "center top" }}
          />
        ) : (
          <span className="px-8 text-center text-[28px] font-bold leading-[1.25] tracking-[-0.02em] text-white">
            {title}
          </span>
        )}
        {href ? (
          <ArrowUpRight
            className={`absolute right-4 top-4 h-5 w-5 rounded-full p-0.5 transition-all duration-300 group-hover:right-[13px] group-hover:top-[13px] ${
              image
                ? "bg-black/45 text-white/80 group-hover:text-white"
                : "text-white/45 group-hover:text-white"
            }`}
            aria-hidden="true"
          />
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-[14px] font-medium tracking-[-0.01em] text-n600">
          {image ? (
            <>
              <span className="text-n900">{title}</span>
              <span className="font-normal text-n500"> — {subtitle}</span>
            </>
          ) : (
            subtitle
          )}
        </span>
        <span className="text-[14px] font-normal tracking-[-0.01em] text-n500">
          {tags.join(" • ")}
        </span>
      </div>
    </>
  );

  if (!href) {
    return <div className="group">{card}</div>;
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onMouseEnter={() => play("hover")}
      onClick={() => play("click")}
      className="group block"
    >
      {card}
    </Link>
  );
}
