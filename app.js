{
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS = {
  get(k, d) { try { const v = localStorage.getItem('mf1.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('mf1.' + k, JSON.stringify(v)); } catch (e) {} }
};
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const angN = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const fmt = ms => { if (ms == null || !isFinite(ms)) return '—'; const m = Math.floor(ms / 60000), s = (ms % 60000) / 1000; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); };
const PTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const HEX = /^#[0-9a-f]{6}$/i;
const okCol = (c, d) => HEX.test(c || '') ? c : d;

/* ---------- data ---------- */
const PILOTS = {
  mikail: { name: 'Mikail', code: 'MİK', video: '', poster: 'media/intro_cars.png', color: '#e10600', color2: '#ffffff', pattern: 'stripe', helmet: '#ffffff', num: 7, tyre: 'soft' },
  safura: { name: 'Safura', code: 'SAF', video: '', poster: 'media/intro_cars.png', color: '#ff4fa0', color2: '#ffffff', pattern: 'stars', helmet: '#ffd6ea', num: 11, tyre: 'medium' }
};
const COLORS = [
  ['#e10600', 'Alov qırmızı'], ['#ff4fa0', 'Çəhrayı'], ['#1e5bd8', 'Dəniz mavisi'], ['#ff8a00', 'Narıncı'],
  ['#18a558', 'Zümrüd'], ['#7a3cff', 'Bənövşəyi'], ['#edb40b', 'Qızılı'], ['#c9ced6', 'Gümüşü'], ['#1b1c21', 'Gecə qara'], ['#00b5e2', 'Bayraq mavisi'], ['#ffffff', 'Ağ']
];
const PRESETS = [['Alov', '#e10600', '#ffffff'], ['Gecə qızılı', '#1b1c21', '#edb40b'], ['Okean', '#1e5bd8', '#ffffff'], ['Turbo', '#ff8a00', '#1b1c21'], ['Çəhrayı ulduz', '#ff4fa0', '#ffffff'], ['Azərbaycan', '#00b5e2', '#ef3340'], ['Zümrüd', '#18a558', '#edb40b'], ['Bənövşəyi', '#7a3cff', '#00b5e2']];
const PATTERNS = [['solid', 'Klassik'], ['stripe', 'Yarış zolağı'], ['twotone', 'İki rəng'], ['flame', 'Alov'], ['stars', 'Ulduzlar'], ['flag', 'Azərbaycan']];
const TYRES = {
  soft: { n: 'Soft', l: 'S', c: '#e8202a', top: 1.0, grip: 1.16, wear: .024, d: 'Ən çox yapışır, amma tez yeyilir.' },
  medium: { n: 'Medium', l: 'M', c: '#f5c400', top: 1.04, grip: 1.04, wear: .016, d: 'Balanslı: həm sürət, həm dözüm.' },
  hard: { n: 'Hard', l: 'H', c: '#f2f2f2', top: 1.08, grip: .93, wear: .010, d: 'Düz yolda ən sürətli, çox gec yeyilir.' },
  wet: { n: 'Wet', l: 'W', c: '#1e90ff', top: .92, grip: 1.0, wear: .012, d: 'Yağış üçün. Quru yolda yavaşdır və tez yeyilir.' }
};
function tyreApply(c, key, wx) { const T = TYRES[key] || TYRES.medium, rain = wx === 'rain'; c.tyre = key; c.grip = key === 'wet' ? (rain ? 1.08 : .82) : T.grip * (rain ? .8 : 1); c.top = TOP * T.top * (rain && key !== 'wet' ? .95 : 1); c.wearRate = T.wear * (key === 'wet' && !rain ? 2.2 : 1); c.wear = 0; }
const BOTS = [['Turbo', 'TUR', '#1e5bd8', '#ffffff', 'stripe'], ['Raket', 'RAK', '#ff8a00', '#1b1c21', 'twotone'], ['Şimşək', 'ŞİM', '#18a558', '#edb40b', 'flame'], ['Kometa', 'KOM', '#7a3cff', '#00b5e2', 'stars'], ['Ulduz', 'ULD', '#00b5c8', '#ffffff', 'solid']];
const TRACKS = [
  { id: 'baku', n: 'Bakı Bulvarı', sub: 'Dənizkənarı şəhər treki', sea: 'bottom', ground: '#d9d3c5', seed: 11,
    pts: [[140,560],[520,580],[860,570],[930,520],[920,420],[820,390],[720,400],[680,330],[740,250],[870,210],[890,120],[800,70],[520,80],[470,150],[360,170],[300,110],[160,110],[100,220],[150,320],[110,440]] },
  { id: 'qala', n: 'Qala Küçələri', sub: 'Dar və dolanbac', ground: '#e0d4bb', seed: 23,
    pts: [[160,590],[620,600],[800,560],[760,460],[880,380],[900,230],[780,160],[650,240],[560,140],[420,100],[290,170],[330,300],[210,360],[110,470]] },
  { id: 'xezer', n: 'Xəzər Halqası', sub: 'Uzun düzlər, böyük sürət', sea: 'right', ground: '#d3dac6', seed: 37,
    pts: [[150,560],[560,580],[820,560],[900,460],[890,200],[800,100],[480,90],[200,110],[120,200],[220,300],[150,420]] },
  { id: 'dag', n: 'Dağ Yolu', sub: 'Çoxlu döngə, az düz yol', ground: '#c9d5b2', seed: 41, park: true,
    pts: [[220,600],[560,620],[720,560],[900,600],[960,470],[830,400],[900,260],[780,130],[580,180],[500,90],[310,110],[270,240],[140,290],[180,440],[110,540]] },
  { id: 'korfez', n: 'Gecə Körfəzi', sub: 'Real şəhər, körfəz və göydələnlər', ground: '#1b2230', night: true, seed: 61, model: true, S: 1, pts: [[-1922,2871],[-2228,2810],[-2495,2642],[-2633,2336],[-2671,1800],[-2702,1188],[-2725,500],[-2717,-21],[-2625,-189],[-2419,-243],[-1845,-220],[-1371,-189],[-1248,-51],[-1202,155],[-1080,201],[-621,201],[-529,79],[-499,-143],[-353,-189],[488,-151],[542,40],[588,209],[909,346],[1292,576],[1636,844],[1904,1050],[2072,500],[2248,-266],[2401,-1030],[2477,-1298],[2668,-1107],[3128,-724],[3357,-418],[3548,-189],[3740,25],[3510,500],[3204,1112],[2898,1647],[2745,1800],[2516,1647],[2248,1418],[2018,1264],[1904,1456],[1735,1953],[1636,2106],[1368,1953],[909,1724],[450,1433],[68,1188],[-238,1096],[-1080,1066],[-1845,1050],[-2074,1112],[-2113,1418],[-1960,1876],[-1807,2259],[-1845,2718]] },
  { id: 'gece', n: 'Gecə Ulduzu', sub: 'İşıqlar altında gecə yarışı', ground: '#2a2f3b', night: true, seed: 53,
    pts: [[300,600],[800,610],[920,490],[800,410],[840,270],[720,140],[520,200],[430,100],[230,130],[150,290],[280,370],[170,500]] }
];

/* ---------- track build ---------- */
const STEP = 8, HW = 60, TOP = 560, LAT = 1100, U = .1;
function buildTrack(def) {
  const S = def.S || 3.2, M = 300;
  const raw = def.pts.map(([x, y]) => [x * S, y * S]);
  const n0 = raw.length, dense = [];
  for (let i = 0; i < n0; i++) {
    const p0 = raw[(i - 1 + n0) % n0], p1 = raw[i], p2 = raw[(i + 1) % n0], p3 = raw[(i + 2) % n0];
    const steps = Math.max(6, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 3));
    for (let k = 0; k < steps; k++) {
      const t = k / steps, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  const pts = [];
  let acc = 0; pts.push({ x: dense[0][0], y: dense[0][1] });
  for (let i = 1; i <= dense.length; i++) {
    const a = dense[i - 1], b = dense[i % dense.length];
    let seg = Math.hypot(b[0] - a[0], b[1] - a[1]), pos = 0;
    while (acc + (seg - pos) >= STEP) { pos += STEP - acc; acc = 0; const t = pos / seg; pts.push({ x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t }); }
    acc += seg - pos;
  }
  if (Math.hypot(pts[pts.length - 1].x - pts[0].x, pts[pts.length - 1].y - pts[0].y) < STEP * .5) pts.pop();
  let mnx = 1e9, mny = 1e9, mxx = -1e9, mxy = -1e9;
  for (const p of pts) { mnx = Math.min(mnx, p.x); mny = Math.min(mny, p.y); mxx = Math.max(mxx, p.x); mxy = Math.max(mxy, p.y); }
  for (const p of pts) { p.x += M - mnx; p.y += M - mny; }
  const n = pts.length, th = new Float32Array(n), vmax = new Float32Array(n), kv = new Float32Array(n);
  for (let i = 0; i < n; i++) { const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n]; th[i] = Math.atan2(b.y - a.y, b.x - a.x); }
  for (let i = 0; i < n; i++) { const k = Math.abs(angN(th[(i + 5) % n] - th[(i - 5 + n) % n])) / (10 * STEP); kv[i] = k; vmax[i] = Math.min(TOP * 1.1, Math.sqrt(LAT / Math.max(k, 1e-6))); }
  for (let pass = 0; pass < 3; pass++) for (let i = n - 1; i >= 0; i--) { const nx = vmax[(i + 1) % n]; vmax[i] = Math.min(vmax[i], Math.sqrt(nx * nx + 2 * 700 * STEP)); }
  const road = new Path2D(); road.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < n; i++) road.lineTo(pts[i].x, pts[i].y); road.closePath();
  const kerbs = [], kerbRuns = []; let run = null, runI = null;
  for (let i = 0; i <= n; i++) { const j = i % n, hot = kv[j] > .0032; if (hot && !run) { run = new Path2D(); run.moveTo(pts[j].x, pts[j].y); runI = [j]; } else if (hot) { run.lineTo(pts[j].x, pts[j].y); runI.push(j); } else if (run) { kerbs.push(run); kerbRuns.push(runI); run = null; } }
  if (run) { kerbs.push(run); kerbRuns.push(runI); }
  const W = Math.ceil(mxx - mnx + 2 * M), H = Math.ceil(mxy - mny + 2 * M);
  const cell = 160, buckets = new Map();
  pts.forEach((p, i) => { const k = ((p.x / cell) | 0) + ',' + ((p.y / cell) | 0); if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(i); });
  const tr = { def, pts, th, vmax, kv, n, L: n * STEP, W, H, road, kerbs, kerbRuns, buckets, cell, ox: M - mnx, oy: M - mny };
  tr.near = (x, y, r) => { const cx = (x / cell) | 0, cy = (y / cell) | 0, rr = r * r, sp = Math.ceil(r / cell); for (let i = -sp; i <= sp; i++) for (let j = -sp; j <= sp; j++) { const b = buckets.get((cx + i) + ',' + (cy + j)); if (b) for (const k of b) { const p = pts[k]; if ((p.x - x) ** 2 + (p.y - y) ** 2 < rr) return true; } } return false; };
  return tr;
}
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255; if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } return '#' + [r, g, b].map(v => (v | 0).toString(16).padStart(2, '0')).join(''); }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

/* city layout shared by 2D and 3D */
function city(tr) {
  if (tr.city) return tr.city;
  if (tr.def.model) return tr.city = { sea: null, land: () => true, parks: [], blds: [], trees: [], stands: [], tower: null, boats: [], waves: [] };
  const d = tr.def, R = rng(d.seed), night = !!d.night;
  let mxy = 0, mxx = 0; for (const p of tr.pts) { mxy = Math.max(mxy, p.y); mxx = Math.max(mxx, p.x); }
  const sea = d.sea ? { side: d.sea, x: d.sea === 'right' ? mxx + 150 : 0, y: d.sea === 'bottom' ? mxy + 150 : 0 } : null;
  const land = (x, y) => !(sea && sea.side === 'bottom' && y > sea.y - 40) && !(sea && sea.side === 'right' && x > sea.x - 40);
  const C = { sea, land, parks: [], blds: [], trees: [], stands: [], tower: null, boats: [], waves: [] };
  const nPark = d.park ? 16 : 6;
  for (let i = 0; i < nPark; i++) { const x = R() * tr.W, y = R() * tr.H, w = 140 + R() * 180, h = 120 + R() * 160; if (!land(x + w / 2, y + h / 2) || tr.near(x + w / 2, y + h / 2, Math.max(w, h) / 2 + HW + 50)) continue; C.parks.push({ x, y, w, h }); for (let k = 0; k < 10; k++) C.trees.push({ x: x + 16 + R() * (w - 32), y: y + 16 + R() * (h - 32), r: 10 + R() * 10 }); }
  const roofs = night ? ['#4a5162', '#3f4656', '#565e70', '#5d5446'] : ['#efe3c8', '#e6d1a6', '#f4f1ea', '#d9b98a', '#c97f5a', '#e9e6df', '#bfc7cf'];
  for (let bx = 90; bx < tr.W; bx += 190) for (let by = 90; by < tr.H; by += 190) {
    const parts = 1 + (R() * 3 | 0), x0 = bx + 22, y0 = by + 22, bw = 146, bh = 146;
    for (let k = 0; k < parts; k++) {
      const w = parts === 1 ? bw : bw / (k === 0 ? 1.7 : 2.4) * (.8 + R() * .3), h = parts === 1 ? bh : bh * (.45 + R() * .5);
      const x = x0 + (k === 1 ? bw - w : 0), y = y0 + (k === 2 ? bh - h : k === 1 ? R() * (bh - h) : 0);
      const cx = x + w / 2, cy = y + h / 2, col = roofs[R() * roofs.length | 0], ht = 30 + R() * R() * 140;
      if (!land(cx, cy) || !land(x, y) || !land(x + w, y + h) || tr.near(cx, cy, Math.hypot(w, h) / 2 + HW + 36)) continue;
      C.blds.push({ x, y, w, h, col, ht, win: Array.from({ length: 3 }, () => [x + 12 + R() * (w - 34), y + 12 + R() * (h - 34), R()]) });
    }
    for (let k = 0; k < 2; k++) { const x = bx + R() * 190, y = by - 4 + (R() < .5 ? 0 : 8); if (land(x, y) && !tr.near(x, y, HW + 40)) C.trees.push({ x, y, r: 9 }); }
  }
  if (sea) {
    for (let i = 0; i < 60; i++) { const t = i / 60; C.trees.push({ x: sea.side === 'bottom' ? t * tr.W : sea.x - 20, y: sea.side === 'bottom' ? sea.y - 20 : t * tr.H, r: 13, palm: true }); }
    for (let i = 0; i < 6; i++) C.boats.push({ x: (sea.side === 'right' ? sea.x + 60 : 60) + R() * (sea.side === 'right' ? 500 : tr.W - 120), y: (sea.side === 'bottom' ? sea.y + 80 : 60) + R() * (sea.side === 'bottom' ? 400 : tr.H - 120) });
    for (let i = 0; i < 90; i++) C.waves.push([R(), R()]);
  }
  if (d.id === 'baku') { for (let t = 0; t < 400; t++) { const x = 300 + R() * (tr.W - 600), y = 300 + R() * (tr.H - 700); if (land(x, y) && !tr.near(x, y, HW + 160)) { C.tower = { x, y }; C.blds = C.blds.filter(b => Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y) > 160); break; } } }
  const n = tr.n;
  for (let i = n - 60; i < n + 50; i += 10) {
    const j = (i + n) % n, p = tr.pts[j], a = tr.th[j];
    for (const side of [-1, 1]) { const off = HW + 70, x = p.x - Math.sin(a) * side * off, y = p.y + Math.cos(a) * side * off; if (tr.near(x, y, HW + 52)) continue; C.stands.push({ x, y, a, side, crowd: Array.from({ length: 6 }, () => ['#fff', '#edb40b', '#00b5e2', '#ff4fa0', '#2fe06b', '#e10600'][R() * 6 | 0]) }); }
  }
  return tr.city = C;
}
function paintGround(g, tr, flat, clear) {
  const d = tr.def, C = city(tr), night = !!d.night;
  if (!clear) {
  g.fillStyle = d.ground; g.fillRect(0, 0, tr.W, tr.H);
  g.strokeStyle = night ? '#3a404d' : shade(d.ground, -.1); g.lineWidth = 26;
  for (let x = 90; x < tr.W; x += 190) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, tr.H); g.stroke(); }
  for (let y = 90; y < tr.H; y += 190) { g.beginPath(); g.moveTo(0, y); g.lineTo(tr.W, y); g.stroke(); }
  }
  if (C.sea) {
    const s = C.sea; g.fillStyle = '#e9dcc0';
    if (s.side === 'bottom') g.fillRect(0, s.y - 40, tr.W, tr.H); else g.fillRect(s.x - 40, 0, tr.W, tr.H);
    const gr = s.side === 'bottom' ? g.createLinearGradient(0, s.y, 0, tr.H) : g.createLinearGradient(s.x, 0, tr.W, 0);
    gr.addColorStop(0, '#4fb0d6'); gr.addColorStop(1, '#1f6f9a'); g.fillStyle = gr;
    if (s.side === 'bottom') g.fillRect(0, s.y, tr.W, tr.H); else g.fillRect(s.x, 0, tr.W, tr.H);
    if (flat) {
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 3;
      for (const [a, b] of C.waves) { const x = s.side === 'right' ? s.x + a * (tr.W - s.x) : a * tr.W, y = s.side === 'bottom' ? s.y + 30 + b * (tr.H - s.y) : b * tr.H; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 14, y - 6, x + 28, y); g.stroke(); }
      for (const b of C.boats) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(b.x, b.y, 26, 9, s.side === 'right' ? Math.PI / 2 : 0, 0, 7); g.fill(); g.fillStyle = '#e10600'; g.fillRect(b.x - 6, b.y - 4, 12, 8); }
    }
  }
  for (const p of C.parks) { g.fillStyle = night ? '#24402e' : '#9cc47a'; rr(g, p.x, p.y, p.w, p.h, 22); g.fill(); }
  if (!flat) { for (const b of C.blds) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(b.x - 6, b.y - 6, b.w + 12, b.h + 12); } return; }
  for (const b of C.blds) {
    g.fillStyle = 'rgba(0,0,0,.22)'; rr(g, b.x + 9, b.y + 11, b.w, b.h, 6); g.fill();
    g.fillStyle = b.col; rr(g, b.x, b.y, b.w, b.h, 6); g.fill();
    g.fillStyle = shade(b.col, -.08); rr(g, b.x + 8, b.y + 8, b.w - 16, b.h - 16, 4); g.fill();
    for (const w of b.win) { g.fillStyle = night ? (w[2] < .5 ? '#ffd76a' : '#6b7286') : 'rgba(255,255,255,.55)'; g.fillRect(w[0], w[1], 12, 9); }
  }
  for (const t of C.trees) tree(g, t.x, t.y, t.r, night);
  if (C.tower) { const { x, y } = C.tower; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(x + 10, y + 12, 62, 0, 7); g.fill(); g.fillStyle = '#e6cc98'; g.beginPath(); g.arc(x, y, 62, 0, 7); g.fill(); g.fillStyle = '#d5b77c'; g.beginPath(); g.arc(x, y, 46, 0, 7); g.fill(); g.fillStyle = '#e6cc98'; g.fillRect(x + 40, y - 22, 46, 44); }
  for (const s of C.stands) { g.save(); g.translate(s.x, s.y); g.rotate(s.a); g.fillStyle = s.side > 0 ? '#e10600' : '#1b1c21'; g.fillRect(-5, -18, 10, 36); s.crowd.forEach((c, m) => { g.fillStyle = c; g.beginPath(); g.arc(0, -14 + m * 5.5, 2.2, 0, 7); g.fill(); }); g.restore(); }
}
function tree(g, x, y, r, night) { g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.arc(x + 4, y + 5, r, 0, 7); g.fill(); g.fillStyle = night ? '#2d5a3c' : '#5fa04a'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = night ? '#3b7050' : '#7cbf5e'; g.beginPath(); g.arc(x - r * .3, y - r * .3, r * .55, 0, 7); g.fill(); }
const TR = {}; const getTrack = id => { if (!TR[id]) TR[id] = buildTrack(TRACKS.find(t => t.id === id)); return TR[id]; };
function bg2d(tr) { if (!tr.bg) { const c = document.createElement('canvas'); c.width = tr.W; c.height = tr.H; paintGround(c.getContext('2d'), tr, true); tr.bg = c; } return tr.bg; }
function drawWorld(g, tr) {
  g.drawImage(bg2d(tr), 0, 0);
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.strokeStyle = '#2b3038'; g.lineWidth = 2 * HW + 66; g.stroke(tr.road);
  g.strokeStyle = tr.def.night ? '#3c4250' : '#c9ccce'; g.lineWidth = 2 * HW + 58; g.stroke(tr.road);
  g.lineWidth = 2 * HW + 20; g.lineCap = 'butt';
  for (const k of tr.kerbs) { g.setLineDash([16, 16]); g.strokeStyle = '#e10600'; g.lineDashOffset = 0; g.stroke(k); g.strokeStyle = '#fff'; g.lineDashOffset = 16; g.stroke(k); }
  g.setLineDash([]); g.lineCap = 'round';
  g.strokeStyle = '#f2f2f2'; g.lineWidth = 2 * HW + 6; g.stroke(tr.road);
  g.strokeStyle = tr.def.night ? '#30343d' : '#4a4f58'; g.lineWidth = 2 * HW; g.stroke(tr.road);
  const p = tr.pts[0], a = tr.th[0];
  g.save(); g.translate(p.x, p.y); g.rotate(a);
  for (let r = 0; r < 2; r++) for (let k = -6; k < 6; k++) { g.fillStyle = (k + r) % 2 ? '#111' : '#fff'; g.fillRect(-10 + r * 10, k * 10, 10, 10); }
  g.restore();
}
function gridSlot(tr, s) { const i = (tr.n - 6 - s * 8 + tr.n) % tr.n, p = tr.pts[i], a = tr.th[i], side = s % 2 ? 1 : -1; return { x: p.x - Math.sin(a) * side * 26, y: p.y + Math.cos(a) * side * 26, a, i }; }

/* 2D sprites for the home city */
const SPR = {};
function sprite(col, helm) {
  const key = col + helm; if (SPR[key]) return SPR[key];
  const s = 4, c = document.createElement('canvas'); c.width = 52 * s; c.height = 28 * s;
  const g = c.getContext('2d'); g.scale(s, s); g.translate(26, 14);
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(2, 2, 24, 11, 0, 0, 7); g.fill();
  g.fillStyle = '#111'; [[-21, -13, 10, 6], [-21, 7, 10, 6], [11, -12, 8, 5], [11, 7, 8, 5]].forEach(r => { rr(g, r[0], r[1], r[2], r[3], 1.5); g.fill(); });
  g.fillStyle = '#1a1a1d'; g.fillRect(-24, -10, 5, 20); g.fillStyle = col; g.fillRect(-23, -9, 2.5, 18);
  g.fillStyle = col; g.beginPath(); g.moveTo(-19, -6); g.lineTo(-6, -8.5); g.lineTo(6, -5); g.lineTo(21, -1.8); g.lineTo(23, 0); g.lineTo(21, 1.8); g.lineTo(6, 5); g.lineTo(-6, 8.5); g.lineTo(-19, 6); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-14, -8, 12, 3); g.fillRect(-14, 5, 12, 3);
  g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(-16, -1, 36, 1.2);
  g.fillStyle = '#1a1a1d'; g.fillRect(19, -11, 4, 22); g.fillStyle = col; g.fillRect(20, -10, 2, 20);
  g.fillStyle = '#111'; g.beginPath(); g.ellipse(-2, 0, 5.5, 3.4, 0, 0, 7); g.fill();
  g.fillStyle = helm; g.beginPath(); g.arc(-3, 0, 2.7, 0, 7); g.fill();
  return SPR[key] = c;
}
function drawCar(g, c) { const sp = sprite(c.color, c.helm || '#fff'); g.save(); g.translate(c.x, c.y); g.rotate(c.a); g.drawImage(sp, -26, -14, 52, 28); g.restore(); }

/* ---------- physics ---------- */
function newCar(o) { return Object.assign({ x: 0, y: 0, a: 0, v: 0, idx: 0, lap: 0, dist: 0, steer: 0, gas: 0, brake: 0, erg: 1, boosting: false, lane: 0, skill: 1, top: TOP, grip: 1, ge: 1, wear: 0, wearRate: .016, pit: null, done: false, fin: null, lapT0: null, best: null, laps: [] }, o); }
function place(c, tr, s) { const g = gridSlot(tr, s); c.x = g.x; c.y = g.y; c.a = g.a; c.idx = g.i; c.lap = 0; c.v = 0; }
function locate(tr, c, full) {
  let best = 1e18, bi = c.idx;
  if (full) { for (let i = 0; i < tr.n; i += 2) { const p = tr.pts[i], d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2; if (d < best) { best = d; bi = i; } } }
  else for (let j = -14; j <= 34; j++) { const i = (c.idx + j + tr.n) % tr.n, p = tr.pts[i], d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2; if (d < best) { best = d; bi = i; } }
  const prev = c.idx;
  if (prev > tr.n - 70 && bi < 70) c.lap++; else if (prev < 70 && bi > tr.n - 70) c.lap--;
  c.idx = bi; c.dist = Math.sqrt(best);
  return prev > tr.n - 70 && bi < 70;
}
function aiSteer(c, tr, look0) {
  const look = Math.floor((look0 || 9) + c.v / 38), j = (c.idx + look) % tr.n, t = tr.pts[j], a = tr.th[j];
  const tx = t.x - Math.sin(a) * c.lane, ty = t.y + Math.cos(a) * c.lane;
  return clamp(angN(Math.atan2(ty - c.y, tx - c.x) - c.a) * 3, -1, 1);
}
function aiSpeed(c, tr) { let v = 1e9; for (let j = 0; j < 30; j += 3) v = Math.min(v, tr.vmax[(c.idx + j) % tr.n]); return v * c.skill * c.ge; }
function step(c, tr, dt) {
  const off = c.dist > HW + 4;
  if (c.boosting && c.erg > 0) c.erg = Math.max(0, c.erg - dt / 2.6); else { c.boosting = false; c.erg = Math.min(1, c.erg + dt / 14 + (c.brake ? dt / 10 : 0)); }
  const max = c.top * (1 - .06 * c.wear) * (c.boosting ? 1.2 : 1) * (off ? .55 : 1);
  if (c.gas) c.v += 320 * (1 - .55 * c.v / max) * dt * (c.boosting ? 1.6 : 1);
  if (c.brake) c.v -= 560 * dt;
  if (!c.gas && !c.brake) c.v -= 100 * dt;
  if (c.v > max) c.v -= Math.min(c.v - max, 420 * dt);
  c.v = Math.max(0, c.v);
  const turn = 2.7 * c.ge * Math.min(1, c.v / 110 + .15) * (1 - .38 * c.v / (TOP * 1.25));
  c.a = angN(c.a + c.steer * turn * dt);
  c.x += Math.cos(c.a) * c.v * dt; c.y += Math.sin(c.a) * c.v * dt;
  const crossed = locate(tr, c, c.dist > 260);
  const W = HW + 26;
  if (c.dist > W) { const p = tr.pts[c.idx], dx = c.x - p.x, dy = c.y - p.y, d = Math.hypot(dx, dy) || 1; c.x = p.x + dx / d * W; c.y = p.y + dy / d * W; c.v *= .55; c.a = angN(c.a + angN(tr.th[c.idx] - c.a) * .35); c.dist = W; }
  return crossed;
}
function collide(cars) {
  for (let i = 0; i < cars.length; i++) for (let j = i + 1; j < cars.length; j++) {
    const A = cars[i], B = cars[j], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
    if (d > 0 && d < 24) { const o = (24 - d) / 2, nx = dx / d, ny = dy / d; A.x -= nx * o; A.y -= ny * o; B.x += nx * o; B.y += ny * o; A.v *= .985; B.v *= .985; }
  }
}

/* ---------- state ---------- */
const st = {
  pilot: LS.get('pilot', 'mikail'), guest: LS.get('guest', ''), diff: LS.get('diff2', 'clash'), laps: LS.get('laps', 3), track: LS.get('track', 'baku'), cam: LS.get('cam', 0),
  mine: LS.get('league', { pilots: {} }), all: null, uid: null, db: null, room: null, user: null, canWrite: true, peers: [], gtab: LS.get('gtab', 'mikail')
};
function garage(key) {
  const mc = ME && HEX.test(ME.av || '') ? ME.av : '#e10600', base = PILOTS[key] || { color: key.endsWith('_2') ? '#1b1c21' : mc, color2: '#ffffff', pattern: 'solid', helmet: '#ffffff', num: key.endsWith('_2') ? 2 : 1, tyre: 'medium' };
  return Object.assign({ model: 'modern', color: base.color, color2: base.color2, pattern: base.pattern, helmet: base.helmet, num: base.num, tyre: base.tyre }, LS.get('g.' + key, {}));
}
function setGarage(key, patch) { const g = Object.assign(garage(key), patch); LS.set('g.' + key, g); clearTimeout(setGarage.t); setGarage.t = setTimeout(syncGarage, 800); return g; }
function syncGarage() { if (typeof ME === 'undefined' || !ME) return; const k = 'u_' + ME.user, gar = { a: LS.get('g.' + k, null), b: LS.get('g.' + k + '_2', null) }; if (typeof accSave === 'function') accSave({ garage: gar }); }
const guestKey = () => 'p_' + (st.guest || 'qonaq');
function meKey() { return ME ? 'u_' + ME.user : 'guest'; }
function pilotKey() { return meKey(); }
function pilotName() { return ME ? ME.name : 'Qonaq'; }
const myGarage = () => garage(meKey());
const codeOf = nm => String(nm || 'PİL').toLocaleUpperCase('az').replace(/\s/g, '').slice(0, 3);

/* ---------- league data ---------- */
function rec(key) { return st.mine.pilots[key] || (st.mine.pilots[key] = { nm: '', base: '', col: '', num: 0, races: 0, wins: 0, med: [0, 0, 0], pts: {}, best: {} }); }
function mergeRec(a, b) {
  const r = { nm: b.nm || a.nm, base: b.base || a.base, col: b.col || a.col, num: b.num || a.num, races: Math.max(a.races || 0, b.races || 0), wins: Math.max(a.wins || 0, b.wins || 0), med: [0, 1, 2].map(i => Math.max((a.med || [])[i] || 0, (b.med || [])[i] || 0)), pts: {}, best: {} };
  for (const k of new Set([...Object.keys(a.pts || {}), ...Object.keys(b.pts || {})])) r.pts[k] = Math.max((a.pts || {})[k] || 0, (b.pts || {})[k] || 0);
  for (const k of new Set([...Object.keys(a.best || {}), ...Object.keys(b.best || {})])) { const x = (a.best || {})[k], y = (b.best || {})[k]; r.best[k] = x && y ? Math.min(x, y) : x || y; }
  return r;
}
let writing = Promise.resolve();
function saveLeague() {
  LS.set('league', st.mine);
  if (!st.db || !st.uid || !st.canWrite) return;
  const body = JSON.parse(JSON.stringify(st.mine)); body.t = Date.now();
  writing = writing.then(() => st.db.doc('league/' + st.uid).set(body)).catch(e => { if (e && e.code === 'invalid_argument') st.canWrite = false; });
}
function cleanRec(x) {
  const num = v => (typeof v === 'number' && isFinite(v) && v >= 0) ? v : 0;
  const o = { nm: String(x.nm || '').slice(0, 16), base: x.base === 'mikail' || x.base === 'safura' ? x.base : 'custom', col: okCol(x.col, '#888888'), av: typeof x.av === 'string' && x.av.length < 12 ? x.av : '', num: num(x.num) % 100, races: num(x.races), wins: num(x.wins), med: [0, 1, 2].map(i => num((x.med || [])[i])), pts: {}, best: {} };
  for (const t of TRACKS) { o.pts[t.id] = Math.min(25, num((x.pts || {})[t.id])); const b = (x.best || {})[t.id]; if (typeof b === 'number' && b > 1000) o.best[t.id] = b; }
  return o;
}
function mergeSum(a, b) {
  const r = { nm: a.nm || b.nm, base: a.base, col: a.col, num: a.num, races: a.races + b.races, wins: a.wins + b.wins, med: [0, 1, 2].map(i => a.med[i] + b.med[i]), pts: {}, best: {} };
  for (const t of TRACKS) { r.pts[t.id] = Math.max(a.pts[t.id] || 0, b.pts[t.id] || 0); const x = a.best[t.id], y = b.best[t.id]; if (x || y) r.best[t.id] = x && y ? Math.min(x, y) : x || y; }
  return r;
}
function standings() {
  const groups = new Map();
  const add = (uid, key, r) => { r = cleanRec(r); const gk = r.base !== 'custom' ? r.base : (key.startsWith('u_') ? key : uid + ':' + key); const cur = groups.get(gk); groups.set(gk, cur ? mergeSum(cur, r) : r); };
  const src = st.all || { me: st.mine };
  for (const uid in src) { const ps = (src[uid] || {}).pilots || {}; for (const k in ps) add(uid, k, ps[k]); }
  if (st.all && st.uid && !st.all[st.uid]) for (const k in st.mine.pilots) add(st.uid, k, st.mine.pilots[k]);
  return [...groups.values()].map(r => { r.total = TRACKS.reduce((s, t) => s + (r.pts[t.id] || 0), 0); if (r.base !== 'custom') r.nm = PILOTS[r.base].name; return r; }).filter(r => r.races > 0);
}

/* ---------- routing ---------- */
const VIEWS = ['home', 'pilots', 'garage', 'race', 'table', 'profile'];
function route() {
  let v = location.hash.slice(1); if (!VIEWS.includes(v)) v = 'home';
  $$('.view').forEach(e => e.classList.toggle('on', e.id === 'v-' + v));
  $$('.nav a').forEach(a => a.classList.toggle('on', a.dataset.v === v));
  $('#nav').classList.remove('open'); $('#burger').setAttribute('aria-expanded', 'false');
  window.scrollTo(0, 0);
  $$('#gnav a').forEach(x => x.classList.toggle('on', x.dataset.v === v));
  if (v === 'home') startLobby(); else stopLobby();
  if (v === 'garage') startGarage(); else stopGarage();
  if (v === 'pilots') renderPilot();
  if (v === 'race') renderLobby();
  if (v === 'table') renderTable();
  if (v === 'profile') renderProfile();
  presence({ view: v });
}
addEventListener('hashchange', route);
$('#burger').addEventListener('click', e => { e.stopPropagation(); const o = $('#nav').classList.toggle('open'); $('#burger').setAttribute('aria-expanded', o); });
document.addEventListener('click', e => { if (!e.target.closest('#nav') && !e.target.closest('#burger')) $('#nav').classList.remove('open'); });

/* ---------- home city (2D miniature) ---------- */
let cityRaf = 0, homeCity = null;
function startCity() {
  if (cityRaf) return;
  const cv = $('#city'), g = cv.getContext('2d'), tr = getTrack('baku');
  if (!homeCity) {
    homeCity = { cars: [], cam: null };
    const cols = [[garage('mikail').color, garage('mikail').helmet], [garage('safura').color, garage('safura').helmet], ...BOTS.map(b => [b[2], '#fff'])];
    cols.forEach((cc, i) => { const c = newCar({ color: cc[0], helm: cc[1], skill: .78 + (i % 3) * .05, lane: (i % 3 - 1) * 20 }); const s = gridSlot(tr, 0); c.idx = (s.i - i * 60 + tr.n * 2) % tr.n; const p = tr.pts[c.idx]; c.x = p.x; c.y = p.y; c.a = tr.th[c.idx]; c.v = 250; homeCity.cars.push(c); });
  }
  let last = performance.now();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frame = now => {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const dpr = Math.min(2, devicePixelRatio || 1), W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
    if (!reduce) { for (const c of homeCity.cars) { c.steer = aiSteer(c, tr); const vt = aiSpeed(c, tr); c.gas = c.v < vt ? 1 : 0; c.brake = c.v > vt + 40 ? 1 : 0; step(c, tr, dt); } collide(homeCity.cars); }
    const lead = homeCity.cars[0], sc = Math.max(W / tr.W, H / tr.H) * 1.7;
    const tx = clamp(lead.x, W / 2 / sc, tr.W - W / 2 / sc), ty = clamp(lead.y, H / 2 / sc, tr.H - H / 2 / sc);
    if (!homeCity.cam) homeCity.cam = { x: tx, y: ty };
    homeCity.cam.x += (tx - homeCity.cam.x) * Math.min(1, dt * .8); homeCity.cam.y += (ty - homeCity.cam.y) * Math.min(1, dt * .8);
    g.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * (W / 2 - homeCity.cam.x * sc), dpr * (H / 2 - homeCity.cam.y * sc));
    drawWorld(g, tr); for (const c of homeCity.cars) drawCar(g, c);
    cityRaf = reduce ? 0 : requestAnimationFrame(frame);
  };
  cityRaf = requestAnimationFrame(frame);
}
function stopCity() { cancelAnimationFrame(cityRaf); cityRaf = 0; }

/* ---------- game lobby (3D car on turntable) ---------- */
let L3 = null;
function lobPilot() { return meKey(); }
function startLobby() {
  renderLobbyUI();
  if (!HAS3D) return;
  if (!L3) {
    const cv = $('#lob'), r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); r.setClearColor(0x000000, 0); r.shadowMap.enabled = true;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight('#ffd0d0', '#200006', .55));
    const key = new THREE.SpotLight('#ffffff', 1.4, 40, .55, .6); key.position.set(3, 10, 6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
    const rim = new THREE.PointLight('#ff2010', 1.3, 12); rim.position.set(-3, 3, -4); scene.add(rim);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(6, 64), new THREE.MeshStandardMaterial({ color: '#141416', metalness: .25, roughness: .5 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const ringM = new THREE.MeshBasicMaterial({ color: '#ff1a10' });
    for (const [r0, y] of [[3.4, .01], [4.6, .01]]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(r0, .025, 6, 120), ringM); ring.rotation.x = Math.PI / 2; ring.position.y = y; scene.add(ring); }
    const glow = new THREE.Mesh(new THREE.RingGeometry(3.2, 3.7, 96), new THREE.MeshBasicMaterial({ color: '#ff2a1a', transparent: true, opacity: .18, side: THREE.DoubleSide })); glow.rotation.x = -Math.PI / 2; glow.position.y = .012; scene.add(glow);
    const cam = new THREE.PerspectiveCamera(34, 1, .1, 100);
    L3 = { r, scene, cam, car: null, key: '', yaw: .9, drag: null, auto: true, raf: 0 };
    cv.addEventListener('pointerdown', e => { L3.drag = { x: e.clientX, y: L3.yaw }; L3.auto = false; });
    addEventListener('pointermove', e => { if (L3.drag) L3.yaw = L3.drag.y + (e.clientX - L3.drag.x) * .01; });
    addEventListener('pointerup', () => { if (L3.drag) { L3.drag = null; setTimeout(() => { L3.auto = true; }, 2500); } });
  }
  lobCar(); if (!GLB) loadGLB().then(g => { if (g) { L3.key = ''; lobCar(); } });
  if (!L3.raf) { const loop = () => { const { r, cam, scene } = L3, cv = r.domElement, w = cv.clientWidth, h = cv.clientHeight, pr = Math.min(2, devicePixelRatio || 1); if (cv.width !== Math.round(w * pr) || cv.height !== Math.round(h * pr)) { r.setPixelRatio(pr); r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); } if (L3.auto) L3.yaw += .0035; if (L3.car) L3.car.rotation.y = L3.yaw; const port = w / h < 1.25; cam.fov = port ? 40 : 30; cam.updateProjectionMatrix(); if (port) { cam.position.set(0, 4.2, 14); cam.lookAt(0, -1.4, 0); } else { cam.position.set(1.5, 3.2, 11); cam.lookAt(1.8, .2, 0); } r.render(scene, cam); L3.raf = requestAnimationFrame(loop); }; L3.raf = requestAnimationFrame(loop); }
}
function stopLobby() { if (L3 && L3.raf) { cancelAnimationFrame(L3.raf); L3.raf = 0; } }
function lobCar() {
  if (!L3) return; const pk = lobPilot(), g = garage(pk); if (CARS.find(c => c.id === g.model && c.url) && !XM[g.model]) loadCarModel(g.model).then(() => { L3.key = ''; lobCar(); }); const k = JSON.stringify([pk, g, !!GLB, !!XM[g.model]]); if (k === L3.key) return; L3.key = k;
  if (L3.car) L3.scene.remove(L3.car);
  L3.car = makeCar3D({ model: g.model, color: g.color, color2: g.color2, pattern: g.pattern, helm: g.helmet, num: g.num, tyre: g.tyre });
  L3.car.traverse(o => { if (o.isMesh) o.castShadow = true; }); L3.car.scale.setScalar(1); L3.scene.add(L3.car);
}
function coinsOf() { const s = standings(); return s.reduce((a, r) => a + r.total * 100 + r.med[0] * 500 + r.med[1] * 300 + r.med[2] * 200 + r.races * 50, 0); }
function renderLobbyUI() {
  const pk = lobPilot(), tr = TRACKS.find(t => t.id === st.track) || TRACKS[0], mode = { clash: 'Menecer', easy: 'Sürücü · asan', pro: 'Sürücü · pro' }[st.diff] || 'Menecer';
  $('#lobPilots').innerHTML = '';
  $('#lobTrack').textContent = tr.n; $('#lobTrackName').textContent = tr.n;
  $('#lobMode').textContent = mode + ' · ' + (tr.model ? Math.max(1, Math.round(st.laps / 2)) : st.laps) + ' dövrə';
  const cv = $('#lobThumb'); requestAnimationFrame(() => thumb(cv, getTrack(tr.id)));
  updTop();
}
function updTop() {
  const pk = lobPilot(), s = standings(), r = myStats();
  $('#gAva').src = avOf(ME); $('#gName').textContent = ME ? ME.name : 'Qonaq';
  $('#gLvl').textContent = 'Səviyyə ' + (1 + Math.floor(r.races / 3));
  $('#gCoin').textContent = coinsOf().toLocaleString('az'); $('#gStar').textContent = s.reduce((a, x) => a + x.total, 0);
}

$('#lobGo').addEventListener('click', () => { audioInit(); if (st.diff === 'clash') { const others = st.peers.filter(p => !p.sameTab && p.presence && p.presence.trk === st.track && p.presence.st === 'lobby').length; if (!others) { showPrerace(); return; } } startRace(Date.now() + 3400, st.laps); });
$('#gSnd').addEventListener('click', () => { audioInit(); setMute(!MUTE); $('#gSnd').classList.toggle('off', MUTE); });
function renderHome() {
  const s = standings().sort((a, b) => b.total - a.total || b.wins - a.wins);
  $('#s-lead').textContent = s[0] ? s[0].nm + ' · ' + s[0].total : '—';
  $('#s-races').textContent = s.reduce((a, r) => a + r.races, 0);
  $('#s-gold').textContent = s.reduce((a, r) => a + r.med[0], 0);
  $$('[data-num]').forEach(e => e.textContent = garage(e.dataset.num).num);
  if ($('#gCoin')) updTop();
}

/* ---------- pilots ---------- */
let pview = 'mikail';
$$('.pcard').forEach(a => a.addEventListener('click', () => { pview = a.dataset.p; }));
$('#ptabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { pview = b.dataset.p; renderPilot(); } });
function countUp(el, to) { const t0 = performance.now(), d = 1600; const tick = n => { const t = Math.min(1, (n - t0) / d), e = 1 - (1 - t) ** 3; el.textContent = Math.round(to * e); if (t < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
function renderPilot() {
  const p = PILOTS[pview], g = garage(pview);
  $$('#ptabs button').forEach(b => b.classList.toggle('on', b.dataset.p === pview));
  const v = $('#pvid'); if (v.getAttribute('src') !== p.video) { v.src = p.video; v.poster = p.poster; v.play().catch(() => {}); }
  const nm = $('#pname'); nm.textContent = p.name; nm.classList.remove('reveal'); void nm.offsetWidth; nm.classList.add('reveal');
  $('#pnum').textContent = g.num; $('#pcar').textContent = '#' + g.num;
  const r = standings().find(x => x.base === pview) || { total: 0, wins: 0, races: 0, med: [0, 0, 0], best: {} };
  countUp($('#n-pts'), r.total); countUp($('#n-win'), r.wins); countUp($('#n-race'), r.races);
  const bests = Object.values(r.best).filter(Boolean); $('#n-lap').textContent = bests.length ? (Math.min(...bests) / 1000).toFixed(1) + 's' : '—';
  $('#pmed').innerHTML = ['Qızıl', 'Gümüş', 'Bürünc'].map((n, i) => `<div class="medal"><span class="disc d${i + 1}">${i + 1}</span>${r.med[i]} ${n}</div>`).join('');
}
$('#p-race').addEventListener('click', () => { st.pilot = pview; LS.set('pilot', pview); location.hash = 'race'; });

/* =====================================================================
   3D: livery, car model, world
   ===================================================================== */
const HAS3D = typeof THREE !== 'undefined';
const s6 = .0067, P = (x, y) => [(369 - x) * s6, (216 - y) * s6 + .12];
const BODY = [[36,200],[120,186],[230,176],[290,160],[318,128],[360,104],[410,104],[446,128],[560,146],[650,160],[700,176],[702,206],[560,212],[250,212],[60,210]].map(p => P(...p));
const POD = [[300,210],[318,172],[470,162],[600,174],[622,210]].map(p => P(...p));
function paintLivery(g, o, W, H) {
  g.fillStyle = o.color; g.fillRect(0, 0, W, H);
  const c2 = o.color2 || '#fff', pat = o.pattern || 'solid';
  if (pat === 'solid') { g.fillStyle = c2; g.fillRect(0, H * .52, W, H * .035); }
  else if (pat === 'stripe') { g.fillStyle = c2; g.fillRect(0, H * .42, W, H * .16); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, H * .40, W, H * .02); g.fillRect(0, H * .58, W, H * .02); }
  else if (pat === 'twotone') { g.fillStyle = c2; g.beginPath(); g.moveTo(0, H); g.lineTo(0, H * .62); g.lineTo(W, H * .38); g.lineTo(W, H); g.fill(); }
  else if (pat === 'flame') { const R = rng(7); for (let k = 0; k < 7; k++) { const y0 = H * (.25 + k * .1), len = W * (.35 + R() * .3); g.fillStyle = k % 2 ? '#ffd23f' : c2; g.beginPath(); g.moveTo(W, y0 - H * .07); g.bezierCurveTo(W - len * .4, y0 - H * .12, W - len * .7, y0 + H * .02, W - len, y0 - H * .04); g.bezierCurveTo(W - len * .7, y0 + H * .1, W - len * .3, y0 + H * .1, W, y0 + H * .07); g.fill(); } }
  else if (pat === 'stars') { const R = rng(3); g.fillStyle = c2; for (let k = 0; k < 26; k++) { const x = R() * W, y = H * (.2 + R() * .65), r = H * (.03 + R() * .04); g.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rad = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); } g.fill(); } }
  else if (pat === 'flag') { g.fillStyle = '#00b5e2'; g.fillRect(0, 0, W, H * .45); g.fillStyle = '#ef3340'; g.fillRect(0, H * .45, W, H * .2); g.fillStyle = '#509e2f'; g.fillRect(0, H * .65, W, H * .35); const cx = W * .38, cy = H * .55; g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, H * .075, 0, 7); g.fill(); g.fillStyle = '#ef3340'; g.beginPath(); g.arc(cx + H * .02, cy, H * .06, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, rad = i % 2 ? H * .018 : H * .04; g.lineTo(cx + H * .09 + Math.cos(a) * rad, cy + Math.sin(a) * rad); } g.fill(); }
  const sh = g.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(255,255,255,.28)'); sh.addColorStop(.45, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = sh; g.fillRect(0, 0, W, H);
}
function liveryThumb(o) {
  const c = document.createElement('canvas'); c.width = 320; c.height = 96; const g = c.getContext('2d');
  const sx = 320 / 4.8, map = ([x, y]) => [(x + 2.4) * sx, 96 - y * sx - 4];
  const tex = document.createElement('canvas'); tex.width = 512; tex.height = 128; paintLivery(tex.getContext('2d'), o, 512, 128);
  g.save(); g.beginPath(); BODY.forEach((p, i) => { const q = map(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); POD.forEach((p, i) => { const q = map(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.clip('nonzero');
  g.drawImage(tex, (-2.3 + 2.4) * sx, 96 - .9 * sx - 4, 4.6 * sx, .9 * sx); g.restore();
  g.fillStyle = '#111'; for (const [wx, r] of [[1.2, .32], [-1.57, .35]]) { const q = map([wx, r]); g.beginPath(); g.arc(q[0], q[1], r * sx, 0, 7); g.fill(); g.fillStyle = TYRES[o.tyre || 'soft'].c; g.beginPath(); g.arc(q[0], q[1], r * sx * .82, 0, 7); g.fill(); g.fillStyle = '#333'; g.beginPath(); g.arc(q[0], q[1], r * sx * .7, 0, 7); g.fill(); g.fillStyle = '#111'; }
  return c.toDataURL();
}
let GEO = null;
function geos() {
  if (GEO) return GEO;
  const shp = pts => { const s = new THREE.Shape(); pts.forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.closePath(); return s; };
  const body = new THREE.ExtrudeGeometry(shp(BODY), { depth: .62, bevelEnabled: true, bevelThickness: .06, bevelSize: .04, bevelSegments: 2, curveSegments: 4 }); body.translate(0, 0, -.31);
  const pod = new THREE.ExtrudeGeometry(shp(POD), { depth: 1.26, bevelEnabled: true, bevelThickness: .08, bevelSize: .05, bevelSegments: 3, curveSegments: 4 }); pod.translate(0, 0, -.63);
  const tyreF = new THREE.CylinderGeometry(.32, .32, .34, 22); tyreF.rotateX(Math.PI / 2);
  const tyreR = new THREE.CylinderGeometry(.35, .35, .42, 22); tyreR.rotateX(Math.PI / 2);
  const rimF = new THREE.CylinderGeometry(.2, .2, .36, 14); rimF.rotateX(Math.PI / 2);
  const rimR = new THREE.CylinderGeometry(.22, .22, .44, 14); rimR.rotateX(Math.PI / 2);
  const ring = new THREE.TorusGeometry(.26, .02, 6, 26);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const halo = new THREE.TorusGeometry(.26, .03, 6, 20); halo.rotateX(Math.PI / 2); halo.scale(1.35, 1, 1);
  const helm = new THREE.SphereGeometry(.15, 16, 12);
  return GEO = { body, pod, tyreF, tyreR, rimF, rimR, ring, box, halo, helm };
}

/* ---------- real 3D car model (GLB) ---------- */
let GLB = null, CLS = null, BLD = null, KRF = null, TREES = null, glbP = null;
function loadOne(urls, prep) {
  return new Promise(res => { const tryLoad = i => { if (i >= urls.length) return res(null); new THREE.GLTFLoader().load(urls[i], g => { let r = null; try { r = prep(g.scene); } catch (e) { r = null; } res(r); }, undefined, () => tryLoad(i + 1)); }; tryLoad(0); });
}
function loadGLB() {
  if (glbP) return glbP;
  if (!HAS3D || !THREE.GLTFLoader) return glbP = Promise.resolve(null);
  glbP = Promise.all([
    loadOne(['media/car.glb'], prepGLB).then(g => GLB = g),
    loadOne(['media/classic.glb'], prepClassic).then(g => CLS = g),
    loadOne(['media/city.glb'], prepCity).then(g => BLD = g),
    Promise.all([loadOne(['media/pine.glb'], m => prepTree(m, 1)), loadOne(['media/palm.glb'], m => prepTree(m, 1)), loadOne(['media/leaf.glb'], m => prepTree(m, 3))]).then(([pi, pa, le]) => { if (pi && pa && le) TREES = { pine: pi, palm: pa, leaf: le }; })
  ]).then(() => GLB);
  return glbP;
}
function toFloat(src) {
  const idx = src.index, cnt = idx ? idx.count : src.attributes.position.count, g = new THREE.BufferGeometry();
  for (const [k, n] of [['position', 3], ['normal', 3], ['uv', 2]]) {
    const at = src.attributes[k]; if (!at) continue; const arr = new Float32Array(cnt * n), A = at.isInterleavedBufferAttribute ? at.data.array : at.array;
    const f = at.normalized ? (A instanceof Int8Array ? 1 / 127 : A instanceof Uint8Array ? 1 / 255 : A instanceof Int16Array ? 1 / 32767 : A instanceof Uint16Array ? 1 / 65535 : 1) : 1;
    for (let t = 0; t < cnt; t++) { const i = idx ? idx.getX(t) : t; arr[t * n] = at.getX(i) * f; if (n > 1) arr[t * n + 1] = at.getY(i) * f; if (n > 2) arr[t * n + 2] = at.getZ(i) * f; }
    if (k === 'normal' && f !== 1) for (let q = 0; q < arr.length; q += 3) { const l = Math.hypot(arr[q], arr[q + 1], arr[q + 2]) || 1; arr[q] /= l; arr[q + 1] /= l; arr[q + 2] /= l; }
    g.setAttribute(k, new THREE.Float32BufferAttribute(arr, n));
  }
  return g;
}
let krfP = null;
function loadKRF() { if (krfP) return krfP; if (!HAS3D || !THREE.GLTFLoader) return krfP = Promise.resolve(null); return krfP = loadOne(['media/korfez.glb'], m => { m.traverse(o => { if (o.isMesh && o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(x => { if (x.map) { x.emissive = new THREE.Color('#ffffff'); x.emissiveMap = x.map; x.emissiveIntensity = .45; } }); } }); return m; }).then(m => KRF = m); }
function prepTree(m, split) {
  m.updateMatrixWorld(true);
  const raw = []; m.traverse(o => { if (o.isMesh) { const g = toFloat(o.geometry); g.applyMatrix4(o.matrixWorld); const mat = o.material; mat.side = THREE.DoubleSide; mat.alphaTest = mat.alphaTest || (mat.transparent || mat.alphaTest ? .4 : 0); if (/^leaf$/i.test(mat.name)) { mat.alphaTest = .2; mat.transparent = false; mat.color.setRGB(1.75, 2.25, 1.35); mat.roughness = .8; } else if (/leaf|tree_1|branch/i.test(mat.name)) { mat.alphaTest = .3; mat.transparent = false; mat.color.multiplyScalar(1.5); } raw.push({ g, mat }); } });
  const cx = g => { const p = g.attributes.position.array, out = new Float32Array(p.length / 9); for (let t = 0; t < out.length; t++) out[t] = (p[t * 9] + p[t * 9 + 3] + p[t * 9 + 6]) / 3; return out; };
  let centers = [0];
  if (split > 1) { const all = []; raw.forEach(r => all.push(...cx(r.g))); all.sort((x, y) => x - y); centers = Array.from({ length: split }, (_, k) => all[Math.floor((k + .5) / split * all.length)]); for (let it = 0; it < 8; it++) { const s = centers.map(() => [0, 0]); for (const v of all) { let bi = 0; for (let k = 1; k < split; k++) if (Math.abs(v - centers[k]) < Math.abs(v - centers[bi])) bi = k; s[bi][0] += v; s[bi][1]++; } centers = s.map((q, k) => q[1] ? q[0] / q[1] : centers[k]); } }
  const variants = centers.map(() => []);
  for (const r of raw) {
    const c = cx(r.g), P = r.g.attributes.position.array, N = r.g.attributes.normal && r.g.attributes.normal.array, T = r.g.attributes.uv && r.g.attributes.uv.array;
    centers.forEach((cc, k) => {
      const sel = []; for (let t = 0; t < c.length; t++) { let bi = 0; for (let q = 1; q < centers.length; q++) if (Math.abs(c[t] - centers[q]) < Math.abs(c[t] - centers[bi])) bi = q; if (bi === k) sel.push(t); }
      if (!sel.length) return; const g = new THREE.BufferGeometry(), pp = new Float32Array(sel.length * 9), nn = new Float32Array(sel.length * 9), uu = new Float32Array(sel.length * 6);
      sel.forEach((t, i) => { pp.set(P.subarray(t * 9, t * 9 + 9), i * 9); if (N) nn.set(N.subarray(t * 9, t * 9 + 9), i * 9); if (T) uu.set(T.subarray(t * 6, t * 6 + 6), i * 6); });
      g.setAttribute('position', new THREE.BufferAttribute(pp, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nn, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uu, 2)); if (!N) g.computeVertexNormals();
      variants[k].push({ g, mat: r.mat });
    });
  }
  return variants.filter(v => v.length).map(parts => { const b = new THREE.Box3(); parts.forEach(p => { p.g.computeBoundingBox(); b.union(p.g.boundingBox); }); const c = b.getCenter(new THREE.Vector3()), h = b.max.y - b.min.y; parts.forEach(p => { p.g.translate(-c.x, -b.min.y, -c.z); p.g.scale(1 / h, 1 / h, 1 / h); }); return parts; });
}
function prepCity(m) {
  m.updateMatrixWorld(true);
  const root = m.getObjectByName('RootNode') || m, protos = [];
  const BU = THREE.BufferGeometryUtils;
  for (const ch of root.children) {
    const b = new THREE.Box3().setFromObject(ch); if (b.isEmpty()) continue;
    const sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const byMat = new Map(), inv = new THREE.Matrix4().makeTranslation(-c.x, -b.min.y, -c.z);
    ch.traverse(o => { if (!o.isMesh) return; const g = toFloat(o.geometry); g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld)); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k); if (!g.attributes.normal) g.computeVertexNormals(); if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2)); const gi = g; const k = o.material.uuid; if (!byMat.has(k)) byMat.set(k, { mat: o.material, gs: [] }); byMat.get(k).gs.push(gi); });
    const parts = []; for (const { mat, gs } of byMat.values()) { const g = BU && gs.length > 1 ? BU.mergeBufferGeometries(gs) : gs[0]; if (!g) continue; mat.side = THREE.FrontSide; parts.push({ g, mat }); }
    protos.push({ name: ch.name, w: sz.x, d: sz.z, h: sz.y, parts });
  }
  return protos.length ? protos : null;
}
function prepClassic(m) {
  m.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(m), L = box.max.x - box.min.x, S = 4.8 / L, cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2;
  const meshes = []; m.traverse(o => { if (o.isMesh) meshes.push(o); });
  const tyres = meshes.filter(o => o.material.name === 'tyre');
  const wheels = [];
  tyres.forEach((t, i) => {
    const b = new THREE.Box3().setFromObject(t), c = b.getCenter(new THREE.Vector3()), r = (b.max.y - b.min.y) / 2;
    const parts = meshes.filter(o => { if (o === t) return true; if (o.material.name === 'tyre' || o.material.name === 'body') return false; const bb = new THREE.Box3().setFromObject(o), cc = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3()); return Math.hypot(cc.x - c.x, cc.y - c.y) < r * .9 && Math.abs(cc.z - c.z) < .45 && Math.max(sz.x, sz.y) < r * 2.3; });
    const steer = new THREE.Group(), spin = new THREE.Group(); steer.name = 'csteer' + i; spin.name = 'cspin' + i;
    steer.position.copy(c); steer.add(spin); m.add(steer); parts.forEach(p => spin.attach(p));
    wheels.push({ i, front: c.x < cx, r, x: -(c.x - cx) * S, z: -(c.z - cz) * S });
  });
  return { scene: m, S, cx, cz, minY: box.min.y, wheels, classic: true };
}
function prepGLB(m) {
  m.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(m), L = box.max.z - box.min.z, S = 4.8 / L, cz = (box.min.z + box.max.z) / 2;
  const tyres = {}, imgs = {};
  m.traverse(o => { if (o.isMesh) { const n = o.material.name; if ((n === 'racecar_1_TGA' || n === 'racecar_2_TGA' || n === 'tyre.001') && o.material.map) imgs[n] = o.material.map; } });
  const wheels = [];
  for (const [name, front] of [['tires.003_1', false], ['tires.002_2', true], ['tires.001_3', true]]) {
    const t = m.getObjectByName(name); if (!t) continue;
    const b = new THREE.Box3().setFromObject(t), c = b.getCenter(new THREE.Vector3()), r = (b.max.y - b.min.y) / 2;
    const steer = new THREE.Group(), spin = new THREE.Group(); steer.name = 'steer_' + name; spin.name = 'spin_' + name;
    steer.position.copy(c); steer.add(spin); m.add(steer); spin.attach(t);
    wheels.push({ name, front, r, x: (c.z - cz) * S, z: -c.x * S });
  }
  return { scene: m, S, cz, minY: box.min.y, imgs, wheels };
}
const RECOL = {};
function recolor(tex, c1, c2) {
  const key = tex.uuid + c1 + c2; if (RECOL[key]) return RECOL[key];
  const img = tex.image, w = img.width, h = img.height, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0); const id = g.getImageData(0, 0, w, h), d = id.data;
  const A = new THREE.Color(c1), B = new THREE.Color(c2), a1 = [A.r * 255, A.g * 255, A.b * 255], b1 = [B.r * 255, B.g * 255, B.b * 255];
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], gg = d[i + 1], b = d[i + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), v = mx / 255, s = mx ? (mx - mn) / mx : 0;
    let hue = 0; if (mx !== mn) { if (mx === r) hue = 60 * (((gg - b) / (mx - mn)) % 6); else if (mx === gg) hue = 60 * ((b - r) / (mx - mn) + 2); else hue = 60 * ((r - gg) / (mx - mn) + 4); if (hue < 0) hue += 360; }
    const hw = hue >= 18 && hue <= 52 ? 1 : hue >= 10 && hue < 18 ? (hue - 10) / 8 : hue > 52 && hue <= 60 ? (60 - hue) / 8 : 0;
    let w1 = clamp((s - .3) / .15, 0, 1) * hw, w2 = (1 - clamp((s - .1) / .12, 0, 1)) * clamp((v - .45) / .15, 0, 1);
    w1 = Math.min(w1, 1 - w2); const w0 = 1 - w1 - w2, vs = Math.min(1, v / .94);
    for (let k = 0; k < 3; k++) d[i + k] = d[i + k] * w0 + a1[k] * v * w1 + b1[k] * vs * w2;
  }
  g.putImageData(id, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.flipY = tex.flipY; t.wrapS = tex.wrapS; t.wrapT = tex.wrapT; t.anisotropy = 4;
  return RECOL[key] = t;
}
function tyreTex(tex, comp) {
  const key = tex.uuid + comp; if (RECOL[key]) return RECOL[key];
  const img = tex.image, w = img.width, cv = document.createElement('canvas'); cv.width = w; cv.height = img.height;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0); g.strokeStyle = TYRES[comp].c; g.lineWidth = w * .016; g.beginPath(); g.arc(w / 2, img.height / 2, w * .41, 0, 7); g.stroke();
  g.font = '700 ' + (w * .045 | 0) + 'px "Titillium Web",sans-serif'; g.fillStyle = TYRES[comp].c; g.textAlign = 'center';
  for (const a of [0, Math.PI]) { g.save(); g.translate(w / 2, img.height / 2); g.rotate(a); g.fillText('MİNİ F1 · ' + TYRES[comp].n.toUpperCase(), 0, -w * .36); g.restore(); }
  const t = new THREE.CanvasTexture(cv); t.flipY = tex.flipY; t.wrapS = tex.wrapS; t.wrapT = tex.wrapT; t.anisotropy = 4;
  return RECOL[key] = t;
}
function plateTex(c1, num) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = c1; g.fillRect(0, 0, 128, 128); g.font = 'italic 900 70px "Titillium Web",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 8; g.strokeStyle = '#111'; g.strokeText(String(num), 64, 68); g.fillStyle = '#fff'; g.fillText(String(num), 64, 68);
  const t = new THREE.CanvasTexture(c); t.flipY = false; return t;
}
function carExtras(root, c1, c2, wheelsInfo) {
  const add = (geo, mat, x, y, z, sx, sy, sz, parent) => { const q = new THREE.Mesh(geo, mat); q.position.set(x, y, z); q.scale.set(sx, sy, sz); (parent || root).add(q); return q; };
  const box = new THREE.BoxGeometry(1, 1, 1);
  const eng = new THREE.Group(); root.add(eng); eng.visible = false;
  add(box, new THREE.MeshStandardMaterial({ color: '#edb40b', metalness: .8, roughness: .25, emissive: '#5a4100' }), -1.0, .5, 0, 1.0, .32, .44, eng);
  for (let k = 0; k < 3; k++) add(box, new THREE.MeshStandardMaterial({ color: '#7a5800', metalness: .8 }), -1.3 + k * .3, .72, 0, .16, .12, .34, eng);
  const bat = new THREE.Group(); root.add(bat); bat.visible = false;
  add(box, new THREE.MeshStandardMaterial({ color: '#edff39', emissive: '#4c5a00' }), -.1, .32, 0, .9, .16, .55, bat);
  const crew = new THREE.Group(); crew.visible = false; root.add(crew);
  const suit = new THREE.MeshStandardMaterial({ color: c2 !== '#ffffff' ? c2 : '#1b1c21', roughness: .7 }), head = new THREE.MeshStandardMaterial({ color: c1, roughness: .4 });
  const fx = Math.max(...wheelsInfo.map(w => w.x)), rx = Math.min(...wheelsInfo.map(w => w.x));
  for (const [x, z] of [[fx, 1.55], [fx, -1.55], [rx, 1.6], [rx, -1.6], [3.0, 0], [-3.0, 0]]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, .9, 8), suit); b.position.set(x, .45, z); b.castShadow = true; crew.add(b); const hd = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), head); hd.position.set(x, 1.03, z); crew.add(hd); }
  return { eng, bat, crew };
}
function roundel(num, c2) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = c2 === '#ffffff' ? '#111' : c2; g.stroke();
  g.font = 'italic 900 64px "Titillium Web",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#111'; g.fillText(String(num), 64, 68);
  return new THREE.CanvasTexture(c);
}
function makeClassicCar(o) {
  const G = CLS, car = new THREE.Group(), root = new THREE.Group(); car.add(root);
  const m = G.scene.clone(true), wrap = new THREE.Group(); wrap.add(m); root.add(wrap);
  wrap.rotation.y = Math.PI; wrap.scale.setScalar(G.S); wrap.position.set(G.cx * G.S, -G.minY * G.S, G.cz * G.S);
  const c1 = o.color || '#e10600', c2 = o.color2 || '#ffffff', bodyMats = [];
  const body = new THREE.MeshStandardMaterial({ color: c1, metalness: .45, roughness: .28 }); bodyMats.push(body);
  const chrome = new THREE.MeshStandardMaterial({ color: '#c9ccd2', metalness: .9, roughness: .22 });
  m.traverse(x => { if (!x.isMesh) return; x.castShadow = true; const n = x.material.name; if (n === 'body') x.material = body; else if (n === 'rim' || n === 'None') x.material = chrome; });
  // driver helmet + stripe + roundels (model coords)
  const helm = new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 12), new THREE.MeshStandardMaterial({ color: o.helm || '#ffffff', metalness: .4, roughness: .25 })); helm.position.set(-1.3, 1.92, G.cz); m.add(helm);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(.05, .08, .26), new THREE.MeshStandardMaterial({ color: '#0b0d12', metalness: .8, roughness: .15 })); visor.position.set(-1.49, 1.93, G.cz); m.add(visor);
  const rt = roundel(o.num || 0, c2), rm = new THREE.MeshBasicMaterial({ map: rt, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 });
  for (const [x, y, z, ry] of [[-2.6, 1.32, .06, Math.PI], [-2.6, 1.32, 1.42, 0]]) { const p = new THREE.Mesh(new THREE.CircleGeometry(.26, 24), rm); p.position.set(x, y, z); p.rotation.y = ry; m.add(p); }
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.2, .02, .22), new THREE.MeshStandardMaterial({ color: c2, metalness: .3, roughness: .3 })); stripe.position.set(-3.2, 1.585, G.cz); stripe.scale.set(.78, 1, 1); stripe.rotation.z = .1; m.add(stripe); bodyMats.push(stripe.material);
  const wheels = G.wheels.map(w => ({ piv: m.getObjectByName('csteer' + w.i), spin: m.getObjectByName('cspin' + w.i), front: w.front, r: w.r * G.S, cls: true }));
  const ex = carExtras(root, c1, c2, G.wheels);
  car.userData = { wheels, bodyMats, eng: ex.eng, bat: ex.bat, root, crew: ex.crew };
  return car;
}
function makeGLBCar(o) {
  const G = GLB, car = new THREE.Group(), root = new THREE.Group(); car.add(root);
  const m = G.scene.clone(true), wrap = new THREE.Group(); wrap.add(m); root.add(wrap);
  wrap.rotation.y = Math.PI / 2; wrap.scale.setScalar(G.S); wrap.position.set(-G.cz * G.S, -G.minY * G.S, 0);
  const c1 = o.color || '#e10600', c2 = o.color2 || '#ffffff', bodyMats = [], cache = {};
  m.traverse(x => {
    if (!x.isMesh) return; x.castShadow = true;
    const n = x.material.name;
    if (cache[n]) { x.material = cache[n]; return; }
    let mat = null;
    if (n === 'racecar_1_TGA' || n === 'racecar_2_TGA') { mat = x.material.clone(); mat.map = recolor(G.imgs[n], c1, c2); mat.metalness = .25; mat.roughness = .35; bodyMats.push(mat); }
    else if (n === 'racecar_3_TGA') { mat = x.material.clone(); mat.map = plateTex(c1, o.num || 0); bodyMats.push(mat); }
    else if (n === 'tyre.001' && G.imgs[n]) { mat = x.material.clone(); mat.map = tyreTex(G.imgs[n], o.tyre || 'soft'); }
    else if (n === 'Default_Material.008') { mat = x.material.clone(); mat.color.set(o.helm || '#ffffff'); }
    else if (n === 'COCKPIT_DAMAGE_TGA.001' || n === 'racecar_carb_tga') { mat = x.material.clone(); bodyMats.push(mat); }
    if (mat) { cache[n] = mat; x.material = mat; }
  });
  const wheels = G.wheels.map(w => ({ piv: m.getObjectByName('steer_' + w.name), spin: m.getObjectByName('spin_' + w.name), front: w.front, r: w.r * G.S, glb: true }));
  const add = (geo, mat, x, y, z, sx, sy, sz, parent) => { const q = new THREE.Mesh(geo, mat); q.position.set(x, y, z); q.scale.set(sx, sy, sz); (parent || root).add(q); return q; };
  const box = new THREE.BoxGeometry(1, 1, 1);
  const eng = new THREE.Group(); root.add(eng); eng.visible = false;
  add(box, new THREE.MeshStandardMaterial({ color: '#edb40b', metalness: .8, roughness: .25, emissive: '#5a4100' }), -1.0, .5, 0, 1.0, .32, .44, eng);
  for (let k = 0; k < 3; k++) add(box, new THREE.MeshStandardMaterial({ color: '#7a5800', metalness: .8 }), -1.3 + k * .3, .72, 0, .16, .12, .34, eng);
  const bat = new THREE.Group(); root.add(bat); bat.visible = false;
  add(box, new THREE.MeshStandardMaterial({ color: '#edff39', emissive: '#4c5a00' }), -.1, .32, 0, .9, .16, .55, bat);
  const crew = new THREE.Group(); crew.visible = false; root.add(crew);
  const suit = new THREE.MeshStandardMaterial({ color: c2 !== '#ffffff' ? c2 : '#1b1c21', roughness: .7 }), head = new THREE.MeshStandardMaterial({ color: c1, roughness: .4 });
  const fx = Math.max(...G.wheels.map(w => w.x)), rx = Math.min(...G.wheels.map(w => w.x));
  for (const [x, z] of [[fx, 1.55], [fx, -1.55], [rx, 1.6], [rx, -1.6], [3.0, 0], [-3.0, 0]]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, .9, 8), suit); b.position.set(x, .45, z); b.castShadow = true; crew.add(b); const hd = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), head); hd.position.set(x, 1.03, z); crew.add(hd); }
  car.userData = { wheels, bodyMats, eng, bat, root, crew };
  return car;
}
function numTex(n) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.font = 'italic 900 96px "Titillium Web",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = '#111'; g.strokeText(String(n), 64, 68); g.fillStyle = '#fff'; g.fillText(String(n), 64, 68); const t = new THREE.CanvasTexture(c); return t; }

/* ---------- extra car models ---------- */
const CARS = [
  { id: 'modern', n: 'Müasir', d: 'Qanadlı 2000-ci illər F1 bolidi' },
  { id: 'f2019', n: 'Qırmızı Ox', d: '2019 tipli müasir F1 bolidi', url: ['media/f2019.glb'], nose: '+z', recolor: 'red' },
  { id: 'r26', n: 'Qanadlı V8', d: '2006-cı ilin çempion tipli bolidi', url: ['media/r26O.glb'], nose: '+z', recolor: 'flat', flat: [[/^WCCARBODY|^WCWING|^WCEXTRA0/, 'c1'], [/^side/, '#151517'], [/^RENRIM|^RENSPOKES/, '#2c2d31'], [/^brake/, '#2a2a2a']] },
  { id: 'classic', n: 'Klassik', d: '1960-cı illərin siqar formalı bolidi' },
  { id: 'lotus49', n: 'Əfsanə 49', d: '1969-cu ilin qanadlı əfsanəsi', url: ['media/lotus49.glb'], nose: '-z', recolor: 'red' },
  { id: 's800', n: 'Retro Roadster', d: '1960-cı illərin kiçik idman maşını', url: ['media/s800O.glb'], nose: '+z', recolor: 'red' },
  { id: 'vintage', n: 'Antik Yarışçı', d: '1910-cu illərin ilk yarış maşını', url: ['media/vintO.glb'], nose: '-z', recolor: 'none' },
  { id: 'future', n: 'Gələcək', d: 'Fantastik gələcək maşını', url: ['media/future.glb'], nose: '-x', recolor: 'tint' }
];
const XM = {}, XP = {};
function loadCarModel(id) {
  const C = CARS.find(c => c.id === id); if (!C || !C.url) return Promise.resolve(null);
  if (XP[id]) return XP[id];
  return XP[id] = loadOne(C.url, m => prepGeneric(m, C)).then(r => XM[id] = r);
}
function prepGeneric(m, C) {
  m.updateMatrixWorld(true);
  const wrap = new THREE.Group(); wrap.add(m);
  wrap.rotation.y = { '+z': Math.PI / 2, '-z': -Math.PI / 2, '+x': 0, '-x': Math.PI }[C.nose] || 0;
  wrap.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(wrap), L = b.max.x - b.min.x, S = (C.len || 4.9) / L;
  const holder = new THREE.Group(); holder.add(wrap); wrap.scale.setScalar(S); holder.updateMatrixWorld(true);
  const b2 = new THREE.Box3().setFromObject(holder), c = b2.getCenter(new THREE.Vector3());
  wrap.position.set(-c.x, -b2.min.y, -c.z);
  m.traverse(o => { if (o.isMesh) { o.castShadow = true; const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(x => { if (x.map) x.map.anisotropy = 4; }); } });
  return { holder, C };
}
function recolorRed(tex, c1) {
  const key = tex.uuid + 'r' + c1; if (RECOL[key]) return RECOL[key];
  const img = tex.image, w = img.width, h = img.height, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0); const id = g.getImageData(0, 0, w, h), d = id.data, A = new THREE.Color(c1), t = [A.r * 255, A.g * 255, A.b * 255];
  for (let i = 0; i < d.length; i += 4) { const r = d[i], gg = d[i + 1], b = d[i + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b); if (mx < 40 || r !== mx) continue; const s = (mx - mn) / mx, hue = mx === mn ? 0 : 60 * (((gg - b) / (mx - mn)) % 6); const hh = hue < 0 ? hue + 360 : hue; const w1 = clamp((s - .45) / .15, 0, 1) * (hh <= 18 || hh >= 335 ? 1 : 0); if (!w1) continue; const v = mx / 255 * 1.15; for (let k = 0; k < 3; k++) d[i + k] = d[i + k] * (1 - w1) + Math.min(255, t[k] * v) * w1; }
  g.putImageData(id, 0, 0); const nt = new THREE.CanvasTexture(cv); nt.flipY = tex.flipY; nt.wrapS = tex.wrapS; nt.wrapT = tex.wrapT; nt.anisotropy = 4; return RECOL[key] = nt;
}
function makeGenericCar(o) {
  const X = XM[o.model], car = new THREE.Group(), root = new THREE.Group(); car.add(root);
  const h = X.holder.clone(true); root.add(h);
  const c1 = o.color || '#e10600', c2 = o.color2 || '#ffffff', bodyMats = [], cache = new Map();
  h.traverse(x => { if (!x.isMesh) return; x.castShadow = true; const src = x.material; if (cache.has(src)) { x.material = cache.get(src); return; } const m = src.clone(); if ('metalness' in m) { m.metalness = Math.min(m.metalness, .25); m.roughness = Math.max(m.roughness, .45); } if (m.color && m.color.getHSL({}).l < .25 && !m.map) m.color.offsetHSL(0, 0, .12); const fl = X.C.flat && X.C.flat.find(([re]) => re.test(src.name)); if (fl) { m.map = null; m.color.set(fl[1] === 'c1' ? c1 : fl[1] === 'c2' ? c2 : fl[1]); if (fl[1] === 'c1') { m.metalness = .3; m.roughness = .35; } } else if (X.C.recolor === 'red' && m.map && m.map.image) m.map = recolorRed(src.map, c1); else if (X.C.recolor === 'tint' && !/glass/i.test(m.name)) m.color.lerp(new THREE.Color(c1), .45); if (!/glass/i.test(m.name)) bodyMats.push(m); cache.set(src, m); x.material = m; });
  const ex = carExtras(root, c1, c2, [{ x: 1.5 }, { x: -1.5 }]);
  car.userData = { wheels: [], bodyMats, eng: ex.eng, bat: ex.bat, root, crew: ex.crew };
  return car;
}

/* ---------- TV helicopter (aerial camera like F1 broadcasts) ---------- */
let HELI = null, heliP = null;
function loadHeli() {
  if (heliP) return heliP;
  return heliP = loadOne(['media/chopO.glb'], m => {
    const rotors = [];
    m.updateMatrixWorld(true); m.traverse(o => { if (o.isMesh) { o.geometry = toFloat(o.geometry); o.geometry.computeBoundingSphere(); } });
    const list = []; m.traverse(o => { if (o.isMesh && /rotor/i.test(o.name + (o.parent ? o.parent.name : ''))) list.push(o); });
    for (const o of list) {
      const g = o.geometry; g.computeBoundingBox(); const bb = g.boundingBox, c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3());
      const g2 = g.clone(); g2.translate(-c.x, -c.y, -c.z); const pv = new THREE.Object3D(); pv.position.copy(c); const mm = new THREE.Mesh(g2, o.material); pv.add(mm); o.add(pv); o.geometry = new THREE.BufferGeometry();
      const ax = s.x <= s.y && s.x <= s.z ? 'x' : s.y <= s.z ? 'y' : 'z'; rotors.push({ pv, ax, main: Math.max(s.x, s.y, s.z) > 3 * Math.min(Math.max(s.x, s.y), Math.max(s.y, s.z)) ? 0 : 1, size: Math.max(s.x, s.y, s.z) });
    }
    const big = Math.max(...rotors.map(r => r.size)); rotors.forEach(r => r.main = r.size === big);
    const P = prepGeneric(m, { nose: '-z', len: 13 }); P.rotors = rotors; return P;
  }).then(r => HELI = r);
}
function heliUpdate(R, dt) {
  const H = R.heli; if (!H) return;
  const pr = c => c.done ? 1e9 - c.fin : c.lap * R.tr.L + c.idx * STEP;
  const lead = R.clash ? R.me : R.cars.reduce((x, y) => pr(y) > pr(x) ? y : x);
  const lx = lead.x * U, lz = lead.y * U, la = lead.a, t = performance.now() / 1000;
  // orbit-ish station keeping: high, to the side and a bit behind, slowly drifting around the car like a real camera ship
  const ang = la + Math.PI * .62 + Math.sin(t * .07) * .9, dist = 34 + Math.sin(t * .11) * 8;
  const tx = lx + Math.cos(ang) * dist, tz = lz + Math.sin(ang) * dist, ty = 30 + Math.sin(t * .13) * 4;
  const k = 1 - Math.exp(-dt * .9);
  const ox = H.p.x, oz = H.p.z; H.p.x += (tx - H.p.x) * k; H.p.y += (ty - H.p.y) * k; H.p.z += (tz - H.p.z) * k;
  const vx = (H.p.x - ox) / Math.max(dt, 1e-3), vz = (H.p.z - oz) / Math.max(dt, 1e-3), v = Math.hypot(vx, vz);
  if (v > 1) H.yaw += angN(Math.atan2(vz, vx) - H.yaw) * (1 - Math.exp(-dt * 1.5));
  else H.yaw += angN(Math.atan2(lz - H.p.z, lx - H.p.x) - H.yaw) * (1 - Math.exp(-dt * .8));
  const o = H.obj; o.position.set(H.p.x, H.p.y + Math.sin(t * 1.3) * .25, H.p.z); o.rotation.set(0, -H.yaw, 0);
  o.rotateZ(-clamp(v / 60, 0, .22)); o.rotateX(Math.sin(t * .9) * .03);
  for (const r of H.rotors) r.pv.rotation[r.ax] += dt * (r.main ? 34 : 70);
  // gimbal: smoothed look target with tiny operator lag
  const kl = 1 - Math.exp(-dt * 3.2); H.look.x += (lx + Math.cos(la) * 6 - H.look.x) * kl; H.look.z += (lz + Math.sin(la) * 6 - H.look.z) * kl;
  H.lead = lead;
}
function makeCar3D(o) {
  if (XM[o.model]) return makeGenericCar(o);
  if (o.model === 'classic' && CLS) return makeClassicCar(o);
  if (GLB) return makeGLBCar(o);
  const G = geos(), car = new THREE.Group(), root = new THREE.Group(); car.add(root);
  const lc = document.createElement('canvas'); lc.width = 1024; lc.height = 256; paintLivery(lc.getContext('2d'), o, 1024, 256);
  const tex = new THREE.CanvasTexture(lc); tex.repeat.set(1 / 4.6, 1 / .9); tex.offset.set(.5, 0); tex.anisotropy = 4;
  const liv = new THREE.MeshStandardMaterial({ map: tex, metalness: .35, roughness: .32 });
  const top = new THREE.MeshStandardMaterial({ color: o.color, metalness: .35, roughness: .32 });
  const carbon = new THREE.MeshStandardMaterial({ color: '#16181c', metalness: .3, roughness: .55 });
  const rubber = new THREE.MeshStandardMaterial({ color: '#141414', roughness: .92 });
  const rim = new THREE.MeshStandardMaterial({ color: '#2d3036', metalness: .85, roughness: .3 });
  const comp = new THREE.MeshStandardMaterial({ color: TYRES[o.tyre || 'soft'].c, roughness: .6 });
  const accent = new THREE.MeshStandardMaterial({ color: o.color2 || '#fff', metalness: .3, roughness: .35 });
  const bodyMats = [liv, top, accent, carbon];
  const add = (geo, mat, x, y, z, sx, sy, sz, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); if (sx) m.scale.set(sx, sy, sz); m.castShadow = true; (parent || root).add(m); return m; };
  add(G.body, [liv, top]); add(G.pod, [liv, top]);
  add(G.box, carbon, .05, .1, 0, 3.9, .05, 1.42);
  // front wing
  add(G.box, carbon, 2.12, .1, 0, .42, .05, 1.92); add(G.box, accent, 2.05, .16, 0, .26, .03, 1.8);
  for (const z of [-.95, .95]) add(G.box, carbon, 2.1, .2, z, .5, .24, .04);
  // rear wing
  add(G.box, carbon, -2.12, .98, 0, .42, .06, 1.2); add(G.box, accent, -2.2, 1.06, 0, .22, .05, 1.18);
  for (const z of [-.6, .6]) add(G.box, carbon, -2.12, .78, z, .52, .6, .04);
  add(G.box, carbon, -2.0, .7, 0, .08, .5, .08);
  // cockpit
  add(G.helm, new THREE.MeshStandardMaterial({ color: o.helm || '#fff', metalness: .4, roughness: .25 }), .1, .74, 0);
  add(G.box, new THREE.MeshStandardMaterial({ color: '#0b0d12', metalness: .8, roughness: .15 }), .22, .76, 0, .05, .06, .2);
  add(G.halo, carbon, .2, .9, 0); add(G.box, carbon, .52, .8, 0, .04, .2, .05);
  add(G.box, carbon, -.05, .86, 0, .14, .16, .2);
  // suspension arms
  for (const [x, z] of [[1.2, 1], [-1.57, 1]]) for (const sz of [-1, 1]) for (const y of [.2, .38]) add(G.box, carbon, x, y, sz * .55, .05, .025, .62);
  // wheels
  const wheels = [];
  const wheel = (x, front, z) => { const piv = new THREE.Group(); piv.position.set(x, front ? .32 : .35, z); root.add(piv); const spin = new THREE.Group(); piv.add(spin); add(front ? G.tyreF : G.tyreR, rubber, 0, 0, 0, 0, 0, 0, spin); add(front ? G.rimF : G.rimR, rim, 0, 0, 0, 0, 0, 0, spin); const r = add(G.ring, comp, 0, 0, z > 0 ? (front ? .172 : .212) : -(front ? .172 : .212), front ? 1 : 1.1, front ? 1 : 1.1, 1, spin); for (let k = 0; k < 3; k++) add(G.box, rim, 0, 0, z > 0 ? .2 : -.2, .04, front ? .36 : .4, .02, spin).rotation.z = k * Math.PI / 3; wheels.push({ piv, spin, front, r: front ? .32 : .35 }); };
  wheel(1.2, true, .86); wheel(1.2, true, -.86); wheel(-1.57, false, .88); wheel(-1.57, false, -.88);
  // number decals
  const nt = numTex(o.num || 0), nmat = new THREE.MeshBasicMaterial({ map: nt, transparent: true });
  for (const sd of [1, -1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.44, .44), nmat); m.position.set(-.62, .42, sd * .725); if (sd < 0) m.rotation.y = Math.PI; root.add(m); }
  const nose = new THREE.Mesh(new THREE.PlaneGeometry(.34, .34), nmat); nose.rotation.x = -Math.PI / 2; nose.rotation.z = Math.PI / 2; nose.position.set(1.15, .53, 0); root.add(nose);
  // xray internals
  const eng = new THREE.Group(); root.add(eng); eng.visible = false;
  add(G.box, new THREE.MeshStandardMaterial({ color: '#edb40b', metalness: .8, roughness: .25, emissive: '#5a4100' }), -.85, .48, 0, 1.0, .3, .42, eng);
  for (let k = 0; k < 3; k++) add(G.box, new THREE.MeshStandardMaterial({ color: '#7a5800', metalness: .8 }), -1.15 + k * .3, .68, 0, .16, .12, .32, eng);
  const bat = new THREE.Group(); root.add(bat); bat.visible = false;
  add(G.box, new THREE.MeshStandardMaterial({ color: '#edff39', emissive: '#4c5a00' }), .02, .3, 0, .9, .16, .5, bat);
  const crew = new THREE.Group(); crew.visible = false; root.add(crew);
  const suit = new THREE.MeshStandardMaterial({ color: o.color2 && o.color2 !== '#ffffff' ? o.color2 : '#1b1c21', roughness: .7 }), head = new THREE.MeshStandardMaterial({ color: o.color, roughness: .4 });
  for (const [x, z] of [[1.2, 1.5], [1.2, -1.5], [-1.57, 1.55], [-1.57, -1.55], [2.9, 0], [-2.9, 0]]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, .9, 8), suit); b.position.set(x, .45, z); b.castShadow = true; crew.add(b); const h = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), head); h.position.set(x, 1.03, z); crew.add(h); }
  car.userData = { wheels, bodyMats, eng, bat, root, crew };
  return car;
}
function setXray(car, mode) {
  const u = car.userData; u.eng.visible = mode === 'eng'; u.bat.visible = mode === 'ers';
  for (const m of u.bodyMats) { m.transparent = !!mode; m.opacity = mode ? .16 : 1; m.depthWrite = !mode; m.needsUpdate = true; }
}
function animCar(car, c, dt) {
  const u = car.userData;
  car.position.set(c.x * U, 0, c.y * U); car.rotation.y = -c.a;
  for (const w of u.wheels) { if (!w.spin) continue; if (w.glb) w.spin.rotation.x += c.v * U * dt / w.r; else if (w.cls) w.spin.rotation.z += c.v * U * dt / w.r; else w.spin.rotation.z -= c.v * U * dt / w.r; if (w.front) w.piv.rotation.y = -c.steer * .32; }
  u.root.rotation.x = clamp(-c.steer * c.v / TOP * .03, -.03, .03);
  u.crew.visible = !!(c.pit && c.pit.ph === 'stop');
  if (u.crew.visible) u.crew.children.forEach((m, i) => { m.position.y = (i % 2 ? 1.03 : .45) + Math.abs(Math.sin(performance.now() / 120 + i)) * .06; });
}
function tagSprite(text, bg) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  const draw = (t, b) => { g.clearRect(0, 0, 256, 64); g.fillStyle = 'rgba(10,12,18,.85)'; rr(g, 4, 8, 248, 48, 8); g.fill(); g.fillStyle = b; g.fillRect(4, 8, 10, 48); g.fillStyle = '#fff'; g.font = '700 30px "Titillium Web",sans-serif'; g.textBaseline = 'middle'; g.fillText(t, 26, 33); };
  draw(text, bg);
  const tex = new THREE.CanvasTexture(c), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, sizeAttenuation: false }));
  sp.scale.set(.11, .0275, 1); sp.position.y = 1.9; sp.renderOrder = 10;
  sp.userData.set = (t, b) => { if (sp.userData.t === t) return; sp.userData.t = t; draw(t, b); tex.needsUpdate = true; };
  sp.userData.t = text; return sp;
}

/* world */
function canvasTex(w, h, fn, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } t.anisotropy = 8; return t; }
function stripGeo(L, R, vLen) {
  const pos = [], uv = [], idx = []; let d = 0;
  for (let i = 0; i < L.length; i++) {
    if (i) d += Math.hypot(L[i][0] - L[i - 1][0], L[i][2] - L[i - 1][2]);
    pos.push(...L[i], ...R[i]); uv.push(0, d / vLen, 1, d / vLen);
    if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function offsetPts(tr, ids, off, y, close) { const out = []; for (const i of ids) { const p = tr.pts[i], a = tr.th[i]; out.push([(p.x - Math.sin(a) * off) * U, y, (p.y + Math.cos(a) * off) * U]); } if (close) out.push(out[0]); return out; }
const W3 = {};
function world3D(tr) {
  if (W3[tr.def.id]) return W3[tr.def.id];
  const d = tr.def, night = !!d.night, C = city(tr), scene = new THREE.Scene(), all = [...Array(tr.n).keys()];
  const skyTop = night ? '#05070f' : '#4f94d4', skyHor = night ? '#1b2340' : '#cfe6f5';
  scene.background = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, skyTop); gr.addColorStop(.62, skyHor); gr.addColorStop(1, skyHor); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const skyDay = scene.background, skyRain = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5d6874'); gr.addColorStop(.62, '#a3adb8'); gr.addColorStop(1, '#a3adb8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog(skyHor, 90, 330);
  const hemi = new THREE.HemisphereLight(night ? '#6c7cb8' : '#ffffff', night ? '#1a1d26' : '#9a9178', night ? .55 : .85); scene.add(hemi);
  const sun = new THREE.DirectionalLight(night ? '#9fb4ff' : '#fff4dd', night ? .55 : 1.05); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 220 }); sun.shadow.bias = -.0006;
  scene.add(sun); scene.add(sun.target);
  // ground
  const TL = new THREE.TextureLoader(), tex = (u, rx, ry) => { const t = TL.load(u); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 8; return t; };
  if (d.model) { if (KRF) { const mm = KRF.clone(true); mm.scale.setScalar(.45); mm.position.set(tr.ox * U, -44 * .45, tr.oy * U); scene.add(mm); mm.updateMatrixWorld(true); const bb = new THREE.Box3(), hid = []; mm.traverse(o => { if (!o.isMesh) return; o.receiveShadow = true; bb.setFromObject(o); const w = (bb.max.x - bb.min.x) / U, dd = (bb.max.z - bb.min.z) / U; if (w > 500 || dd > 500) return; const cs = [[bb.min.x, bb.min.z], [bb.max.x, bb.min.z], [bb.min.x, bb.max.z], [bb.max.x, bb.max.z], [(bb.min.x + bb.max.x) / 2, (bb.min.z + bb.max.z) / 2]]; if (cs.some(([x, z]) => tr.near(x / U, z / U, HW + 8))) hid.push(o); }); hid.forEach(o => o.visible = false); } } else {
  const tint = night ? '#6c7486' : '#ffffff';
  const big = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshStandardMaterial({ map: tex('media/concrete.jpg', 200, 200), color: tint, roughness: .95 })); big.rotation.x = -Math.PI / 2; big.position.y = -.06; big.receiveShadow = true; scene.add(big);
  // real streets with lane markings
  const SW = 4.2, stClones = [], stImg = TL.load('media/street.jpg', im => stClones.forEach(t => { t.image = im.image; t.needsUpdate = true; })), stMat = len => { const t = new THREE.Texture(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; stClones.push(t); t.repeat.set(len / (SW * 512 / 96), 1); return new THREE.MeshStandardMaterial({ map: t, color: tint, roughness: .85 }); };
  for (let x = 90; x < tr.W; x += 190) { const L = tr.H * U, m = new THREE.Mesh(new THREE.PlaneGeometry(L, SW), stMat(L)); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.PI / 2; m.position.set(x * U, -.045, L / 2); m.receiveShadow = true; scene.add(m); }
  for (let y = 90; y < tr.H; y += 190) { const L = tr.W * U, m = new THREE.Mesh(new THREE.PlaneGeometry(L, SW), stMat(L)); m.rotation.x = -Math.PI / 2; m.position.set(L / 2, -.04, y * U); m.receiveShadow = true; scene.add(m); }
  { const ct = tex('media/cross.jpg', .5, 1), xs = [], ys = []; for (let x = 90; x < tr.W; x += 190) xs.push(x); for (let y = 90; y < tr.H; y += 190) ys.push(y);
    const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(SW + .6, SW + .6), new THREE.MeshStandardMaterial({ map: ct, color: tint, roughness: .85 }), xs.length * ys.length); let k = 0; const mm = new THREE.Matrix4(), rq = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), one = new THREE.Vector3(1, 1, 1);
    for (const x of xs) for (const y of ys) { mm.compose(new THREE.Vector3(x * U, -.035, y * U), rq, one); im.setMatrixAt(k++, mm); } im.receiveShadow = true; scene.add(im); }
  const gw = Math.min(4096, tr.W), gs = gw / tr.W;
  const gt = canvasTex(Math.round(tr.W * gs), Math.round(tr.H * gs), g => { g.scale(gs, gs); paintGround(g, tr, false, true); });
  const gp = new THREE.Mesh(new THREE.PlaneGeometry(tr.W * U, tr.H * U), new THREE.MeshStandardMaterial({ map: gt, roughness: .95, transparent: true, depthWrite: false })); gp.rotation.x = -Math.PI / 2; gp.position.set(tr.W * U / 2, -.03, tr.H * U / 2); gp.receiveShadow = true; scene.add(gp);
  if (C.sea) { const s = C.sea, sm = new THREE.MeshStandardMaterial({ color: night ? '#0c2a45' : '#2b86b8', metalness: .4, roughness: .18 }); const sp = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), sm); sp.rotation.x = -Math.PI / 2; if (s.side === 'bottom') sp.position.set(tr.W * U / 2, -.02, s.y * U + 2000); else sp.position.set(s.x * U + 2000, -.02, tr.H * U / 2); scene.add(sp); for (const b of C.boats) { const m = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1, 1.6), new THREE.MeshStandardMaterial({ color: '#ffffff' })); m.position.set(b.x * U, .4, b.y * U); m.rotation.y = s.side === 'right' ? Math.PI / 2 : 0; scene.add(m); } }
  }
  // runoff, kerbs, road
  const road = canvasTex(256, 256, (g, w, h) => { g.fillStyle = night ? '#2c3038' : '#4b5058'; g.fillRect(0, 0, w, h); const R = rng(5); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${R() < .5 ? '0,0,0' : '255,255,255'},${R() * .06})`; g.fillRect(R() * w, R() * h, 2, 2); } g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(w * .35, 0, w * .3, h); g.fillStyle = '#f1f1f1'; g.fillRect(4, 0, 6, h); g.fillRect(w - 10, 0, 6, h); }, true);
  const roadMat = new THREE.MeshStandardMaterial({ map: road, roughness: .82, metalness: 0 });
  { const img = new Image(); img.onload = () => { const c = road.image, g = c.getContext('2d'), w = c.width, h = c.height; g.drawImage(img, 0, 0, w, h); if (night) { g.fillStyle = 'rgba(20,24,36,.35)'; g.fillRect(0, 0, w, h); } g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.28, 'rgba(0,0,0,.05)'); gr.addColorStop(.42, 'rgba(10,10,12,.30)'); gr.addColorStop(.58, 'rgba(10,10,12,.30)'); gr.addColorStop(.72, 'rgba(0,0,0,.05)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const R2 = rng(11); for (let i = 0; i < 70; i++) { const x = w * (.3 + R2() * .4), y = R2() * h, l = 20 + R2() * 90; g.fillStyle = `rgba(0,0,0,${.05 + R2() * .1})`; g.fillRect(x, y, 1 + R2() * 2, l); }
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(255,255,255,${R2() * .05})`; g.fillRect(R2() * w, R2() * h, 1, 1); }
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, 14, h); g.fillRect(w - 14, 0, 14, h);
    g.fillStyle = '#ececec'; g.fillRect(6, 0, 5, h); g.fillRect(w - 11, 0, 5, h); road.needsUpdate = true; }; img.src = 'media/asphalt.jpg'; }
  const mk = (L, R, mat, v) => { const m = new THREE.Mesh(stripGeo(L, R, v), mat); m.receiveShadow = true; scene.add(m); return m; };
  mk(offsetPts(tr, all, -(HW + 28), .005, 1), offsetPts(tr, all, HW + 28, .005, 1), new THREE.MeshStandardMaterial({ map: tex('media/concrete.jpg', 1, 1), color: night ? '#5a6070' : '#d8dadc', roughness: .95, side: THREE.DoubleSide }), 6);
  const roadMesh = mk(offsetPts(tr, all, -HW, .02, 1), offsetPts(tr, all, HW, .02, 1), roadMat, 12); roadMesh.material.side = THREE.DoubleSide;
  const kerbT = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#e10600'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h / 2); }, true);
  const kerbM = new THREE.MeshStandardMaterial({ map: kerbT, roughness: .7, side: THREE.DoubleSide });
  // skid marks into corners (rubber laid by braking), barriers + debris fence like a real street circuit
  { const R5 = rng(d.seed + 9), marks = []; for (const run of tr.kerbRuns) { const st0 = Math.max(0, run[0] - 30); for (let k = 0; k < 26; k++) { const i = (st0 + (R5() * 40 | 0)) % tr.n, p = tr.pts[i], a = tr.th[i], off = (R5() - .5) * HW * 1.3; marks.push([(p.x - Math.sin(a) * off) * U, (p.y + Math.cos(a) * off) * U, a + (R5() - .5) * .08, 2 + R5() * 5]); } }
    if (marks.length) { const sg = new THREE.PlaneGeometry(1, .22); sg.rotateX(-Math.PI / 2); const sm = new THREE.MeshBasicMaterial({ color: '#0b0b0c', transparent: true, opacity: .32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), im = new THREE.InstancedMesh(sg, sm, marks.length * 2), mq = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), mm = new THREE.Matrix4();
      marks.forEach(([x, z, a, l], i) => { mq.setFromAxisAngle(up, -a); for (const s of [-1, 1]) { const sx = -Math.sin(a) * s * .8, sz = Math.cos(a) * s * .8; mm.compose(new THREE.Vector3(x + sx, .035, z + sz), mq, new THREE.Vector3(l, 1, 1)); im.setMatrixAt(i * 2 + (s > 0), mm); } }); scene.add(im); } }
  if (!d.model) {
    const wallT = canvasTex(64, 256, (g, w, h) => { g.fillStyle = '#c9cbce'; g.fillRect(0, 0, w, h); const R6 = rng(4); for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(0,0,0,${R6() * .08})`; g.fillRect(R6() * w, R6() * h, 2, 2); } g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < h; y += 64) g.fillRect(0, y, w, 2); g.fillStyle = 'rgba(60,40,20,.16)'; g.fillRect(0, 0, 10, h); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(w - 5, 0, 5, h); }, true);
    const fenceT = canvasTex(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(70,74,80,.95)'; g.lineWidth = 2; for (let x = -64; x < 128; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 64, 64); g.stroke(); g.beginPath(); g.moveTo(x + 64, 0); g.lineTo(x, 64); g.stroke(); } g.fillStyle = '#4a4e55'; g.fillRect(0, 0, w, 4); g.fillRect(w - 3, 0, 3, h); }, true);
    const wallM = new THREE.MeshStandardMaterial({ map: wallT, color: night ? '#7a8090' : '#ffffff', roughness: .9, side: THREE.DoubleSide }), fenceM = new THREE.MeshStandardMaterial({ map: fenceT, transparent: true, alphaTest: .3, roughness: .6, metalness: .4, side: THREE.DoubleSide });
    const ids = [...all.keys()].filter(i => i % 2 === 0);
    for (const sd of [-1, 1]) { const off = sd * (HW + 26), base = offsetPts(tr, ids, off, 0, 1);
      const lift = (P, y) => P.map(q => [q[0], y, q[2]]);
      mk(base, lift(base, 1.05), wallM, 6).castShadow = true;
      const top = lift(base, 1.05); mk(top, offsetPts(tr, ids, off + sd * .5, 1.05, 1), wallM, 6);
      mk(lift(base, 1.1), lift(base, 3.6), fenceM, 3.2); }
  }
  for (const run of tr.kerbRuns) for (const sd of [-1, 1]) mk(offsetPts(tr, run, sd * (HW - 3), .04, 0), offsetPts(tr, run, sd * (HW + 11), .04, 0), kerbM, 2.4);
  // start line
  const chk = canvasTex(128, 32, (g, w, h) => { for (let x = 0; x < 16; x++) for (let y = 0; y < 4; y++) { g.fillStyle = (x + y) % 2 ? '#111' : '#fff'; g.fillRect(x * 8, y * 8, 8, 8); } });
  const sl = new THREE.Mesh(new THREE.PlaneGeometry(2 * HW * U, 2), new THREE.MeshStandardMaterial({ map: chk })); const p0 = tr.pts[0];
  sl.rotation.x = -Math.PI / 2; sl.rotation.z = -tr.th[0] + Math.PI / 2; sl.position.set(p0.x * U, .03, p0.y * U); scene.add(sl);
  // grid boxes
  for (let s = 0; s < 6; s++) { const g = gridSlot(tr, s), m = new THREE.Mesh(new THREE.PlaneGeometry(.25, 2.4), new THREE.MeshBasicMaterial({ color: '#fff' })); m.rotation.x = -Math.PI / 2; m.rotation.z = -g.a; m.position.set((g.x + Math.cos(g.a) * 30) * U, .03, (g.y + Math.sin(g.a) * 30) * U); scene.add(m); }
  // barriers with banners
  const words = ['MİNİ F1', 'BAKI GRAND PRIX', 'GRAND PRIX', 'SÜRƏT', 'XƏZƏR', 'TURBO'];
  const ban = canvasTex(2048, 64, (g, w, h) => { const cols = ['#e10600', '#ffffff', '#14161c', '#00b5e2', '#edb40b', '#18a558']; for (let i = 0; i < 6; i++) { g.fillStyle = cols[i]; g.fillRect(i * w / 6, 0, w / 6, h); g.fillStyle = cols[i] === '#ffffff' || cols[i] === '#edb40b' ? '#14161c' : '#fff'; g.font = 'italic 900 38px "Titillium Web",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(words[i], i * w / 6 + w / 12, h / 2 + 2); } }, true);
  const banM = new THREE.MeshStandardMaterial({ map: ban, roughness: .6, side: THREE.DoubleSide });
  for (const sd of [-1, 1]) { const base = offsetPts(tr, all, sd * (HW + 28), 0, 1), topP = base.map(p => [p[0], 1.05, p[2]]); const pos = [], uv = [], idx = []; let dd = 0; for (let i = 0; i < base.length; i++) { if (i) dd += Math.hypot(base[i][0] - base[i - 1][0], base[i][2] - base[i - 1][2]); pos.push(...base[i], ...topP[i]); uv.push(-sd * dd / 60, 0, -sd * dd / 60, 1); if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, banM); m.castShadow = true; m.receiveShadow = true; scene.add(m); const rail = mk(offsetPts(tr, all, sd * (HW + 27.5), 1.06, 1), offsetPts(tr, all, sd * (HW + 29), 1.06, 1), new THREE.MeshStandardMaterial({ color: '#d8dbe0', metalness: .6, roughness: .4, side: THREE.DoubleSide }), 10); }
  // gantry with lights
  const a0 = tr.th[0], nx = -Math.sin(a0), nz = Math.cos(a0), gx = p0.x * U, gz = p0.y * U, span = (HW + 22) * U;
  const steel = new THREE.MeshStandardMaterial({ color: '#2a2d33', metalness: .7, roughness: .4 });
  for (const sd of [-1, 1]) { const post = new THREE.Mesh(new THREE.BoxGeometry(.4, 6.2, .4), steel); post.position.set(gx + nx * span * sd, 3.1, gz + nz * span * sd); post.castShadow = true; scene.add(post); }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(.5, 1.2, span * 2 + .6), new THREE.MeshStandardMaterial({ color: '#14161c' })); beam.position.set(gx, 6.2, gz); beam.rotation.y = -a0; beam.castShadow = true; scene.add(beam);
  const brd = new THREE.Mesh(new THREE.PlaneGeometry(span * 1.4, 1.1), new THREE.MeshBasicMaterial({ map: canvasTex(512, 64, (g, w, h) => { g.fillStyle = '#e10600'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = 'italic 900 44px "Titillium Web",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MİNİ F1 · ' + d.n.toLocaleUpperCase('az'), w / 2, h / 2 + 2); }), side: THREE.DoubleSide }));
  brd.position.set(gx - Math.cos(a0) * .3, 7.4, gz - Math.sin(a0) * .3); brd.rotation.y = -a0 - Math.PI / 2; scene.add(brd);
  const lamps = []; for (let k = 0; k < 5; k++) { const m = new THREE.Mesh(new THREE.CircleGeometry(.32, 18), new THREE.MeshBasicMaterial({ color: '#2a0505', side: THREE.DoubleSide })); const off = (k - 2) * .8; m.position.set(gx + nx * off - Math.cos(a0) * .27, 6.2, gz + nz * off - Math.sin(a0) * .27); m.rotation.y = -a0 - Math.PI / 2; scene.add(m); lamps.push(m); }
  // grandstands + crowd
  const crowdN = C.stands.length * 3 * 14, crowd = new THREE.InstancedMesh(new THREE.BoxGeometry(.32, .5, .32), new THREE.MeshStandardMaterial({ roughness: .8 }), crowdN); let ci = 0;
  const standM = new THREE.MeshStandardMaterial({ color: '#8a8f99', roughness: .9 }), roofM = new THREE.MeshStandardMaterial({ color: '#e10600', roughness: .6, side: THREE.DoubleSide });
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), Sc = new THREE.Vector3(), col = new THREE.Color(), R2 = rng(99);
  const crowdCols = ['#ffffff', '#edb40b', '#00b5e2', '#ff4fa0', '#2fe06b', '#e10600', '#1e5bd8', '#ff8a00'];
  for (const s of C.stands) {
    const grp = new THREE.Group(); grp.position.set(s.x * U, 0, s.y * U); grp.rotation.y = -s.a; scene.add(grp);
    for (let r = 0; r < 3; r++) { const b = new THREE.Mesh(new THREE.BoxGeometry(8, .9 + r * .9, 1.4), standM); b.position.set(0, (.9 + r * .9) / 2, s.side * (r * 1.4)); b.castShadow = b.receiveShadow = true; grp.add(b); }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(8.4, .15, 5), roofM); roof.position.set(0, 4.6, s.side * 1.6); roof.rotation.x = s.side * .12; roof.castShadow = true; grp.add(roof);
    for (const px of [-3.9, 3.9]) { const pole = new THREE.Mesh(new THREE.BoxGeometry(.15, 4.6, .15), steel); pole.position.set(px, 2.3, s.side * 3.6); grp.add(pole); }
    grp.updateMatrixWorld();
    for (let r = 0; r < 3; r++) for (let k = 0; k < 14; k++) { if (ci >= crowdN) break; V.set(-3.6 + k * .55 + R2() * .1, .9 + r * .9 + .25, s.side * (r * 1.4)).applyMatrix4(grp.matrixWorld); Sc.set(1, .8 + R2() * .5, 1); M4.compose(V, Q, Sc); crowd.setMatrixAt(ci, M4); crowd.setColorAt(ci, col.set(crowdCols[R2() * crowdCols.length | 0])); ci++; }
  }
  crowd.count = ci; scene.add(crowd);
  // buildings
  const winT = canvasTex(64, 128, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (let y = 6; y < h; y += 16) for (let x = 5; x < w; x += 15) { g.fillStyle = night ? (Math.random() < .55 ? '#ffd76a' : '#39404f') : '#8fa6b8'; g.fillRect(x, y, 9, 10); } }, true);
  const bm = new THREE.MeshStandardMaterial({ map: winT, roughness: .85, emissive: night ? '#ffffff' : '#000000', emissiveMap: night ? winT : null, emissiveIntensity: night ? .5 : 0 });
  const bgeo = new THREE.BoxGeometry(1, 1, 1); bgeo.translate(0, .5, 0);
  if (BLD) {
    const R3b = rng(d.seed + 7), place = BLD.map(() => []);
    for (const b of C.blds) { if (b.w < 70 || b.h < 70) continue; const pi = R3b() * BLD.length | 0, p = BLD[pi], rot = (R3b() * 4 | 0) * Math.PI / 2, swap = rot % Math.PI !== 0, pw = swap ? p.d : p.w, pd = swap ? p.w : p.d, sc = Math.min(b.w / pw, b.h / pd) * U * (d.id === 'baku' ? 1.15 : 1); place[pi].push([(b.x + b.w / 2) * U, (b.y + b.h / 2) * U, rot, sc]); }
    BLD.forEach((p, pi) => { const list = place[pi]; if (!list.length) return; for (const part of p.parts) { const im = new THREE.InstancedMesh(part.g, night ? Object.assign(part.mat.clone(), { emissive: new THREE.Color('#ffcf7a'), emissiveMap: part.mat.map, emissiveIntensity: .35 }) : part.mat, list.length); list.forEach(([x, z, r, s], k) => { Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r); V.set(x, 0, z); Sc.set(s, s, s); M4.compose(V, Q, Sc); im.setMatrixAt(k, M4); }); Q.set(0, 0, 0, 1); im.castShadow = true; im.receiveShadow = true; scene.add(im); } });
  } else {
  const blds = new THREE.InstancedMesh(bgeo, bm, C.blds.length);
  C.blds.forEach((b, i) => { V.set((b.x + b.w / 2) * U, 0, (b.y + b.h / 2) * U); Sc.set(b.w * U, b.ht * U * (d.id === 'baku' ? 1.3 : 1), b.h * U); M4.compose(V, Q, Sc); blds.setMatrixAt(i, M4); blds.setColorAt(i, col.set(b.col)); });
  blds.castShadow = true; blds.receiveShadow = true; scene.add(blds);
  }
  // trees
  const tg = new THREE.SphereGeometry(1, 8, 6), tm = new THREE.MeshStandardMaterial({ color: night ? '#2d5a3c' : '#4f9440', roughness: .9 }), trees = new THREE.InstancedMesh(tg, tm, C.trees.length);
  const trunkG = new THREE.CylinderGeometry(.12, .16, 1, 6); trunkG.translate(0, .5, 0); const trunks = new THREE.InstancedMesh(trunkG, new THREE.MeshStandardMaterial({ color: '#6b4a2b' }), C.trees.length);
  C.trees.forEach((t, i) => { const r = t.r * U * 1.5, h = t.palm ? 3.2 : 1.2; V.set(t.x * U, h + r * .7, t.y * U); Sc.set(r, t.palm ? r * .6 : r, r); M4.compose(V, Q, Sc); trees.setMatrixAt(i, M4); V.set(t.x * U, 0, t.y * U); Sc.set(1, h + r * .4, 1); M4.compose(V, Q, Sc); trunks.setMatrixAt(i, M4); });
  if (TREES) {
    const kinds = []; const R4 = rng(d.seed + 3);
    for (const t of C.trees) { const kind = t.palm ? ['palm', 0] : d.park || R4() < .35 ? ['pine', 0] : ['leaf', R4() * TREES.leaf.length | 0]; const h = t.palm ? 8 + R4() * 3 : kind[0] === 'pine' ? 6 + t.r * .25 + R4() * 2 : 4.5 + t.r * .25 + R4() * 1.5; kinds.push([kind, t, h, R4() * 6.28]); }
    const groups = new Map(); for (const k of kinds) { const id = k[0].join(); if (!groups.has(id)) groups.set(id, []); groups.get(id).push(k); }
    for (const [id, list] of groups) { const [kn, vi] = id.split(','), parts = TREES[kn][+vi]; for (const p of parts) { const im = new THREE.InstancedMesh(p.g, p.mat, list.length); list.forEach(([, t, h, ry], i) => { Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry); V.set(t.x * U, 0, t.y * U); Sc.set(h, h, h); M4.compose(V, Q, Sc); im.setMatrixAt(i, M4); }); Q.set(0, 0, 0, 1); im.castShadow = true; scene.add(im); } }
  } else { trees.castShadow = true; scene.add(trees); scene.add(trunks); }
  // landmarks (Baku)
  if (C.tower) {
    const { x, y } = C.tower, glass = new THREE.MeshStandardMaterial({ color: night ? '#1d2b44' : '#5f8fb8', metalness: .75, roughness: .12, emissive: night ? '#ff5a00' : '#000000', emissiveIntensity: night ? .75 : 0 });
    const fl = new THREE.Shape(); fl.moveTo(-3, 0); fl.bezierCurveTo(-3.6, 8, -2.2, 15, .6, 21); fl.bezierCurveTo(2.2, 15, 3.3, 8, 3, 0); fl.closePath();
    const fg = new THREE.ExtrudeGeometry(fl, { depth: 4, bevelEnabled: true, bevelThickness: .5, bevelSize: .5, bevelSegments: 3, curveSegments: 12 }); fg.translate(0, 0, -2);
    [[0, 0, 1.1, 0], [-7, 5, .95, 2.2], [7, 5, .9, -2.2]].forEach(([ox, oz, sc, ry]) => { const m = new THREE.Mesh(fg, glass); m.position.set(x * U + ox, 0, y * U - 30 + oz); m.scale.setScalar(sc); m.rotation.y = ry; m.castShadow = true; scene.add(m); });
    const mt = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.8, 7, 24), new THREE.MeshStandardMaterial({ color: '#d9bf8a', roughness: .95 })); mt.position.set(x * U, 3.5, y * U); mt.castShadow = true; scene.add(mt);
    const fp = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 6, 6), steel); fp.position.set(x * U, 10, y * U); scene.add(fp);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4), new THREE.MeshBasicMaterial({ map: canvasTex(60, 40, (g, w, h) => { g.fillStyle = '#00b5e2'; g.fillRect(0, 0, w, h / 3); g.fillStyle = '#ef3340'; g.fillRect(0, h / 3, w, h / 3); g.fillStyle = '#509e2f'; g.fillRect(0, h * 2 / 3, w, h / 3); g.fillStyle = '#fff'; g.beginPath(); g.arc(28, 20, 5, 0, 7); g.fill(); g.fillStyle = '#ef3340'; g.beginPath(); g.arc(29.5, 20, 4, 0, 7); g.fill(); }), side: THREE.DoubleSide })); flag.position.set(x * U + 1.25, 12.2, y * U); scene.add(flag);
  }
  // night lamps
  if (night) { const lg = new THREE.InstancedMesh(new THREE.SphereGeometry(.35, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff3c4' }), Math.ceil(tr.n / 20) * 2), pg = new THREE.InstancedMesh(new THREE.CylinderGeometry(.08, .1, 7, 6), steel, Math.ceil(tr.n / 20) * 2); let li = 0; for (let i = 0; i < tr.n; i += 20) for (const sd of [-1, 1]) { const p = tr.pts[i], a = tr.th[i], off = sd * (HW + 34); V.set((p.x - Math.sin(a) * off) * U, 7, (p.y + Math.cos(a) * off) * U); M4.compose(V, Q, Sc.set(1, 1, 1)); lg.setMatrixAt(li, M4); V.y = 3.5; M4.compose(V, Q, Sc); pg.setMatrixAt(li, M4); li++; } lg.count = pg.count = li; scene.add(lg); scene.add(pg); }
  return W3[tr.def.id] = { scene, sun, lamps, roadMat, hemi, skyDay, skyRain };
}

/* ---------- garage (3D studio) ---------- */
let gsec = 'car', G3 = null;
function gkeys() { return [meKey()]; }
function gkeyStore(k) { return k; }
function startGarage() {
  renderGarage();
  if (!HAS3D) return;
  if (!G3) {
    const cv = $('#gcv'), r = new THREE.WebGLRenderer({ canvas: cv, antialias: true }); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#2b2e35'); scene.fog = new THREE.Fog('#2b2e35', 14, 30);
    const floorT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#9ea2a8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d0021b'; g.lineWidth = 14; g.strokeRect(90, 150, 330, 210); g.fillStyle = 'rgba(0,0,0,.05)'; for (let i = 0; i < 400; i++) g.fillRect(Math.random() * w, Math.random() * h, 3, 3); });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ map: floorT, roughness: .6, metalness: .1 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const wallT = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#5b5f67'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4a4e55'; g.lineWidth = 3; for (let x = 0; x < w; x += 42) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } }, true); wallT.repeat.set(4, 1);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(24, 8), new THREE.MeshStandardMaterial({ map: wallT, roughness: .8 })); wall.position.set(0, 4, -6); scene.add(wall);
    scene.add(new THREE.HemisphereLight('#ffffff', '#555555', .8));
    const key = new THREE.SpotLight('#ffffff', .8, 40, .7, .6); key.position.set(4, 9, 6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
    const rim = new THREE.DirectionalLight('#ffd9b0', .5); rim.position.set(-6, 4, -4); scene.add(rim);
    const cam = new THREE.PerspectiveCamera(36, 2, .1, 100);
    G3 = { r, scene, cam, car: null, yaw: .7, drag: null, raf: 0, auto: true };
    cv.style.touchAction = 'pan-y';
    cv.addEventListener('pointerdown', e => { if (G3.inc || G3.out) return; G3.drag = { x: e.clientX, w: cv.clientWidth }; try { cv.setPointerCapture(e.pointerId); } catch (x) {} });
    cv.addEventListener('pointermove', e => { if (!G3.drag || !G3.car) return; const dx = e.clientX - G3.drag.x; G3.car.position.x = dx / G3.drag.w * 9; });
    const up = e => { const d = G3.drag; G3.drag = null; if (!d || !G3.car) return; const dx = e.clientX - d.x; if (Math.abs(dx) > d.w * .18) switchCar(dx < 0 ? 1 : -1, G3.car.position.x); else G3.snap = true; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  }
  garageCar(); if (!GLB) loadGLB().then(g => { if (g) garageCar(); });
  if (!G3.raf) { const loop = () => { const { r, cam, scene } = G3, cv = r.domElement, w = cv.clientWidth, h = cv.clientHeight; if (cv.width !== Math.round(w * Math.min(2, devicePixelRatio))) { r.setPixelRatio(Math.min(2, devicePixelRatio)); r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); } if (G3.snap && G3.car && !G3.drag) { G3.car.position.x *= .8; if (Math.abs(G3.car.position.x) < .01) { G3.car.position.x = 0; G3.snap = false; } } G3.yaw += .004; if (G3.car) G3.car.rotation.y = G3.yaw; const ease = t => 1 - Math.pow(1 - t, 3); if (G3.inc) { G3.inc.t = Math.min(1, G3.inc.t + .045); G3.inc.obj.position.x = G3.inc.dir * 12 * (1 - ease(G3.inc.t)); if (G3.inc.t >= 1) G3.inc = null; } if (G3.out) { G3.out.t = Math.min(1, G3.out.t + .045); G3.out.obj.position.x = G3.out.x0 + (-G3.out.dir * 12 - G3.out.x0) * ease(G3.out.t); if (G3.out.t >= 1) { G3.scene.remove(G3.out.obj); G3.out = null; } } garageTyres(); const dist = w / h < 1.2 ? 9.5 : 7.4; cam.position.set(0, 2.6, dist); cam.lookAt(0, .45, 0); r.render(scene, cam); G3.raf = requestAnimationFrame(loop); }; G3.raf = requestAnimationFrame(loop); }
}
function stopGarage() { if (G3 && G3.raf) { cancelAnimationFrame(G3.raf); G3.raf = 0; } }
function garageCar(dir, from) {
  if (!G3) return;
  const g = garage(gkeyStore(st.gtab));
  if (CARS.find(c => c.id === g.model && c.url) && !XM[g.model]) { loadCarModel(g.model).then(() => garageCar()); }
  const nc = makeCar3D({ model: g.model, color: g.color, color2: g.color2, pattern: g.pattern, helm: g.helmet, num: g.num, tyre: g.tyre });
  nc.traverse(o => { if (o.isMesh) o.castShadow = true; }); nc.rotation.y = G3.yaw;
  if (dir && G3.car) { const old = G3.car; G3.out = { obj: old, t: 0, dir, x0: from || 0 }; nc.position.x = dir * 12; G3.inc = { obj: nc, t: 0, dir }; }
  else if (G3.car) G3.scene.remove(G3.car);
  G3.car = nc; G3.scene.add(nc);
  setXray(G3.car, gsec === 'eng' ? 'eng' : gsec === 'ers' ? 'ers' : null);
  const C = CARS.find(c => c.id === g.model) || CARS[0], ix = CARS.indexOf(C);
  $('#carName').textContent = C.n; $('#carDesc').textContent = C.d; $('#carDots').innerHTML = CARS.map((c, k) => `<i class="${k === ix ? 'on' : ''}"></i>`).join('');
}

/* ---------- 3D tyre compounds for the garage ---------- */
let TYR = null, tyrP = null;
function loadTyres() {
  if (tyrP) return tyrP;
  return tyrP = loadOne(['media/tyresO.glb'], m => {
    m.updateMatrixWorld(true); const parts = [];
    m.traverse(o => { if (!o.isMesh) return; const g = toFloat(o.geometry); g.applyMatrix4(o.matrixWorld); g.computeBoundingBox(); parts.push({ g, mat: o.material, z: (g.boundingBox.min.z + g.boundingBox.max.z) / 2 }); });
    const zs = [...new Set(parts.map(p => Math.round(p.z * 10)))].sort((x, y) => x - y), cl = []; for (const z of zs) { if (!cl.length || z - cl[cl.length - 1][0] > 2) cl.push([z]); else cl[cl.length - 1].push(z); }
    const cen = cl.map(c => c.reduce((s, v) => s + v, 0) / c.length / 10), map = { 'MEDIUM': 'medium', 'SOFT': 'hard', 'HARD': 'soft' }, out = {};
    cen.forEach(cz => { const grp = new THREE.Group(), mine = parts.filter(p => Math.abs(p.z - cz) < .3); let key = null; const bb = new THREE.Box3(); mine.forEach(p => bb.union(p.g.boundingBox)); const c = bb.getCenter(new THREE.Vector3()), S = 1.15 / (bb.max.y - bb.min.y);
      mine.forEach(p => { const g = p.g.clone(); g.translate(-c.x, -c.y, -c.z); g.scale(S, S, S); const mm = new THREE.Mesh(g, p.mat); mm.castShadow = true; grp.add(mm); const k = Object.keys(map).find(n => p.mat.name.toUpperCase().startsWith(n)); if (k) key = map[k]; });
      grp.rotation.y = Math.PI / 2; const piv = new THREE.Group(); piv.add(grp); if (key) out[key] = piv; });
    if (out.hard) { const w = new THREE.Group(); const src = out.hard.children[0].clone(true); src.traverse(o => { if (o.isMesh && /HARD|SOFT|MEDIUM/i.test(o.material.name)) { o.material = o.material.clone(); o.material.color.set('#3d8bff'); } }); w.add(src); out.wet = w; }
    return out;
  }).then(r => TYR = r);
}
function garageTyres() {
  if (!G3) return; const on = gsec === 'tyre';
  if (on && !TYR) { loadTyres().then(() => { G3.tyreGrp = null; }); }
  if (on && TYR && !G3.tyreGrp) { const grp = new THREE.Group(); ['soft', 'medium', 'hard', 'wet'].forEach((k, i) => { const t = TYR[k]; if (!t) return; const o = t.clone(true); o.position.set(-2.55 + i * 1.7, .62, 0); o.scale.setScalar(.85); o.userData.k = k; grp.add(o); }); G3.tyreGrp = grp; G3.scene.add(grp); }
  if (G3.tyreGrp) G3.tyreGrp.visible = on; if (G3.car) G3.car.visible = !on; const cap = document.querySelector('.car-cap'); if (cap) cap.style.visibility = on ? 'hidden' : '';
  if (on && G3.tyreGrp) { const sel = G3.selTyre; for (const o of G3.tyreGrp.children) { const s = o.userData.k === sel; o.position.y += ((s ? .95 : .55) - o.position.y) * .12; o.position.z += ((s ? 1.2 : 0) - o.position.z) * .12; o.rotation.y = s ? o.rotation.y + .02 : o.rotation.y * .9; o.children[0].children.forEach(m => m.rotation.y += 0); } }
}
function switchCar(dir, from) { const g = garage(gkeyStore(st.gtab)), ix = Math.max(0, CARS.findIndex(c => c.id === g.model)), nx = (ix + dir + CARS.length) % CARS.length; setGarage(gkeyStore(st.gtab), { model: CARS[nx].id }); whoosh(); garageCar(dir, from); if (gsec === 'car') renderGarage(); }
function renderGarage() {
  st.gtab = meKey();
  $('#gtabs').innerHTML = '';
  $$('#gsec button').forEach(b => b.classList.toggle('on', b.dataset.s === gsec));
  const g = garage(gkeyStore(st.gtab)), P = $('#gpanel');
  const sw = (attr, list, cur) => `<div class="sw">${list.map(c => `<button data-${attr}="${c[0]}" aria-label="${c[1]}" title="${c[1]}" class="${c[0] === cur ? 'on' : ''}" style="background:${c[0]}"></button>`).join('')}</div>`;
  if (G3) G3.selTyre = g.tyre;
  if (gsec === 'tyre') loadTyres();
  if (gsec === 'car') P.innerHTML = `<h3>Bolid seç</h3><p>Yuxarıda maşını barmağınla sağa-sola sürüşdür və ya buradan seç.</p><div class="ty">${CARS.map(x => `<button data-m="${x.id}" class="${x.id === g.model ? 'on' : ''}"><b>${x.n}</b><small>${x.d}</small></button>`).join('')}</div>`;
  else if (gsec === 'paint') P.innerHTML = `<h3>Əsas rəng</h3><p>Bolidin əsas rəngi.</p>${sw('c', COLORS, g.color)}<p style="margin:16px 0 8px">İkinci rəng (zolaq, alov, ulduzlar)</p>${sw('c2', COLORS, g.color2)}`;
  else if (gsec === 'liv') P.innerHTML = `<h3>Hazır dizaynlar</h3><p>Bir toxunuşla bolidin iki rəngini birlikdə dəyiş.</p><div class="livs">${PRESETS.map((p, i) => `<button data-pr="${i}" class="${p[1] === g.color && p[2] === g.color2 ? 'on' : ''}"><img alt="" src="${liveryThumb({ color: p[1], color2: p[2], pattern: 'twotone', tyre: g.tyre })}">${p[0]}</button>`).join('')}</div>`;
  else if (gsec === 'tyre') P.innerHTML = `<h3>Şinlər</h3><p>Yarışda şinlər yeyilir. Göstərici qırmızıya düşəndə Pit Stop et.</p><div class="ty">${Object.entries(TYRES).map(([k, t]) => `<button data-t="${k}" class="${k === g.tyre ? 'on' : ''}"><b><i style="border-color:${t.c}"></i>${t.n}</b><small>${t.d}</small></button>`).join('')}</div>`;
  else if (gsec === 'num') P.innerHTML = `<h3>Nömrə və dəbilqə</h3><div class="numin" style="margin:10px 0 16px"><label for="gnum">Bolid nömrəsi</label><input id="gnum" type="number" min="1" max="99" inputmode="numeric" value="${g.num}"></div><p style="margin:0 0 8px">Dəbilqə rəngi</p>${sw('hm', [['#ffffff', 'Ağ'], ['#ffd6ea', 'Çəhrayı'], ['#edb40b', 'Qızılı'], ['#00b5e2', 'Mavi'], ['#e10600', 'Qırmızı'], ['#1b1c21', 'Qara'], ['#18a558', 'Yaşıl']], g.helmet)}`;
  else if (gsec === 'eng') P.innerHTML = `<h3>Mühərrik</h3><p>Bolidin içinə bax: arxadakı qızılı hissə mühərrikdir. Əsl F1 bolidində kiçik, amma çox güclü turbo mühərrik var və bolidi 300 km/saatdan da sürətli aparır.</p>`;
  else P.innerHTML = `<h3>Batareya · BOOST</h3><p>Sarı-yaşıl hissə batareyadır. Əyləc edəndə dolur. Yarışda ildırım düyməsini və ya Boşluq düyməsini bas: bolid irəli atılır.</p>`;
  const ni = $('#gnum'); if (ni) ni.addEventListener('change', e => { setGarage(gkeyStore(st.gtab), { num: clamp(parseInt(e.target.value) || 1, 1, 99) }); garageCar(); renderHome(); });
}
$('#gsec').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { gsec = b.dataset.s; renderGarage(); if (G3 && G3.car) setXray(G3.car, gsec === 'eng' ? 'eng' : gsec === 'ers' ? 'ers' : null); } });
$('#gtabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { st.gtab = b.dataset.k; LS.set('gtab', st.gtab); renderGarage(); garageCar(); } });
$('#gpanel').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const k = gkeyStore(st.gtab), d = b.dataset, g0 = garage(k);
  if (d.m) { const o = CARS.findIndex(c => c.id === g0.model), nI = CARS.findIndex(c => c.id === d.m); setGarage(k, { model: d.m }); renderGarage(); garageCar(nI > o ? 1 : -1); syncGarage(); return; } else if (d.c) setGarage(k, { color: d.c }); else if (d.c2) setGarage(k, { color2: d.c2 }); else if (d.hm) setGarage(k, { helmet: d.hm }); else if (d.t) setGarage(k, { tyre: d.t }); else if (d.p) setGarage(k, { pattern: d.p }); else if (d.pr) { const p = PRESETS[+d.pr]; setGarage(k, { color: p[1], color2: p[2] }); } else return;
  renderGarage(); garageCar(); homeCity = null;
});

/* ---------- lobby ---------- */
function thumb(cv, tr) {
  const W = cv.clientWidth || 220, H = cv.clientHeight || 138, d = Math.min(2, devicePixelRatio || 1); cv.width = W * d; cv.height = H * d;
  const g = cv.getContext('2d'), s = Math.min(W / tr.W, H / tr.H) * 1.08;
  g.setTransform(d * s, 0, 0, d * s, d * (W - tr.W * s) / 2, d * (H - tr.H * s) / 2);
  g.drawImage(bg2d(tr), 0, 0);
  g.lineJoin = 'round'; g.strokeStyle = '#fff'; g.lineWidth = 2 * HW + 40; g.stroke(tr.road); g.strokeStyle = '#e10600'; g.lineWidth = 2 * HW; g.stroke(tr.road);
}
function renderLobby() {
  const wait = id => st.peers.filter(p => !p.sameTab && p.presence && p.presence.trk === id && (p.presence.st === 'lobby' || p.presence.st === 'grid')).length;
  $('#tracks').innerHTML = TRACKS.map(t => `<button class="tk ${t.id === st.track ? 'on' : ''}" data-t="${t.id}"><canvas></canvas>${wait(t.id) ? `<span class="wait">${wait(t.id)} gözləyir</span>` : ''}<b>${t.n}</b><small>${t.sub}</small></button>`).join('');
  $$('#tracks .tk').forEach(b => thumb(b.querySelector('canvas'), getTrack(b.dataset.t)));
  $('#lp').innerHTML = `<b style="font:700 17px 'Titillium Web',sans-serif">${esc(pilotName())}</b>`;
  $('#gname').style.display = 'none';
  $$('#ldiff button').forEach(b => b.classList.toggle('on', b.dataset.d === st.diff));
  $('#dhelp').textContent = st.diff === 'clash' ? 'Bolid özü dönür. Sən QAZ düyməsini saxlayıb sürəti, Pit Stop vaxtını və BOOST-u idarə edirsən. Çox qaz = şinlər tez yeyilir.' : st.diff === 'easy' ? 'Sən sükanı idarə edirsən, qazı bolid özü verir.' : 'Sükan, qaz və əyləc tamamilə səndədir.';
  $$('#llaps button').forEach(b => b.classList.toggle('on', +b.dataset.l === st.laps));
  renderPeers();
  presence({ trk: st.track, st: 'lobby' });
}
function renderPeers() {
  const el = $('#lpeers'); if (!el) return;
  const list = st.peers.filter(p => p.presence && p.presence.trk === st.track && p.presence.st && p.presence.st !== 'off');
  if (!st.room) { el.innerHTML = '<span style="color:var(--mut)">Onlayn bağlantı yoxdur. Kompüter bolidləri ilə yarışırsan.</span>'; return; }
  el.innerHTML = list.length ? list.map(p => `<div><i style="background:${okCol(p.presence.col, '#888')}"></i>${esc(String(p.presence.nm || 'Pilot').slice(0, 16))}${p.sameTab ? ' (sən)' : ''} · ${p.presence.st === 'run' ? 'yarışır' : p.presence.st === 'grid' ? 'startda' : 'gözləyir'}</div>`).join('') : '<span style="color:var(--mut)">Hələ heç kim yoxdur. Linki dostuna göndər!</span>';
}
$('#tracks').addEventListener('click', e => { const b = e.target.closest('.tk'); if (b) { st.track = b.dataset.t; LS.set('track', st.track); renderLobby(); } });
$('#lp').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { st.pilot = b.dataset.p; LS.set('pilot', st.pilot); renderLobby(); if (st.pilot === 'guest') $('#gname').focus(); } });
$('#gname').addEventListener('input', e => { st.guest = e.target.value.trim().slice(0, 16); LS.set('guest', st.guest); presence({ nm: pilotName() }); });
$('#ldiff').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { st.diff = b.dataset.d; LS.set('diff2', st.diff); renderLobby(); } });
$('#llaps').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { st.laps = +b.dataset.l; LS.set('laps', st.laps); renderLobby(); } });
$('#start').addEventListener('click', () => { audioInit(); const others = st.peers.filter(p => !p.sameTab && p.presence && p.presence.trk === st.track && p.presence.st === 'lobby').length; if (st.diff === 'clash' && !others) { showPrerace(); return; } startRace(Date.now() + (others ? 4500 : 3400), st.laps); });

/* ---------- audio ---------- */
let AC = null, eng = null, MUTE = LS.get('mute', false), master = null, crowd = null, noiseBuf = null;
function audioInit() {
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      master = AC.createGain(); master.gain.value = MUTE ? 0 : 1; master.connect(AC.destination);
      noiseBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate); const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      // engine: two detuned saws + square sub, lowpass, gentle distortion
      const o = AC.createOscillator(), o2 = AC.createOscillator(), o3 = AC.createOscillator(), f = AC.createBiquadFilter(), gn = AC.createGain(), ws = AC.createWaveShaper();
      const curve = new Float32Array(256); for (let i = 0; i < 256; i++) { const x = i / 128 - 1; curve[i] = Math.tanh(x * 2.2); } ws.curve = curve;
      o.type = 'sawtooth'; o2.type = 'sawtooth'; o3.type = 'square'; o2.detune.value = 14; f.type = 'lowpass'; f.frequency.value = 1400; f.Q.value = 3; gn.gain.value = 0;
      const g3 = AC.createGain(); g3.gain.value = .35; o3.connect(g3).connect(ws); o.connect(ws); o2.connect(ws); ws.connect(f).connect(gn).connect(master); o.start(); o2.start(); o3.start();
      eng = { o, o2, o3, f, gn, gear: 1 };
      // crowd bed
      const cs = AC.createBufferSource(); cs.buffer = noiseBuf; cs.loop = true; const cf = AC.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 900; cf.Q.value = .6; const cg = AC.createGain(); cg.gain.value = 0; cs.connect(cf).connect(cg).connect(master); cs.start(); crowd = cg;
    }
    AC.resume();
  } catch (e) {}
}
function setMute(m) { MUTE = m; LS.set('mute', m); if (master) master.gain.value = m ? 0 : 1; $('#bMute').classList.toggle('off', m); }
function beep(freq, dur, vol, type) { if (!AC) return; try { const o = AC.createOscillator(), g = AC.createGain(); o.type = type || 'sine'; o.frequency.value = freq; g.gain.value = vol || .12; o.connect(g).connect(master); o.start(); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + dur); o.stop(AC.currentTime + dur); } catch (e) {} }
function noiseHit(dur, freq, vol, q) { if (!AC) return; try { const s = AC.createBufferSource(); s.buffer = noiseBuf; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q || 1; const g = AC.createGain(); g.gain.value = vol; s.connect(f).connect(g).connect(master); s.start(); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + dur); s.stop(AC.currentTime + dur + .05); } catch (e) {} }
function whoosh() { if (!AC) return; try { const s = AC.createBufferSource(); s.buffer = noiseBuf; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2; const g = AC.createGain(); g.gain.value = .0001; s.connect(f).connect(g).connect(master); const t = AC.currentTime; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(3000, t + .6); g.gain.exponentialRampToValueAtTime(.35, t + .25); g.gain.exponentialRampToValueAtTime(.001, t + .9); s.start(); s.stop(t + 1); } catch (e) {} }
function cheer() { if (!AC) return; noiseHit(2.4, 1100, .5, .5); setTimeout(() => noiseHit(1.8, 1500, .35, .7), 250); [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, .35, .08, 'triangle'), 200 + i * 140)); }
function wrench() { if (!AC) return; for (let k = 0; k < 6; k++) setTimeout(() => noiseHit(.07, 2600, .35, 4), k * 70); }
function click() { beep(1400, .04, .05, 'square'); }
document.addEventListener('click', e => { if (AC && e.target.closest('.btn,.chips button,.tabs button,.tk,.hs,.sw button,.ty button,.livs button')) click(); });

/* ---------- weather ---------- */
const WX = { sun: ['Günəşli', 1, '<circle cx="12" cy="12" r="5" fill="#ffd400"/><g stroke="#ffd400" stroke-width="2" stroke-linecap="round"><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></g>'], cloud: ['Buludlu', .97, '<path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18z" fill="#e6e9ef"/>'], rain: ['Yağış', .82, '<path d="M7 14h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 14z" fill="#cfd5df"/><g stroke="#4fc3ff" stroke-width="2" stroke-linecap="round"><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/></g>'], night: ['Gecə · aydın', 1, '<path d="M15 3a8 8 0 1 0 6 13A7 7 0 0 1 15 3z" fill="#ffe9a6"/>'] };
function pickWeather(tr, go) { if (tr.def.night) return 'night'; const r = rng(Math.floor(go / 1000) % 1e6)(); return r < .68 ? 'sun' : r < .84 ? 'cloud' : 'rain'; }

/* ---------- race ---------- */
const keys = {};
const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'gas', KeyW: 'gas', ArrowDown: 'brake', KeyS: 'brake', Space: 'boost' };
addEventListener('keydown', e => { if (!race) return; const k = KEYMAP[e.code]; if (k) { keys[k] = 1; e.preventDefault(); } if (e.code === 'Escape') endRace(); if (e.code === 'KeyC') cycleCam(); if (e.code === 'KeyP') requestPit(); });
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys[k] = 0; });
$$('.touch button').forEach(b => { const k = b.dataset.k; const dn = e => { e.preventDefault(); keys[k] = 1; b.classList.add('dn'); try { b.setPointerCapture(e.pointerId); } catch (x) {} }, up = () => { keys[k] = 0; b.classList.remove('dn'); }; b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up); });
{ const b = $('#bBoost'), dn = e => { e.preventDefault(); keys.boost = 1; b.classList.add('on'); }, up = () => { keys.boost = 0; b.classList.remove('on'); }; b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up); }
$('#bPit').addEventListener('click', () => requestPit());
{ const b = $('#bGas'), dn = e => { e.preventDefault(); keys.gas = 1; b.classList.add('dn'); try { b.setPointerCapture(e.pointerId); } catch (x) {} }, up = () => { keys.gas = 0; b.classList.remove('dn'); }; b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up); b.addEventListener('contextmenu', e => e.preventDefault()); }
$('#bMute').addEventListener('click', () => { audioInit(); setMute(!MUTE); });
const CAMS = ['Arxadan', 'TV', 'Kokpit', 'Helikopter'];
function cycleCam() { st.cam = (st.cam + 1) % 4; LS.set('cam', st.cam); $('#camT').textContent = CAMS[st.cam]; }
$('#bCam').addEventListener('click', cycleCam);
function requestPit() { if (!race || !race.started || race.me.done || race.me.pit) return; if (race.clash) { openTyrePick(race.me); return; } race.me.pit = { t: 0, ph: 'in' }; }
let race = null, raceRaf = 0, R3 = null;
function renderer3() {
  if (R3) return R3;
  const cv = $('#gc'), mobile = matchMedia('(pointer:coarse)').matches;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: !mobile, powerPreference: 'high-performance' });
  r.shadowMap.enabled = true; r.shadowMap.type = mobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
  const cam = new THREE.PerspectiveCamera(62, 1, .1, 600);
  const N = 1600, rainG = new THREE.BufferGeometry(), rp = new Float32Array(N * 6);
  for (let i = 0; i < N; i++) { const x = (Math.random() - .5) * 50, y = (Math.random() - .5) * 45, z = (Math.random() - .5) * 50; rp.set([x, y, z, x + .05, y - .9, z], i * 6); }
  rainG.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  const rain = new THREE.LineSegments(rainG, new THREE.LineBasicMaterial({ color: '#d6e8f7', transparent: true, opacity: .55 }));
  return R3 = { r, cam, rain, mobile };
}
async function startRace(go, laps, opts) {
  opts = opts || {};
  if (needAuth()) return;
  if (!HAS3D) { alertBox('3D qrafika bu cihazda yüklənmədi. Səhifəni yenilə.'); return; }
  { const b = $('#start'), t0 = Date.now(); b.textContent = 'Yüklənir…'; await loadGLB(); if (TRACKS.find(t => t.id === st.track).model) await loadKRF(); await Promise.all([...CARS.filter(c => c.url).map(c => loadCarModel(c.id)), loadHeli()]); b.textContent = 'Start'; if (Date.now() - t0 > 200 && go - Date.now() < 2500) go = Date.now() + 3200; }
  stopLobby(); stopGarage();
  const tr = getTrack(st.track), key = pilotKey(), g = myGarage(), ty = TYRES[g.tyre];
  if (tr.def.model) laps = Math.max(1, Math.round(laps / 2));
  const clash = st.diff === 'clash', easy = st.diff !== 'pro', wx = opts.wx || pickWeather(tr, go), wgrip = WX[wx][1];
  const team = [];
  if (clash) [[meKey(), pilotName(), codeOf(pilotName())], [meKey() + '_2', 'Yoldaş', 'YOL']].forEach(([pk, nm, cd], ti) => { const gg = garage(pk), c = newCar({ me: true, mine: true, pkey: pk, model: gg.model, name: nm, code: cd, color: gg.color, color2: gg.color2, pattern: gg.pattern, helm: gg.helmet, num: gg.num, pace: 1, ava: ti ? avLetter(nm, gg.color) : avOf(ME) }); tyreApply(c, (opts.tyres || {})[ti ? 'b' : 'a'] || gg.tyre, wx); team.push(c); });
  const me = clash ? team[0] : newCar({ me: true, model: g.model, name: pilotName(), code: codeOf(pilotName()), color: g.color, color2: g.color2, pattern: g.pattern, helm: g.helmet, num: g.num, tyre: g.tyre, top: TOP * ty.top * (wx === 'rain' ? .95 : 1), grip: ty.grip * wgrip, wearRate: ty.wear * (easy ? .6 : 1) });
  const peersNow = st.peers.filter(p => !p.sameTab && p.presence && p.presence.trk === st.track && (p.presence.st === 'lobby' || p.presence.st === 'grid')).length;
  const nBots = Math.max(1, (clash ? 4 : 5) - peersNow * (clash ? 2 : 1)), cars = clash ? [...team] : [me];
  for (let i = 0; i < nBots; i++) { const b = BOTS[i], tyk = ['medium', 'hard', 'soft', 'medium', 'hard'][i]; cars.push(newCar({ bot: true, model: i % 2 ? 'classic' : 'modern', name: b[0], code: b[1], color: b[2], color2: b[3], pattern: b[4], helm: '#ffffff', num: [3, 22, 44, 16, 81][i], tyre: tyk, skill: (easy ? .8 : .92) + i * (easy ? .022 : .028) - (i === 0 ? .04 : 0), lane: [-18, 16, -8, 22, 0][i], grip: TYRES[tyk].grip * wgrip, top: TOP * TYRES[tyk].top, wearRate: TYRES[tyk].wear })); }
  const mySlot = peersNow ? hashStr((st.uid || '') + key) % 6 : (easy ? Math.min(2, nBots) : nBots);
  const mySlots = clash ? (peersNow ? [mySlot % 5, mySlot % 5 + 1] : [2, 3]) : [mySlot];
  (clash ? team : [me]).forEach((c, i) => place(c, tr, mySlots[i])); let s = 0; for (const c of cars) { if (c.me) continue; while (mySlots.includes(s)) s++; place(c, tr, s++); }
  const W = world3D(tr), X = renderer3();

  if (race && race.objs) race.objs.forEach(o => W.scene.remove(o));
  const objs = [];
  for (const c of cars) { c.obj = makeCar3D(c); c.tag = tagSprite(c.code, c.color); c.obj.add(c.tag); W.scene.add(c.obj); objs.push(c.obj); }
  if (wx === 'rain') { W.scene.add(X.rain); objs.push(X.rain); W.roadMat.roughness = .3; W.roadMat.metalness = .35; W.roadMat.color.set('#8a8f99'); } else { W.roadMat.roughness = .82; W.roadMat.metalness = 0; W.roadMat.color.set('#ffffff'); }
  W.scene.background = wx === 'rain' ? W.skyRain : W.skyDay; W.hemi.intensity = tr.def.model ? 1.0 : tr.def.night ? .55 : wx === 'rain' ? .6 : wx === 'cloud' ? .75 : .85; W.sun.intensity = tr.def.model ? .7 : tr.def.night ? .55 : wx === 'rain' ? .35 : wx === 'cloud' ? .6 : 1.05; W.scene.fog.color.set(wx === 'rain' ? '#a3adb8' : tr.def.night ? '#1b2340' : '#cfe6f5'); W.scene.fog.near = wx === 'rain' ? 40 : 90; W.scene.fog.far = wx === 'rain' ? 190 : 330;
  race = { tr, cars, me, team, go, laps, easy, clash, wx, W, X, objs, peers: new Map(), finished: [], cam: null, lastP: 0, lastHud: 0, lit: -1, key };
  if (HELI) { const ho = new THREE.Group(); ho.add(HELI.holder); HELI.holder.traverse(o => { if (o.isMesh) o.castShadow = true; }); W.scene.add(ho); objs.push(ho); const p0 = me.x * U, q0 = me.y * U; race.heli = { obj: ho, rotors: HELI.rotors, p: new THREE.Vector3(p0 + 30, 34, q0 + 20), look: new THREE.Vector3(p0, 0, q0), yaw: 0 }; }
  $('#game').classList.add('on'); $('#game').classList.toggle('pro', !easy); $('#game').classList.toggle('clash', clash); if (clash) { st.cam = 3; $('#camT').textContent = CAMS[3]; } $('#res').classList.remove('on'); $('#lights').hidden = false; $('#go').hidden = true; $('#pitbox').hidden = true; $('#hint').hidden = true;
  $$('#lights i').forEach(i => i.classList.remove('lit')); W.lamps.forEach(l => l.material.color.set('#2a0505'));
  if (clash) buildTeamUI(team);
  $('#lbName').textContent = clash ? pilotName().toLocaleUpperCase('az') + ' TEAM' : me.num + ' ' + me.name; $('#dcName').textContent = me.num + ' ' + me.name.toLocaleUpperCase('az');
  $('#hwx').textContent = WX[wx][0]; $('#hwxi').innerHTML = WX[wx][2];
  const im = $('#dcImg'); im.src = avOf(ME); im.style.display = '';
  $('#htl').textContent = TYRES[me.tyre].l; $('#htl').style.borderColor = TYRES[me.tyre].c; $('#camT').textContent = CAMS[st.cam];
  presence({ trk: st.track, st: 'grid', go, laps, team: clash ? 1 : null, nm: pilotName(), mdl: g.model, col: g.color, col2: g.color2, pat: g.pattern, num: g.num, x: me.x | 0, y: me.y | 0, a: +me.a.toFixed(2), lap: 0, s: me.idx });
  let last = performance.now();
  const frame = now => { const dt = Math.min(.05, (now - last) / 1000); last = now; tick(dt); draw3(dt); raceRaf = requestAnimationFrame(frame); };
  cancelAnimationFrame(raceRaf); raceRaf = requestAnimationFrame(frame);
}
function buildTeamUI(team) {
  const T = $('#team');
  T.innerHTML = team.map((c, i) => `<div class="tcard" data-i="${i}">
    <div class="tc-top"><b class="tc-pos">P-</b><span class="tc-num">${c.num}</span><span class="tc-code">${esc(c.code)}</span><span class="tc-lap">1. DÖV</span></div>
    <div class="tc-mid"><div class="tc-pace"><button data-p="2" aria-label="Hücum">»</button><button data-p="1" aria-label="Normal">›</button><button data-p="0" aria-label="Qoru">‹</button></div>
      <img src="${c.ava}" alt=""><div class="tc-spd"><b>0</b><small>km/s</small></div>
      <button class="tc-ers" aria-label="ERS boost"><svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-2 8 9-12h-7z"/></svg><i></i></button></div>
    <div class="tc-ty"><span class="tl">S</span><div class="tc-bar"><i></i></div><em>100%</em></div>
    <button class="tc-pit">Pit Stop</button></div>`).join('');
  T.querySelectorAll('.tcard').forEach(el => {
    const c = team[+el.dataset.i];
    el.querySelectorAll('.tc-pace button').forEach(b => b.addEventListener('click', () => { c.pace = +b.dataset.p; click(); updTeamUI(race, race.order || []); }));
    el.querySelector('.tc-ers').addEventListener('click', () => { if (c.erg > .1) { c.boostReq = !c.boostReq; click(); } });
    el.querySelector('.tc-pit').addEventListener('click', () => { if (!race || !race.started || c.done || c.pit) return; openTyrePick(c); });
  });
}
function updTeamUI(R, field) {
  $$('#team .tcard').forEach(el => {
    const c = R.team[+el.dataset.i], pos = field.indexOf(c) + 1, tl = 1 - c.wear;
    el.querySelector('.tc-pos').textContent = 'P' + (pos || '-');
    el.querySelector('.tc-lap').textContent = c.done ? 'FİNİŞ' : clamp(c.lap, 1, R.laps) + '. DÖV';
    el.querySelector('.tc-spd b').textContent = Math.round(c.v * .6);
    el.querySelectorAll('.tc-pace button').forEach(b => b.classList.toggle('on', +b.dataset.p === c.pace));
    const ers = el.querySelector('.tc-ers'); ers.classList.toggle('on', !!c.boosting); ers.querySelector('i').style.transform = 'scaleY(' + c.erg.toFixed(2) + ')';
    const T = TYRES[c.tyre]; const l = el.querySelector('.tl'); l.textContent = T.l; l.style.borderColor = T.c;
    const bar = el.querySelector('.tc-bar i'); bar.style.transform = 'scaleX(' + tl.toFixed(3) + ')'; bar.style.background = tl > .5 ? '#2fe06b' : tl > .25 ? '#edb40b' : '#ff3b2f';
    el.querySelector('em').textContent = Math.round(tl * 100) + '%';
    const pit = el.querySelector('.tc-pit'); pit.classList.toggle('warn', c.wear > .7 && !c.pit && !c.done); pit.textContent = c.pit ? (c.pit.ph === 'stop' ? 'Təkər dəyişir…' : 'Pitə gedir') : 'Pit Stop'; pit.disabled = !!c.pit || c.done;
    el.classList.toggle('focus', R.me === c);
  });
}
function openTyrePick(c) {
  const box = $('#tpick'), wx = race.wx;
  box.innerHTML = `<div class="tp-card"><h4>${esc(c.name)} · Şin seç</h4>${Object.entries(TYRES).map(([k, T]) => `<button data-t="${k}"><i style="border-color:${T.c}">${T.l}</i><span><b>${T.n}</b><small>${k === 'wet' ? (wx === 'rain' ? 'Yağış üçün ən yaxşısı' : 'Quru yolda yavaş') : T.d}</small></span></button>`).join('')}<button class="tp-x">Bağla</button></div>`;
  box.hidden = false;
  box.onclick = e => { const b = e.target.closest('button'); if (!b) { box.hidden = true; return; } if (b.classList.contains('tp-x')) { box.hidden = true; return; } c.pit = { t: 0, ph: 'in', next: b.dataset.t }; box.hidden = true; click(); };
}
function showPrerace() {
  if (needAuth()) return;
  const tr = getTrack(st.track), goEst = Date.now() + 20000, wx = pickWeather(tr, goEst), box = $('#prerace');
  const ga = garage(meKey()), gb = garage(meKey() + '_2'), fix = t => t === 'wet' && wx !== 'rain' ? 'medium' : t, pick = { a: fix(ga.tyre), b: fix(gb.tyre) };
  if (wx === 'rain') { pick.a = 'wet'; pick.b = 'wet'; }
  const render = () => { box.querySelector('.pr-cols').innerHTML = [['a', pilotName(), avOf(ME), ga.num], ['b', 'Yoldaş', avLetter('Yoldaş', gb.color), gb.num]].map(([pk, nm, src, num]) => `<div class="pr-col"><div class="pr-who"><img src="${src}" alt=""><b>${num} ${esc(nm)}</b></div>${Object.entries(TYRES).map(([k, T]) => `<button data-pk="${pk}" data-t="${k}" class="${pick[pk] === k ? 'on' : ''}"><i style="border-color:${T.c}">${T.l}</i><b>${T.n.toUpperCase()}</b></button>`).join('')}</div>`).join(''); };
  box.querySelector('.pr-head').innerHTML = `<b>${esc(tr.def.n)}</b><span>Hava: ${WX[wx][0]}</span><span>${race ? '' : ''}${Math.max(1, tr.def.model ? Math.round(st.laps / 2) : st.laps)} dövrə</span>`;
  render(); box.hidden = false;
  let left = 15; const btn = box.querySelector('.pr-go'); btn.textContent = 'Yarışa başla · ' + left + 's';
  const timer = setInterval(() => { left--; btn.textContent = 'Yarışa başla · ' + left + 's'; if (left <= 0) begin(); }, 1000);
  const begin = () => { clearInterval(timer); box.hidden = true; box.onclick = null; startRace(Date.now() + 3400, st.laps, { tyres: Object.assign({}, pick), wx }); };
  box.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.classList.contains('pr-go')) { click(); begin(); return; } if (b.classList.contains('pr-x')) { clearInterval(timer); box.hidden = true; return; } if (b.dataset.pk) { pick[b.dataset.pk] = b.dataset.t; click(); render(); } };
}
function alertBox(t) { const d = document.createElement('div'); d.className = 'empty'; d.style.cssText = 'position:fixed;left:50%;top:40%;transform:translateX(-50%);z-index:99;background:#111'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 4000); }
function hashStr(s) { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); }
function pitLogic(c, dt, tr) {
  const p = c.pit; if (!p) return false;
  p.t += dt;
  if (p.ph === 'in') { c.gas = 0; c.brake = 1; c.steer = aiSteer(Object.assign({}, c, { lane: HW - 14 }), tr); if (c.v < 8) { c.v = 0; p.ph = 'stop'; p.t = 0; if (c.me) { wrench(); setTimeout(wrench, 900); setTimeout(wrench, 1700); } } }
  else if (p.ph === 'stop') { c.gas = 0; c.brake = 1; c.v = 0; if (p.t > 2.6) { if (p.next) tyreApply(c, p.next, race.wx); c.wear = 0; p.ph = 'out'; p.t = 0; } }
  else { c.pit = null; return false; }
  return true;
}
function tick(dt) {
  const R = race, tr = R.tr, now = Date.now(), t = now - R.go;
  if (t < 0) {
    const lit = clamp(5 - Math.ceil(-t / 600), 0, 5);
    if (lit !== R.lit) { R.lit = lit; $$('#lights i').forEach((e, i) => e.classList.toggle('lit', i < lit)); R.W.lamps.forEach((l, i) => l.material.color.set(i < lit ? '#ff1a0d' : '#2a0505')); if (lit > 0) beep(440, .15); }
  } else if (!R.started) { R.started = true; $('#lights').hidden = true; $('#go').hidden = false; R.W.lamps.forEach(l => l.material.color.set('#2a0505')); beep(880, .35); noiseHit(1.2, 800, .25, .6); setTimeout(() => { $('#go').hidden = true; }, 900); presence({ st: 'run' }); }
  const running = t >= 0;
  for (const c of R.cars) {
    c.ge = c.grip * (1 - .4 * c.wear);
    if (!running) { c.v = 0; continue; }
    if (c.done && c.me && !c.pit) { c.steer = aiSteer(c, tr); const vt = aiSpeed(c, tr) * .55; c.gas = c.v < vt ? 1 : 0; c.brake = c.v > vt + 35 ? 1 : 0; }
    else if (pitLogic(c, dt, tr)) {}
    else if (c.me && R.clash) {
      c.steer = aiSteer(c, tr); const pf = [.88, .96, 1.07][c.pace], vt = aiSpeed(c, tr) * pf / Math.max(.6, c.skill); c.gas = c.v < vt ? 1 : 0; c.brake = c.v > vt + 35 ? 1 : 0;
      if (c.boostReq && c.erg < .03) c.boostReq = false; const wasB = c.boosting; c.boosting = !!c.boostReq && c.erg > .02; if (c.boosting && !wasB) whoosh();
    }
    else if (c.me) {
      const ai = aiSteer(c, tr, 7), inp = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      c.steer = R.easy ? clamp(inp + ai * (inp ? .35 : .9), -1, 1) : inp;
      if (R.easy) { const vt = tr.vmax[c.idx] * 1.08 * c.ge; c.gas = keys.brake ? 0 : (c.v < Math.max(vt, aiSpeed(c, tr) * 1.05) ? 1 : 0); c.brake = keys.brake ? 1 : 0; }
      else { c.gas = keys.gas ? 1 : 0; c.brake = keys.brake ? 1 : 0; }
      const wasB = c.boosting; c.boosting = !!keys.boost && c.erg > .02; if (c.boosting && !wasB) whoosh();
    } else {
      c.steer = aiSteer(c, tr); const vt = aiSpeed(c, tr) * (c.done ? .55 : 1); c.gas = c.v < vt ? 1 : 0; c.brake = c.v > vt + 35 ? 1 : 0;
      if (!c.done) { c.boosting = c.erg > .5 && tr.vmax[(c.idx + 40) % tr.n] > TOP && Math.random() < .02 ? true : (c.boosting && c.erg > .1); if (c.wear > .72 && !c.pit && c.lap < R.laps && tr.vmax[c.idx] > TOP * .9) c.pit = { t: 0, ph: 'in' }; }
    }
    if (!c.done) c.wear = Math.min(1, c.wear + c.wearRate * dt * (c.v / TOP) * (1 + Math.abs(c.steer) * .6) * (c.me && R.clash ? [.6, 1, 1.75][c.pace] : 1));
    const crossed = step(c, tr, dt);
    if (crossed && !c.done) {
      if (c.lap >= 2 && c.lapT0 != null) { const lt = now - c.lapT0; c.laps.push(lt); if (!c.best || lt < c.best) c.best = lt; }
      c.lapT0 = now;
      if (c.lap > R.laps) { c.done = true; c.fin = now - R.go; R.finished.push(c); if (c.me) finishCar(c); }
    }
  }
  if (running) collide(R.cars);
  if (eng && AC) { try { const v = R.me.v / TOP, G = [0, .2, .36, .5, .63, .76, .88, 2], kmh = v; let gi = 1; while (gi < 7 && kmh > G[gi]) gi++; if (gi !== eng.gear) { if (gi > eng.gear) noiseHit(.06, 500, .08, 2); eng.gear = gi; } const lo = G[gi - 1], hi = G[gi], rpm = clamp((kmh - lo) / Math.max(.01, hi - lo), 0, 1), t = AC.currentTime, base = 70 + gi * 9 + rpm * (120 + gi * 18) + (R.me.boosting ? 30 : 0); eng.o.frequency.setTargetAtTime(base, t, .03); eng.o2.frequency.setTargetAtTime(base * 1.005, t, .03); eng.o3.frequency.setTargetAtTime(base / 2, t, .03); eng.f.frequency.setTargetAtTime(700 + rpm * 1800 + v * 600, t, .05); eng.gn.gain.setTargetAtTime(R.over || !R.started ? (R.started ? 0 : .02) : .03 + v * .035, t, .1); if (crowd) crowd.gain.setTargetAtTime(R.over ? 0 : .015 + (R.me.idx < 120 || R.me.idx > R.tr.n - 120 ? .04 : 0), t, .4); } catch (e) {} }
  // peers
  for (const p of st.peers) {
    if (p.sameTab || !p.presence || p.presence.trk !== st.track || !(p.presence.st === 'run' || p.presence.st === 'grid' || p.presence.st === 'done')) continue;
    const q = p.presence; let o = R.peers.get(p.peer);
    if (!o) { const nm = String(q.nm || 'Pilot').slice(0, 16); o = newCar({ peer: true, model: q.mdl === 'classic' || XM[q.mdl] ? q.mdl : 'modern', name: nm, code: codeOf(nm), color: okCol(q.col, '#888888'), color2: okCol(q.col2, '#ffffff'), pattern: PATTERNS.some(x => x[0] === q.pat) ? q.pat : 'solid', num: (+q.num || 0) % 100, x: +q.x || 0, y: +q.y || 0, a: +q.a || 0, tyre: 'medium' }); o.obj = makeCar3D(o); o.tag = tagSprite(o.code, '#2fe06b'); o.obj.add(o.tag); R.W.scene.add(o.obj); R.objs.push(o.obj); R.peers.set(p.peer, o); }
    const k = Math.min(1, dt * 12); o.x += ((+q.x || 0) - o.x) * k; o.y += ((+q.y || 0) - o.y) * k; o.a += angN((+q.a || 0) - o.a) * k;
    o.lap = +q.lap || 0; o.idx = clamp(+q.s || 0, 0, tr.n - 1); o.v = +q.v || 0; o.steer = 0;
    if (q.st === 'done' && !o.done) { o.done = true; o.fin = +q.fin || (now - R.go); R.finished.push(o); }
    if (q.x2 != null) { let o2 = R.peers.get(p.peer + '#2'); if (!o2) { o2 = newCar({ peer: true, model: 'modern', name: o.name + ' 2', code: o.code.slice(0, 2) + '2', color: o.color, color2: o.color2, pattern: o.pattern, num: (o.num + 1) % 100, x: +q.x2 || 0, y: +q.y2 || 0, a: +q.a2 || 0, tyre: 'medium' }); o2.obj = makeCar3D(o2); o2.tag = tagSprite(o2.code, '#2fe06b'); o2.obj.add(o2.tag); R.W.scene.add(o2.obj); R.objs.push(o2.obj); R.peers.set(p.peer + '#2', o2); }
      o2.x += ((+q.x2 || 0) - o2.x) * k; o2.y += ((+q.y2 || 0) - o2.y) * k; o2.a += angN((+q.a2 || 0) - o2.a) * k; o2.lap = +q.lap2 || 0; o2.idx = clamp(+q.s2 || 0, 0, tr.n - 1); o2.v = +q.v2 || 0; o2.steer = 0;
      if (q.st === 'done' && !o2.done) { o2.done = true; o2.fin = (+q.fin2 || +q.fin || (now - R.go)) + 1; R.finished.push(o2); } }
  }
  if (R.clash) { const pr = c => c.done ? 1e9 - c.fin : c.lap * tr.L + c.idx * STEP, best = R.team.reduce((x, y) => pr(y) > pr(x) ? y : x); if (best !== R.me && !R.camLock) { R.me = best; } }
  if (now - R.lastP > 66) { R.lastP = now; const m = R.clash ? R.team[0] : R.me, m2 = R.clash ? R.team[1] : null; presence(Object.assign({ x: m.x | 0, y: m.y | 0, a: +m.a.toFixed(2), lap: m.lap, s: m.idx, v: m.v | 0 }, m2 ? { x2: m2.x | 0, y2: m2.y | 0, a2: +m2.a.toFixed(2), lap2: m2.lap, s2: m2.idx, v2: m2.v | 0 } : {})); }
  const field = [...R.cars, ...R.peers.values()];
  const prog = c => c.done ? 1e9 - c.fin : c.lap * tr.L + c.idx * STEP;
  field.sort((a, b) => prog(b) - prog(a)); R.order = field;
  if (now - R.lastHud > 120) { R.lastHud = now; hud(R, t, field); }
  $('#hspd').textContent = Math.round(R.me.v * .6);
}
function hud(R, t, field) {
  const me = R.me, pos = field.indexOf(me) + 1;
  $('#hpos').textContent = 'P' + pos; $('#hlap').textContent = clamp(me.lap, 1, R.laps) + '/' + R.laps;
  $('#htime').textContent = fmt(Math.max(0, me.done ? me.fin : t)); $('#hbest').textContent = 'Ən yaxşı ' + (me.best ? fmt(me.best) : '—');
  $('#hers').style.transform = 'scaleX(' + me.erg.toFixed(3) + ')'; $('#hersT').textContent = Math.round(me.erg * 100) + '%';
  const tl = 1 - me.wear; $('#hwear').style.transform = 'scaleX(' + tl.toFixed(3) + ')'; $('#hwear').style.background = tl > .5 ? 'linear-gradient(90deg,#2fe06b,#9be15d)' : tl > .25 ? '#edb40b' : '#ff3b2f'; $('#hwearT').textContent = Math.round(tl * 100) + '%';
  $('#bBoost').classList.toggle('low', me.erg < .05);
  const worn = me.wear > .7 && !me.pit && !me.done; $('#bPit').classList.toggle('warn', worn); $('#hint').hidden = !worn;
  const pb = $('#pitbox'); if (me.pit && me.pit.ph === 'stop') { pb.hidden = false; $('#pbar').style.transform = 'scaleX(' + Math.min(1, me.pit.t / 2.6).toFixed(3) + ')'; } else pb.hidden = true;
  const lead = field[0];
  $('#tower').innerHTML = field.slice(0, 8).map((c, i) => { const gap = i === 0 ? 'Lider' : c.pit ? 'PIT' : c.done ? 'Finiş' : '+' + Math.max(0, ((lead.lap * R.tr.L + lead.idx * STEP) - (c.lap * R.tr.L + c.idx * STEP)) / Math.max(200, lead.v || 300)).toFixed(1); return `<li class="${c.me ? 'me' : ''} ${c.pit ? 'pit' : ''}"><b>${i + 1}</b><i style="background:${esc(c.color)}"></i><span>${esc(c.code || '')}</span><small>${gap}</small></li>`; }).join('');
  field.forEach((c, i) => c.tag && c.tag.userData.set('P' + (i + 1) + ' ' + c.code, c.me ? '#e10600' : c.peer ? '#2fe06b' : c.color));
  if (R.clash) updTeamUI(R, field);
}
const V3 = HAS3D ? new THREE.Vector3() : null;
function draw3(dt) {
  const R = race, { r, cam, rain } = R.X, W = R.W, cv = r.domElement, w = cv.clientWidth, h = cv.clientHeight;
  const pr = Math.min(R.X.mobile ? 1.5 : 2, devicePixelRatio || 1);
  if (cv.width !== Math.round(w * pr) || cv.height !== Math.round(h * pr)) { r.setPixelRatio(pr); r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  heliUpdate(R, dt); if (R.heli) R.heli.obj.visible = st.cam !== 3;
  const all = [...R.cars, ...R.peers.values()];
  for (const c of all) if (c.obj) { animCar(c.obj, c, dt); c.tag.visible = c !== R.me || st.cam !== 2; if (c.me) c.obj.visible = c !== R.me || st.cam !== 2; }
  const me = R.me, px = me.x * U, pz = me.y * U, fx = Math.cos(me.a), fz = Math.sin(me.a), sp = me.v / TOP;
  if (!R.cam) R.cam = { x: px - fx * 9, y: 3, z: pz - fz * 9, h: me.a };
  const k = 1 - Math.exp(-dt * 6);
  R.cam.h += angN(me.a - R.cam.h) * (1 - Math.exp(-dt * 4));
  const hx = Math.cos(R.cam.h), hz = Math.sin(R.cam.h);
  let tx, ty, tz, lx, ly, lz, fov = 60 + sp * 14;
  if (st.cam === 0) { tx = px - hx * (8 + sp * 1.5); ty = 2.8; tz = pz - hz * (8 + sp * 1.5); lx = px + hx * 6; ly = 1; lz = pz + hz * 6; }
  else if (st.cam === 1) { tx = px - hx * 18 - hz * 14; ty = 22; tz = pz - hz * 18 + hx * 14; lx = px + hx * 4; ly = 0; lz = pz + hz * 4; fov = 50; }
  else if (st.cam === 2) { tx = px + fx * .35; ty = 1.02; tz = pz + fz * .35; lx = px + fx * 20; ly = .6; lz = pz + fz * 20; fov = 72 + sp * 10; }
  else { const H = R.heli; if (H) { const t = performance.now() / 1000; tx = H.p.x; ty = H.p.y - 1.6; tz = H.p.z; lx = H.look.x + Math.sin(t * .7) * .35; ly = .3; lz = H.look.z + Math.cos(t * .6) * .35; const d = Math.hypot(tx - lx, ty, tz - lz); fov = clamp(2 * Math.atan(16 / d) * 180 / Math.PI, 14, 40) + Math.sin(t * .23) * 2; } else { tx = px; ty = 40; tz = pz + 20; lx = px; ly = 0; lz = pz; fov = 40; } }
  if (st.cam === 3) R.cam = { x: tx, y: ty, z: tz, h: R.cam.h }; else if (st.cam !== 1) R.cam = { x: tx, y: ty, z: tz, h: R.cam.h }; else { R.cam.x += (tx - R.cam.x) * k; R.cam.y += (ty - R.cam.y) * k; R.cam.z += (tz - R.cam.z) * k; }
  const shake = me.v > TOP * .8 ? (Math.random() - .5) * .04 * sp : 0;
  cam.position.set(R.cam.x, R.cam.y + shake, R.cam.z); cam.lookAt(lx, ly, lz);
  if (Math.abs(cam.fov - fov) > .2) { cam.fov += (fov - cam.fov) * .1; cam.updateProjectionMatrix(); }
  W.sun.position.set(px + 30, 60, pz + 20); W.sun.target.position.set(px, 0, pz);
  if (rain.parent) { const a = rain.geometry.attributes.position.array; for (let i = 1; i < a.length; i += 6) { a[i] -= dt * 45; a[i + 3] -= dt * 45; if (a[i] < -12) { a[i] += 45; a[i + 3] += 45; } } rain.geometry.attributes.position.needsUpdate = true; rain.position.set(cam.position.x, cam.position.y + 10, cam.position.z); }
  $('#sfx').style.opacity = clamp((sp - .55) * 1.6 + (me.boosting ? .35 : 0), 0, .9).toFixed(2);
  r.render(W.scene, cam);
  // minimap
  const m = $('#mini'), mg = m.getContext('2d'), mw = m.clientWidth, mh = m.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
  if (m.width !== mw * dpr) { m.width = mw * dpr; m.height = mh * dpr; }
  const s = Math.min((mw - 16) / R.tr.W, (mh - 16) / R.tr.H);
  mg.setTransform(dpr * s, 0, 0, dpr * s, dpr * (mw - R.tr.W * s) / 2, dpr * (mh - R.tr.H * s) / 2);
  mg.clearRect(-1e4, -1e4, 3e4, 3e4); mg.strokeStyle = 'rgba(255,255,255,.85)'; mg.lineWidth = 90; mg.lineJoin = 'round'; mg.stroke(R.tr.road);
  for (const c of all) { mg.fillStyle = c.color; mg.beginPath(); mg.arc(c.x, c.y, c.me ? 130 : 90, 0, 7); mg.fill(); if (c.me) { mg.strokeStyle = '#fff'; mg.lineWidth = 40; mg.stroke(); } }
}
function finishCar(c) {
  if (!ME && c === (race.clash ? race.team[0] : race.me)) LS.set('guestRaces', LS.get('guestRaces', 0) + 1);
  const R = race, pos = R.finished.indexOf(c) + 1, tr = R.tr, key = meKey(), own = !R.clash || c === R.team[0];
  const r = own ? rec(key) : { med: [0, 0, 0], pts: {}, best: {} }, g = myGarage();
  r.nm = pilotName(); r.base = 'custom'; r.av = ME ? ME.av : ''; r.col = g.color; r.num = g.num;
  r.races = (r.races || 0) + 1; if (pos === 1) r.wins = (r.wins || 0) + 1;
  r.med = r.med || [0, 0, 0]; if (pos <= 3) r.med[pos - 1]++;
  const pts = PTS[pos - 1] || 0; r.pts = r.pts || {}; const prevPts = r.pts[tr.def.id] || 0; r.pts[tr.def.id] = Math.max(prevPts, pts);
  r.best = r.best || {}; const newRec = c.best && (!r.best[tr.def.id] || c.best < r.best[tr.def.id]); if (newRec) r.best[tr.def.id] = c.best;
  c.res = { pos, pts, newRec };
  const mineAll = R.clash ? R.team : [c];
  if (mineAll.every(x => x.done)) {
    presence(Object.assign({ st: 'done', fin: mineAll[0].fin }, R.clash ? { fin2: mineAll[1].fin } : {}));
    saveLeague();
    setTimeout(() => showResult(Math.min(...mineAll.map(x => x.res.pos)), mineAll.reduce((s, x) => s + x.res.pts, 0), prevPts, mineAll.some(x => x.res.newRec)), 1200);
  }
}
function showResult(pos, pts, prevPts, newRec) {
  const R = race; if (!R) return;
  const prog = c => c.done ? 1e9 - c.fin : c.lap * R.tr.L + c.idx * STEP;
  const field = [...R.cars, ...R.peers.values()].sort((a, b) => prog(b) - prog(a));
  $('#rtitle').textContent = pos === 1 ? 'Qalib!' : (R.clash ? 'Ən yaxşı P' : 'P') + pos;
  $('#rpts').textContent = R.clash ? R.team.map(c => c.name + ' P' + c.res.pos + ' (+' + c.res.pts + ')').join(' · ') + (newRec ? ' · yeni dövrə rekordu' : '') : '+' + pts + ' xal' + (pts > prevPts ? ' · trek üçün yeni ən yaxşı nəticə' : '') + (newRec ? ' · yeni dövrə rekordu ' + fmt(R.me.best) : '');
  $('#rlist').innerHTML = field.map((c, i) => `<li class="${c.me ? 'me' : ''}"><span>${i < 3 ? `<span class="disc d${i + 1}" style="width:26px;height:26px">${i + 1}</span>` : 'P' + (i + 1)}</span><i style="background:${esc(c.color)}"></i><span>${esc(c.name)}${c.peer ? ' · onlayn' : c.bot ? ' · kompüter' : ''}</span><span class="t">${c.done ? fmt(c.fin) : 'yarışır'}</span></li>`).join('');
  $('#res').classList.add('on'); R.over = true;
  if (pos <= 3) cheer();
}
function endRace() {
  if (!race) return; cancelAnimationFrame(raceRaf);
  race.objs.forEach(o => race.W.scene.remove(o)); race = null;
  for (const k in keys) keys[k] = 0; $('#game').classList.remove('on'); $('#tpick').hidden = true;
  if (eng) try { eng.gn.gain.value = 0; } catch (e) {}
  presence({ st: 'lobby', go: null, fin: null }); renderHome();
  const v = location.hash.slice(1) || 'home'; if (v === 'home') startLobby(); if (v === 'garage') startGarage();
}
$('#exit').addEventListener('click', endRace);
$('#again').addEventListener('click', () => { endRace(); if (st.diff === 'clash') showPrerace(); else startRace(Date.now() + 3400, st.laps); });
$('#totable').addEventListener('click', () => { endRace(); location.hash = 'table'; });
$('#tolobby').addEventListener('click', () => { endRace(); location.hash = 'race'; renderLobby(); });

/* ---------- table ---------- */
let ttab = 'champ', recTrack = 'baku';
$('#ttabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { ttab = b.dataset.t; renderTable(); } });
function who(r) { if (false) return `<span class="who"><img src="${PILOTS[r.av].poster}" alt="">${esc(r.nm)}</span>`; if (r.base !== 'custom') return `<span class="who"><img src="${PILOTS[r.base].poster}" alt="">${esc(r.nm)}</span>`; return `<span class="who"><i style="background:${esc(r.col)}">${esc((r.nm || '?').slice(0, 1).toUpperCase())}</i>${esc(r.nm || 'Pilot')}</span>`; }
function renderTable() {
  $$('#ttabs button').forEach(b => b.classList.toggle('on', b.dataset.t === ttab));
  const s = standings(), B = $('#tbody');
  $('#tnote').textContent = st.db ? (st.canWrite ? 'Nəticələr bütün oyunçular üçün canlı yenilənir.' : 'Bu link ilə yalnız baxa bilirsən; nəticələrin bu cihazda saxlanır.') : 'Nəticələr bu cihazda saxlanır.';
  if (!s.length) { B.innerHTML = '<div class="empty">Hələ yarış yoxdur. İlk yarışı qazan və cədvəldə birinci ol!</div>'; return; }
  if (ttab === 'champ') {
    s.sort((a, b) => b.total - a.total || b.wins - a.wins);
    const top = s.slice(0, 3), order = [top[1], top[0], top[2]];
    B.innerHTML = `<div class="champ">${order.map((r, i) => r ? `<div class="pod p${[2, 1, 3][i]}"><span class="disc d${[2, 1, 3][i]}">${[2, 1, 3][i]}</span><b>${esc(r.nm)}</b><span>${r.total} xal</span></div>` : '<div></div>').join('')}</div>
    <table class="tbl"><thead><tr><th>Yer</th><th>Pilot</th>${TRACKS.map(t => `<th class="n hide">${t.n.split(' ')[0]}</th>`).join('')}<th class="n">Xal</th></tr></thead><tbody>${s.map((r, i) => `<tr class="c${i + 1}"><td class="p">${i + 1}</td><td>${who(r)}</td>${TRACKS.map(t => `<td class="n hide">${r.pts[t.id] || '·'}</td>`).join('')}<td class="n"><b>${r.total}</b></td></tr>`).join('')}</tbody></table>`;
  } else if (ttab === 'med') {
    s.sort((a, b) => b.med[0] - a.med[0] || b.med[1] - a.med[1] || b.med[2] - a.med[2]);
    B.innerHTML = `<table class="tbl"><thead><tr><th>Yer</th><th>Pilot</th>${[1, 2, 3].map(i => `<th class="n"><span class="disc d${i}" style="display:inline-grid;width:24px;height:24px">${i}</span></th>`).join('')}<th class="n hide">Yarış</th></tr></thead><tbody>${s.map((r, i) => `<tr class="c${i + 1}"><td class="p">${i + 1}</td><td>${who(r)}</td><td class="n">${r.med[0]}</td><td class="n">${r.med[1]}</td><td class="n">${r.med[2]}</td><td class="n hide">${r.races}</td></tr>`).join('')}</tbody></table>`;
  } else {
    const rows = s.filter(r => r.best[recTrack]).sort((a, b) => a.best[recTrack] - b.best[recTrack]);
    B.innerHTML = `<div class="tabs" id="rtabs">${TRACKS.map(t => `<button data-r="${t.id}" class="${t.id === recTrack ? 'on' : ''}">${t.n}</button>`).join('')}</div>` + (rows.length ? `<table class="tbl"><thead><tr><th>Yer</th><th>Pilot</th><th class="n">Ən yaxşı dövrə</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="c${i + 1}"><td class="p">${i + 1}</td><td>${who(r)}</td><td class="n">${fmt(r.best[recTrack])}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">Bu trekdə hələ rekord yoxdur.</div>');
    $('#rtabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { recTrack = b.dataset.r; renderTable(); } });
  }
}

/* ---------- online ---------- */
let presQ = {};
function presence(p) { Object.assign(presQ, p); if (st.room) st.room.presence(p).catch(() => {}); }
function updOnline() {
  const n = st.peers.length || 1, el = $('#online');
  el.classList.toggle('live', !!st.room); el.querySelector('span').textContent = st.room ? n + ' onlayn' : 'Oflayn';
  $('#s-on').textContent = n;
}
async function connect() {
  if (!(window.claude && window.claude.use)) return;
  try {
    const [db, user, room] = await Promise.all([claude.use('db'), claude.use('user'), claude.use('room')]);
    st.user = user;
    if (user) { try { st.uid = await user.id(); } catch (e) {} try { const c = await user.can('data.write'); if (c === false) st.canWrite = false; } catch (e) {} }
    if (room) {
      st.room = room;
      room.onPeers(ch => { st.peers = ch.peers.slice(); updOnline(); if ($('#v-race').classList.contains('on') && !race) { renderPeers(); maybeJoin(); } }, () => { st.room = null; updOnline(); });
      const g = myGarage(); room.presence(Object.assign({ nm: pilotName(), mdl: g.model, col: g.color, col2: g.color2, pat: g.pattern, num: g.num }, presQ)).catch(() => {});
      updOnline();
    }
    if (db && st.uid) {
      st.db = db;
      try { const snap = await db.doc('league/' + st.uid).get(); if (snap.exists) { const ps = (snap.data() || {}).pilots || {}; for (const k in ps) st.mine.pilots[k] = st.mine.pilots[k] ? mergeRec(st.mine.pilots[k], ps[k]) : JSON.parse(JSON.stringify(ps[k])); LS.set('league', st.mine); } } catch (e) {}
      db.collection('league').onSnapshot(q => { const all = {}; q.docs.forEach(d => { if (d.exists) all[d.id] = d.data(); }); st.all = all; renderHome(); if ($('#v-table').classList.contains('on')) renderTable(); }, () => {});
      if (Object.keys(st.mine.pilots).length) saveLeague();
    }
    renderHome();
  } catch (e) {}
}
function maybeJoin() {
  if (race || location.hash !== '#race') return;
  const host = st.peers.find(p => !p.sameTab && p.presence && p.presence.trk === st.track && p.presence.st === 'grid' && +p.presence.go > Date.now() + 900);
  if (host) { audioInit(); const l = +host.presence.laps; startRace(+host.presence.go, [2, 3, 5].includes(l) ? l : st.laps); }
}



/* ---------- accounts (username + personal code, like Safiverse) ---------- */
const AVS = [['#e10600', 'c'], ['#1e5bd8', 'c'], ['#18a558', 'c'], ['#ff8a00', 'c'], ['#7a3cff', 'c'], ['#ff4fa0', 'c']];
let ME = LS.get('session', null), regAv = '#e10600';
const PRIV_AV = {};
function avLetter(name, col) { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.fillStyle = okCol(col, '#e10600'); g.fillRect(0, 0, 96, 96); g.fillStyle = '#fff'; g.font = '900 52px "Titillium Web",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText((name || '?').slice(0, 1).toLocaleUpperCase('az'), 48, 52); return c.toDataURL(); }
function avOf(acc) { if (!acc) return avLetter('Q', '#4a4f5c'); if (acc.av === 'photo' && typeof acc.photo === 'string' && acc.photo.startsWith('data:image/')) return acc.photo; if (PRIV_AV[acc.av]) return PRIV_AV[acc.av]; return avLetter(acc.name, acc.av); }
function myStats() { const s = standings(), n = pilotName(); return s.find(x => x.nm === n && x.base === 'custom') || { total: 0, races: 0, wins: 0, med: [0, 0, 0], best: {} }; }
function avHTML(av, name) { if (PRIV_AV[av]) return `<img src="${PRIV_AV[av]}" alt="">`; return `<span style="background:${okCol(av, '#e10600')};width:100%;height:100%;display:grid;place-items:center">${esc((name || '?').slice(0, 1).toLocaleUpperCase('az'))}</span>`; }
function avSrc(av, name) { const A = AVS.find(x => x[0] === av); if (A && A[1] === 'img') return A[2]; const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.fillStyle = okCol(av, '#e10600'); g.fillRect(0, 0, 96, 96); g.fillStyle = '#fff'; g.font = '900 52px "Titillium Web",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText((name || '?').slice(0, 1).toLocaleUpperCase('az'), 48, 52); return c.toDataURL(); }
async function sha(s) { try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); } catch (e) { let h = 5381; for (const ch of s) h = ((h << 5) + h + ch.charCodeAt(0)) | 0; return 'x' + (h >>> 0).toString(16); } }
function newCode() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const r = new Uint32Array(6); try { crypto.getRandomValues(r); } catch (e) { for (let i = 0; i < 6; i++) r[i] = Math.random() * 1e9; } return [...r].map(v => A[v % A.length]).join(''); }
const normUser = u => String(u || '').trim().toLowerCase();
const validUser = u => /^[a-z0-9_]{3,16}$/.test(u);
async function accGet(u) { if (st.db) { try { const s = await st.db.doc('accounts/' + u).get(); return s.exists ? s.data() : null; } catch (e) { } } return (LS.get('accounts', {}))[u] || null; }
async function accPut(u, body) { const loc = LS.get('accounts', {}); loc[u] = body; LS.set('accounts', loc); if (st.db) { try { const ref = st.db.doc('accounts/' + u); const l = await ref.acquire({ holder: u + ':' + Date.now(), ttlMs: 5000 }); if (!l.acquired) return 'busy'; const ex = await ref.get(); if (ex.exists) return 'taken'; await ref.set(body); return 'ok'; } catch (e) { return 'local'; } } return 'local'; }
function applySession() {
  if (!ME) return;
  $('#gAva').src = avOf(ME); $('#gName').textContent = ME.name;
  homeCity = null; if (L3) L3.key = ''; renderHome(); const v = location.hash.slice(1) || 'home'; if (v === 'home') { renderLobbyUI(); lobCar(); } if (v === 'profile') renderProfile();
}
async function accSave(patch) {
  if (!ME) return; Object.assign(ME, patch); LS.set('session', ME);
  const u = ME.user, loc = LS.get('accounts', {}); if (loc[u]) { Object.assign(loc[u], patch); LS.set('accounts', loc); }
  if (st.db) { try { const ref = st.db.doc('accounts/' + u), s = await ref.get(); if (s.exists) await ref.set(Object.assign({}, s.data(), patch)); } catch (e) {} }
  applySession();
}
function showAuth(mode, msg) {
  const A = $('#auth'); A.hidden = false; setAuthMode(mode || 'login');
  $('#auNote').textContent = msg || (st.db ? 'Hesabın bütün cihazlarda işləyir.' : 'Hesab bu cihazda saxlanılır.');
  $('#rgAv').innerHTML = AVS.map(([k]) => `<button type="button" data-av="${k}" class="${k === regAv ? 'on' : ''}">${avHTML(k, $('#rgName').value || '?')}</button>`).join('');
  $('#auGuest').hidden = LS.get('guestRaces', 0) >= 1;
}
function setAuthMode(m) { $$('.au-tabs button').forEach(b => b.classList.toggle('on', b.dataset.m === m)); $('#auLogin').hidden = m !== 'login'; $('#auReg').hidden = m !== 'reg'; $('#auCode').hidden = true; $('.au-tabs').hidden = false; }
$('.au-tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setAuthMode(b.dataset.m); });
$('#rgAv').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; regAv = b.dataset.av; $$('#rgAv button').forEach(x => x.classList.toggle('on', x === b)); });
$('#rgName').addEventListener('input', () => { $$('#rgAv button').forEach(b => { const k = b.dataset.av; b.innerHTML = avHTML(k, $('#rgName').value || '?'); }); if (!$('#rgUser').dataset.touched) $('#rgUser').value = normUser($('#rgName').value).replace(/[^a-z0-9_əğıöşüç]/g, '').replace(/[əğıöşüç]/g, c => ({ ə: 'e', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', ç: 'c' }[c])).slice(0, 16); });
$('#rgUser').addEventListener('input', e => { e.target.dataset.touched = 1; });
$('#auReg').addEventListener('submit', async e => {
  e.preventDefault(); const err = $('#rgErr'), name = $('#rgName').value.trim().slice(0, 16), u = normUser($('#rgUser').value), btn = e.target.querySelector('button[type=submit]');
  if (name.length < 2) { err.textContent = 'Pilotun adını yaz.'; return; }
  if (!validUser(u)) { err.textContent = 'İstifadəçi adı 3–16 simvol olsun: kiçik latın hərfləri, rəqəm və _'; return; }
  btn.disabled = true; err.textContent = '';
  if (await accGet(u)) { err.textContent = 'Bu istifadəçi adı artıq tutulub. Başqasını seç.'; btn.disabled = false; return; }
  const code = newCode(), salt = newCode() + newCode(), body = { name, av: regAv, salt, hash: await sha(salt + ':' + code), t: Date.now() };
  const r = await accPut(u, body); btn.disabled = false;
  if (r === 'taken' || r === 'busy') { err.textContent = 'Bu istifadəçi adı artıq tutulub. Başqasını seç.'; return; }
  ME = { user: u, name, av: regAv }; LS.set('session', ME); LS.set('guestRaces', 0);
  $('#auReg').hidden = true; $('#auLogin').hidden = true; $('.au-tabs').hidden = true; $('#auGuest').hidden = true;
  $('#cdName').textContent = name; $('#cdCode').textContent = code; $('#cdUser').textContent = u; $('#auCode').hidden = false; cheer();
});
$('#cdCopy').addEventListener('click', () => { const t = 'Mini F1 · istifadəçi adı: ' + $('#cdUser').textContent + ' · kod: ' + $('#cdCode').textContent; try { navigator.clipboard.writeText(t).then(() => { $('#cdCopy').textContent = 'Kopyalandı'; }); } catch (e) {} });
$('#cdGo').addEventListener('click', () => { $('#auth').hidden = true; applySession(); });
$('#auLogin').addEventListener('submit', async e => {
  e.preventDefault(); const err = $('#liErr'), u = normUser($('#liUser').value), code = $('#liCode').value.trim().toUpperCase(), btn = e.target.querySelector('button[type=submit]');
  if (!u || !code) { err.textContent = 'İstifadəçi adı və kodu yaz.'; return; }
  btn.disabled = true; err.textContent = '';
  const acc = await accGet(u); btn.disabled = false;
  if (!acc || typeof acc.salt !== 'string' || (await sha(acc.salt + ':' + code)) !== acc.hash) { err.textContent = 'İstifadəçi adı və ya kod səhvdir.'; return; }
  ME = { user: u, name: String(acc.name || u).slice(0, 16), av: (AVS.some(x => x[0] === acc.av) || acc.av === 'photo' || PRIV_AV[acc.av]) ? acc.av : '#e10600', photo: typeof acc.photo === 'string' && acc.photo.startsWith('data:image/') ? acc.photo : '' }; LS.set('session', ME); if (acc.garage && typeof acc.garage === 'object') { if (acc.garage.a) LS.set('g.u_' + u, acc.garage.a); if (acc.garage.b) LS.set('g.u_' + u + '_2', acc.garage.b); }
  $('#auth').hidden = true; applySession(); whoosh();
});
$('#auGuest').addEventListener('click', () => { $('#auth').hidden = true; ME = null; });
$('#gMe').addEventListener('click', e => { e.preventDefault(); if (!ME) { showAuth('login'); return; } location.hash = 'profile'; });
$('#pfX').addEventListener('click', () => { $('#prof').hidden = true; });
$('#pfOut').addEventListener('click', () => { ME = null; LS.set('session', null); $('#prof').hidden = true; showAuth('login', 'Hesabdan çıxdın.'); });

/* ---------- profile (like Safiverse) ---------- */
const PRIV_HASH = 'e3ad4f85a80fb45d17e042e0e5f4783b3d776335e33e856b1c00c91e30323b55';
function renderProfile() {
  const P = $('#pfPage'); if (!P) return;
  if (!ME) { P.innerHTML = `<div class="pf-empty"><p>Profilə baxmaq üçün daxil ol.</p><button class="au-btn" id="pfLogin" type="button">Daxil ol / Qeydiyyat</button></div>`; $('#pfLogin').onclick = () => showAuth('login'); return; }
  const r = myStats(), g = myGarage(), unlocked = LS.get('priv', false), lvl = 1 + Math.floor(r.races / 3);
  const colors = AVS.map(([c]) => `<button type="button" data-av="${c}" class="${ME.av === c ? 'on' : ''}" style="background:${c}">${esc(ME.name.slice(0, 1).toLocaleUpperCase('az'))}</button>`).join('');
  P.innerHTML = `
  <div class="pf-head">
    <button class="pf-ava" id="pfPick" type="button" aria-label="Şəkli dəyiş"><img src="${avOf(ME)}" alt=""><i>✎</i></button>
    <div><b>${esc(ME.name)}</b><small>@${esc(ME.user)} · Səviyyə ${lvl}</small><div class="pf-pills"><span class="g-pill coin"><i>₼</i><b>${coinsOf().toLocaleString('az')}</b></span><span class="g-pill med"><i>★</i><b>${r.total}</b></span></div></div>
  </div>
  <div class="pf-stats"><div><b>${r.races}</b><small>Yarış</small></div><div><b>${r.wins || 0}</b><small>Qələbə</small></div><div><b>${r.med[0]}</b><small>Qızıl</small></div><div><b>${r.med[1]}</b><small>Gümüş</small></div><div><b>${r.med[2]}</b><small>Bürünc</small></div><div><b>#${g.num}</b><small>Bolid</small></div></div>
  <section class="pf-sec"><h3>Profili tənzimlə</h3>
    <label class="pf-lbl">Ad<div class="pf-row"><input id="pfNameIn" maxlength="16" value="${esc(ME.name)}"><button class="pf-save" id="pfNameSave" type="button">Yadda saxla</button></div></label>
    <div class="pf-lbl">Profil şəkli</div>
    <div class="pf-avs">${colors}<button type="button" class="pf-up" id="pfUp">＋<small>Şəkil yüklə</small></button></div>
    <input type="file" id="pfFile" accept="image/*" hidden>
    <p class="pf-msg" id="pfMsg"></p>
  </section>
  <section class="pf-sec priv"><h3>🔒 Şəxsi bölmə</h3>
    ${unlocked ? `<p>Xüsusi profil şəkilləri:</p><div class="pf-avs big">${Object.entries(PRIV_AV).map(([k, src]) => `<button type="button" data-av="${k}" class="${ME.av === k ? 'on' : ''}"><img src="${src}" alt=""></button>`).join('')}</div><button class="pf-lock" id="pfLock" type="button">Bölməni bağla</button>`
    : `<p>Bu bölməyə daxil olmaq üçün kodu yaz.</p><div class="pf-row"><input id="pfCode" inputmode="numeric" maxlength="8" placeholder="Kod"><button class="pf-save" id="pfOpen" type="button">Aç</button></div><p class="pf-msg" id="pfCodeMsg"></p>`}
  </section>
  <button class="pf-out" id="pfOut2" type="button">Hesabdan çıx</button>`;
  P.querySelectorAll('.pf-avs button[data-av]').forEach(b => b.onclick = () => { click(); accSave({ av: b.dataset.av }).then(renderProfile); });
  $('#pfNameSave').onclick = () => { const v = $('#pfNameIn').value.trim().slice(0, 16); if (v.length < 2) { $('#pfMsg').textContent = 'Ad ən az 2 hərf olsun.'; return; } accSave({ name: v }).then(() => { renderProfile(); $('#pfMsg').textContent = 'Ad yadda saxlanıldı.'; }); };
  const pickFile = () => $('#pfFile').click();
  $('#pfPick').onclick = pickFile; $('#pfUp').onclick = pickFile;
  $('#pfFile').onchange = e => { const f = e.target.files[0]; if (!f) return; const img = new Image(); img.onload = () => { const S = 192, c = document.createElement('canvas'); c.width = c.height = S; const k = Math.max(S / img.width, S / img.height), w = img.width * k, h = img.height * k; c.getContext('2d').drawImage(img, (S - w) / 2, (S - h) / 2, w, h); const url = c.toDataURL('image/jpeg', .82); URL.revokeObjectURL(img.src); accSave({ av: 'photo', photo: url }).then(() => { renderProfile(); $('#pfMsg').textContent = 'Şəkil yeniləndi.'; }); }; img.onerror = () => { $('#pfMsg').textContent = 'Bu faylı açmaq olmadı.'; }; img.src = URL.createObjectURL(f); };
  if ($('#pfOpen')) $('#pfOpen').onclick = async () => { const ok = (await sha('mf1-private:' + $('#pfCode').value.trim())) === PRIV_HASH; if (ok) { LS.set('priv', true); click(); renderProfile(); } else $('#pfCodeMsg').textContent = 'Kod səhvdir.'; };
  if ($('#pfLock')) $('#pfLock').onclick = () => { LS.set('priv', false); renderProfile(); };
  $('#pfOut2').onclick = () => { ME = null; LS.set('session', null); LS.set('priv', false); showAuth('login', 'Hesabdan çıxdın.'); renderProfile(); updTop(); };
}
function needAuth() { if (ME) return false; if (LS.get('guestRaces', 0) >= 1) { showAuth('reg', 'Pulsuz yarışın bitdi. Davam etmək üçün qeydiyyatdan keç.'); return true; } return false; }

/* ---------- intro screen ---------- */
{
  const tips = ['Medium şinlər Soft-dan uzun, Hard-dan qısa ömürlüdür.', 'Menecer rejimində QAZ-ı çox saxlasan, şinlər tez yeyilir.', 'Şin göstəricisi qırmızıya düşəndə Pit Stop et!', 'BOOST batareyanı boşaldır, əyləcdə yenidən dolur.', 'Yağışda bolid sürüşkən olur, ehtiyatlı ol.', 'Qarajda bolidinin rəngini və nömrəsini dəyiş.', 'İlk 3 yer medal qazanır, qalib 25 xal alır.'];
  let ti = 0; const tipEl = $('#itip'), bar = $('#ibar'), go = $('#igo'), box = $('#intro');
  const tipT = setInterval(() => { ti = (ti + 1) % tips.length; tipEl.textContent = tips[ti]; }, 3200);
  let p = 0, done = false; const tick = setInterval(() => { p = Math.min(done ? 100 : 88, p + (done ? 12 : 4 + Math.random() * 6)); bar.style.width = p + '%'; if (p >= 100) { clearInterval(tick); go.hidden = false; } }, 160);
  const ready = () => { done = true; };
  setTimeout(ready, 6000); setTimeout(() => loadGLB().then(ready), 50);
  const enter = () => { audioInit(); whoosh(); clearInterval(tipT); box.classList.add('out'); setTimeout(() => box.remove(), 600); if (ME) applySession(); else showAuth('login'); };
  go.addEventListener('click', enter);
  box.addEventListener('click', e => { if (!go.hidden && e.target !== go) enter(); });
}
if (matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0) $('#game').classList.add('touchy');
route(); renderHome(); connect(); setMute(MUTE); $('#gSnd').classList.toggle('off', MUTE);
}
