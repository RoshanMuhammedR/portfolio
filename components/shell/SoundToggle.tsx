"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/lib/sound";

/**
 * The one control in the corner. It names the destination in its accessible
 * name ("Turn sound on"), because a speaker glyph alone cannot say which way it
 * is about to go, and the provider confirms the new state with the cue itself.
 */
export function SoundToggle() {
  const { enabled, toggle } = useSound();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn sound off" : "Turn sound on"}
      title={enabled ? "Turn sound off" : "Turn sound on"}
      className="flex h-6 w-6 items-center justify-center rounded text-n500 transition-colors duration-[120ms] hover:text-n900"
    >
      {enabled ? (
        <Volume2 className="h-4 w-4" aria-hidden="true" />
      ) : (
        <VolumeX className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
