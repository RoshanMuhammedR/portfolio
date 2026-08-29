# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Balanced across three readers who arrive at the same single page, confirmed by the user:

- **Recruiters and HR screeners.** Non-engineers scanning for role, stack keywords, dates, location, and a résumé link. Reading time measured in seconds; they need to be able to forward the page.
- **Engineering leads and hiring managers.** Read the actual substance — the permissions model at Konnectify, the ingestion pipeline in Saga — and judge the thinking behind it. This reader makes the hiring call.
- **Startup founders and small teams.** Looking for a generalist who ships end to end across frontend, API, data, and queues.

No single audience is prioritised over the others. The page must be skimmable on the first pass and deep on the second, without being two different pages.

## Product Purpose

A personal portfolio for Roshan Muhammed R, a final-year B.Tech CSE student at SASTRA (2022–2026) entering the job market as a full-stack engineer. Success is a reply: an email, a message through the contact form, or a résumé download that leads to a conversation.

## Positioning

Full-stack in the literal sense rather than the résumé sense — product surfaces in Next.js and React, APIs in NestJS and FastAPI, and the PostgreSQL, Redis, and queue layers underneath. The differentiator across both the internship and the personal project is the same instinct: move expensive work out of the request cycle. Celery workers over Redis for ingestion in Saga; Redis-batched credit accounting instead of a database write per task at Konnectify. That is a systems reflex, not a framework list, and it is what the page has to make legible.

## Operating Context

- The page is evaluated in a hiring funnel, usually alongside a résumé PDF and a GitHub profile, often on a phone, frequently in a browser tab opened next to five other candidates' pages.
- The résumé PDF at `/resume.pdf` is a parallel artifact; the page must not contradict it.
- Two of the three work items are publicly reachable and live; the third (Konnectify) is proprietary and has no link.

## Capabilities and Constraints

- Next.js 15 App Router, React 19, Tailwind CSS v4 (CSS-first `@theme` tokens), TypeScript. No component library.
- Working contact form: `POST /api/contact` → Resend, with a honeypot field and toast feedback via `sonner`. Environment keys already provisioned.
- Content lives in typed modules under `content/` (`site.ts`, `work.ts`, `skills.ts`, `education.ts`) and is the single source of truth for the page.
- **Scope decision (this session):** the `/work/[slug]` case-study route is removed at the user's explicit instruction. The portfolio becomes a single page. Case-study depth that is worth keeping moves onto that page rather than being deleted with the route.
- Deployed on Vercel at `https://portfolio-frontend-teal-ten.vercel.app`.

## Brand Commitments

None binding. The user placed nothing off-limits and approved a complete replacement of the visual world. The name "Roshan Muhammed R", the résumé-traceable facts, and the working contact pipeline are the only fixed points.

## Evidence on Hand

- **Real:** two live deployed projects with public repos (Saga — `saga.dedyn.io`; AI Trip Planner — Vercel), one screenshot at `public/work/ai-trip-planner.png` (1907×929), a résumé PDF, verified academic record (CGPA 8.83; Class 12 95.2%; Class 10 93%; top 1.5% nationally, INR 10,000 award), and a dated internship (Konnectify, Jan 2026 – Jul 2026).
- **Missing:** there is no Saga screenshot — the current build renders a "Figure pending" placeholder for it. Either a real capture is supplied or the design must not depend on having one.
- **Must not be fabricated:** no metrics, no percentage improvements, no testimonials, no user counts, no latency numbers. Every claim in `content/work.ts` traces to a line on the résumé and the file says so explicitly. That constraint holds.

## Product Principles

1. **Every claim traces to the résumé.** No invented metrics, outcomes, or endorsements — the existing content files enforce this and the redesign inherits the rule.
2. **Skimmable in seconds, deep on the second pass.** One page must serve the recruiter's 30-second scan and the engineering lead's real read without splitting into two experiences.
3. **The systems thinking is the product.** Async work, permission models, and batched writes are the substance; the design exists to make that legible, not to decorate a keyword list.
4. **Absence is stated, never filled.** A missing screenshot, an unlinkable proprietary project, and an undisclosed metric are shown as what they are.
5. **The contact path is never more than one action away.** Reply is the success condition; every screen state keeps it reachable.

## Accessibility & Inclusion

No user-specific requirement was established. The incumbent build set a real floor that the replacement must hold: skip link, `aria-labelledby` on every section, visible focus ring, `prefers-reduced-motion` honoured, and content that remains visible without JavaScript.
