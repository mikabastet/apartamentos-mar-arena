(function () {
  'use strict';

  var CONFIG = {
    webhook: 'https://vmi3162910.contaboserver.net/webhook/mar-arena-chat',                 // URL del webhook de n8n. Vacío = solo respuestas locales
    whatsapp: '5492914048082',
    name: 'Perla',
    teaserDelay: 4000
  };

  var WA_URL = 'https://wa.me/' + CONFIG.whatsapp + '?text=' +
    encodeURIComponent('Hola! Quisiera saber la disponibilidad de los departamentos Mar y Arena, muchas gracias');

  var HANDOFF = 'Para fechas, precios y reservas te paso con la anfitriona. Te responde enseguida por WhatsApp.';
  var FALLBACK = { a: 'Eso prefiero que te lo confirme la anfitriona, así no te digo algo equivocado.', h: true };

  var KB = [
    { k: /(somos|vamos|iremos|seremos|viajamos)\s+(\w+\s+)?([3-9]|tres|cuatro|cinco|seis|siete|ocho)\b|\b([3-9]|tres|cuatro|cinco|seis|siete|ocho)\s+(personas|adultos|amigos|gente)/, a: 'Cada apartamento admite un máximo de 2 personas, así que no podemos alojar a más.', g: 'cap' },
    { k: /reserv|disponib|fecha|precio|cuesta|tarifa|valor|libre|ocupad|cotiz|presupuesto/, a: HANDOFF, h: true },
    { k: /mascota|perro|gato/, a: 'Lamentablemente no se aceptan mascotas, de ningún tamaño.' },
    { k: /estacion|cochera|aparca|garage|coche|\bauto/, a: 'No contamos con estacionamiento ni aparcamiento.' },
    { k: /sena|anticipo|garantia|pago|pagar/, a: 'Sí, para garantizar la estadía se pide una seña del 50%.' },
    { k: /minimo|cuantos dias|cuantas noches|semana|quincena/, a: 'El alquiler mínimo es de 3 días. También hay opciones por semana o quincena.' },
    { k: /persona|capacidad|huesped|gente|cuantos (son|entran|caben)/, a: 'Cada apartamento es para un máximo de 2 personas.', g: 'cap' },
    { k: /nino|hijo|bebe|chico|\bmenor(es)?\b|familia/, a: 'Cada apartamento admite un máximo de 2 personas en total. Si viajas con niños o bebés, consulta con la anfitriona.', h: true, g: 'cap' },
    { k: /incluye|servicio|wifi|wi-fi|internet|\bluz\b|\bagua\b|\bgas\b/, a: 'El alquiler incluye el apartamento equipado, los servicios (luz, agua y gas) y WiFi de alta velocidad.' },
    { k: /aire|cocina|tele|\btv\b|parrilla|patio|terraza|comodidad|equipad/, a: 'Ambos tienen aire acondicionado silencioso, cocina completa, TV Smart con cable, WiFi y patio o terraza privada. El Mar suma un patio con parrilla; el Arena, una terraza con vistas despejadas.' },
    { k: /diferencia|apartamento|departamento|depto|cual /, a: 'Hay dos. Mar es un refugio con patio privado y parrilla, a pasos de la playa. Arena está en un primer piso con acceso independiente y una terraza con vistas despejadas.' },
    { k: /playa|\bmar\b|distancia|cerca|metros|caminando/, a: 'Estamos a 300 metros de la playa principal: menos de 5 minutos caminando.' },
    { k: /donde|ubicacion|direccion|mapa|llegar/, a: 'Estamos en Monte Hermoso, a 300 m de la playa. Al final de la página hay un mapa.' },
    { k: /^(hola|buenas|buen dia|buenos dias|hey)/, a: '¡Hola! Pregúntame por las comodidades, la ubicación o las condiciones, o elige una opción de abajo.', s: true },
    { k: /gracias|genial|perfecto/, a: 'Con gusto. Si quieres consultar fechas, te paso con la anfitriona.', s: true }
  ];

  var CHIPS = ['Ver disponibilidad', '¿Cuántas personas caben?', '¿Aceptan mascotas?',
    '¿Hay estacionamiento?', '¿Cómo es la seña?', '¿Qué incluye?'];

  var SHELL = '<svg viewBox="0 0 64 64" aria-hidden="true"><g transform="rotate(-32 32 32) translate(3 3) scale(.9)"><path d="M38 30C54 34 58 50 42 61C34 64 26 58 29 49C31 42 34 36 38 30Z" fill="#ecbab0" stroke="#8f7650" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="32" cy="40" rx="18" ry="17" fill="#e3cfa8" stroke="#8f7650" stroke-width="1.6"/><path d="M38 30C54 34 58 50 42 61C34 64 26 58 29 49C31 42 34 36 38 30Z" fill="#ecbab0" stroke="#8f7650" stroke-width="1.6" stroke-linejoin="round"/><path d="M39 34C49 38 51 49 41 56C36 58 32 55 33 50C34 45 36 39 39 34Z" fill="#d98d85"/><ellipse cx="32" cy="24" rx="11" ry="6.5" fill="#d8c3a0" stroke="#8f7650" stroke-width="1.5"/><ellipse cx="32" cy="16.5" rx="7.5" ry="4.5" fill="#e3cfa8" stroke="#8f7650" stroke-width="1.5"/><ellipse cx="32" cy="10.5" rx="4.5" ry="3" fill="#d8c3a0" stroke="#8f7650" stroke-width="1.5"/><path d="M32 5.5v-1.5" stroke="#8f7650" stroke-width="1.5" stroke-linecap="round"/><path d="M15 38C19 46 26 50 33 49M17 30C21 36 27 38 33 36M20 48c3 4 7 6 11 6" fill="none" stroke="#b39a72" stroke-width="1.3" stroke-linecap="round"/></g></svg>';

  var CSS = '.pl-root{--ink:#0b1c2c;--sand:#d8c3a0;--foam:#f6f1e8;--deep:#2f5570;position:fixed;left:20px;bottom:20px;z-index:9999;text-align:left;font-family:Inter,system-ui,sans-serif}' +
    '.pl-fab{display:block;width:68px;height:68px;border:0;background:none;padding:0;cursor:pointer;filter:drop-shadow(0 6px 10px rgba(11,28,44,.35));transition:transform .25s}' +
    '.pl-fab:hover{transform:rotate(-6deg) scale(1.06)}.pl-fab svg{width:100%;height:100%}' +
    '.pl-fab:focus-visible,.pl-chip:focus-visible,.pl-send:focus-visible,.pl-close:focus-visible{outline:3px solid var(--sand);outline-offset:3px}' +
    '.pl-teaser{position:absolute;left:78px;bottom:14px;width:max-content;max-width:210px;background:var(--ink);color:var(--foam);font-size:14px;line-height:1.35;padding:11px 28px 11px 14px;border-radius:14px 14px 14px 4px;cursor:pointer;opacity:0;transform:translateX(-8px);pointer-events:none;transition:opacity .4s,transform .4s}' +
    '.pl-teaser.on{opacity:1;transform:none;pointer-events:auto}' +
    '.pl-teaser b{display:block;font-family:"Playfair Display",Georgia,serif;font-weight:400;font-size:16px;color:var(--sand)}' +
    '.pl-tx{position:absolute;top:2px;right:4px;border:0;background:none;color:var(--foam);font-size:16px;cursor:pointer;padding:2px 6px}' +
    '.pl-panel{position:absolute;left:0;bottom:84px;width:360px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 120px);background:var(--foam);border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 50px rgba(11,28,44,.35);transform-origin:bottom left;opacity:0;transform:scale(.92) translateY(10px);visibility:hidden;pointer-events:none;transition:opacity .25s,transform .25s,visibility .25s}' +
    '.pl-panel.open{opacity:1;transform:none;visibility:visible;pointer-events:auto}' +
    '.pl-head{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--ink);color:#fff}.pl-head svg{width:38px;height:38px;flex:none}' +
    '.pl-title{font-family:"Playfair Display",Georgia,serif;font-size:19px;line-height:1.1}.pl-sub{font-size:12px;color:var(--sand);margin-top:2px}' +
    '.pl-close{margin-left:auto;background:none;border:0;color:#fff;font-size:24px;cursor:pointer;padding:2px 8px;line-height:1}' +
    '.pl-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}' +
    '.pl-m{max-width:84%;padding:10px 13px;font-size:14.5px;line-height:1.5;border-radius:14px;overflow-wrap:anywhere;white-space:pre-line}' +
    '.pl-b{align-self:flex-start;background:#fff;color:var(--ink);border-bottom-left-radius:4px}' +
    '.pl-u{align-self:flex-end;background:var(--ink);color:var(--foam);border-bottom-right-radius:4px}' +
    '.pl-wa{align-self:flex-start;background:var(--sand);color:var(--ink);text-decoration:none;font-size:14px;font-weight:500;padding:11px 18px;border-radius:999px}.pl-wa:hover{background:#cdb68e}' +
    '.pl-dots span{display:inline-block;width:6px;height:6px;margin-right:4px;border-radius:50%;background:var(--deep);animation:pl-b 1s infinite}.pl-dots span:nth-child(2){animation-delay:.15s}.pl-dots span:nth-child(3){animation-delay:.3s}' +
    '@keyframes pl-b{0%,60%,100%{opacity:.3}30%{opacity:1}}' +
    '.pl-chips{display:flex;gap:8px;padding:0 16px 10px;overflow-x:auto;scrollbar-width:none}.pl-chips::-webkit-scrollbar{display:none}' +
    '.pl-chip{flex:none;border:1px solid var(--deep);background:transparent;color:var(--deep);font:inherit;font-size:13px;padding:7px 12px;border-radius:999px;cursor:pointer}.pl-chip:hover{background:var(--deep);color:#fff}' +
    '.pl-form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid rgba(11,28,44,.12);background:#fff}' +
    '.pl-in{flex:1;min-width:0;border:0;font:inherit;font-size:16px;padding:8px 6px;outline:none;color:var(--ink);background:transparent}' +
    '.pl-send{flex:none;border:0;background:var(--ink);color:#fff;border-radius:50%;width:38px;height:38px;cursor:pointer;font-size:16px}' +
    '.pl-back,.pl-grab{display:none}.pl-head{position:relative}.pl-msgs{overscroll-behavior:contain}' +
    '.pl-chips{-webkit-mask-image:linear-gradient(90deg,#000 90%,transparent);mask-image:linear-gradient(90deg,#000 90%,transparent)}' +
    'html.pl-lock{overflow:hidden}' +
    '@media(max-width:600px){.pl-root{left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px))}' +
    '.pl-fab{width:60px;height:60px}.pl-root.is-open .pl-fab,.pl-root.is-open .pl-teaser{display:none}' +
    '.pl-teaser{left:68px;bottom:10px;max-width:170px;font-size:13px}.pl-teaser b{font-size:15px}.pl-tx{padding:8px 10px}' +
    '.pl-back{display:block;position:fixed;inset:0;background:rgba(11,28,44,.55);opacity:0;visibility:hidden;transition:opacity .25s,visibility .25s}.pl-root.is-open .pl-back{opacity:1;visibility:visible}' +
    '.pl-panel{position:fixed;left:0;right:0;bottom:0;width:auto;max-width:none;height:min(88vh,640px);height:min(88dvh,640px);max-height:none;border-radius:20px 20px 0 0;opacity:1;transform:translateY(100%);transform-origin:bottom center}.pl-panel.open{transform:none}' +
    '.pl-head{padding:22px 16px 12px;touch-action:none}.pl-grab{display:block;position:absolute;top:8px;left:50%;width:44px;height:4px;margin-left:-22px;border-radius:2px;background:rgba(255,255,255,.4)}' +
    '.pl-close{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.14);font-size:26px;padding:0}' +
    '.pl-m{font-size:16px;max-width:88%}.pl-chip{font-size:14px;padding:10px 14px}.pl-wa{padding:13px 20px;font-size:15px}' +
    '.pl-form{padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px))}.pl-send{width:44px;height:44px}}' +
    '@media(prefers-reduced-motion:reduce){.pl-root *{transition:none!important;animation:none!important}}';

  function norm(s) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function local(text) {
    var t = norm(text), out = [], used = {}, h = false, i, e;
    for (i = 0; i < KB.length && out.length < 2; i++) {
      e = KB[i];
      if (e.s || !e.k.test(t) || (e.g && used[e.g])) continue;
      if (e.g) used[e.g] = 1;
      out.push(e.a);
      h = h || !!e.h;
    }
    if (!out.length) {
      for (i = 0; i < KB.length; i++) {
        if (KB[i].s && KB[i].k.test(t)) return { a: KB[i].a, h: false };
      }
      return null;
    }
    return { a: out.join('\n\n'), h: h };
  }

  var sid = 'pl-' + Math.random().toString(36).slice(2, 10);
  var hist = [];

  function ask(text, past) {
    var r = local(text);
    if (r) return Promise.resolve(r);
    if (!CONFIG.webhook) return Promise.resolve(FALLBACK);
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 20000);
    return fetch(CONFIG.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId: sid, history: past || [] }),
      signal: ctrl.signal
    })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (d) {
        var a = String(d.reply || '').trim();
        return a ? { a: a, h: !!d.handoff } : FALLBACK;
      })
      .catch(function (err) { console.warn('[Perla] No se pudo usar el webhook:', err && err.message ? err.message : err); return FALLBACK; })
      .then(function (x) { clearTimeout(timer); return x; });
  }

  function track(name) {
    (window.dataLayer = window.dataLayer || []).push({ event: name });
  }

  function init() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var root = document.createElement('div');
    root.className = 'pl-root';
    root.innerHTML =
      '<div class="pl-back"></div>' +
      '<div class="pl-teaser" role="status"><b>¿Tienes dudas?</b>Yo te las resuelvo<button class="pl-tx" aria-label="Cerrar aviso">&times;</button></div>' +
      '<div class="pl-panel" role="dialog" aria-label="Chat con ' + CONFIG.name + '">' +
      '<div class="pl-head"><i class="pl-grab"></i>' + SHELL + '<div><div class="pl-title">' + CONFIG.name + '</div><div class="pl-sub">Resuelvo tus dudas al instante</div></div>' +
      '<button class="pl-close" aria-label="Cerrar chat">&times;</button></div>' +
      '<div class="pl-msgs" aria-live="polite"></div>' +
      '<div class="pl-chips"></div>' +
      '<form class="pl-form"><input class="pl-in" maxlength="300" placeholder="Escribe tu pregunta" aria-label="Tu pregunta" autocomplete="off">' +
      '<button class="pl-send" aria-label="Enviar">&#10148;</button></form></div>' +
      '<button class="pl-fab" aria-label="Abrir chat con ' + CONFIG.name + '">' + SHELL + '</button>';
    document.body.appendChild(root);

    var $ = function (s) { return root.querySelector(s); };
    var panel = $('.pl-panel'), msgs = $('.pl-msgs'), chips = $('.pl-chips'),
      form = $('.pl-form'), input = $('.pl-in'), teaser = $('.pl-teaser'), fab = $('.pl-fab'),
      head = $('.pl-head'), back = $('.pl-back');
    var mq = window.matchMedia ? window.matchMedia('(max-width:600px)') : { matches: false };
    function mobile() { return mq.matches; }
    var greeted = false, busy = false;

    function scroll() { msgs.scrollTop = msgs.scrollHeight; }

    function add(text, cls) {
      var d = document.createElement('div');
      d.className = 'pl-m ' + cls;
      d.textContent = text;
      msgs.appendChild(d);
      scroll();
      return d;
    }

    function addWA() {
      var a = document.createElement('a');
      a.className = 'pl-wa';
      a.href = WA_URL;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Hablar por WhatsApp';
      a.addEventListener('click', function () { track('chatbot_whatsapp'); });
      msgs.appendChild(a);
      scroll();
    }

    function send(text) {
      text = text.trim().slice(0, 300);
      if (!text || busy) return;
      busy = true;
      add(text, 'pl-u');
      var typing = add('', 'pl-m pl-b pl-dots');
      typing.innerHTML = '<span></span><span></span><span></span>';
      var started = Date.now();
      var past = hist.slice(-6);
      ask(text, past).then(function (r) {
        hist.push({ role: 'user', content: text }, { role: 'assistant', content: r.a });
        var wait = Math.max(0, 650 - (Date.now() - started));
        setTimeout(function () {
          typing.remove();
          add(r.a, 'pl-b');
          if (r.h) addWA();
          busy = false;
        }, wait);
      });
    }

    function fit() {
      var v = window.visualViewport;
      if (!mobile() || !v) { panel.style.height = ''; panel.style.bottom = ''; return; }
      panel.style.height = Math.min(v.height * 0.9, 640) + 'px';
      panel.style.bottom = Math.max(0, window.innerHeight - v.height - v.offsetTop) + 'px';
      scroll();
    }

    function open() {
      panel.classList.add('open');
      root.classList.add('is-open');
      teaser.classList.remove('on');
      if (mobile()) {
        document.documentElement.classList.add('pl-lock');
        if (!(history.state && history.state.pl)) history.pushState({ pl: 1 }, '');
        fit();
      }
      track('chatbot_open');
      if (!greeted) {
        greeted = true;
        add('¡Hola! Soy ' + CONFIG.name + '. Resuelvo tus dudas sobre los apartamentos. Elige una opción o escribe tu pregunta.', 'pl-b');
      }
      if (!mobile()) setTimeout(function () { input.focus(); }, 250);
    }

    function close(fromPop) {
      if (!panel.classList.contains('open')) return;
      panel.classList.remove('open');
      root.classList.remove('is-open');
      document.documentElement.classList.remove('pl-lock');
      panel.style.transform = '';
      if (fromPop !== true && history.state && history.state.pl) history.back();
      if (!dismissed) teaser.classList.add('on');
      if (!mobile()) fab.focus();
    }

    CHIPS.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pl-chip';
      b.textContent = c;
      b.addEventListener('click', function () { send(c); });
      chips.appendChild(b);
    });

    fab.addEventListener('click', function () { panel.classList.contains('open') ? close() : open(); });
    $('.pl-close').addEventListener('click', function () { close(); });
    back.addEventListener('click', function () { close(); });
    window.addEventListener('popstate', function () { close(true); });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fit);
      window.visualViewport.addEventListener('scroll', fit);
    }
    var y0 = null;
    head.addEventListener('touchstart', function (e) { if (mobile()) y0 = e.touches[0].clientY; }, { passive: true });
    head.addEventListener('touchmove', function (e) {
      if (y0 === null) return;
      var d = e.touches[0].clientY - y0;
      if (d > 0) panel.style.transform = 'translateY(' + d + 'px)';
    }, { passive: true });
    head.addEventListener('touchend', function (e) {
      if (y0 === null) return;
      var d = e.changedTouches[0].clientY - y0;
      y0 = null;
      panel.style.transform = '';
      if (d > 90) close();
    }, { passive: true });
    teaser.addEventListener('click', function (e) {
      if (e.target.classList.contains('pl-tx')) {
        e.stopPropagation();
        teaser.classList.remove('on');
        dismissed = true;
        try { sessionStorage.setItem('pl_x2', '1'); } catch (err) {}
      } else { open(); }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value;
      input.value = '';
      send(v);
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) close();
    });

    var dismissed = false;
    try { dismissed = !!sessionStorage.getItem('pl_x2'); } catch (e) {}
    if (!dismissed) {
      setTimeout(function () {
        if (!panel.classList.contains('open')) teaser.classList.add('on');
      }, CONFIG.teaserDelay);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
