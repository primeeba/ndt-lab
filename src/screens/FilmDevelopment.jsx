import { useState } from 'react'
import { FILM_DEV_CHART, calcFilmDevelopment } from '../calculators'

export default function FilmDevelopment({ onNav }) {
  const [temp, setTemp] = useState('')
  const [unit, setUnit] = useState('F')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const calculate = () => {
    setError('')
    let t = parseFloat(temp)
    if (!t) { setError('Enter developer temperature'); return }
    if (unit === 'C') t = t * 9/5 + 32
    if (t < 60 || t > 85) { setError('Temperature must be between 60-85°F (15.6-29.4°C)'); return }
    const r = calcFilmDevelopment({ tempF: t })
    if (!r) { setError('Outside valid range'); return }
    setResult({ ...r, tempF: t, tempC: (t - 32) * 5/9 })
  }

  const temps = Object.keys(FILM_DEV_CHART).map(Number)

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="back-btn" onClick={() => onNav('home')}>←</button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Film Development</h2>
      </div>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>D-7 / D-8 film in full-strength developer</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <div><label className="label">Developer Temperature</label>
            <input className="input" type="number" placeholder={unit === 'F' ? 'e.g. 68' : 'e.g. 20'} value={temp} onChange={e => setTemp(e.target.value)} inputMode="decimal" /></div>
          <div><label className="label">Unit</label>
            <select className="input" value={unit} onChange={e => setUnit(e.target.value)}>
              <option>F</option><option>C</option>
            </select>
          </div>
        </div>
        {error && <div style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" onClick={calculate}>Get Development Time</button>
        {result && (
          <div className="result-box">
            <div className="result-value">{result.minutes.toFixed(1)} min</div>
            <div className="result-unit">Development Time</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>at {result.tempF.toFixed(1)}°F / {result.tempC.toFixed(1)}°C</div>
          </div>
        )}

        {/* Time-Temp Chart */}
        <div style={{ background: '#1a1d2e', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#aaa', marginBottom: 12 }}>Time-Temperature Chart (D-7/D-8)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {temps.map(t => (
              <div key={t} style={{ background: '#111', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#00c896', fontWeight: 700 }}>{FILM_DEV_CHART[t]} min</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{t}°F / {((t-32)*5/9).toFixed(0)}°C</div>
              </div>
            ))}
          </div>
        </div>
        <div className="formula-note" style={{ padding: 12, background: '#111', borderRadius: 8 }}>
          Based on typical Kodak/Agfa D-7/D-8 development data.<br />
          Always follow film manufacturer recommendations.<br />
          Agitate for first 30 seconds, every 30 seconds thereafter.
        </div>
      </div>
    </div>
  )
}
