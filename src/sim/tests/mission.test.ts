import { describe, expect, it } from 'vitest'
import { VEHICLES, vehicleById } from '../../data/vehicles'
import { runMission } from '../mission'
import { DEFAULT_CONFIG, PRESETS } from '../presets'
import { WINDOWS } from '../transfer'

const w2028 = WINDOWS.find((w) => w.id === 'w2028')!
const base = { ...DEFAULT_CONFIG, departure: w2028.departure, transitDays: w2028.transitDays }

describe('mission chain', () => {
  it('runs every vehicle end to end without throwing', () => {
    for (const v of VEHICLES) {
      const r = runMission(v, { ...base, vehicleId: v.id })
      expect(r.ascent.ok, `${v.id} reaches orbit`).toBe(true)
      expect(r.events.length).toBeGreaterThan(5)
      expect(r.phases[0].phase).toBe('ascent')
      expect(r.computeMs).toBeLessThan(5000)
    }
  })

  it('Starship V3 with independent-estimate assumptions lands its crew in the 2028 window', () => {
    const preset = PRESETS.find((p) => p.id === 'independent')!
    const r = runMission(vehicleById('starship-v3'), { ...base, vehicleId: 'starship-v3', ...preset.patch })
    expect(r.verdict.outcome).toBe('landed')
    expect(r.verdict.crewAlive).toBe(true)
    expect(r.leo!.tankersLaunched).toBeGreaterThanOrEqual(3)
    expect(r.leo!.tankersLaunched).toBeLessThanOrEqual(6)
    expect(r.entry!.peakHeatFlux).toBeLessThan(50)
    expect(r.entry!.peakG).toBeLessThan(5)
  })

  it('Starship burns up on the hot 2031 arrival (v∞ 5.5 km/s)', () => {
    const w = WINDOWS.find((x) => x.id === 'w2031')!
    const r = runMission(vehicleById('starship-v3'), { ...base, vehicleId: 'starship-v3', departure: w.departure, transitDays: w.transitDays })
    expect(r.transfer!.entryVel).toBeGreaterThan(7)
    expect(r.verdict.outcome).toBe('burned-up')
  })

  it('"demonstrated so far" assumptions leave Starship stuck in Earth orbit', () => {
    const preset = PRESETS.find((p) => p.id === 'demonstrated')!
    const r = runMission(vehicleById('starship-v3'), { ...base, vehicleId: 'starship-v3', ...preset.patch })
    expect(r.verdict.outcome).toBe('failed-tmi')
  })

  it('capsules lose their crew to life support long before Mars', () => {
    for (const id of ['sls-orion', 'long-march-10', 'saturn-v-apollo', 'falcon-heavy-dragon']) {
      const r = runMission(vehicleById(id), { ...base, vehicleId: id })
      expect(r.verdict.reached.tmi, `${id} performs TMI`).toBe(true)
      expect(r.verdict.crewAlive, `${id} crew`).toBe(false)
      expect(r.cruise!.consumablesRunOutDay).not.toBeNull()
      expect(r.cruise!.consumablesRunOutDay!).toBeLessThan(30)
    }
  })

  it('New Glenn flies past Mars with no entry system', () => {
    const r = runMission(vehicleById('new-glenn'), { ...base, vehicleId: 'new-glenn' })
    expect(r.verdict.outcome).toBe('flyby')
  })
})
