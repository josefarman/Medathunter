const { flaeche, schwerpunkt } = require('./formen');

// Konvexes Polygon an einer Geraden trennen. Eine Gerade zerlegt ein konvexes
// Polygon immer in genau zwei konvexe Teile - deshalb bleiben alle Bruchstuecke
// konvex und die Zerlegung bleibt beweisbar vollstaendig.
function trennen(poly, punkt, normale) {
  const seite = p => (p[0] - punkt[0]) * normale[0] + (p[1] - punkt[1]) * normale[1];
  const halbe = vorzeichen => {
    const raus = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const sa = seite(a) * vorzeichen, sb = seite(b) * vorzeichen;
      if (sa >= -1e-12) raus.push(a);
      if ((sa > 1e-12 && sb < -1e-12) || (sa < -1e-12 && sb > 1e-12)) {
        const t = sa / (sa - sb);
        raus.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
      }
    }
    return saeubern(raus);
  };
  return [halbe(1), halbe(-1)];
}

// Doppelte und auf einer Geraden liegende Punkte entfernen.
function saeubern(p) {
  const raus = [];
  for (const q of p) {
    const l = raus[raus.length - 1];
    if (!l || Math.hypot(l[0] - q[0], l[1] - q[1]) > 1e-9) raus.push(q);
  }
  while (raus.length > 1 && Math.hypot(raus[0][0] - raus[raus.length-1][0], raus[0][1] - raus[raus.length-1][1]) < 1e-9) raus.pop();
  return raus;
}

const umfang = p => p.reduce((s, q, i) => {
  const r = p[(i + 1) % p.length];
  return s + Math.hypot(r[0] - q[0], r[1] - q[1]);
}, 0);

// Kompaktheit: 1 = Kreis, gegen 0 = Nadel. Haelt duenne Splitter draussen.
const gedrungen = p => (4 * Math.PI * flaeche(p)) / (umfang(p) ** 2);

// Polygon in `teile` Bruchstuecke schneiden. Geschnitten wird jeweils das
// groesste Stueck, damit die Teile aehnlich gross bleiben.
function zerlegen(r, poly, teile, { mindestAnteil = 0.10, mindestForm = 0.42 } = {}) {
  const gesamt = flaeche(poly);
  let stuecke = [poly];
  let schutz = 0;
  while (stuecke.length < teile && schutz++ < 600) {
    stuecke.sort((a, b) => flaeche(b) - flaeche(a));
    const ziel = stuecke[0];
    const s = schwerpunkt(ziel);
    const g = ziel.reduce((m, p) => Math.max(m, Math.hypot(p[0] - s[0], p[1] - s[1])), 0);
    const w = r() * Math.PI;
    const punkt = [s[0] + (r() - 0.5) * g * 0.45, s[1] + (r() - 0.5) * g * 0.45];
    const [a, b] = trennen(ziel, punkt, [Math.cos(w), Math.sin(w)]);
    if (a.length < 3 || b.length < 3) continue;
    if (Math.min(flaeche(a), flaeche(b)) < gesamt * mindestAnteil) continue;
    if (Math.min(gedrungen(a), gedrungen(b)) < mindestForm) continue;
    stuecke = [a, b, ...stuecke.slice(1)];
  }
  if (stuecke.length !== teile) return null;
  const summe = stuecke.reduce((s, p) => s + flaeche(p), 0);
  if (Math.abs(summe - gesamt) > gesamt * 1e-6) return null;   // nichts verloren
  return stuecke;
}

module.exports = { trennen, zerlegen, flaeche, gedrungen, umfang };
