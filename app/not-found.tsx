import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center px-5 py-20 sm:px-8">
      <p className="mono-label">
        <span className="text-accent">404</span> / Not found
      </p>
      <h1 className="mt-6 text-4xl font-medium tracking-tight sm:text-5xl">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-4 max-w-measure text-ink-dim">
        The link may be out of date, or the page may have been renamed.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="inline-block border border-line px-4 py-3 font-mono text-[0.6875rem] tracking-widest text-ink uppercase transition-colors hover:border-accent hover:text-accent"
        >
          Back to the portfolio
        </Link>
      </div>
    </div>
  );
}
