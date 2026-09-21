"use client";

import { useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

/**
 * A magic link, not a password.
 *
 * There is exactly one account here, so a password is one more thing to leak
 * and nothing to gain. Whether the address is the owner's is settled by the
 * database, not by this form - signing in as anyone else yields a session that
 * can read published rows and write nothing.
 */
export function SignIn() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    setState("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/studio` },
    });

    if (error) {
      setState("error");
      setMessage(error.message);
      return;
    }
    setState("sent");
  };

  if (state === "sent") {
    return (
      <p className="text-[13px] leading-[1.62] text-n900">
        Check <span className="text-n900">{email}</span> for a sign-in link. It
        expires in an hour.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
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
        disabled={state === "sending"}
        className="w-fit rounded-full bg-n900 px-5 py-2.5 text-[13px] font-medium text-n50 transition-colors hover:bg-p700 disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : "Send sign-in link"}
      </button>
      {state === "error" ? (
        <p role="alert" className="text-[12px] text-red-600">
          {message}
        </p>
      ) : null}
    </form>
  );
}
