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
