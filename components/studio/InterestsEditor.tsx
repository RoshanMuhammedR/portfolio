"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { InterestRow } from "@/lib/supabase/types";
import {
  DeleteButton,
  ErrorLine,
  Field,
  GHOST_BUTTON,
  NumberField,
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
  "id,category,title,subtitle,note,link_url,texture_url,model_url,object_type," +
  "action,scale,pos_x,pos_z,rot_y,credit,licence,sort,published";

const CATEGORIES = [
  { value: "movie", label: "Film" },
  { value: "anime", label: "Anime" },
  { value: "football", label: "Football" },
  { value: "game", label: "Games" },
  { value: "travel", label: "Travel" },
  { value: "music", label: "Music" },
  { value: "other", label: "Other" },
] as const;

const OBJECTS = [
  { value: "card", label: "Card — a poster or key art" },
  { value: "book", label: "Book — a volume with a spine" },
  { value: "ball", label: "Ball — bouncy" },
  { value: "controller", label: "Controller" },
  { value: "polaroid", label: "Polaroid — a photo with a border" },
  { value: "model", label: "Model — your own .glb" },
] as const;

const ACTIONS = [
  { value: "info", label: "Info — pin the card" },
  { value: "flip", label: "Flip it over" },
  { value: "kick", label: "Kick it" },
  { value: "open", label: "Open it" },
  { value: "spin", label: "Spin it" },
  { value: "link", label: "Open the link" },
] as const;

const BLANK: InterestRow = {
  id: "",
  category: "movie",
  title: "",
  subtitle: "",
  note: "",
  link_url: "",
  texture_url: null,
  model_url: null,
  object_type: "card",
  action: "info",
  scale: 1,
  pos_x: null,
  pos_z: null,
  rot_y: null,
  credit: "",
  licence: "",
  sort: 0,
  published: false,
};

/**
 * The objects on the About desk.
 *
 * Credit and licence are first-class fields rather than a note in a README:
 * anything that is not CC0 has to carry its attribution, and the page prints
 * whatever is entered here under the scene.
 */
export function InterestsEditor() {
  const [rows, setRows] = useState<InterestRow[]>([]);
  const [editing, setEditing] = useState<InterestRow>(BLANK);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("interests")
        .select(COLUMNS)
        .order("sort", { ascending: true });
      if (error) {
        setStatus("missing");
        setError(error.message);
        return;
      }
      setRows((data ?? []) as unknown as InterestRow[]);
      setStatus("ready");
    } catch {
      setStatus("missing");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase || !editing.title.trim()) return;

    const payload = {
      category: editing.category,
      title: editing.title.trim(),
      subtitle: editing.subtitle?.trim() || null,
      note: editing.note?.trim() || null,
      link_url: editing.link_url?.trim() || null,
      texture_url: editing.texture_url,
      model_url: editing.model_url,
      object_type: editing.object_type,
      action: editing.action,
      scale: editing.scale || 1,
      pos_x: editing.pos_x,
      pos_z: editing.pos_z,
      rot_y: editing.rot_y,
      credit: editing.credit?.trim() || null,
      licence: editing.licence?.trim() || null,
      sort: editing.id ? editing.sort : rows.length,
      published: editing.published,
    };

    setBusy(true);
    const query = editing.id
      ? supabase.from("interests").update(payload).eq("id", editing.id).select().single()
      : supabase.from("interests").insert(payload).select().single();
    const { data, error } = await query;
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }
    const saved = data as unknown as InterestRow;
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
    const { error } = await supabase.from("interests").delete().eq("id", id);
    if (error) setError(error.message);
  };

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
        .from("interests")
        .update({ sort: row.sort })
        .eq("id", row.id);
      if (error) setError(error.message);
    }
  };

  if (status === "loading") {
    return <p className="text-[13px] text-n500">Loading…</p>;
  }
  if (status === "missing") {
    return (
      <div className="max-w-[60ch] text-[13px] leading-[1.62] text-n900">
        <p>
          The <code className="font-mono text-[12px]">interests</code> table is not
          there yet. Run{" "}
          <code className="font-mono text-[12px]">
            supabase/migrations/0002_interests.sql
          </code>{" "}
          in the SQL editor.
        </p>
        <PendingMigrations className="mt-3" />
        <p className="mt-3 text-n500">
          Until then /about keeps its education cards.
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
          New favourite
        </button>
        <p className="mb-3 text-[12px] leading-[1.5] text-n500">
          These are yours. Nothing here is generated: whatever you enter is what
          the desk shows.
        </p>
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
                <span className="ml-2 text-[11px] text-n500">{row.category}</span>
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
            <li className="py-3 text-[13px] text-n500">Nothing on the desk yet.</li>
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
            onChange={(v) => setEditing((p) => ({ ...p, title: v }))}
          />
          <Field
            label="Subtitle"
            hint="year, club, studio…"
            value={editing.subtitle ?? ""}
            onChange={(v) => setEditing((p) => ({ ...p, subtitle: v }))}
          />
        </div>

        <TextArea
          label="Note"
          hint="one or two lines, shown on hover"
          rows={3}
          value={editing.note ?? ""}
          onChange={(v) => setEditing((p) => ({ ...p, note: v }))}
        />

        <div className="flex flex-wrap items-end gap-4">
          <Select
            label="Category"
            value={editing.category}
            options={CATEGORIES}
            onChange={(v) => setEditing((p) => ({ ...p, category: v }))}
          />
          <Select
            label="Object"
            value={editing.object_type}
            options={OBJECTS}
            onChange={(v) => setEditing((p) => ({ ...p, object_type: v }))}
          />
          <Select
            label="On tap"
            value={editing.action}
            options={ACTIONS}
            onChange={(v) => setEditing((p) => ({ ...p, action: v }))}
          />
          <NumberField
            label="Scale"
            value={editing.scale}
            min={0.3}
            max={3}
            step={0.1}
            onChange={(v) => setEditing((p) => ({ ...p, scale: v ?? 1 }))}
          />
        </div>

        <Field
          label="Link"
          placeholder="https://"
          value={editing.link_url ?? ""}
          onChange={(v) => setEditing((p) => ({ ...p, link_url: v }))}
        />

        <div className="flex flex-wrap items-center gap-3">
          <UploadButton
            label="Texture"
            folder="interests"
            accept="image/png,image/jpeg,image/webp,image/avif"
            onUploaded={(url) => setEditing((p) => ({ ...p, texture_url: url }))}
            onError={setError}
          />
          <Thumb
            src={editing.texture_url}
            onClear={() => setEditing((p) => ({ ...p, texture_url: null }))}
          />
          <UploadButton
            label="Model (.glb)"
            folder="interests"
            accept=".glb,model/gltf-binary"
            onUploaded={(url) => setEditing((p) => ({ ...p, model_url: url }))}
            onError={setError}
          />
          {editing.model_url ? (
            <button
              type="button"
              onClick={() => setEditing((p) => ({ ...p, model_url: null }))}
              className="text-[12px] text-n500 underline underline-offset-2 hover:text-red-600"
            >
              Remove model
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <Field
            label="Credit"
            hint="required by most licences"
            value={editing.credit ?? ""}
            onChange={(v) => setEditing((p) => ({ ...p, credit: v }))}
          />
          <Field
            label="Licence"
            hint="CC0, CC-BY 4.0, TMDB…"
            value={editing.licence ?? ""}
            onChange={(v) => setEditing((p) => ({ ...p, licence: v }))}
          />
        </div>

        <details className="rounded-lg border border-n200 p-3">
          <summary className="cursor-pointer text-[12px] text-n500">
            Resting place (optional)
          </summary>
          <p className="mt-2 text-[12px] text-n500">
            Where Reset puts it. Leave blank and the scene arranges it.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <NumberField
              label="x"
              value={editing.pos_x}
              step={0.1}
              min={-4.5}
              max={4.5}
              onChange={(v) => setEditing((p) => ({ ...p, pos_x: v }))}
            />
            <NumberField
              label="z"
              value={editing.pos_z}
              step={0.1}
              min={-4.5}
              max={4.5}
              onChange={(v) => setEditing((p) => ({ ...p, pos_z: v }))}
            />
            <NumberField
              label="rotation°"
              value={editing.rot_y}
              step={5}
              min={-360}
              max={360}
              onChange={(v) => setEditing((p) => ({ ...p, rot_y: v }))}
            />
          </div>
        </details>

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
