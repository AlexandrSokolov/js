
import { greet } from './module-lib.js';
// Module scripts are deferred by default.
window.__moduleDemo = { greet };
__demo.stamp('CASE 9: module entry executed (deferred)');
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-module');
  if (btn) btn.addEventListener('click', () => __demo.stamp('CASE 9: ' + greet('from module')));
});
