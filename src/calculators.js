// ============================================================
// NDT Nation Lab — Verified RT Calculation Formulas
// All calculations per ASME V, ASTM E94, E747, E1030, E1032
// ============================================================

// ── ISOTOPE DATA ──────────────────────────────────────────────
export const ISOTOPES = {
  'Ir-192': { halfLife: 73.83, gamma: 0.48, emissionConstant: 0.48 },
  'Se-75':  { halfLife: 119.78, gamma: 0.20, emissionConstant: 0.20 },
  'Co-60':  { halfLife: 1925.5, gamma: 1.30, emissionConstant: 1.30 },
  'Yb-169': { halfLife: 32.0, gamma: 0.125, emissionConstant: 0.125 },
  'Tm-170': { halfLife: 128.6, gamma: 0.0025, emissionConstant: 0.0025 },
}

// ── MATERIAL ATTENUATION COEFFICIENTS (cm²/g) @ isotope energy ──
export const MATERIALS = {
  'Iron / Carbon Steel':     { density: 7.87,  muRho: { 'Ir-192': 0.49, 'Se-75': 0.60, 'Co-60': 0.059, 'Yb-169': 0.70, 'Tm-170': 0.72 } },
  'Stainless Steel':         { density: 8.00,  muRho: { 'Ir-192': 0.49, 'Se-75': 0.60, 'Co-60': 0.059, 'Yb-169': 0.70, 'Tm-170': 0.72 } },
  'Aluminum':                { density: 2.70,  muRho: { 'Ir-192': 0.19, 'Se-75': 0.22, 'Co-60': 0.057, 'Yb-169': 0.25, 'Tm-170': 0.26 } },
  'Titanium':                { density: 4.51,  muRho: { 'Ir-192': 0.37, 'Se-75': 0.45, 'Co-60': 0.059, 'Yb-169': 0.52, 'Tm-170': 0.54 } },
  'Copper':                  { density: 8.96,  muRho: { 'Ir-192': 0.58, 'Se-75': 0.72, 'Co-60': 0.060, 'Yb-169': 0.82, 'Tm-170': 0.85 } },
  'Nickel':                  { density: 8.91,  muRho: { 'Ir-192': 0.56, 'Se-75': 0.69, 'Co-60': 0.059, 'Yb-169': 0.79, 'Tm-170': 0.82 } },
}

// ── EXPOSURE CORRECTION MATERIAL FACTORS (relative to steel = 1.0) ──
export const MATERIAL_FACTORS = {
  'Carbon Steel (Factor: 1.0)':   1.00,
  'Stainless Steel (Factor: 1.0)': 1.00,
  'Aluminum (Factor: 0.12)':       0.12,
  'Titanium (Factor: 0.45)':       0.45,
  'Copper (Factor: 1.4)':          1.40,
  'Nickel (Factor: 1.1)':          1.10,
}

// ── PIPE SCHEDULE DATA (wall thickness in inches) ──
export const PIPE_SCHEDULES = {
  '2':   { 'Sch 40': 0.154, 'Sch 80': 0.218, 'Sch 160': 0.344, 'XXH': 0.436 },
  '3':   { 'Sch 40': 0.216, 'Sch 80': 0.300, 'Sch 160': 0.438, 'XXH': 0.600 },
  '4':   { 'Sch 40': 0.237, 'Sch 80': 0.337, 'Sch 160': 0.531, 'XXH': 0.674 },
  '6':   { 'Sch 40': 0.280, 'Sch 80': 0.432, 'Sch 160': 0.719, 'XXH': 0.864 },
  '8':   { 'Sch 40': 0.322, 'Sch 80': 0.500, 'Sch 160': 0.906, 'XXH': 0.875 },
  '10':  { 'Sch 40': 0.365, 'Sch 80': 0.594, 'Sch 160': 1.125, 'XXH': 1.000 },
  '12':  { 'Sch 40': 0.406, 'Sch 80': 0.688, 'Sch 160': 1.312, 'XXH': 1.000 },
  '16':  { 'Sch 40': 0.500, 'Sch 80': 0.844, 'Sch 160': 1.594, 'XXH': 1.594 },
  '20':  { 'Sch 40': 0.594, 'Sch 80': 1.031, 'Sch 160': 1.969, 'XXH': 1.969 },
  '24':  { 'Sch 40': 0.688, 'Sch 80': 1.219, 'Sch 160': 2.344, 'XXH': 2.344 },
}

// ── IQI (WIRE) DATA — ASTM E747 ──────────────────────────────
export const IQI_SETS = {
  'A': [0.0032, 0.004, 0.005, 0.0063, 0.008, 0.010, 0.013],
  'B': [0.010, 0.013, 0.016, 0.020, 0.025, 0.032, 0.040],
  'C': [0.032, 0.040, 0.050, 0.063, 0.080, 0.100, 0.126],
  'D': [0.100, 0.126, 0.160, 0.200, 0.250, 0.320, 0.400],
}

// Wire IQI selection per ASME V Table T-276 (2% sensitivity, source side)
// Returns required wire diameter (inches) based on total weld thickness
export function getRequiredWireIQI(totalThicknessInch) {
  const t = totalThicknessInch
  if (t <= 0.25)  return { wire: 'Wire 1', diameter: 0.0032, set: 'A' }
  if (t <= 0.375) return { wire: 'Wire 2', diameter: 0.004,  set: 'A' }
  if (t <= 0.50)  return { wire: 'Wire 3', diameter: 0.005,  set: 'A' }
  if (t <= 0.75)  return { wire: 'Wire 4', diameter: 0.0063, set: 'A' }
  if (t <= 1.00)  return { wire: 'Wire 5', diameter: 0.008,  set: 'A' }
  if (t <= 1.50)  return { wire: 'Wire 6', diameter: 0.010,  set: 'B' }
  if (t <= 2.00)  return { wire: 'Wire 7', diameter: 0.013,  set: 'B' }
  if (t <= 2.50)  return { wire: 'Wire 8', diameter: 0.016,  set: 'B' }
  if (t <= 3.00)  return { wire: 'Wire 9', diameter: 0.020,  set: 'B' }
  if (t <= 4.00)  return { wire: 'Wire 10', diameter: 0.025, set: 'B' }
  if (t <= 6.00)  return { wire: 'Wire 11', diameter: 0.032, set: 'C' }
  return { wire: 'Wire 12', diameter: 0.040, set: 'C' }
}

// ── CALCULATION FUNCTIONS ─────────────────────────────────────

// 1. Exposure Time
// Uses inverse square law and Lambert-Beer attenuation
// E = (D × d²) / (A × k × exp(-μ × ρ × t))
// Where:
//   D = required density factor (simplified: ~1.0 for production)
//   d = source-to-film distance (meters)
//   A = source activity (Ci)
//   k = emission constant (R/hr/Ci @ 1m)
//   μ = mass attenuation coefficient (cm²/g)
//   ρ = density (g/cm³)
//   t = total thickness (cm) = wall thickness + weld reinforcement
export function calcExposureTime({ source, material, activityCi, thicknessInch, sfdInch, weldReinforcement = 0.125 }) {
  const iso = ISOTOPES[source]
  const mat = MATERIALS[material]
  if (!iso || !mat) return null

  const sfdM = (sfdInch * 2.54) / 100  // to meters
  const totalThicknessCm = (thicknessInch + weldReinforcement) * 2.54
  const mu = mat.muRho[source]  // cm²/g
  const rho = mat.density  // g/cm³
  const muLinear = mu * rho  // cm⁻¹

  // Dose rate at film (R/min) — simplified
  // DoseRate = (A × k × 1000) / d_cm² × exp(-mu*rho*t) / 60
  const sfdCm = sfdInch * 2.54
  const doseRateAtFilm = (activityCi * iso.emissionConstant * 1000) / (sfdCm * sfdCm) * Math.exp(-muLinear * totalThicknessCm) / 60

  // Required exposure = 2.0 R (typical for D7/D8 film at density 2.0)
  const requiredExposure = 2.0
  const exposureMinutes = requiredExposure / doseRateAtFilm

  return {
    minutes: exposureMinutes,
    hours: exposureMinutes / 60,
    doseRateAtFilm: doseRateAtFilm * 60, // R/hr at film
  }
}

// 2. Geometric Unsharpness
// Ug = (f × t) / (d - t)
// f = focal spot size (mm), t = OFD (mm), d = SFD (mm)
export function calcGeometricUnsharpness({ focalSpotMm, ofdMm, sfdMm }) {
  if (sfdMm <= ofdMm) return null
  const ug = (focalSpotMm * ofdMm) / (sfdMm - ofdMm)
  // ASME maximum: Ug ≤ 0.020" (0.508mm) per T-285.1
  const maxUg = 0.508
  return { ugMm: ug, ugInch: ug / 25.4, acceptable: ug <= maxUg, maxUgMm: maxUg }
}

// 3. Exposure Correction
// T₂ = T₁ × (t₂/t₁)² × materialFactor
export function calcExposureCorrection({ material, originalTimeMin, originalThickness, newThickness }) {
  const factor = MATERIAL_FACTORS[material] || 1.0
  const correctedTime = originalTimeMin * Math.pow(newThickness / originalThickness, 2) * factor
  return { correctedTimeMin: correctedTime, correctedTimeHr: correctedTime / 60 }
}

// 4. Radioactive Decay
// A = A₀ × (1/2)^(t/t½)
export function calcDecay({ isotope, initialActivityCi, elapsedDays }) {
  const iso = ISOTOPES[isotope]
  if (!iso) return null
  const currentActivity = initialActivityCi * Math.pow(0.5, elapsedDays / iso.halfLife)
  const percentRemaining = (currentActivity / initialActivityCi) * 100
  return { currentActivityCi: currentActivity, percentRemaining }
}

// 5. Barricade / Radiation Safety Distance
// DoseRate (mR/hr) = (A × Γ × 1000) / d²
// Rearranged for distance: d = sqrt((A × Γ × 1000) / DoseRate)
// Typical controlled area limit: 2 mR/hr, uncontrolled: 0.1 mR/hr (10 CFR 20)
export function calcBarricade({ isotope, activityCi, distanceFt }) {
  const iso = ISOTOPES[isotope]
  if (!iso) return null
  const distanceCm = distanceFt * 30.48
  // Dose rate in mR/hr at distance
  const doseRateMrHr = (activityCi * iso.gamma * 1000 * 1000) / (distanceCm * distanceCm)
  // Safe distance for 2 mR/hr (controlled)
  const safeDistCmControlled = Math.sqrt((activityCi * iso.gamma * 1000 * 1000) / 2)
  // Safe distance for 0.1 mR/hr (uncontrolled public)
  const safeDistCmUncontrolled = Math.sqrt((activityCi * iso.gamma * 1000 * 1000) / 0.1)
  return {
    doseRateMrHr,
    safeDistFtControlled: safeDistCmControlled / 30.48,
    safeDistFtUncontrolled: safeDistCmUncontrolled / 30.48,
  }
}

// 6. Film Development Time-Temperature (D-7 / D-8 films)
// Based on Kodak/Agfa time-temperature development charts
export const FILM_DEV_CHART = {
  60: 12, 65: 9, 68: 7.5, 70: 6.5, 72: 5.5, 75: 4.5, 77: 4.0, 80: 3.5, 85: 3.0,
}
export function calcFilmDevelopment({ tempF }) {
  const temps = Object.keys(FILM_DEV_CHART).map(Number).sort((a, b) => a - b)
  if (tempF < temps[0] || tempF > temps[temps.length - 1]) return null
  // Interpolate
  for (let i = 0; i < temps.length - 1; i++) {
    if (tempF >= temps[i] && tempF <= temps[i + 1]) {
      const t0 = temps[i], t1 = temps[i + 1]
      const d0 = FILM_DEV_CHART[t0], d1 = FILM_DEV_CHART[t1]
      const minutes = d0 + (d1 - d0) * ((tempF - t0) / (t1 - t0))
      return { minutes }
    }
  }
  return { minutes: FILM_DEV_CHART[tempF] }
}

// 7. R Factors (Radiographic Equivalence)
// Relative exposure factors compared to steel = 1.0 at Ir-192
export const R_FACTORS = {
  'Carbon Steel':          { 'Ir-192': 1.00, 'Co-60': 1.00, 'Se-75': 1.00 },
  'Stainless Steel':       { 'Ir-192': 1.00, 'Co-60': 1.00, 'Se-75': 1.00 },
  'Aluminum Alloy':        { 'Ir-192': 0.08, 'Co-60': 0.07, 'Se-75': 0.09 },
  'Aluminum (2024)':       { 'Ir-192': 0.08, 'Co-60': 0.07, 'Se-75': 0.09 },
  'Copper':                { 'Ir-192': 1.5,  'Co-60': 1.4,  'Se-75': 1.6  },
  'Brass':                 { 'Ir-192': 1.4,  'Co-60': 1.3,  'Se-75': 1.5  },
  'Titanium':              { 'Ir-192': 0.45, 'Co-60': 0.43, 'Se-75': 0.48 },
  'Inconel 600':           { 'Ir-192': 1.1,  'Co-60': 1.1,  'Se-75': 1.1  },
  'Lead':                  { 'Ir-192': 14.0, 'Co-60': 2.5,  'Se-75': 18.0 },
}
