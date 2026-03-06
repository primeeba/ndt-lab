import { R_FACTORS } from '../calculators'

const SOURCES = ['Ir-192', 'Co-60', 'Se-75']

export default function RFactors({ onNav }) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="back-btn" onClick={() => onNav('home')}>←</button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>R Factors</h2>
      </div>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: 1.6 }}>
        Radiographic equivalence factors relative to carbon steel (= 1.0). Multiply steel exposure time by R factor for equivalent radiograph in listed material.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2e3347' }}>
              <th style={{ textAlign: 'left', padding: '10px 8px', color: '#aaa', fontWeight: 600 }}>Material</th>
              {SOURCES.map(s => <th key={s} style={{ textAlign: 'center', padding: '10px 8px', color: '#00c896', fontWeight: 600 }}>{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {Object.entries(R_FACTORS).map(([mat, factors], i) => (
              <tr key={mat} style={{ borderBottom: '1px solid #1e2130', background: i % 2 === 0 ? 'transparent' : '#0d0f1a' }}>
                <td style={{ padding: '12px 8px', color: '#ddd', fontSize: 12 }}>{mat}</td>
                {SOURCES.map(s => (
                  <td key={s} style={{ padding: '12px 8px', textAlign: 'center', color: factors[s] > 1 ? '#ffaa00' : factors[s] < 1 ? '#00c896' : '#fff', fontWeight: 600 }}>
                    {factors[s]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="formula-note" style={{ padding: 12, background: '#111', borderRadius: 8, marginTop: 16 }}>
        Based on ASTM E1004 / radiographic equivalence data<br />
        Values &lt; 1.0 = less dense than steel (shorter exposure)<br />
        Values &gt; 1.0 = more dense than steel (longer exposure)
      </div>
    </div>
  )
}
