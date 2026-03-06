import { useState } from 'react'
import { ISOTOPES, MATERIALS, PIPE_SCHEDULES, calcExposureTime } from '../calculators'

export default function ExposureTime({ onNav }) {
  const [source, setSource] = useState('Ir-192')
  const [material, setMaterial] = useState('Iron / Carbon Steel')
  const [nps, setNps] = useState('')
  const [schedule, setSchedule] = useState('')
  const [activity, setActivity] = useState('')
  const [thickness, setThickness] = useState('')
  const [sfd, setSfd] = useState('')
  const [weld, setWeld] = useState('0.125')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const pipeData = nps ? PIPE_SCHEDULES[nps] : null

  const handleNpsChange = (v) => {
    setNps(v); setSchedule('')
    setThickness('')
  }
  const handleScheduleChange = (v) => {
    setSchedule(v)
    if (pipeData && pipeData[v]) setThickness(String(pipeData[v]))
  }

  const calculate = () => {
    setError('')
    const a = parseFloat(activity), t = parseFloat(thickness), s = parseFloat(sfd), w = parseFloat(weld) || 0.125
    if (!a || !t || !s) { setError('Please fill all required fields'); return }
    if (a <= 0 || t <= 0 || s <= 0) { setError('All values must be greater than 0'); return }
    const r = calcExposureTime({ source, material, activityCi: a, thicknessInch: t, sfdInch: s, weldReinforcement: w })
    if (!r || r.minutes <= 0) { setError('Invalid calculation — check inputs'); return }
    setResult(r)
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="back-btn" onClick={() => onNav('home')}>←</button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Exposure Time</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="label">Isotope Source</label>
          <select className="input" value={source} onChange={e => setSource(e.target.value)}>
            {Object.keys(ISOTOPES).map(k => <option key={k}>{k} — Γ={ISOTOPES[k].emissionConstant} R·m²/Ci·hr</option>)}
          </select>
        </div>

        <div>
          <label className="label">Material</label>
          <select className="input" value={material} onChange={e => setMaterial(e.target.value)}>
            {Object.keys(MATERIALS).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>

        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, color: '#00c896', marginBottom: 12 }}>📐 Pipe Schedule Lookup (optional)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">NPS (inches)</label>
              <select className="input" value={nps} onChange={e => handleNpsChange(e.target.value)}>
                <option value="">Select NPS</option>
                {Object.keys(PIPE_SCHEDULES).map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Schedule</label>
              <select className="input" value={schedule} onChange={e => handleScheduleChange(e.target.value)} disabled={!pipeData}>
                <option value="">Select</option>
                {pipeData && Object.keys(pipeData).map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="label">Source Activity (Ci) *</label>
          <input className="input" type="number" placeholder="e.g. 50" value={activity} onChange={e => setActivity(e.target.value)} inputMode="decimal" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="label">Wall Thickness (in) *</label>
            <input className="input" type="number" placeholder="e.g. 0.5" value={thickness} onChange={e => setThickness(e.target.value)} inputMode="decimal" />
          </div>
          <div>
            <label className="label">SFD (in) *</label>
            <input className="input" type="number" placeholder="e.g. 30" value={sfd} onChange={e => setSfd(e.target.value)} inputMode="decimal" />
          </div>
        </div>

        <div>
          <label className="label">Weld Reinforcement (in)</label>
          <input className="input" type="number" value={weld} onChange={e => setWeld(e.target.value)} inputMode="decimal" />
        </div>

        {error && <div style={{ color: '#ff6b6b', fontSize: 13, padding: '10px', background: '#1a0a0a', borderRadius: 8 }}>{error}</div>}

        <button className="btn-primary" onClick={calculate}>Calculate</button>

        {result && (
          <div className="result-box">
            <div className="result-value">
              {result.minutes < 60
                ? `${result.minutes.toFixed(1)} min`
                : `${result.hours.toFixed(2)} hr`}
            </div>
            <div className="result-unit">Estimated Exposure Time</div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#888' }}>
              Dose rate at film: {result.doseRateAtFilm.toFixed(4)} R/hr
            </div>
          </div>
        )}

        <div className="formula-note" style={{ padding: '12px', background: '#111', borderRadius: 8 }}>
          Uses inverse-square law + Lambert-Beer exponential attenuation.<br />
          Formula: E = D·d² / (A·k·e^(-μρt))<br />
          Always verify with approved exposure charts. ASME V Article 2.
        </div>
      </div>
    </div>
  )
}
