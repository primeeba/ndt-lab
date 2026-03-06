import { useState } from 'react'
import { calcGeometricUnsharpness } from '../calculators'

export default function GeometricUnsharpness({ onNav }) {
  const [focal, setFocal] = useState('')
  const [ofd, setOfd] = useState('')
  const [sfd, setSfd] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const calculate = () => {
    setError('')
    const f = parseFloat(focal), t = parseFloat(ofd), d = parseFloat(sfd)
    if (!f || !t || !d) { setError('Please fill all fields'); return }
    if (d <= t) { setError('SFD must be greater than OFD'); return }
    setResult(calcGeometricUnsharpness({ focalSpotMm: f, ofdMm: t, sfdMm: d }))
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="back-btn" onClick={() => onNav('home')}>←</button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Geometric Unsharpness</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><label className="label">Focal Spot Size (mm)</label>
          <input className="input" type="number" placeholder="e.g. 2.0" value={focal} onChange={e => setFocal(e.target.value)} inputMode="decimal" /></div>
        <div><label className="label">Object-to-Film Distance / OFD (mm)</label>
          <input className="input" type="number" placeholder="e.g. 12" value={ofd} onChange={e => setOfd(e.target.value)} inputMode="decimal" /></div>
        <div><label className="label">Source-to-Film Distance / SFD (mm)</label>
          <input className="input" type="number" placeholder="e.g. 750" value={sfd} onChange={e => setSfd(e.target.value)} inputMode="decimal" /></div>
        {error && <div style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</div>}
        <button className="btn-primary" onClick={calculate}>Calculate</button>
        {result && (
          <div>
            <div className="result-box" style={{ borderColor: result.acceptable ? '#00c896' : '#ff4444', background: result.acceptable ? '#0d2218' : '#1a0a0a' }}>
              <div className="result-value" style={{ color: result.acceptable ? '#00c896' : '#ff4444' }}>{result.ugMm.toFixed(4)} mm</div>
              <div className="result-unit">{result.ugInch.toFixed(5)} inches</div>
              <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: result.acceptable ? '#00c896' : '#ff4444' }}>
                {result.acceptable ? '✓ ACCEPTABLE' : '✗ EXCEEDS LIMIT'}
              </div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>ASME max: {result.maxUgMm} mm (0.020 in)</div>
            </div>
          </div>
        )}
        <div className="formula-note" style={{ padding: 12, background: '#111', borderRadius: 8 }}>
          Ug = (f × t) / (d - t)<br />
          f = focal spot, t = OFD, d = SFD<br />
          Max Ug = 0.020" per ASME V T-285.1
        </div>
      </div>
    </div>
  )
}
