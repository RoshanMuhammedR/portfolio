"use client";

import React, { useEffect, useRef } from 'react';
import { bootScene, type StripAnchors } from '@/lib/stripScene';

/**
 * The single canvas behind the whole page.
 *
 * It measures where the bands actually landed and hands those positions to the
 * scene, so the seams, the concrete bodies and the tilted ground stay attached
 * to their sections however the copy reflows. A uniform vertical scale would
 * not do: the bands grow by different amounts as the page narrows, and three
 * of the bodies are meant to straddle a seam.
 */
export const StripCanvas: React.FC<{
  hostRef: React.RefObject<HTMLDivElement | null>;
}> = ({ hostRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const host = hostRef.current;
    if (!cv || !host) return;

    let teardown = () => {};
    let timer = 0;

    const measure = (): StripAnchors | null => {
      const origin = host.getBoundingClientRect().top + window.scrollY;
      const bandTop = (name: string) => {
        const el = host.querySelector<HTMLElement>(`[data-band="${name}"]`);
        return el ? el.getBoundingClientRect().top + window.scrollY - origin : null;
      };

      const exp = bandTop('exp');
      const proj = bandTop('proj');
      const stack = bandTop('stack');
      const night = bandTop('night');
      if (exp === null || proj === null || stack === null || night === null) return null;

      // A seam sits on the boundary between two bands. On the artboard the
      // decoration belonging to the lower band began 64px below that line;
      // keeping the offset keeps the far pyramid and the bodies where they were
      // drawn relative to their seams.
      return {
        seams: [exp, proj, stack],
        tops: { exp: exp + 64, proj: proj + 64, stack: stack + 64, night }
      };
    };

    const boot = () => {
      const anchors = measure();
      if (!anchors) return;
      teardown();
      teardown = bootScene(cv, host, anchors);
    };

    boot();

    let lastW = host.clientWidth;
    let lastH = host.clientHeight;

    const onResize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      // A mobile URL bar sliding away changes the height by a few pixels and is
      // not worth reallocating a page-tall backing store for.
      if (w === lastW && Math.abs(h - lastH) < 8) return;
      lastW = w;
      lastH = h;
      window.clearTimeout(timer);
      timer = window.setTimeout(boot, 120);
    };

    // Both, deliberately: the window event catches the viewport changing, and
    // the observer catches the page getting taller or shorter on its own — a
    // font landing, a focus group opening — which never fires a resize.
    window.addEventListener('resize', onResize);
    const observer = new ResizeObserver(onResize);
    observer.observe(host);

    // Web fonts land after first paint and move every band down a little.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) boot();
    });

    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      window.clearTimeout(timer);
      teardown();
    };
  }, [hostRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
};
