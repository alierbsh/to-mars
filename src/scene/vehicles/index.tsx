import FalconHeavyModel from './FalconHeavy'
import LongMarch10Model from './LongMarch10'
import NewGlennModel from './NewGlenn'
import SaturnVModel from './SaturnV'
import SlsModel from './Sls'
import StarshipModel from './Starship'

export function VehicleModel({ id }: { id: string }) {
  switch (id) {
    case 'starship-v3':
      return <StarshipModel />
    case 'sls-orion':
      return <SlsModel />
    case 'falcon-heavy-dragon':
      return <FalconHeavyModel />
    case 'new-glenn':
      return <NewGlennModel />
    case 'long-march-10':
      return <LongMarch10Model />
    case 'saturn-v-apollo':
      return <SaturnVModel />
    default:
      return <StarshipModel />
  }
}

/** Name of the model group that is the spacecraft (what arrives at Mars). */
export const SPACECRAFT_GROUP: Record<string, string> = {
  'starship-v3': 'ship',
  'sls-orion': 'orion',
  'falcon-heavy-dragon': 'dragon',
  'new-glenn': 'fairing',
  'long-march-10': 'mengzhou',
  'saturn-v-apollo': 'apollo',
}

/** Approximate length (m) of the spacecraft group, for camera framing. */
export const SPACECRAFT_LENGTH: Record<string, number> = {
  'starship-v3': 52,
  'sls-orion': 4,
  'falcon-heavy-dragon': 5,
  'new-glenn': 22,
  'long-march-10': 4.5,
  'saturn-v-apollo': 3.7,
}

/** Height (m) of the spacecraft group's base above the model origin. */
export const SPACECRAFT_BASE: Record<string, number> = {
  'starship-v3': 72.3,
  'sls-orion': 91.6,
  'falcon-heavy-dragon': 63.4,
  'new-glenn': 76.6,
  'long-march-10': 83.0,
  'saturn-v-apollo': 98.8,
}
