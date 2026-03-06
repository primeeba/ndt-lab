import { useState, useMemo } from 'react'

// ── PIPE OD TABLE (actual OD in inches) ───────────────────────
const PIPE_OD = [
  { label: '2" (OD 2.375")',   od: 2.375 },
  { label: '2½" (OD 2.875")', od: 2.875 },
  { label: '3" (OD 3.500")',   od: 3.500 },
  { label: '3½" (OD 4.000")', od: 4.000 },
  { label: '4" (OD 4.500")',   od: 4.500 },
  { label: '5" (OD 5.563")',   od: 5.563 },
  { label: '6" (OD 6.625")',   od: 6.625 },
  { label: '8" (OD 8.625")',   od: 8.625 },
  { label: '10" (OD 10.750")', od: 10.750 },
  { label: '12" (OD 12.750")', od: 12.750 },
  { label: '14" (OD 14.000")', od: 14.000 },
  { label: '16" (OD 16.000")', od: 16.000 },
  { label: '18" (OD 18.000")', od: 18.000 },
  { label: '20" (OD 20.000")', od: 20.000 },
  { label: '24" (OD 24.000")', od: 24.000 },
  { label: '26" (OD 26.000")', od: 26.000 },
  { label: '28" (OD 28.000")', od: 28.000 },
  { label: '30" (OD 30.000")', od: 30.000 },
  { label: '32" (OD 32.000")', od: 32.000 },
  { label: '34" (OD 34.000")', od: 34.000 },
  { label: '36" (OD 36.000")', od: 36.000 },
  { label: '38" (OD 38.000")', od: 38.000 },
  { label: '40" (OD 40.000")', od: 40.000 },
  { label: '42" (OD 42.000")', od: 42.000 },
  { label: '44" (OD 44.000")', od: 44.000 },
  { label: '46" (OD 46.000")', od: 46.000 },
  { label: '48" (OD 48.000")', od: 48.000 },
]

// ── TECHNIQUES ────────────────────────────────────────────────
const TECHNIQUES = [
  { id: 'swv',     label: 'SWE/SWV',   desc: 'Single Wall — Source Inside' },
  { id: 'dwe_swv', label: 'DWE/SWV',   desc: 'Double Wall — View Far Wall' },
  { id: 'dwe_dwv', label: 'DWE/DWV',   desc: 'Double Wall — View Both Walls' },
]

// ── ISOTOPES ─────────────────────────────────────────────────
const ISOTOPES = {
  'Ir-192': { focalSpot: 2.0 },
  'Se-75':  { focalSpot: 2.0 },
  'Co-60':  { focalSpot: 3.0 },
}

// ── FILM SPEED FACTORS (relative to Agfa D7 = 1.0, ASTM E1815) ──
const FILMS = [
  // ── Class III (Fast) ──────────────────────────────────────
  { label: 'Agfa D7 / Structurix D7',         class: 'III', factor: 1.0  },
  { label: 'Kodak AA400 / Industrex AA400',    class: 'III', factor: 1.0  },
  { label: 'Fuji IX100',                        class: 'III', factor: 1.1  },
  { label: 'AGFA Structurix D7-4S',            class: 'III', factor: 1.0  },
  // ── Class II (Medium) ─────────────────────────────────────
  { label: 'Agfa D5 / Structurix D5',          class: 'II',  factor: 2.0  },
  { label: 'Kodak T200 / Industrex T200',      class: 'II',  factor: 2.0  },
  { label: 'Fuji IX50',                         class: 'II',  factor: 2.2  },
  { label: 'Fuji IX80',                         class: 'II',  factor: 1.6  },
  { label: 'Kodak MX125',                       class: 'II',  factor: 2.5  },
  { label: 'AGFA Structurix D5-4S',            class: 'II',  factor: 2.0  },
  // ── Class I (Fine Grain) ──────────────────────────────────
  { label: 'Agfa D4 / Structurix D4',          class: 'I',   factor: 3.5  },
  { label: 'Kodak AA / Industrex AA',           class: 'I',   factor: 3.5  },
  { label: 'Fuji IX25',                         class: 'I',   factor: 4.0  },
  { label: 'AGFA Structurix D4-4S',            class: 'I',   factor: 3.5  },
  // ── Class I (Ultra Fine) ──────────────────────────────────
  { label: 'Agfa D3 / Structurix D3',          class: 'I',   factor: 5.5  },
  { label: 'Agfa D2 / Structurix D2',          class: 'I',   factor: 8.0  },
  { label: 'Kodak Ultra T / Industrex Ultra T', class: 'I',   factor: 6.0  },
  { label: 'Fuji IX',                           class: 'I',   factor: 5.0  },
  { label: 'Kodak Industrex HF',                class: 'I',   factor: 4.5  },
  { label: 'AGFA Structurix D2-4S',            class: 'I',   factor: 8.0  },
]

// ── GEOMETRY CONSTANTS ────────────────────────────────────────
const WELD_BUILDUP    = 0.125    // internal weld reinforcement (source side for SWV)
const CAP_BUILDUP     = 0.0625  // external weld cap (film side)
const SCREEN_FRONT    = 0.010   // front lead screen
const SCREEN_BACK     = 0.010   // back lead screen
const FILM_THICKNESS  = 0.0625  // 1/16" film
const SOCK_THICKNESS  = 0.03125 // 1/32" sock/cassette

// OFD = distance from source-side surface of specimen to film
function calcOFD(wallT) {
  return wallT + WELD_BUILDUP + CAP_BUILDUP + SCREEN_FRONT + SCREEN_BACK + FILM_THICKNESS + SOCK_THICKNESS
}

// SFD by technique
function calcSFD(od, wallT, technique) {
  const ofd = calcOFD(wallT)
  const id = od - 2 * wallT
  if (id <= 0) return null
  switch (technique) {
    case 'swv':
      // Source at pipe center → SFD = inner radius + OFD
      return (id / 2) + ofd
    case 'dwe_swv':
      // Source outside, large bore — ASME T-274 min = 2× OD typical
      return Math.max(2 * od, 24)
    case 'dwe_dwv':
      // Source outside, small bore — typically 3× OD
      return Math.max(3 * od, 12)
    default:
      return 30
  }
}

// Radiographic thickness (what the radiation passes through)
function calcRadThickness(wallT, technique) {
  const singleWall = wallT + WELD_BUILDUP + CAP_BUILDUP
  switch (technique) {
    case 'swv':     return singleWall                  // 1 wall + reinforcements
    case 'dwe_swv': return 2 * wallT + WELD_BUILDUP + CAP_BUILDUP  // 2 walls
    case 'dwe_dwv': return 2 * wallT + WELD_BUILDUP + CAP_BUILDUP  // 2 walls
    default:        return singleWall
  }
}

// ── BASE CURIE-MINUTES TABLE (Ir-192, carbon steel, D7 film, 30" SFD) ──
function getBaseCurieMin(isotope, thicknessInch, sfdInch) {
  const charts = {
    'Ir-192': [[0.25, 4], [0.375, 7], [0.5, 12], [0.625, 20], [0.75, 32],
               [0.875, 52], [1.0, 80], [1.25, 150], [1.5, 280], [1.75, 500], [2.0, 900]],
    'Se-75':  [[0.125, 6], [0.25, 15], [0.375, 35], [0.5, 75], [0.625, 150],
               [0.75, 280], [0.875, 500], [1.0, 900]],
    'Co-60':  [[0.5, 4], [0.75, 7], [1.0, 12], [1.5, 30], [2.0, 70],
               [2.5, 150], [3.0, 300], [4.0, 800]],
  }
  const pts = charts[isotope]
  if (!pts) return null
  const t = thicknessInch
  // Extrapolate below min
  if (t <= pts[0][0]) {
    return pts[0][1] * Math.pow(sfdInch / 30, 2)
  }
  // Extrapolate above max (exponential growth)
  if (t >= pts[pts.length - 1][0]) {
    const base = pts[pts.length - 1][1] * Math.pow(2, (t - pts[pts.length - 1][0]) / 0.25)
    return base * Math.pow(sfdInch / 30, 2)
  }
  // Interpolate (log-linear)
  for (let i = 0; i < pts.length - 1; i++) {
    if (t >= pts[i][0] && t <= pts[i + 1][0]) {
      const frac = (t - pts[i][0]) / (pts[i + 1][0] - pts[i][0])
      const cm30 = pts[i][1] * Math.pow(pts[i + 1][1] / pts[i][1], frac)
      return cm30 * Math.pow(sfdInch / 30, 2)
    }
  }
  return null
}

// Ug = (f × t) / (d - t)
function calcUg(focalSpotMm, ofdInch, sfdInch) {
  const ofdMm = ofdInch * 25.4, sfdMm = sfdInch * 25.4
  if (sfdMm <= ofdMm) return null
  return (focalSpotMm * ofdMm) / (sfdMm - ofdMm)
}

function fmtTime(min) {
  if (min < 1)   return `${(min * 60).toFixed(0)} sec`
  if (min < 60)  return `${min.toFixed(1)} min`
  return `${(min / 60).toFixed(2)} hr`
}

// ── COMPONENT ─────────────────────────────────────────────────
export default function Home({ onNav }) {
  const [odIdx, setOdIdx]       = useState('')
  const [wallT, setWallT]       = useState('')
  const [technique, setTech]    = useState('swv')
  const [activity, setActivity] = useState('')
  const [isotope, setIsotope]   = useState('Ir-192')
  const [focalSpot, setFocal]   = useState('2.0')
  const [filmIdx, setFilmIdx]   = useState(0)
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState('')

  const od    = odIdx !== '' ? PIPE_OD[odIdx].od : null
  const t     = parseFloat(wallT) || 0
  const ofd   = t > 0 ? calcOFD(t) : null
  const sfd   = (od && t > 0) ? calcSFD(od, t, technique) : null
  const radT  = t > 0 ? calcRadThickness(t, technique) : null
  const film  = FILMS[filmIdx]

  const calculate = () => {
    setError('')
    const a = parseFloat(activity)
    if (!od)       { setError('Select a pipe size');        return }
    if (!t || t<=0){ setError('Enter wall thickness');      return }
    if (!a || a<=0){ setError('Enter source activity (Ci)'); return }
    if (od - 2*t <= 0){ setError('Wall thickness too large for this OD'); return }

    const cm = getBaseCurieMin(isotope, radT, sfd)
    if (!cm) { setError('Thickness out of range for this isotope'); return }

    const cmAdjusted = cm * film.factor
    const expMin = cmAdjusted / a
    const fs = parseFloat(focalSpot) || ISOTOPES[isotope].focalSpot
    const ugMm = calcUg(fs, ofd, sfd)
    const ugIn = ugMm ? ugMm / 25.4 : null

    setResult({
      expMin, cmAdjusted,
      ofd, sfd, radT,
      ugIn, ugPass: ugIn !== null ? ugIn <= 0.020 : null,
      filmLabel: film.label,
      summary: `${isotope} · ${PIPE_OD[odIdx].label} · ${t}" wall · ${a} Ci · ${TECHNIQUES.find(x=>x.id===technique).label}`,
    })
  }

  return (
    <div style={{ padding: '16px 16px 40px', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#00c896', fontWeight: 700, letterSpacing: '0.2em' }}>NDT NATION</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>RT Shot Calculator</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* 1. PIPE SIZE */}
        <div>
          <label className="label">① Pipe Size</label>
          <select className="input" value={odIdx} onChange={e => setOdIdx(e.target.value)}>
            <option value="">Select pipe size</option>
            {PIPE_OD.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
          </select>
        </div>

        {/* 2. WALL THICKNESS */}
        <div>
          <label className="label">② Wall Thickness (inches)</label>
          <input className="input" type="number" placeholder="e.g. 0.500" value={wallT}
            onChange={e => setWallT(e.target.value)} inputMode="decimal" step="0.001" />
        </div>

        {/* Auto-calc preview */}
        {sfd && ofd && radT && (
          <div style={{ background: '#111827', border: '1px solid #1e3a2e', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: '#00c896', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>AUTO-CALCULATED GEOMETRY</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                { label: 'OFD', value: ofd.toFixed(4) + '"' },
                { label: 'SFD', value: sfd.toFixed(3) + '"' },
                { label: 'Rad. T', value: radT.toFixed(4) + '"' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center', background: '#0d2218', borderRadius: 8, padding: '8px 4px' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#00c896' }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: '#444', marginTop: 8, lineHeight: 1.5 }}>
              OFD = T + 0.125 reinf + 0.0625 cap + 0.010+0.010 screens + 0.0625 film + 0.03125 sock
            </div>
          </div>
        )}

        {/* 3. TECHNIQUE */}
        <div>
          <label className="label">③ Exposure Technique</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TECHNIQUES.map(tech => (
              <button key={tech.id} onClick={() => setTech(tech.id)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', border: `2px solid ${technique === tech.id ? '#00c896' : '#2e3347'}`,
                borderRadius: 12, background: technique === tech.id ? '#0d2218' : '#1a1d2e',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: technique === tech.id ? '#00c896' : '#fff' }}>{tech.label}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{tech.desc}</div>
                </div>
                {technique === tech.id && <span style={{ color: '#00c896', fontSize: 20 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* 4. SOURCE TYPE + SOURCE SIZE + CURIES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="label">④ Source Type</label>
            <select className="input" value={isotope} onChange={e => { setIsotope(e.target.value); setFocal(String(ISOTOPES[e.target.value].focalSpot)) }}>
              {Object.keys(ISOTOPES).map(k => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Source Size (mm)</label>
            <input className="input" type="number" placeholder="e.g. 2.0" value={focalSpot}
              onChange={e => setFocal(e.target.value)} inputMode="decimal" step="0.5" />
          </div>
        </div>
        <div>
          <label className="label">⑤ Curies (Ci)</label>
          <input className="input" type="number" placeholder="e.g. 50" value={activity}
            onChange={e => setActivity(e.target.value)} inputMode="decimal" />
        </div>

        {/* 6. FILM */}
        <div>
          <label className="label">⑥ Film Type</label>
          <select className="input" value={filmIdx} onChange={e => setFilmIdx(Number(e.target.value))}>
            {FILMS.map((f, i) => (
              <option key={i} value={i}>
                [{f.class}] {f.label}{f.factor > 1 ? ` — ${f.factor}×` : ' — baseline'}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{ color: '#ff6b6b', fontSize: 13, padding: '10px 14px', background: '#1a0a0a', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <button className="btn-primary" style={{ fontSize: 18, padding: '18px', marginTop: 4 }} onClick={calculate}>
          Calculate Shot ⚡
        </button>

        {/* ── RESULTS ── */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <div style={{ fontSize: 11, color: '#444', textAlign: 'center' }}>{result.summary}</div>

            {/* Main result */}
            <div style={{ background: '#0d2218', border: '2px solid #00c896', borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#00c896', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>EXPOSURE TIME</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#00c896', lineHeight: 1 }}>{fmtTime(result.expMin)}</div>
              <div style={{ fontSize: 15, color: '#888', marginTop: 8 }}>
                {result.cmAdjusted.toFixed(1)} <span style={{ color: '#555' }}>Ci·min</span>
              </div>
              <div style={{ fontSize: 11, color: '#333', marginTop: 4 }}>{result.filmLabel}</div>
            </div>

            {/* Ug result */}
            <div style={{
              background: result.ugPass ? '#0d2218' : '#1a0a0a',
              border: `1px solid ${result.ugPass ? '#00c896' : '#ff4444'}`,
              borderRadius: 14, padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Geometric Ug</div>
                <div style={{ fontSize: 11, color: '#555' }}>ASME max 0.020" (0.508mm)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: result.ugPass ? '#00c896' : '#ff4444' }}>
                  {result.ugIn !== null ? result.ugIn.toFixed(4) + '"' : 'N/A'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: result.ugPass ? '#00c896' : '#ff4444' }}>
                  {result.ugPass === true ? '✓ PASS' : result.ugPass === false ? '✗ FAIL' : ''}
                </div>
              </div>
            </div>

            {/* Geometry breakdown */}
            <div style={{ background: '#1a1d2e', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 10 }}>GEOMETRY USED</div>
              {[
                ['OFD', result.ofd.toFixed(4) + '"'],
                ['SFD', result.sfd.toFixed(3) + '"'],
                ['Rad. Thickness', result.radT.toFixed(4) + '"'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#666' }}>{k}</span>
                  <span style={{ fontSize: 13, color: '#ddd', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MORE TOOLS ── */}
        <div style={{ borderTop: '1px solid #1e2130', paddingTop: 16, marginTop: 4 }}>
          <div style={{ fontSize: 11, color: '#444', fontWeight: 700, textAlign: 'center', marginBottom: 10, letterSpacing: '0.1em' }}>MORE TOOLS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { id: 'decay',      icon: '📉', label: 'Decay'      },
              { id: 'barricade',  icon: '🚧', label: 'Barricade'  },
              { id: 'iqi',        icon: '📏', label: 'IQI'        },
              { id: 'rfactors',   icon: '⚗️', label: 'R Factors'  },
              { id: 'filmdev',    icon: '🧪', label: 'Film Dev'   },
              { id: 'filminterp', icon: '🎞️', label: 'Film Interp'},
            ].map(t => (
              <button key={t.id} onClick={() => onNav(t.id)} style={{
                background: '#1a1d2e', border: '1px solid #2e3347', borderRadius: 10,
                padding: '10px 4px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 10, color: '#2a2a2a', textAlign: 'center', lineHeight: 1.6, marginTop: 4 }}>
          For reference only. Verify with approved exposure charts per ASME V · ASTM E94 · API 1104.
        </p>
      </div>
    </div>
  )
}
