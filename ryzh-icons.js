/* ============================================================
   Ryzh Fitness — иконки для ванильного кода (без React)
   ------------------------------------------------------------
   Тот же набор, что components/core/Icon.jsx, но как обычный JS:
   подключается <script src="ryzh-icons.js"></script> и работает
   в любом HTML/JS (в т.ч. в Telegram Mini App на ваниле).

   Использование:
     // 1) вставить строкой
     el.innerHTML = ryzhIcon('dumbbell', { size: 22 });
     // 2) получить узел
     btn.appendChild(ryzhIconEl('mic', { size: 20, color: 'var(--accent)' }));

   Цвет наследуется от текста (currentColor) — крась через CSS `color`.
   fill:true заливает flame / sparkles / send (для активных состояний).
   ============================================================ */
(function (global) {
  var PATHS = {
    // Навигация
    home: '<path d="M3.5 11.2 L12 4 L20.5 11.2"/><path d="M5.6 9.6 V19.5 a0.9 0.9 0 0 0 0.9 0.9 H17.5 a0.9 0.9 0 0 0 0.9-0.9 V9.6"/><path d="M9.8 20.4 v-4.4 a0.8 0.8 0 0 1 0.8-0.8 h2.8 a0.8 0.8 0 0 1 0.8 0.8 v4.4"/>',
    meal: '<path d="M4 10.8 h16 a8 8 0 0 1 -16 0 Z"/><path d="M9 5 c-1 1.4 -1 2.6 0 4"/><path d="M12 4.2 c-1 1.6 -1 3 0 4.6"/><path d="M15 5 c-1 1.4 -1 2.6 0 4"/>',
    dumbbell: '<path d="M6.6 8 V16"/><path d="M4.2 9.6 V14.4"/><path d="M17.4 8 V16"/><path d="M19.8 9.6 V14.4"/><path d="M6.6 12 H17.4"/>',
    scan: '<path d="M4 8.5 V6.4 A1.4 1.4 0 0 1 5.4 5 H7.6"/><path d="M20 8.5 V6.4 A1.4 1.4 0 0 0 18.6 5 H16.4"/><path d="M4 15.5 V17.6 A1.4 1.4 0 0 0 5.4 19 H7.6"/><path d="M20 15.5 V17.6 A1.4 1.4 0 0 1 18.6 19 H16.4"/><path d="M8.8 9 V15"/><path d="M12 9 V15"/><path d="M15.2 9 V15"/>',
    // Смысл / статус
    flame: '<path d="M12 3.4 C12 7 16 8.6 16 12.8 A4 4 0 1 1 8 12.8 C8 10.9 9 9.5 10.2 8.7 C10 10.3 10.8 11.3 12 11.5 C13 9.9 12.4 6.5 12 3.4 Z"/>',
    snowflake: '<path d="M12 3.5 V20.5"/><path d="M4.6 7.75 L19.4 16.25"/><path d="M19.4 7.75 L4.6 16.25"/><path d="M12 3.5 l-1.8 1.9 M12 3.5 l1.8 1.9 M12 20.5 l-1.8-1.9 M12 20.5 l1.8-1.9"/><path d="M4.6 7.75 l0.3 2.6 M4.6 7.75 l2.6-0.3 M19.4 16.25 l-0.3-2.6 M19.4 16.25 l-2.6 0.3"/><path d="M19.4 7.75 l-2.6-0.3 M19.4 7.75 l-0.3 2.6 M4.6 16.25 l2.6 0.3 M4.6 16.25 l0.3-2.6"/>',
    check: '<path d="M5 12.5 l4.2 4.2 L19 6.8"/>',
    lock: '<rect x="4.8" y="10.8" width="14.4" height="9.2" rx="2.4"/><path d="M8 10.8 V8.2 a4 4 0 0 1 8 0 v2.6"/><path d="M12 14.4 v2"/>',
    leaf: '<path d="M5 19 C5 10.7 11.4 5 19 5 C19 13.3 12.6 19 5 19 Z"/><path d="M7.4 16.6 C10.3 12.8 14 9.4 17 7.4"/>',
    trophy: '<path d="M7.5 5 H16.5 V10 a4.5 4.5 0 0 1 -9 0 Z"/><path d="M7.5 6.3 H5 a2 2 0 0 0 2.6 3.4"/><path d="M16.5 6.3 H19 a2 2 0 0 1 -2.6 3.4"/><path d="M12 14.5 V17 M9 20 h6 M10 20 l0.6-3 h2.8 l0.6 3"/>',
    // Управление
    settings: '<path d="M4 7 H20 M4 12 H20 M4 17 H20"/><circle cx="9" cy="7" r="2.1"/><circle cx="15" cy="12" r="2.1"/><circle cx="8" cy="17" r="2.1"/>',
    chevronLeft: '<path d="M14.5 6 L8.5 12 L14.5 18"/>',
    chevronRight: '<path d="M9.5 6 L15.5 12 L9.5 18"/>',
    plus: '<path d="M12 5 V19 M5 12 H19"/>',
    repeat: '<path d="M18.6 11.8 A6.8 6.8 0 1 0 17.2 16.6"/><path d="M18.9 5 V8.4 H15.5"/>',
    edit: '<path d="M18 13.5 V19 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 V8 a2 2 0 0 1 2 -2 h5.5"/><path d="M16.3 4.2 a1.9 1.9 0 0 1 2.7 2.7 L12 14 l-3.2 0.8 0.8-3.2 Z"/>',
    close: '<path d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5"/>',
    // AI / подписка
    sparkles: '<path d="M12 3.5 C12.6 7.6 14.4 9.4 18.5 10 C14.4 10.6 12.6 12.4 12 16.5 C11.4 12.4 9.6 10.6 5.5 10 C9.6 9.4 11.4 7.6 12 3.5 Z"/><path d="M18 15 C18.25 16.7 18.8 17.25 20.5 17.5 C18.8 17.75 18.25 18.3 18 20 C17.75 18.3 17.2 17.75 15.5 17.5 C17.2 17.25 17.75 16.7 18 15 Z"/>',
    crown: '<path d="M4 8.5 L7.5 12 L12 6 L16.5 12 L20 8.5 L18.4 18 H5.6 Z"/><path d="M5.6 18 H18.4"/>',
    mic: '<rect x="9.2" y="3.2" width="5.6" height="11" rx="2.8"/><path d="M6 11 a6 6 0 0 0 12 0"/><path d="M12 17 V20.5 M9 20.5 H15"/>',
    send: '<path d="M5 12 L20 5 L13 20 L11 13 Z"/>',
  };

  var FILLABLE = { flame: 1, sparkles: 1, send: 1 };

  function ryzhIcon(name, opts) {
    opts = opts || {};
    var size = opts.size || 24;
    var stroke = opts.stroke || 1.8;
    var fill = opts.fill && FILLABLE[name] ? 'currentColor' : 'none';
    var color = opts.color ? ' color:' + opts.color + ';' : '';
    var body = PATHS[name] || '';
    return (
      '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="' + fill +
      '" stroke="currentColor" stroke-width="' + stroke +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;flex:0 0 auto;' + color + '">' +
      body + '</svg>'
    );
  }

  function ryzhIconEl(name, opts) {
    var span = document.createElement('span');
    span.style.display = 'inline-flex';
    span.innerHTML = ryzhIcon(name, opts);
    return span.firstChild;
  }

  global.ryzhIcon = ryzhIcon;
  global.ryzhIconEl = ryzhIconEl;
  global.RYZH_ICON_NAMES = Object.keys(PATHS);
})(typeof window !== 'undefined' ? window : this);
