import { NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
]);

/** Filebase speaks S3; only the endpoint and the path style differ. */
function filebase() {
  const accessKeyId = process.env.FILEBASE_ACCESS_KEY;
  const secretAccessKey = process.env.FILEBASE_SECRET_KEY;
  const bucket = process.env.FILEBASE_BUCKET;
  const publicUrl = process.env.FILEBASE_PUBLIC_URL;

  if (!accessKeyId || !secretAccessKey || !bucket || !publicUrl) return null;

  return {
    bucket,
    publicUrl: publicUrl.replace(/\/$/, ""),
    client: new S3Client({
      region: "us-east-1",
      endpoint: "https://s3.filebase.com",
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    }),
  };
}

/**
 * Hands back a short-lived PUT url so the image goes browser -> Filebase
 * directly and never through this server.
 *
 * The caller proves who they are with their Supabase access token; the email on
 * it has to be the owner's. The anon key alone is not enough - it is public.
 */
async function isOwner(request: Request): Promise<boolean> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const owner = process.env.OWNER_EMAIL;

  if (!token || !url || !anonKey || !owner) return false;

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return false;

  return data.user.email.toLowerCase() === owner.toLowerCase();
}

export async function POST(request: Request) {
  const store = filebase();
  if (!store) {
    return NextResponse.json(
      { error: "Filebase is not configured. See docs/BACKEND.md." },
      { status: 501 },
    );
  }

  if (!(await isOwner(request))) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  let body: { filename?: string; contentType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const contentType = body.contentType ?? "";
  if (!ALLOWED.has(contentType)) {
    return NextResponse.json(
      { error: `Unsupported image type: ${contentType || "none given"}.` },
      { status: 415 },
    );
  }

  // The client's filename is never used as the key - only its extension, and
  // only after it has been checked against the content type above.
  const extension = contentType.split("/")[1].replace("jpeg", "jpg");
  const key = `craft/${crypto.randomUUID()}.${extension}`;

  const uploadUrl = await getSignedUrl(
    store.client,
    new PutObjectCommand({
      Bucket: store.bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 300 },
  );

  return NextResponse.json({
    uploadUrl,
    publicUrl: `${store.publicUrl}/${key}`,
  });
}
