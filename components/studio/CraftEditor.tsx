"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { CraftRow } from "@/lib/supabase/types";
import { defaultConfig } from "@/content/config";
import { buildPattern } from "@/lib/craftPattern";
import type { CraftItem } from "@/content/craft";
import {
  DeleteButton,
  ErrorLine,
  Field,
  GHOST_BUTTON,
  NumberField,
  PendingMigrations,
  ReorderButtons,
  SAVE_BUTTON,
  TextArea,
  Thumb,
  Toggle,
  UploadButton,
} from "./ui";

const BASE = "id,title,caption,href,image_url,x,y,w,h,published";
const WIDE = `${BASE},description,tags,year,source_url,aspect,sort`;

const BLANK: CraftRow = {
  id: "",
  title: "",
  caption: "",
  href: "",
  image_url: null,
  x: 80,
  y: 80,
  w: 320,
  h: 200,
  published: false,
  description: "",
  tags: [],
  year: null,
  source_url: "",
  aspect: null,
  sort: 0,
};

/**
 * The craft board's contents.
 *
 * Order here is the order tiles are laid into the repeating block, so the
 * preview under the list is the board itself in miniature - the same
 * `buildPattern` the page uses, at a twentieth of the size.
 */
export function CraftEditor() {
  const [rows, setRows] = useState<CraftRow[]>([]);
  const [editing, setEditing] = useState<CraftRow>(BLANK);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [narrow, setNarrow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    // The metadata columns arrive with migration 0004; without it the editor
    // still manages everything that does exist. The two selects return
    // different shapes, so they are read through a common one.
    type Result = { data: unknown; error: { code?: string; message: string } | null };

    let result: Result = await supabase
      .from("craft_items")
      .select(WIDE)
      .order("sort", { ascending: true })
      .order("created_at", { ascending: true });
    if (result.error?.code === "42703") {
      setNarrow(true);
      result = await supabase
        .from("craft_items")
        .select(BASE)
        .order("created_at", { ascending: true });
    }

    if (result.error) setError(result.error.message);
    else setRows((result.data ?? []) as CraftRow[]);
    setStatus("ready");
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase || !editing.title.trim()) return;

    const payload: Record<string, unknown> = {
      title: editing.title.trim(),
      caption: editing.caption?.trim() || null,
      href: editing.href?.trim() || null,
      image_url: editing.image_url,
      published: editing.published,
    };
    if (!narrow) {
      payload.description = editing.description?.trim() || null;
      payload.tags = editing.tags ?? [];
      payload.year = editing.year;
      payload.source_url = editing.source_url?.trim() || null;
      payload.aspect = editing.aspect;
      payload.sort = editing.id ? (editing.sort ?? 0) : rows.length;
    }
    if (!editing.id) {
      // Stagger new cards so the manual board never stacks them.
      payload.x = 80 + (rows.length % 5) * 360;
      payload.y = 80 + Math.floor(rows.length / 5) * 280;
    }

    setBusy(true);
    const columns = narrow ? BASE : WIDE;
    const query = editing.id
      ? supabase.from("craft_items").update(payload).eq("id", editing.id).select(columns).single()
      : supabase.from("craft_items").insert(payload).select(columns).single();
    const { data, error } = await query;
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }
    const saved = data as unknown as CraftRow;
    setRows((all) => {
      const without = all.filter((r) => r.id !== saved.id);
      return [...without, saved].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    });
    setEditing(saved);
    setError("");
  };

  const remove = async (id: string) => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setRows((all) => all.filter((r) => r.id !== id));
    if (editing.id === id) setEditing(BLANK);
    const { error } = await supabase.from("craft_items").delete().eq("id", id);
    if (error) setError(error.message);
  };

  const move = async (index: number, by: -1 | 1) => {
    const supabase = getBrowserSupabase();
    const next = index + by;
    if (!supabase || narrow || next < 0 || next >= rows.length) return;

    const reordered = [...rows];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    const withSort = reordered.map((row, i) => ({ ...row, sort: i }));
    setRows(withSort);

    for (const row of [withSort[index], withSort[next]]) {
      const { error } = await supabase
        .from("craft_items")
        .update({ sort: row.sort })
        .eq("id", row.id);
      if (error) setError(error.message);
    }
  };

  /** The capture's own proportions, so the board does not have to guess. */
  const measure = (url: string) => {
    const probe = new Image();
    probe.onload = () => {
      if (probe.naturalHeight > 0) {
        setEditing((p) => ({
          ...p,
          image_url: url,
          aspect: Number((probe.naturalWidth / probe.naturalHeight).toFixed(4)),
        }));
      }
    };
    probe.src = url;
    setEditing((p) => ({ ...p, image_url: url }));
  };

  const preview = useMemo(() => {
    const config = defaultConfig().craft.board;
    const items: CraftItem[] = rows
      .filter((row) => row.published)
      .map((row, i) => ({
        id: row.id || String(i),
        title: row.title,
        x: row.x,
        y: row.y,
        w: row.w,
        h: row.h,
        image: row.image_url ?? undefined,
        glow: "linear-gradient(135deg,#2c3340,#151a24)",
        aspect: row.aspect ?? undefined,
      }));
    return { pattern: buildPattern(items, config), config };
  }, [rows]);

  if (status === "loading") {
    return <p className="text-[13px] text-n500">Loading the board…</p>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div>
        <button
          type="button"
          onClick={() => setEditing(BLANK)}
          className={`mb-4 w-full ${GHOST_BUTTON}`}
        >
          New card
        </button>

        {narrow ? (
          <p className="mb-3 text-[12px] leading-[1.5] text-n500">
            Run{" "}
            <code className="font-mono text-[11px]">
              supabase/migrations/0004_craft_meta.sql
            </code>{" "}
            to add descriptions, tags, years and ordering.
          </p>
        ) : null}
        {narrow ? (
          <PendingMigrations className="mb-3 text-[12px] leading-[1.5] text-n500" />
        ) : null}

        <ul className="flex flex-col divide-y divide-n200 border-y border-n200">
          {rows.map((row, i) => (
            <li key={row.id} className="flex items-center gap-2 py-2.5">
              {narrow ? null : (
                <ReorderButtons
                  onUp={() => void move(i, -1)}
                  onDown={() => void move(i, 1)}
                  disabledUp={i === 0}
                  disabledDown={i === rows.length - 1}
                />
              )}
              <button
                type="button"
                onClick={() => setEditing(row)}
                className={`flex-1 truncate text-left text-[13px] ${
                  editing.id === row.id ? "text-n900" : "text-n600"
                } hover:text-n900`}
              >
                {row.title}
                {!row.published ? (
                  <span className="ml-2 font-mono text-[10px] text-n500">draft</span>
                ) : null}
              </button>
              <DeleteButton
                label={`Delete ${row.title}`}
                onClick={() => void remove(row.id)}
              />
            </li>
          ))}
          {rows.length === 0 ? (
            <li className="py-3 text-[13px] text-n500">Nothing on the board yet.</li>
          ) : null}
        </ul>

        {/* The repeating block, at a twentieth of its size. */}
        <div className="mt-6">
          <p className="mb-2 text-[12px] text-n500">The repeating block</p>
          <div
            className="relative w-full overflow-hidden rounded-lg border border-n200 bg-n100"
            style={{
              aspectRatio: `${preview.pattern.periodW} / ${preview.pattern.periodH}`,
            }}
          >
            {preview.pattern.tiles.map((tile) => (
              <div
                key={tile.key}
                className="absolute overflow-hidden rounded-[2px] bg-n200"
                style={{
                  left: `${(tile.x / preview.pattern.periodW) * 100}%`,
                  top: `${(tile.y / preview.pattern.periodH) * 100}%`,
                  width: `${(tile.w / preview.pattern.periodW) * 100}%`,
                  height: `${(tile.h / preview.pattern.periodH) * 100}%`,
                }}
              >
                {tile.item.image ? (
                  <img
                    src={tile.item.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={save} className="flex flex-col gap-4">
        <ErrorLine message={error} />

        <div className="flex flex-wrap gap-3">
          <Field
            label="Title"
            required
            value={editing.title}
            onChange={(v) => setEditing((p) => ({ ...p, title: v }))}
          />
          <Field
            label="Caption"
            hint="shown under the tile"
            value={editing.caption ?? ""}
            onChange={(v) => setEditing((p) => ({ ...p, caption: v }))}
          />
        </div>

        {narrow ? null : (
          <>
            <TextArea
              label="Description"
              hint="what the hover card says"
              rows={3}
              value={editing.description ?? ""}
              onChange={(v) => setEditing((p) => ({ ...p, description: v }))}
            />
            <div className="flex flex-wrap items-end gap-3">
              <Field
                label="Tags"
                hint="comma separated"
                value={(editing.tags ?? []).join(", ")}
                onChange={(v) =>
                  setEditing((p) => ({
                    ...p,
                    tags: v
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  }))
                }
              />
              <NumberField
                label="Year"
                value={editing.year ?? null}
                min={1990}
                max={2100}
                onChange={(v) => setEditing((p) => ({ ...p, year: v }))}
              />
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <Field
            label="Live demo"
            placeholder="/crafts/…/index.html"
            value={editing.href ?? ""}
            onChange={(v) => setEditing((p) => ({ ...p, href: v }))}
          />
          {narrow ? null : (
            <Field
              label="Source"
              placeholder="https://github.com/"
              value={editing.source_url ?? ""}
              onChange={(v) => setEditing((p) => ({ ...p, source_url: v }))}
            />
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <UploadButton
            label="Capture"
            folder="craft"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            onUploaded={measure}
            onError={setError}
          />
          <Thumb
            src={editing.image_url}
            onClear={() => setEditing((p) => ({ ...p, image_url: null, aspect: null }))}
          />
          {narrow ? null : (
            <NumberField
              label="Aspect"
              value={editing.aspect ?? null}
              min={0.2}
              max={4}
              step={0.01}
              onChange={(v) => setEditing((p) => ({ ...p, aspect: v }))}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={busy} className={SAVE_BUTTON}>
            {busy ? "Saving…" : "Save"}
          </button>
          <Toggle
            label="Published"
            checked={editing.published}
            onChange={(v) => setEditing((p) => ({ ...p, published: v }))}
          />
        </div>
      </form>
    </div>
  );
}
