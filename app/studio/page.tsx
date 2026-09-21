"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { useOwnerSession } from "@/lib/useOwnerSession";
import { SignIn } from "@/components/studio/SignIn";
import { CraftEditor } from "@/components/studio/CraftEditor";
import { WritingsEditor } from "@/components/studio/WritingsEditor";
import { ProjectsEditor } from "@/components/studio/ProjectsEditor";
import { InterestsEditor } from "@/components/studio/InterestsEditor";
import { SettingsEditor } from "@/components/studio/SettingsEditor";

const TABS = [
  { key: "projects", label: "Projects" },
  { key: "writings", label: "Writings" },
  { key: "craft", label: "Craft" },
  { key: "interests", label: "Interests" },
  { key: "settings", label: "Settings" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export default function StudioPage() {
  const state = useOwnerSession();
  const [tab, setTab] = useState<Tab>("projects");

  return (
    // On the page grid like every other page: beside the rail, first line at
    // y=172, and above anything fixed behind it.
    <div className="page-grid">
      <div className="studio-column">
        <header className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="text-[1.35rem] font-medium tracking-tight">Studio</h1>
            <p className="mt-2 text-[13px] text-n900">
              Works, writing, craft, the About desk and the site&rsquo;s settings
              are all edited here.
            </p>
          </div>
          {state.status === "signed-in" ? (
            <div className="flex items-center gap-3 text-[12px] text-n500">
              <span>{state.email}</span>
              <button
                type="button"
                onClick={() => void getBrowserSupabase()?.auth.signOut()}
                className="rounded-full border border-n200 px-3 py-1.5 transition-colors hover:border-n900 hover:text-n900"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </header>

        <div className="mt-10">
          {state.status === "unconfigured" && (
            <div className="max-w-[60ch] text-[13px] leading-[1.62] text-n900">
              <p>
                Supabase is not configured, so there is nothing to edit yet. Add{" "}
                <code className="font-mono text-[12px] text-n900">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{" "}
                and{" "}
                <code className="font-mono text-[12px] text-n900">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>{" "}
                to{" "}
                <code className="font-mono text-[12px] text-n900">.env.local</code>{" "}
                and restart the dev server.
              </p>
              <p className="mt-3 text-n500">
                Step by step: <span className="text-n900">docs/BACKEND.md</span>
              </p>
            </div>
          )}

          {state.status === "loading" && (
            <p className="text-[13px] text-n500">Checking your session…</p>
          )}

          {state.status === "signed-out" && (
            <div className="max-w-[38ch]">
              <SignIn />
            </div>
          )}

          {state.status === "signed-in" && (
            <>
              <div
                role="tablist"
                aria-label="What to edit"
                className="flex flex-wrap gap-1 border-b border-n200"
              >
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    role="tab"
                    id={`tab-${key}`}
                    aria-selected={tab === key}
                    aria-controls={`panel-${key}`}
                    onClick={() => setTab(key)}
                    className={`-mb-px border-b-2 px-3 py-2 text-[13px] transition-colors ${
                      tab === key
                        ? "border-n900 text-n900"
                        : "border-transparent text-n500 hover:text-n900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div
                role="tabpanel"
                id={`panel-${tab}`}
                aria-labelledby={`tab-${tab}`}
                className="mt-8"
              >
                {tab === "projects" ? <ProjectsEditor /> : null}
                {tab === "writings" ? <WritingsEditor /> : null}
                {tab === "craft" ? <CraftEditor /> : null}
                {tab === "interests" ? <InterestsEditor /> : null}
                {tab === "settings" ? <SettingsEditor /> : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
