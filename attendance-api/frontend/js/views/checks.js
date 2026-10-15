/* Index check tab: runs /admin/explain for each analytics query and reports IXSCAN / COLLSCAN. */
views.chk = () => {
  main.innerHTML = `<section class="panel"><h2>Index check</h2><p class="hint">Runs the explain plan for each analytics query. Every row should show an index scan and no collection scan.</p>
    <div class="row"><button onclick="runChecks()">Run checks</button></div><div id="chT"></div></section>`;
};
const findKey = (o, k) => { if (o && typeof o === 'object') { if (k in o) return o[k]; for (const v of Object.values(o)) { const r = findKey(v, k); if (r !== undefined) return r; } } };
window.runChecks = run(async () => {
  const month = '2026-07', e = S.emps[0]?.emp_code, d = depts()[0];
  const jobs = [['attendance_list', {}], ['employee_monthly', {emp_code: e, month}], ['department_summary', {month}], ['late_leaderboard', {month}], ['department_trend', {department: d, from: '2026-07-01', to: '2026-07-31'}]];
  const rows = [];
  for (const [name, params] of jobs) {
    try {
      const r = await api('/admin/explain/' + name, {params}), txt = JSON.stringify(r.explain), ix = txt.includes('"IXSCAN"'), cs = txt.includes('"COLLSCAN"');
      rows.push(`<tr><td>${name}</td><td>${r.collection}</td><td class="${ix ? 'good' : 'fail'}">${ix ? 'yes' : 'no'}</td><td class="${cs ? 'fail' : 'good'}">${cs ? 'yes' : 'no'}</td><td>${findKey(r.explain, 'totalDocsExamined') ?? '–'}</td><td>${findKey(r.explain, 'executionTimeMillis') ?? '–'}</td></tr>`);
    } catch (x) { rows.push(`<tr><td>${name}</td><td colspan="5" class="fail">${esc(x.message)}</td></tr>`); }
  }
  $('chT').innerHTML = `<table><tr><th>Query</th><th>Collection</th><th>Index scan</th><th>Collection scan</th><th>Documents examined</th><th>Milliseconds</th></tr>${rows.join('')}</table>`;
});