/* Start-up: tab bar, loading employees, connection check. Loaded last. */
const TABS = [['punch', 'Punch'], ['att', 'Attendance'], ['emp', 'Employees'], ['ana', 'Analytics'], ['chk', 'Index check']];
function show(t) {
  $('tabs').innerHTML = TABS.map(([k, l]) => `<button class="${k === t ? 'on' : ''}" onclick="show('${k}')">${l}</button>`).join('');
  views[t]();
}
async function loadEmps() {
  S.emps = []; for (let p = 1; ; p++) { const d = await api('/employees', {params: {page: p, page_size: 100}}); S.emps.push(...d.items); if (S.emps.length >= d.total) break; }
}
async function boot() {
  $('api').value = API;
  try { await api('/health'); $('state').innerHTML = '<span class="dot up"></span> connected'; await loadEmps(); }
  catch (e) { $('state').innerHTML = '<span class="dot down"></span> offline'; toast(e.message, true); }
  show('punch');
}
$('api').addEventListener('change', e => { API = e.target.value.replace(/\/$/, ''); localStorage.setItem('api', API); boot(); });
boot();