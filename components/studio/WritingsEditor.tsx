"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Download, Eye, Upload as UploadIcon } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import type { WritingRow } from "@/lib/supabase/types";
import { parseFrontmatter, serialiseFrontmatter } from "@/lib/markdown/frontmatter";
import { readingTime } from "@/lib/markdown/readingTime";
import { renderPreview } from "@/app/studio/preview";
import {
  DeleteButton,
  ErrorLine,
  Field,
  GHOST_BUTTON,
  NumberField,
  PendingMigrations,
  SAVE_BUTTON,
  Select,
  TextArea,
  Thumb,
  Toggle,
  UploadButton,
} from "./ui";

const BASE = "id,slug,title,excerpt,body,published,published_at";
const WIDE =
  `${BASE},preview_image_url,preview_kind,cover_image_url,cover_alt,` +
  `cover_height,toc_enabled,toc_depth,reading_minutes,seo_description`;

/** Lowercase, hyphenated, no punctuation - this ends up in the URL. */
function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

const BLANK: WritingRow = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  published: false,
  published_at: null,
  preview_image_url: null,
  preview_kind: "image",
  cover_image_url: null,
  cover_alt: "",
  cover_height: 350,
  toc_enabled: true,
  toc_depth: 2,
  reading_minutes: null,
  seo_description: "",
};

const SNIPPETS: { label: string; text: string }[] = [
  { label: "Note", text: "\n:::note\nSomething worth pausing on.\n:::\n" },
  { label: "Tip", text: "\n:::tip{title=\"Try this\"}\nA suggestion.\n:::\n" },
  { label: "Warning", text: "\n:::warning\nA caveat.\n:::\n" },
  {
    label: "Gallery",
    text: "\n:::gallery{columns=\"2\"}\n![One](https://…)\n![Two](https://…)\n:::\n",
  },
  {
    label: "Video",
    text: "\n::video{src=\"https://…/clip.mp4\" poster=\"https://…/poster.webp\" autoplay=\"true\" loop=\"true\"}\n",
  },
  { label: "YouTube", text: "\n::embed{provider=\"youtube\" id=\"dQw4w9WgXcQ\"}\n" },
  {
    label: "Highlight",
    text: ":highlight[phrase]{image=\"https://…/preview.webp\" link=\"https://…\"}",
  },
];

/**
 * A list and a form.
 *
 * The body is Markdown all the way to the page - stored as text, rendered to
 * React elements on the way out - so nothing written here can inject markup
 * into the site. Import and export are the same format, which keeps a post a
 * file you can keep rather than a row you can only reach through this app.
 *
 * Saving is explicit. Autosave on a long-form field means a half-written
 * sentence can end up published if the toggle was already on.
 */
export function WritingsEditor() {
  const [rows, setRows] = useState<WritingRow[]>([]);
  const [editing, setEditing] = useState<WritingRow>(BLANK);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [narrow, setNarrow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<ReactNode | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    type Result = { data: unknown; error: { code?: string; message: string } | null };
    let result: Result = await supabase
      .from("writings")
      .select(WIDE)
      .order("created_at", { ascending: false });
    if (result.error?.code === "42703") {
      setNarrow(true);
      result = await supabase
        .from("writings")
        .select(BASE)
        .order("created_at", { ascending: false });
    }

    if (result.error) setError(result.error.message);
    else setRows((result.data ?? []) as WritingRow[]);
    setStatus("ready");
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

    const slug = (editing.slug || slugify(editing.title)).trim();
    const payload: Record<string, unknown> = {
      slug,
      title: editing.title.trim(),
      excerpt: editing.excerpt?.trim() || null,
      body: editing.body,
      published: editing.published,
      // Stamped once, when it first goes live, so republishing does not
      // reorder the list.
      published_at:
        editing.published && !editing.published_at
          ? new Date().toISOString()
          : editing.published_at,
    };
    if (!narrow) {
      payload.preview_image_url = editing.preview_image_url;
      payload.preview_kind = editing.preview_kind ?? "image";
      payload.cover_image_url = editing.cover_image_url;
      payload.cover_alt = editing.cover_alt?.trim() || null;
      payload.cover_height = editing.cover_height ?? 350;
      payload.toc_enabled = editing.toc_enabled ?? true;
      payload.toc_depth = editing.toc_depth ?? 2;
      payload.seo_description = editing.seo_description?.trim() || null;
      // Computed on save so the list and the article agree without either of
      // them having to parse the body again.
      payload.reading_minutes = readingTime(editing.body);
    }

    setBusy(true);
    const columns = narrow ? BASE : WIDE;
    const query = editing.id
      ? supabase.from("writings").update(payload).eq("id", editing.id).select(columns).single()
      : supabase.from("writings").insert(payload).select(columns).single();
    const { data, error } = await query;
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }
    const saved = data as unknown as WritingRow;
    setRows((all) => [saved, ...all.filter((r) => r.id !== saved.id)]);
    setEditing(saved);
    setError("");
  };

  const remove = async (id: string) => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setRows((all) => all.filter((r) => r.id !== id));
    if (editing.id === id) setEditing(BLANK);
    const { error } = await supabase.from("writings").delete().eq("id", id);
    if (error) setError(error.message);
  };

  /** Insert at the caret rather than at the end - a snippet belongs where the
   *  writer is, not where the file stops. */
  const insert = (text: string) => {
    const field = bodyRef.current;
    if (!field) {
      setEditing((p) => ({ ...p, body: p.body + text }));
      return;
    }
    const start = field.selectionStart;
    const end = field.selectionEnd;
    setEditing((p) => ({
      ...p,
      body: p.body.slice(0, start) + text + p.body.slice(end),
    }));
    requestAnimationFrame(() => {
      field.focus();
      field.selectionStart = field.selectionEnd = start + text.length;
    });
  };

  const importMarkdown = async (file: File) => {
    const text = await file.text();
    const { data, body } = parseFrontmatter(text);
    setEditing((p) => ({
      ...p,
      title: data.title ?? p.title,
      slug: data.slug ?? (data.title ? slugify(data.title) : p.slug),
      excerpt: data.excerpt ?? p.excerpt,
      body,
      cover_image_url: data.cover ?? p.cover_image_url,
      cover_alt: data.coverAlt ?? p.cover_alt,
      cover_height: data.coverHeight ?? p.cover_height,
      preview_image_url: data.preview ?? p.preview_image_url,
      preview_kind: data.previewKind ?? p.preview_kind,
      toc_enabled: data.toc ?? p.toc_enabled,
      toc_depth: data.tocDepth ?? p.toc_depth,
      seo_description: data.description ?? p.seo_description,
      published: data.published ?? p.published,
      published_at: data.date ?? p.published_at,
    }));
    setError("");
  };

  const exportMarkdown = () => {
    const text = serialiseFrontmatter(
      {
        title: editing.title,
        slug: editing.slug,
        excerpt: editing.excerpt ?? undefined,
        cover: editing.cover_image_url ?? undefined,
        coverAlt: editing.cover_alt ?? undefined,
        coverHeight: editing.cover_height ?? undefined,
        preview: editing.preview_image_url ?? undefined,
        previewKind: editing.preview_kind ?? undefined,
        toc: editing.toc_enabled ?? undefined,
        tocDepth: (editing.toc_depth ?? undefined) as 2 | 3 | undefined,
        published: editing.published,
        date: editing.published_at ?? undefined,
        description: editing.seo_description ?? undefined,
      },
      editing.body,
    );
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/markdown;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${editing.slug || "post"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const showPreview = async () => {
    setPreviewing(true);
    try {
      setPreview(await renderPreview(editing.body));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPreview(null);
    } finally {
      setPreviewing(false);
    }
  };

  if (status === "loading") {
    return <p className="text-[13px] text-n500">Loading…</p>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div>
        <button
          type="button"
          onClick={() => {
            setEditing(BLANK);
            setPreview(null);
          }}
          className={`mb-4 w-full ${GHOST_BUTTON}`}
        >
          New piece
        </button>

        {narrow ? (
          <p className="mb-3 text-[12px] leading-[1.5] text-n500">
            Run{" "}
            <code className="font-mono text-[11px]">
              supabase/migrations/0003_writings_rich.sql
            </code>{" "}
            to add covers, previews and the quick-nav settings.
          </p>
        ) : null}
        {narrow ? (
          <PendingMigrations className="mb-3 text-[12px] leading-[1.5] text-n500" />
        ) : null}

        <ul className="flex flex-col divide-y divide-n200 border-y border-n200">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center gap-2 py-2.5">
              <button
                type="button"
                onClick={() => {
                  setEditing(row);
                  setPreview(null);
                }}
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
            <li className="py-3 text-[13px] text-n500">Nothing written yet.</li>
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
                // The slug follows the title until the piece has an identity of
                // its own; changing it afterwards would break published links.
                slug: p.id ? p.slug : slugify(v),
              }))
            }
          />
          <Field
            label="Slug"
            mono
            hint={`/writings/${editing.slug}`}
            value={editing.slug}
            onChange={(v) => setEditing((p) => ({ ...p, slug: slugify(v) }))}
          />
        </div>

        <Field
          label="Excerpt"
          value={editing.excerpt ?? ""}
          onChange={(v) => setEditing((p) => ({ ...p, excerpt: v }))}
        />

        {narrow ? null : (
          <>
            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-n200 p-3">
              <span className="w-full text-[12px] font-medium text-n600">
                Hero
              </span>
              <UploadButton
                label="Cover"
                folder="writings/covers"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onUploaded={(url) =>
                  setEditing((p) => ({ ...p, cover_image_url: url }))
                }
                onError={setError}
              />
              <Thumb
                src={editing.cover_image_url ?? null}
                onClear={() => setEditing((p) => ({ ...p, cover_image_url: null }))}
              />
              <Field
                label="Cover alt"
                value={editing.cover_alt ?? ""}
                onChange={(v) => setEditing((p) => ({ ...p, cover_alt: v }))}
              />
              <NumberField
                label="Height"
                value={editing.cover_height ?? 350}
                min={0}
                max={700}
                step={10}
                onChange={(v) => setEditing((p) => ({ ...p, cover_height: v ?? 350 }))}
              />
            </div>

            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-n200 p-3">
              <span className="w-full text-[12px] font-medium text-n600">
                List preview
                <span className="ml-2 font-normal text-n500">
                  shown on /writings when this row is held
                </span>
              </span>
              <UploadButton
                label="Preview"
                folder="writings/previews"
                accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml"
                onUploaded={(url) =>
                  setEditing((p) => ({ ...p, preview_image_url: url }))
                }
                onError={setError}
              />
              <Thumb
                src={editing.preview_image_url ?? null}
                onClear={() =>
                  setEditing((p) => ({ ...p, preview_image_url: null }))
                }
              />
              <Select
                label="Kind"
                value={(editing.preview_kind ?? "image") as "image" | "illustration"}
                options={[
                  { value: "image", label: "Image — fills the width" },
                  { value: "illustration", label: "Illustration — centred" },
                ]}
                onChange={(v) => setEditing((p) => ({ ...p, preview_kind: v }))}
              />
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <Toggle
                label="Quick-nav list"
                checked={editing.toc_enabled ?? true}
                onChange={(v) => setEditing((p) => ({ ...p, toc_enabled: v }))}
              />
              <Select
                label="Depth"
                value={String(editing.toc_depth ?? 2)}
                options={[
                  { value: "2", label: "Sections" },
                  { value: "3", label: "Sections and sub-sections" },
                ]}
                onChange={(v) =>
                  setEditing((p) => ({ ...p, toc_depth: Number(v) }))
                }
              />
              <Field
                label="SEO description"
                hint="falls back to the excerpt"
                value={editing.seo_description ?? ""}
                onChange={(v) => setEditing((p) => ({ ...p, seo_description: v }))}
              />
            </div>
          </>
        )}

        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[12px] text-n500">Insert</span>
            {SNIPPETS.map((snippet) => (
              <button
                key={snippet.label}
                type="button"
                onClick={() => insert(snippet.text)}
                className="rounded-full border border-n200 px-2.5 py-1 text-[11px] text-n500 transition-colors hover:border-n900 hover:text-n900"
              >
                {snippet.label}
              </button>
            ))}
            <UploadButton
              label="Image → figure"
              folder="writings/covers"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onUploaded={(url) =>
                insert(`\n::figure{src="${url}" alt="" caption=""}\n`)
              }
              onError={setError}
            />
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] text-n500">
              Body (Markdown)
              <span className="ml-2 text-n500">
                {readingTime(editing.body)} min read
              </span>
            </span>
            <textarea
              ref={bodyRef}
              rows={18}
              value={editing.body}
              onChange={(e) => setEditing((p) => ({ ...p, body: e.target.value }))}
              className="resize-y rounded-lg border border-n200 bg-n100 px-3 py-2 font-mono text-[12px] leading-[1.7] text-n900 outline-none focus:border-p500"
            />
          </label>
        </div>

        <details className="rounded-lg border border-n200 p-3">
          <summary className="cursor-pointer text-[12px] text-n500">
            What you can write
          </summary>
          <TextArea
            label=""
            mono
            rows={16}
            value={CHEAT_SHEET}
            onChange={() => {}}
          />
        </details>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className={SAVE_BUTTON}>
            {busy ? "Saving…" : "Save"}
          </button>
          <Toggle
            label="Published"
            checked={editing.published}
            onChange={(v) => setEditing((p) => ({ ...p, published: v }))}
          />
          <button
            type="button"
            onClick={() => void showPreview()}
            className={GHOST_BUTTON}
          >
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              {previewing ? "Rendering…" : "Preview"}
            </span>
          </button>
          <label className={`cursor-pointer ${GHOST_BUTTON}`}>
            <span className="inline-flex items-center gap-1.5">
              <UploadIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Import .md
            </span>
            <input
              type="file"
              accept=".md,.markdown,text/markdown"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void importMarkdown(file);
              }}
            />
          </label>
          <button type="button" onClick={exportMarkdown} className={GHOST_BUTTON}>
            <span className="inline-flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export .md
            </span>
          </button>
        </div>

        {preview ? (
          <div className="rounded-lg border border-n200 bg-n50 p-6">
            <p className="mb-4 text-[12px] text-n500">
              Preview — the same renderer the published page uses.
            </p>
            {preview}
          </div>
        ) : null}
      </form>
    </div>
  );
}

const CHEAT_SHEET = `Headings, lists, tables, task lists, footnotes, ~~strikethrough~~
and fenced code all work, as does **bold**, *italic*, \`code\` and [links](https://…).

A picture on its own line becomes a figure:
![Alt text](https://…/shot.webp "An optional caption")

Callouts:
:::note
Body, in Markdown.
:::
:::tip{title="Try this"}
:::warning

Figure, with the wide "bleed" treatment:
::figure{src="https://…/shot.webp" alt="Dashboard" caption="The queue view" bleed="true"}

Gallery:
:::gallery{columns="2"}
![One](https://…/a.webp)
![Two](https://…/b.webp)
:::

Video:
::video{src="https://…/clip.mp4" poster="https://…/poster.webp" autoplay="true" loop="true"}

Embed (youtube or vimeo only; the URL is built for you):
::embed{provider="youtube" id="dQw4w9WgXcQ"}

An inline highlight with a picture on hover:
:highlight[Supabase]{image="https://…/preview.webp" logo="https://…/logo.svg" link="https://supabase.com"}

HTML in the body is ignored, on purpose. Links may be http(s), mailto or
site-relative; images must be https or site-relative.`;
