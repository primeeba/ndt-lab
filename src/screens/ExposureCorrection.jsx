import { useState } from 'react'
import { MATERIAL_FACTORS, calcExposureCorrection } from '../calculators'

export default function ExposureCorrection({ onNav }) {
  const [material, setMaterial] = useState(Object.keys(MATERIAL_FACTORS)[0])
  const [origTime, setOrigTime] = useState('')
  const [origThick, setOrigThick] = useState('')
  const [newThick, setNewThick] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const calculate = () => {
    setError('')
    const t1 = parseFloat(origTime), th1 = parseFloat(origThick), th2 = parseFloat(newThick)
    if (!t1 || !th1 || !th2) { setError('Please fill all fields'); return }
    if (th1 <= 0 || th2 <= 0 || t1 <= 0) { setError('All values must be greater than 0'); return }
    setResult(calcExposureCorrection({ material, originalTimeMin: t1, originalThickness: th1, newThickness: th2 }))
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="back-btn" onClick={() => onNav('home')}>←</button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Exposure Correction</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label className="label">Material Type</label>
          <select className="input" value={material} onChange={e => setMaterial(e.target.value)}>
            {Object.keys(MATERIAL_FACTORS).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div><label className="label">Original Exposure Time (minutes)</label>
          <input className="input" type="number" placeholder="e.g. 4.5" value={origTime} onChange={e => setOrigTime(e.target.value)} inputMode="decimal" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label className="label">Original Thickness (in)</label>
            <input className="input" type="number" placeholder="e.g. 0.5" value={origThick} onChange={e => setOrigThick(e.target.value)} inputMode="decimal" /></div>
          <div><label className="label">New Thickness (in)</label>
            <input className="input" type="number" placeholder="e.g. 0.75" value={newThick} onChange={e => setNewThick(e.target.value)} inputMode="decimal" /></div>
        </div>
        {error && <div style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" onClick={calculate}>Calculate</button>
        {result && (
          <div className="result-box">
            <div className="result-value">{result.correctedTimeMin.toFixed(2)} min</div>
            <div className="result-unit">Corrected Exposure Time</div>
            {result.correctedTimeMin >= 60 && <div style={{ color: '#aaa', fontSize: 13, marginTop: 6 }}>{result.correctedTimeHr.toFixed(2)} hours</div>}
          </div>
        )}
        <div className="formula-note" style={{ padding: 12, background: '#111', borderRadius: 8 }}>
          T₂ = T₁ × (t₂/t₁)² × material factor<br />
          Simplified — always refer to approved exposure charts.
        </div>
      </div>
    </div>
  )
}
