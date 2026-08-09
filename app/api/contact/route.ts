import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

/**
 * Per-instance rate limit. Serverless instances are short-lived and not shared,
 * so this is a speed bump against casual abuse rather than a guarantee — the
 * honeypot and Resend's own limits do the rest.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > LIMIT;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Malformed request." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";

  // Honeypot. Report success so bots get no signal from the response.
  if (company) {
    return NextResponse.json({ message: "Message sent." });
  }

  if (!name || !email || !message) {
    return NextResponse.json({ message: "All fields are required." }, { status: 400 });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ message: "That email doesn't look right." }, { status: 400 });
  }

  if (name.length > 100 || email.length > 200 || message.length > 5000) {
    return NextResponse.json({ message: "That message is too long." }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { message: "Too many messages. Try again shortly." },
      { status: 429 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !to) {
    console.error("Contact form is not configured: missing RESEND_API_KEY or CONTACT_TO_EMAIL");
    return NextResponse.json(
      { message: "Contact form is unavailable right now." },
      { status: 503 },
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
    });

    if (error) {
      console.error("Resend rejected the message:", error);
      return NextResponse.json({ message: "Could not send message." }, { status: 502 });
    }

    return NextResponse.json({ message: "Message sent." });
  } catch (error) {
    console.error("Contact route failed:", error);
    return NextResponse.json({ message: "Could not send message." }, { status: 500 });
  }
}
