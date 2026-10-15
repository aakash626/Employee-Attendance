/* Small helpers: time formatting (IST), form selects, pager, record summary card. */
const IST = 19800000;
const fmtT = ms => ms ? new Date(ms + IST).toISOString().slice(11, 16) : '–';
const toInput = ms => ms ? new Date(ms + IST).toISOString().slice(0, 16) : '';
const fromInput = v => { const [d, t] = v.split('T'), [y, m, da] = d.split('-').map(Number), [h, mi] = t.split(':').map(Number); return Date.UTC(y, m - 1, da, h, mi) - IST; };
const pct = v => v == null ? '–' : (v * 100).toFixed(1) + '%';
const depts = () => [...new Set(S.emps.map(e => e.department))].sort();
const empSel = (id, all) => `<label>Employee<select id="${id}">${all ? '<option value="">All</option>' : ''}${S.emps.map(e => `<option value="${e.emp_code}">${e.emp_code} · ${esc(e.name)}</option>`).join('')}</select></label>`;
const deptSel = (id, all) => `<label>Department<select id="${id}">${all ? '<option value="">All</option>' : ''}${depts().map(d => `<option>${esc(d)}</option>`).join('')}</select></label>`;
const stSel = (id, list, all) => `<label>Status<select id="${id}">${all ? '<option value="">All</option>' : ''}${list.map(s => `<option>${s}</option>`).join('')}</select></label>`;
const chip = s => `<span class="chip ${s}">${s}</span>`;
function pager(total, page, size, fn) {
  const pages = Math.max(1, Math.ceil(total / size));
  return `<div class="pager"><button class="sec" ${page <= 1 ? 'disabled' : ''} onclick="${fn}(${page - 1})">Previous</button>Page ${page} of ${pages} (${total} total)<button class="sec" ${page >= pages ? 'disabled' : ''} onclick="${fn}(${page + 1})">Next</button></div>`;
}
function recCard(r) {
  const f = (v, l) => `<div><b>${v}</b><span>${l}</span></div>`;
  return `<h3>${esc(r.emp_code)} on ${r.date} ${chip(r.status)}</h3><div class="facts">${f(fmtT(r.punch_in), 'In (IST)')}${f(fmtT(r.punch_out), 'Out (IST)')}${f(r.work_hours ?? '–', 'Hours')}${f(r.late_minutes, 'Late minutes')}${f(r.overtime_minutes, 'Overtime minutes')}${f(r.half_day ? 'Yes' : 'No', 'Half day')}</div>`;
}