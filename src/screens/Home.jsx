const TOOLS = [
  { id: 'exposure',    icon: '⏱️', label: 'Exposure Time',         sub: 'Ir-192 · Se-75 · Co-60' },
  { id: 'unsharpness', icon: '🔍', label: 'Geometric Unsharpness',  sub: 'Ug = (f × t) / (d - t)' },
  { id: 'correction',  icon: '➕', label: 'Exposure Correction',    sub: 'Thickness adjustment' },
  { id: 'decay',       icon: '📉', label: 'Source Decay',           sub: 'Activity over time' },
  { id: 'barricade',   icon: '🚧', label: 'Barricade Distance',     sub: 'Radiation safety' },
  { id: 'iqi',         icon: '📏', label: 'IQI Reference',          sub: 'ASME E747 wire selection' },
  { id: 'rfactors',    icon: '⚗️', label: 'R Factors',              sub: 'Radiographic equivalence' },
  { id: 'filmdev',     icon: '🧪', label: 'Film Development',       sub: 'Time-temperature chart' },
  { id: 'filminterp',  icon: '🎞️', label: 'Film Interpretation',    sub: 'Density & acceptance' },
]

export default function Home({ onNav }) {
  return (
    <div style={{ padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: '#00c896', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>NDT Nation</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>RT Lab</h1>
        <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Industrial Radiographic Testing Calculators</p>
      </div>

      {/* Tool Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => onNav(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: '#1a1d2e', border: '1px solid #2e3347', borderRadius: 14,
              padding: '16px', cursor: 'pointer', width: '100%', textAlign: 'left',
              transition: 'border-color 0.2s',
            }}
            onTouchStart={e => e.currentTarget.style.borderColor = '#00c896'}
            onTouchEnd={e => e.currentTarget.style.borderColor = '#2e3347'}
          >
            <span style={{ fontSize: 28 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{t.label}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{t.sub}</div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#444', fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, padding: '14px', background: '#1a1500', border: '1px solid #333', borderRadius: 12 }}>
        <p style={{ fontSize: 11, color: '#666', textAlign: 'center', lineHeight: 1.6 }}>
          ⚠️ For reference only. Always verify with approved exposure charts and follow ASME V, ASTM E94, and applicable procedure requirements.
        </p>
      </div>
    </div>
  )
}
