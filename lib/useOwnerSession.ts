"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getBrowserSupabase, supabaseConfigured } from "@/lib/supabase/browser";

export type SessionState =
  | { status: "unconfigured" }
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; session: Session; email: string };

/**
 * Who is at the keyboard.
 *
 * "signed-in" here means only that Supabase issued a session - it is not a
 * claim of ownership. The database decides that: a non-owner gets a session and
 * every write it attempts comes back empty.
 */
export function useOwnerSession(): SessionState {
  const [state, setState] = useState<SessionState>(
    supabaseConfigured ? { status: "loading" } : { status: "unconfigured" },
  );

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    const settle = (session: Session | null) =>
      setState(
        session?.user.email
          ? { status: "signed-in", session, email: session.user.email }
          : { status: "signed-out" },
      );

    void supabase.auth.getSession().then(({ data }) => settle(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      settle(session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return state;
}
