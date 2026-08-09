import { Arrow, ArrowDefs, Box, DiagramFrame, EdgeLabel } from "./primitives";

const ID = "trip";

export function TripDiagram() {
  return (
    <DiagramFrame
      title="AI Trip Planner architecture"
      caption="A request passes through Google OAuth 2.0, then fans out to Gemini for the itinerary itself and to the Places & Images API for real location data and photography. The two merge into a day-wise plan with hotel suggestions, which is saved to the user's trip history."
      minWidth={720}
      viewBox="0 0 900 320"
    >
      <ArrowDefs id={ID} />

      <Box x={8} y={140} w={110} h={56} title="User" sub="destination" />
      <Arrow id={ID} d="M118 168 H142" />

      <Box x={148} y={140} w={150} h={56} title="Google OAuth" sub="2.0 sign-in" />
      <Arrow id={ID} d="M298 168 H322" />

      <Box x={328} y={140} w={120} h={56} title="Request" sub="itinerary" />

      {/* Fan out: generation and real-world data are separate concerns. */}
      <Arrow id={ID} d="M448 168 H468 V102 H482" />
      <Arrow id={ID} d="M448 168 H468 V258 H482" />

      <Box
        x={488}
        y={76}
        w={170}
        h={52}
        title="Google Gemini"
        sub="itinerary generation"
      />
      <Box
        x={488}
        y={232}
        w={170}
        h={52}
        title="Places & Images"
        sub="locations + photos"
      />

      <Arrow id={ID} d="M658 102 H678 V168 H692" />
      <Arrow id={ID} d="M658 258 H678 V168 H692" />

      <Box
        x={698}
        y={140}
        w={180}
        h={56}
        title="Day-wise plan"
        sub="+ hotel suggestions"
        accent
      />

      <Arrow id={ID} d="M788 196 V240" />
      <EdgeLabel x={798} y={224} anchor="start">
        saved
      </EdgeLabel>

      <Box x={698} y={246} w={180} h={48} title="Trip history" />
    </DiagramFrame>
  );
}
