import { IdentityInfo, ExperienceItem, ProjectItem, StackCategory } from '@/types';

export const identityData: IdentityInfo = {
  name: "Roshan Muhammed R",
  role: "Full-stack engineer",
  location: "Chennai, India",
  email: "roshanmuhammed50@gmail.com",
  phone: "+91 80 56 73 17 11",
  github: "github.com/RoshanMuhammedR",
  githubUrl: "https://github.com/RoshanMuhammedR",
  linkedin: "linkedin.com/in/roshan2004",
  linkedinUrl: "https://linkedin.com/in/roshan2004",
  resumeUrl: "/resume.pdf",
  liveSite: "portfolio-frontend-teal-ten.vercel.app",
  liveSiteUrl: "https://portfolio-frontend-teal-ten.vercel.app",
  positioningLine: "builds full-stack products end to end — product surfaces in Next.js and React, APIs in NestJS and FastAPI, and the PostgreSQL, Redis and queue layers underneath that keep them fast."
};

export const experienceData: ExperienceItem[] = [
  {
    id: "konnectify",
    company: "Konnectify",
    role: "Software Development Intern",
    period: "Jan 2026 – Jul 2026",
    summary: "Built full-stack features across Next.js and NestJS for an iPaaS canvas platform.",
    highlights: [
      {
        title: "User Management & RBAC",
        description: "Built invite-based onboarding with minute-level permissions dynamically resolved on the backend.",
        badge: "Security & RBAC"
      },
      {
        title: "Task-Based Crediting",
        description: "Metered execution consumption in Redis with batched writes back to PostgreSQL.",
        badge: "Distributed Systems"
      },
      {
        title: "Workflow Canvas Optimization",
        description: "Streamlined Redux state updates for large node and connection graphs.",
        badge: "Frontend Engine"
      }
    ],
    stack: ["Next.js", "NestJS", "TypeScript", "PostgreSQL", "Prisma", "Redis", "BullMQ", "Tailwind", "Redux"],
    proprietary: true
  }
];

export const projectsData: ProjectItem[] = [
  {
    id: "saga",
    title: "Saga",
    subtitle: "Agentic RAG Knowledge Base",
    tagline: "Autonomous multi-source document ingestion & agentic query planning with chunk citation tracing.",
    liveUrl: "https://saga.dedyn.io/",
    repoUrl: "https://github.com/RoshanMuhammedR/KB-ULT",
    description: "An agentic RAG knowledge base that answers from multi-format documents with deterministic chunk citations. Features autonomous query planning that decomposes complex prompts into targeted vector retrievals across PDFs, Markdown, YouTube transcripts, and GitHub repositories. Ingestion runs asynchronously on Celery workers over Redis, persisting embeddings to PostgreSQL with pgvector in a Next.js + FastAPI Turborepo.",
    architectureHighlights: [
      "Agentic query decomposition & multi-step citation routing",
      "Multi-source ingestion: PDFs, Markdown/text, YouTube transcripts, GitHub repos",
      "Asynchronous Celery workers over Redis for non-blocking ingestion",
      "PostgreSQL + pgvector HNSW similarity queries with chunk offset citations"
    ],
    stack: ["Next.js", "FastAPI", "Python", "TypeScript", "PostgreSQL", "pgvector", "Celery", "Redis", "Turbo", "pnpm"],
    diagramType: "rag-pipeline",
    deepDive: {
      overview: "Saga resolves hallucination in enterprise documentation by providing deterministic citations tied directly to source chunks and timestamps.",
      problem: "Heavy multi-source parsing inside synchronous HTTP handlers caused server timeouts and high latency.",
      solution: "Decoupled extraction workers via Celery + Redis queues with an idempotent chunk-and-embed pipeline into PostgreSQL pgvector.",
      codeSample: {
        file: "ingestion/pipeline.py",
        code: `@celery_app.task(bind=True, max_retries=3)
def ingest_document_chunks(self, document_id: str, file_uri: str, parser_type: str):
    # 1. Specialized extractor dispatch
    extractor = get_extractor(parser_type)
    raw_nodes = extractor.extract(file_uri)

    # 2. Semantic chunking with overlap
    chunker = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)
    chunks = chunker.split_documents(raw_nodes)

    # 3. Vector embedding generation
    embeddings = embedding_model.encode([c.text for c in chunks])

    # 4. Atomic pgvector bulk upsert with metadata lineage
    with SessionLocal() as db:
        records = [
            VectorChunk(
                doc_id=document_id,
                chunk_index=idx,
                content=chunk.text,
                embedding=embeddings[idx],
                metadata={"source": file_uri, "offset": chunk.metadata.get("offset")}
            )
            for idx, chunk in enumerate(chunks)
        ]
        db.bulk_save_objects(records)
        db.commit()
    return {"status": "indexed", "total_chunks": len(chunks)}`
      }
    }
  },
  {
    id: "ai-trip-planner",
    title: "AI Trip Planner",
    subtitle: "Contextual Itinerary Engine",
    tagline: "Turns a destination into a day-wise itinerary with hotel suggestions and real photographs.",
    liveUrl: "https://ai-trip-planner-rho-orcin.vercel.app/",
    repoUrl: "https://github.com/RoshanMuhammedR/AI_Trip_Planner",
    description: "Turns a destination into a verified day-wise itinerary with hotel suggestions and authentic photographs. Integrates Google Gemini with structured output schemas, Google Places & Images API for real geo-coordinates and photography, and Google OAuth 2.0 with per-user saved trip history.",
    architectureHighlights: [
      "Custom Gemini structured prompt schemas for realistic travel pacing and budget allocation",
      "Google Places & Images API integration for verified geo-coordinates, reviews, and high-res imagery",
      "Google OAuth 2.0 with per-user trip history synchronization",
      "Responsive interactive map and timeline rendering"
    ],
    stack: ["React", "Tailwind CSS", "Google Gemini API", "Google Places API", "Google OAuth 2.0", "Node.js"],
    diagramType: "trip-planner",
    deepDive: {
      overview: "Delivers realistic, hour-by-hour travel itineraries with verified places, driving durations, and authentic photos instead of generic AI lists.",
      problem: "Raw LLM generation regularly hallucinated non-existent restaurants and outdated hotel pricing.",
      solution: "Structured JSON schema output from Gemini grounded with real-time Google Places API validation and photos.",
      codeSample: {
        file: "services/itinerary-generator.ts",
        code: `export async function generateVerifiedTrip(req: TripRequest): Promise<TripPlan> {
  // 1. Structured Gemini prompt with strict JSON schema
  const prompt = buildStructuredItineraryPrompt(req.destination, req.days, req.budget, req.travelers);
  const rawPlan = await geminiModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });

  const parsedPlan: RawItinerary = JSON.parse(rawPlan.response.text());

  // 2. Parallel grounding with Google Places API for real photos & coordinates
  const enrichedDays = await Promise.all(
    parsedPlan.itinerary.map(async (day) => {
      const enrichedPlan = await Promise.all(
        day.activities.map(async (activity) => {
          const placeDetails = await fetchGooglePlaceDetails(activity.placeName, req.destination);
          return {
            ...activity,
            verifiedAddress: placeDetails.formatted_address,
            geo: placeDetails.geometry.location,
            photoUrl: placeDetails.photos?.[0]?.url || '/placeholder-place.jpg',
            rating: placeDetails.rating
          };
        })
      );
      return { ...day, activities: enrichedPlan };
    })
  );

  return { ...parsedPlan, days: enrichedDays };
}`
      }
    }
  }
];

export const stackCategories: StackCategory[] = [
  {
    layer: "Surface",
    title: "Product Surfaces",
    description: "Responsive, high-frame-rate user interfaces with granular client state and modern animations.",
    skills: [
      { name: "Next.js", highlight: true, useCase: "App Router, SSR, Server Components" },
      { name: "React", highlight: true, useCase: "Hooks, Concurrent Features, Custom UI" },
      { name: "Tailwind CSS", highlight: true, useCase: "Design systems, responsive tokens" },
      { name: "Redux", highlight: false, useCase: "Optimized complex canvas state" },
      { name: "Zustand", highlight: false, useCase: "Lightweight modular store" }
    ]
  },
  {
    layer: "Logic",
    title: "Backend & API Services",
    description: "Robust, type-safe API gateways, asynchronous microservices, and high-throughput ingestion pipelines.",
    skills: [
      { name: "NestJS", highlight: true, useCase: "Modular microservices, Guards, Interceptors" },
      { name: "FastAPI", highlight: true, useCase: "Async Python, Pydantic, RAG endpoints" },
      { name: "Node.js", highlight: false, useCase: "Event loop, streams, worker threads" },
      { name: "Express.js", highlight: false, useCase: "RESTful routing, middleware pipelines" },
      { name: "REST APIs", highlight: false, useCase: "Contract-first OpenAPI & JSON Schema" }
    ]
  },
  {
    layer: "Foundations",
    title: "Data, Queues & Infrastructure",
    description: "Durable relational schemas, in-memory caching, vector search indexing, and background task runners.",
    skills: [
      { name: "PostgreSQL", highlight: true, useCase: "Relational modeling, indexing, CTEs" },
      { name: "Redis", highlight: true, useCase: "Atomic task metering, pub/sub, caching" },
      { name: "Prisma", highlight: true, useCase: "Type-safe ORM migrations & relations" },
      { name: "BullMQ", highlight: true, useCase: "Delayed jobs, concurrency controls" },
      { name: "MongoDB", highlight: false, useCase: "Document collections & aggregation" },
      { name: "Docker", highlight: false, useCase: "Containerization & multi-stage builds" },
      { name: "Git & Actions", highlight: false, useCase: "CI/CD testing & automated deploy" }
    ]
  },
  {
    layer: "Languages",
    title: "Core Languages",
    description: "Strongly typed and performance-focused programming languages used across the entire stack.",
    skills: [
      { name: "TypeScript", highlight: true, useCase: "Strict typing, generics, AST" },
      { name: "JavaScript", highlight: false, useCase: "ESNext, asynchronous event loop" },
      { name: "Python", highlight: true, useCase: "Data parsing, AI integrations, Celery" },
      { name: "SQL", highlight: true, useCase: "Complex joins, indexing strategies, pgvector" },
      { name: "Java", highlight: false, useCase: "OOP principles & system fundamentals" }
    ]
  }
];

export const recruiterFaq = [
  {
    question: "What is Roshan's core technical positioning?",
    answer: "Roshan builds full-stack products end to end — product surfaces in Next.js and React, APIs in NestJS and FastAPI, and the PostgreSQL, Redis, and queue layers underneath that keep them fast."
  },
  {
    question: "What did Roshan build at Konnectify?",
    answer: "During his internship at Konnectify (Jan 2026 – Jul 2026), an iPaaS no-code platform, Roshan built invite-based user management with minute-level permissions dynamically resolved on the server, task-based crediting on Redis that batches aggregated writes to the DB, and optimized Redux state management for large workflow automation canvases."
  },
  {
    question: "What makes the Saga project technically significant?",
    answer: "Saga is an end-to-end RAG knowledge base with dedicated extraction workers for PDFs, Markdown, YouTube transcripts, and GitHub repos. It runs background ingestion asynchronously on Celery over Redis, indexes vectors in PostgreSQL with pgvector, and cites exact source chunks with semantic references in a Next.js + FastAPI Turborepo."
  },
  {
    question: "Is Roshan available for full-time / internship opportunities?",
    answer: "Yes! Available for full-stack, backend, and distributed systems engineering roles."
  },
  {
    question: "Can I inspect the source code and résumé?",
    answer: "Yes! All projects are linked to public GitHub repositories (Saga: KB-ULT, AI Trip Planner: AI_Trip_Planner) and his résumé is directly accessible via the top navigation or pressing Cmd+K."
  }
];
