import type { LangModule } from '../types'
import { DATA } from './data'
import { SIM } from './sim'
import { UI } from './ui'
import { WIKI } from './wiki'

const mod: LangModule = { ui: UI, sim: SIM, data: DATA, wiki: WIKI }
export default mod
