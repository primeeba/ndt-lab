import { useState } from 'react'
import { getRequiredWireIQI } from '../calculators'

export default function IQIReference({ onNav }) {
  const [thickness, setThickness] = useState('')
  const [weld, setWeld] = useState('0.125')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const calculate = () => {
    setError('')
    const t = parseFloat(thickness), w = parseFloat(weld) || 0
    if (!t || t <= 0) { setError('Enter a valid wall thickness'); return }
    const total = t + w
    setResult({ ...getRequiredWireIQI(total), totalThickness: total })
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="back-btn" onClick={() => onNav('home')}>←</button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>IQI Reference</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label className="label">Wall Thickness (inches)</label>
          <input className="input" type="number" placeholder="e.g. 0.5" value={thickness} onChange={e => setThickness(e.target.value)} inputMode="decimal" /></div>
        <div><label className="label">Weld Reinforcement (inches)</label>
          <input className="input" type="number" value={weld} onChange={e => setWeld(e.target.value)} inputMode="decimal" /></div>
        {error && <div style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" onClick={calculate}>Get IQI Requirement</button>
        {result && (
          <div>
            <div className="result-box">
              <div className="result-value">{result.wire}</div>
              <div className="result-unit">Required Wire IQI</div>
              <div style={{ marginTop: 8, fontSize: 14, color: '#aaa' }}>
                Wire diameter: <span style={{ color: '#00c896' }}>{result.diameter}" ({(result.diameter * 25.4).toFixed(3)} mm)</span>
              </div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Set {result.set} — Total thickness: {result.totalThickness.toFixed(3)}"</div>
            </div>
            <div style={{ background: '#1a1d2e', borderRadius: 12, padding: 16, marginTop: 12 }}>
              <div style={{ fontSize: 13, color: '#aaa', marginBottom: 8 }}>2% Sensitivity — Source Side Placement</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.7 }}>
                Standard: ASME V T-276 / ASTM E747<br />
                Sensitivity: 2% of material thickness<br />
                Must be visible on film per procedure
              </div>
            </div>
          </div>
        )}
        <div className="formula-note" style={{ padding: 12, background: '#111', borderRadius: 8 }}>
          Wire IQI per ASTM E747 / ASME V Table T-276<br />
          Total thickness = wall thickness + weld reinforcement<br />
          Source-side placement per ASME V T-277
        </div>
      </div>
    </div>
  )
}
