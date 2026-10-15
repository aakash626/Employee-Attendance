/* Punch tab: punch an employee in or out. */
views.punch = () => {
  main.innerHTML = `<section class="panel"><h2>Punch in and out</h2>
    <div class="row">${empSel('pEmp')}${stSel('pSt', STATUSES.slice(0, 3))}<label>Time (IST)<input type="datetime-local" id="pT"></label></div>
    <div class="row"><button onclick="punch('in')">Punch in</button><button class="sec" onclick="punch('out')">Punch out</button></div>
    <p class="hint">Leave the time empty to use the current time. Status applies to punch in only.</p><div id="pRes"></div></section>`;
};
window.punch = run(async kind => {
  const body = {emp_code: $('pEmp').value};
  if ($('pT').value) body.punched_at = fromInput($('pT').value);
  if (kind === 'in') body.status = $('pSt').value;
  const r = await api('/attendance/punch-' + kind, {method: 'POST', body});
  $('pRes').innerHTML = recCard(r);
  toast(kind === 'in' ? 'Punched in' : 'Punched out');
});