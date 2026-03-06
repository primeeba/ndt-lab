import { useState } from 'react'
import Home from './screens/Home'
import ExposureTime from './screens/ExposureTime'
import GeometricUnsharpness from './screens/GeometricUnsharpness'
import ExposureCorrection from './screens/ExposureCorrection'
import Decay from './screens/Decay'
import Barricade from './screens/Barricade'
import IQIReference from './screens/IQIReference'
import RFactors from './screens/RFactors'
import FilmDevelopment from './screens/FilmDevelopment'
import FilmInterpretation from './screens/FilmInterpretation'

const SCREENS = {
  home: Home,
  exposure: ExposureTime,
  unsharpness: GeometricUnsharpness,
  correction: ExposureCorrection,
  decay: Decay,
  barricade: Barricade,
  iqi: IQIReference,
  rfactors: RFactors,
  filmdev: FilmDevelopment,
  filminterp: FilmInterpretation,
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const Screen = SCREENS[screen] || Home
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: '#0f1117' }}>
      <Screen onNav={setScreen} />
    </div>
  )
}
