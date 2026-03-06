import { useState } from 'react'
import { ISOTOPES, calcDecay } from '../calculators'

export default function Decay({ onNav }) {
  const [isotope, setIsotope] = useState('Ir-192')
  const [initial, setInitial] = useState('')
  const [days, setDays] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const calculate = () => {
    setError('')
    const a = parseFloat(initial), d = parseFloat(days)
    if (!a || isNaN(d)) { setError('Please fill all fields'); return }
    if (a <= 0 || d < 0) { setError('Activity must be > 0, days must be ≥ 0'); return }
    setResult(calcDecay({ isotope, initialActivityCi: a, elapsedDays: d }))
  }

  const iso = ISOTOPES[isotope]

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="back-btn" onClick={() => onNav('home')}>←</button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Source Decay</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label className="label">Isotope</label>
          <select className="input" value={isotope} onChange={e => setIsotope(e.target.value)}>
            {Object.keys(ISOTOPES).map(k => <option key={k}>{k} (t½ = {ISOTOPES[k].halfLife} days)</option>)}
          </select>
        </div>
        <div style={{ background: '#1a1d2e', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#666' }}>
          Half-life: <span style={{ color: '#00c896' }}>{iso.halfLife} days</span>
        </div>
        <div><label className="label">Initial Activity (Ci)</label>
          <input className="input" type="number" placeholder="e.g. 80" value={initial} onChange={e => setInitial(e.target.value)} inputMode="decimal" /></div>
        <div><label className="label">Elapsed Time (days)</label>
          <input className="input" type="number" placeholder="e.g. 30" value={days} onChange={e => setDays(e.target.value)} inputMode="decimal" /></div>
        {error && <div style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" onClick={calculate}>Calculate</button>
        {result && (
          <div className="result-box">
            <div className="result-value">{result.currentActivityCi.toFixed(3)} Ci</div>
            <div className="result-unit">Current Activity</div>
            <div style={{ marginTop: 10, fontSize: 16, fontWeight: 600, color: result.percentRemaining > 50 ? '#00c896' : '#ffaa00' }}>
              {result.percentRemaining.toFixed(1)}% remaining
            </div>
          </div>
        )}
        <div className="formula-note" style={{ padding: 12, background: '#111', borderRadius: 8 }}>
          A = A₀ × (1/2)^(t/t½)<br />
          A₀ = initial activity, t = elapsed days, t½ = half-life
        </div>
      </div>
    </div>
  )
}
