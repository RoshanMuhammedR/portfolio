/**
 * The backdrop behind the whole page.
 *
 * ONE canvas covering the entire document, painted in wrapper coordinates —
 * not one canvas per section. That is load-bearing: with a surface per section,
 * anything reaching a section edge got cut by it. Here the pyramid's cast
 * shadow, the roads and three of the concrete bodies cross section boundaries
 * and finish where they naturally finish.
 *
 * Ported from the approved StripB standalone. Two things changed on the way in:
 *
 *  1. Colour. The standalone is set in a warm paper (#F4F2EC) over warm greys;
 *     this site's palette is cooler — sage paper, blue-grey ink. Every value
 *     below is the design's value carried across at matched lightness, not a
 *     substitution of the paper alone, which would have left warm concrete
 *     sitting on cool ground.
 *  2. Vertical position. The standalone is a fixed 1440x4944 artboard, so its
 *     y values are absolute. Here the copy reflows, so anything belonging to a
 *     section is measured off the DOM and passed in as `anchors`. The hero's
 *     approved geometry constants are untouched — they are mapped through
 *     `sc()` and `hy()`, which are the identity at the design's proportions.
 */

type Pt = [number, number];

export interface StripAnchors {
  /** The three seam hairlines, in wrapper coordinates. */
  seams: [number, number, number];
  /** Section tops, in wrapper coordinates. */
  tops: { exp: number; proj: number; stack: number; night: number };
}

/** Fixed scene settings. In the standalone these were live design-tool props. */
const PROPS = {
  /** Pyramid zoom about the vanishing point. 1 is the approved framing. */
  zoom: 1,
  /** Paper grain strength. */
  grain: 0.36,
  /** Backdrop strength. */
  backdrop: 1,
  /** Draw the pyramid's cast shadow. */
  shadow: true
};

const PALETTE = {
  paper: '#ECEEE9', // --paper
  grid: '#D4D8CF', // --rule

  // The pyramid, lit from the right. Flat fills only — the tonal steps do the
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

  // Concrete. Two tonal steps per body: the face and the side turned away.
  stoneNear: ['#D8DBD1', '#B0B5A9'],
  stoneSmall: ['#C6CABF', '#9DA396'],
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

/** Paper, at an alpha, for anything drawn on the dark ground. */
function paperA(a: number) {
  return `rgba(236, 238, 233, ${a})`;
}

/** The rule colour, at an alpha, for the grid. */
function gridA(a: number) {
  return `rgba(212, 216, 207, ${a})`;
}

/**
 * Where the content column sits, so the seam rules and their end ticks land on
 * the same gutter the copy does. Mirrors `max-w-7xl` + `px-4 sm:px-6 lg:px-8`.
 */
function gutter(w: number) {
  const pad = w >= 1024 ? 32 : w >= 640 ? 24 : 16;
  return (w - Math.min(w - pad * 2, 1280)) / 2;
}

/**
 * Mount the scene on a canvas. `host` is the element whose pointer movement
 * drives the parallax. Returns a teardown that stops the loop and unbinds.
 *
 * The canvas size is read from clientWidth/clientHeight and NEVER from the
 * width/height attributes: setting `cv.width` reflects onto the attribute, so
 * re-reading it compounds on every remount and the canvas goes blank.
 */
export function bootScene(
  cv: HTMLCanvasElement,
  host: HTMLElement,
  anchors: StripAnchors
): () => void {
  const W = Math.round(cv.clientWidth) || 1440;
  const H = Math.round(cv.clientHeight) || 4944;
  const c = cv.getContext('2d');
  if (!c) return () => {};

  function setSize(d: number) {
    try {
      cv.width = Math.round(W * d);
      cv.height = Math.round(H * d);
      c!.setTransform(1, 0, 0, 1, 0, 0);
      c!.fillStyle = '#000000';
      c!.fillRect(0, 0, 1, 1);
      return c!.getImageData(0, 0, 1, 1).data[3] === 255;
    } catch {
      return false;
    }
  }

  // A page-tall canvas at 2x is ~28M pixels of backing store, and browsers
  // refuse to allocate it — the canvas comes back blank with no error. Budget
  // the area, then fall back. Do not "fix" this back to devicePixelRatio.
  const BUDGET = 17000000;
  let DPR = Math.min(2, Math.sqrt(BUDGET / (W * H)));
  DPR = DPR >= 1.5 ? 1.5 : DPR >= 1.25 ? 1.25 : 1;
  if (!setSize(DPR)) {
    DPR = 1.25;
    if (!setSize(DPR)) {
      DPR = 1;
      setSize(DPR);
    }
  }
  c.imageSmoothingEnabled = true;
  if ('imageSmoothingQuality' in c) c.imageSmoothingQuality = 'high';

  const P = PALETTE;
  const K = PROPS.zoom;
  const STR = PROPS.backdrop;
  const GRAIN = PROPS.grain;

  // Below this the pyramid is re-framed rather than squashed: the vanishing
  // point moves off the right edge, so you see a crop of the same object.
  const narrow = W < 900;
  const PITCH = narrow ? 44 : 64;

  // ---- paper grain ----
  const NS = 320;
  const noise = document.createElement('canvas');
  noise.width = NS;
  noise.height = NS;
  const nctx = noise.getContext('2d')!;
  const nim = nctx.createImageData(NS, NS);
  for (let q = 0; q < nim.data.length; q += 4) {
    const vv = 108 + Math.random() * 140;
    nim.data[q] = vv;
    nim.data[q + 1] = vv;
    nim.data[q + 2] = vv;
    nim.data[q + 3] = 255;
  }
  nctx.putImageData(nim, 0, 0);
  const grainPat = c.createPattern(noise, 'repeat');

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

  // ---- the hero frame ----
  // The approved constants appear below exactly as they were tuned. They live
  // in a design space whose vanishing point is at y=836.4 inside an 884-tall
  // hero; `hy` and `sc` place that space on the real page, and are the identity
  // when the page matches the artboard.
  const HERO_PV_Y = 836.4;
  const heroBase = SEAM[0] * (HERO_PV_Y / 884);
  // Uniform: the x values are already fractions of W, so the y values have to
  // shrink by the same factor or the pyramid stretches into a spike.
  const HS = Math.min(1, W / 1440);
  const pvx = W * 0.72;

  // As the page narrows the copy column keeps its measure while the drawing
  // shrinks with W, so the pyramid would walk into the text. It is pushed right
  // instead, by more the narrower it gets, until it reads as a crop — the left
  // flank rising out of the edge — rather than something squashed to fit. Zero
  // at 1440, where the approved framing stands as drawn. The cast shadow still
  // reaches back underneath the copy, which is the relationship it is built on.
  const heroShiftX = W >= 1440 ? 0 : Math.min(W * 0.3, (1440 - W) * 0.3);

  const hy = (y: number) => heroBase + (y - HERO_PV_Y) * HS;
  const sc = (x: number, y: number): Pt => [
    pvx + (x - pvx) * K + heroShiftX,
    heroBase + (y - HERO_PV_Y) * K * HS
  ];

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

  /** A concrete body: one flat face, one turned away, grain over the join. */
  function body(
    cx: number,
    cy: number,
    r: number,
    light: string,
    dark: string,
    ox: number,
    oy: number
  ) {
    const lx = cx + r * 0.46 + ox;
    const ly = cy - r * 0.34 + oy;
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
    c!.arc(lx, ly, r * 1.04, 0, 6.283185);
    c!.fillStyle = dark;
    c!.fill('evenodd');
    if (grainPat) {
      c!.globalCompositeOperation = 'multiply';
      c!.globalAlpha = 0.15;
      c!.fillStyle = grainPat;
      c!.fillRect(cx - r * 1.5, cy - r * 1.5, r * 3, r * 3);
    }
    c!.restore();
  }

  /** A small solid marker standing on a line. */
  function marker(
    x: number,
    baseY: number,
    wid: number,
    hgt: number,
    faceA: string,
    faceB: string,
    tilt: number
  ) {
    const half = wid / 2;
    const ly = baseY + tilt * half;
    const ry = baseY - tilt * half;
    const ay = (ly + ry) / 2 - hgt;
    poly([
      [x, ay],
      [x - half, ly],
      [x + half, ry]
    ]);
    c!.fillStyle = faceA;
    c!.fill();
    poly([
      [x, ay],
      [x + wid * 0.17, baseY - tilt * wid * 0.17],
      [x + half, ry]
    ]);
    c!.fillStyle = faceB;
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

  function render(ox: number, oy: number) {
    c!.setTransform(DPR, 0, 0, DPR, 0, 0);
    c!.globalAlpha = 1;
    c!.globalCompositeOperation = 'source-over';
    c!.fillStyle = P.paper;
    c!.fillRect(0, 0, W, H);

    // ---------- one grid, running the whole way down and dying out ----------
    // It fades out shortly after the projects band opens, as it did on the
    // artboard; anchoring it there keeps that relationship when copy reflows.
    const FADE = Y3 + 494;
    let g: number;
    c!.lineWidth = 1;
    for (g = PITCH; g < FADE; g += PITCH) {
      const a = 0.34 * STR * Math.max(0, 1 - g / FADE);
      if (a <= 0.004) continue;
      c!.globalAlpha = a;
      c!.strokeStyle = P.grid;
      line([0, g + 0.5], [W, g + 0.5]);
    }
    const vg = c!.createLinearGradient(0, 0, 0, FADE);
    vg.addColorStop(0, gridA(0.34 * STR));
    vg.addColorStop(1, gridA(0));
    c!.globalAlpha = 1;
    c!.strokeStyle = vg;
    for (g = PITCH; g < W; g += PITCH) line([g + 0.5, 0], [g + 0.5, FADE]);

    // ---------- concrete bodies, every one a whole object ----------
    // A large body tucked behind the apex and a small one high right: a
    // diagonal through the crown rather than two discs side by side. Narrow,
    // the large one would sit under the copy, so only the small one survives.
    if (!narrow) {
      c!.globalAlpha = 0.5 * STR;
      ring(W * 0.558 + ox * 10, hy(236) + oy * 7, W * 0.146 + 19, P.grid, 1);
      c!.globalAlpha = 1;
      body(
        W * 0.558 + ox * 10,
        hy(236) + oy * 7,
        W * 0.146,
        P.stoneNear[0],
        P.stoneNear[1],
        ox * 8,
        oy * 6
      );
    }
    c!.globalAlpha = 0.42 * STR;
    ring(W * 0.934 + ox * 15, hy(198) + oy * 10, W * 0.056 + 15, P.grid, 1);
    c!.globalAlpha = 1;
    body(
      W * 0.934 + ox * 15,
      hy(198) + oy * 10,
      W * 0.056,
      P.stoneSmall[0],
      P.stoneSmall[1],
      ox * 8,
      oy * 6
    );

    c!.globalAlpha = 0.65 * STR;
    ring(W * 0.255 + ox * 10, Y3 + 1 + oy * 7, W * 0.163 + 17, P.grid, 1);
    c!.globalAlpha = STR;
    body(
      W * 0.255 + ox * 10,
      Y3 + 1 + oy * 7,
      W * 0.163,
      P.stoneMid[0],
      P.stoneMid[1],
      ox * 8,
      oy * 6
    );

    c!.globalAlpha = 0.55 * STR;
    ring(W * 1.055 + ox * 14, Y3 + 838 + oy * 9, W * 0.185 + 18, P.grid, 1);
    c!.globalAlpha = STR;
    body(
      W * 1.055 + ox * 14,
      Y3 + 838 + oy * 9,
      W * 0.185,
      P.stoneFar[0],
      P.stoneFar[1],
      ox * 8,
      oy * 6
    );

    c!.globalAlpha = 0.5 * STR;
    ring(W * 0.905 + ox * 16, Y4 - 49 + oy * 10, W * 0.148 + 18, P.grid, 1);
    c!.globalAlpha = STR;
    body(
      W * 0.905 + ox * 16,
      Y4 - 49 + oy * 10,
      W * 0.148,
      P.stoneFar[0],
      P.stoneFar[1],
      ox * 8,
      oy * 6
    );
    c!.globalAlpha = 1;

    // ---------- the hero, free to run past its section ----------
    const A = sc(W * 0.775 + ox * 24, 69.7 + oy * 12);
    const BL = sc(W * 0.4 + ox * 24, 541.2 + oy * 4);
    const BR = sc(W * 1.15 + ox * 24, 541.2 + oy * 4);
    const FE = sc(W * 0.9 + ox * 24, 869.2 + oy * 2);

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
      c!.globalCompositeOperation = 'multiply';
      const S: Pt = [mb[0] - hg * 0.72, mb[1] + hg * 0.115];
      for (let sx = 0; sx < 4; sx++) {
        poly([
          lerp(BL, S, sx / 4),
          lerp(FE, S, sx / 4),
          lerp(FE, S, (sx + 1) / 4),
          lerp(BL, S, (sx + 1) / 4)
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

    const b1L = lerp(BL, A, 0.115);
    const b1F = lerp(FE, A, 0.115);
    const b2L = lerp(BL, A, 0.045);
    const b2F = lerp(FE, A, 0.045);
    c!.save();
    poly([A, BL, FE]);
    c!.clip();
    poly([b1L, b1F, FE, BL]);
    c!.fillStyle = P.bounce1;
    c!.fill();
    poly([b2L, b2F, FE, BL]);
    c!.fillStyle = P.bounce2;
    c!.fill();
    c!.restore();

    const rA = lerp(A, FE, 0.038);
    const rB = lerp(BR, FE, 0.038);
    c!.save();
    poly([A, FE, BR]);
    c!.clip();
    poly([A, BR, rB, rA]);
    c!.fillStyle = P.rim;
    c!.fill();
    c!.restore();

    c!.strokeStyle = P.ridge;
    c!.lineWidth = 1.6;
    line(A, FE);

    if (grainPat) {
      c!.save();
      poly([A, BL, FE, BR]);
      c!.clip();
      c!.globalCompositeOperation = 'screen';
      c!.globalAlpha = 0.065;
      c!.fillStyle = grainPat;
      c!.fillRect(0, 0, W, hy(1100));
      c!.restore();
    }

    // The wash that lets the hero copy sit over the drawing. It has to clear
    // the copy column at every width, so it is measured from the gutter and the
    // standfirst's 470px measure rather than taken as a flat fraction of W —
    // which at 1440 lands within a few pixels of the design's own 0.42.
    const scrW = Math.max(W * 0.42, Math.min(W * 0.92, GUT + 530));
    const scr = c!.createLinearGradient(0, 0, scrW, 0);
    scr.addColorStop(0, paperA(0.92));
    scr.addColorStop(0.55, paperA(0.55));
    scr.addColorStop(1, paperA(0));
    c!.fillStyle = scr;
    c!.fillRect(0, 0, scrW, hy(900));

    // Laid over the wash, so the roads survive to the left border.
    c!.strokeStyle = P.road;
    c!.lineWidth = 3;
    c!.lineCap = 'butt';
    line([0, hy(742) + oy * 6], T1);
    line([0, hy(858) + oy * 6], T2);

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
    const tri = W * 0.7014;
    for (let i = 0; i < SEAM.length; i++) {
      const y = SEAM[i];
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
    if (GRAIN > 0.01 && grainPat) {
      c!.save();
      c!.beginPath();
      c!.moveTo(0, 0);
      c!.lineTo(W, 0);
      c!.lineTo(W, DTR);
      c!.lineTo(0, DTL);
      c!.closePath();
      c!.clip();
      c!.globalCompositeOperation = 'multiply';
      c!.globalAlpha = 0.075 * GRAIN;
      c!.fillStyle = grainPat;
      c!.fillRect(0, 0, W, DTL);
      c!.restore();
    }

    // ---------- the ground tilts and the dark rises out of it ----------
    poly([
      [0, DTL],
      [W, DTR],
      [W, H],
      [0, H]
    ]);
    c!.fillStyle = P.night;
    c!.fill();

    marker(tri, darkY(tri), 56, 34, P.markerA, P.markerB, (DTL - DTR) / W);

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

    moon(
      W * 0.845 + ox * 16,
      YF + 0.135 * NH + oy * 10,
      W * 0.088,
      P.moonNear[0],
      P.moonNear[1]
    );
    moon(
      W * 0.118 + ox * 11,
      YF - 0.02 * NH + oy * 7,
      W * 0.115,
      P.moonFar[0],
      P.moonFar[1]
    );

    const hz = YF + 0.8 * NH + oy * 6;
    poly([
      [0, hz],
      [W, hz],
      [W, H],
      [0, H]
    ]);
    c!.fillStyle = P.nightNear;
    c!.fill();
    c!.strokeStyle = paperA(0.13);
    c!.lineWidth = 1;
    line([0, hz + 0.5], [W, hz + 0.5]);

    const nx = W * 0.7 + ox * 24;
    const rdg = c!.createLinearGradient(0, H, 0, hz);
    rdg.addColorStop(0, paperA(0));
    rdg.addColorStop(0.5, paperA(0.1));
    rdg.addColorStop(1, paperA(0.22));
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
    nrg.addColorStop(0, 'rgba(208, 213, 206, 0.85)');
    nrg.addColorStop(0.6, 'rgba(134, 140, 133, 0.42)');
    nrg.addColorStop(1, 'rgba(106, 111, 106, 0.22)');
    c!.strokeStyle = nrg;
    c!.lineWidth = 1.6;
    line(nA, nBR);
    c!.strokeStyle = 'rgba(174, 180, 173, 0.30)';
    c!.lineWidth = 1.2;
    line(nA, nBL);
    c!.strokeStyle = 'rgba(174, 180, 173, 0.20)';
    c!.lineWidth = 1;
    line(nA, nFE);

    if (GRAIN > 0.01 && grainPat) {
      c!.globalCompositeOperation = 'screen';
      c!.globalAlpha = 0.05 * GRAIN;
      c!.fillStyle = grainPat;
      c!.fillRect(0, DTR - 40, W, H);
      c!.globalAlpha = 1;
      c!.globalCompositeOperation = 'source-over';
    }
    c!.restore();
  }

  // ---- pointer parallax ----
  // Everything in the backdrop drifts with the cursor, eased at 0.07. Skipped
  // where there is no pointer to track, or where motion is unwelcome: both
  // render the scene once, at rest.
  const still =
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (still) {
    render(0, 0);
    return () => {};
  }

  let mx = 0.5;
  let my = 0.5;
  let tmx = 0.5;
  let tmy = 0.5;
  let last = -9;
  let drawn = false;
  let raf = 0;

  // The loop runs only while the eased position is still catching up with the
  // pointer, and parks itself once they meet. Holding a rAF open forever costs
  // a wakeup every frame for a scene that is not changing.
  function loop() {
    mx += (tmx - mx) * 0.07;
    my += (tmy - my) * 0.07;
    const key = Math.round(mx * 260) + Math.round(my * 260) * 1000;
    if (!drawn || key !== last) {
      render(mx - 0.5, (my - 0.5) * 0.35);
      last = key;
      drawn = true;
    }
    if (Math.abs(tmx - mx) < 0.0005 && Math.abs(tmy - my) < 0.0005) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(loop);
  }

  const wake = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  const onMove = (e: PointerEvent) => {
    const rc = cv.getBoundingClientRect();
    tmx = (e.clientX - rc.left) / rc.width;
    tmy = (e.clientY - rc.top) / rc.height;
    wake();
  };
  const onLeave = () => {
    tmx = 0.5;
    tmy = 0.5;
    wake();
  };

  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerleave', onLeave);

  wake();

  return () => {
    cancelAnimationFrame(raf);
    host.removeEventListener('pointermove', onMove);
    host.removeEventListener('pointerleave', onLeave);
  };
}
