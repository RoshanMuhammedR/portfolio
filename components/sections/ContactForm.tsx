"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

const fieldClass =
  "w-full border border-line bg-surface px-3.5 py-3 text-[0.9375rem] text-ink placeholder:text-ink-faint transition-colors hover:border-line-strong focus:border-accent focus:outline-none";

export function ContactForm() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));

    setPending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        throw new Error(body.message ?? "Something went wrong.");
      }

      form.reset();
      toast.success("Message sent — I'll reply to your email.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send message.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* Honeypot: real people never see it, bots fill it in. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mono-label mb-2 block">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Your name"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="email" className="mono-label mb-2 block">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            placeholder="you@company.com"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mono-label mb-2 block">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={5000}
          placeholder="What are you building?"
          className={cn(fieldClass, "resize-y")}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="group/send inline-flex items-center gap-2.5 border border-accent bg-accent-dim px-5 py-3 font-mono text-xs tracking-widest text-accent uppercase transition-colors hover:bg-accent hover:text-canvas disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-accent-dim disabled:hover:text-accent"
        >
          {pending ? "Sending" : "Send message"}
          <span
            aria-hidden="true"
            className={cn(
              "inline-block size-1.5 bg-current transition-transform duration-300",
              pending ? "animate-pulse" : "group-hover/send:translate-x-1",
            )}
          />
        </button>
        <p aria-live="polite" className="mono-label">
          {pending ? "Transmitting…" : null}
        </p>
      </div>
    </form>
  );
}
