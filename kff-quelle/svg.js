const F = require('./formen');

// Alle Bruchstuecke einer Aufgabe in einer Reihe, mit EINEM gemeinsamen
// Massstab - sonst wirkt ein kleines Teil so gross wie ein grosses und die
// Aufgabe waere nicht mehr loesbar.
function teileSVG(teile, breite, hoehe, fuell, strich, streuung = 0, maxMassstab = Infinity) {
  const kaesten = teile.map(F.grenzen);
  const luft = 5;
  const nutzHoehe = hoehe * (1 - streuung);              // Rest bleibt fuer die Streuung
  const summeBreite = kaesten.reduce((s, g) => s + (g.x1 - g.x0), 0);
  const maxHoehe = Math.max(...kaesten.map(g => g.y1 - g.y0));
  // Obergrenze verhindert, dass Bruchstuecke einer kleinen Zielform groesser
  // gezeichnet werden als die Antwortformen daneben.
  const s = Math.min(
    (breite - luft * (teile.length + 1)) / summeBreite,
    (nutzHoehe - luft) / maxHoehe,
    maxMassstab
  );

  let x = luft;
  const pfade = teile.map((t, i) => {
    const g = kaesten[i];
    // leichte Hoehenstreuung, damit die Teile verstreut wirken statt aufgereiht
    const versatz = streuung ? (((i * 7 + 3) % 5) / 4 - 0.5) * hoehe * streuung : 0;
    const oy = (hoehe - (g.y1 - g.y0) * s) / 2 + versatz;
    const d = t.map(([px, py], k) =>
      (k ? 'L' : 'M') +
      (x + (px - g.x0) * s).toFixed(2) + ' ' +
      (hoehe - oy - (py - g.y0) * s).toFixed(2)
    ).join(' ') + ' Z';
    x += (g.x1 - g.x0) * s + luft;
    return `<path d="${d}" fill="${fuell}" stroke="${strich}" stroke-width="1.1" stroke-linejoin="round"/>`;
  });

  return `<svg viewBox="0 0 ${breite} ${hoehe}" width="${breite}" height="${hoehe}">${pfade.join('')}</svg>`;
}

// Eine Grundform als Antwortmoeglichkeit. Fester Massstab ueber alle Formen,
// damit Groessenunterschiede echt bleiben und nicht durch Einpassen verschwinden.
function formSVG(ecken, kante, fuell, strich, massstab = 0.42) {
  const s = kante * massstab;
  const g = F.grenzen(ecken);
  const cx = (g.x0 + g.x1) / 2, cy = (g.y0 + g.y1) / 2;
  const d = ecken.map(([x, y], i) =>
    (i ? 'L' : 'M') +
    (kante / 2 + (x - cx) * s).toFixed(2) + ' ' +
    (kante / 2 - (y - cy) * s).toFixed(2)
  ).join(' ') + ' Z';
  return `<svg viewBox="0 0 ${kante} ${kante}" width="${kante}" height="${kante}">`
       + `<path d="${d}" fill="${fuell}" stroke="${strich}" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
}

module.exports = { teileSVG, formSVG };
