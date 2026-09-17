const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  const fehler = [];
  p.on('requestfailed', r => fehler.push(r.url().split('/').pop() + ' :: ' + r.failure().errorText));
  await p.goto('file://' + __dirname + '/kff-trainingstest.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const geladen = await p.evaluate(() => [...new Set(Array.from(document.fonts).filter(f => f.status === 'loaded').map(f => f.family))]);
  console.log('Schriften geladen:', geladen.join(', ') || 'KEINE');
  console.log('Fehlgeschlagene Ressourcen:', fehler.length ? fehler : 'keine');
  await p.pdf({ path: __dirname + '/../kff-trainingstest.pdf', format: 'A4', printBackground: true });
  await b.close();
})();
