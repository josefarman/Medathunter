// Bausteine: Einheitszelle (x,y) ist entweder ein volles Quadrat oder ein halbes.
// Alle Kanten liegen auf dem Gitter oder auf einer Zelldiagonale, deshalb heben
// sich innere Kanten beim Verschmelzen exakt auf.
const ECKEN = {
  F: [[0,0],[1,0],[1,1],[0,1]],
  A: [[0,0],[1,0],[0,1]],
  B: [[0,0],[1,0],[1,1]],
  C: [[1,0],[1,1],[0,1]],
  D: [[0,0],[1,1],[0,1]],
};
const DREHUNG = { F:'F', A:'B', B:'C', C:'D', D:'A' };

const polygon = ({x,y,t}) => ECKEN[t].map(([u,v]) => [x+u, y+v]);
const key = p => p[0] + ',' + p[1];

// Aussenkontur: jede Kante gerichtet sammeln; innen liegende Kanten treten
// gegenlaeufig doppelt auf und loeschen sich. Der Rest ergibt genau einen Zyklus.
function kontur(zellen) {
  const offen = new Map();
  for (const z of zellen) {
    const p = polygon(z);
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i+1) % p.length];
      const hin = key(a) + '>' + key(b), rueck = key(b) + '>' + key(a);
      if (offen.has(rueck)) offen.delete(rueck);
      else if (offen.has(hin)) return null;   // Ueberlappung
      else offen.set(hin, [a, b]);
    }
  }
  if (!offen.size) return null;
  const aus = new Map();
  for (const [a, b] of offen.values()) {
    if (aus.has(key(a))) return null;          // Beruehrpunkt statt sauberer Rand
    aus.set(key(a), b);
  }
  const start = offen.values().next().value[0];
  const zyklus = [start];
  let cur = start;
  for (let i = 0; i < offen.size + 1; i++) {
    const nxt = aus.get(key(cur));
    if (!nxt) return null;
    if (key(nxt) === key(start)) break;
    zyklus.push(nxt);
    cur = nxt;
  }
  if (zyklus.length !== offen.size) return null; // mehrere Zyklen -> Loch o. Teile
  return zyklus;
}


// Aufeinanderfolgende Punkte auf einer Geraden zu einer Kante zusammenfassen.
function vereinfachen(zyklus) {
  const n = zyklus.length, aus = [];
  for (let i = 0; i < n; i++) {
    const a = zyklus[(i - 1 + n) % n], b = zyklus[i], c = zyklus[(i + 1) % n];
    const kreuz = (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0]);
    if (kreuz !== 0) aus.push(b);
  }
  return aus;
}

function drehen(zellen) {
  return zellen.map(({x,y,t}) => ({ x: -y - 1, y: x, t: DREHUNG[t] }));
}
function normieren(zellen) {
  const minX = Math.min(...zellen.map(z => z.x)), minY = Math.min(...zellen.map(z => z.y));
  return zellen.map(z => ({ x: z.x - minX, y: z.y - minY, t: z.t }));
}
function signatur(zellen) {
  let best = null, cur = zellen;
  for (let i = 0; i < 4; i++) {
    const s = normieren(cur).map(z => `${z.x}.${z.y}.${z.t}`).sort().join('|');
    if (best === null || s < best) best = s;
    cur = drehen(cur);
  }
  return best;
}
// Zwei Halbzellen derselben Zelle zaehlen zusammen wie ein Quadrat.
const flaeche = zellen => zellen.reduce((s, z) => s + (z.t === 'F' ? 2 : 1), 0);

function zusammenhaengend(zellen) {
  if (!zellen.length) return false;
  const orte = new Map(zellen.map(z => [z.x + ',' + z.y, z]));
  const gesehen = new Set([zellen[0].x + ',' + zellen[0].y]);
  const stapel = [zellen[0]];
  while (stapel.length) {
    const z = stapel.pop();
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const k = (z.x+dx) + ',' + (z.y+dy);
      if (orte.has(k) && !gesehen.has(k)) { gesehen.add(k); stapel.push(orte.get(k)); }
    }
  }
  return gesehen.size === zellen.length;
}
// Gueltig heisst: zusammenhaengend, eine einzige geschlossene Aussenkontur.
const gueltig = z => z.length > 0 && zusammenhaengend(z) && kontur(z) !== null;

module.exports = { ECKEN, polygon, kontur, vereinfachen, drehen, normieren, signatur, flaeche, zusammenhaengend, gueltig };
