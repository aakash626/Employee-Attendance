/* Attendance tab: search records, correct a record, show its history. */
views.att = () => {
  main.innerHTML = `<section class="panel"><h2>Attendance records</h2>
    <div class="row">${empSel('aEmp', true)}<label>From<input type="date" id="aFrom"></label><label>To<input type="date" id="aTo"></label>${stSel('aSt', STATUSES, true)}<button onclick="loadAtt(1)">Search</button></div>
    <div id="attT"></div></section>`;
  loadAtt(1);
};
window.loadAtt = run(async p => {
  S.ap = p;
  const d = await api('/attendance', {params: {emp_code: $('aEmp').value, date_from: $('aFrom').value, date_to: $('aTo').value, status: $('aSt').value, page: p, page_size: 15}});
  S.rows = d.items;
  $('attT').innerHTML = d.items.length ? `<table><tr><th>Date</th><th>Employee</th><th>Status</th><th>In</th><th>Out</th><th>Hours</th><th>Late</th><th>Overtime</th><th>Half</th><th></th></tr>${d.items.map((r, i) =>
    `<tr class="st ${r.status}"><td>${r.date}</td><td>${esc(r.emp_code)}</td><td>${chip(r.status)}</td><td>${fmtT(r.punch_in)}</td><td>${fmtT(r.punch_out)}</td><td>${r.work_hours ?? '–'}</td><td>${r.late_minutes || ''}</td><td>${r.overtime_minutes || ''}</td><td>${r.half_day ? 'half' : ''}</td><td><button class="link" onclick="openFix(${i})">Correct</button></td></tr>`).join('')}</table>${pager(d.total, d.page, d.page_size, 'loadAtt')}`
    : '<p class="empty">No records match these filters. Widen the dates or clear the status.</p>';
});
window.openFix = i => {
  const r = S.rows[i];
  $('dlg').innerHTML = `<form onsubmit="saveFix(event,${i})"><h2>Correct ${esc(r.emp_code)} · ${r.date}</h2>
    ${stSel('fSt', STATUSES)}<label>Punch in (IST)<input type="datetime-local" id="fIn" value="${toInput(r.punch_in)}"></label>
    <label>Punch out (IST)<input type="datetime-local" id="fOut" value="${toInput(r.punch_out)}"></label>
    <label>Reason<input id="fWhy" required minlength="5" maxlength="200"></label><label>Corrected by<input id="fBy" required maxlength="50" value="${esc(localStorage.getItem('by') || '')}"></label>
    <div class="row"><button>Save correction</button><button type="button" class="sec" onclick="$('dlg').close()">Cancel</button></div>
    <div class="hist"><b>History (${r.history.length})</b>${r.history.map(h => `<div>${new Date(h.at + IST).toISOString().slice(0, 16).replace('T', ' ')} · ${esc(h.by)} · ${esc(h.reason)} · changed ${Object.keys(h.changes).join(', ')}</div>`).join('') || '<div>No corrections yet.</div>'}</div></form>`;
  $('fSt').value = r.status;
  $('dlg').showModal();
};
window.saveFix = run(async (ev, i) => {
  ev.preventDefault();
  const r = S.rows[i], body = {reason: $('fWhy').value, regularized_by: $('fBy').value};
  if ($('fSt').value !== r.status) body.status = $('fSt').value;
  if ($('fIn').value && $('fIn').value !== toInput(r.punch_in)) body.punch_in = fromInput($('fIn').value);
  if ($('fOut').value && $('fOut').value !== toInput(r.punch_out)) body.punch_out = fromInput($('fOut').value);
  await api(`/attendance/${r.emp_code}/${r.date}`, {method: 'PATCH', body});
  localStorage.setItem('by', body.regularized_by);
  $('dlg').close(); toast('Correction saved'); loadAtt(S.ap);
});