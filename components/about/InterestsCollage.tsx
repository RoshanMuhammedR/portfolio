import type { SceneObject } from "./sceneTypes";

/** Just enough tilt to read as pinned up rather than laid out. */
const TILTS = [-2.5, 1.8, -1.2, 2.6, -1.9, 2.1, -2.8, 1.4];

/**
 * The same favourites without WebGL: tilted cards, the treatment the education
 * facts on this page already use. Not a placeholder - it is the whole content,
 * just flat.
 */
export function InterestsCollage({ objects }: { objects: SceneObject[] }) {
  return (
    <ul className="about-collage">
      {objects.map((object, i) => {
        const card = (
          <>
            {object.textureUrl ? (
              <img src={object.textureUrl} alt="" />
            ) : null}
            <span className="about-collage-title">{object.title}</span>
            {object.subtitle ? (
              <span className="about-collage-sub">{object.subtitle}</span>
            ) : null}
          </>
        );

        return (
          <li key={object.id} style={{ rotate: `${TILTS[i % TILTS.length]}deg` }}>
            {object.linkUrl ? (
              <a href={object.linkUrl} target="_blank" rel="noreferrer noopener">
                {card}
              </a>
            ) : (
              card
            )}
          </li>
        );
      })}
    </ul>
  );
}
