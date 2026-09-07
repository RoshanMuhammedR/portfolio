import React from 'react';
import type { DiagramType } from '@/types';

/**
 * The drawing that makes a project's argument.
 *
 * Both of these projects are claimed on the same instinct — move the expensive
 * work out of the request cycle, and verify anything you assert. A paragraph
 * asserts that; a schematic shows it. Built in the page's own drafting
 * language: hairline boxes, mono callouts, one mint mark on the step that
 * carries the claim.
 *
 * HTML rather than SVG on purpose. An SVG of this would either be illegible on
 * a phone or enormous on a desktop; laid out as boxes it simply reflows, and
 * the type stays at a real size at every width.
 */

type Step = {
  /** Drafting index, not decoration: these run in order. */
  n: string;
  title: string;
  detail: string;
  /** The step the note points at — the one doing the load-bearing work. */
  marked?: boolean;
};

const DIAGRAMS: Record<DiagramType, { steps: Step[]; note: string }> = {
  'rag-pipeline': {
    steps: [
      {
        n: '01',
        title: 'Sources',
        detail: 'PDF, Markdown, YouTube transcripts, GitHub repositories'
      },
      {
        n: '02',
        title: 'Ingest',
        detail: 'Celery workers over Redis, running asynchronously',
        marked: true
      },
      {
        n: '03',
        title: 'Store',
        detail: 'PostgreSQL with pgvector, HNSW similarity index'
      },
      {
        n: '04',
        title: 'Answer',
        detail: 'Query planner decomposes, retrieves, cites the chunk'
      }
    ],
    note: 'Ingestion never sits on the request path — a query is served from the index, not from the parsing.'
  },
  'trip-planner': {
    steps: [
      { n: '01', title: 'Destination', detail: 'A place and a length of stay' },
      {
        n: '02',
        title: 'Plan',
        detail: 'Google Gemini against a structured output schema'
      },
      {
        n: '03',
        title: 'Verify',
        detail: 'Google Places & Images: real coordinates, reviews, photographs',
        marked: true
      },
      {
        n: '04',
        title: 'Itinerary',
        detail: 'Day-wise plan and hotels, saved per user over OAuth'
      }
    ],
    note: 'Nothing reaches the itinerary on the model’s word alone — every place is resolved against Places first.'
  }
};

export const ProjectSchematic: React.FC<{ type: DiagramType; label: string }> = ({
  type,
  label
}) => {
  const diagram = DIAGRAMS[type];
  if (!diagram) return null;

  return (
    <figure className="mt-8">
      <ol
        aria-label={`${label}: how it works, in four steps`}
        className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {diagram.steps.map((step, i) => (
          <li key={step.n} className="schematic-step relative flex flex-col">
            <span
              aria-hidden="true"
              className={`h-0.5 w-full ${step.marked ? 'bg-mint' : 'bg-ink'}`}
            />
            <span className="mt-3 font-mono text-[10.5px] tracking-[0.14em] text-ink-ghost">
              {step.n}
            </span>
            <span className="mt-1.5 text-[14px] font-semibold tracking-[-0.01em] text-ink">
              {step.title}
            </span>
            <span className="mt-1.5 font-mono text-[11px] leading-[1.5] text-ink-faint">
              {step.detail}
            </span>
            {i < diagram.steps.length - 1 && (
              <span aria-hidden="true" className="schematic-arrow" />
            )}
          </li>
        ))}
      </ol>

      <figcaption className="mt-5 flex gap-2.5 border-t border-rule pt-3.5">
        <span aria-hidden="true" className="mt-[7px] h-[7px] w-[7px] shrink-0 bg-mint" />
        <span className="text-[13px] leading-[1.55] text-ink-muted">{diagram.note}</span>
      </figcaption>
    </figure>
  );
};
