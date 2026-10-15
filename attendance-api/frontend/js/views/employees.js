/* Employees tab: list, filter and add employees. */
views.emp = () => {
  main.innerHTML = `<section class="panel"><h2>Employees</h2><div class="row">${deptSel('eDept', true)}<button onclick="loadEmp(1)">Filter</button></div><div id="eT"></div></section>
  <section class="panel"><h2>Add an employee</h2><form class="row" onsubmit="addEmp(event)">
    <label>Code<input id="nCode" required pattern="EMP[0-9]{4,6}" placeholder="EMP0007"></label><label>Name<input id="nName" required></label>
    <label>Email<input id="nMail" type="email" required></label><label>Department<input id="nDept" required></label>
    <label>Shift start<input id="nS" type="time" value="09:30" required></label><label>Shift end<input id="nE" type="time" value="18:30" required></label>
    <label>Joined on<input id="nJ" type="date" required></label><button>Add employee</button></form>
    <p class="hint">A shift that ends at or before it starts runs overnight.</p></section>`;
  loadEmp(1);
};
window.loadEmp = run(async p => {
  const d = await api('/employees', {params: {department: $('eDept').value, page: p, page_size: 15}});
  $('eT').innerHTML = d.items.length ? `<table><tr><th>Code</th><th>Name</th><th>Email</th><th>Department</th><th>Shift (IST)</th><th>Joined</th></tr>${d.items.map(e =>
    `<tr><td>${esc(e.emp_code)}</td><td>${esc(e.name)}</td><td>${esc(e.email)}</td><td>${esc(e.department)}</td><td>${e.shift_start}–${e.shift_end}</td><td>${e.joined_on}</td></tr>`).join('')}</table>${pager(d.total, d.page, d.page_size, 'loadEmp')}` : '<p class="empty">No employees yet. Add one below.</p>';
});
window.addEmp = run(async ev => {
  ev.preventDefault();
  await api('/employees', {method: 'POST', body: {emp_code: $('nCode').value, name: $('nName').value, email: $('nMail').value, department: $('nDept').value, shift_start: $('nS').value, shift_end: $('nE').value, joined_on: $('nJ').value}});
  toast('Employee added'); await loadEmps(); views.emp();
});