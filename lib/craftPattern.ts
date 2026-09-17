import type { CraftItem } from "@/content/craft";
import type { BoardConfig } from "@/content/config";

/**
 * The repeating unit the infinite board is tiled from.
 *
 * One pattern is a masonry block `columns` wide. Its width and height are the
 * periods: the board draws the same block at every multiple of them, in both
 * axes, so panning never reaches an edge and never crosses an empty cell.
 *
 * Column x = padding + col * (tileWidth + gap)
 * Row    y = padding + sum of the previous rows' tallest item, plus a gap each
 */

export type PatternTile = {
  /** Stable within the pattern; instances add their period indices to it. */
  key: string;
  item: CraftItem;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Pattern = {
  tiles: PatternTile[];
  periodW: number;
  periodH: number;
};

/** Captures are landscape unless they say otherwise. */
const DEFAULT_ASPECT = 1.6;

export function buildPattern(
  items: CraftItem[],
  config: BoardConfig,
): Pattern {
  if (items.length === 0) {
    return { tiles: [], periodW: 1, periodH: 1 };
  }

  const { columns, tileWidth, gap, padding, patternScale } = config;
  const rows = Math.max(1, Math.ceil(items.length / columns));
  const cellCount = rows * columns;

  // Every cell gets a work. With fewer works than cells the extras repeat, but
  // never next to - or directly under - the same work, so the board does not
  // read as one tile printed over and over.
  const placed: CraftItem[] = [];
  for (let cell = 0; cell < cellCount; cell++) {
    if (cell < items.length) {
      placed.push(items[cell]);
      continue;
    }
    const left = cell % columns === 0 ? null : placed[cell - 1];
    const above = cell >= columns ? placed[cell - columns] : null;
    // A deterministic walk, so the board is the same on the server and the
    // client and on every reload.
    let pick = items[(cell * 7 + 3) % items.length];
    for (let attempt = 0; attempt < items.length; attempt++) {
      if (pick.id !== left?.id && pick.id !== above?.id) break;
      pick = items[(cell * 7 + 3 + attempt + 1) % items.length];
    }
    placed.push(pick);
  }

  const heightOf = (item: CraftItem) =>
    Math.round(tileWidth / (item.aspect && item.aspect > 0 ? item.aspect : DEFAULT_ASPECT));

  const tiles: PatternTile[] = [];
  let y = padding;

  for (let row = 0; row < rows; row++) {
    const slice = placed.slice(row * columns, row * columns + columns);
    const rowHeight = Math.max(...slice.map(heightOf));

    slice.forEach((item, col) => {
      tiles.push({
        key: `${row}-${col}`,
        item,
        x: padding + col * (tileWidth + gap),
        y,
        w: tileWidth,
        h: heightOf(item),
      });
    });

    y += rowHeight + gap;
  }

  const lastColumnX = padding + (columns - 1) * (tileWidth + gap);
  return {
    tiles,
    periodW: Math.round((lastColumnX + tileWidth) * patternScale),
    // The same treatment vertically: `y` has already advanced past the last
    // row's gap, so it is the block's height.
    periodH: Math.round(y * patternScale),
  };
}

export type Instance = {
  /** `${patternKey}:${kx}:${ky}` - unique across the infinite plane. */
  key: string;
  tile: PatternTile;
  x: number;
  y: number;
};

/**
 * Every copy of every pattern tile that touches the visible rectangle.
 *
 * The rectangle is grown by `margin` so a tile is in the DOM before it is
 * needed, which is what keeps tiles from popping in at the edges.
 */
export function instancesIn(
  pattern: Pattern,
  view: { left: number; top: number; right: number; bottom: number },
  margin: number,
): Instance[] {
  const { tiles, periodW, periodH } = pattern;
  if (tiles.length === 0) return [];

  const left = view.left - margin;
  const top = view.top - margin;
  const right = view.right + margin;
  const bottom = view.bottom + margin;

  const out: Instance[] = [];
  for (const tile of tiles) {
    const kxFrom = Math.ceil((left - (tile.x + tile.w)) / periodW);
    const kxTo = Math.floor((right - tile.x) / periodW);
    const kyFrom = Math.ceil((top - (tile.y + tile.h)) / periodH);
    const kyTo = Math.floor((bottom - tile.y) / periodH);

    for (let kx = kxFrom; kx <= kxTo; kx++) {
      for (let ky = kyFrom; ky <= kyTo; ky++) {
        out.push({
          key: `${tile.key}:${kx}:${ky}`,
          tile,
          x: tile.x + kx * periodW,
          y: tile.y + ky * periodH,
        });
      }
    }
  }
  return out;
}

/** 0 at the far edge, 1 inside the focus rectangle, smooth in between. */
export function visibility(
  centreX: number,
  centreY: number,
  viewportW: number,
  viewportH: number,
  config: BoardConfig,
): number {
  const falloff = (distance: number) => {
    if (distance <= config.focusRect) return 1;
    if (distance >= 1.15) return 0;
    const t = (distance - config.focusRect) / (1.15 - config.focusRect);
    // smoothstep, so the edge of the bright area is not a visible line.
    return 1 - t * t * (3 - 2 * t);
  };

  const dx = Math.abs(centreX - viewportW / 2) / (viewportW / 2);
  const dy = Math.abs(centreY - viewportH / 2) / (viewportH / 2);
  const v = falloff(dx) * falloff(dy);
  return Math.max(config.minVisibility, Math.min(1, v));
}
