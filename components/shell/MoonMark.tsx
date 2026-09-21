/** The mark: a waxing crescent, cut by overlap rather than drawn as an arc so
 *  it stays crisp at 20px. Decorative - the wordmark beside it carries the name. */
export function MoonMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask id="moon-bite">
          <rect width="24" height="24" fill="white" />
          <circle cx="16.5" cy="9.5" r="9" fill="black" />
        </mask>
      </defs>
      <circle cx="12" cy="12" r="9" fill="currentColor" mask="url(#moon-bite)" />
    </svg>
  );
}
