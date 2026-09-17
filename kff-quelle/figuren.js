// Erzeugt Aufgaben vom Typ "Figuren zusammensetzen" im MedAT-Format:
// unregelmaessige Bruchstuecke oben, vier Grundformen als Antwort A-D,
// dazu fest (E) "Keine der Antwortmoeglichkeiten ist richtig".
//
// Die Eindeutigkeit ergibt sich aus der Flaeche: die Bruchstuecke stammen aus
// genau einer Zielform, ihre Flaechensumme ist damit deren Flaeche. Jede andere
// Grundform des Katalogs hat eine andere Flaeche und ist deshalb aus diesen
// Teilen nicht legbar - unabhaengig davon, wie man sie anordnet.

const F = require('./formen');
const Z = require('./zerschneiden');

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const wahl = (r, a) => a[Math.floor(r() * a.length)];
const mischen = (r, a) => { a = [...a]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(r()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; };

const SCHNEIDBAR = F.KATALOG.filter(f => !f.konkav);
const KEINE = 4;                     // Antwortposition E

// Groesster Bogen, den ein einzelnes Teil traegt (in Grad). Bei runden
// Zielformen ist die gebogene Kante das entscheidende Erkennungsmerkmal -
// traegt kein Teil ein nennenswertes Bogenstueck, ist die Aufgabe nicht loesbar.
function groesstesBogenstueck(teile, segmenteProVollkreis = 96) {
  let best = 0;
  for (const t of teile) {
    let lauf = 0;
    // Nur gueltig VOR dem Zentrieren/Drehen: dann liegen Bogenpunkte noch
    // auf dem Einheitskreis um den Ursprung.
    const aufBogen = t.map(([x, y]) => Math.abs(Math.hypot(x, y) - 1) < 1e-6);
    for (let i = 0; i < t.length * 2; i++) {
      if (aufBogen[i % t.length]) { lauf++; best = Math.max(best, lauf); }
      else lauf = 0;
    }
  }
  return (best / segmenteProVollkreis) * 360;
}

// Groesster relativer Flaechenunterschied zwischen zwei Katalogformen - nur
// zur Kontrolle: alle Paare muessen sich unterscheiden, sonst waere eine
// Aufgabe nicht eindeutig.
function flaechenKonflikt() {
  const f = F.KATALOG.map(x => ({ id: x.id, a: F.flaeche(x.ecken) }));
  for (let i = 0; i < f.length; i++)
    for (let j = i + 1; j < f.length; j++)
      if (Math.abs(f[i].a - f[j].a) < 1e-9) return [f[i].id, f[j].id];
  return null;
}

// Antwortauswahl: bei runder Zielform sollen auch runde Ablenker dabei sein,
// sonst verraet schon die gebogene Kante eines Teils die Loesung.
function ablenker(r, ziel, wieviele) {
  const andere = F.KATALOG.filter(f => f.id !== (ziel && ziel.id));
  const rund = andere.filter(f => f.rund), eckig = andere.filter(f => !f.rund);
  let pool;
  if (ziel && ziel.rund) pool = [...mischen(r, rund).slice(0, 2), ...mischen(r, eckig)];
  else                   pool = [...mischen(r, eckig).slice(0, 2), ...mischen(r, andere)];
  const raus = [];
  for (const f of pool) { if (!raus.some(x => x.id === f.id)) raus.push(f); if (raus.length === wieviele) break; }
  return raus.length === wieviele ? raus : null;
}

function aufgabe(r, nr, sollLoesung) {
  for (let versuch = 0; versuch < 400; versuch++) {
    const ziel = wahl(r, SCHNEIDBAR);
    const teile = Z.zerlegen(r, ziel.ecken, 5 + Math.floor(r() * 2));   // 5-6 Teile
    if (!teile) continue;
    // Runde Zielform ohne sichtbaren Bogen waere nicht loesbar -> verwerfen.
    const bogen = ziel.rund ? groesstesBogenstueck(teile) : 0;
    if (ziel.rund && bogen < 40) continue;

    const istKeine = sollLoesung === KEINE;
    const ab = ablenker(r, ziel, istKeine ? 4 : 3);
    if (!ab) continue;

    let optionen, loesung;
    if (istKeine) { optionen = ab; loesung = KEINE; }
    else {
      optionen = mischen(r, [ziel, ...ab]);
      const ist = optionen.findIndex(o => o.id === ziel.id);
      [optionen[ist], optionen[sollLoesung]] = [optionen[sollLoesung], optionen[ist]];
      loesung = sollLoesung;
    }

    // Teile zufaellig drehen; gespiegelt wird nie.
    const gedreht = teile.map(t => {
      const s = F.schwerpunkt(t);
      const zentriert = t.map(([x, y]) => [x - s[0], y - s[1]]);
      return F.drehen(zentriert, r() * 2 * Math.PI);
    });

    return { nr, ziel: ziel.id, zielName: ziel.name, rund: !!ziel.rund, bogen,
             teile: mischen(r, gedreht), optionen, loesung };
  }
  return null;
}

function erzeugen(seed, anzahl) {
  const konflikt = flaechenKonflikt();
  if (konflikt) throw new Error('Zwei Grundformen sind flaechengleich: ' + konflikt.join(' / '));

  const r = rng(seed);
  // Loesungen gleichmaessig ueber A-E streuen; E ist "keine der Formen".
  const ziele = mischen(r, Array.from({ length: anzahl }, (_, i) => i % 5));
  const raus = [];
  for (let i = 0; i < anzahl; i++) {
    const a = aufgabe(r, i + 1, ziele[i]);
    if (!a) throw new Error('Aufgabe ' + (i + 1) + ' liess sich nicht erzeugen');
    raus.push(a);
  }
  return raus;
}

module.exports = { erzeugen, KEINE, flaechenKonflikt, groesstesBogenstueck };
