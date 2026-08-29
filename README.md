# Portfolio — Roshan Muhammed R

Live: <https://portfolio-frontend-teal-ten.vercel.app/>

A developer portfolio built as a **layout visualizer**: one set of content,
rendered through three switchable presentations — a minimalist blueprint
(Architect), a code IDE (Terminal), and a frosted-glass treatment
(Glassmorphism). Everything else — résumé, contact, and per-project technical
deep dives — opens in modals over whichever layout is active.

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 — CSS-first tokens in [`app/globals.css`](app/globals.css), no `tailwind.config.js` |
| Type | Plus Jakarta Sans + JetBrains Mono, self-hosted via `next/font` |
| Icons | `lucide-react` |
| Motion | `motion` (Framer Motion), used by the Architect layout |

The page is a single statically prerendered route. There is no backend: the
contact form composes a `mailto:` and hands off to the visitor's mail client,
so **no environment variables are required**.

## Getting started

```bash
npm install
npm run dev
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server on <http://localhost:3000> |
| `npm run build` | Production build (lints and typechecks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Layout of the source

| Path | Holds |
|---|---|
| [`app/page.tsx`](app/page.tsx) | The shell: active layout, and the four modals |
| [`content/portfolioData.ts`](content/portfolioData.ts) | **All copy** — identity, experience, projects, stack, FAQ |
| [`types.ts`](types.ts) | The shapes that content file has to satisfy |
| `components/architect/` · `components/terminal/` · `components/glassmorphism/` | The three layouts |
| [`components/Navbar.tsx`](components/Navbar.tsx) · [`components/LayoutSwitcherBar.tsx`](components/LayoutSwitcherBar.tsx) | Chrome above the layouts |
| [`components/CommandPalette.tsx`](components/CommandPalette.tsx) | ⌘K / Ctrl+K palette |
| [`components/ResumeModal.tsx`](components/ResumeModal.tsx) · [`components/ContactModal.tsx`](components/ContactModal.tsx) · [`components/TechnicalDeepDiveModal.tsx`](components/TechnicalDeepDiveModal.tsx) | The overlays |
| [`components/SagaRagVisualizer.tsx`](components/SagaRagVisualizer.tsx) · [`components/KonnectifyWorkflowSim.tsx`](components/KonnectifyWorkflowSim.tsx) | Architecture diagrams inside the deep dives |

To change what the site says, edit `content/portfolioData.ts` — all three
layouts read from it.
