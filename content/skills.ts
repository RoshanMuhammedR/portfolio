/** Groups and ordering match the résumé exactly. */
export const skillGroups = [
  {
    label: "Languages",
    items: ["TypeScript", "JavaScript", "Java", "Python", "SQL"],
  },
  {
    label: "Backend",
    items: ["NestJS", "Node.js", "Express.js", "FastAPI", "REST APIs"],
  },
  {
    label: "Frontend",
    items: ["Next.js", "React", "Tailwind CSS", "Redux", "Zustand"],
  },
  {
    label: "Data & Infra",
    items: [
      "PostgreSQL",
      "Redis",
      "MongoDB",
      "Prisma",
      "BullMQ",
      "Git",
      "GitHub Actions",
      "Docker",
    ],
  },
] as const;
