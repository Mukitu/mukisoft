const base = 'http://localhost:3000';
const checks = {
  '/en/team':       ['Tauhid Islam', 'Mukitu Islam Nishat'],
  '/bn/team':       ['আমাদের'],
  '/en/about':      ['About MukiSoft', 'Mission'],
  '/bn/about':      ['আমাদের সম্পর্কে', 'মিশন'],
  '/en/process':    ['Strategy', 'Architecture'],
  '/en/portfolio':  ['Task Management App'],
  '/en/research':   ['Mitigating Transaction-cost'],
  '/en':            ['Mukitu'],
  '/bn':            ['মুকিসফট'],
};
let pass = 0, fail = 0;
for (const [p, m] of Object.entries(checks)) {
  const r = await fetch(base + p);
  const h = await r.text();
  const hits = m.filter((x) => h.includes(x));
  const ok = hits.length === m.length;
  if (ok) pass++; else fail++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + p + '  hits=' + hits.length + '/' + m.length);
}
console.log('---');
console.log('PASS=' + pass + '  FAIL=' + fail);

// Extra: check empty-state pages render gracefully (no errors)
const empties = ['/en/careers', '/en/blog', '/en/gallery'];
for (const p of empties) {
  const r = await fetch(base + p);
  const h = await r.text();
  const status = r.status;
  console.log('  (empty) ' + p + ' status=' + status + ' bytes=' + h.length);
}

// Test cache revalidation endpoint
console.log('---');
console.log('revalidate (no auth):');
const r401 = await fetch(base + '/api/admin/revalidate', { method: 'POST' });
console.log('  status=' + r401.status);

console.log('revalidate (with body, no auth):');
const r401b = await fetch(base + '/api/admin/revalidate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tables: ['team_members'] }),
});
console.log('  status=' + r401b.status);
