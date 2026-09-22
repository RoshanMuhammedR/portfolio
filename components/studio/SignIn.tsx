"use client";

import { useEffect, useState } from "react";
import type { AuthError } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/browser";

/**
 * A one-time code, not a password and not a link.
 *
 * There is exactly one account here, so a password is one more thing to leak.
 * Links were the first answer, but they fail for reasons that have nothing to
 * do with the owner: each new email voids the last link, a mail scanner can
 * open one before you do, and a link opened on a phone signs the phone in. A
 * code typed into this tab has none of those problems. The email shows the
 * code only if its template includes {{ .Token }} - see docs/BACKEND.md.
 *
 * Whether the address is the owner's is settled by the database, not by this
 * form - a session for anyone else can read published rows and write nothing.
 */
export function SignIn() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code" | "resent">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // SignIn mounts only on the client, after the session check, so the URL is
  // there to read on the first render.
  const [linkError, setLinkError] = useState(readLinkError);

  // Read once, then take it out of the address bar so a reload does not bring
  // the message back.
  useEffect(() => {
    if (linkError) clearLinkError();
  }, [linkError]);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    setBusy(true);
    setError("");
    setLinkError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // The owner's account already exists; this form never makes new ones.
        shouldCreateUser: false,
        // Only used while the email template still sends a link.
        emailRedirectTo: `${window.location.origin}/studio`,
      },
    });
    setBusy(false);

    if (error) {
      setError(sendError(error));
      return;
    }
    setCode("");
    setStep(step === "email" ? "code" : "resent");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    setBusy(true);
    setError("");
    // On success onAuthStateChange swaps this form for the editors.
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setBusy(false);
    if (error) setError(verifyError(error));
  };

  if (step !== "email") {
    return (
      <form onSubmit={verify} className="flex flex-col gap-3">
        <p className="text-[13px] leading-[1.62] text-n900">
          {step === "resent" ? "We emailed a new code to " : "We emailed a code to "}
          <span className="font-medium">{email}</span>.{" "}
          {step === "resent"
            ? "Use that one; the earlier code no longer works."
            : "It works once, within an hour, and only the newest code counts."}
        </p>
        <label htmlFor="code" className="text-[13px] text-n900">
          Code
        </label>
        <input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          required
          maxLength={10}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="w-full rounded-lg border border-n200 bg-n100 px-3 py-2 font-mono text-[18px] tracking-[0.35em] text-n900 outline-none focus:border-p500"
        />
        <button
          type="submit"
          disabled={busy || code.length < 6}
          className="w-fit rounded-full bg-n900 px-5 py-2.5 text-[13px] font-medium text-n50 transition-colors hover:bg-p700 disabled:opacity-50"
        >
          {busy ? "Checking…" : "Sign in"}
        </button>
        {error ? (
          <p role="alert" className="text-[12px] leading-[1.5] text-red-600">
            {error}
          </p>
        ) : null}
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-n500">
          <button
            type="button"
            onClick={() => void sendCode()}
            disabled={busy}
            className="underline decoration-n300 underline-offset-4 transition-colors hover:text-n900 disabled:opacity-50"
          >
            Send a new code
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError("");
            }}
            className="underline decoration-n300 underline-offset-4 transition-colors hover:text-n900"
          >
            Use a different email
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="flex flex-col gap-3">
      {linkError ? (
        <p
          role="alert"
          className="rounded-lg border border-n200 bg-n100 px-3 py-2.5 text-[13px] leading-[1.55] text-n900"
        >
          {linkError}
        </p>
      ) : null}
      <label htmlFor="email" className="text-[13px] text-n900">
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        className="w-full rounded-lg border border-n200 bg-n100 px-3 py-2 text-[13px] text-n900 outline-none placeholder:text-n500 focus:border-p500"
        placeholder="you@example.com"
      />
      <button
        type="submit"
        disabled={busy}
        className="w-fit rounded-full bg-n900 px-5 py-2.5 text-[13px] font-medium text-n50 transition-colors hover:bg-p700 disabled:opacity-50"
      >
        {busy ? "Sending…" : "Email me a code"}
      </button>
      {error ? (
        <p role="alert" className="text-[12px] leading-[1.5] text-red-600">
          {error}
        </p>
      ) : null}
    </form>
  );
}

/**
 * What a link that failed on its way here left in the URL, in plain words.
 * Supabase puts it in the hash for links and in the query for PKCE redirects.
 */
function readLinkError(): string | null {
  if (typeof window === "undefined") return null;
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const query = new URLSearchParams(window.location.search);
  const code = hash.get("error_code") ?? query.get("error_code");
  const description =
    hash.get("error_description") ?? query.get("error_description");

  if (!code && !description) return null;
  if (code === "otp_expired") {
    return "That sign-in link had already been used, had expired, or was replaced by a newer email. Ask for a code instead.";
  }
  return `That sign-in link didn’t work (${description ?? code}). Ask for a code instead.`;
}

function clearLinkError() {
  const url = new URL(window.location.href);
  for (const key of ["error", "error_code", "error_description"]) {
    url.searchParams.delete(key);
  }
  window.history.replaceState(null, "", url.pathname + url.search);
}

function sendError(error: AuthError): string {
  switch (error.code) {
    case "otp_disabled":
      return "Only the site owner’s address can sign in here.";
    case "signup_disabled":
      return "Your account was never confirmed, and sign-ups are off, so Supabase won’t email it a code. Run the confirm SQL under Troubleshooting in docs/BACKEND.md, then try again.";
    case "over_email_send_rate_limit":
      return error.message.includes("seconds")
        ? error.message
        : "Supabase’s email limit for this hour is used up. Use the newest code you already have, or try again later.";
    default:
      return error.message;
  }
}

function verifyError(error: AuthError): string {
  if (error.code === "otp_expired") {
    return "That code didn’t work. It may be mistyped, already used, or older than your newest email.";
  }
  return error.message;
}
