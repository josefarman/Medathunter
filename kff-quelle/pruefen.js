const I = require('./inhalt');
let fehler = 0;
const fail = m => { console.log('  FEHLER: ' + m); fehler++; };

// --- Figuren zusammensetzen: Eindeutigkeit und Loesbarkeit ---
console.log('Figuren');
{
  const FI = require('./figuren'), FO = require('./formen'), ZS = require('./zerschneiden');
  const konflikt = FI.flaechenKonflikt();
  if (konflikt) fail('Zwei Grundformen sind flaechengleich: ' + konflikt.join(' / '));
  const items = FI.erzeugen(20260917, 15);
  if (items.length !== 15) fail('nur ' + items.length + ' Figurenaufgaben erzeugt');
  for (const it of items) {
    const zielF = FO.flaeche(FO.finde(it.ziel).ecken);
    const summe = it.teile.reduce((a, t) => a + FO.flaeche(t), 0);
    // Die Teile stammen aus der Zielform - ihre Flaechen muessen exakt aufgehen.
    if (Math.abs(summe - zielF) > 1e-9)
      fail(`Aufgabe ${it.nr}: Teileflaeche ${summe.toFixed(6)} != Zielflaeche ${zielF.toFixed(6)}`);
    // Genau darauf beruht die Eindeutigkeit: jede andere Form hat eine andere Flaeche.
    for (const o of it.optionen) {
      if (o.id === it.ziel) continue;
      if (Math.abs(FO.flaeche(o.ecken) - zielF) < 1e-9)
        fail(`Aufgabe ${it.nr}: Ablenker ${o.name} ist flaechengleich mit dem Ziel`);
    }
    if (new Set(it.optionen.map(o => o.id)).size !== 4) fail(`Aufgabe ${it.nr}: doppelte Antwortform`);
    if (it.loesung === FI.KEINE) {
      if (it.optionen.some(o => o.id === it.ziel))
        fail(`Aufgabe ${it.nr}: Loesung ist (E), die Zielform steht aber unter A-D`);
    } else if (it.optionen[it.loesung].id !== it.ziel) {
      fail(`Aufgabe ${it.nr}: markierte Antwort ist nicht die Zielform`);
    }
    // Runde Zielform ohne sichtbaren Bogen waere nicht loesbar.
    if (it.rund && it.bogen < 40) fail(`Aufgabe ${it.nr}: runde Zielform, groesster Bogen nur ${Math.round(it.bogen)}°`);
    // Nadelfoermige Splitter sind im Druck nicht erkennbar.
    const duenn = Math.min(...it.teile.map(ZS.gedrungen));
    if (duenn < 0.42) fail(`Aufgabe ${it.nr}: Teil zu duenn (Kompaktheit ${duenn.toFixed(2)})`);
  }
  const v = {}; items.forEach(i => v['ABCDE'[i.loesung]] = (v['ABCDE'[i.loesung]] || 0) + 1);
  console.log('  ' + items.length + ' Aufgaben, Loesungen: ' + items.map(i => 'ABCDE'[i.loesung]).join(' '));
  console.log('  Verteilung: ' + JSON.stringify(v) + ' | davon (E) "keine": ' + (v.E || 0));
}

// --- Zahlenfolgen: naechstes Glied aus der angegebenen Regel nachrechnen ---
console.log('Zahlenfolgen');
const naechstes = z => {
  const f = z.folge;
  if (z.schritt)  return z.schritt(f[f.length - 1]);
  if (z.schritte) return f[f.length - 1] + z.schritte[f.length - 1];
  if (z.werte)    return z.werte[f.length];
  if (z.fib)      return f[f.length - 1] + f[f.length - 2];
  if (z.wechsel)  return z.wechsel[(f.length - 1) % 2](f[f.length - 1]);
  if (z.kette)    return z.kette[f.length - 1](f[f.length - 1]);
};
I.zahlenfolgen.forEach((z, i) => {
  // Regel muss die gezeigte Folge selbst erzeugen
  for (let k = (z.fib ? 2 : 1); k < z.folge.length; k++) {
    const teil = { ...z, folge: z.folge.slice(0, k) };
    if (naechstes(teil) !== z.folge[k])
      fail(`Folge ${i+1}: Regel erzeugt an Stelle ${k+1} ${naechstes(teil)} statt ${z.folge[k]}`);
  }
  const l = naechstes(z);
  if (!Number.isInteger(l)) fail(`Folge ${i+1}: Ergebnis ${l} ist keine ganze Zahl`);
  const treffer = z.optionen.filter(o => o === l).length;
  if (treffer !== 1) fail(`Folge ${i+1}: Loesung ${l} kommt ${treffer}x in den Optionen vor`);
  if (new Set(z.optionen).size !== 5) fail(`Folge ${i+1}: Optionen nicht eindeutig`);
  z._loesung = l;
});
console.log('  ' + I.zahlenfolgen.length + ' Folgen, Loesungen: ' + I.zahlenfolgen.map(z => z._loesung).join(', '));

// --- Wortfluessigkeit: Salat muss echtes Anagramm sein ---
console.log('Wortfluessigkeit');
const A = require('./aufbereiten');
const sortiere = w => w.split('').sort().join('');
const wf = A.wortfluessigkeit();
wf.forEach(w => {
  if (sortiere(w.salat) !== sortiere(w.wort)) fail(`${w.wort}: "${w.salat}" ist kein Anagramm`);
  if (w.salat === w.wort) fail(`${w.wort}: Salat ist das Wort selbst`);
  if (new Set(w.optionen).size !== 5) fail(`${w.wort}: Antwortbuchstaben nicht eindeutig`);
  if (w.optionen[w.loesung] !== w.wort[0]) fail(`${w.wort}: markierter Buchstabe ist nicht der Anfangsbuchstabe`);
  if (!w.optionen.every(c => w.wort.includes(c))) fail(`${w.wort}: Antwortbuchstabe kommt im Wort nicht vor`);
});
const vert = {}; wf.forEach(w => vert['ABCDE'[w.loesung]] = (vert['ABCDE'[w.loesung]] || 0) + 1);
console.log('  ' + wf.length + ' Woerter, Loesungen: ' + wf.map(w => 'ABCDE'[w.loesung]).join(' '));
console.log('  Verteilung: ' + JSON.stringify(vert));

// --- Implikationen: Struktur pruefen, Loesung muss den Originaltext tragen ---
console.log('Implikationen');
const roh = require('./inhalt').implikationen;
const imp = A.implikationen();
imp.forEach((im, i) => {
  if (im.optionen.length !== 5) fail(`Implikation ${i+1}: ${im.optionen.length} Optionen`);
  if (new Set(im.optionen).size !== 5) fail(`Implikation ${i+1}: doppelte Optionen`);
  if (im.optionen[im.loesung] !== roh[i].optionen[roh[i].loesung])
    fail(`Implikation ${i+1}: nach dem Mischen zeigt die Loesung auf den falschen Satz`);
  if (new Set(im.optionen).size !== new Set(roh[i].optionen).size)
    fail(`Implikation ${i+1}: Optionen beim Mischen veraendert`);
  if (/Option [A-E]|die erste Option/i.test(im.warum))
    fail(`Implikation ${i+1}: Erklaerung verweist auf einen Buchstaben statt auf den Inhalt`);
  if (!im.warum || im.warum.length < 40) fail(`Implikation ${i+1}: Erklaerung fehlt oder zu kurz`);
});
const vi = {}; imp.forEach(x => vi['ABCDE'[x.loesung]] = (vi['ABCDE'[x.loesung]] || 0) + 1);
console.log('  ' + imp.length + ' Aufgaben, Loesungen: ' + imp.map(x => 'ABCDE'[x.loesung]).join(' '));
console.log('  Verteilung: ' + JSON.stringify(vi));

// --- Gedaechtnis: jede Frage gegen die Ausweisdaten rechnen ---
console.log('Gedaechtnis');
I.gedaechtnis.forEach((f, i) => {
  if (!f.pruefe(I.ausweise)) fail(`Frage ${i+1}: Loesung passt nicht zu den Ausweisdaten`);
  if (f.optionen.length !== 5) fail(`Frage ${i+1}: ${f.optionen.length} Optionen`);
  if (new Set(f.optionen).size !== 5) fail(`Frage ${i+1}: doppelte Optionen`);
});
const doppelt = I.ausweise.map(a => a.vorname).filter((v, i, arr) => arr.indexOf(v) !== i);
if (doppelt.length) fail('Doppelte Vornamen auf den Ausweisen: ' + doppelt);
console.log('  ' + I.gedaechtnis.length + ' Fragen gegen ' + I.ausweise.length + ' Ausweise geprueft');

console.log('');

// --- Deckblatt: baut bauen.js ueberhaupt durch? Dort sitzt die harte Pruefung ---
console.log('Deckblatt');
try {
  require('child_process').execSync('node ' + __dirname + '/bauen.js', { stdio: 'pipe' });
  console.log('  Plan und erzeugte Aufgaben stimmen ueberein (bauen.js bricht sonst ab)');
} catch (e) {
  fail('bauen.js meldet: ' + String(e.stderr || e.message).split('\n').find(l => l.includes('Error')));
}
console.log('');
console.log(fehler === 0 ? 'Gesamtpruefung bestanden.' : fehler + ' FEHLER');
process.exit(fehler ? 1 : 0);
