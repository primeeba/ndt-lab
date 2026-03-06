import { useState } from 'react'
import { ISOTOPES, calcBarricade } from '../calculators'

export default function Barricade({ onNav }) {
  const [isotope, setIsotope] = useState('Ir-192')
  const [activity, setActivity] = useState('')
  const [distance, setDistance] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const calculate = () => {
    setError('')
    const a = parseFloat(activity), d = parseFloat(distance)
    if (!a || !d) { setError('Please fill all fields'); return }
    if (a <= 0 || d <= 0) { setError('All values must be > 0'); return }
    setResult(calcBarricade({ isotope, activityCi: a, distanceFt: d }))
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="back-btn" onClick={() => onNav('home')}>←</button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Barricade Distance</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label className="label">Isotope</label>
          <select className="input" value={isotope} onChange={e => setIsotope(e.target.value)}>
            {Object.keys(ISOTOPES).map(k => <option key={k}>{k} (Γ = {ISOTOPES[k].gamma})</option>)}
          </select>
        </div>
        <div><label className="label">Source Activity (Ci)</label>
          <input className="input" type="number" placeholder="e.g. 50" value={activity} onChange={e => setActivity(e.target.value)} inputMode="decimal" /></div>
        <div><label className="label">Distance from Source (feet)</label>
          <input className="input" type="number" placeholder="e.g. 10" value={distance} onChange={e => setDistance(e.target.value)} inputMode="decimal" /></div>
        {error && <div style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" onClick={calculate}>Calculate</button>
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="result-box">
              <div className="result-value">{result.doseRateMrHr.toFixed(3)} mR/hr</div>
              <div className="result-unit">Dose Rate at {distance} ft</div>
            </div>
            <div style={{ background: '#1a1d2e', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#aaa', marginBottom: 10 }}>SAFE DISTANCES</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#888' }}>Controlled area (2 mR/hr)</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#00c896' }}>{result.safeDistFtControlled.toFixed(1)} ft</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#888' }}>Uncontrolled (0.1 mR/hr)</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#ffaa00' }}>{result.safeDistFtUncontrolled.toFixed(1)} ft</span>
              </div>
            </div>
          </div>
        )}
        <div className="warning-box">
          <div style={{ fontSize: 13, color: '#f5a623', fontWeight: 600, marginBottom: 6 }}>⚠️ ALARA Principle</div>
          <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>Always follow ALARA. Consult your RSO. 10 CFR 20, state regulations apply. These are simplified calculations only.</p>
        </div>
        <div className="formula-note" style={{ padding: 12, background: '#111', borderRadius: 8 }}>
          Dose Rate = (A × Γ × 1000) / d²<br />
          Γ = gamma constant (R·m²/Ci·hr), d in meters
        </div>
      </div>
    </div>
  )
}
