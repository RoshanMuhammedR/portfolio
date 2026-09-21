"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { X } from "lucide-react";
import type { SceneConfig } from "@/content/config";
import type { HoverInfo } from "./ThreeScene";
import type { SceneObject } from "./sceneTypes";

/** The scene is a few hundred kilobytes of WebGL; it never belongs in the
 *  server bundle, and it should not load until the plate is on screen. */
const ThreeScene = dynamic(() => import("./ThreeScene"), { ssr: false });

const CATEGORY_LABEL: Record<SceneObject["category"], string> = {
  movie: "Film",
  anime: "Anime",
  football: "Football",
  game: "Games",
  travel: "Travel",
  music: "Music",
  other: "Other",
};

/* ---- can this browser draw it? ----
   Answered once per page load, by opening and discarding one context. As an
   external store the answer is read during render rather than copied into
   state after it, and the server - which has no GPU to ask - says "unknown". */
let webglAnswer: boolean | undefined;
function probeWebgl(): boolean {
  if (webglAnswer === undefined) {
    const canvas = document.createElement("canvas");
    webglAnswer = Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  }
  return webglAnswer;
}
const noSubscription = () => () => {};

/**
 * The right side of /about: a desk of the owner's favourites that can be picked
 * up, thrown and played with.
 *
 * A canvas is opaque to assistive technology, so the same favourites are also
 * rendered as a list. The list is the accessible version of the scene, not a
 * summary of it: every title, note and link is in it, and focusing an entry
 * lights up the matching object.
 */
export function InterestsScene({
  objects,
  config,
  fallback,
}: {
  objects: SceneObject[];
  config: SceneConfig;
  /** Shown when WebGL is unavailable. */
  fallback: React.ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const webgl = useSyncExternalStore<boolean | null>(
    noSubscription,
    probeWebgl,
    () => null,
  );
  const [contextLost, setContextLost] = useState(false);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [pinned, setPinned] = useState<HoverInfo | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const reset = useRef<(() => void) | null>(null);

  // The card sits a few pixels above its object, so the pointer crosses bare
  // desk on the way to it. A short grace period, cancelled by the card itself,
  // is what makes the link inside it reachable at all.
  const overCard = useRef(false);
  const letGo = useRef<number | null>(null);

  const onHover = useCallback((info: HoverInfo | null) => {
    if (letGo.current !== null) window.clearTimeout(letGo.current);
    letGo.current = null;
    if (info) {
      setHover(info);
      return;
    }
    letGo.current = window.setTimeout(() => {
      if (!overCard.current) setHover(null);
    }, 160);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinned(null);
        setHover(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (letGo.current !== null) window.clearTimeout(letGo.current);
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const takeReset = useCallback((fn: (() => void) | null) => {
    reset.current = fn;
  }, []);
  const lose = useCallback(() => setContextLost(true), []);

  // What is under the pointer wins over what was pinned.
  const card = hover ?? pinned;

  const credits = objects.filter((o) => o.credit);
  const usesTmdb = objects.some((o) => /tmdb/i.test(o.licence ?? ""));

  return (
    <div ref={hostRef} className="about-scene">
      {webgl === false || contextLost ? (
        fallback
      ) : (
        <>
          {mounted && webgl ? (
            <ThreeScene
              objects={objects}
              config={config}
              onHover={onHover}
              onPin={setPinned}
              onResetRef={takeReset}
              onUnavailable={lose}
              highlightId={highlightId}
            />
          ) : null}

          {card ? (
            <div
              className="about-info site-panel"
              style={{ left: card.x, top: card.y }}
              role="note"
              onMouseEnter={() => {
                overCard.current = true;
              }}
              onMouseLeave={() => {
                overCard.current = false;
                setHover(null);
              }}
            >
              {card === pinned ? (
                <button
                  type="button"
                  onClick={() => setPinned(null)}
                  aria-label="Close"
                  className="about-info-close"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : null}
              <p className="about-info-kicker">
                {CATEGORY_LABEL[card.object.category]}
              </p>
              <p className="about-info-title">{card.object.title}</p>
              {card.object.subtitle ? (
                <p className="about-info-sub">{card.object.subtitle}</p>
              ) : null}
              {card.object.note ? (
                <p className="about-info-note">{card.object.note}</p>
              ) : null}
              {card.object.linkUrl ? (
                <a
                  href={card.object.linkUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="about-info-link"
                >
                  More
                </a>
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            className="about-reset"
            onClick={() => reset.current?.()}
          >
            Reset
          </button>
        </>
      )}

      {/* The same favourites, as text. Focusing one lights up its object. */}
      <ul className="about-index">
        {objects.map((object) => (
          <li key={object.id}>
            <a
              href={object.linkUrl ?? undefined}
              target={object.linkUrl ? "_blank" : undefined}
              rel={object.linkUrl ? "noreferrer noopener" : undefined}
              tabIndex={0}
              onFocus={() => setHighlightId(object.id)}
              onBlur={() => setHighlightId(null)}
            >
              <strong>{object.title}</strong>
              <span>{CATEGORY_LABEL[object.category]}</span>
              {object.subtitle ? <span>{object.subtitle}</span> : null}
              {object.note ? <span>{object.note}</span> : null}
            </a>
          </li>
        ))}
      </ul>

      {/* Attribution, where a licence asks for it. */}
      {credits.length > 0 || usesTmdb ? (
        <p className="about-credits">
          {credits.map((object) => (
            <span key={object.id}>
              {object.title}: {object.credit}
              {object.licence ? ` (${object.licence})` : ""}
            </span>
          ))}
          {usesTmdb ? (
            <span>
              This product uses the TMDB API but is not endorsed or certified by
              TMDB.
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
