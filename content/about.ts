/**
 * Every line here traces to the résumé or the academic record. Nothing about
 * taste, hobbies or personality is invented - where the reference portfolio
 * shows a life, this shows a record.
 */
export const educationFacts = [
  { label: "B.Tech CSE, SASTRA", value: "2022 – 2026" },
  { label: "CGPA", value: "8.86" },
  { label: "Class 12", value: "95.2%" },
  { label: "Class 10", value: "93%" },
  { label: "National rank", value: "Top 1.5%" },
] as const;

export const aboutSections = [
  {
    heading: "How I got here",
    paragraphs: [
      "I graduated from SASTRA in 2026 with a B.Tech in Computer Science and Engineering. Before that, at school, I ranked in the top 1.5% nationally and was awarded INR 10,000 for academic excellence.",
      "Between January and July 2026 I interned at Konnectify, working across Next.js and NestJS on an iPaaS canvas platform - invite-based onboarding with minute-level permissions resolved on the backend, execution credits metered in Redis, and Redux state paths reworked so large node graphs stopped re-rendering wholesale.",
    ],
  },
  {
    heading: "How I work",
    paragraphs: [
      "The same instinct shows up in everything I have built: move expensive work out of the request cycle. Ingestion in Saga runs on Procrastinate workers instead of blocking a response. Credit accounting at Konnectify batches through Redis instead of writing to PostgreSQL once per task.",
      "That is the part I care about - not the framework list, but where the work happens and what the user waits for.",
    ],
  },
] as const;
