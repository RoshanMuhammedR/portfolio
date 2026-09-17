import { GLOWS } from "@/content/glows";

export type ProjectImage = {
  src: string;
  /** CSS object-position, so a crop lands on the part of the page worth seeing. */
  position?: string;
};

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  /** The live site when there is one, otherwise the repository. */
  href?: string;
  repoUrl?: string;
  /** Only real captures of a live deployment - never a mock-up. */
  image?: ProjectImage;
  glow: string;
};

/**
 * Every project here is a public repository on github.com/RoshanMuhammedR.
 * Descriptions come from each repo's README or its live site; screenshots were
 * taken of the deployments that were reachable, and the rest keep a title card.
 */
export const projects: Project[] = [
  {
    id: "saga",
    title: "Saga",
    subtitle: "Agentic RAG knowledge base",
    tags: ["RAG", "FastAPI", "pgvector"],
    href: "https://saga.dedyn.io/",
    repoUrl: "https://github.com/RoshanMuhammedR/KB-ULT",
    image: { src: "/work/saga.webp", position: "center" },
    glow: GLOWS.saga,
  },
  {
    id: "sniplink",
    title: "Sniplink",
    subtitle: "URL shortener with cached redirects",
    tags: ["Java 21", "Spring Boot", "Redis"],
    href: "https://sniplink.dedyn.io/",
    repoUrl: "https://github.com/RoshanMuhammedR/sniplink",
    image: { src: "/work/sniplink.webp", position: "center 12%" },
    glow: GLOWS.sniplink,
  },
  {
    id: "vps-stack",
    title: "vps-stack",
    subtitle: "Scale-to-zero hosting on one VPS",
    tags: ["Docker", "Caddy", "Python"],
    href: "https://github.com/RoshanMuhammedR/vps-stack",
    repoUrl: "https://github.com/RoshanMuhammedR/vps-stack",
    glow: GLOWS["vps-stack"],
  },
  {
    id: "ai-trip-planner",
    title: "AI Trip Planner",
    subtitle: "Contextual itinerary engine",
    tags: ["React", "Gemini", "Places API"],
    href: "https://ai-trip-planner-rho-orcin.vercel.app/",
    repoUrl: "https://github.com/RoshanMuhammedR/AI_Trip_Planner",
    image: { src: "/work/ai-trip-planner.webp", position: "center 58%" },
    glow: GLOWS["ai-trip-planner"],
  },
  {
    id: "ai-resume-analyzer",
    title: "Resume Analyzer",
    subtitle: "Résumé-to-job fit analysis",
    tags: ["Next.js", "Claude API"],
    href: "https://ai-resume-analyzer-blond-pi.vercel.app/",
    repoUrl: "https://github.com/RoshanMuhammedR/ai-resume-analyzer",
    image: { src: "/work/ai-resume-analyzer.webp", position: "center top" },
    glow: GLOWS["ai-resume-analyzer"],
  },
  {
    id: "youtube-chat",
    title: "YouTube Chat",
    subtitle: "Chat with a video, jump to the cited moment",
    tags: ["FastAPI", "LangChain", "Extension"],
    href: "https://github.com/RoshanMuhammedR/Youtube-Chat",
    repoUrl: "https://github.com/RoshanMuhammedR/Youtube-Chat",
    glow: GLOWS["youtube-chat"],
  },
  {
    id: "lumyn",
    title: "Lumyn",
    subtitle: "AI website creator",
    tags: ["Next.js", "NestJS", "Prisma"],
    href: "https://github.com/RoshanMuhammedR/lumyn",
    repoUrl: "https://github.com/RoshanMuhammedR/lumyn",
    glow: GLOWS.lumyn,
  },
  {
    id: "monotask",
    title: "MonoTask",
    subtitle: "MERN task manager",
    tags: ["MongoDB", "Express", "React"],
    href: "https://to-do-mern-y0qk.onrender.com/",
    repoUrl: "https://github.com/RoshanMuhammedR/To-Do_MERN",
    image: { src: "/work/monotask.webp", position: "center" },
    glow: GLOWS.monotask,
  },
  {
    id: "truthmesh",
    title: "TruthMesh",
    subtitle: "Crowdsourced news verification · hackathon",
    tags: ["Python", "Streamlit"],
    href: "https://github.com/RoshanMuhammedR/TruthMesh_ZenMinds",
    repoUrl: "https://github.com/RoshanMuhammedR/TruthMesh_ZenMinds",
    glow: GLOWS.truthmesh,
  },
];

export function projectById(id: string): Project {
  const project = projects.find((p) => p.id === id);
  if (!project) throw new Error(`Unknown project: ${id}`);
  return project;
}
