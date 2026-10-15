/* Shared constants, app state and the DOM handles every other file uses. Loaded first. */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const STATUSES = ['PRESENT','WFH','ON_DUTY','ABSENT','LEAVE'];
let API = localStorage.getItem('api') || 'http://localhost:8000';
const S = {emps: [], rows: [], ap: 1, ep: 1};

/* Each tab registers a render function here: views.punch, views.att, ... */
const views = {};
const main = $('main');