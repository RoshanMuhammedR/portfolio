import Link from "next/link";
import { SplitPage } from "@/components/shell/SplitPage";
import { navItems } from "@/content/site";

export default function NotFound() {
  return (
    <SplitPage
      copy={
        <>
          <span className="block text-[14px] tracking-[-0.01em] text-n500">[ / 404 ]</span>
          <h1 className="mt-[19px] text-[20px] font-semibold leading-[26px] tracking-[-0.02em] text-n900">
            This path is not wired up.
          </h1>
          <p className="mt-2 text-[14px] leading-[22px] tracking-[-0.01em] text-n500">
            The link is out of date, or the page it pointed at was renamed.
          </p>
          <ul className="mt-8 flex flex-col gap-[7px]">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[14px] font-medium leading-[21px] tracking-[-0.01em] text-n500 transition-colors duration-[120ms] hover:text-n900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </>
      }
    />
  );
}
