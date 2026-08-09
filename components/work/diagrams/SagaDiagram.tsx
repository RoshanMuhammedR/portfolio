import {
  Arrow,
  ArrowDefs,
  Box,
  DiagramFrame,
  EdgeLabel,
  LaneLabel,
} from "./primitives";

const ID = "saga";

const sources = [
  { label: "PDF", y: 46 },
  { label: "Markdown / text", y: 94 },
  { label: "YouTube transcript", y: 142 },
  { label: "GitHub repo", y: 190 },
];

export function SagaDiagram() {
  return (
    <DiagramFrame
      title="Saga architecture"
      caption="Ingestion runs asynchronously: four source types converge on one FastAPI endpoint, queue through Redis to Celery workers, and land as embedded chunks in pgvector. Retrieval reads the same store and returns answers linked back to the chunks they came from."
      minWidth={760}
      viewBox="0 0 900 430"
    >
      <ArrowDefs id={ID} />

      <LaneLabel x={16} y={26}>
        INGEST
      </LaneLabel>

      {sources.map((source) => (
        <Box
          key={source.label}
          x={16}
          y={source.y}
          w={150}
          h={38}
          title={source.label}
        />
      ))}

      {/* Sources collect onto a single bus before entering the API. */}
      <path
        d="M166 65 H210 M166 113 H210 M166 161 H210 M166 209 H210 M210 65 V209"
        fill="none"
        strokeWidth={1}
        className="stroke-line-strong"
      />
      <Arrow id={ID} d="M210 137 H244" />

      <Box x={250} y={108} w={150} h={58} title="FastAPI" sub="ingest API" />
      <Arrow id={ID} d="M400 137 H444" />

      <Box x={450} y={110} w={120} h={54} title="Redis" sub="job queue" />
      <Arrow id={ID} d="M570 137 H614" />

      <Box
        x={620}
        y={100}
        w={190}
        h={74}
        title="Celery workers"
        sub="parse · chunk · embed"
      />

      {/* Workers write embeddings down into the shared store. */}
      <Arrow id={ID} d="M715 174 V202 H450 V222" />
      <EdgeLabel x={470} y={195} anchor="start">
        embeddings
      </EdgeLabel>

      <Box
        x={300}
        y={228}
        w={300}
        h={58}
        title="PostgreSQL + pgvector"
        sub="document chunks + embeddings"
        accent
      />

      <Arrow id={ID} d="M536 286 V324" />
      <EdgeLabel x={548} y={310} anchor="start">
        top-k
      </EdgeLabel>

      <LaneLabel x={16} y={320}>
        RETRIEVE
      </LaneLabel>

      <Box x={16} y={346} w={160} h={58} title="Next.js chat" sub="authenticated" />
      <Arrow id={ID} d="M176 375 H230" />

      <Box x={236} y={346} w={160} h={58} title="FastAPI" sub="query" />
      <Arrow id={ID} d="M396 375 H450" />

      <Box x={456} y={346} w={160} h={58} title="Vector search" sub="matching chunks" />
      <Arrow id={ID} d="M616 375 H670" />

      <Box
        x={676}
        y={346}
        w={190}
        h={58}
        title="Cited answer"
        sub="linked to source chunks"
        accent
      />
    </DiagramFrame>
  );
}
