/* @ds-bundle: {"format":3,"namespace":"RyzhFitnessDesignSystem_eec584","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CardStatHead","sourcePath":"components/core/Card.jsx"},{"name":"CheckCircle","sourcePath":"components/core/CheckCircle.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"ChipRow","sourcePath":"components/core/Chip.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"RyzhIconNames","sourcePath":"components/core/Icon.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Select","sourcePath":"components/core/Input.jsx"},{"name":"ProgressBar","sourcePath":"components/core/ProgressBar.jsx"},{"name":"MacroRow","sourcePath":"components/core/ProgressBar.jsx"},{"name":"SegmentedControl","sourcePath":"components/core/SegmentedControl.jsx"},{"name":"StreakBadge","sourcePath":"components/core/StreakBadge.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"TabBar","sourcePath":"components/core/TabBar.jsx"}],"sourceHashes":{"components/core/Button.jsx":"0f3d8ce8c864","components/core/Card.jsx":"877aa6e48db1","components/core/CheckCircle.jsx":"62c3c2265b59","components/core/Chip.jsx":"ef116d16942f","components/core/Icon.jsx":"afa95215d3b9","components/core/Input.jsx":"5b8178f3e022","components/core/ProgressBar.jsx":"5bed69855dad","components/core/SegmentedControl.jsx":"13327c922490","components/core/StreakBadge.jsx":"49375473c12f","components/core/Switch.jsx":"5ff68d615f53","components/core/TabBar.jsx":"fb8c2584d119","explorations/design-canvas.jsx":"bd8746af6e58","ui_kits/mini_app/Dashboard.jsx":"fd735a123827","ui_kits/mini_app/FoodLog.jsx":"fc9fdf57e567","ui_kits/mini_app/Scanner.jsx":"981a95c62714","ui_kits/mini_app/Settings.jsx":"9965c39258dc","ui_kits/mini_app/Workout.jsx":"9d93c02c6b97","ui_kits/mini_app/ios-frame.jsx":"be3343be4b51"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RyzhFitnessDesignSystem_eec584 = window.RyzhFitnessDesignSystem_eec584 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  children,
  variant = 'primary',
  // 'primary' | 'secondary' | 'ghost'
  disabled = false,
  loading = false,
  fullWidth = true,
  onClick,
  type = 'button',
  style,
  ...rest
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    padding: '14px',
    fontSize: 'var(--fs-body)',
    fontFamily: 'var(--font-base)',
    fontWeight: 'var(--fw-regular)',
    border: 'none',
    borderRadius: 'var(--radius-btn)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'opacity var(--dur-fast) var(--ease-out), filter var(--dur-fast) var(--ease-out)',
    WebkitTapHighlightColor: 'transparent'
  };
  const variants = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--accent-text)'
    },
    secondary: {
      background: 'var(--surface-chip)',
      color: 'var(--text-primary)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--accent)'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled || loading,
    onClick: onClick,
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, rest), loading && /*#__PURE__*/React.createElement(Spinner, null), loading ? 'Отправляю…' : children);
}
function Spinner() {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: '14px',
      height: '14px',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'ryzh-spin 0.7s linear infinite'
    }
  });
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  children,
  as = 'div',
  padding = 16,
  style,
  ...rest
}) {
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-card)',
      padding: typeof padding === 'number' ? `${padding}px` : padding,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      ...style
    }
  }, rest), children);
}

/** Header row: a label on the left, a big stat value on the right. */
function CardStatHead({
  label,
  value,
  over = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-sub)',
      color: 'var(--text-hint)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-stat)',
      fontWeight: 'var(--fw-bold)',
      fontVariantNumeric: 'tabular-nums',
      color: over ? 'var(--danger)' : 'var(--text-primary)'
    }
  }, value));
}
Object.assign(__ds_scope, { Card, CardStatHead });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/CheckCircle.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function CheckCircle({
  checked = false,
  onChange,
  size = 30,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    role: "checkbox",
    "aria-checked": checked,
    disabled: disabled,
    onClick: e => onChange && onChange(!checked, e),
    style: {
      width: size,
      height: size,
      flex: `0 0 ${size}px`,
      margin: 0,
      padding: 0,
      borderRadius: '50%',
      border: checked ? 'none' : '2px solid var(--border-input)',
      background: checked ? 'var(--success)' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
      WebkitTapHighlightColor: 'transparent',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: size * 0.58,
    height: size * 0.58,
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      opacity: checked ? 1 : 0,
      transform: checked ? 'scale(1)' : 'scale(0.6)',
      transition: 'opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12.5 l4.2 4.2 L19 6.8"
  })));
}
Object.assign(__ds_scope, { CheckCircle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/CheckCircle.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Chip({
  children,
  active = false,
  onClick,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    disabled: disabled,
    style: {
      flex: '0 0 auto',
      width: 'auto',
      margin: 0,
      padding: '8px 14px',
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      fontSize: 'var(--fs-sub)',
      fontFamily: 'var(--font-base)',
      background: active ? 'var(--accent)' : 'var(--surface-card)',
      color: active ? 'var(--accent-text)' : 'var(--text-primary)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur-base) var(--ease-out)',
      WebkitTapHighlightColor: 'transparent',
      ...style
    }
  }, rest), children);
}

/** Wrapping flex row of chips. */
function ChipRow({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Chip, ChipRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// ============================================================
// Ryzh Fitness — Icon
// Линейный набор иконок «в тему» Cream: 24×24, штрих currentColor,
// скруглённые концы. Заменяет эмодзи во всём интерфейсе.
// ============================================================

const RYZH_ICON_PATHS = {
  // — Навигация —
  home: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 11.2 L12 4 L20.5 11.2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5.6 9.6 V19.5 a0.9 0.9 0 0 0 0.9 0.9 H17.5 a0.9 0.9 0 0 0 0.9-0.9 V9.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9.8 20.4 v-4.4 a0.8 0.8 0 0 1 0.8-0.8 h2.8 a0.8 0.8 0 0 1 0.8 0.8 v4.4"
  })),
  meal: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 10.8 h16 a8 8 0 0 1 -16 0 Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 5 c-1 1.4 -1 2.6 0 4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 4.2 c-1 1.6 -1 3 0 4.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 5 c-1 1.4 -1 2.6 0 4"
  })),
  dumbbell: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M6.6 8 V16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.2 9.6 V14.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M17.4 8 V16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.8 9.6 V14.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.6 12 H17.4"
  })),
  scan: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 8.5 V6.4 A1.4 1.4 0 0 1 5.4 5 H7.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 8.5 V6.4 A1.4 1.4 0 0 0 18.6 5 H16.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 15.5 V17.6 A1.4 1.4 0 0 0 5.4 19 H7.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20 15.5 V17.6 A1.4 1.4 0 0 1 18.6 19 H16.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.8 9 V15"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9 V15"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15.2 9 V15"
  })),
  // — Смысл / статус —
  flame: /*#__PURE__*/React.createElement("path", {
    d: "M12 3.4 C12 7 16 8.6 16 12.8 A4 4 0 1 1 8 12.8 C8 10.9 9 9.5 10.2 8.7 C10 10.3 10.8 11.3 12 11.5 C13 9.9 12.4 6.5 12 3.4 Z"
  }),
  snowflake: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 3.5 V20.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.6 7.75 L19.4 16.25"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 7.75 L4.6 16.25"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3.5 l-1.8 1.9 M12 3.5 l1.8 1.9 M12 20.5 l-1.8-1.9 M12 20.5 l1.8-1.9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.6 7.75 l0.3 2.6 M4.6 7.75 l2.6-0.3 M19.4 16.25 l-0.3-2.6 M19.4 16.25 l-2.6 0.3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 7.75 l-2.6-0.3 M19.4 7.75 l-0.3 2.6 M4.6 16.25 l2.6 0.3 M4.6 16.25 l0.3-2.6"
  })),
  check: /*#__PURE__*/React.createElement("path", {
    d: "M5 12.5 l4.2 4.2 L19 6.8"
  }),
  lock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "10.8",
    width: "14.4",
    height: "9.2",
    rx: "2.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 10.8 V8.2 a4 4 0 0 1 8 0 v2.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 14.4 v2"
  })),
  leaf: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 19 C5 10.7 11.4 5 19 5 C19 13.3 12.6 19 5 19 Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.4 16.6 C10.3 12.8 14 9.4 17 7.4"
  })),
  trophy: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M7.5 5 H16.5 V10 a4.5 4.5 0 0 1 -9 0 Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.5 6.3 H5 a2 2 0 0 0 2.6 3.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16.5 6.3 H19 a2 2 0 0 1 -2.6 3.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 14.5 V17 M9 20 h6 M10 20 l0.6-3 h2.8 l0.6 3"
  })),
  // — Управление —
  settings: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 7 H20 M4 12 H20 M4 17 H20"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7",
    r: "2.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "12",
    r: "2.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "17",
    r: "2.1"
  })),
  chevronLeft: /*#__PURE__*/React.createElement("path", {
    d: "M14.5 6 L8.5 12 L14.5 18"
  }),
  chevronRight: /*#__PURE__*/React.createElement("path", {
    d: "M9.5 6 L15.5 12 L9.5 18"
  }),
  plus: /*#__PURE__*/React.createElement("path", {
    d: "M12 5 V19 M5 12 H19"
  }),
  repeat: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M18.6 11.8 A6.8 6.8 0 1 0 17.2 16.6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.9 5 V8.4 H15.5"
  })),
  edit: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M14.4 5.4 l4.2 4.2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 19 l0.9-3.7 L15.4 5 l3.6 3.6 L9.7 18.1 Z"
  })),
  close: /*#__PURE__*/React.createElement("path", {
    d: "M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5"
  })
};
function Icon({
  name,
  size = 24,
  stroke = 1.8,
  fill = false,
  color,
  style,
  title,
  ...rest
}) {
  const body = RYZH_ICON_PATHS[name];
  // Иконки, которые хорошо смотрятся заливкой (огонёк, снежинка).
  const fillable = name === 'flame';
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: fill && fillable ? 'currentColor' : 'none',
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    role: title ? 'img' : 'presentation',
    "aria-hidden": title ? undefined : true,
    "aria-label": title,
    style: {
      display: 'block',
      color: color || 'currentColor',
      flex: '0 0 auto',
      ...style
    }
  }, rest), title ? /*#__PURE__*/React.createElement("title", null, title) : null, body || null);
}

/** Список доступных имён — удобно для витрины/перебора. */
const RyzhIconNames = Object.keys(RYZH_ICON_PATHS);
Object.assign(__ds_scope, { Icon, RyzhIconNames });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fieldStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border-input)',
  borderRadius: 'var(--radius-input)',
  fontSize: 'var(--fs-body)',
  fontFamily: 'var(--font-base)',
  background: 'var(--surface-page)',
  color: 'var(--text-primary)'
};
function Input({
  label,
  style,
  ...rest
}) {
  const el = /*#__PURE__*/React.createElement("input", _extends({
    style: {
      ...fieldStyle,
      ...style
    }
  }, rest));
  if (!label) return el;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--fs-tiny)',
      color: 'var(--text-hint)',
      marginBottom: '4px'
    }
  }, label), el);
}
function Select({
  label,
  options = [],
  style,
  children,
  ...rest
}) {
  const el = /*#__PURE__*/React.createElement("select", _extends({
    style: {
      ...fieldStyle,
      marginTop: label ? '4px' : 0,
      ...style
    }
  }, rest), children || options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  }));
  if (!label) return el;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--fs-tiny)',
      color: 'var(--text-hint)'
    }
  }, label), el);
}
Object.assign(__ds_scope, { Input, Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',
  // 'md' (10px) | 'sm' (7px)
  over,
  // override; defaults to value > max
  color,
  // custom fill color
  style,
  ...rest
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round(value / max * 100))) : 0;
  const isOver = over != null ? over : value > max;
  const height = size === 'sm' ? 'var(--bar-h-sm)' : 'var(--bar-h)';
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemax": max,
    style: {
      height,
      borderRadius: '6px',
      background: 'var(--surface-track)',
      overflow: 'hidden',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${pct}%`,
      borderRadius: '6px',
      background: color || (isOver ? 'var(--danger)' : 'var(--accent)'),
      transition: 'width var(--dur-bar) var(--ease-out)'
    }
  }));
}

/** A macro row: name · bar · value, on a 70px / 1fr / auto grid. */
function MacroRow({
  name,
  value,
  target,
  unit = 'г'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '70px 1fr auto',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-small)',
      color: 'var(--text-hint)'
    }
  }, name), /*#__PURE__*/React.createElement(ProgressBar, {
    value: value,
    max: target,
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-small)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, target ? `${value} / ${target}${unit}` : `${value}${unit}`));
}
Object.assign(__ds_scope, { ProgressBar, MacroRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/core/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SegmentedControl({
  options = [],
  // [{ value, label }] or ['a','b']
  value,
  onChange,
  style,
  ...rest
}) {
  const opts = options.map(o => typeof o === 'string' ? {
    value: o,
    label: o
  } : o);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      gap: '4px',
      background: 'var(--surface-card)',
      borderRadius: '12px',
      padding: '4px',
      ...style
    }
  }, rest), opts.map(o => {
    const active = o.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      type: "button",
      onClick: () => onChange && onChange(o.value),
      style: {
        flex: 1,
        width: 'auto',
        margin: 0,
        padding: '8px',
        border: 'none',
        borderRadius: '9px',
        fontSize: 'var(--fs-sub)',
        fontFamily: 'var(--font-base)',
        fontWeight: active ? 'var(--fw-semibold)' : 'var(--fw-regular)',
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? 'var(--accent-text)' : 'var(--text-hint)',
        cursor: 'pointer',
        transition: 'background var(--dur-base) var(--ease-out)',
        WebkitTapHighlightColor: 'transparent'
      }
    }, o.label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/core/StreakBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// StreakBadge — «серия»: сколько дней подряд. Иконки нарисованы инлайн
// (тот же набор, что Icon), чтобы не зависеть от кросс-модульного импорта.

function StreakFlame({
  filled,
  size = 16
}) {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: filled ? 'currentColor' : 'none',
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 3.4 C12 7 16 8.6 16 12.8 A4 4 0 1 1 8 12.8 C8 10.9 9 9.5 10.2 8.7 C10 10.3 10.8 11.3 12 11.5 C13 9.9 12.4 6.5 12 3.4 Z"
  }));
}
function StreakSnow({
  size = 16
}) {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 3.5 V20.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.6 7.75 L19.4 16.25"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 7.75 L4.6 16.25"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3.5 l-1.8 1.9 M12 3.5 l1.8 1.9 M12 20.5 l-1.8-1.9 M12 20.5 l1.8-1.9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.6 7.75 l0.3 2.6 M4.6 7.75 l2.6-0.3 M19.4 16.25 l-0.3-2.6 M19.4 16.25 l-2.6 0.3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M19.4 7.75 l-2.6-0.3 M19.4 7.75 l-0.3 2.6 M4.6 16.25 l2.6 0.3 M4.6 16.25 l0.3-2.6"
  }));
}
function pluralDays(n) {
  const a = Math.abs(n) % 100,
    b = a % 10;
  if (a > 10 && a < 20) return 'дней';
  if (b > 1 && b < 5) return 'дня';
  if (b === 1) return 'день';
  return 'дней';
}
function StreakBadge({
  count = 0,
  label,
  // что за серия: «Питание», «Тренировки»
  icon,
  // иконка категории (напр. <Icon name="meal" />)
  status = 'active',
  // 'active' | 'cold' | 'frozen'
  style,
  ...rest
}) {
  const frozen = status === 'frozen';
  const cold = status === 'cold' || count === 0 && status !== 'frozen';
  const statusColor = frozen ? '#3E8CD6' : cold ? 'var(--text-hint)' : 'var(--streak)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      borderRadius: 'var(--radius)',
      background: 'var(--surface-card)',
      boxShadow: frozen ? 'inset 0 0 0 1.5px rgba(62,140,214,0.45), var(--shadow-card)' : 'var(--shadow-card)',
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 34,
      height: 34,
      flex: '0 0 34px',
      borderRadius: '50%',
      background: cold ? 'var(--surface-chip)' : 'var(--accent-wash)',
      color: cold ? 'var(--text-hint)' : 'var(--accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 19,
      fontWeight: 'var(--fw-heavy)',
      fontVariantNumeric: 'tabular-nums',
      color: cold ? 'var(--text-hint)' : 'var(--text-primary)',
      lineHeight: 1
    }
  }, count), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-tiny)',
      color: 'var(--text-hint)'
    }
  }, pluralDays(count)), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      color: statusColor,
      display: 'flex'
    }
  }, frozen ? /*#__PURE__*/React.createElement(StreakSnow, {
    size: 15
  }) : /*#__PURE__*/React.createElement(StreakFlame, {
    filled: !cold,
    size: 15
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-tiny)',
      color: 'var(--text-hint)',
      marginTop: 2,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, frozen ? 'серия под угрозой' : cold ? 'серия прервана' : `серия · ${label || ''}`)));
}
Object.assign(__ds_scope, { StreakBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StreakBadge.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  checked = false,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-block',
      width: 'var(--switch-w)',
      height: 'var(--switch-h)',
      flex: '0 0 auto',
      opacity: disabled ? 0.6 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.checked, e),
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      margin: 0,
      padding: 0,
      border: 'none',
      width: '100%',
      height: '100%',
      borderRadius: 'var(--radius-pill)',
      background: checked ? 'var(--success)' : 'var(--warm-400)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background var(--dur-base) var(--ease-out)'
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      top: '2px',
      left: '2px',
      width: 'var(--switch-knob)',
      height: 'var(--switch-knob)',
      borderRadius: '50%',
      background: '#fff',
      boxShadow: 'var(--shadow-knob)',
      transform: checked ? 'translateX(20px)' : 'translateX(0)',
      transition: 'transform var(--dur-base) var(--ease-out)',
      pointerEvents: 'none'
    }
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/core/TabBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TabBar({
  tabs = [],
  // [{ id, icon, label }]
  active,
  onChange,
  fixed = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      position: fixed ? 'fixed' : 'relative',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 60,
      display: 'flex',
      height: 'var(--tabbar-h)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      background: 'var(--surface-page)',
      borderTop: '1px solid var(--border-hairline)',
      ...style
    }
  }, rest), tabs.map(t => {
    const on = t.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      type: "button",
      onClick: () => onChange && onChange(t.id),
      style: {
        flex: 1,
        width: 'auto',
        margin: 0,
        padding: '6px 0',
        border: 'none',
        borderRadius: 0,
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        fontSize: 'var(--fs-tab)',
        fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-regular)',
        color: on ? 'var(--accent)' : 'var(--text-hint)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        lineHeight: 1,
        color: on ? 'var(--accent)' : 'var(--text-hint)'
      }
    }, t.icon), t.label);
  }));
}
Object.assign(__ds_scope, { TabBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/TabBar.jsx", error: String((e && e.message) || e) }); }

// explorations/design-canvas.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Exports (to window): DesignCanvas, DCSection, DCArtboard, DCPostIt.
// Artboards are reorderable (grip-drag), deletable, labels/titles are
// inline-editable, and any artboard can be opened in a fullscreen focus
// overlay (←/→/Esc). State persists to a .design-canvas.state.json sidecar
// via the host bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>
//
// Artboards are static design frames, not scroll regions — never use
// height: 100% + overflow: auto/scroll on inner elements; size each artboard
// to fit its content (explicit pixel height, or let it grow).
/* END USAGE */

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}',
  // isolation:isolate contains artboard content's z-indexes so a
  // z-indexed child (sticky navbar etc.) can't paint over .dc-header or
  // the .dc-menu popover that drops into the top of the card.
  '.dc-card{isolation:isolate;transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}',
  // Per-artboard header: grip + label on the left, delete/expand on the
  // right. Single flex row; when the artboard's on-screen width is too
  // narrow for both the label yields (ellipsis, then hidden entirely below
  // ~4ch via the container query) and the buttons stay on the row.
  '.dc-header{position:absolute;bottom:100%;left:-4px;margin-bottom:calc(4px * var(--dc-inv-zoom,1));z-index:2;', '  display:flex;align-items:center;container-type:inline-size}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px;flex:1 1 auto;min-width:0}', '.dc-grip{flex:0 0 auto;cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s,opacity .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{flex:1 1 auto;min-width:0;cursor:pointer;border-radius:4px;padding:3px 6px;', '  display:flex;align-items:center;transition:background .12s;overflow:hidden}',
  // Below ~4ch of label room: hide the label entirely, and drop the grip to
  // hover-only (same reveal rule as .dc-btns) so a narrow header is clean
  // until the card is moused.
  '@container (max-width: 110px){', '  .dc-labeltext{display:none}', '  .dc-grip{opacity:0}', '  [data-dc-slot]:hover .dc-grip{opacity:1}', '}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-labeltext .dc-editable{overflow:hidden;text-overflow:ellipsis;max-width:100%}', '.dc-labeltext .dc-editable:focus{overflow:visible;text-overflow:clip}', '.dc-btns{flex:0 0 auto;margin-left:auto;display:flex;gap:2px;opacity:0;transition:opacity .12s}', '[data-dc-slot]:hover .dc-btns,.dc-btns:has(.dc-menu){opacity:1}', '.dc-expand,.dc-kebab{width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center;', '  font:inherit;transition:background .12s,color .12s}', '.dc-expand:hover,.dc-kebab:hover{background:rgba(0,0,0,.06);color:#2a251f}',
  // Slot hosting an open menu floats above later siblings (which otherwise
  // paint on top — same z-index:auto, later DOM order) so the popup isn't
  // clipped by the next card.
  '[data-dc-slot]:has(.dc-menu){z-index:10}', '.dc-menu{position:absolute;top:100%;right:0;margin-top:4px;background:#fff;border-radius:8px;', '  box-shadow:0 8px 28px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.05);padding:4px;min-width:160px;z-index:10}', '.dc-menu button{display:block;width:100%;padding:7px 10px;border:0;background:transparent;', '  border-radius:5px;font-family:inherit;font-size:13px;font-weight:500;line-height:1.2;', '  color:#29261b;cursor:pointer;text-align:left;transition:background .12s;white-space:nowrap}', '.dc-menu button:hover{background:rgba(0,0,0,.05)}', '.dc-menu hr{border:0;border-top:1px solid rgba(0,0,0,.08);margin:4px 2px}', '.dc-menu .dc-danger{color:#c96442}', '.dc-menu .dc-danger:hover{background:rgba(201,100,66,.1)}',
  // Chrome (titles / labels / buttons) counter-scales against the viewport
  // zoom so it stays a constant on-screen size. --dc-inv-zoom is set by
  // DCViewport on every transform update and inherits to all descendants —
  // any overlay inside the world (e.g. a TweaksPanel on an artboard) can use
  // it the same way.
  //
  // The header uses transform:scale (out-of-flow, so layout impact doesn't
  // matter) with its world-space width set to card-width / inv-zoom so that
  // after counter-scaling its on-screen width exactly matches the card's —
  // that's what lets the container query + text-overflow behave against the
  // card's visible edge at every zoom level.
  //
  // The section head uses CSS zoom instead of transform so its layout box
  // grows with the counter-scale, pushing the card row down — otherwise the
  // constant-screen-size title would overflow into the (shrinking) world-
  // space gap and overlap the artboard headers at low zoom.
  '.dc-header{width:calc((100% + 4px) / var(--dc-inv-zoom,1));', '  transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom left}', '.dc-sectionhead{zoom:var(--dc-inv-zoom,1)}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// Recursively unwrap React.Fragment so <>…</> grouping doesn't hide
// DCSection/DCArtboard children from the type-based walks below.
function dcFlatten(children) {
  const out = [];
  React.Children.forEach(children, c => {
    if (c && c.type === React.Fragment) out.push(...dcFlatten(c.props.children));else out.push(c);
  });
  return out;
}

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, hidden
// artboards, focused artboard). Order/titles/labels/hidden persist to a
// .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Fragments are flattened; wrapping in other
  // elements still opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  dcFlatten(children).forEach(sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const abs = [];
    dcFlatten(sec.props.children).forEach(ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (aid) abs.push([aid, ab]);
    });
    // hidden is scoped to one source revision — when the agent regenerates
    // (artboard-ID set changes), prior deletes don't apply to new content.
    const srcKey = abs.map(([k]) => k).join('\x1f');
    const hidden = persisted.srcKey === srcKey ? persisted.hidden || [] : [];
    const srcIds = [];
    abs.forEach(([aid, ab]) => {
      if (hidden.includes(aid)) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  // Persist viewport across reloads so the user lands back where they were
  // after an agent edit or browser refresh. The sandbox origin is already
  // per-project; pathname keeps multiple canvas files in one project apart.
  const tfKey = 'dc-viewport:' + location.pathname;
  const saveT = React.useRef(0);
  const lastPostedScale = React.useRef();
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (!el) return;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    // Exposed for zoom-invariant chrome (labels, buttons, TweaksPanel).
    el.style.setProperty('--dc-inv-zoom', String(1 / scale));
    // Keep the host toolbar's % readout in sync with the canvas scale. Pan
    // ticks leave scale unchanged — skip the cross-frame post for those.
    if (lastPostedScale.current !== scale) {
      lastPostedScale.current = scale;
      window.parent.postMessage({
        type: '__dc_zoom',
        scale
      }, '*');
    }
    clearTimeout(saveT.current);
    saveT.current = setTimeout(() => {
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    }, 200);
  }, [tfKey]);
  React.useLayoutEffect(() => {
    const flush = () => {
      clearTimeout(saveT.current);
      try {
        localStorage.setItem(tfKey, JSON.stringify(tf.current));
      } catch {}
    };
    try {
      const s = JSON.parse(localStorage.getItem(tfKey) || 'null');
      if (s && Number.isFinite(s.x) && Number.isFinite(s.y) && Number.isFinite(s.scale)) {
        tf.current = {
          x: s.x,
          y: s.y,
          scale: Math.min(maxScale, Math.max(minScale, s.scale))
        };
        apply();
      }
    } catch {}
    // Flush on pagehide and unmount so a reload within the 200ms debounce
    // window doesn't drop the last pan/zoom.
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // --dc-inv-zoom consumers (.dc-sectionhead's CSS zoom, each section's
      // marginBottom) reflow on every scale change, vertically shifting the
      // world layout — so a world point mathematically pinned under the cursor
      // drifts as you zoom (content creeps up on zoom-in, down on zoom-out).
      // Anchor the DOM element under the cursor instead: record its screen Y,
      // apply the transform + --dc-inv-zoom, then cancel whatever vertical
      // drift the reflow introduced so it stays put on screen.
      let marker = null,
        markerY0 = 0;
      if (k !== 1) {
        const hit = document.elementFromPoint(cx, cy);
        marker = hit && hit.closest ? hit.closest('[data-dc-slot],[data-dc-section]') : null;
        if (marker) markerY0 = marker.getBoundingClientRect().top;
      }
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
      if (marker) {
        // A pure zoom around (cx, cy) maps screen Y → cy + (Y - cy) * k. Any
        // departure after the --dc-inv-zoom reflow is the layout drift.
        const drift = marker.getBoundingClientRect().top - (cy + (markerY0 - cy) * k);
        if (Math.abs(drift) > 0.1) {
          t.y -= drift;
          apply();
        }
      }
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if ((e.ctrlKey || e.metaKey) && !isMouseWheel(e)) {
        // trackpad pinch, or ctrl/cmd + smooth-scroll mouse. Notched
        // wheels fall through to the fixed-step branch below.
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };

    // Host-driven zoom (toolbar % menu). Zooms around viewport centre so the
    // visible midpoint stays fixed — matching the host's iframe-zoom feel.
    const onHostMsg = e => {
      const d = e.data;
      if (d && d.type === '__dc_set_zoom' && typeof d.scale === 'number') {
        const r = vp.getBoundingClientRect();
        zoomAt(r.left + r.width / 2, r.top + r.height / 2, d.scale / tf.current.scale);
      } else if (d && d.type === '__dc_probe') {
        // Host's [readyGen] reset asks whether a canvas is present; it
        // fires on the iframe's native 'load', which for canvases with
        // images/fonts is after our mount-time announce, so re-announce.
        // Clear the pan-tick guard so apply() re-posts the current scale
        // even if it's unchanged — the host just reset dcScale to 1.
        window.parent.postMessage({
          type: '__dc_present'
        }, '*');
        lastPostedScale.current = undefined;
        apply();
      }
    };
    window.addEventListener('message', onHostMsg);
    // Announce canvas mode so the host toolbar proxies its % control here
    // instead of scaling the iframe element (which would just shrink the
    // viewport window of an infinite canvas). The apply() that follows emits
    // the initial __dc_zoom so the toolbar % is correct before first pinch.
    // lastPostedScale reset mirrors the __dc_probe handler: the layout
    // effect's restore-path apply() may already have posted the restored
    // scale (before __dc_present), so clear the guard to re-post it in order.
    window.parent.postMessage({
      type: '__dc_present'
    }, '*');
    lastPostedScale.current = undefined;
    apply();
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('message', onHostMsg);
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(dcFlatten(children));
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const sec = ctx && sid && ctx.section(sid) || {};
  // Must match DesignCanvas's srcKey computation exactly (it filters falsy
  // IDs), or onDelete persists a srcKey that DesignCanvas never recognizes.
  const allIds = artboards.map(a => a.props.id ?? a.props.label).filter(Boolean);
  const srcKey = allIds.join('\x1f');
  const hidden = sec.srcKey === srcKey ? sec.hidden || [] : [];
  const srcOrder = allIds.filter(k => !hidden.includes(k));
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));

  // marginBottom counter-scales so the on-screen gap between sections stays
  // constant — otherwise at low zoom the (world-space) gap collapses while
  // the screen-constant sectionhead below it doesn't, and the title reads as
  // belonging to the section above. paddingBottom below is just enough for
  // the 24px artboard-header (abs-positioned above each card) plus ~8px, so
  // the title sits tight against its own row at every zoom.
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 'calc(80px * var(--dc-inv-zoom, 1))',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-sectionhead",
    style: {
      paddingBottom: 36
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onDelete: () => ctx && ctx.patchSection(sid, x => ({
      hidden: [...(x.srcKey === srcKey ? x.hidden || [] : []), k],
      srcKey
    })),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}

// Per-artboard export (kind: 'png' | 'html'). Both paths share the same
// self-contained clone: computed styles baked in, @font-face / <img> /
// inline-style background-image urls inlined as data URIs. PNG wraps the
// clone in foreignObject→canvas at 3× the artboard's natural width×height
// (same pipeline the host uses for page captures); HTML wraps it in a
// minimal standalone document. Both are independent of viewport zoom.
async function dcExport(node, w, h, name, kind) {
  try {
    await document.fonts.ready;
  } catch {}
  const toDataURL = url => fetch(url).then(r => r.blob()).then(b => new Promise(res => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = () => res(url);
    fr.readAsDataURL(b);
  })).catch(() => url);

  // Collect @font-face rules. ss.cssRules throws SecurityError on
  // cross-origin sheets (e.g. fonts.googleapis.com) — in that case fetch
  // the CSS text directly (those endpoints send ACAO:*) and regex-extract
  // the blocks. @import and @media/@supports are walked so nested
  // @font-face rules aren't missed.
  const fontRules = [],
    pending = [],
    seen = new Set();
  const scrapeCss = href => {
    if (seen.has(href)) return;
    seen.add(href);
    pending.push(fetch(href).then(r => r.text()).then(css => {
      for (const m of css.match(/@font-face\s*{[^}]*}/g) || []) fontRules.push({
        css: m,
        base: href
      });
      for (const m of css.matchAll(/@import\s+(?:url\()?['"]?([^'")\s;]+)/g)) scrapeCss(new URL(m[1], href).href);
    }).catch(() => {}));
  };
  const walk = (rules, base) => {
    for (const r of rules) {
      if (r.type === CSSRule.FONT_FACE_RULE) fontRules.push({
        css: r.cssText,
        base
      });else if (r.type === CSSRule.IMPORT_RULE && r.styleSheet) {
        const ibase = r.styleSheet.href || base;
        try {
          walk(r.styleSheet.cssRules, ibase);
        } catch {
          scrapeCss(ibase);
        }
      } else if (r.cssRules) walk(r.cssRules, base);
    }
  };
  for (const ss of document.styleSheets) {
    const base = ss.href || location.href;
    try {
      walk(ss.cssRules, base);
    } catch {
      if (ss.href) scrapeCss(ss.href);
    }
  }
  while (pending.length) await pending.shift();
  const fontCss = (await Promise.all(fontRules.map(async rule => {
    let out = rule.css,
      m;
    const re = /url\((['"]?)([^'")]+)\1\)/g;
    while (m = re.exec(rule.css)) {
      if (m[2].indexOf('data:') === 0) continue;
      let abs;
      try {
        abs = new URL(m[2], rule.base).href;
      } catch {
        continue;
      }
      out = out.split(m[0]).join('url("' + (await toDataURL(abs)) + '")');
    }
    return out;
  }))).join('\n');
  const cloneStyled = src => {
    if (src.nodeType === 8 || src.nodeType === 1 && src.tagName === 'SCRIPT') return document.createTextNode('');
    const dst = src.cloneNode(false);
    if (src.nodeType === 1) {
      const cs = getComputedStyle(src);
      let txt = '';
      for (let i = 0; i < cs.length; i++) txt += cs[i] + ':' + cs.getPropertyValue(cs[i]) + ';';
      dst.setAttribute('style', txt + 'animation:none;transition:none;');
      if (src.tagName === 'CANVAS') try {
        const im = document.createElement('img');
        im.src = src.toDataURL();
        im.setAttribute('style', txt);
        return im;
      } catch {}
    }
    for (let c = src.firstChild; c; c = c.nextSibling) dst.appendChild(cloneStyled(c));
    return dst;
  };
  const clone = cloneStyled(node);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  // Drop the card's own shadow/radius so the export is a flush w×h rect;
  // the artboard's own background (if any) is already in the computed style.
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  const jobs = [];
  clone.querySelectorAll('img').forEach(el => {
    const s = el.getAttribute('src');
    if (s && s.indexOf('data:') !== 0) jobs.push(toDataURL(el.src).then(d => el.setAttribute('src', d)));
  });
  [clone, ...clone.querySelectorAll('*')].forEach(el => {
    const bg = el.style.backgroundImage;
    if (!bg) return;
    let m;
    const re = /url\(["']?([^"')]+)["']?\)/g;
    while (m = re.exec(bg)) {
      const tok = m[0],
        url = m[1];
      if (url.indexOf('data:') === 0) continue;
      jobs.push(toDataURL(url).then(d => {
        el.style.backgroundImage = el.style.backgroundImage.split(tok).join('url("' + d + '")');
      }));
    }
  });
  await Promise.all(jobs);
  const xml = new XMLSerializer().serializeToString(clone);
  const save = (blob, ext) => {
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name + '.' + ext;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  if (kind === 'html') {
    const html = '<!doctype html><html><head><meta charset="utf-8"><title>' + name + '</title>' + (fontCss ? '<style>' + fontCss + '</style>' : '') + '</head><body style="margin:0">' + xml + '</body></html>';
    return save(new Blob([html], {
      type: 'text/html'
    }), 'html');
  }

  // PNG: the SVG's own width/height must be the output resolution — an
  // <img>-loaded SVG rasterizes at its intrinsic size, so sizing it at 1×
  // and ctx.scale()-ing up would just upscale a 1× bitmap. viewBox maps the
  // w×h foreignObject onto the px·w × px·h SVG canvas so the browser renders
  // the HTML at full resolution.
  const px = 3;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w * px + '" height="' + h * px + '" viewBox="0 0 ' + w + ' ' + h + '"><foreignObject width="' + w + '" height="' + h + '">' + (fontCss ? '<style><![CDATA[' + fontCss + ']]></style>' : '') + xml + '</foreignObject></svg>';
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = () => rej(new Error('svg load failed'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  const cv = document.createElement('canvas');
  cv.width = w * px;
  cv.height = h * px;
  cv.getContext('2d').drawImage(img, 0, 0);
  cv.toBlob(blob => save(blob, 'png'), 'image/png');
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus,
  onDelete
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);
  const cardRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  // ⋯ menu: close on any outside pointerdown. Two-click delete lives inside
  // the menu — first click arms the row, second commits; closing disarms.
  React.useEffect(() => {
    if (!menuOpen) {
      setConfirming(false);
      return;
    }
    const off = e => {
      if (!menuRef.current || !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', off, true);
    return () => document.removeEventListener('pointerdown', off, true);
  }, [menuOpen]);
  const doExport = kind => {
    setMenuOpen(false);
    if (!cardRef.current) return;
    const name = String(label || id || 'artboard').replace(/[^\w\s.-]+/g, '_');
    dcExport(cardRef.current, width, height, name, kind).catch(e => console.error('[design-canvas] export failed:', e));
  };

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-header",
    "data-omelette-chrome": "",
    style: {
      color: DC.label
    },
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-btns"
  }, /*#__PURE__*/React.createElement("div", {
    ref: menuRef,
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "dc-kebab",
    title: "More",
    onClick: () => setMenuOpen(o => !o)
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2.5",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "6",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9.5",
    cy: "6",
    r: "1.1"
  }))), menuOpen && /*#__PURE__*/React.createElement("div", {
    className: "dc-menu",
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('png')
  }, "Download PNG"), /*#__PURE__*/React.createElement("button", {
    onClick: () => doExport('html')
  }, "Download HTML"), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("button", {
    className: "dc-danger",
    onClick: () => {
      if (confirming) {
        setMenuOpen(false);
        onDelete();
      } else setConfirming(true);
    }
  }, confirming ? 'Click again to delete' : 'Delete'))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))))), /*#__PURE__*/React.createElement("div", {
    ref: cardRef,
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    // Sections whose artboards are all deleted have slotIds:[] — step past
    // them to the next non-empty section so ↑/↓ doesn't dead-end.
    const n = sectionOrder.length;
    for (let i = 1; i < n; i++) {
      const ns = sectionOrder[((secIdx + d * i) % n + n) % n];
      const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
      if (first) {
        ctx.setFocus(`${ns}/${first}`);
        return;
      }
    }
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.filter(sid => sectionMeta[sid].slotIds.length).map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "explorations/design-canvas.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mini_app/Dashboard.jsx
try { (() => {
// Dashboard (Главная) — заголовок, маскот + голос Рыжа, стрики,
// тренировка (со стрелкой), калории кольцом, макросы.
const DS = window.RyzhFitnessDesignSystem_eec584;
const {
  Icon
} = DS;
function PageHead({
  title,
  sub,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 26,
      fontWeight: 'var(--fw-bold)',
      letterSpacing: '-0.01em',
      lineHeight: 1.1
    }
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-sub)',
      color: 'var(--text-hint)',
      marginTop: 3
    }
  }, sub)), action);
}
function IconButton({
  children,
  onClick,
  label
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    "aria-label": label,
    style: {
      width: 'var(--icon-btn)',
      height: 'var(--icon-btn)',
      flex: '0 0 var(--icon-btn)',
      margin: 0,
      padding: 0,
      border: 'none',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-chip)',
      color: 'var(--text-secondary)',
      cursor: 'pointer'
    }
  }, children);
}

// ── Динамичный маскот: тело по тирам × событие ──
// muscle 0–3 (тренировки) × belly 0–3 (питание/вес); status — событие дня.
const FOX_SCENES = {
  normal: {
    m: 3,
    b: 0,
    status: 'normal',
    label: 'Норма',
    voice: 'Пять дней подряд — мышцы прут. Не дай мне отрастить пузо: ещё 1444 ккал в запасе.'
  },
  risk: {
    m: 2,
    b: 1,
    status: 'risk',
    label: 'Стрик под угрозой',
    voice: 'Эй! Стрик питания под угрозой — залогируй ужин, пока я не замёрз.'
  },
  win: {
    m: 3,
    b: 0,
    status: 'win',
    label: 'Цель закрыта',
    voice: 'Цель дня закрыта, и я в отличной форме. Так держать!'
  },
  lost: {
    m: 1,
    b: 2,
    status: 'lost',
    label: 'Срыв',
    voice: 'Эх… стрик сорвался, и я подрасплылся. Ничего — начнём заново, ты сможешь.'
  }
};
const STATUS_RING = {
  normal: 'var(--accent)',
  risk: '#3E8CD6',
  win: 'var(--success)',
  lost: 'var(--warm-400)'
};
function Medallion({
  m = 3,
  b = 0,
  status = 'normal',
  size = 132
}) {
  const src = `../../assets/mascot/fox_m${m}_b${b}.png`;
  const ring = STATUS_RING[status] || 'var(--accent)';
  const filter = status === 'lost' ? 'grayscale(0.45) saturate(0.7)' : status === 'risk' ? 'saturate(0.85)' : 'none';
  const badge = status === 'risk' ? {
    icon: 'snowflake',
    bg: '#3E8CD6'
  } : status === 'win' ? {
    icon: 'trophy',
    bg: 'var(--success)'
  } : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 50% 34%, var(--medallion-1) 0%, var(--medallion-2) 72%)',
      boxShadow: `0 0 0 3px ${ring}, var(--shadow-raised)`,
      transition: 'box-shadow var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "\u0420\u044B\u0436",
    style: {
      width: '128%',
      height: '128%',
      objectFit: 'cover',
      objectPosition: '50% 16%',
      marginLeft: '-14%',
      marginTop: '-6%',
      filter,
      transition: 'filter var(--dur-base) var(--ease-out)'
    }
  })), badge && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: -2,
      top: 2,
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: badge.bg,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(80,50,20,0.25)',
      border: '2.5px solid var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: badge.icon,
    size: 19,
    fill: badge.icon === 'snowflake'
  })));
}

// Голос Рыжа — одна живая строка, завязанная на состояние.
function RyzhSays({
  text
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 280,
      textAlign: 'center',
      background: 'var(--surface-card)',
      boxShadow: 'var(--shadow-card)',
      borderRadius: 14,
      padding: '10px 14px',
      fontSize: 'var(--fs-small)',
      lineHeight: 1.4,
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -6,
      left: '50%',
      width: 12,
      height: 12,
      marginLeft: -6,
      background: 'var(--surface-card)',
      transform: 'rotate(45deg)',
      boxShadow: '-2px -2px 4px rgba(120,90,40,0.04)'
    }
  }), /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--accent)'
    }
  }, "\u0420\u044B\u0436:"), " ", text));
}

// Кольцо калорий.
function CalorieRing({
  eaten,
  goal,
  size = 132,
  stroke = 13
}) {
  const left = Math.max(0, goal - eaten);
  const over = eaten > goal;
  const pct = Math.max(0, Math.min(1, eaten / goal));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size,
      flex: `0 0 ${size}px`
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--surface-track)",
    strokeWidth: stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: over ? 'var(--danger)' : 'var(--accent)',
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeDasharray: `${dash} ${c}`,
    style: {
      transition: 'stroke-dasharray var(--dur-bar) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 'var(--fw-heavy)',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1,
      color: over ? 'var(--danger)' : 'var(--text-primary)'
    }
  }, over ? eaten - goal : left), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--text-hint)',
      marginTop: 3
    }
  }, over ? 'перебор, ккал' : 'осталось, ккал')));
}
function Dashboard({
  onOpenSettings
}) {
  const {
    Card,
    MacroRow,
    StreakBadge
  } = DS;
  const eaten = 243,
    goal = 1687;
  const [scene, setScene] = React.useState('normal');
  const s = FOX_SCENES[scene];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 8px'
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F",
    sub: "\u0441\u0440\u0435\u0434\u0430, 4 \u0438\u044E\u043D\u044F",
    action: /*#__PURE__*/React.createElement(IconButton, {
      label: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
      onClick: onOpenSettings
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "settings",
      size: 20
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Medallion, {
    m: s.m,
    b: s.b,
    status: s.status
  }), /*#__PURE__*/React.createElement(RyzhSays, {
    text: s.voice
  })), /*#__PURE__*/React.createElement(FoxStatePicker, {
    value: scene,
    onChange: setScene
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(StreakBadge, {
    count: 5,
    label: "\u041F\u0438\u0442\u0430\u043D\u0438\u0435",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "meal",
      size: 18
    }),
    status: scene === 'risk' ? 'frozen' : scene === 'lost' ? 'cold' : 'active'
  }), /*#__PURE__*/React.createElement(StreakBadge, {
    count: 2,
    label: "\u0422\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0438",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "dumbbell",
      size: 18
    })
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => {},
    style: {
      width: '100%',
      margin: 0,
      padding: 0,
      border: 'none',
      background: 'transparent',
      textAlign: 'left',
      cursor: 'pointer',
      marginBottom: 12,
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      flex: '0 0 44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--accent-wash)',
      color: 'var(--accent)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "dumbbell",
    size: 24
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-stat-title)',
      fontWeight: 'var(--fw-semibold)'
    }
  }, "\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430"), /*#__PURE__*/React.createElement("div", {
    className: "muted small"
  }, "\u21161 \u2014 \u0413\u0440\u0443\u0434\u044C + \u0411\u0438\u0446\u0435\u043F\u0441 \xB7 2 \u0438\u0437 6")), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-hint)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 20
  }))))), /*#__PURE__*/React.createElement(Card, {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(CalorieRing, {
    eaten: eaten,
    goal: goal
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-sub)',
      color: 'var(--text-hint)',
      marginBottom: 8
    }
  }, "\u041A\u0430\u043B\u043E\u0440\u0438\u0438"), /*#__PURE__*/React.createElement(Legend, {
    color: "var(--accent)",
    label: "\u0421\u044A\u0435\u0434\u0435\u043D\u043E",
    value: `${eaten} ккал`
  }), /*#__PURE__*/React.createElement(Legend, {
    color: "var(--surface-track)",
    label: "\u0426\u0435\u043B\u044C",
    value: `${goal} ккал`
  })))), /*#__PURE__*/React.createElement(Card, {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(MacroRow, {
    name: "\u0411\u0435\u043B\u043E\u043A",
    value: 17,
    target: 137
  }), /*#__PURE__*/React.createElement(MacroRow, {
    name: "\u0416\u0438\u0440\u044B",
    value: 5,
    target: 76
  }), /*#__PURE__*/React.createElement(MacroRow, {
    name: "\u0423\u0433\u043B\u0435\u0432\u043E\u0434\u044B",
    value: 3,
    target: 193
  })));
}
function FoxStatePicker({
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 11,
      textAlign: 'center',
      marginBottom: 6,
      opacity: 0.8
    }
  }, "\u0420\u044B\u0436 \u0440\u0435\u0430\u0433\u0438\u0440\u0443\u0435\u0442 \u043D\u0430 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \xB7 \u0434\u0435\u043C\u043E"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, Object.entries(FOX_SCENES).map(([key, sc]) => {
    const on = key === value;
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      onClick: () => onChange(key),
      style: {
        flex: 1,
        padding: '7px 4px',
        margin: 0,
        border: 'none',
        borderRadius: 'var(--radius-pill)',
        fontSize: 11,
        fontFamily: 'var(--font-base)',
        fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-regular)',
        background: on ? 'var(--accent)' : 'var(--surface-chip)',
        color: on ? '#fff' : 'var(--text-hint)',
        cursor: 'pointer',
        transition: 'background var(--dur-base) var(--ease-out)',
        whiteSpace: 'nowrap'
      }
    }, sc.label);
  })));
}
function Legend({
  color,
  label,
  value
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '3px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      background: color,
      flex: '0 0 10px'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-small)',
      color: 'var(--text-hint)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-semibold)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value));
}
Object.assign(window, {
  Dashboard,
  PageHead,
  IconButton,
  Medallion,
  FOX_SCENES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mini_app/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mini_app/FoodLog.jsx
try { (() => {
// Food (Еда) — дневник: бюджет дня + группировка по приёмам + строка с меню «…».
const DSF = window.RyzhFitnessDesignSystem_eec584;
const {
  Icon: IconF
} = DSF;
const GOAL = 1687;
function DayNav({
  label,
  onPrev,
  onNext,
  nextDisabled
}) {
  const btn = (name, onClick, disabled) => /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    style: {
      width: 'var(--nav-btn)',
      height: 'var(--nav-btn)',
      flex: '0 0 auto',
      margin: 0,
      padding: 0,
      border: 'none',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-chip)',
      color: 'var(--text-secondary)',
      opacity: disabled ? 0.35 : 1,
      cursor: disabled ? 'default' : 'pointer'
    }
  }, /*#__PURE__*/React.createElement(IconF, {
    name: name,
    size: 20
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      marginBottom: 14
    }
  }, btn('chevronLeft', onPrev), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 120,
      textAlign: 'center',
      fontSize: 'var(--fs-label)',
      fontWeight: 'var(--fw-semibold)'
    }
  }, label), btn('chevronRight', onNext, nextDisabled));
}

// Бюджет дня — осталось + мини-бар + КБЖУ.
function BudgetCard({
  eaten,
  sum
}) {
  const {
    Card
  } = DSF;
  const left = GOAL - eaten;
  const over = left < 0;
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      marginBottom: 14,
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "muted",
    style: {
      fontSize: 'var(--fs-small)'
    }
  }, over ? 'Перебор' : 'Осталось на сегодня'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--fw-heavy)',
      color: over ? 'var(--danger)' : 'var(--accent)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, Math.abs(left), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: 'var(--text-hint)'
    }
  }, "\u043A\u043A\u0430\u043B"))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      borderRadius: 5,
      background: 'var(--surface-track)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: Math.min(100, eaten / GOAL * 100) + '%',
      background: over ? 'var(--danger)' : 'var(--accent)',
      borderRadius: 5,
      transition: 'width var(--dur-bar) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "muted small",
    style: {
      marginTop: 7,
      fontVariantNumeric: 'tabular-nums'
    }
  }, eaten, " \u0438\u0437 ", GOAL, " \xB7 \u0411", sum.p, " \xB7 \u0416", sum.f, " \xB7 \u0423", sum.c));
}

// Заголовок приёма пищи: название · подытог · «＋».
function MealHeader({
  name,
  kcal,
  onAdd
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      margin: '16px 2px 8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-small)',
      fontWeight: 'var(--fw-bold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--ls-caps)',
      color: 'var(--text-secondary)'
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 'var(--fs-small)',
      color: 'var(--text-hint)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, kcal, " \u043A\u043A\u0430\u043B"), /*#__PURE__*/React.createElement("button", {
    onClick: onAdd,
    "aria-label": `Добавить в «${name}»`,
    style: {
      width: 26,
      height: 26,
      flex: '0 0 26px',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      background: 'var(--accent-wash)',
      color: 'var(--accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(IconF, {
    name: "plus",
    size: 16
  })));
}
const ROW_ACTIONS = [{
  icon: 'edit',
  label: 'Изменить вес / приём'
}, {
  icon: 'repeat',
  label: 'Повторить'
}, {
  icon: 'plus',
  label: 'В мои продукты'
}, {
  icon: 'close',
  label: 'Удалить',
  danger: true
}];

// Всплывающее меню рядом со строкой (привязано к кнопке «…»).
function RowMenu({
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 46,
      right: 8,
      zIndex: 50,
      minWidth: 218,
      background: 'var(--surface-card)',
      borderRadius: 12,
      padding: 5,
      boxShadow: '0 10px 28px rgba(80,50,20,0.22)',
      border: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -6,
      right: 14,
      width: 12,
      height: 12,
      background: 'var(--surface-card)',
      borderLeft: '1px solid var(--border-hairline)',
      borderTop: '1px solid var(--border-hairline)',
      transform: 'rotate(45deg)'
    }
  }), ROW_ACTIONS.map((a, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: a.label
  }, a.danger && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-hairline)',
      margin: '4px 8px'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '10px 10px',
      margin: 0,
      border: 'none',
      borderRadius: 8,
      background: 'transparent',
      cursor: 'pointer',
      textAlign: 'left',
      color: a.danger ? 'var(--danger)' : 'var(--text-primary)',
      fontSize: 'var(--fs-label)',
      fontFamily: 'var(--font-base)'
    }
  }, /*#__PURE__*/React.createElement(IconF, {
    name: a.icon,
    size: 18,
    color: a.danger ? 'var(--danger)' : 'var(--text-secondary)'
  }), a.label))));
}

// Строка еды: чистая, калории в колонке, одна кнопка «…» со всплывающим меню.
function FoodRow({
  item,
  open,
  onToggleMenu,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '13px 14px',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius)',
      marginBottom: 8,
      boxShadow: 'var(--shadow-card)',
      zIndex: open ? 30 : 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-body)',
      fontWeight: 'var(--fw-semibold)',
      wordBreak: 'break-word'
    }
  }, item.desc), /*#__PURE__*/React.createElement("div", {
    className: "muted small",
    style: {
      fontVariantNumeric: 'tabular-nums'
    }
  }, item.time, " \xB7 \u0411", item.p, " \xB7 \u0416", item.f, " \xB7 \u0423", item.c)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 58px',
      width: 58,
      textAlign: 'right',
      fontSize: 17,
      fontWeight: 'var(--fw-bold)',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1.1
    }
  }, item.kcal, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      fontWeight: 400,
      color: 'var(--text-hint)'
    }
  }, "\u043A\u043A\u0430\u043B")), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onToggleMenu();
    },
    "aria-label": "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F",
    style: {
      width: 'var(--row-add-btn)',
      height: 'var(--row-add-btn)',
      flex: '0 0 auto',
      margin: 0,
      padding: 0,
      border: 'none',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: open ? 'var(--accent-wash)' : 'transparent',
      color: open ? 'var(--accent)' : 'var(--text-hint)',
      cursor: 'pointer',
      transition: 'background var(--dur-fast) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "20",
    height: "20",
    fill: "currentColor",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "5",
    cy: "12",
    r: "1.7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "1.7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "12",
    r: "1.7"
  }))), open && /*#__PURE__*/React.createElement(RowMenu, {
    onClose: onClose
  }));
}

// Пустое состояние с Рыжем.
function EmptyDay({
  title,
  hint
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '24px 24px 16px',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 96,
      height: 96,
      borderRadius: '50%',
      overflow: 'hidden',
      marginBottom: 8,
      background: 'radial-gradient(circle at 50% 34%, var(--medallion-1) 0%, var(--medallion-2) 72%)',
      boxShadow: '0 0 0 3px var(--accent), var(--shadow-raised)',
      filter: 'saturate(0.9)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/mascot/fox_m0_b0.png",
    alt: "\u0420\u044B\u0436",
    style: {
      width: '128%',
      height: '128%',
      objectFit: 'cover',
      objectPosition: '50% 16%',
      marginLeft: '-14%',
      marginTop: '-6%'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-stat-title)',
      fontWeight: 'var(--fw-semibold)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-small)',
      color: 'var(--text-hint)',
      maxWidth: 240,
      lineHeight: 1.4
    }
  }, hint));
}
const FOOD = [{
  meal: 'Завтрак',
  desc: 'Творог 5% 200г',
  time: '08:30',
  kcal: 242,
  p: 34,
  f: 10,
  c: 6
}, {
  meal: 'Завтрак',
  desc: 'Банан 120г',
  time: '11:10',
  kcal: 107,
  p: 1,
  f: 0,
  c: 27
}, {
  meal: 'Обед',
  desc: 'Куриная грудка 180г',
  time: '14:25',
  kcal: 297,
  p: 56,
  f: 6,
  c: 0
}, {
  meal: 'Обед',
  desc: 'Гречка варёная 150г',
  time: '14:25',
  kcal: 165,
  p: 6,
  f: 2,
  c: 33
}];
const MEAL_ORDER = ['Завтрак', 'Обед', 'Ужин', 'Перекус'];
const DAYS = [{
  label: 'Вчера',
  items: []
}, {
  label: 'Сегодня',
  items: FOOD
}];
function FoodLog() {
  const {
    SegmentedControl,
    Button
  } = DSF;
  const [mode, setMode] = React.useState('diary');
  const [dayIdx, setDayIdx] = React.useState(1);
  const [openKey, setOpenKey] = React.useState(null);
  const day = DAYS[dayIdx];
  const sum = day.items.reduce((a, i) => ({
    kcal: a.kcal + i.kcal,
    p: a.p + i.p,
    f: a.f + i.f,
    c: a.c + i.c
  }), {
    kcal: 0,
    p: 0,
    f: 0,
    c: 0
  });
  const meals = MEAL_ORDER.filter(m => day.items.some(i => i.meal === m));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      minHeight: '100%',
      padding: '16px 16px 8px'
    }
  }, openKey !== null && /*#__PURE__*/React.createElement("div", {
    onClick: () => setOpenKey(null),
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 20
    }
  }), /*#__PURE__*/React.createElement(PageHead, {
    title: "\u0415\u0434\u0430",
    sub: mode === 'diary' ? day.label : '12 продуктов'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    value: mode,
    onChange: setMode,
    options: [{
      value: 'diary',
      label: 'Дневник'
    }, {
      value: 'products',
      label: 'Мои продукты'
    }]
  })), mode === 'diary' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DayNav, {
    label: day.label,
    onPrev: () => setDayIdx(i => Math.max(0, i - 1)),
    onNext: () => setDayIdx(i => Math.min(DAYS.length - 1, i + 1)),
    nextDisabled: dayIdx >= DAYS.length - 1
  }), day.items.length ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(BudgetCard, {
    eaten: sum.kcal,
    sum: sum
  }), meals.map(m => {
    const items = day.items.filter(i => i.meal === m);
    const mk = items.reduce((a, i) => a + i.kcal, 0);
    return /*#__PURE__*/React.createElement("div", {
      key: m
    }, /*#__PURE__*/React.createElement(MealHeader, {
      name: m,
      kcal: mk,
      onAdd: () => {}
    }), items.map((it, i) => {
      const key = `${m}-${i}`;
      return /*#__PURE__*/React.createElement(FoodRow, {
        key: key,
        item: it,
        open: openKey === key,
        onToggleMenu: () => setOpenKey(k => k === key ? null : key),
        onClose: () => setOpenKey(null)
      });
    }));
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(BudgetCard, {
    eaten: 0,
    sum: sum
  }), /*#__PURE__*/React.createElement(EmptyDay, {
    title: "\u0417\u0430 \u044D\u0442\u043E\u0442 \u0434\u0435\u043D\u044C \u2014 \u043D\u0438\u0447\u0435\u0433\u043E",
    hint: "\u0420\u044B\u0436 \u043D\u0435 \u0432\u0438\u0434\u0435\u043B \u043D\u0438 \u043A\u0440\u043E\u0448\u043A\u0438. \u041E\u0442\u0441\u043A\u0430\u043D\u0438\u0440\u0443\u0439 \u0448\u0442\u0440\u0438\u0445\u043A\u043E\u0434 \u0438\u043B\u0438 \u0434\u043E\u0431\u0430\u0432\u044C \u0438\u0437 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432."
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary"
  }, /*#__PURE__*/React.createElement(IconF, {
    name: "plus",
    size: 18
  }), " \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0438\u0437 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432"))) : /*#__PURE__*/React.createElement(React.Fragment, null, [{
    name: 'творог 5%',
    sub: '88 ккал/100г · Б18 · Ж5 · У3'
  }, {
    name: 'куриная грудка',
    sub: '165 ккал/100г · Б31 · Ж4 · У0'
  }, {
    name: 'гречка варёная',
    sub: '110 ккал/100г · Б4 · Ж1 · У22'
  }].map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '13px 16px',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius)',
      marginBottom: 10,
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-body)',
      fontWeight: 'var(--fw-semibold)'
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    className: "muted small"
  }, p.sub)), /*#__PURE__*/React.createElement("button", {
    "aria-label": "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C",
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: 'none',
      background: 'var(--accent-wash)',
      color: 'var(--accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(IconF, {
    name: "plus",
    size: 18
  }))))));
}
Object.assign(window, {
  FoodLog,
  DayNav,
  FoodRow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mini_app/FoodLog.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mini_app/Scanner.jsx
try { (() => {
// Scanner (Сканер) — видоискатель с анимированной линией + фонарик.
function Scanner() {
  const [torch, setTorch] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      overflow: 'hidden',
      background: torch ? 'radial-gradient(circle at 50% 38%, #3a3d44, #15171b)' : 'linear-gradient(160deg, #2a2d33, #14161a)',
      transition: 'background .25s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0.5,
      backgroundImage: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 26px)'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTorch(t => !t),
    "aria-label": "\u0424\u043E\u043D\u0430\u0440\u0438\u043A",
    style: {
      position: 'absolute',
      top: 58,
      right: 16,
      zIndex: 6,
      width: 46,
      height: 46,
      margin: 0,
      padding: 0,
      borderRadius: '50%',
      border: '1px solid rgba(255,255,255,0.25)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: torch ? 'var(--accent)' : 'rgba(0,0,0,0.45)',
      color: '#fff',
      transition: 'background .2s',
      backdropFilter: 'blur(4px)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    fill: torch ? 'currentColor' : 'none',
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M13 2 L5 13 H11 L10 22 L19 10 H13 Z"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 106,
      right: 10,
      zIndex: 6,
      fontSize: 10,
      color: 'rgba(255,255,255,0.7)',
      width: 58,
      textAlign: 'center',
      pointerEvents: 'none'
    }
  }, torch ? 'фонарик вкл' : 'фонарик'), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '78%',
      maxWidth: 320,
      aspectRatio: '16 / 9',
      borderRadius: 12,
      boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
      position: 'relative',
      overflow: 'hidden'
    }
  }, [{
    top: 0,
    left: 0,
    bt: 1,
    bl: 1
  }, {
    top: 0,
    right: 0,
    bt: 1,
    br: 1
  }, {
    bottom: 0,
    left: 0,
    bb: 1,
    bl: 1
  }, {
    bottom: 0,
    right: 0,
    bb: 1,
    br: 1
  }].map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      position: 'absolute',
      width: 26,
      height: 26,
      top: c.top,
      bottom: c.bottom,
      left: c.left,
      right: c.right,
      borderTop: c.bt ? '3px solid #fff' : 'none',
      borderBottom: c.bb ? '3px solid #fff' : 'none',
      borderLeft: c.bl ? '3px solid #fff' : 'none',
      borderRight: c.br ? '3px solid #fff' : 'none',
      borderTopLeftRadius: c.bt && c.bl ? 12 : 0,
      borderTopRightRadius: c.bt && c.br ? 12 : 0,
      borderBottomLeftRadius: c.bb && c.bl ? 12 : 0,
      borderBottomRightRadius: c.bb && c.br ? 12 : 0
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: '32% 16%',
      display: 'flex',
      gap: 2,
      alignItems: 'stretch',
      opacity: 0.9
    }
  }, [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 4, 1, 2, 1, 3, 1, 1, 2].map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: w,
      background: i % 2 ? 'transparent' : 'rgba(255,255,255,0.92)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 8,
      right: 8,
      top: '8%',
      height: 2,
      borderRadius: 2,
      background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
      boxShadow: '0 0 10px 1px var(--accent)',
      animation: 'ryzh-scan 2.2s ease-in-out infinite'
    }
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      color: '#fff',
      marginTop: 16,
      fontSize: 14,
      textShadow: '0 1px 2px rgba(0,0,0,0.6)'
    }
  }, "\u041D\u0430\u0432\u0435\u0434\u0438 \u043A\u0430\u043C\u0435\u0440\u0443 \u043D\u0430 \u0448\u0442\u0440\u0438\u0445\u043A\u043E\u0434")), /*#__PURE__*/React.createElement("button", {
    style: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      bottom: 88,
      zIndex: 5,
      color: '#fff',
      background: 'rgba(0,0,0,0.55)',
      padding: '12px 22px',
      border: '1px solid rgba(255,255,255,0.5)',
      borderRadius: 24,
      fontSize: 15,
      width: 'auto',
      cursor: 'pointer'
    }
  }, "\u0412\u0432\u0435\u0441\u0442\u0438 \u0446\u0438\u0444\u0440\u044B \u0432\u0440\u0443\u0447\u043D\u0443\u044E"));
}
Object.assign(window, {
  Scanner
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mini_app/Scanner.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mini_app/Settings.jsx
try { (() => {
// Settings / Профиль — открывается с шестерёнки на дашборде.
// Норма калорий и Б/Ж/У считаются вживую (формула Миффлина — Сан-Жеора).
const DSS = window.RyzhFitnessDesignSystem_eec584;
const {
  Icon: IconS
} = DSS;
function calcNorms({
  sex,
  weight,
  height,
  age,
  goal,
  activity
}) {
  const w = +weight || 0,
    h = +height || 0,
    a = +age || 0;
  let bmr = 10 * w + 6.25 * h - 5 * a + (sex === 'm' ? 5 : -161);
  const actK = {
    low: 1.2,
    mid: 1.375,
    high: 1.55,
    athlete: 1.725
  }[activity] || 1.375;
  let tdee = bmr * actK;
  tdee *= goal === 'lose' ? 0.85 : goal === 'gain' ? 1.1 : 1;
  const kcal = Math.round(tdee / 10) * 10;
  const protein = Math.round(w * (goal === 'gain' ? 2.0 : 1.8));
  const fat = Math.round(kcal * 0.27 / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return {
    kcal,
    protein,
    fat,
    carbs
  };
}
function Field({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--fs-tiny)',
      color: 'var(--text-hint)',
      marginBottom: 4
    }
  }, label), children);
}
const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border-input)',
  borderRadius: 'var(--radius-input)',
  fontSize: 'var(--fs-body)',
  fontFamily: 'var(--font-base)',
  background: 'var(--surface-page)',
  color: 'var(--text-primary)'
};
function SettingsSection({
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head",
    style: {
      marginTop: 0
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-card)',
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, children));
}
function Settings({
  onClose
}) {
  const {
    SegmentedControl,
    Button
  } = DSS;
  const [p, setP] = React.useState({
    sex: 'm',
    height: 178,
    weight: 74,
    age: 29,
    bodyFat: '',
    goal: 'lose',
    activity: 'mid',
    auto: true
  });
  const [manual, setManual] = React.useState({
    kcal: 1687,
    protein: 137,
    fat: 76,
    carbs: 193
  });
  const set = (k, v) => setP(s => ({
    ...s,
    [k]: v
  }));
  const norms = p.auto ? calcNorms(p) : manual;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      minHeight: '100%',
      background: 'var(--surface-page)',
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '14px 16px',
      background: 'var(--surface-page)',
      borderBottom: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "\u041D\u0430\u0437\u0430\u0434",
    style: {
      width: 38,
      height: 38,
      flex: '0 0 38px',
      margin: 0,
      padding: 0,
      border: 'none',
      borderRadius: '50%',
      background: 'var(--surface-chip)',
      color: 'var(--text-secondary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(IconS, {
    name: "chevronLeft",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-h2)',
      fontWeight: 'var(--fw-bold)'
    }
  }, "\u041F\u0440\u043E\u0444\u0438\u043B\u044C")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      flex: '0 0 56px',
      borderRadius: '50%',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 50% 34%, var(--medallion-1), var(--medallion-2) 72%)',
      boxShadow: '0 0 0 2.5px var(--accent)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/mascot/fox_m3_b0.png",
    alt: "",
    style: {
      width: '128%',
      height: '128%',
      objectFit: 'cover',
      objectPosition: '50% 16%',
      marginLeft: '-14%',
      marginTop: '-6%'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-stat-title)',
      fontWeight: 'var(--fw-semibold)'
    }
  }, "\u0410\u043D\u0434\u0440\u0435\u0439"), /*#__PURE__*/React.createElement("div", {
    className: "muted small"
  }, "@andrey \xB7 Telegram"))), /*#__PURE__*/React.createElement(SettingsSection, {
    title: "\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0442\u0435\u043B\u0430"
  }, /*#__PURE__*/React.createElement(Field, {
    label: "\u041F\u043E\u043B"
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    value: p.sex,
    onChange: v => set('sex', v),
    options: [{
      value: 'm',
      label: 'Мужской'
    }, {
      value: 'f',
      label: 'Женский'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "\u0420\u043E\u0441\u0442, \u0441\u043C"
  }, /*#__PURE__*/React.createElement("input", {
    style: inputStyle,
    type: "number",
    inputMode: "numeric",
    value: p.height,
    onChange: e => set('height', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u0412\u0435\u0441, \u043A\u0433"
  }, /*#__PURE__*/React.createElement("input", {
    style: inputStyle,
    type: "number",
    inputMode: "numeric",
    value: p.weight,
    onChange: e => set('weight', e.target.value)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "\u0412\u043E\u0437\u0440\u0430\u0441\u0442"
  }, /*#__PURE__*/React.createElement("input", {
    style: inputStyle,
    type: "number",
    inputMode: "numeric",
    value: p.age,
    onChange: e => set('age', e.target.value)
  }))), /*#__PURE__*/React.createElement(Field, {
    label: /*#__PURE__*/React.createElement(React.Fragment, null, "% \u0436\u0438\u0440\u0430 ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-hint)',
        fontWeight: 400
      }
    }, "\xB7 \u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E"))
  }, /*#__PURE__*/React.createElement("input", {
    style: inputStyle,
    type: "number",
    inputMode: "numeric",
    placeholder: "\u043D\u0430\u043F\u0440. 18",
    value: p.bodyFat,
    onChange: e => set('bodyFat', e.target.value)
  }))), /*#__PURE__*/React.createElement(SettingsSection, {
    title: "\u0426\u0435\u043B\u044C"
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    value: p.goal,
    onChange: v => set('goal', v),
    options: [{
      value: 'lose',
      label: 'Похудение'
    }, {
      value: 'maintain',
      label: 'Поддержание'
    }, {
      value: 'gain',
      label: 'Набор'
    }]
  }), /*#__PURE__*/React.createElement(Field, {
    label: "\u0410\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C"
  }, /*#__PURE__*/React.createElement("select", {
    style: inputStyle,
    value: p.activity,
    onChange: e => set('activity', e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "low"
  }, "\u041D\u0438\u0437\u043A\u0430\u044F \u2014 \u0441\u0438\u0434\u044F\u0447\u0438\u0439 \u043E\u0431\u0440\u0430\u0437"), /*#__PURE__*/React.createElement("option", {
    value: "mid"
  }, "\u0421\u0440\u0435\u0434\u043D\u044F\u044F \u2014 1\u20133 \u0442\u0440\u0435\u043D/\u043D\u0435\u0434"), /*#__PURE__*/React.createElement("option", {
    value: "high"
  }, "\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u2014 4\u20135 \u0442\u0440\u0435\u043D/\u043D\u0435\u0434"), /*#__PURE__*/React.createElement("option", {
    value: "athlete"
  }, "\u041E\u0447\u0435\u043D\u044C \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u2014 \u0441\u043F\u043E\u0440\u0442")))), /*#__PURE__*/React.createElement(SettingsSection, {
    title: "\u0414\u043D\u0435\u0432\u043D\u0430\u044F \u043D\u043E\u0440\u043C\u0430"
  }, /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(DSS.Switch, {
    checked: p.auto,
    onChange: v => set('auto', v)
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--fs-label)'
    }
  }, "\u0421\u0447\u0438\u0442\u0430\u0442\u044C \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Norm, {
    label: "\u041A\u0430\u043B\u043E\u0440\u0438\u0438",
    value: norms.kcal,
    unit: "\u043A\u043A\u0430\u043B",
    big: true
  }), /*#__PURE__*/React.createElement(Norm, {
    label: "\u0411\u0435\u043B\u043A\u0438",
    value: norms.protein,
    unit: "\u0433"
  }), /*#__PURE__*/React.createElement(Norm, {
    label: "\u0416\u0438\u0440\u044B",
    value: norms.fat,
    unit: "\u0433"
  }), /*#__PURE__*/React.createElement(Norm, {
    label: "\u0423\u0433\u043B\u0435\u0432\u043E\u0434\u044B",
    value: norms.carbs,
    unit: "\u0433"
  })), p.auto ? /*#__PURE__*/React.createElement("div", {
    className: "muted small"
  }, "\u0424\u043E\u0440\u043C\u0443\u043B\u0430 \u041C\u0438\u0444\u0444\u043B\u0438\u043D\u0430 \u2014 \u0421\u0430\u043D-\u0416\u0435\u043E\u0440\u0430 \u043F\u043E \u0442\u0432\u043E\u0438\u043C \u0434\u0430\u043D\u043D\u044B\u043C. \u041C\u0435\u043D\u044F\u0439 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0432\u044B\u0448\u0435 \u2014 \u043F\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u043C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u044B\u0439.") : /*#__PURE__*/React.createElement("div", {
    className: "muted small"
  }, "\u0420\u0443\u0447\u043D\u043E\u0439 \u0440\u0435\u0436\u0438\u043C \u2014 \u0437\u0430\u0434\u0430\u0439 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0441\u0430\u043C (\u0432 \u043F\u0440\u043E\u0434\u0435 \u0437\u0434\u0435\u0441\u044C \u043F\u043E\u043B\u044F \u0432\u0432\u043E\u0434\u0430).")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary"
  }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C")));
}
function Norm({
  label,
  value,
  unit,
  big
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-page)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border-hairline)',
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "muted",
    style: {
      fontSize: 'var(--fs-tiny)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: big ? 22 : 18,
      fontWeight: 'var(--fw-bold)',
      fontVariantNumeric: 'tabular-nums',
      color: big ? 'var(--accent)' : 'var(--text-primary)'
    }
  }, value, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 400,
      color: 'var(--text-hint)'
    }
  }, " ", unit)));
}
Object.assign(window, {
  Settings
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mini_app/Settings.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mini_app/Workout.jsx
try { (() => {
// Workout (Тренировка) — Вариант A: карточка прогресса + чек-кружки.
const DSW = window.RyzhFitnessDesignSystem_eec584;
const {
  Icon: IconW
} = DSW;
const EXERCISES = [{
  group: 'Разминка',
  name: 'Кардио (велотренажёр)',
  sub: '10 мин',
  done: true
}, {
  group: 'Силовая',
  name: 'Жим лёжа',
  sub: '4×8-10 · 60кг',
  done: true
}, {
  group: 'Силовая',
  name: 'Жим гантелей на наклонной',
  sub: '3×10 · 22кг',
  done: true
}, {
  group: 'Силовая',
  name: 'Подъём штанги на бицепс',
  sub: '4×10 · 30кг',
  done: false
}, {
  group: 'Силовая',
  name: 'Молотки с гантелями',
  sub: '3×12 · 14кг',
  done: false
}, {
  group: 'Кор',
  name: 'Планка',
  sub: '3×60сек',
  done: false
}];
function ProgressHeader({
  title,
  done,
  total
}) {
  const {
    Card
  } = DSW;
  const pct = total ? Math.round(done / total * 100) : 0;
  const left = total - done;
  const plural = left === 1 ? 'упражнение' : left >= 2 && left <= 4 ? 'упражнения' : 'упражнений';
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-label)',
      fontWeight: 'var(--fw-semibold)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 'var(--fw-heavy)',
      color: 'var(--accent)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, done, "/", total)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 'var(--bar-h)',
      borderRadius: 6,
      background: 'var(--surface-track)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: pct + '%',
      background: 'var(--accent)',
      borderRadius: 6,
      transition: 'width var(--dur-bar) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "muted small",
    style: {
      marginTop: 8
    }
  }, left === 0 ? 'Всё выполнено — красавчик! 🦊' : `~45 мин · осталось ${left} ${plural}`));
}
function ExerciseRow({
  ex,
  onToggle
}) {
  const {
    CheckCircle
  } = DSW;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '13px 14px',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius)',
      marginBottom: 10,
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement(CheckCircle, {
    checked: ex.done,
    onChange: () => onToggle(ex)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-body)',
      fontWeight: 'var(--fw-semibold)',
      textDecoration: ex.done ? 'line-through' : 'none',
      opacity: ex.done ? 0.5 : 1,
      transition: 'opacity .2s'
    }
  }, ex.name), /*#__PURE__*/React.createElement("div", {
    className: "muted small",
    style: {
      opacity: ex.done ? 0.6 : 1
    }
  }, ex.sub)));
}
function Workout() {
  const {
    ChipRow,
    Chip,
    Button
  } = DSW;
  const [block, setBlock] = React.useState(1);
  const [exs, setExs] = React.useState(EXERCISES);
  const toggle = ex => setExs(cur => cur.map(e => e === ex ? {
    ...e,
    done: !e.done
  } : e));
  const done = exs.filter(e => e.done).length;
  const allDone = done === exs.length;
  let lastGroup = null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 8px'
    }
  }, /*#__PURE__*/React.createElement(PageHead, {
    title: "\u0422\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430",
    sub: "\u0441\u0440\u0435\u0434\u0430, 4 \u0438\u044E\u043D\u044F"
  }), /*#__PURE__*/React.createElement(ChipRow, {
    style: {
      marginBottom: 14
    }
  }, [1, 2, 3, 4].map(n => /*#__PURE__*/React.createElement(Chip, {
    key: n,
    active: n === block,
    onClick: () => setBlock(n)
  }, "\u2116", n))), /*#__PURE__*/React.createElement(ProgressHeader, {
    title: "\u21161 \u2014 \u0413\u0440\u0443\u0434\u044C + \u0411\u0438\u0446\u0435\u043F\u0441",
    done: done,
    total: exs.length
  }), exs.map((ex, i) => {
    const head = ex.group !== lastGroup ? ex.group : null;
    lastGroup = ex.group;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, head && /*#__PURE__*/React.createElement("div", {
      className: "sec-head"
    }, head), /*#__PURE__*/React.createElement(ExerciseRow, {
      ex: ex,
      onToggle: toggle
    }));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    disabled: !allDone
  }, allDone ? 'Завершить тренировку' : `Завершить · ${done} из ${exs.length}`)));
}
Object.assign(window, {
  Workout,
  ExerciseRow,
  ProgressHeader
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mini_app/Workout.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mini_app/ios-frame.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports (to window): IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard
//
// Usage — wrap your screen content in <IOSDevice> to get the bezel, status bar
// and home indicator (props: title, dark, keyboard):
//
//   <IOSDevice title="Settings">
//     ...your screen content...
//   </IOSDevice>
//   <IOSDevice dark title="Search" keyboard>…</IOSDevice>
/* END USAGE */

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mini_app/ios-frame.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardStatHead = __ds_scope.CardStatHead;

__ds_ns.CheckCircle = __ds_scope.CheckCircle;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.ChipRow = __ds_scope.ChipRow;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.RyzhIconNames = __ds_scope.RyzhIconNames;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.MacroRow = __ds_scope.MacroRow;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.StreakBadge = __ds_scope.StreakBadge;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.TabBar = __ds_scope.TabBar;

})();
