// Baut die HTML-Vorlage des KFF-Trainingstests. Danach rendern.js ausfuehren,
// das daraus ../kff-trainingstest.pdf erzeugt. Vorher immer pruefen.js laufen
// lassen - dort werden saemtliche Loesungen maschinell gegengerechnet:
//   node pruefen.js && node bauen.js && node rendern.js
const fs = require('fs');
const A = require('./aufbereiten');
const F = require('./figuren');
const { figurSVG } = require('./svg');

const B = 'ABCDE';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const figuren = F.erzeugen(20260917, 15);
const zahlen = A.zahlenfolgen();
const woerter = A.wortfluessigkeit();
const implik = A.implikationen();
const merken = A.gedaechtnis();


// Einzige Quelle fuer Reihenfolge, Aufgabenzahl und Zeiten. Deckblatt,
// Uebersicht und jeder Untertest-Kopf leiten sich hieraus ab, damit die
// Zahlen nicht auseinanderlaufen koennen.
const plan = [
  { nr: '1',  titel: 'Figuren zusammensetzen',      aufgaben: 15, minuten: 20, uebersicht: '1 · Figuren zusammensetzen',  detail: '15 Aufgaben · 20 Minuten',            kopf: '15 Aufgaben · 20 Minuten' },
  { nr: '2',  titel: 'Gedächtnis und Merkfähigkeit', aufgaben: 0, minuten:  8, uebersicht: '2 · Gedächtnis – Lernphase',  detail: '8 Allergieausweise · 8 Minuten',      kopf: 'Lernphase · 8 Minuten' },
  { nr: '3',  titel: 'Zahlenfolgen',                aufgaben: 10, minuten: 15, uebersicht: '3 · Zahlenfolgen',            detail: '10 Aufgaben · 15 Minuten',            kopf: '10 Aufgaben · 15 Minuten' },
  { nr: '4',  titel: 'Wortflüssigkeit',             aufgaben: 15, minuten:  8, uebersicht: '4 · Wortflüssigkeit',         detail: '15 Aufgaben · 8 Minuten',             kopf: '15 Aufgaben · 8 Minuten' },
  { nr: '5',  titel: 'Implikationen erkennen',      aufgaben: 10, minuten: 10, uebersicht: '5 · Implikationen erkennen',  detail: '10 Aufgaben · 10 Minuten',            kopf: '10 Aufgaben · 10 Minuten' },
  { nr: '2b', titel: 'Gedächtnis – Abrufphase',     aufgaben: 10, minuten: 10, uebersicht: '2b · Gedächtnis – Abrufphase', detail: '10 Fragen · 10 Minuten',             kopf: '10 Fragen · 10 Minuten' },
];
const summe = f => plan.reduce((a, p) => a + p[f], 0);
const holen = nr => plan.find(p => p.nr === String(nr));

// Gegen die tatsaechlich erzeugten Aufgaben rechnen - bricht ab, statt eine
// falsche Zahl aufs Deckblatt zu drucken.
{
  const echt = figuren.length + zahlen.length + woerter.length + implik.length + merken.length;
  if (summe('aufgaben') !== echt)
    throw new Error(`Plan nennt ${summe('aufgaben')} Aufgaben, erzeugt wurden ${echt}`);
  const je = { '1': figuren.length, '3': zahlen.length, '4': woerter.length, '5': implik.length, '2b': merken.length };
  for (const [nr, n] of Object.entries(je))
    if (holen(nr).aufgaben !== n) throw new Error(`Untertest ${nr}: Plan ${holen(nr).aufgaben}, erzeugt ${n}`);
}

// --- Bausteine ---------------------------------------------------------
const kopf = (nr, anleitung) => `
<section class="ut">
  <div class="ut-kopf">
    <div class="ut-nr">Untertest ${nr}</div>
    <h2>${holen(nr).titel}</h2>
    <div class="ut-meta"><span>${holen(nr).kopf}</span></div>
  </div>
  <p class="ut-info">${anleitung}</p>
</section>`;

const kaesten = (n, opt) => `<div class="antw">` +
  opt.map((o, i) => `<span class="kasten"><i>${B[i]}</i>${o === true ? '' : ' ' + esc(o)}</span>`).join('') +
  `</div>`;

// --- Untertest 1: Figuren ---------------------------------------------
const figurBlock = it => `
<div class="aufg figur">
  <div class="aufg-nr">${it.nr}</div>
  <div class="figur-teile">
    <span class="mini">Einzelteile</span>
    ${it.teile.map(t => figurSVG(t, 55, '#C9A84C', '#0F1623')).join('')}
  </div>
  <div class="figur-opt">
    ${it.optionen.map((o, i) => `<div class="fo"><i>${B[i]}</i>${figurSVG(o, 55, '#FFFFFF', '#0F1623')}</div>`).join('')}
  </div>
</div>`;

// --- Untertest 2: Allergieausweise ------------------------------------
const ausweisBlock = a => `
<div class="ausweis">
  <div class="ausweis-kopf">Allergieausweis</div>
  <div class="ausweis-zeile"><span>Name</span><b>${a.nachname}, ${a.vorname}</b></div>
  <div class="ausweis-zeile"><span>geboren</span><b>${a.geburt}</b></div>
  <div class="ausweis-zeile"><span>Allergie</span><b>${a.allergie}</b></div>
  <div class="ausweis-zeile"><span>Notfall</span><b>${a.medikament}</b></div>
</div>`;

// --- Textaufgaben ------------------------------------------------------
const textAufg = (nr, frage, optionen, klasse = '') => `
<div class="aufg ${klasse}">
  <div class="aufg-nr">${nr}</div>
  <div class="aufg-text">
    <p class="frage">${esc(frage)}</p>
    ${kaesten(nr, optionen)}
  </div>
</div>`;

// --- Antwortbogen ------------------------------------------------------
const bogenBlock = (titel, n) => `
<div class="bogen-block">
  <h4>${titel}</h4>
  <div class="bogen-gitter">
    ${Array.from({ length: n }, (_, i) => `
      <div class="bogen-zeile"><span class="bz-nr">${i + 1}</span>
        ${B.split('').map(b => `<span class="bz-k">${b}</span>`).join('')}
      </div>`).join('')}
  </div>
</div>`;

// --- Lösungen ----------------------------------------------------------
const loesZeile = (nr, antwort, text) =>
  `<div class="lz"><span class="lz-nr">${nr}</span><span class="lz-a">${antwort}</span><span class="lz-t">${text || ''}</span></div>`;

// ======================================================================
const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><title>KFF-Trainingstest – MedAT-Hunter</title>
<style>
@font-face { font-family:'Outfit'; font-weight:300; src:url(../fonts/outfit-300-latin.woff2) format('woff2'); }
@font-face { font-family:'Outfit'; font-weight:400; src:url(../fonts/outfit-400-latin.woff2) format('woff2'); }
@font-face { font-family:'Outfit'; font-weight:500; src:url(../fonts/outfit-500-latin.woff2) format('woff2'); }
@font-face { font-family:'Outfit'; font-weight:600; src:url(../fonts/outfit-600-latin.woff2) format('woff2'); }
@font-face { font-family:'Playfair Display'; font-weight:700; src:url(../fonts/playfair-display-700-latin.woff2) format('woff2'); }
@font-face { font-family:'Playfair Display'; font-weight:900; src:url(../fonts/playfair-display-900-latin.woff2) format('woff2'); }
@font-face { font-family:'Playfair Display'; font-weight:700; font-style:italic; src:url(../fonts/playfair-display-700-italic-latin.woff2) format('woff2'); }

:root { --navy:#0F1623; --gold:#C9A84C; --blue:#4A90C4; --grau:#6B7280; --linie:#D8D5D0; --sand:#F7F5F2; }
* { box-sizing:border-box; margin:0; padding:0; }
@page { size:A4; margin:16mm 15mm 18mm; }
body { font-family:'Outfit',sans-serif; color:var(--navy); font-size:10.5pt; line-height:1.5;
       -webkit-print-color-adjust:exact; print-color-adjust:exact; }
h1,h2,h3,h4 { font-family:'Playfair Display',serif; }
.seite { page-break-after:always; }
.seite:last-child { page-break-after:auto; }

/* Deckblatt */
.deckblatt { position:relative; height:265mm; background:var(--navy); color:#F0EDE8;
             margin:-16mm -15mm 0; padding:38mm 22mm; }
.deckblatt .logo { font-family:'Playfair Display',serif; font-size:17pt; letter-spacing:1px; }
.deckblatt .logo i { color:var(--gold); font-style:normal; }
.deckblatt .eyebrow { margin-top:44mm; font-size:8.5pt; letter-spacing:4px; text-transform:uppercase; color:var(--gold); }
.deckblatt h1 { font-size:42pt; line-height:1.06; margin-top:7mm; font-weight:700; }
.deckblatt h1 em { color:var(--gold); font-style:italic; }
.deckblatt .unter { margin-top:9mm; font-size:12pt; color:#B9BDC7; max-width:118mm; font-weight:300; }
.deckblatt .fakten { margin-top:26mm; display:flex; gap:14mm; }
.deckblatt .fakt b { display:block; font-family:'Playfair Display',serif; font-size:22pt; color:var(--gold); }
.deckblatt .fakt span { font-size:8.5pt; color:#B9BDC7; letter-spacing:0.5px; }
.deckblatt .fuss { position:absolute; left:22mm; right:22mm; bottom:20mm; font-size:8.5pt;
                   color:#8A8F9E; border-top:1px solid rgba(255,255,255,.14); padding-top:4mm; }

/* Fließtext-Seiten */
.h-gross { font-size:21pt; margin-bottom:5mm; }
.lead { color:var(--grau); max-width:150mm; }
.regelblock { margin-top:7mm; border:1px solid var(--linie); border-radius:3mm; overflow:hidden; }
.regelzeile { display:flex; gap:5mm; padding:3.4mm 5mm; border-bottom:1px solid var(--linie); align-items:baseline; }
.regelzeile:last-child { border-bottom:none; }
.regelzeile:nth-child(odd) { background:var(--sand); }
.regelzeile b { font-family:'Playfair Display',serif; min-width:52mm; }
.regelzeile span { color:var(--grau); font-size:9.5pt; }
.hinweis { margin-top:7mm; background:#FDF6E3; border-left:3px solid var(--gold); padding:4mm 5mm; font-size:9.5pt; }
.hinweis b { display:block; margin-bottom:1mm; }

/* Untertest-Kopf */
.ut-kopf { background:var(--navy); color:#F0EDE8; padding:5mm 6mm; border-radius:3mm; }
.ut-nr { font-size:8pt; letter-spacing:3px; text-transform:uppercase; color:var(--gold); }
.ut-kopf h2 { font-size:18pt; margin-top:1.5mm; }
.ut-meta { margin-top:2mm; font-size:9pt; color:#B9BDC7; }
.ut-info { margin:4mm 0 5mm; color:var(--grau); font-size:9.5pt; }

/* Aufgaben */
.aufg { display:flex; gap:4mm; padding:2.4mm 0; border-top:1px solid var(--linie); page-break-inside:avoid; }
.aufg-nr { flex:0 0 7mm; height:7mm; border-radius:50%; background:var(--navy); color:#fff;
           font-size:9pt; font-weight:600; display:flex; align-items:center; justify-content:center; }
.aufg-text { flex:1; }
.frage { font-weight:500; }
.antw { display:flex; flex-wrap:wrap; gap:2mm 4mm; margin-top:2.2mm; }
.kasten { font-size:9.5pt; color:#374151; display:flex; align-items:center; gap:1.5mm; }
.kasten i { font-style:normal; font-weight:600; font-size:8pt; width:5mm; height:5mm; border:1px solid var(--navy);
            border-radius:1mm; display:inline-flex; align-items:center; justify-content:center; }
.senk .antw { flex-direction:column; gap:1.6mm; }
.folge { font-family:'Playfair Display',serif; font-size:14pt; letter-spacing:1.5px; }
.salat { font-family:'Playfair Display',serif; font-size:16pt; letter-spacing:5px; }
.buchstaben .kasten { font-weight:600; }

/* Figuren */
.figur { flex-direction:row; align-items:flex-start; }
.figur-teile { flex:0 0 52mm; display:flex; flex-wrap:wrap; gap:1.5mm; align-items:center;
               background:var(--sand); border-radius:2mm; padding:2mm; }
.figur-teile .mini { flex:0 0 100%; font-size:7pt; letter-spacing:1.5px; text-transform:uppercase; color:var(--grau); }
.figur-opt { flex:1; display:flex; gap:2mm; justify-content:space-between; }
.fo { text-align:center; }
.fo i { display:block; font-style:normal; font-size:8pt; font-weight:600; color:var(--grau); }
.fo svg { border:1px solid var(--linie); border-radius:1.5mm; }

/* Ausweise */
.ausweis-gitter { display:grid; grid-template-columns:1fr 1fr; gap:4mm; margin-top:4mm; }
.ausweis { border:1px solid var(--linie); border-radius:2.5mm; overflow:hidden; page-break-inside:avoid; }
.ausweis-kopf { background:var(--navy); color:var(--gold); font-size:7.5pt; letter-spacing:2.5px;
                text-transform:uppercase; padding:2mm 4mm; }
.ausweis-zeile { display:flex; justify-content:space-between; padding:1.8mm 4mm; font-size:9.5pt;
                 border-top:1px solid var(--linie); }
.ausweis-zeile span { color:var(--grau); }

/* Antwortbogen */
.bogen { display:grid; grid-template-columns:1fr 1fr 1fr; gap:6mm; margin-top:5mm; }
.bogen-block h4 { font-size:10pt; padding-bottom:1.5mm; border-bottom:1.5px solid var(--gold); margin-bottom:2.5mm; }
.bogen-zeile { display:flex; align-items:center; gap:1.2mm; margin-bottom:1.4mm; }
.bz-nr { width:5mm; font-size:8pt; color:var(--grau); text-align:right; }
.bz-k { width:5mm; height:5mm; border:1px solid var(--navy); border-radius:1mm; font-size:7pt;
        display:flex; align-items:center; justify-content:center; color:var(--grau); }

/* Lösungen */
.loes-gruppe { margin-bottom:6mm; page-break-inside:avoid; }
.loes-gruppe h3 { font-size:12.5pt; color:var(--navy); padding-bottom:1.5mm;
                  border-bottom:1.5px solid var(--gold); margin-bottom:2.5mm; }
.lz { display:flex; gap:3mm; padding:1.6mm 0; border-bottom:1px solid var(--linie); font-size:9.5pt;
      page-break-inside:avoid; }
.lz-nr { flex:0 0 6mm; color:var(--grau); }
.lz-a { flex:0 0 7mm; font-weight:600; color:var(--blue); }
.lz-t { flex:1; color:#374151; }
.kompakt { display:flex; flex-wrap:wrap; gap:2mm; }
.kompakt div { flex:0 0 calc(20% - 2mm); border:1px solid var(--linie); border-radius:1.5mm;
               padding:1.6mm; text-align:center; font-size:9pt; }
.kompakt b { color:var(--blue); }

/* Auswertung */
.tabelle { width:100%; border-collapse:collapse; margin-top:4mm; font-size:9.5pt; }
.tabelle th { background:var(--navy); color:#F0EDE8; font-weight:500; text-align:left; padding:2.6mm 4mm; font-size:9pt; }
.tabelle td { padding:2.4mm 4mm; border-bottom:1px solid var(--linie); }
.tabelle tr:nth-child(even) td { background:var(--sand); }
.fehler-liste { margin-top:4mm; }
.fehler { border-left:3px solid var(--gold); padding:2mm 0 2mm 5mm; margin-bottom:4mm; page-break-inside:avoid; }
.fehler b { display:block; font-family:'Playfair Display',serif; font-size:11pt; margin-bottom:1mm; }
.fehler span { color:var(--grau); font-size:9.5pt; }

/* Abschluss */
.cta { margin-top:8mm; background:var(--navy); color:#F0EDE8; border-radius:3mm; padding:9mm 10mm; text-align:center; }
.cta h3 { font-size:17pt; color:#F0EDE8; }
.cta h3 em { color:var(--gold); font-style:italic; }
.cta p { color:#B9BDC7; margin-top:3mm; font-size:10pt; }
.cta .knopf { display:inline-block; margin-top:5mm; background:var(--gold); color:var(--navy);
              font-weight:600; padding:3mm 8mm; border-radius:2mm; font-size:10.5pt; }
.cta .klein { margin-top:4mm; font-size:8.5pt; color:#8A8F9E; }
</style></head><body>

<!-- DECKBLATT -->
<div class="seite">
  <div class="deckblatt">
    <div class="logo">MedAT<i>-Hunter</i></div>
    <div class="eyebrow">Kostenloser Trainingstest</div>
    <h1>Der KFF-Teil.<br><em>Einmal komplett.</em></h1>
    <p class="unter">Fünf Untertests, ${summe('aufgaben')} Aufgaben, vollständiger Lösungsteil mit Erklärungen –
       und eine ehrliche Einschätzung, wo du gerade stehst.</p>
    <div class="fakten">
      <div class="fakt"><b>5</b><span>UNTERTESTS</span></div>
      <div class="fakt"><b>${summe('aufgaben')}</b><span>AUFGABEN</span></div>
      <div class="fakt"><b>${summe('minuten')}</b><span>MINUTEN</span></div>
    </div>
    <div class="fuss">MedAT-Hunter · Strategisches MedAT-Mentoring aus Wien · medathunter.at</div>
  </div>
</div>

<!-- ANLEITUNG -->
<div class="seite">
  <h1 class="h-gross">So holst du das Maximum aus diesem Test</h1>
  <p class="lead">Dieser Test bringt dir nur dann etwas, wenn du ihn unter echten Bedingungen schreibst.
     Eine Stunde ohne Handy, ohne Pause, ohne Nachschlagen – genau wie am Testtag.</p>

  <div class="regelblock">
    ${plan.map(p => `<div class="regelzeile"><b>${p.uebersicht}</b><span>${p.detail}</span></div>`).join('')}
  </div>

  <div class="hinweis">
    <b>Die Reihenfolge ist Absicht.</b>
    Du prägst dir die Allergieausweise früh ein und wirst erst am Ende danach gefragt – dazwischen liegen
    drei andere Untertests. Genau dieses Vergessen-unter-Belastung wird im echten MedAT geprüft.
    Blättere deshalb nicht zurück.
  </div>

  <div class="hinweis" style="background:#F2F6FA;border-left-color:#4A90C4">
    <b>Zum Format</b>
    Aufgabenzahl und Zeitvorgaben orientieren sich am gängigen MedAT-Aufbau, werden vom Veranstalter aber
    jahrweise angepasst. Gleich die aktuellen Angaben auf <b>medizinstudieren.at</b> gegenprüfen –
    verlass dich für die Anmeldung nie auf Übungsmaterial, auch nicht auf unseres.
  </div>

  <div class="hinweis" style="background:#F7F5F2;border-left-color:#0F1623">
    <b>Antworten sammeln</b>
    Trag deine Antworten auf dem Antwortbogen ein – er liegt hinter dem letzten Untertest.
    Den Lösungsteil erst danach aufschlagen. Wer zwischendurch spickt, misst nichts.
  </div>
</div>

<!-- UT 1 -->
<div class="seite">
  ${kopf(1,
    'Links siehst du mehrere Einzelteile. Welche der fünf Figuren A bis E lässt sich aus <b>allen</b> Teilen zusammensetzen? Die Teile dürfen gedreht, aber nicht gespiegelt oder übereinandergelegt werden.')}
  ${figuren.map(figurBlock).join('')}
</div>

<!-- UT 2 Lernphase -->
<div class="seite">
  ${kopf(2,
    'Präge dir die acht Allergieausweise ein: Name, Geburtsdatum, Allergie und Notfallmedikament. Nach 8 Minuten blätterst du weiter – die Fragen dazu kommen erst am Ende des Tests.')}
  <div class="ausweis-gitter">${A.ausweise.map(ausweisBlock).join('')}</div>
  <div class="hinweis" style="margin-top:6mm">
    <b>Stopp nach 8 Minuten.</b>
    Nicht zurückblättern. Der Abstand zu den Fragen gehört zur Aufgabe.
  </div>
</div>

<!-- UT 3 -->
<div class="seite">
  ${kopf(3,
    'Finde die Regel hinter der Zahlenfolge und bestimme die nächste Zahl. Achte besonders auf Folgen, in denen sich zwei Regeln abwechseln.')}
  ${zahlen.map(z => textAufg(z.nr,
    '', z.optionen).replace('<p class="frage"></p>',
    `<p class="folge">${z.folge.join('  ·  ')}  ·  ?</p>`)).join('')}
</div>

<!-- UT 4 -->
<div class="seite">
  ${kopf(4,
    'Die Buchstaben ergeben ein sinnvolles deutsches Wort. Finde das Wort und markiere seinen <b>Anfangsbuchstaben</b>. Tempo zählt hier mehr als Gründlichkeit.')}
  ${woerter.map(w => textAufg(w.nr, '', w.optionen, 'buchstaben')
      .replace('<p class="frage"></p>', `<p class="salat">${w.salat}</p>`)).join('')}
</div>

<!-- UT 5 -->
<div class="seite">
  ${kopf(5,
    'Welche Schlussfolgerung ergibt sich <b>zwingend</b> aus der Aussage? Nicht gefragt ist, was plausibel klingt oder in der Realität meistens stimmt.')}
  ${implik.slice(0, 5).map(x => textAufg(x.nr, x.aussage, x.optionen, 'senk')).join('')}
</div>
<div class="seite">
  ${implik.slice(5).map(x => textAufg(x.nr, x.aussage, x.optionen, 'senk')).join('')}
</div>

<!-- UT 2b -->
<div class="seite">
  ${kopf('2b',
    'Beantworte die Fragen zu den Allergieausweisen <b>aus dem Gedächtnis</b>. Nicht zurückblättern – auch nicht kurz.')}
  ${merken.map(m => textAufg(m.nr, m.frage, m.optionen, 'senk')).join('')}
</div>

<!-- ANTWORTBOGEN -->
<div class="seite">
  <h1 class="h-gross">Antwortbogen</h1>
  <p class="lead">Markiere pro Aufgabe genau ein Feld. Falsche Antworten kosten keine Punkte –
     lass am Testtag also nie etwas leer.</p>
  <div class="bogen">
    ${bogenBlock('1 · Figuren', 15)}
    ${bogenBlock('3 · Zahlenfolgen', 10)}
    ${bogenBlock('4 · Wortflüssigkeit', 15)}
  </div>
  <div class="bogen" style="grid-template-columns:1fr 1fr 1fr">
    ${bogenBlock('5 · Implikationen', 10)}
    ${bogenBlock('2b · Gedächtnis', 10)}
    <div></div>
  </div>
</div>

<!-- LÖSUNGEN -->
<div class="seite">
  <h1 class="h-gross">Lösungen</h1>
  <p class="lead">Erst vergleichen, dann die Erklärungen lesen. Wichtiger als die Zahl richtiger
     Antworten ist, <i>warum</i> eine Aufgabe danebenging.</p>

  <div class="loes-gruppe" style="margin-top:6mm">
    <h3>Untertest 1 · Figuren zusammensetzen</h3>
    <div class="kompakt">
      ${figuren.map(f => `<div>${f.nr} &nbsp;<b>${B[f.loesung]}</b></div>`).join('')}
    </div>
    <p style="margin-top:3mm;font-size:9pt;color:var(--grau)">
      Alle fünf Antwortfiguren haben dieselbe Fläche – Kästchenzählen hilft also nicht weiter.
      Such stattdessen die auffälligste Kante eines Teils und prüfe, welche Figur sie überhaupt aufnehmen kann.</p>
  </div>

  <div class="loes-gruppe">
    <h3>Untertest 3 · Zahlenfolgen</h3>
    ${zahlen.map(z => loesZeile(z.nr, B[z.loesung], '<b>' + z.wert + '</b> &nbsp;·&nbsp; ' + esc(z.regel))).join('')}
  </div>
</div>

<div class="seite">
  <div class="loes-gruppe">
    <h3>Untertest 4 · Wortflüssigkeit</h3>
    <div class="kompakt">
      ${woerter.map(w => `<div>${w.nr} &nbsp;<b>${B[w.loesung]}</b><br><span style="font-size:7.5pt;color:#6B7280">${w.wort}</span></div>`).join('')}
    </div>
  </div>

  <div class="loes-gruppe">
    <h3>Untertest 5 · Implikationen erkennen</h3>
    ${implik.map(x => loesZeile(x.nr, B[x.loesung], esc(x.warum))).join('')}
  </div>
</div>

<div class="seite">
  <div class="loes-gruppe">
    <h3>Untertest 2b · Gedächtnis und Merkfähigkeit</h3>
    ${merken.map(m => loesZeile(m.nr, B[m.loesung], esc(m.optionen[m.loesung]))).join('')}
  </div>

  <h2 class="h-gross" style="margin-top:9mm">Deine Auswertung</h2>
  <p class="lead">Zähl deine richtigen Antworten zusammen – insgesamt sind ${summe('aufgaben')} möglich.</p>
  <table class="tabelle">
    <tr><th>Richtige Antworten</th><th>Was das bedeutet</th></tr>
    <tr><td><b>48 – 60</b></td><td>Starke Ausgangslage. Dein Hebel liegt jetzt in der Geschwindigkeit, nicht mehr im Verständnis.</td></tr>
    <tr><td><b>36 – 47</b></td><td>Solide Basis mit klaren Lücken. Meist hängt es an ein oder zwei Untertests – genau die gehören ins Training.</td></tr>
    <tr><td><b>24 – 35</b></td><td>Die Grundlagen sitzen, die Routine fehlt. Mit System ist hier am meisten Boden gutzumachen.</td></tr>
    <tr><td><b>unter 24</b></td><td>Kein Grund zur Panik – aber ein Grund für Struktur. Wahllos weiterüben kostet dich hier Monate.</td></tr>
  </table>
  <p style="margin-top:4mm;font-size:9pt;color:var(--grau)">
    Das ist eine Selbsteinschätzung zum Üben, keine Prognose für den MedAT. Der echte Test wertet jeden
    Untertest einzeln und gewichtet ihn im Gesamtergebnis.</p>
</div>

<!-- HÄUFIGSTE FEHLER -->
<div class="seite">
  <h1 class="h-gross">Die fünf häufigsten Fehler</h1>
  <p class="lead">Nicht fehlendes Wissen kostet im KFF die meisten Punkte, sondern Gewohnheiten.
     Diese fünf sehen wir im Mentoring immer wieder.</p>
  <div class="fehler-liste">
    <div class="fehler"><b>1 · An einer Aufgabe festbeißen</b><span>
      Jede Aufgabe zählt gleich viel. Drei Minuten an einer schweren Figur sind drei Aufgaben, die du
      am Ende nicht mehr siehst. Setz dir eine harte Obergrenze pro Aufgabe und zieh sie durch.</span></div>
    <div class="fehler"><b>2 · Felder leer lassen</b><span>
      Falsche Antworten werden nicht abgezogen. Ein leeres Feld ist ein sicherer Nullpunkt, ein Raten
      sind 20 Prozent. Die letzte Minute gehört dem Ausfüllen aller offenen Felder.</span></div>
    <div class="fehler"><b>3 · Bei Implikationen mitdenken statt ableiten</b><span>
      Gefragt ist, was <i>zwingend</i> folgt – nicht, was realistisch klingt. Sobald du Weltwissen
      einbringst, wählst du zuverlässig die plausible statt der logisch korrekten Antwort.</span></div>
    <div class="fehler"><b>4 · Die Gedächtnisaufgaben stur auswendig lernen</b><span>
      Acht Ausweise als Liste zu wiederholen funktioniert unter Zeitdruck nicht. Wer Namen mit Bildern
      oder Orten verknüpft, ruft sie nach drei Untertests Abstand deutlich sicherer ab.</span></div>
    <div class="fehler"><b>5 · Immer nur das üben, was Spaß macht</b><span>
      Die meisten trainieren ihren stärksten Untertest, weil sich Fortschritt dort gut anfühlt.
      Punkte liegen aber im schwächsten. Deshalb steht am Anfang jedes Plans eine ehrliche Standortbestimmung –
      wie dieser Test.</span></div>
  </div>
</div>

<!-- ABSCHLUSS -->
<div class="seite">
  <h1 class="h-gross">Wie es weitergeht</h1>
  <p class="lead">Du weißt jetzt, wo du stehst. Die eigentliche Frage ist, was du mit den Lücken machst –
     und da trennt sich planloses Üben von gezielter Vorbereitung.</p>
  <p class="lead" style="margin-top:4mm">Der MedAT ist kein Wissenstest. Er ist ein Taktiktest: Wer weiß,
     welche 20 Prozent des Stoffs 80 Prozent der Punkte bringen, spart Monate.</p>

  <div class="cta">
    <h3>Besprich dein Ergebnis –<br><em>kostenlos und unverbindlich.</em></h3>
    <p>20 Minuten Erstgespräch: Wir schauen uns deine Auswertung an und sagen dir ehrlich,
       woran du zuerst arbeiten solltest. Auch dann, wenn das ohne uns geht.</p>
    <div class="knopf">medathunter.at</div>
    <p class="klein">1:1 Mentoring von Medizinstudenten der MedUni Wien · online oder vor Ort in Wien</p>
  </div>

  <p style="margin-top:10mm;font-size:8.5pt;color:var(--grau);border-top:1px solid var(--linie);padding-top:4mm">
    © 2026 MedAT-Hunter · medathunter.at · Dieser Trainingstest ist ein eigenständiges Übungsmaterial
    und steht in keiner Verbindung zu den Medizinischen Universitäten Österreichs oder zum offiziellen MedAT.
    Aufgabenformate, Aufgabenzahl und Zeitvorgaben können vom aktuellen Original abweichen.
  </p>
</div>

</body></html>`;

fs.writeFileSync(__dirname + '/kff-trainingstest.html', html);
console.log('HTML gebaut:', (html.length / 1024).toFixed(0) + ' KB');
console.log('Aufgaben gesamt:', figuren.length + zahlen.length + woerter.length + implik.length + merken.length);
