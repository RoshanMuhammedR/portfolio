"use client";

import { getBrowserSupabase } from "@/lib/supabase/browser";

/**
 * Uploads for the studio.
 *
 * The signed-in browser client writes straight into the public `media` bucket;
 * storage RLS (migration 0006) checks the owner email on the way in, so nothing
 * has to be proxied through a route handler and no S3 credential exists to
 * leak. `/api/uploads` (Filebase) is still there as an alternative, but nothing
 * here depends on it.
 */

export const IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
] as const;

export const MODEL_TYPES = ["model/gltf-binary", "model/gltf+json"] as const;

/** Big enough for a 1440px capture or a compressed .glb, small enough that a
 *  mis-drop does not sit in the bucket forever. */
const MAX_BYTES = 12 * 1024 * 1024;

const EXTENSION: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "model/gltf-binary": "glb",
  "model/gltf+json": "gltf",
};

export type UploadFolder =
  | "craft"
  | "writings/covers"
  | "writings/previews"
  | "interests"
  | "work";

export type UploadResult = { url: string; path: string };

/**
 * The browser's filename is never used as the key - only an extension derived
 * from the content type, so a file called `../../x.html` cannot pick its own
 * path or its own served type.
 */
export async function uploadToMedia(
  file: File,
  folder: UploadFolder,
): Promise<UploadResult> {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const type = file.type;
  const extension = EXTENSION[type];
  if (!extension) {
    throw new Error(`Unsupported file type: ${type || "unknown"}.`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(
      `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB; the limit is ${
        MAX_BYTES / 1024 / 1024
      } MB.`,
    );
  }

  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: type, cacheControl: "31536000" });

  if (error) {
    // The most common cause by far, and the one worth naming.
    if (/bucket/i.test(error.message)) {
      throw new Error(
        `${error.message} — run supabase/migrations/0006_media_bucket.sql.`,
      );
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** Used when a cover or preview is replaced, so the bucket does not fill with
 *  orphans. A failure here is not worth surfacing: the row already points at
 *  the new file. */
export async function removeFromMedia(url: string): Promise<void> {
  const supabase = getBrowserSupabase();
  if (!supabase) return;
  const marker = "/storage/v1/object/public/media/";
  const at = url.indexOf(marker);
  if (at === -1) return;
  await supabase.storage.from("media").remove([url.slice(at + marker.length)]);
}
