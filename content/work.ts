/**
 * Every claim in this file traces to a line on the résumé. Nothing is inferred,
 * embellished, or measured. Framing sentences describe what the system does;
 * they never assert a result that isn't on the résumé.
 */

export type WorkKind = "project" | "experience";

export type WorkItem = {
  slug: string;
  kind: WorkKind;
  name: string;
  /** Short descriptor shown as the row's right-hand tag. */
  tag: string;
  /** One-line thesis for the landing row. */
  tagline: string;
  /** Two or three sentences for the landing row. */
  summary: string;
  /** Only set where the résumé states dates. */
  period?: string;
  role?: string;
  stack: readonly string[];
  links: { live?: string; repo?: string };
  image?: { src: string; alt: string; placeholder?: boolean };
  diagram: "saga" | "trip" | "konnectify";
  caseStudy: {
    context: readonly string[];
    build: readonly { title: string; body: string }[];
    stackTable: readonly { name: string; role: string }[];
  };
};

export const work: readonly WorkItem[] = [
  {
    slug: "saga",
    kind: "project",
    name: "Saga",
    tag: "RAG knowledge base",
    tagline:
      "A knowledge base that answers from your own documents — and links every answer back to the chunk it came from.",
    summary:
      "Full-stack retrieval platform in a pnpm/Turbo monorepo. PDFs, Markdown, YouTube transcripts and GitHub repositories are ingested asynchronously by Celery workers, embedded into pgvector, and served through an authenticated chat that cites its sources.",
    stack: [
      "Next.js",
      "FastAPI",
      "Celery",
      "Redis",
      "PostgreSQL",
      "pgvector",
      "pnpm",
      "Turbo",
    ],
    links: {
      live: "https://saga.dedyn.io/",
      repo: "https://github.com/RoshanMuhammedR/KB-ULT",
    },
    image: {
      src: "/work/saga.png",
      alt: "Screenshot of the Saga knowledge-base interface",
      placeholder: true,
    },
    diagram: "saga",
    caseStudy: {
      context: [
        "Saga is a knowledge-base platform built on retrieval-augmented generation. You point it at the material you already have — documents, notes, talks, code — and ask questions of it in plain language.",
        "The interesting problem is not the chat window. It is everything behind it: sources arrive in four different shapes, parsing and embedding them is far too slow to happen inside a request, and an answer that cannot be traced back to a source is not worth much in a knowledge base. Saga is built around those three constraints.",
      ],
      build: [
        {
          title: "Multi-source ingestion",
          body: "PDFs, Markdown and text files, YouTube transcripts and GitHub repositories each have their own extraction path, then converge on one shared chunk-and-embed pipeline so the rest of the system only ever deals with a single document shape.",
        },
        {
          title: "Async processing via Celery",
          body: "Ingestion is handed to Celery workers over Redis rather than run in the request cycle. Uploading a large source returns immediately, and the work proceeds in the background where it can be retried and observed independently.",
        },
        {
          title: "Citation-backed chat",
          body: "Authenticated chat runs over vector search against pgvector. Each response is linked to the specific source document chunks it was drawn from, so an answer can always be opened up and checked against the original material.",
        },
        {
          title: "Monorepo structure",
          body: "The Next.js frontend and the FastAPI service live in a single pnpm workspace with Turbo orchestrating tasks, which keeps shared configuration and types in one place across two languages.",
        },
      ],
      stackTable: [
        { name: "Next.js", role: "Authenticated app surface and chat interface" },
        { name: "FastAPI", role: "Ingestion and retrieval API" },
        { name: "Celery", role: "Background workers for parsing, chunking and embedding" },
        { name: "Redis", role: "Broker carrying ingestion jobs to the workers" },
        {
          name: "PostgreSQL + pgvector",
          role: "Document chunks and their embeddings in a single store",
        },
        { name: "pnpm + Turbo", role: "Monorepo tooling across the web and API packages" },
      ],
    },
  },
  {
    slug: "ai-trip-planner",
    kind: "project",
    name: "AI Trip Planner",
    tag: "AI travel assistant",
    tagline:
      "Turns a destination into a day-wise itinerary, with hotel suggestions and real photographs of the places.",
    summary:
      "A travel assistant built on Google Gemini for itinerary generation, the Google Places & Images API for real location data, and Google OAuth 2.0 for authentication. Trips are saved to a per-user history, and the prompting was tuned to raise the quality of the plans it produces.",
    stack: ["Google Gemini", "Google Places & Images API", "Google OAuth 2.0"],
    links: {
      live: "https://ai-trip-planner-rho-orcin.vercel.app/",
      repo: "https://github.com/RoshanMuhammedR/AI_Trip_Planner",
    },
    image: {
      src: "/work/ai-trip-planner.png",
      alt: "Screenshot of the AI Trip Planner itinerary interface",
    },
    diagram: "trip",
    caseStudy: {
      context: [
        "Planning a trip usually means holding a dozen browser tabs in your head at once: where to go on which day, what is actually near what, where to stay, and what any of it looks like.",
        "AI Trip Planner collapses that into a single request. You say where you are going; it returns a structured, day-wise itinerary with hotel suggestions and real images of each destination, and keeps a history of the trips you have planned.",
      ],
      build: [
        {
          title: "Day-wise itinerary generation",
          body: "Google Gemini produces personalised itineraries broken down by day, with hotel suggestions attached, rather than a single block of prose the user has to reorganise themselves.",
        },
        {
          title: "Real destination data",
          body: "The Google Places & Images API supplies location data and genuine photographs of each destination, so the plan is grounded in real places instead of generated descriptions alone.",
        },
        {
          title: "Authentication and trip history",
          body: "Google OAuth 2.0 handles sign-in, and each planned trip is persisted to the user's history so previous itineraries can be reopened rather than regenerated.",
        },
        {
          title: "Prompt tuning",
          body: "The generation prompts were iterated on specifically to improve itinerary quality — the difference between a model that answers the question and one that produces a plan you would actually follow.",
        },
      ],
      stackTable: [
        { name: "Google Gemini", role: "Itinerary generation from the user's request" },
        {
          name: "Google Places & Images API",
          role: "Location data and real destination photography",
        },
        { name: "Google OAuth 2.0", role: "Authentication and per-user trip history" },
      ],
    },
  },
  {
    slug: "konnectify",
    kind: "experience",
    name: "Konnectify",
    tag: "Software Development Intern",
    role: "Software Development Intern",
    period: "Jan 2026 — Jul 2026",
    tagline:
      "Full-stack feature work on a no-code iPaaS platform: granular permissions, credit accounting, and workflow-builder performance.",
    summary:
      "Konnectify is a no-code SaaS iPaaS platform. I shipped full-stack features across a Next.js and NestJS codebase — an invite-based user management system with minute-level permissions, a Redis-backed task crediting system, and Redux optimisation for the workflow builder.",
    stack: [
      "Next.js",
      "NestJS",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Redis",
      "BullMQ",
      "Tailwind CSS",
      "Redux",
    ],
    links: {},
    diagram: "konnectify",
    caseStudy: {
      context: [
        "Konnectify is a no-code iPaaS platform: users assemble automations by wiring apps together on a canvas, and the platform runs those workflows on their behalf.",
        "That shape creates three recurring engineering problems — the builder canvas has to stay responsive as graphs grow, running workflows has to be metered without hammering the database, and teams need to control precisely who can touch what. My work over the internship sat on all three.",
      ],
      build: [
        {
          title: "Invite-based user management with granular permissions",
          body: "Built an invite-driven user management system supporting minute-level permissions and custom role creation. Access is enforced server-side: backend endpoints resolve the caller's assigned roles dynamically rather than relying on the UI to hide what a user cannot do.",
        },
        {
          title: "Task-based crediting on Redis",
          body: "Introduced a crediting system that meters task consumption in Redis and batches aggregated writes back to the database, so metering keeps up with execution volume instead of issuing a database write per task.",
        },
        {
          title: "Workflow builder performance",
          body: "Optimised Redux state management in the workflow builder, improving performance on large automation graphs where the volume of nodes and connections made state updates the bottleneck.",
        },
        {
          title: "Full-stack feature delivery",
          body: "Feature work spanned the Next.js frontend and the NestJS backend in TypeScript, over PostgreSQL with Prisma, with Redis and BullMQ handling queued and background work.",
        },
      ],
      stackTable: [
        { name: "Next.js", role: "Product frontend, including the workflow builder" },
        { name: "Redux", role: "Builder canvas state — the target of the performance work" },
        { name: "NestJS", role: "Backend services and permission-enforcing endpoints" },
        { name: "PostgreSQL + Prisma", role: "Primary data store and access layer" },
        { name: "Redis", role: "Task credit accounting with batched write-back" },
        { name: "BullMQ", role: "Queued and background job processing" },
        { name: "Tailwind CSS", role: "Product UI styling" },
      ],
    },
  },
] as const;

export const projects = work.filter((item) => item.kind === "project");
export const roles = work.filter((item) => item.kind === "experience");

export function getWorkItem(slug: string): WorkItem | undefined {
  return work.find((item) => item.slug === slug);
}
