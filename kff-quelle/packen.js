const g = require('./geometrie');

// Alle Lagen eines Teils: vier Drehungen (Spiegeln ist im MedAT nicht erlaubt).
function lagen(teil) {
  const raus = [], gesehen = new Set();
  let cur = teil;
  for (let i = 0; i < 4; i++) {
    const n = g.normieren(cur);
    const sig = n.map(z => `${z.x}.${z.y}.${z.t}`).sort().join('|');
    if (!gesehen.has(sig)) { gesehen.add(sig); raus.push(n); }
    cur = g.drehen(cur);
  }
  return raus;
}

// Laesst sich das Ziel exakt aus allen Teilen legen? Vollstaendige Suche.
function zusammensetzbar(teile, ziel) {
  const zielMap = new Map(ziel.map(z => [z.x + ',' + z.y, z.t]));
  const felder = [...zielMap.keys()].sort();
  const alle = teile.map(lagen);
  const belegt = new Set();

  function suche(benutzt) {
    if (belegt.size === felder.length) return true;
    const feld = felder.find(f => !belegt.has(f));
    const [fx, fy] = feld.split(',').map(Number);
    for (let i = 0; i < alle.length; i++) {
      if (benutzt[i]) continue;
      for (const lage of alle[i]) {
        for (const anker of lage) {
          const dx = fx - anker.x, dy = fy - anker.y;
          let passt = true;
          for (const z of lage) {
            const k = (z.x + dx) + ',' + (z.y + dy);
            if (zielMap.get(k) !== z.t || belegt.has(k)) { passt = false; break; }
          }
          if (!passt) continue;
          const gesetzt = lage.map(z => (z.x + dx) + ',' + (z.y + dy));
          gesetzt.forEach(k => belegt.add(k));
          benutzt[i] = true;
          if (suche(benutzt)) return true;
          benutzt[i] = false;
          gesetzt.forEach(k => belegt.delete(k));
        }
      }
    }
    return false;
  }
  return suche(new Array(teile.length).fill(false));
}
module.exports = { zusammensetzbar, lagen };
