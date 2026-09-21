"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { defaultConfig, type SiteConfig } from "@/content/config";
import { schemaFor, settingsKeys, type SettingsKey } from "@/lib/settings";
import {
  ErrorLine,
  GHOST_BUTTON,
  PendingMigrations,
  SAVE_BUTTON,
  Select,
  Slider,
  Toggle,
} from "./ui";

/**
 * The tunable values from `content/config.ts`, as controls.
 *
 * Saving writes one row per group into `site_settings`; the server merges those
 * over the defaults on the next request. Every value is validated here with the
 * same schema the server uses, so the studio cannot write something the site
 * will silently ignore.
 */

type Control =
  | { kind: "slider"; key: string; label: string; min: number; max: number; step: number }
  | { kind: "toggle"; key: string; label: string }
  | { kind: "choice"; key: string; label: string; options: readonly { value: string; label: string }[] };

const CONTROLS: Record<SettingsKey, { title: string; blurb: string; controls: Control[] }> = {
  "home.marquee": {
    title: "Home — the scrolling works column",
    blurb: "The column on the right of the home page, and how fast it moves.",
    controls: [
      { kind: "toggle", key: "enabled", label: "On" },
      {
        kind: "choice",
        key: "direction",
        label: "Direction",
        options: [
          { value: "down", label: "Downwards (top → bottom)" },
          { value: "up", label: "Upwards" },
        ],
      },
      { kind: "slider", key: "speedPxPerSec", label: "Speed (px/s)", min: 0, max: 160, step: 1 },
      { kind: "toggle", key: "pauseOnHover", label: "Slow down under the pointer" },
      { kind: "slider", key: "hoverSpeedFactor", label: "…to this fraction of speed", min: 0, max: 1, step: 0.05 },
      { kind: "slider", key: "edgeFadePx", label: "Edge fade (px)", min: 0, max: 160, step: 2 },
      { kind: "toggle", key: "wheelScrub", label: "Wheel scrubs the column" },
      { kind: "slider", key: "minTrackViewports", label: "Repeat until (viewports)", min: 1, max: 6, step: 1 },
    ],
  },
  "works.ring": {
    title: "Works — the ring",
    blurb: "The tilted ring of work images, and how it behaves when a row is held.",
    controls: [
      { kind: "slider", key: "tiltDeg", label: "Tilt (°)", min: 0, max: 60, step: 1 },
      { kind: "slider", key: "idleDegPerSec", label: "Idle spin (°/s)", min: 0, max: 45, step: 0.5 },
      { kind: "slider", key: "frontScale", label: "Focus zoom (×)", min: 1, max: 5, step: 0.1 },
      { kind: "slider", key: "focusMaxCqw", label: "Focus width cap (%)", min: 30, max: 100, step: 1 },
      { kind: "slider", key: "frontMs", label: "Come forward (ms)", min: 80, max: 1500, step: 10 },
      { kind: "slider", key: "returnMs", label: "Return (ms)", min: 80, max: 1500, step: 10 },
      { kind: "slider", key: "fadeMs", label: "Others fade (ms)", min: 0, max: 1200, step: 10 },
      { kind: "slider", key: "releaseDelayMs", label: "Release delay (ms)", min: 0, max: 800, step: 10 },
      { kind: "slider", key: "maxItems", label: "Most tiles on the ring", min: 3, max: 60, step: 1 },
      { kind: "slider", key: "tileMinPx", label: "Smallest tile (px)", min: 60, max: 400, step: 2 },
      { kind: "slider", key: "tileMaxPx", label: "Largest tile (px)", min: 120, max: 700, step: 5 },
    ],
  },
  "about.scene": {
    title: "About — the desk",
    blurb: "The physics scene of your favourites.",
    controls: [
      { kind: "slider", key: "gravity", label: "Gravity", min: -80, max: -5, step: 1 },
      { kind: "slider", key: "dprMax", label: "Pixel ratio cap", min: 1, max: 3, step: 0.25 },
      { kind: "slider", key: "shadowOpacity", label: "Shadow strength", min: 0, max: 0.6, step: 0.01 },
      { kind: "toggle", key: "dropInOnLoad", label: "Objects drop in on load" },
      { kind: "slider", key: "infoDelayMs", label: "Hover card delay (ms)", min: 0, max: 1200, step: 10 },
      { kind: "slider", key: "maxObjects", label: "Most objects", min: 1, max: 40, step: 1 },
    ],
  },
  "writings.list": {
    title: "Writings — the list",
    blurb: "What each row shows on the right, and what it says on the end.",
    controls: [
      {
        kind: "choice",
        key: "rowMeta",
        label: "Row meta",
        options: [
          { value: "number", label: "Numbers (003 / 002 / 001)" },
          { value: "date", label: "Dates" },
        ],
      },
      { kind: "slider", key: "previewFadeMs", label: "Preview fade (ms)", min: 0, max: 800, step: 10 },
    ],
  },
  "writings.article": {
    title: "Writings — the article",
    blurb: "The hero and the quick-nav list on a post.",
    controls: [
      { kind: "slider", key: "bannerHeight", label: "Hero height (px)", min: 0, max: 700, step: 10 },
      { kind: "slider", key: "bannerMaxWidth", label: "Hero width (px)", min: 300, max: 1200, step: 10 },
      { kind: "slider", key: "spreadTopPx", label: "Article starts at (px)", min: 0, max: 600, step: 4 },
      { kind: "slider", key: "tocTopPx", label: "Quick nav sticks at (px)", min: 0, max: 400, step: 4 },
      { kind: "slider", key: "tocMaxWidth", label: "Quick nav width (px)", min: 100, max: 320, step: 5 },
      {
        kind: "choice",
        key: "tocDepth",
        label: "Quick nav depth",
        options: [
          { value: "2", label: "Sections only" },
          { value: "3", label: "Sections and sub-sections" },
        ],
      },
    ],
  },
  "craft.board": {
    title: "Craft — the board",
    blurb: "The repeating layout, the focus falloff and what a click does.",
    controls: [
      { kind: "slider", key: "columns", label: "Columns", min: 1, max: 8, step: 1 },
      { kind: "slider", key: "tileWidth", label: "Tile width (px)", min: 160, max: 700, step: 10 },
      { kind: "slider", key: "gap", label: "Gap (px)", min: 0, max: 120, step: 2 },
      { kind: "slider", key: "patternScale", label: "Space between repeats (×)", min: 1, max: 2.5, step: 0.05 },
      { kind: "slider", key: "focusRect", label: "Bright area", min: 0.1, max: 1, step: 0.05 },
      { kind: "slider", key: "minVisibility", label: "Dimmest tile", min: 0, max: 1, step: 0.05 },
      { kind: "slider", key: "scaleMin", label: "Smallest scale", min: 0.5, max: 1, step: 0.01 },
      { kind: "slider", key: "hoverDelayMs", label: "Hover card delay (ms)", min: 0, max: 2000, step: 50 },
      { kind: "slider", key: "opacityMs", label: "Fade (ms)", min: 0, max: 1200, step: 10 },
      { kind: "slider", key: "transformMs", label: "Settle (ms)", min: 0, max: 1500, step: 10 },
      {
        kind: "choice",
        key: "clickAction",
        label: "Click a tile",
        options: [
          { value: "lightbox", label: "Open the lightbox" },
          { value: "link", label: "Open the live demo" },
        ],
      },
      { kind: "slider", key: "wheelSpeed", label: "Wheel speed (×)", min: 0, max: 3, step: 0.1 },
      { kind: "slider", key: "idleDriftPxPerSec", label: "Idle drift (px/s)", min: 0, max: 40, step: 1 },
    ],
  },
};

const PATHS: Record<SettingsKey, [keyof SiteConfig, string]> = {
  "home.marquee": ["home", "marquee"],
  "works.ring": ["works", "ring"],
  "about.scene": ["about", "scene"],
  "writings.list": ["writings", "list"],
  "writings.article": ["writings", "article"],
  "craft.board": ["craft", "board"],
};

type Group = Record<string, unknown>;

export function SettingsEditor() {
  const [values, setValues] = useState<Record<SettingsKey, Group>>(() => {
    const config = defaultConfig();
    return Object.fromEntries(
      settingsKeys.map((key) => {
        const [a, b] = PATHS[key];
        return [key, { ...((config[a] as Record<string, Group>)[b] as Group) }];
      }),
    ) as Record<SettingsKey, Group>;
  });
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<SettingsKey | null>(null);

  const load = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from("site_settings").select("key,value");
      if (error) {
        setStatus("missing");
        setError(error.message);
        return;
      }
      setValues((current) => {
        const next = { ...current };
        for (const row of (data ?? []) as { key: string; value: unknown }[]) {
          if (!(settingsKeys as string[]).includes(row.key)) continue;
          const key = row.key as SettingsKey;
          const parsed = schemaFor(key).safeParse(row.value);
          if (parsed.success) next[key] = { ...next[key], ...parsed.data };
        }
        return next;
      });
      setStatus("ready");
    } catch {
      setStatus("missing");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const set = (key: SettingsKey, field: string, value: unknown) => {
    setValues((current) => ({
      ...current,
      [key]: { ...current[key], [field]: value },
    }));
    setSaved(null);
  };

  const save = async (key: SettingsKey) => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    const parsed = schemaFor(key).safeParse(values[key]);
    if (!parsed.success) {
      setError(`${key}: ${parsed.error.issues.map((i) => i.message).join(", ")}`);
      return;
    }

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value: parsed.data, updated_at: new Date().toISOString() });
    if (error) {
      setError(error.message);
      return;
    }
    setError("");
    setSaved(key);
  };

  const reset = async (key: SettingsKey) => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const config = defaultConfig();
    const [a, b] = PATHS[key];
    setValues((current) => ({
      ...current,
      [key]: { ...((config[a] as Record<string, Group>)[b] as Group) },
    }));
    const { error } = await supabase.from("site_settings").delete().eq("key", key);
    if (error) setError(error.message);
    else setSaved(null);
  };

  if (status === "loading") {
    return <p className="text-[13px] text-n500">Loading settings…</p>;
  }
  if (status === "missing") {
    return (
      <div className="max-w-[60ch] text-[13px] leading-[1.62] text-n900">
        <p>
          The <code className="font-mono text-[12px]">site_settings</code> table is
          not there yet. Run{" "}
          <code className="font-mono text-[12px]">
            supabase/migrations/0005_site_settings.sql
          </code>{" "}
          in the SQL editor.
        </p>
        <PendingMigrations className="mt-3" />
        <p className="mt-3 text-n500">
          Until then the site uses the defaults in{" "}
          <code className="font-mono text-[12px]">content/config.ts</code>.
        </p>
        <ErrorLine message={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <p className="max-w-[70ch] text-[13px] leading-[1.6] text-n500">
        These override the defaults in{" "}
        <code className="font-mono text-[12px]">content/config.ts</code>. Pages
        pick a change up within a minute. Anything out of range is refused here
        and ignored by the site, so nothing saved on this page can break it.
      </p>
      <ErrorLine message={error} />

      {settingsKeys.map((key) => {
        const group = CONTROLS[key];
        return (
          <section key={key} className="flex flex-col gap-4">
            <div>
              <h2 className="text-[14px] font-medium text-n900">{group.title}</h2>
              <p className="mt-1 text-[12px] text-n500">{group.blurb}</p>
            </div>

            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.controls.map((control) => {
                const value = values[key][control.key];
                if (control.kind === "toggle") {
                  return (
                    <Toggle
                      key={control.key}
                      label={control.label}
                      checked={Boolean(value)}
                      onChange={(v) => set(key, control.key, v)}
                    />
                  );
                }
                if (control.kind === "choice") {
                  return (
                    <Select
                      key={control.key}
                      label={control.label}
                      value={String(value)}
                      options={control.options}
                      onChange={(v) =>
                        set(
                          key,
                          control.key,
                          // tocDepth is the one numeric choice.
                          /^\d+$/.test(v) ? Number(v) : v,
                        )
                      }
                    />
                  );
                }
                return (
                  <Slider
                    key={control.key}
                    label={control.label}
                    value={Number(value)}
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    onChange={(v) => set(key, control.key, v)}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void save(key)}
                className={SAVE_BUTTON}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => void reset(key)}
                className={GHOST_BUTTON}
              >
                Back to defaults
              </button>
              {saved === key ? (
                <span className="text-[12px] text-p600">Saved.</span>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
