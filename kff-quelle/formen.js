// Katalog der Grundformen, wie sie im MedAT als Antwortmoeglichkeiten
// vorkommen. Alle mit Umkreisradius 1, damit sie nebeneinander gleich gross
// wirken - genau wie im Original, wo man die Loesung nicht an der Groesse,
// sondern an Ecken und Kanten erkennen muss.

const BOGEN = 96;                      // Segmente je Vollkreis
const grad = g => (g * Math.PI) / 180;

const vieleck = n => Array.from({ length: n }, (_, i) => {
  const w = grad(-90) + (i * 2 * Math.PI) / n;
  return [Math.cos(w), Math.sin(w)];
});

// anteil 1 = Kreis, 0.75 = Dreiviertelkreis, 0.5 = Halbkreis, 0.25 = Viertelkreis
function sektor(anteil) {
  const segmente = Math.max(6, Math.round(BOGEN * anteil));
  const pts = [];
  if (anteil < 1) pts.push([0, 0]);
  for (let i = 0; i <= segmente; i++) {
    const w = (i / segmente) * anteil * 2 * Math.PI;
    pts.push([Math.cos(w), Math.sin(w)]);
  }
  if (anteil >= 1) pts.pop();
  return pts;
}

// Rechteck mit Seitenverhaeltnis v, Umkreisradius 1
function rechteck(v) {
  const h = 1 / Math.sqrt(1 + v * v), b = v * h;
  return [[-b, -h], [b, -h], [b, h], [-b, h]];
}

const KATALOG = [
  { id: 'dreieck',     name: 'Rechtwinkliges Dreieck', ecken: [[-1, -0.6], [1, -0.6], [-1, 1.0]] },
  { id: 'trapez',      name: 'Trapez',                 ecken: [[-1, -0.62], [1, -0.62], [0.52, 0.62], [-0.52, 0.62]] },
  { id: 'parallelo',   name: 'Parallelogramm',         ecken: [[-1, -0.55], [0.45, -0.55], [1, 0.55], [-0.45, 0.55]] },
  { id: 'rechteck',    name: 'Längliches Rechteck',    ecken: rechteck(2.6) },
  { id: 'quadrat',     name: 'Quadrat',                ecken: rechteck(1) },
  { id: 'fuenfeck',    name: 'Fünfeck',                ecken: vieleck(5) },
  { id: 'sechseck',    name: 'Sechseck',               ecken: vieleck(6) },
  { id: 'siebeneck',   name: 'Siebeneck',              ecken: vieleck(7) },
  { id: 'achteck',     name: 'Achteck',                ecken: vieleck(8) },
  { id: 'viertel',     name: 'Viertelkreis',           ecken: sektor(0.25),  rund: true },
  { id: 'halb',        name: 'Halbkreis',              ecken: sektor(0.5),   rund: true },
  { id: 'dreiviertel', name: 'Dreiviertelkreis',       ecken: sektor(0.75),  rund: true, konkav: true },
  { id: 'kreis',       name: 'Kreis',                  ecken: sektor(1),     rund: true },
];

// Flaeche nach der Gauss'schen Trapezformel.
function flaeche(p) {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(s) / 2;
}

function schwerpunkt(p) {
  let cx = 0, cy = 0, a = 0;
  for (let i = 0; i < p.length; i++) {
    const q = p[i], r = p[(i + 1) % p.length];
    const f = q[0] * r[1] - r[0] * q[1];
    a += f; cx += (q[0] + r[0]) * f; cy += (q[1] + r[1]) * f;
  }
  a *= 0.5;
  return Math.abs(a) < 1e-12 ? [0, 0] : [cx / (6 * a), cy / (6 * a)];
}

const drehen = (p, w) => p.map(([x, y]) =>
  [x * Math.cos(w) - y * Math.sin(w), x * Math.sin(w) + y * Math.cos(w)]);

function grenzen(p) {
  const xs = p.map(q => q[0]), ys = p.map(q => q[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

const finde = id => KATALOG.find(f => f.id === id);

module.exports = { KATALOG, flaeche, schwerpunkt, drehen, grenzen, finde, vieleck, sektor, rechteck };
