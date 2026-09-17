const g = require('./geometrie');

// Zeichnet eine Zellmenge als Umriss. Die y-Achse wird gespiegelt, damit die
// Figur so steht, wie man sie auf dem Papier erwartet.
function figurSVG(zellen, kante, fuell, strich) {
  const pts = g.vereinfachen(g.kontur(zellen));
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const b = Math.max(maxX - minX, maxY - minY) || 1;
  const s = (kante - 10) / b;
  const ox = (kante - (maxX - minX) * s) / 2, oy = (kante - (maxY - minY) * s) / 2;
  const d = pts.map((p, i) =>
    (i ? 'L' : 'M') +
    (ox + (p[0] - minX) * s).toFixed(2) + ' ' +
    (kante - oy - (p[1] - minY) * s).toFixed(2)
  ).join(' ') + ' Z';
  return `<svg viewBox="0 0 ${kante} ${kante}" width="${kante}" height="${kante}">`
       + `<path d="${d}" fill="${fuell}" stroke="${strich}" stroke-width="2" stroke-linejoin="round"/></svg>`;
}
module.exports = { figurSVG };
