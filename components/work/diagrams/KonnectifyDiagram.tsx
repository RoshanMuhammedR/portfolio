import { Arrow, ArrowDefs, Box, DiagramFrame, EdgeLabel } from "./primitives";

const ID = "konnectify";

export function KonnectifyDiagram() {
  return (
    <DiagramFrame
      title="Konnectify — the surfaces I worked on"
      caption="The workflow builder talks to NestJS endpoints that resolve the caller's roles and permissions on every request. Task credits accumulate in Redis and are written back to PostgreSQL in aggregated batches rather than one write per task, while BullMQ handles queued background work."
      minWidth={760}
      viewBox="0 0 900 380"
    >
      <ArrowDefs id={ID} />

      <Box
        x={16}
        y={60}
        w={190}
        h={64}
        title="Workflow builder"
        sub="Next.js · Redux"
      />
      <Arrow id={ID} d="M206 92 H250" />

      <Box x={256} y={60} w={170} h={64} title="NestJS API" sub="endpoints" />
      <Arrow id={ID} d="M426 92 H470" />

      <Box x={476} y={60} w={140} h={64} title="Prisma" />
      <Arrow id={ID} d="M616 92 H660" />

      <Box x={666} y={60} w={210} h={64} title="PostgreSQL" accent />

      {/* Every endpoint resolves the caller's roles before it does anything. */}
      <Arrow id={ID} d="M341 124 V176" />
      <EdgeLabel x={351} y={152} anchor="start">
        per request
      </EdgeLabel>
      <Box
        x={256}
        y={182}
        w={170}
        h={64}
        title="Roles & permissions"
        sub="minute-level"
      />

      <Arrow id={ID} d="M426 214 H470" />
      <Box x={476} y={182} w={140} h={64} title="Redis" sub="task credits" />

      {/* Credits aggregate in Redis, then land in Postgres in batches. */}
      <Arrow id={ID} d="M616 214 H771 V130" />
      <EdgeLabel x={632} y={204} anchor="start">
        batched aggregated writes
      </EdgeLabel>

      <Arrow id={ID} d="M546 246 V296" />
      <Box x={476} y={302} w={140} h={56} title="BullMQ" sub="queued jobs" />
    </DiagramFrame>
  );
}
