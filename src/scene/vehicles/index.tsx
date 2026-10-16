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

/** Roll (rad) about the vehicle's own axis for the climb: Starship rides with its tiled side toward
 * +X, i.e. earthward once it has pitched over, so the chase camera sees steel, not black tiles. */
export const ASCENT_ROLL: Record<string, number> = { 'starship-v3': Math.PI / 2 }

/**
 * Staging as each vehicle does it (model frame, metres):
 *  - `hot`: hot staging — the upper stage lights its engines while still attached and its exhaust
 *    bursts out through the vented ring on top of the stage below;
 *  - `boostback`: the spent stage flips tail-first and burns back toward the coast, turning about
 *    a pivot `pivot` m above its base (its centre of mass, the tanks all but empty);
 *  - `vapor`: where the condensation collars form at transonic speed (the shoulders: the nose and
 *    the interstage), radius `r`; vehicles not listed get one at the nose and one at the interstage.
 */
export const STAGING: Record<string, { hot?: { lower: string; upper: string }; boostback?: { stage: string; pivot: number }; vapor?: Array<{ y: number; r: number }> }> = {
  'starship-v3': { hot: { lower: 'superheavy', upper: 'ship' }, boostback: { stage: 'superheavy', pivot: 26 }, vapor: [{ y: 110.7, r: 4.5 }, { y: 70.5, r: 4.5 }] },
}

/**
 * Length (m) of the service module group (`<spacecraft>-sm`) under the spacecraft's base — it flies
 * the cruise with it and is dropped before the entry. Apollo's includes the adapter cone.
 */
export const SERVICE_MODULE_LENGTH: Record<string, number> = {
  'sls-orion': 4.6,
  'falcon-heavy-dragon': 3.6,
  'long-march-10': 5.4,
  'saturn-v-apollo': 13.2,
}

/** Widest diameter (m) of the spacecraft and its service module: capsules are framed by their width */
export const SPACECRAFT_DIAMETER: Record<string, number> = {
  'starship-v3': 9,
  'sls-orion': 5.04,
  'falcon-heavy-dragon': 4,
  'new-glenn': 7,
  'long-march-10': 4.5,
  'saturn-v-apollo': 3.9,
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
