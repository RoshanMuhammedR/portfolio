"use client";

import { useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { uploadToMedia, type UploadFolder } from "@/lib/upload";

/** The studio's form parts, so every editor looks and behaves the same and no
 *  tab has to reinvent a text input. */

const INPUT =
  "w-full rounded-lg border border-n200 bg-n100 px-3 py-2 text-[13px] text-n900 outline-none placeholder:text-n500 focus:border-p500";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  mono,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  mono?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-[12px] text-n500">
        {label}
        {hint ? <span className="ml-2 text-n500">{hint}</span> : null}
      </span>
      <input
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT}${mono ? " font-mono text-[12px]" : ""}`}
      />
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] text-n500">{label}</span>
      <input
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
        step={step}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        className={`${INPUT} w-[12ch]`}
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  mono,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  mono?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] text-n500">
        {label}
        {hint ? <span className="ml-2 text-n500">{hint}</span> : null}
      </span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT} resize-y${mono ? " font-mono text-[12px] leading-[1.7]" : ""}`}
      />
    </label>
  );
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] text-n500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={INPUT}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex shrink-0 items-center gap-2 text-[12px] text-n500">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-baseline justify-between text-[12px] text-n500">
        {label}
        <span className="font-mono text-[11px] text-n500">{value}</span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-p500"
      />
    </label>
  );
}

/**
 * Browser to Supabase Storage, straight there. The row is only updated once the
 * file is actually in the bucket, so a failed upload cannot leave a URL behind
 * that serves a 404.
 */
export function UploadButton({
  label,
  folder,
  accept,
  onUploaded,
  onError,
}: {
  label: string;
  folder: UploadFolder;
  accept: string;
  onUploaded: (url: string) => void;
  onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <label
      className={`flex cursor-pointer items-center gap-1.5 rounded-full border border-n200 px-3 py-1.5 text-[12px] text-n500 transition-colors hover:border-n900 hover:text-n900 ${
        busy ? "pointer-events-none opacity-50" : ""
      }`}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <Upload className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {label}
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            const { url } = await uploadToMedia(file, folder);
            onUploaded(url);
          } catch (error) {
            onError(error instanceof Error ? error.message : String(error));
          } finally {
            setBusy(false);
          }
        }}
      />
    </label>
  );
}

export function DeleteButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-n500 transition-colors hover:bg-n100 hover:text-red-600"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}

export function Thumb({
  src,
  onClear,
}: {
  src: string | null;
  onClear: () => void;
}) {
  if (!src) return null;
  return (
    <span className="flex items-center gap-2">
      <img
        src={src}
        alt=""
        className="h-10 w-16 rounded border border-n200 object-cover"
      />
      <button
        type="button"
        onClick={onClear}
        className="text-[12px] text-n500 underline underline-offset-2 hover:text-red-600"
      >
        Remove
      </button>
    </span>
  );
}

/** This project's SQL editor, when the backend is a hosted Supabase project. */
function sqlEditorUrl(): string | null {
  const ref = /^https:\/\/([a-z0-9]+)\.supabase\.co\/?$/.exec(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  )?.[1];
  return ref ? `https://supabase.com/dashboard/project/${ref}/sql/new` : null;
}

/** Said under every "not there yet" note: the pending migrations are also one
 *  file, and this is where it goes. */
export function PendingMigrations({ className = "" }: { className?: string }) {
  const editor = sqlEditorUrl();
  return (
    <p className={className}>
      Or apply every pending migration at once: paste{" "}
      <code className="font-mono text-[0.92em]">supabase/pending.sql</code> into{" "}
      {editor ? (
        <a
          href={editor}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-n300 underline-offset-2 transition-colors hover:decoration-n900"
        >
          the SQL editor
        </a>
      ) : (
        "the SQL editor"
      )}{" "}
      and press Run.
    </p>
  );
}

export function ErrorLine({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-[12px] text-red-600">
      {message}
    </p>
  );
}

/** Up/down rather than drag: keyboard-reachable, and there is no drop target to
 *  miss on a long list. */
export function ReorderButtons({
  onUp,
  onDown,
  disabledUp,
  disabledDown,
}: {
  onUp: () => void;
  onDown: () => void;
  disabledUp: boolean;
  disabledDown: boolean;
}) {
  const base =
    "flex h-6 w-6 items-center justify-center rounded border border-n200 text-[11px] text-n500 transition-colors hover:border-n900 hover:text-n900 disabled:opacity-30";
  return (
    <span className="flex shrink-0 gap-1">
      <button
        type="button"
        onClick={onUp}
        disabled={disabledUp}
        aria-label="Move up"
        className={base}
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={disabledDown}
        aria-label="Move down"
        className={base}
      >
        ↓
      </button>
    </span>
  );
}

export const SAVE_BUTTON =
  "rounded-full bg-n900 px-5 py-2.5 text-[13px] font-medium text-n50 transition-colors hover:bg-p700 disabled:opacity-50";
export const GHOST_BUTTON =
  "rounded-full border border-n200 px-4 py-2 text-[13px] text-n900 transition-colors hover:border-n900";
