/* Analytics tab: employee monthly summary, department table, late leaderboard, trend chart. */
views.ana = () => {
  main.innerHTML = `<section class="panel"><h2>Analytics</h2><div class="row"><label>Month<input type="month" id="mon" value="2026-07"></label>${empSel('anEmp')}${deptSel('anDept', true)}
    <label>Top<input id="anLim" type="number" min="1" max="50" value="10" style="width:70px"></label><button onclick="loadAna()">Load</button></div>
    <p class="hint">The sample data is from July 2026.</p></section>
    <section class="panel" id="anM"></section><section class="panel" id="anS"></section><section class="panel" id="anL"></section><section class="panel" id="anT"></section>`;
  loadAna();
};
function chart(items) {
  const W = 720, H = 220, L = 40, T = 10, B = 24, w = W - L - 10, h = H - T - B, n = items.length;
  const x = i => L + (n < 2 ? w / 2 : i * w / (n - 1)), y = v => T + h * (1 - Math.min(v, 1)), bw = w / Math.max(n - 1, 1);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Attendance rate and 7-day average">`;
  items.forEach((r, i) => { if (!r.is_working_day) s += `<rect class="wk" x="${x(i) - bw / 2}" y="${T}" width="${bw}" height="${h}"/>`; });
  [0, .5, 1].forEach(v => s += `<line class="gl" x1="${L}" x2="${W - 10}" y1="${y(v)}" y2="${y(v)}"/><text x="4" y="${y(v) + 4}">${v * 100}%</text>`);
  const path = k => { let d = '', pen = false; items.forEach((r, i) => { const v = r[k]; if (v == null) { pen = false; return; } d += (pen ? 'L' : 'M') + x(i) + ' ' + y(v); pen = true; }); return d; };
  s += `<path class="l1" d="${path('attendance_rate')}"/><path class="l2" d="${path('moving_avg_7d')}"/>`;
  items.forEach((r, i) => { if (r.attendance_rate != null) s += `<circle cx="${x(i)}" cy="${y(r.attendance_rate)}" r="2.5" fill="var(--acc)"/>`; });
  return s + `<text x="${L}" y="${H - 6}">${items[0].date}</text><text x="${W - 10}" y="${H - 6}" text-anchor="end">${items[n - 1].date}</text></svg>
    <p class="hint">Solid line: daily attendance rate. Dashed line: 7-day average. Shaded columns are weekends.</p>`;
}
window.loadAna = run(async () => {
  const month = $('mon').value, dept = $('anDept').value || depts()[0], emp = $('anEmp').value;
  const [y, m] = month.split('-').map(Number), last = new Date(y, m, 0).getDate();
  const [mo, su, lb, tr] = await Promise.allSettled([
    api(`/analytics/employees/${emp}/monthly`, {params: {month}}),
    api('/analytics/departments/summary', {params: {month, department: $('anDept').value}}),
    api('/analytics/leaderboard/late', {params: {month, limit: $('anLim').value, department: $('anDept').value}}),
    api(`/analytics/departments/${encodeURIComponent(dept)}/trend`, {params: {from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}`}})]);
  const bad = (p, el) => { if (p.status === 'rejected') { $(el).innerHTML = `<p class="fail">${esc(p.reason.message)}</p>`; return true; } };
  if (!bad(mo, 'anM')) { const v = mo.value, f = (a, l) => `<div><b>${a ?? '–'}</b><span>${l}</span></div>`;
    $('anM').innerHTML = `<h2>${esc(emp)} in ${month}</h2><div class="facts">${f(v.attendance_pct == null ? null : v.attendance_pct + '%', 'Attendance')}${f(v.present_days, 'Present days')}${f(v.working_days, 'Working days')}${f(v.leave_days, 'Leave days')}${f(v.late_count, 'Late days')}${f(v.total_late_minutes, 'Late minutes')}${f(v.total_overtime_minutes, 'Overtime minutes')}</div>`; }
  if (!bad(su, 'anS')) $('anS').innerHTML = `<h2>Departments</h2>${su.value.items.length ? `<table><tr><th>Department</th><th>Headcount</th><th>Present days</th><th>Avg hours</th><th>Late days</th><th>Late minutes</th><th>Leave</th><th>On duty</th></tr>${su.value.items.map(r =>
    `<tr><td>${esc(r.department)}</td><td>${r.headcount}</td><td>${r.present_days}</td><td>${r.avg_work_hours ?? '–'}</td><td>${r.late_count}</td><td>${r.total_late_minutes}</td><td>${r.leave_count}</td><td>${r.on_duty_count}</td></tr>`).join('')}</table>` : '<p class="empty">No department had staff this month.</p>'}`;
  if (!bad(lb, 'anL')) $('anL').innerHTML = `<h2>Most late minutes</h2>${lb.value.items.length ? `<table><tr><th>Rank</th><th>Employee</th><th>Department</th><th>Late minutes</th><th>Late days</th></tr>${lb.value.items.map(r =>
    `<tr><td>${r.rank}</td><td>${esc(r.emp_code)} · ${esc(r.name)}</td><td>${esc(r.department)}</td><td>${r.total_late_minutes}</td><td>${r.late_count}</td></tr>`).join('')}</table>` : '<p class="empty">Nobody was late this month.</p>'}`;
  if (!bad(tr, 'anT')) $('anT').innerHTML = `<h2>${esc(dept)} daily trend</h2>${chart(tr.value.items)}`;
});