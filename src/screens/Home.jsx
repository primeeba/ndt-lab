import { useState } from 'react'
import { ISOTOPES, MATERIALS, calcGeometricUnsharpness } from '../calculators'

// R factors per material relative to steel at each isotope
const MATERIAL_R = {
  'Carbon Steel':     { 'Ir-192': 1.00, 'Se-75': 1.00, 'Co-60': 1.00 },
  'Stainless Steel':  { 'Ir-192': 1.00, 'Se-75': 1.00, 'Co-60': 1.00 },
  'Chrome-Moly':      { 'Ir-192': 1.00, 'Se-75': 1.00, 'Co-60': 1.00 },
  'Aluminum':         { 'Ir-192': 0.08, 'Se-75': 0.09, 'Co-60': 0.07 },
  'Titanium':         { 'Ir-192': 0.45, 'Se-75': 0.48, 'Co-60': 0.43 },
  'Copper':           { 'Ir-192': 1.50, 'Se-75': 1.60, 'Co-60': 1.40 },
  'Inconel':          { 'Ir-192': 1.10, 'Se-75': 1.10, 'Co-60': 1.10 },
}

// Base curie-minutes lookup (Ir-192, steel, per inch of thickness at 30" SFD)
// From standard exposure chart data — interpolated
function getBaseCurieMin(isotope, thicknessInch, sfdInch) {
  // Base exposure (Ci·min) for carbon steel, at 30" SFD
  // Empirically derived from ASTM/Kodak RT charts
  const baseCMAt30 = {
    'Ir-192': { 0.25: 4, 0.375: 7, 0.5: 12, 0.625: 20, 0.75: 32, 0.875: 52,
                1.0: 80, 1.25: 150, 1.5: 280, 1.75: 500, 2.0: 900 },
    'Se-75':  { 0.125: 6, 0.25: 15, 0.375: 35, 0.5: 75, 0.625: 150,
                0.75: 280, 0.875: 500, 1.0: 900 },
    'Co-60':  { 0.5: 4, 0.75: 7, 1.0: 12, 1.5: 30, 2.0: 70,
                2.5: 150, 3.0: 300, 4.0: 800 },
  }
  const chart = baseCMAt30[isotope]
  if (!chart) return null
  const keys = Object.keys(chart).map(Number).sort((a, b) => a - b)
  const t = thicknessInch
  // Clamp and interpolate
  if (t <= keys[0]) {
    const cm30 = chart[keys[0]]
    return cm30 * Math.pow(sfdInch / 30, 2)
  }
  if (t >= keys[keys.length - 1]) {
    const cm30 = chart[keys[keys.length - 1]] * Math.pow(2, (t - keys[keys.length - 1]) / 0.25)
    return cm30 * Math.pow(sfdInch / 30, 2)
  }
  for (let i = 0; i < keys.length - 1; i++) {
    if (t >= keys[i] && t <= keys[i + 1]) {
      const lo = chart[keys[i]], hi = chart[keys[i + 1]]
      const frac = (t - keys[i]) / (keys[i + 1] - keys[i])
      const cm30 = lo * Math.pow(hi / lo, frac)
      return cm30 * Math.pow(sfdInch / 30, 2)
    }
  }
  return null
}

const PIPE_SCHEDULES = {
  '2"':  { 'Sch 40': 0.154, 'Sch 80': 0.218, 'Sch 160': 0.344, 'XXH': 0.436 },
  '3"':  { 'Sch 40': 0.216, 'Sch 80': 0.300, 'Sch 160': 0.438, 'XXH': 0.600 },
  '4"':  { 'Sch 40': 0.237, 'Sch 80': 0.337, 'Sch 160': 0.531, 'XXH': 0.674 },
  '6"':  { 'Sch 40': 0.280, 'Sch 80': 0.432, 'Sch 160': 0.719, 'XXH': 0.864 },
  '8"':  { 'Sch 40': 0.322, 'Sch 80': 0.500, 'Sch 160': 0.906, 'XXH': 0.875 },
  '10"': { 'Sch 40': 0.365, 'Sch 80': 0.594, 'Sch 160': 1.125, 'XXH': 1.000 },
  '12"': { 'Sch 40': 0.406, 'Sch 80': 0.688, 'Sch 160': 1.312, 'XXH': 1.000 },
  '16"': { 'Sch 40': 0.500, 'Sch 80': 0.844, 'Sch 160': 1.594, 'XXH': 1.594 },
  '20"': { 'Sch 40': 0.594, 'Sch 80': 1.031, 'Sch 160': 1.969, 'XXH': 1.969 },
  '24"': { 'Sch 40': 0.688, 'Sch 80': 1.219, 'Sch 160': 2.344, 'XXH': 2.344 },
}

function Row({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

export default function Home({ onNav }) {
  const [isotope, setIsotope] = useState('Ir-192')
  const [material, setMaterial] = useState('Carbon Steel')
  const [activity, setActivity] = useState('')
  const [thickness, setThickness] = useState('')
  const [sfd, setSfd] = useState('')
  const [focalSpot, setFocalSpot] = useState('2.0')
  const [ofd, setOfd] = useState('')
  const [rFactor, setRFactor] = useState('1.00')
  const [nps, setNps] = useState('')
  const [schedule, setSchedule] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleMaterial = (mat) => {
    setMaterial(mat)
    const r = MATERIAL_R[mat]?.[isotope] ?? 1.0
    setRFactor(r.toFixed(2))
  }
  const handleIsotope = (iso) => {
    setIsotope(iso)
    const r = MATERIAL_R[material]?.[iso] ?? 1.0
    setRFactor(r.toFixed(2))
  }
  const handleNps = (v) => { setNps(v); setSchedule(''); setThickness('') }
  const handleSchedule = (v) => {
    setSchedule(v)
    const t = PIPE_SCHEDULES[nps]?.[v]
    if (t) setThickness(String(t))
  }

  const calculate = () => {
    setError('')
    const a = parseFloat(activity), t = parseFloat(thickness), s = parseFloat(sfd)
    const f = parseFloat(focalSpot) || 2.0, o = parseFloat(ofd) || 0, rf = parseFloat(rFactor) || 1.0
    if (!a || !t || !s) { setError('Activity, Thickness, and SFD are required'); return }
    if (a <= 0 || t <= 0 || s <= 0) { setError('Values must be greater than 0'); return }

    // Base curie-minutes for steel at given SFD
    const baseCM_SWV = getBaseCurieMin(isotope, t, s) * rf
    const baseCM_DWE = getBaseCurieMin(isotope, t * 2, s) * rf  // DWE: through 2 walls
    const baseCM_DWV = baseCM_DWE  // DWV same exposure, viewing both walls

    // Exposure times
    const swvMin  = baseCM_SWV / a
    const dweMin  = baseCM_DWE / a
    const dwvMin  = baseCM_DWV / a

    // Geometric Unsharpness (if OFD provided)
    let ug = null
    if (o > 0 && s > o) {
      const sfdMm = s * 25.4, ofdMm = o * 25.4
      ug = calcGeometricUnsharpness({ focalSpotMm: f, ofdMm, sfdMm })
    }

    setResult({
      swv:  { min: swvMin,  cm: baseCM_SWV },
      dwe:  { min: dweMin,  cm: baseCM_DWE },
      dwv:  { min: dwvMin,  cm: baseCM_DWV },
      ug, rFactor: rf, isotope, material, activity: a, thickness: t, sfd: s,
    })
  }

  const fmt = (min) => {
    if (min < 1) return `${(min * 60).toFixed(0)} sec`
    if (min < 60) return `${min.toFixed(1)} min`
    return `${(min / 60).toFixed(2)} hr`
  }

  return (
    <div style={{ padding: '16px 16px 32px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#00c896', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>NDT NATION</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginTop: 4 }}>RT Shot Calculator</h1>
        <p style={{ fontSize: 12, color: '#555', marginTop: 4 }}>Enter your setup — get everything at once</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Isotope + Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Row label="Source Type">
            <select className="input" value={isotope} onChange={e => handleIsotope(e.target.value)}>
              {Object.keys(ISOTOPES).map(k => <option key={k}>{k}</option>)}
            </select>
          </Row>
          <Row label="Activity (Ci)">
            <input className="input" type="number" placeholder="e.g. 50" value={activity} onChange={e => setActivity(e.target.value)} inputMode="decimal" />
          </Row>
        </div>

        {/* Material + R Factor */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
          <Row label="Material">
            <select className="input" value={material} onChange={e => handleMaterial(e.target.value)}>
              {Object.keys(MATERIAL_R).map(k => <option key={k}>{k}</option>)}
            </select>
          </Row>
          <Row label="R Factor">
            <input className="input" type="number" value={rFactor} onChange={e => setRFactor(e.target.value)} inputMode="decimal" />
          </Row>
        </div>

        {/* Pipe Schedule Lookup */}
        <div style={{ background: '#1a1d2e', borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 11, color: '#00c896', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 10 }}>📐 PIPE SCHEDULE LOOKUP</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="label">NPS</label>
              <select className="input" value={nps} onChange={e => handleNps(e.target.value)}>
                <option value="">Select</option>
                {Object.keys(PIPE_SCHEDULES).map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Schedule</label>
              <select className="input" value={schedule} onChange={e => handleSchedule(e.target.value)} disabled={!nps}>
                <option value="">Select</option>
                {nps && Object.keys(PIPE_SCHEDULES[nps]).map(k => <option key={k}>{k} — {PIPE_SCHEDULES[nps][k]}"</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Thickness + SFD */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Row label="Wall Thickness (in)">
            <input className="input" type="number" placeholder="e.g. 0.5" value={thickness} onChange={e => setThickness(e.target.value)} inputMode="decimal" />
          </Row>
          <Row label="SFD (in)">
            <input className="input" type="number" placeholder="e.g. 30" value={sfd} onChange={e => setSfd(e.target.value)} inputMode="decimal" />
          </Row>
        </div>

        {/* Focal Spot + OFD for Ug */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Row label="Focal Spot (mm)">
            <input className="input" type="number" value={focalSpot} onChange={e => setFocalSpot(e.target.value)} inputMode="decimal" />
          </Row>
          <Row label="OFD (in) for Ug">
            <input className="input" type="number" placeholder="e.g. 0.5" value={ofd} onChange={e => setOfd(e.target.value)} inputMode="decimal" />
          </Row>
        </div>

        {error && <div style={{ color: '#ff6b6b', fontSize: 13, padding: '10px', background: '#1a0a0a', borderRadius: 8 }}>{error}</div>}

        <button className="btn-primary" style={{ fontSize: 18, padding: 18 }} onClick={calculate}>
          Calculate Shot
        </button>

        {/* RESULTS */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>
              {result.isotope} · {result.material} · {result.thickness}" wall · {result.activity} Ci · {result.sfd}" SFD · R={result.rFactor}
            </div>

            {/* Technique Results */}
            {[
              { label: 'SWV', sub: 'Single Wall View', color: '#00c896', data: result.swv },
              { label: 'DWE', sub: 'Double Wall Exposure', color: '#5bc8f5', data: result.dwe },
              { label: 'DWV', sub: 'Double Wall View', color: '#a78bfa', data: result.dwv },
            ].map(({ label, sub, color, data }) => (
              <div key={label} style={{ background: '#1a1d2e', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{sub}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color }}>{fmt(data.min)}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{data.cm.toFixed(1)} Ci·min</div>
                </div>
              </div>
            ))}

            {/* Geometric Unsharpness */}
            {result.ug && (
              <div style={{
                background: result.ug.acceptable ? '#0d2218' : '#1a0a0a',
                border: `1px solid ${result.ug.acceptable ? '#00c896' : '#ff4444'}`,
                borderRadius: 14, padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Geometric Ug</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>ASME max 0.020"</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: result.ug.acceptable ? '#00c896' : '#ff4444' }}>
                    {result.ug.ugInch.toFixed(4)}"
                  </div>
                  <div style={{ fontSize: 12, color: result.ug.acceptable ? '#00c896' : '#ff4444' }}>
                    {result.ug.acceptable ? '✓ PASS' : '✗ FAIL'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tools Link */}
        <div style={{ borderTop: '1px solid #1e2130', paddingTop: 16, marginTop: 4 }}>
          <div style={{ fontSize: 12, color: '#444', textAlign: 'center', marginBottom: 10 }}>Additional Tools</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { id: 'decay', icon: '📉', label: 'Decay' },
              { id: 'barricade', icon: '🚧', label: 'Barricade' },
              { id: 'iqi', icon: '📏', label: 'IQI' },
              { id: 'rfactors', icon: '⚗️', label: 'R Factors' },
              { id: 'filmdev', icon: '🧪', label: 'Film Dev' },
              { id: 'filminterp', icon: '🎞️', label: 'Film Interp' },
            ].map(t => (
              <button key={t.id} onClick={() => onNav(t.id)} style={{
                background: '#1a1d2e', border: '1px solid #2e3347', borderRadius: 10,
                padding: '10px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4
              }}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 10, color: '#333', textAlign: 'center', lineHeight: 1.6 }}>
          For reference only. Verify with approved exposure charts. ASME V, ASTM E94.
        </p>
      </div>
    </div>
  )
}
