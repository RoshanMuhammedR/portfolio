"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { HomeLayout, ProjectRow } from "@/lib/supabase/types";
import {
  DeleteButton,
  ErrorLine,
  Field,
  GHOST_BUTTON,
  PendingMigrations,
  ReorderButtons,
  SAVE_BUTTON,
  Select,
  TextArea,
  Thumb,
  Toggle,
  UploadButton,
} from "./ui";

const COLUMNS =
  "id,slug,title,subtitle,description,tags,kind,live_url,repo_url,image_url," +
  "image_position,glow,show_on_home,show_on_works,home_layout,sort,published";

const LAYOUTS: readonly { value: HomeLayout | ""; label: string }[] = [
  { value: "", label: "Continue the row above" },
  { value: "full", label: "Full width" },
  { value: "pair", label: "Pair (1:1)" },
  { value: "aside", label: "Aside (wide, narrow)" },
  { value: "aside-flipped", label: "Aside flipped (narrow, wide)" },
];

const BLANK: ProjectRow = {
  id: "",
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  tags: [],
  kind: "project",
  live_url: "",
  repo_url: "",
  image_url: null,
  image_position: "center top",
  glow: null,
  show_on_home: true,
  show_on_works: true,
  home_layout: null,
  sort: 0,
  published: false,
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/**
 * Works, for Home and for /works.
 *
 * The order in this list is the order of the mosaic and of the ring; the layout
 * picker on the first work of a row decides that row's shape. Saving is
 * explicit - a half-typed row should not be able to reach the site because a
 * publish toggle was already on.
 */
export function ProjectsEditor() {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [editing, setEditing] = useState<ProjectRow>(BLANK);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(COLUMNS)
        .order("sort", { ascending: true });
      if (error) {
        setStatus("missing");
        setError(error.message);
        return;
      }
      setRows((data ?? []) as unknown as ProjectRow[]);
      setStatus("ready");
    } catch {
      setStatus("missing");
    }
  }, []);

  useEffect(() => {
    // Reading the table on mount is the "subscribe to an external system" case
    // the rule allows; the setState happens in an awaited callback.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase || !editing.title.trim()) return;

    const payload = {
      slug: (editing.slug || slugify(editing.title)).trim(),
      title: editing.title.trim(),
      subtitle: editing.subtitle?.trim() || null,
      description: editing.description?.trim() || null,
      tags: editing.tags ?? [],
      kind: editing.kind,
      live_url: editing.live_url?.trim() || null,
      repo_url: editing.repo_url?.trim() || null,
      image_url: editing.image_url,
      image_position: editing.image_position || "center top",
      glow: editing.glow?.trim() || null,
      show_on_home: editing.show_on_home,
      show_on_works: editing.show_on_works,
      home_layout: editing.home_layout,
      sort: editing.id ? editing.sort : rows.length,
      published: editing.published,
    };

    setBusy(true);
    const query = editing.id
      ? supabase.from("projects").update(payload).eq("id", editing.id).select().single()
      : supabase.from("projects").insert(payload).select().single();
    const { data, error } = await query;
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }
    const saved = data as unknown as ProjectRow;
    setRows((all) => {
      const without = all.filter((r) => r.id !== saved.id);
      return [...without, saved].sort((a, b) => a.sort - b.sort);
    });
    setEditing(saved);
    setError("");
  };

  const remove = async (id: string) => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setRows((all) => all.filter((r) => r.id !== id));
    if (editing.id === id) setEditing(BLANK);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) setError(error.message);
  };

  /** Order is what the mosaic reads, so a move writes both rows' `sort`. */
  const move = async (index: number, by: -1 | 1) => {
    const supabase = getBrowserSupabase();
    const next = index + by;
    if (!supabase || next < 0 || next >= rows.length) return;

    const reordered = [...rows];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    const withSort = reordered.map((row, i) => ({ ...row, sort: i }));
    setRows(withSort);

    for (const row of [withSort[index], withSort[next]]) {
      const { error } = await supabase
        .from("projects")
        .update({ sort: row.sort })
        .eq("id", row.id);
      if (error) setError(error.message);
    }
  };

  if (status === "loading") {
    return <p className="text-[13px] text-n500">Loading works…</p>;
  }
  if (status === "missing") {
    return (
      <div className="max-w-[60ch] text-[13px] leading-[1.62] text-n900">
        <p>
          The <code className="font-mono text-[12px]">projects</code> table is not
          there yet. Run{" "}
          <code className="font-mono text-[12px]">
            supabase/migrations/0001_projects.sql
          </code>{" "}
          and{" "}
          <code className="font-mono text-[12px]">
            supabase/migrations/0007_seed_projects_and_craft.sql
          </code>{" "}
          in the SQL editor.
        </p>
        <PendingMigrations className="mt-3" />
        <p className="mt-3 text-n500">
          Until then the site reads the nine works in{" "}
          <code className="font-mono text-[12px]">content/projects.ts</code>.
        </p>
        <ErrorLine message={error} />
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div>
        <button
          type="button"
          onClick={() => setEditing(BLANK)}
          className={`mb-4 w-full ${GHOST_BUTTON}`}
        >
          New work
        </button>
        <ul className="flex flex-col divide-y divide-n200 border-y border-n200">
          {rows.map((row, i) => (
            <li key={row.id} className="flex items-center gap-2 py-2.5">
              <ReorderButtons
                onUp={() => void move(i, -1)}
                onDown={() => void move(i, 1)}
                disabledUp={i === 0}
                disabledDown={i === rows.length - 1}
              />
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
            <li className="py-3 text-[13px] text-n500">No works yet.</li>
          ) : null}
        </ul>
      </div>

      <form onSubmit={save} className="flex flex-col gap-4">
        <ErrorLine message={error} />

        <div className="flex flex-wrap gap-3">
          <Field
            label="Title"
            required
            value={editing.title}
            onChange={(v) =>
              setEditing((p) => ({
                ...p,
                title: v,
                // The slug follows the title until the work has an identity of
                // its own; changing it afterwards breaks links.
                slug: p.id ? p.slug : slugify(v),
              }))
            }
          />
          <Field
            label="Slug"
            mono
            value={editing.slug}
            onChange={(v) => setEditing((p) => ({ ...p, slug: slugify(v) }))}
          />
        </div>

        <Field
          label="Subtitle"
          value={editing.subtitle ?? ""}
          onChange={(v) => setEditing((p) => ({ ...p, subtitle: v }))}
        />
        <TextArea
          label="Description"
          hint="optional, for the works list"
          value={editing.description ?? ""}
          onChange={(v) => setEditing((p) => ({ ...p, description: v }))}
        />
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

        <div className="flex flex-wrap gap-3">
          <Field
            label="Live URL"
            placeholder="https://"
            value={editing.live_url ?? ""}
            onChange={(v) => setEditing((p) => ({ ...p, live_url: v }))}
          />
          <Field
            label="Repository"
            placeholder="https://github.com/"
            value={editing.repo_url ?? ""}
            onChange={(v) => setEditing((p) => ({ ...p, repo_url: v }))}
          />
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <UploadButton
            label="Screenshot"
            folder="work"
            accept="image/png,image/jpeg,image/webp,image/avif"
            onUploaded={(url) => setEditing((p) => ({ ...p, image_url: url }))}
            onError={setError}
          />
          <Thumb
            src={editing.image_url}
            onClear={() => setEditing((p) => ({ ...p, image_url: null }))}
          />
          <Field
            label="Focal point"
            hint="CSS object-position"
            value={editing.image_position}
            onChange={(v) => setEditing((p) => ({ ...p, image_position: v }))}
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <Select
            label="Kind"
            value={editing.kind}
            options={[
              { value: "project", label: "Project" },
              { value: "experience", label: "Experience" },
            ]}
            onChange={(v) => setEditing((p) => ({ ...p, kind: v }))}
          />
          <Select
            label="Home row"
            value={(editing.home_layout ?? "") as HomeLayout | ""}
            options={LAYOUTS}
            onChange={(v) =>
              setEditing((p) => ({ ...p, home_layout: v === "" ? null : v }))
            }
          />
          <Toggle
            label="On Home"
            checked={editing.show_on_home}
            onChange={(v) => setEditing((p) => ({ ...p, show_on_home: v }))}
          />
          <Toggle
            label="On Works"
            checked={editing.show_on_works}
            onChange={(v) => setEditing((p) => ({ ...p, show_on_works: v }))}
          />
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
