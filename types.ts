export interface IdentityInfo {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  githubUrl: string;
  linkedin: string;
  linkedinUrl: string;
  resumeUrl: string;
  liveSite: string;
  liveSiteUrl: string;
  positioningLine: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  summary: string;
  highlights: {
    title: string;
    description: string;
    badge?: string;
  }[];
  stack: string[];
  proprietary: boolean;
  codeSnippet?: {
    filename: string;
    language: string;
    code: string;
    explanation: string;
  };
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  liveUrl?: string;
  repoUrl?: string;
  description: string;
  architectureHighlights: string[];
  stack: string[];
  diagramType: 'rag-pipeline' | 'trip-planner';
}

export interface StackCategory {
  layer: 'Surface' | 'Logic' | 'Foundations' | 'Languages';
  title: string;
  description: string;
  skills: {
    name: string;
    highlight?: boolean;
    useCase?: string;
  }[];
}
