// Scanner (Сканер) — видоискатель с анимированной линией + фонарик.
function Scanner() {
  const [torch, setTorch] = React.useState(false);
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden',
      background: torch
        ? 'radial-gradient(circle at 50% 38%, #3a3d44, #15171b)'
        : 'linear-gradient(160deg, #2a2d33, #14161a)',
      transition: 'background .25s ease' }}>
      {/* faux camera scene texture */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5,
        backgroundImage: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 26px)' }} />

      {/* фонарик — кнопка вверху справа (ниже статус-бара) */}
      <button onClick={() => setTorch(t => !t)} aria-label="Фонарик" style={{
        position: 'absolute', top: 58, right: 16, zIndex: 6, width: 46, height: 46, margin: 0, padding: 0,
        borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: torch ? 'var(--accent)' : 'rgba(0,0,0,0.45)', color: '#fff',
        transition: 'background .2s', backdropFilter: 'blur(4px)',
      }}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill={torch ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 L5 13 H11 L10 22 L19 10 H13 Z" />
        </svg>
      </button>

      {/* подпись под фонариком */}
      <div style={{ position: 'absolute', top: 106, right: 10, zIndex: 6, fontSize: 10, color: 'rgba(255,255,255,0.7)', width: 58, textAlign: 'center', pointerEvents: 'none' }}>
        {torch ? 'фонарик вкл' : 'фонарик'}
      </div>

      {/* viewfinder cutout */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{
          width: '78%', maxWidth: 320, aspectRatio: '16 / 9',
          borderRadius: 12, boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* уголки рамки */}
          {[
            { top: 0, left: 0, bt: 1, bl: 1 },
            { top: 0, right: 0, bt: 1, br: 1 },
            { bottom: 0, left: 0, bb: 1, bl: 1 },
            { bottom: 0, right: 0, bb: 1, br: 1 },
          ].map((c, i) => (
            <span key={i} style={{
              position: 'absolute', width: 26, height: 26,
              top: c.top, bottom: c.bottom, left: c.left, right: c.right,
              borderTop: c.bt ? '3px solid #fff' : 'none',
              borderBottom: c.bb ? '3px solid #fff' : 'none',
              borderLeft: c.bl ? '3px solid #fff' : 'none',
              borderRight: c.br ? '3px solid #fff' : 'none',
              borderTopLeftRadius: c.bt && c.bl ? 12 : 0,
              borderTopRightRadius: c.bt && c.br ? 12 : 0,
              borderBottomLeftRadius: c.bb && c.bl ? 12 : 0,
              borderBottomRightRadius: c.bb && c.br ? 12 : 0,
            }} />
          ))}
          {/* faux barcode */}
          <div style={{ position: 'absolute', inset: '32% 16%', display: 'flex', gap: 2, alignItems: 'stretch', opacity: 0.9 }}>
            {[3,1,2,1,4,1,1,3,2,1,1,2,4,1,2,1,3,1,1,2].map((w, i) => (
              <div key={i} style={{ flex: w, background: i % 2 ? 'transparent' : 'rgba(255,255,255,0.92)' }} />
            ))}
          </div>
          {/* анимированная линия сканирования */}
          <div style={{
            position: 'absolute', left: 8, right: 8, top: '8%', height: 2, borderRadius: 2,
            background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
            boxShadow: '0 0 10px 1px var(--accent)',
            animation: 'ryzh-scan 2.2s ease-in-out infinite',
          }} />
        </div>
        <p style={{ color: '#fff', marginTop: 16, fontSize: 14, textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
          Наведи камеру на штрихкод
        </p>
      </div>

      {/* manual entry pill (above tab bar) */}
      <button style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 88, zIndex: 5,
        color: '#fff', background: 'rgba(0,0,0,0.55)', padding: '12px 22px',
        border: '1px solid rgba(255,255,255,0.5)', borderRadius: 24, fontSize: 15, width: 'auto', cursor: 'pointer',
      }}>Ввести цифры вручную</button>
    </div>
  );
}

Object.assign(window, { Scanner });
