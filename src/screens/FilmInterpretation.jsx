import { useState } from 'react'

const DENSITY_REQS = [
  { code: 'ASME V (Art. 2)', min: 1.8, max: 4.0, note: 'Single film technique' },
  { code: 'ASME V (composite)', min: 2.6, max: 4.0, note: 'Composite viewing' },
  { code: 'AWS D1.1', min: 1.8, max: 4.0, note: 'Structural welding' },
  { code: 'API 1104', min: 1.8, max: 4.0, note: 'Pipeline welding' },
  { code: 'ASTM E94', min: 1.5, max: 3.5, note: 'General RT' },
]

const DISCONTINUITIES = [
  { name: 'Porosity', desc: 'Round or elongated gas voids. Rounded dark spots.', accept: 'Per ASME/AWS porosity charts — aggregate not > 1/4t in any 6" of weld' },
  { name: 'Slag Inclusion', desc: 'Non-metallic material trapped in weld.', accept: 'Length ≤ 2/3t, width ≤ t/3' },
  { name: 'Incomplete Fusion', desc: 'Lack of fusion between weld bead and base metal. Straight parallel lines.', accept: 'REJECT — not acceptable per most codes' },
  { name: 'Incomplete Penetration', desc: 'Root area not fully fused. Straight dark line at weld center.', accept: 'REJECT per ASME B31.3, API 1104' },
  { name: 'Crack', desc: 'Linear discontinuity with sharp ends. Any orientation.', accept: 'REJECT — rejectable by all codes' },
  { name: 'Undercut', desc: 'Groove at toe of weld. Dark line at weld edge.', accept: 'Max depth 1/32" or 12.5% of t (lesser) per ASME' },
  { name: 'Burn Through', desc: 'Excessive root penetration. Dark circular/oval area.', accept: 'REJECT per most pipeline codes' },
]

const SENSITIVITY = [
  { material: '< 0.25"', wire: 'Wire 1 (0.0032")' },
  { material: '0.25" – 0.50"', wire: 'Wire 3 (0.005")' },
  { material: '0.50" – 1.00"', wire: 'Wire 5 (0.008")' },
  { material: '1.00" – 2.00"', wire: 'Wire 7 (0.013")' },
  { material: '2.00" – 4.00"', wire: 'Wire 10 (0.025")' },
]

export default function FilmInterpretation({ onNav }) {
  const [tab, setTab] = useState('density')
  const [density, setDensity] = useState('')
  const [densityResult, setDensityResult] = useState(null)

  const checkDensity = () => {
    const d = parseFloat(density)
    if (!d) return
    setDensityResult(DENSITY_REQS.map(r => ({ ...r, ok: d >= r.min && d <= r.max })))
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="back-btn" onClick={() => onNav('home')}>←</button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Film Interpretation</h2>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['density', 'discont', 'sensitivity'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: tab === t ? '#00c896' : '#1a1d2e', color: tab === t ? '#000' : '#aaa'
          }}>{t === 'density' ? 'Density' : t === 'discont' ? 'Discontinuities' : 'Sensitivity'}</button>
        ))}
      </div>

      {tab === 'density' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div><label className="label">Film Density (measured)</label>
            <input className="input" type="number" placeholder="e.g. 2.5" value={density} onChange={e => setDensity(e.target.value)} inputMode="decimal" /></div>
          <button className="btn-primary" onClick={checkDensity}>Check Acceptance</button>
          {densityResult && densityResult.map(r => (
            <div key={r.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1d2e', borderRadius: 10, padding: '12px 14px' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ddd' }}>{r.code}</div>
                <div style={{ fontSize: 11, color: '#666' }}>{r.min}–{r.max} D · {r.note}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: r.ok ? '#00c896' : '#ff4444' }}>{r.ok ? '✓ PASS' : '✗ FAIL'}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'discont' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DISCONTINUITIES.map(d => (
            <div key={d.name} style={{ background: '#1a1d2e', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: '#777', marginBottom: 8 }}>{d.desc}</div>
              <div style={{ fontSize: 12, color: d.accept.startsWith('REJECT') ? '#ff6b6b' : '#00c896', fontWeight: 600 }}>{d.accept}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'sensitivity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>2% wire IQI — ASME V T-276</p>
          {SENSITIVITY.map(s => (
            <div key={s.material} style={{ display: 'flex', justifyContent: 'space-between', background: '#1a1d2e', borderRadius: 10, padding: '12px 14px' }}>
              <span style={{ fontSize: 13, color: '#ddd' }}>{s.material}</span>
              <span style={{ fontSize: 13, color: '#00c896', fontWeight: 600 }}>{s.wire}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
