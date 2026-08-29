import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-plate flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-lg border border-[#D4D8CF] bg-[#F4F6F1] p-8">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#4E5564]">
          404 &middot; Route not found
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#121316]">
          This path is not wired up.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#4E5564]">
          The link is out of date, or the page it pointed at was renamed. Everything lives on the
          single canvas at the root.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#232832] px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#16181F]"
        >
          <span aria-hidden="true">&larr;</span>
          <span>Back to the portfolio</span>
        </Link>
      </div>
    </main>
  );
}
