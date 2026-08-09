export const site = {
  name: "Roshan Muhammed R",
  shortName: "Roshan",
  role: "Full-stack engineer",
  /** Positioning line. Every technology named here appears on the résumé. */
  positioning:
    "I build full-stack products end to end — product surfaces in Next.js and React, APIs in NestJS and FastAPI, and the PostgreSQL, Redis and queue layers underneath that keep them fast.",
  location: "Tanjore, India",
  email: "roshanmuhammed50@gmail.com",
  phone: "+91 80 56 73 17 11",
  phoneHref: "+918056731711",
  resume: "/resume.pdf",
  url: "https://portfolio-frontend-teal-ten.vercel.app",
  socials: {
    github: "https://github.com/RoshanMuhammedR",
    linkedin: "https://www.linkedin.com/in/roshan2004/",
  },
  /** Rendered as the hero spec block. Keep to four rows. */
  spec: [
    { key: "Role", value: "Full-stack engineer" },
    { key: "Recently", value: "SDE Intern, Konnectify" },
    { key: "Education", value: "B.Tech CSE, SASTRA" },
    { key: "Based in", value: "Tanjore, India" },
  ],
} as const;

export const nav = [
  { id: "work", index: "01", label: "Work" },
  { id: "experience", index: "02", label: "Experience" },
  { id: "stack", index: "03", label: "Stack" },
  { id: "education", index: "04", label: "Education" },
  { id: "contact", index: "05", label: "Contact" },
] as const;
