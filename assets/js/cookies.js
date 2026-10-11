(function () {
  'use strict';
  var K = 'ma_consent_v1', d = document;
  function g() { (window.dataLayer = window.dataLayer || []).push(arguments); }
  function read() { try { return localStorage.getItem(K); } catch (e) { return null; } }
  function save(v) {
    try { localStorage.setItem(K, v); } catch (e) {}
    g('consent', 'update', { analytics_storage: v });
  }
  var css = '.ma-ck{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);width:min(560px,calc(100vw - 24px));z-index:10000;background:#0b1c2c;color:#f6f1e8;border-radius:14px;padding:16px 18px;font:14px/1.5 Inter,system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.35)}' +
    '.ma-ck p{margin:0 0 12px}.ma-ck a{color:#d8c3a0}.ma-ck div{display:flex;gap:10px}' +
    '.ma-ck button{flex:1;padding:11px 14px;border-radius:999px;border:1px solid #d8c3a0;font:inherit;font-weight:500;cursor:pointer;min-height:44px}' +
    '.ma-ck .y{background:#d8c3a0;color:#0b1c2c}.ma-ck .n{background:transparent;color:#f6f1e8}';
  function show() {
    if (d.querySelector('.ma-ck')) return;
    var s = d.createElement('style'); s.textContent = css; d.head.appendChild(s);
    var b = d.createElement('div');
    b.className = 'ma-ck'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Cookies');
    b.innerHTML = '<p>Usamos cookies de analítica (Google) para mejorar la web, solo si las aceptas. Las necesarias siempre están activas. Más información en la <a href="/pages/cookies.html">Política de Cookies</a>.</p>' +
      '<div><button class="n" type="button">Rechazar</button><button class="y" type="button">Aceptar</button></div>';
    b.querySelector('.n').onclick = function () { save('denied'); b.remove(); };
    b.querySelector('.y').onclick = function () { save('granted'); b.remove(); };
    d.body.appendChild(b);
  }
  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.open-cookies');
    if (t) { e.preventDefault(); show(); }
  });
  var v = read();
  if (v) g('consent', 'update', { analytics_storage: v }); else show();
})();
