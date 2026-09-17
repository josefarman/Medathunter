const g = require('./geometrie');
const { zusammensetzbar } = require('./packen');

// Reproduzierbarer Zufall, damit derselbe Test jederzeit erneut entsteht.
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const wahl = (r, arr) => arr[Math.floor(r() * arr.length)];
const TYPEN = ['F','F','A','B','C','D'];

function zielFigur(r, anzahl) {
  const zellen = [{ x: 0, y: 0, t: 'F' }];
  let schutz = 0;
  while (zellen.length < anzahl && schutz++ < 400) {
    const basis = wahl(r, zellen);
    const [dx, dy] = wahl(r, [[1,0],[-1,0],[0,1],[0,-1]]);
    const x = basis.x + dx, y = basis.y + dy;
    if (zellen.some(z => z.x === x && z.y === y)) continue;
    const kand = [...zellen, { x, y, t: wahl(r, TYPEN) }];
    if (g.gueltig(kand)) zellen.push(kand[kand.length - 1]);
  }
  return zellen.length === anzahl ? g.normieren(zellen) : null;
}

function zerlegen(r, zellen, teile) {
  for (let versuch = 0; versuch < 300; versuch++) {
    const frei = [...zellen];
    const gruppen = [];
    const proTeil = Math.floor(zellen.length / teile);
    let ok = true;
    for (let i = 0; i < teile; i++) {
      const soll = (i === teile - 1) ? frei.length : proTeil + (r() < 0.5 ? 1 : 0);
      const start = wahl(r, frei);
      const gruppe = [start];
      frei.splice(frei.indexOf(start), 1);
      let schutz = 0;
      while (gruppe.length < soll && frei.length && schutz++ < 200) {
        const nachbarn = frei.filter(f => gruppe.some(z => Math.abs(z.x-f.x) + Math.abs(z.y-f.y) === 1));
        if (!nachbarn.length) break;
        const n = wahl(r, nachbarn);
        gruppe.push(n); frei.splice(frei.indexOf(n), 1);
      }
      if (gruppe.length < 2 || !g.gueltig(gruppe)) { ok = false; break; }
      gruppen.push(g.normieren(gruppe));
    }
    if (ok && !frei.length && gruppen.length === teile) return gruppen;
  }
  return null;
}

function ablenker(r, ziel, wieviele) {
  const raus = [], gesehen = new Set([g.signatur(ziel)]);
  let schutz = 0;
  while (raus.length < wieviele && schutz++ < 4000) {
    const kopie = ziel.map(z => ({ ...z }));
    const umzuege = r() < 0.6 ? 1 : 2;
    let kand = kopie;
    for (let u = 0; u < umzuege; u++) {
      const weg = Math.floor(r() * kand.length);
      const typ = kand[weg].t;
      const rest = kand.filter((_, i) => i !== weg);
      if (!rest.length) break;
      const basis = wahl(r, rest);
      const [dx, dy] = wahl(r, [[1,0],[-1,0],[0,1],[0,-1]]);
      const x = basis.x + dx, y = basis.y + dy;
      if (rest.some(z => z.x === x && z.y === y)) { kand = null; break; }
      kand = [...rest, { x, y, t: typ }];   // gleicher Typ -> gleiche Flaeche
    }
    if (!kand || !g.gueltig(kand)) continue;
    if (g.flaeche(kand) !== g.flaeche(ziel)) continue;
    const sig = g.signatur(kand);
    if (gesehen.has(sig)) continue;
    gesehen.add(sig);
    raus.push(g.normieren(kand));
  }
  return raus.length === wieviele ? raus : null;
}

function aufgabe(r, nr) {
  for (let versuch = 0; versuch < 3000; versuch++) {
    const anzahl = 7 + Math.floor(r() * 3);          // 7-9 Zellen
    const ziel = zielFigur(r, anzahl);
    if (!ziel) continue;
    const teile = zerlegen(r, ziel, r() < 0.5 ? 3 : 4);
    if (!teile) continue;
    const ab = ablenker(r, ziel, 4);
    if (!ab) continue;
    // Teile zufaellig drehen - im echten Test darf gedreht, nie gespiegelt werden.
    const gedreht = teile.map(t => {
      let cur = t;
      const n = Math.floor(r() * 4);
      for (let i = 0; i < n; i++) cur = g.drehen(cur);
      return g.normieren(cur);
    });
    // Entscheidend: aus denselben Teilen darf sich nur EINE Antwortfigur legen
    // lassen, sonst haette die Aufgabe mehrere richtige Loesungen.
    if (!zusammensetzbar(gedreht, ziel)) continue;
    if (ab.some(o => zusammensetzbar(gedreht, o))) continue;

    const optionen = [ziel, ...ab];
    for (let i = optionen.length - 1; i > 0; i--) {   // mischen
      const j = Math.floor(r() * (i + 1));
      [optionen[i], optionen[j]] = [optionen[j], optionen[i]];
    }
    return { nr, teile: gedreht, optionen, loesung: optionen.findIndex(o => g.signatur(o) === g.signatur(ziel)) };
  }
  return null;
}

function erzeugen(seed, anzahl) {
  const r = rng(seed), raus = [];
  let n = 1, schutz = 0;
  while (raus.length < anzahl && schutz++ < 5000) {
    const a = aufgabe(r, n);
    if (a) { raus.push(a); n++; }
  }
  // Loesungsbuchstaben gleichmaessig streuen, damit kein Buchstabe haeuft.
  const ziele = [];
  for (let i = 0; i < raus.length; i++) ziele.push(i % 5);
  for (let i = ziele.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [ziele[i], ziele[j]] = [ziele[j], ziele[i]];
  }
  raus.forEach((it, i) => {
    const soll = ziele[i];
    const opt = it.optionen;
    [opt[it.loesung], opt[soll]] = [opt[soll], opt[it.loesung]];
    it.loesung = soll;
  });
  return raus;
}

module.exports = { erzeugen };
