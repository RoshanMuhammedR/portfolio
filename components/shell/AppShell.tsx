"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SoundProvider } from "@/lib/sound";
import { Sidebar } from "./Sidebar";
import { CornerControls } from "./CornerControls";
import { MoonMark } from "./MoonMark";
import { siteIdentity } from "@/content/site";

/**
 * The frame every page sits in.
 *
 * On desktop the rail is `position: fixed` at the grid margin, 40px down, and
 * the page grid simply leaves column 1 empty for it. Craft is the exception:
 * its canvas runs edge to edge, so the rail and the controls become floating
 * panels over it rather than sitting beside it.
 *
 * Below 1050px the rail cannot fit, so it becomes a bar and a drawer.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onCanvas = pathname.startsWith("/craft");
  // Pages that use the whole width: an article is centred across the grid,
  // and the studio is a set of wide forms. The plate that backs the media side
  // on every other page would cut straight through either of them.
  const fullWidth =
    /^\/writings\/[^/]+$/.test(pathname) || pathname.startsWith("/studio");

  // The route the drawer was opened on. Deriving "open" from it means any
  // navigation - a nav link, or the back button - closes the drawer on its own.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const menuOpen = openedOn === pathname;
  const setMenuOpen = useCallback(
    (open: boolean) => setOpenedOn(open ? pathname : null),
    [pathname],
  );

  // A Supabase email link sent from the dashboard, or from an address Supabase
  // does not recognise, lands on the project's Site URL - the root. Only the
  // studio reads what it carries (a session or an error), so forward it there
  // instead of letting the home page drop it.
  useEffect(() => {
    if (pathname.startsWith("/studio")) return;
    const { hash, search } = window.location;
    const hasTokens =
      hash.includes("access_token=") || hash.includes("error_description=");
    const hasCode = new URLSearchParams(search).has("code");
    if (hasTokens || hasCode) window.location.replace(`/studio${search}${hash}`);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen, setMenuOpen]);

  return (
    <SoundProvider>
      {/* ---- under 1050px: a bar, and the rail as a drawer ---- */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-n200 bg-n50/90 px-5 backdrop-blur-md min-[1050px]:hidden">
        <span className="flex items-center gap-2.5">
          <MoonMark className="h-6 w-6 text-p600" />
          <span className="text-[15px] font-semibold tracking-[-0.01em]">
            {siteIdentity.name}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-n500 transition-colors hover:bg-n100 hover:text-n900"
        >
          {menuOpen ? (
            <X className="h-[18px] w-[18px]" aria-hidden="true" />
          ) : (
            <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
          )}
        </button>
      </header>

      {menuOpen && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-n950/40 min-[1050px]:hidden"
        />
      )}
      <div
        id="mobile-nav"
        inert={!menuOpen}
        className={`fixed inset-y-0 left-0 z-50 w-[min(78vw,290px)] overflow-y-auto border-r border-n200 bg-n50 p-8 transition-transform duration-300 ease-out min-[1050px]:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setMenuOpen(false)} />
        <div className="mt-12">
          <CornerControls />
        </div>
      </div>

      {/* ---- 1050px and up ---- */}
      {onCanvas ? (
        <>
          <aside className="site-panel fixed left-[19px] top-[19px] z-[5] hidden w-[206px] min-[1050px]:block">
            <Sidebar />
          </aside>
          <div className="site-panel fixed bottom-[19px] left-[19px] z-[5] hidden !px-3 !py-2 min-[1050px]:block">
            <CornerControls />
          </div>
        </>
      ) : (
        <>
          {/* The rail's box is wider than its links - the role line alone runs
              past the copy column's left edge - so the box ignores the pointer
              and only the links take it. Otherwise it silently swallows hovers
              and clicks on the first word of every row beside it. */}
          <aside className="pointer-events-none fixed left-10 top-10 z-[5] hidden min-[1050px]:block">
            <Sidebar />
          </aside>
          <div className="fixed bottom-10 left-10 z-[5] hidden min-[1050px]:block">
            <CornerControls />
          </div>
          {fullWidth ? null : (
            <div
              className="site-right-plate hidden min-[1050px]:block"
              aria-hidden="true"
            />
          )}
        </>
      )}

      <main id="main">{children}</main>
    </SoundProvider>
  );
}
