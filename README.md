# Portfolio — Roshan Muhammed R

Live: <https://portfolio-frontend-teal-ten.vercel.app/>

A developer portfolio built as a spec sheet: a landing page that states what I
build, and case-study pages that show how three of those systems actually work.

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 — CSS-first tokens in [`app/globals.css`](app/globals.css), no `tailwind.config.js` |
| Type | Geist + Geist Mono, self-hosted via `next/font` |
| Email | Resend, through [`app/api/contact/route.ts`](app/api/contact/route.ts) |
| Motion | IntersectionObserver + CSS transitions. No animation library. |

Every route except the contact API is statically prerendered.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in RESEND_API_KEY and CONTACT_TO_EMAIL
npm run dev
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server on <http://localhost:3000> |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (flat config, typescript-eslint + react-hooks) |

## Layout

```
app/
  layout.tsx            Shell: fonts, metadata, grid backdrop, header/footer
  page.tsx              Landing — composes the six sections
  work/[slug]/page.tsx  Case studies, statically generated from content/work.ts
  api/contact/route.ts  Contact form handler (Resend)
  globals.css           Design tokens and the handful of custom utilities
components/
  layout/               Header, footer, blueprint grid
  sections/             One file per landing section
  work/diagrams/        Hand-placed SVG architecture diagrams
  ui/                   SectionHeader, ArrowLink, TechChip, Reveal
content/                All copy. Nothing user-facing is hardcoded in JSX.
lib/                    cn(), useActiveSection()
```

### Editing content

Every string on the site lives in `content/`. Adding a project means adding one
entry to `content/work.ts` and one diagram component — no JSX duplication.

## Design notes

- **Dark only, one accent.** Tokens are defined once under `@theme`; nothing
  hardcodes a hex value outside `globals.css`.
- **Motion is CSS.** `Reveal` flips a `data-revealed` attribute via
  IntersectionObserver and lets a CSS transition do the work — no React state,
  no re-render. `prefers-reduced-motion: reduce` resolves everything instantly.
- **Diagrams scroll rather than shrink.** Each SVG keeps a minimum width inside
  an `overflow-x-auto` frame so labels stay legible on a phone.

## Deployment

Deployed on Vercel. The project's framework preset must be **Next.js** (it was
previously a Vite project), and `RESEND_API_KEY` / `CONTACT_TO_EMAIL` must be set
as environment variables.
