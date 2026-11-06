// Landing page line drawings.
// Hover an object and a faint grey drawing sketches itself across the whole page:
//   chip     → circuit traces with solder pads
//   violin   → four long strings
//   painting → Bauhaus shapes (circles, checkerboard, triangles, diagonals)
//   brushes  → one sweeping brush stroke of varying thickness
// Drawings are rebuilt on resize so they line up with the objects.

// Show a labelled placeholder until the real image files are added
document.querySelectorAll('.obj img').forEach(img => {
  const markMissing = () => {
    img.parentElement.classList.add('missing');
    img.parentElement.dataset.label = img.getAttribute('src');
  };
  if (img.complete && img.naturalWidth === 0) markMissing();
  else img.addEventListener('error', markMissing);
});

const NS = 'http://www.w3.org/2000/svg';
const svg = document.querySelector('.lineart');
const sets = {};

// small seeded random so drawings look the same every time
function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

// a line that draws itself: d = path data, delay/duration in seconds
function line(g, d, delay = 0, dur = 1.4, cls = 'ln') {
  const p = el('path', { d, class: cls, pathLength: 1 }, g);
  p.style.setProperty('--d', `${delay}s`);
  p.style.setProperty('--dur', `${dur}s`);
  return p;
}
const circlePath = (cx, cy, r) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;

function rectOf(name) {
  const r = document.querySelector(`[data-art="${name}"]`).getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
}

/* ---------- chip: circuit traces ---------- */
function drawCircuit(g, W, H) {
  const r = rectOf('circuit'), rand = rng(7);
  const pad = Math.max(r.w, r.h) * 0.12;
  const box = { x: r.x - pad, y: r.y - pad, w: r.w + pad * 2, h: r.h + pad * 2 };
  line(g, `M${box.x} ${box.y} h${box.w} v${box.h} h${-box.w} Z`, 0, 0.8);

  const sides = [
    { n: 9, pt: i => [box.x + box.w * (i + 1) / 10, box.y], dir: [0, -1] },          // top
    { n: 9, pt: i => [box.x + box.w * (i + 1) / 10, box.y + box.h], dir: [0, 1] },   // bottom
    { n: 7, pt: i => [box.x, box.y + box.h * (i + 1) / 8], dir: [-1, 0] },           // left
    { n: 7, pt: i => [box.x + box.w, box.y + box.h * (i + 1) / 8], dir: [1, 0] },    // right
  ];
  const reach = Math.max(W, H);
  let k = 0;
  sides.forEach(side => {
    for (let i = 0; i < side.n; i++) {
      let [x, y] = side.pt(i);
      const [dx, dy] = side.dir;
      const pts = [[x, y]];
      // 1: straight out
      const a = 20 + rand() * 90;
      x += dx * a; y += dy * a; pts.push([x, y]);
      // 2: a 45° jog sideways
      const s = (rand() < 0.5 ? -1 : 1) * (15 + rand() * 70);
      x += dx * Math.abs(s) + (dy ? s : 0); y += dy * Math.abs(s) + (dx ? s : 0); pts.push([x, y]);
      // 3: long straight run, sometimes off the page, sometimes ending in a pad
      const off = rand() < 0.55;
      const b = off ? reach : 60 + rand() * reach * 0.35;
      x += dx * b; y += dy * b; pts.push([x, y]);
      const d = 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L');
      const delay = 0.3 + k * 0.035;
      line(g, d, delay, 1.3);
      if (!off) line(g, circlePath(x, y, 3.2), delay + 1.2, 0.3);
      k++;
    }
  });
  // a few pads sitting on the chip edge
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.5) / 6;
    line(g, `M${r.x + r.w * t - 4} ${r.y - pad / 2} h8`, 0.6, 0.3);
  }
}

/* ---------- violin: four strings ---------- */
function drawStrings(g, W, H) {
  const r = rectOf('strings');
  const bottomGap = Math.max(18, W * 0.022), topGap = Math.max(6, W * 0.006);
  for (let i = 0; i < 4; i++) {
    const o = i - 1.5;
    const xb = r.cx + o * bottomGap, xt = r.cx + o * topGap;
    const p = line(g, `M${xb} ${H + 10} L${xt} -10`, i * 0.14, 1.5, 'ln string');
  }
  // the bridge and nut, very lightly
  line(g, `M${r.cx - bottomGap * 2.2} ${H * 0.86} L${r.cx + bottomGap * 2.2} ${H * 0.86}`, 0.7, 0.6);
  line(g, `M${r.cx - topGap * 2.6} ${H * 0.05} L${r.cx + topGap * 2.6} ${H * 0.05}`, 0.8, 0.5);
}

/* ---------- painting: Bauhaus shapes ---------- */
function drawBauhaus(g, W, H) {
  const u = Math.min(W, H);
  let t = 0; const next = (step = 0.12) => (t += step);

  // long diagonals crossing the page
  line(g, `M${W * 0.12} ${H * 0.98} L${W * 0.86} ${H * 0.04}`, next(0), 1.6);
  line(g, `M${W * 0.3} ${H * 0.02} L${W * 0.95} ${H * 0.7}`, next(), 1.6);

  // big circle with an inner ring, top right
  line(g, circlePath(W * 0.76, H * 0.3, u * 0.17), next(), 1.4);
  line(g, circlePath(W * 0.76, H * 0.3, u * 0.08), next(), 1.0);

  // checkerboard, top left
  const cx = W * 0.07, cy = H * 0.2, n = 6, c = u * 0.028;
  for (let i = 0; i <= n; i++) {
    line(g, `M${cx} ${cy + i * c} h${n * c}`, next(0.03), 0.5);
    line(g, `M${cx + i * c} ${cy} v${n * c}`, next(0.03), 0.5);
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if ((i + j) % 2 === 0)
    line(g, `M${cx + i * c} ${cy + j * c} l${c} ${c}`, next(0.01), 0.3);

  // a row of triangles, bottom left
  const tx = W * 0.08, ty = H * 0.86, ts = u * 0.06;
  for (let i = 0; i < 6; i++) {
    const x = tx + i * ts * 1.05;
    line(g, `M${x} ${ty} L${x + ts / 2} ${ty - ts} L${x + ts} ${ty} Z`, next(0.07), 0.6);
  }

  // big wedge
  line(g, `M${W * 0.36} ${H * 0.16} L${W * 0.6} ${H * 0.58} L${W * 0.26} ${H * 0.64} Z`, next(), 1.2);

  // crescent arc
  line(g, `M${W * 0.5} ${H * 0.84} A${u * 0.2} ${u * 0.2} 0 0 1 ${W * 0.68} ${H * 0.62}`, next(), 1.0);

  // fan of thin rays, bottom right
  const fx = W * 0.9, fy = H * 0.9;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (1.05 + i * 0.07);
    line(g, `M${fx} ${fy} l${Math.cos(a) * u * 0.32} ${Math.sin(a) * u * 0.32}`, next(0.05), 0.7);
  }

  // small circles scattered
  [[0.34, 0.34, 0.035], [0.58, 0.12, 0.02], [0.9, 0.55, 0.05], [0.18, 0.62, 0.025]]
    .forEach(([x, y, r]) => line(g, circlePath(W * x, H * y, u * r), next(0.08), 0.6));

  // a semicircle resting on a line
  const sx = W * 0.44, sy = H * 0.94, sr = u * 0.07;
  line(g, `M${sx - sr * 1.6} ${sy} h${sr * 3.2}`, next(), 0.6);
  line(g, `M${sx - sr} ${sy} A${sr} ${sr} 0 0 1 ${sx + sr} ${sy}`, next(0.05), 0.6);
}

/* ---------- brushes: one big brush stroke ---------- */
function drawBrush(g, W, H) {
  const rand = rng(3);
  // centre line: a loose S sweeping across the page
  const P = [[-W * 0.05, H * 0.78], [W * 0.3, H * 0.95], [W * 0.55, H * 0.15], [W * 1.05, H * 0.35]];
  const bez = (t, i) => {
    const m = 1 - t;
    return m * m * m * P[0][i] + 3 * m * m * t * P[1][i] + 3 * m * t * t * P[2][i] + t * t * t * P[3][i];
  };
  const N = 140, pts = [];
  for (let k = 0; k <= N; k++) pts.push([bez(k / N, 0), bez(k / N, 1)]);

  const maxW = Math.min(W, H) * 0.075;
  let wobble = 0;
  const widthAt = t => {
    wobble += (rand() - 0.5) * 0.12; wobble *= 0.9;
    const swell = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), 0.7);   // thin start, fat middle
    const dry = t > 0.8 ? 1 - (t - 0.8) * 3.2 : 1;                           // runs dry at the end
    return maxW * Math.max(0.04, (0.12 + swell * 0.88) * dry + wobble);
  };

  const left = [], right = [], normals = [];
  pts.forEach((p, k) => {
    const a = pts[Math.max(0, k - 1)], b = pts[Math.min(N, k + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
    const w = widthAt(k / N) / 2;
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
    normals.push([nx, ny, w]);
  });
  const outline = 'M' + left.concat(right.reverse()).map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L') + 'Z';
  const spine = 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L');

  // reveal the ink along the stroke using a mask
  const id = 'brushmask';
  const defs = el('defs', {}, g);
  const mask = el('mask', { id, maskUnits: 'userSpaceOnUse', x: -W, y: -H, width: W * 3, height: H * 3 }, defs);
  const rv = el('path', { d: spine, class: 'reveal', pathLength: 1 }, mask);
  rv.style.strokeWidth = maxW * 1.6;
  el('path', { d: outline, class: 'ink', mask: `url(#${id})` }, g);

  // bristle streaks along the stroke
  for (let s = 0; s < 7; s++) {
    const f = -0.8 + s * 0.27 + (rand() - 0.5) * 0.08;
    const start = Math.floor(rand() * 12), end = N - Math.floor(rand() * 30);
    const d = 'M' + pts.slice(start, end).map((p, k) => {
      const [nx, ny, w] = normals[start + k];
      return `${(p[0] + nx * w * f).toFixed(1)} ${(p[1] + ny * w * f).toFixed(1)}`;
    }).join(' L');
    line(g, d, 0.1 + s * 0.04, 1.5, 'ln bristle');
  }
}

const builders = { circuit: drawCircuit, strings: drawStrings, bauhaus: drawBauhaus, brush: drawBrush };

function build() {
  const W = innerWidth, H = innerHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const active = Object.keys(sets).filter(k => sets[k].classList.contains('on'));
  svg.replaceChildren();
  for (const name in builders) {
    const g = el('g', { class: 'set' }, svg);
    builders[name](g, W, H);
    sets[name] = g;
  }
  active.forEach(k => sets[k].classList.add('on'));
}

let fadeTimers = {};
function show(name) {
  clearTimeout(fadeTimers[name]);
  const g = sets[name];
  for (const k in sets) if (k !== name) hide(k);
  g.classList.remove('on');
  void g.getBoundingClientRect();     // restart the drawing animation
  g.classList.add('on');
}
function hide(name) {
  sets[name]?.classList.remove('on');
}

build();
let rt;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });

document.querySelectorAll('[data-art]').forEach(obj => {
  const name = obj.dataset.art;
  obj.addEventListener('pointerenter', () => show(name));
  obj.addEventListener('pointerleave', () => hide(name));
});
