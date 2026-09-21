import { SoundToggle } from "./SoundToggle";
import { ThemeToggle } from "./ThemeToggle";

/** Sound, a hairline, then theme - the reference's "speaker | EN FR" layout. */
export function CornerControls() {
  return (
    <div className="flex items-center gap-2">
      <SoundToggle />
      <span className="h-3.5 w-px bg-n300" aria-hidden="true" />
      <ThemeToggle />
    </div>
  );
}
