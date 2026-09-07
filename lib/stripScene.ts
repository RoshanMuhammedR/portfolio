/**
 * The backdrop behind the whole page.
 *
 * ONE continuous drawing, in page coordinates, behind every band — not one per
 * section. That is load-bearing: with a surface per section, anything reaching
 * a section edge was cut by it. Here the pyramid's cast shadow, the roads and
 * the concrete bodies cross section boundaries and finish where they finish.
 *
 * The canvas itself is viewport-sized and fixed, and the scene is drawn through
 * a scroll translation. That keeps the single surface — the drawing is one
 * coordinate space from the first pixel to the last — while letting it render
 * at the display's real pixel density. Backing a 5000px-tall page at 2x would
 * be ~28M pixels, which browsers quietly refuse to allocate; a viewport is a
 * couple of million, so the same scene comes out crisp instead of resampled.
 *
 * Ported from the approved StripB standalone. Colour is carried across at
 * matched lightness rather than substituted, because this site's palette is
 * cooler than the standalone's warm paper.
 */

type Pt = [number, number];

export interface StripAnchors {
  /** The three seam hairlines, in page coordinates. */
  seams: [number, number, number];
  /** Section tops, in page coordinates. */
  tops: { exp: number; proj: number; stack: number; night: number };
  /** Total height of the strip, in page coordinates. */
  height: number;
}

const PROPS = {
  /** Paper grain strength. */
  grain: 0.34,
  /** Backdrop strength. */
  backdrop: 1,
  /** Draw the pyramid's cast shadow. */
  shadow: true
};

export type ScenePalette = typeof LIGHT;

/**
 * The plate by daylight: a graphite solid standing on pale ground.
 */
const LIGHT = {
  paper: '#ECEEE9', // --paper
  grid: '#D4D8CF', // --rule
  /** The grid and the hero wash, as rgb triplets for alpha compositing. */
  gridRGB: '212, 216, 207',
  paperRGB: '236, 238, 233',
  /** On-dark strokes inside the night band. */
  onNightRGB: '236, 238, 233',

  // The solid, lit from the right. Flat fills only — the tonal steps do the
  // falloff, there are no gradients on any face.
  shade: '#1E2026',
  lit: '#464B56',
  bounce1: '#282B32',
  bounce2: '#33373F',
  rim: '#525863',
  ridge: '#5A606C',

  // The cast shadow, banded along its length: dense where it meets the base,
  // gone by the tip. Stepped like the faces, deliberately not a gradient.
  castBands: ['#DFE3DA', '#E6EAE2', '#ECEFE8', '#EFF1EC'],
  /** How the grain and the shadow meet the ground beneath them. */
  shadowMode: 'multiply' as GlobalCompositeOperation,
  grainMode: 'multiply' as GlobalCompositeOperation,
  grainAlpha: 0.075,

  // Concrete. Two tonal steps per body: the face and the side turned away.
  // The large one sits further back than the small one, so it is the lighter
  // pair — the solid has to stay the darkest thing in the hero.
  stoneNear: ['#DEE1D8', '#C3C8BC'],
  stoneSmall: ['#C9CDC2', '#A6AC9F'],
  stoneMid: ['#E8EBE4', '#DFE3DA'],
  stoneFar: ['#EAEDE6', '#E1E5DC'],

  // The same form again, further off, behind the experience band.
  farShade: '#E2E6DD',
  farLit: '#E9ECE5',

  road: '#878D83',
  edge: '#BFC4BA',
  tick: '#BABFB5',
  markerA: '#DBDFD6',
  markerB: '#E6EAE2',

  night: '#171A1F', // --night
  nightNear: '#1C1F25', // --night-near
  moonNear: ['#2F333A', '#22252A'],
  moonFar: ['#282B31', '#1E2025'],
  moonRing: '#696E74',
  nightPyramidShade: '#0C0E11',
  nightPyramidLit: '#24272C'
};

/**
 * The same plate after dark.
 *
 * Not an inversion — the drawing keeps its logic. The page still travels from
 * open ground down into night, so the final band is still the deepest surface.
 * What flips is the solid: a graphite monolith on pale ground by day becomes a
 * lit form standing out of the dark here, and its cast shadow stops being a
 * darkening and becomes an absence of the light falling past it.
 */
const DARK: ScenePalette = {
  paper: '#16181C',
  grid: '#2E333A',
  gridRGB: '46, 51, 58',
  paperRGB: '22, 24, 28',
  onNightRGB: '231, 234, 230',

  shade: '#343943',
  lit: '#5D6572',
  bounce1: '#3C414B',
  bounce2: '#454B56',
  rim: '#6E7683',
  ridge: '#7B8390',

  // Multiplied against the ground these darken it progressively less, so the
  // shadow still reads as a shadow rather than as a lighter smear.
  castBands: ['#9AA0AA', '#B4B9C1', '#C9CDD3', '#DCDFE3'],
  shadowMode: 'multiply' as GlobalCompositeOperation,
  // Grain on a dark ground has to add light, not subtract it.
  grainMode: 'screen' as GlobalCompositeOperation,
  grainAlpha: 0.045,

  stoneNear: ['#282D36', '#1E222A'],
  stoneSmall: ['#2F343E', '#232830'],
  stoneMid: ['#22262D', '#1D2027'],
  stoneFar: ['#20242A', '#1B1E24'],

  farShade: '#1D2127',
  farLit: '#22262D',

  road: '#5A616C',
  edge: '#3A404A',
  tick: '#454C56',
  markerA: '#3A404A',
  markerB: '#4A515C',

  night: '#0A0C0F',
  nightNear: '#0F1114',
  moonNear: ['#1A1D22', '#141619'],
  moonFar: ['#16191D', '#111316'],
  moonRing: '#3A3F47',
  nightPyramidShade: '#07080A',
  nightPyramidLit: '#191D22'
};

export const SCENE_PALETTES = { light: LIGHT, dark: DARK };

/**
 * Where the content column sits, so the seam rules and their end ticks land on
 * the same gutter the copy does. Mirrors `max-w-7xl` + `px-4 sm:px-6 lg:px-8`.
 */
function gutter(w: number) {
  const pad = w >= 1024 ? 32 : w >= 640 ? 24 : 16;
  return (w - Math.min(w - pad * 2, 1280)) / 2;
}

/**
 * The hero solid, in the 1440-wide space it was drawn in. Keeping it in design
 * coordinates is what lets the framing change — smaller, lower, further right —
 * without touching a single approved number.
 */
const HERO = {
  apex: [1116, 69.7] as Pt,
  baseL: [576, 541.2] as Pt,
  baseR: [1656, 541.2] as Pt,
  front: [1296, 869.2] as Pt,
  /** Base width in design pixels: baseR.x - baseL.x. */
  span: 1080,
  /** Where the two roads meet the left edge of the page. */
  roadY: [742, 858],
  /** How far down the drawing the hero's washes and grain reach. */
  scrimY: 900,
  grainY: 1100
};

export function bootScene(
  cv: HTMLCanvasElement,
  host: HTMLElement,
  anchors: StripAnchors,
  theme: keyof typeof SCENE_PALETTES = 'light'
): () => void {
  const c = cv.getContext('2d');
  if (!c) return () => {};

  // The canvas is the viewport; the scene is the page.
  const W = Math.round(cv.clientWidth) || 1440;
  const VH = Math.round(cv.clientHeight) || 900;
  const H = Math.max(anchors.height, VH);

  function setSize(d: number) {
    try {
      cv.width = Math.round(W * d);
      cv.height = Math.round(VH * d);
      c!.setTransform(1, 0, 0, 1, 0, 0);
      c!.fillStyle = '#000000';
      c!.fillRect(0, 0, 1, 1);
      return c!.getImageData(0, 0, 1, 1).data[3] === 255;
    } catch {
      return false;
    }
  }

  // Budget the backing store and fall back rather than trusting the allocation.
  // A viewport fits comfortably at 2x, but a very large display on a scaled
  // desktop can still ask for more than the browser will hand back.
  const BUDGET = 17000000;
  let DPR = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(BUDGET / (W * VH)));
  DPR = Math.max(1, Math.round(DPR * 4) / 4);
  if (!setSize(DPR)) {
    DPR = 1.5;
    if (!setSize(DPR)) {
      DPR = 1;
      setSize(DPR);
    }
  }
  c.imageSmoothingEnabled = true;
  if ('imageSmoothingQuality' in c) c.imageSmoothingQuality = 'high';

  const P = SCENE_PALETTES[theme] || LIGHT;

  /** The ground, at an alpha — the wash the hero copy sits on. */
  const paperA = (a: number) => `rgba(${P.paperRGB}, ${a})`;
  /** The rule colour, at an alpha, for the grid. */
  const gridA = (a: number) => `rgba(${P.gridRGB}, ${a})`;
  /** Light on the dark ground, for strokes inside the night band. */
  const onNightA = (a: number) => `rgba(${P.onNightRGB}, ${a})`;
  const STR = PROPS.backdrop;
  const GRAIN = PROPS.grain;
  const narrow = W < 900;
  const PITCH = narrow ? 44 : 64;

  // ---- paper grain ----
  // A fine tooth, not a speckle: a tight value range reads as stock rather than
  // as noise over the artwork.
  const NS = 256;
  const noise = document.createElement('canvas');
  noise.width = NS;
  noise.height = NS;
  const nctx = noise.getContext('2d')!;
  const nim = nctx.createImageData(NS, NS);
  for (let q = 0; q < nim.data.length; q += 4) {
    const vv = 152 + Math.random() * 66;
    nim.data[q] = vv;
    nim.data[q + 1] = vv;
    nim.data[q + 2] = vv;
    nim.data[q + 3] = 255;
  }
  nctx.putImageData(nim, 0, 0);
  const grainPat = c.createPattern(noise, 'repeat');
  // One noise texel to one device pixel. Left alone the pattern is laid down in
  // CSS pixels and smeared across DPR² device pixels, which is what made the
  // concrete read as a compression artefact rather than as a surface.
  if (grainPat) grainPat.setTransform(new DOMMatrix([1 / DPR, 0, 0, 1 / DPR, 0, 0]));

  // ---- where the sections landed ----
  const Y2 = anchors.tops.exp;
  const Y3 = anchors.tops.proj;
  const Y4 = anchors.tops.stack;
  const YF = anchors.tops.night;
  const NH = Math.max(1, H - YF);
  const SEAM = anchors.seams;
  const GUT = gutter(W);

  // The ground tilts and the dark rises out of it. The 58px of tilt is a
  // constant, not a ratio — it reads as a horizon, not a slope.
  const DTL = YF - 70;
  const DTR = DTL - 58;
  const darkY = (x: number) => DTL + (x / W) * (DTR - DTL);

  // ---- framing the hero solid ----
  // The solid is placed by naming the box it should stand in, then scaling it
  // uniformly into that box. Narrow, the copy runs the full width, so it moves
  // right and reads as a crop; wide, it stands clear of the copy column with
  // its whole silhouette visible and its foot just above the first seam.
  const heroSpan = narrow ? W * 0.78 : Math.min(W * 0.5, 720);
  const S = heroSpan / HERO.span;
  const heroL = narrow ? W * 0.42 : Math.min(W * 0.975 - heroSpan, W * 0.52);
  const heroFoot = SEAM[0] - (narrow ? 18 : 30);

  const hx = (dx: number) => heroL + (dx - HERO.baseL[0]) * S;
  const hy = (dy: number) => heroFoot - (HERO.front[1] - dy) * S;
  const hp = (p: Pt, ox = 0, oy = 0): Pt => [hx(p[0]) + ox, hy(p[1]) + oy];

  function poly(p: Pt[]) {
    c!.beginPath();
    c!.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) c!.lineTo(p[i][0], p[i][1]);
    c!.closePath();
  }

  function line(a: Pt, b: Pt) {
    c!.beginPath();
    c!.moveTo(a[0], a[1]);
    c!.lineTo(b[0], b[1]);
    c!.stroke();
  }

  function lerp(a: Pt, b: Pt, t: number): Pt {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  function ring(cx: number, cy: number, r: number, col: string, w: number) {
    c!.strokeStyle = col;
    c!.lineWidth = w;
    c!.beginPath();
    c!.arc(cx, cy, r, 0, 6.283185);
    c!.stroke();
  }

  /** Grain over a rect, in the current coordinate space. */
  function grain(
    x: number,
    y: number,
    w: number,
    h: number,
    a: number,
    mode: GlobalCompositeOperation
  ) {
    if (!grainPat || GRAIN <= 0.01 || h <= 0 || w <= 0) return;
    c!.save();
    c!.globalCompositeOperation = mode;
    c!.globalAlpha = a * GRAIN;
    c!.fillStyle = grainPat;
    c!.fillRect(x, y, w, h);
    c!.restore();
  }

  /** A concrete body: one flat face, one turned away, grain over the join. */
  function body(cx: number, cy: number, r: number, light: string, dark: string, ox: number, oy: number) {
    c!.beginPath();
    c!.arc(cx, cy, r, 0, 6.283185);
    c!.fillStyle = light;
    c!.fill();
    c!.save();
    c!.beginPath();
    c!.arc(cx, cy, r, 0, 6.283185);
    c!.clip();
    c!.beginPath();
    c!.rect(cx - r * 1.5, cy - r * 1.5, r * 3, r * 3);
    c!.arc(cx + r * 0.46 + ox, cy - r * 0.34 + oy, r * 1.04, 0, 6.283185);
    c!.fillStyle = dark;
    c!.fill('evenodd');
    grain(cx - r * 1.5, cy - r * 1.5, r * 3, r * 3, 0.26, P.grainMode);
    c!.restore();
  }

  /** A small solid marker standing on a line. */
  function marker(x: number, baseY: number, wid: number, hgt: number, tilt: number) {
    const half = wid / 2;
    const ly = baseY + tilt * half;
    const ry = baseY - tilt * half;
    const ay = (ly + ry) / 2 - hgt;
    poly([
      [x, ay],
      [x - half, ly],
      [x + half, ry]
    ]);
    c!.fillStyle = P.markerA;
    c!.fill();
    poly([
      [x, ay],
      [x + wid * 0.17, baseY - tilt * wid * 0.17],
      [x + half, ry]
    ]);
    c!.fillStyle = P.markerB;
    c!.fill();
  }

  /** A body in the dark: same construction, no grain. */
  function moon(cx: number, cy: number, r: number, light: string, dark: string) {
    c!.beginPath();
    c!.arc(cx, cy, r, 0, 6.283185);
    c!.fillStyle = light;
    c!.fill();
    c!.save();
    c!.beginPath();
    c!.arc(cx, cy, r, 0, 6.283185);
    c!.clip();
    c!.beginPath();
    c!.rect(cx - r * 1.5, cy - r * 1.5, r * 3, r * 3);
    c!.arc(cx + r * 0.46, cy - r * 0.34, r * 1.04, 0, 6.283185);
    c!.fillStyle = dark;
    c!.fill('evenodd');
    c!.restore();
    c!.globalAlpha = 0.24;
    ring(cx, cy, r + 17, P.moonRing, 1);
    c!.globalAlpha = 1;
  }

  function render(ox: number, oy: number, top: number) {
    const v0 = top;
    const v1 = top + VH;

    c!.setTransform(DPR, 0, 0, DPR, 0, -top * DPR);
    c!.globalAlpha = 1;
    c!.globalCompositeOperation = 'source-over';
    c!.fillStyle = P.paper;
    c!.fillRect(0, v0, W, VH);

    // ---------- one grid, running the whole way down and dying out ----------
    const FADE = Y3 + 494;
    let g: number;
    c!.lineWidth = 1;
    for (g = PITCH; g < FADE; g += PITCH) {
      if (g < v0 - 2 || g > v1 + 2) continue;
      const a = 0.34 * STR * Math.max(0, 1 - g / FADE);
      if (a <= 0.004) continue;
      c!.globalAlpha = a;
      c!.strokeStyle = P.grid;
      line([0, g + 0.5], [W, g + 0.5]);
    }
    if (v0 < FADE) {
      const vg = c!.createLinearGradient(0, 0, 0, FADE);
      vg.addColorStop(0, gridA(0.34 * STR));
      vg.addColorStop(1, gridA(0));
      c!.globalAlpha = 1;
      c!.strokeStyle = vg;
      const gy0 = Math.max(0, v0);
      const gy1 = Math.min(FADE, v1);
      for (g = PITCH; g < W; g += PITCH) line([g + 0.5, gy0], [g + 0.5, gy1]);
    }

    // ---------- concrete bodies, every one a whole object ----------
    // Two in the hero: a large one behind the crown and a smaller one high
    // right, both sitting clear of the solid so each reads as a whole circle.
    // The large one is set high and left of the crown, the small one high
    // right: a diagonal running through the solid rather than two discs parked
    // beside it. Both clear the copy column and both stay whole.
    const heroTop = SEAM[0];
    const rBig = Math.min(W * 0.128, 176);
    const rSmall = Math.min(W * 0.056, 78);

    c!.globalAlpha = 0.5 * STR;
    ring(W * 0.505 + ox * 10, heroTop * 0.25 + oy * 7, rBig + 19, P.grid, 1);
    c!.globalAlpha = 1;
    body(W * 0.505 + ox * 10, heroTop * 0.25 + oy * 7, rBig, P.stoneNear[0], P.stoneNear[1], ox * 8, oy * 6);

    c!.globalAlpha = 0.42 * STR;
    ring(W * 0.9 + ox * 15, heroTop * 0.155 + oy * 10, rSmall + 15, P.grid, 1);
    c!.globalAlpha = 1;
    body(W * 0.9 + ox * 15, heroTop * 0.155 + oy * 10, rSmall, P.stoneSmall[0], P.stoneSmall[1], ox * 8, oy * 6);

    c!.globalAlpha = 0.65 * STR;
    ring(W * 0.255 + ox * 10, Y3 + 1 + oy * 7, W * 0.163 + 17, P.grid, 1);
    c!.globalAlpha = STR;
    body(W * 0.255 + ox * 10, Y3 + 1 + oy * 7, W * 0.163, P.stoneMid[0], P.stoneMid[1], ox * 8, oy * 6);

    c!.globalAlpha = 0.55 * STR;
    ring(W * 1.055 + ox * 14, Y3 + 838 + oy * 9, W * 0.185 + 18, P.grid, 1);
    c!.globalAlpha = STR;
    body(W * 1.055 + ox * 14, Y3 + 838 + oy * 9, W * 0.185, P.stoneFar[0], P.stoneFar[1], ox * 8, oy * 6);

    c!.globalAlpha = 0.5 * STR;
    ring(W * 0.905 + ox * 16, Y4 - 49 + oy * 10, W * 0.148 + 18, P.grid, 1);
    c!.globalAlpha = STR;
    body(W * 0.905 + ox * 16, Y4 - 49 + oy * 10, W * 0.148, P.stoneFar[0], P.stoneFar[1], ox * 8, oy * 6);
    c!.globalAlpha = 1;

    // ---------- the hero solid, free to run past its section ----------
    const A = hp(HERO.apex, ox * 24, oy * 12);
    const BL = hp(HERO.baseL, ox * 24, oy * 4);
    const BR = hp(HERO.baseR, ox * 24, oy * 4);
    const FE = hp(HERO.front, ox * 24, oy * 2);

    const gl = c!.createLinearGradient(W * 0.22, 0, W * 0.42, 0);
    gl.addColorStop(0, gridA(0));
    gl.addColorStop(1, gridA(1));
    c!.strokeStyle = gl;
    c!.lineWidth = 1.2;
    line([W * 0.22, BL[1] + 0.5], [W, BL[1] + 0.5]);

    const T1 = lerp(BL, FE, 0.42);
    const T2 = lerp(BL, FE, 0.54);
    c!.lineCap = 'butt';

    if (PROPS.shadow) {
      const mb = lerp(BL, FE, 0.5);
      const hg = mb[1] - A[1];
      c!.save();
      c!.globalCompositeOperation = P.shadowMode;
      const Sp: Pt = [mb[0] - hg * 0.72, mb[1] + hg * 0.115];
      for (let sx = 0; sx < 4; sx++) {
        poly([
          lerp(BL, Sp, sx / 4),
          lerp(FE, Sp, sx / 4),
          lerp(FE, Sp, (sx + 1) / 4),
          lerp(BL, Sp, (sx + 1) / 4)
        ]);
        c!.fillStyle = P.castBands[sx];
        c!.fill();
      }
      c!.restore();
    }

    poly([A, BL, FE]);
    c!.fillStyle = P.shade;
    c!.fill();
    poly([A, FE, BR]);
    c!.fillStyle = P.lit;
    c!.fill();

    c!.save();
    poly([A, BL, FE]);
    c!.clip();
    poly([lerp(BL, A, 0.115), lerp(FE, A, 0.115), FE, BL]);
    c!.fillStyle = P.bounce1;
    c!.fill();
    poly([lerp(BL, A, 0.045), lerp(FE, A, 0.045), FE, BL]);
    c!.fillStyle = P.bounce2;
    c!.fill();
    c!.restore();

    c!.save();
    poly([A, FE, BR]);
    c!.clip();
    poly([A, BR, lerp(BR, FE, 0.038), lerp(A, FE, 0.038)]);
    c!.fillStyle = P.rim;
    c!.fill();
    c!.restore();

    c!.strokeStyle = P.ridge;
    c!.lineWidth = 1.6;
    line(A, FE);

    c!.save();
    poly([A, BL, FE, BR]);
    c!.clip();
    // Always screened: this grain sits on the solid's own faces, and it is
    // there to add a catch of light to them in either plate.
    grain(0, 0, W, hy(HERO.grainY), 0.2, 'screen');
    c!.restore();

    // The wash that lets the hero copy sit over the drawing. It has to clear
    // the copy column at every width, so it is measured from the gutter and the
    // standfirst's measure rather than taken as a flat fraction of the page.
    const scrW = Math.max(W * 0.42, Math.min(W * 0.92, GUT + 530));
    const scr = c!.createLinearGradient(0, 0, scrW, 0);
    scr.addColorStop(0, paperA(0.92));
    scr.addColorStop(0.55, paperA(0.55));
    scr.addColorStop(1, paperA(0));
    c!.fillStyle = scr;
    c!.fillRect(0, 0, scrW, hy(HERO.scrimY));

    // Laid over the wash, so the roads survive to the left border.
    c!.strokeStyle = P.road;
    c!.lineWidth = 3;
    c!.lineCap = 'butt';
    line([0, hy(HERO.roadY[0]) + oy * 6], T1);
    line([0, hy(HERO.roadY[1]) + oy * 6], T2);

    // ---------- the same form again, further off, behind section two ----------
    c!.globalAlpha = STR;
    const A2: Pt = [W * 0.93 + ox * 22, Y2 + 37 + oy * 10];
    const BL2: Pt = [W * 0.7 + ox * 22, Y2 + 330];
    const BR2: Pt = [W * 1.16 + ox * 22, Y2 + 330];
    const FE2: Pt = [W * 0.895 + ox * 22, Y2 + 326];
    poly([A2, BL2, FE2]);
    c!.fillStyle = P.farShade;
    c!.fill();
    poly([A2, FE2, BR2]);
    c!.fillStyle = P.farLit;
    c!.fill();
    c!.globalAlpha = 1;

    // ---------- the seams ----------
    const sizes = [
      [20, 11],
      [26, 14],
      [34, 18]
    ];
    // The index mark sits on a column boundary of the same 12-column grid the
    // copy is set on — eight columns in. Left where it was, at an arbitrary
    // fraction of the page, it read as a mark that happened to land there
    // rather than one the layout put there.
    const tri = GUT + ((W - GUT * 2) * 8) / 12;
    for (let i = 0; i < SEAM.length; i++) {
      const y = SEAM[i];
      if (y < v0 - 40 || y > v1 + 40) continue;
      c!.strokeStyle = P.grid;
      c!.lineWidth = 1;
      line([GUT, y + 0.5], [W - GUT, y + 0.5]);
      c!.strokeStyle = P.edge;
      line([GUT + 0.5, y - 7], [GUT + 0.5, y + 7]);
      line([W - GUT - 0.5, y - 7], [W - GUT - 0.5, y + 7]);
      if (!narrow) {
        c!.strokeStyle = P.tick;
        c!.lineWidth = 1.2;
        poly([
          [tri, y - sizes[i][1]],
          [tri - sizes[i][0] / 2, y],
          [tri + sizes[i][0] / 2, y]
        ]);
        c!.stroke();
      }
    }

    // ---------- grain over the paper ----------
    if (GRAIN > 0.01) {
      c!.save();
      c!.beginPath();
      c!.moveTo(0, 0);
      c!.lineTo(W, 0);
      c!.lineTo(W, DTR);
      c!.lineTo(0, DTL);
      c!.closePath();
      c!.clip();
      const gy0 = Math.max(0, v0);
      const gy1 = Math.min(DTL, v1);
      grain(0, gy0, W, gy1 - gy0, P.grainAlpha, P.grainMode);
      c!.restore();
    }

    // ---------- the ground tilts and the dark rises out of it ----------
    if (v1 > DTR - 60) {
      poly([
        [0, DTL],
        [W, DTR],
        [W, H],
        [0, H]
      ]);
      c!.fillStyle = P.night;
      c!.fill();

      marker(tri, darkY(tri), 56, 34, (DTL - DTR) / W);

      c!.strokeStyle = P.edge;
      c!.lineWidth = 1.1;
      line([0, DTL], [W, DTR]);

      // ---------- everything below the edge lives in the dark ----------
      c!.save();
      poly([
        [0, DTL],
        [W, DTR],
        [W, H],
        [0, H]
      ]);
      c!.clip();

      moon(W * 0.845 + ox * 16, YF + 0.135 * NH + oy * 10, W * 0.088, P.moonNear[0], P.moonNear[1]);
      moon(W * 0.118 + ox * 11, YF - 0.02 * NH + oy * 7, W * 0.115, P.moonFar[0], P.moonFar[1]);

      const hz = YF + 0.8 * NH + oy * 6;
      poly([
        [0, hz],
        [W, hz],
        [W, H],
        [0, H]
      ]);
      c!.fillStyle = P.nightNear;
      c!.fill();
      c!.strokeStyle = onNightA(0.13);
      c!.lineWidth = 1;
      line([0, hz + 0.5], [W, hz + 0.5]);

      const nx = W * 0.7 + ox * 24;
      const rdg = c!.createLinearGradient(0, H, 0, hz);
      rdg.addColorStop(0, onNightA(0));
      rdg.addColorStop(0.5, onNightA(0.1));
      rdg.addColorStop(1, onNightA(0.22));
      c!.strokeStyle = rdg;
      c!.lineWidth = 2.2;
      line([-W * 0.06, YF + 1.05 * NH], [nx - W * 0.028, hz]);
      line([W * 0.3, YF + 1.1 * NH], [nx + W * 0.006, hz]);

      const nA: Pt = [nx + W * 0.15 + ox * 8, hz - 0.56 * NH];
      const nBL: Pt = [nx - W * 0.075 + ox * 8, hz];
      const nBR: Pt = [nx + W * 0.42 + ox * 8, hz];
      const nFE: Pt = [nx + W * 0.205 + ox * 8, hz + 0.012 * NH];
      poly([nA, nBL, nFE]);
      c!.fillStyle = P.nightPyramidShade;
      c!.fill();
      poly([nA, nFE, nBR]);
      c!.fillStyle = P.nightPyramidLit;
      c!.fill();
      const nrg = c!.createLinearGradient(nA[0], nA[1], nBR[0], nBR[1]);
      nrg.addColorStop(0, onNightA(0.85));
      nrg.addColorStop(0.6, onNightA(0.42));
      nrg.addColorStop(1, onNightA(0.22));
      c!.strokeStyle = nrg;
      c!.lineWidth = 1.6;
      line(nA, nBR);
      c!.strokeStyle = onNightA(0.3);
      c!.lineWidth = 1.2;
      line(nA, nBL);
      c!.strokeStyle = onNightA(0.2);
      c!.lineWidth = 1;
      line(nA, nFE);

      const ny0 = Math.max(DTR - 40, v0);
      grain(0, ny0, W, Math.min(H, v1) - ny0, 0.05, 'screen');
      c!.restore();
    }
  }

  // ---- drift and scroll ----
  // Everything in the backdrop drifts with the cursor, eased at 0.07. Where
  // there is no pointer to track, or motion is unwelcome, the scene simply
  // holds still — it still has to redraw as the page scrolls under it.
  const still =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let mx = 0.5;
  let my = 0.5;
  let tmx = 0.5;
  let tmy = 0.5;
  let top = window.scrollY;
  let dirty = true;
  let raf = 0;

  function frame() {
    raf = 0;
    if (!still) {
      mx += (tmx - mx) * 0.07;
      my += (tmy - my) * 0.07;
    }
    render(mx - 0.5, (my - 0.5) * 0.35, top);
    dirty = false;
    if (!still && (Math.abs(tmx - mx) > 0.0005 || Math.abs(tmy - my) > 0.0005)) schedule();
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  const onScroll = () => {
    const y = window.scrollY;
    if (y === top && !dirty) return;
    top = y;
    schedule();
  };

  // A backgrounded tab stops being served frames, so a scroll that happened
  // while it was hidden can leave the drawing a screen behind. Catch up on the
  // way back in rather than waiting for the next scroll.
  const onShow = () => {
    if (document.visibilityState !== 'visible') return;
    top = window.scrollY;
    dirty = true;
    schedule();
  };

  const onMove = (e: PointerEvent) => {
    tmx = e.clientX / W;
    tmy = (e.clientY + window.scrollY) / H;
    schedule();
  };

  const onLeave = () => {
    tmx = 0.5;
    tmy = 0.5;
    schedule();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('visibilitychange', onShow);
  if (!still) {
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
  }

  // Straight away, not on the next frame: the backdrop is the page's ground and
  // should never be absent for a beat while the copy is already there.
  render(0, 0, top);
  dirty = false;

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onShow);
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerleave', onLeave);
  };
}
