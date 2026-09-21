"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, connectItems, siteIdentity } from "@/content/site";
import { useSound } from "@/lib/sound";
import { MoonMark } from "./MoonMark";

/**
 * Brand over nav, with 100px of air between them - the same gap the shell grid
 * puts between its 32px brand row and the content row, which is why the first
 * nav item and the first line of every page both land on y=172.
 */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { play } = useSound();

  return (
    <div className="flex flex-col items-start gap-[100px]">
      <Link
        href="/"
        onClick={() => {
          play("click");
          onNavigate?.();
        }}
        onMouseEnter={() => play("hover")}
        className="group pointer-events-auto flex h-8 w-fit items-center gap-3"
      >
        <MoonMark className="h-8 w-8 shrink-0 text-p600 transition-transform duration-500 group-hover:-rotate-[18deg]" />
        <span className="leading-none">
          <span className="block text-[15px] font-semibold tracking-[-0.01em] text-n900">
            {siteIdentity.name}
          </span>
          <span className="mt-[3px] block whitespace-nowrap text-[12px] font-normal uppercase text-n600">
            {siteIdentity.roleLabel}
          </span>
        </span>
      </Link>

      <nav className="flex flex-col gap-[38px]" aria-label="Main">
        <NavGroup label="Menu">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => {
                    play("click");
                    onNavigate?.();
                  }}
                  onMouseEnter={() => play("hover")}
                  className={`pointer-events-auto block w-fit text-[14px] font-medium leading-[21px] tracking-[-0.01em] transition-colors duration-[120ms] ${
                    active ? "text-n900" : "text-n600 hover:text-n900"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </NavGroup>

        <NavGroup label="Connect">
          {connectItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {})}
                // A PDF or another site: nothing for the router to prefetch.
                prefetch={item.external ? false : undefined}
                onClick={() => {
                  play("click");
                  onNavigate?.();
                }}
                onMouseEnter={() => play("hover")}
                className="pointer-events-auto block w-fit text-[14px] font-medium leading-[21px] tracking-[-0.01em] text-n600 transition-colors duration-[120ms] hover:text-n900"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </NavGroup>
      </nav>
    </div>
  );
}

function NavGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-1.5 text-[13px] font-medium leading-[19.5px] tracking-[-0.01em] text-n500">
        {label}
      </h2>
      <ul className="flex flex-col gap-[6.5px]">{children}</ul>
    </div>
  );
}
