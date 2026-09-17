const I = require('./inhalt');

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const mischen = (r, a) => { a = [...a]; for (let i = a.length-1; i > 0; i--) { const j = Math.floor(r()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; };

// Naechstes Folgenglied aus der hinterlegten Regel.
function naechstes(z, folge = z.folge) {
  const f = folge;
  if (z.schritt)  return z.schritt(f[f.length - 1]);
  if (z.schritte) return f[f.length - 1] + z.schritte[f.length - 1];
  if (z.werte)    return z.werte[f.length];
  if (z.fib)      return f[f.length - 1] + f[f.length - 2];
  if (z.wechsel)  return z.wechsel[(f.length - 1) % 2](f[f.length - 1]);
  if (z.kette)    return z.kette[f.length - 1](f[f.length - 1]);
}

function zahlenfolgen() {
  return I.zahlenfolgen.map((z, i) => {
    const l = naechstes(z);
    return { nr: i + 1, folge: z.folge, regel: z.regel, optionen: z.optionen,
             wert: l, loesung: z.optionen.indexOf(l) };
  });
}

// Buchstabensalat + Antwortbuchstaben, mit gleichmaessig gestreuten Loesungen.
function wortfluessigkeit(seed = 4711) {
  const r = rng(seed);
  const ziele = mischen(r, I.woerter.map((_, i) => i % 5));
  return I.woerter.map((w, i) => {
    let salat = w;
    for (let v = 0; v < 300 && (salat === w || salat[0] === w[0]); v++) salat = mischen(r, w.split('')).join('');
    const rest = mischen(r, [...new Set(w.split(''))].filter(c => c !== w[0])).slice(0, 4);
    const optionen = mischen(r, [w[0], ...rest]);
    const soll = ziele[i], ist = optionen.indexOf(w[0]);
    [optionen[ist], optionen[soll]] = [optionen[soll], optionen[ist]];
    return { nr: i + 1, wort: w, salat, optionen, loesung: soll };
  });
}

// Antwortpositionen gleichmaessig streuen; die Erklaerungen zitieren Inhalte,
// keine Buchstaben, deshalb bleibt das Mischen gefahrlos.
function implikationen(seed = 903) {
  const r = rng(seed);
  const ziele = mischen(r, I.implikationen.map((_, i) => i % 5));
  return I.implikationen.map((x, i) => {
    const optionen = [...x.optionen];
    const soll = ziele[i];
    [optionen[x.loesung], optionen[soll]] = [optionen[soll], optionen[x.loesung]];
    return { nr: i + 1, aussage: x.aussage, optionen, loesung: soll, warum: x.warum };
  });
}
const gedaechtnis   = () => I.gedaechtnis.map((x, i) => ({ nr: i + 1, ...x }));

module.exports = { zahlenfolgen, wortfluessigkeit, implikationen, gedaechtnis, ausweise: I.ausweise, naechstes };
