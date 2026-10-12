import { describe, expect, it } from 'vitest'
import { earthAtmosphere, marsAtmosphere } from '../atmosphere'
import { MU_EARTH, MU_SUN, R_EARTH_MEAN } from '../constants'
import { julianDate, planetState } from '../ephemeris'
import { elementsFromState, lambert, propagate } from '../orbit'
import { computeTransfer, escapeDv } from '../transfer'
import { norm, sub } from '../vec'

describe('atmospheres', () => {
  it('USSA76 reproduces sea level and the 86 km anchor', () => {
    const sl = earthAtmosphere(0)
    expect(sl.rho).toBeCloseTo(1.225, 3)
    expect(sl.T).toBeCloseTo(288.15, 2)
    const h86 = earthAtmosphere(86_000)
    expect(h86.rho).toBeGreaterThan(6.5e-6)
    expect(h86.rho).toBeLessThan(7.4e-6)
    expect(earthAtmosphere(11_000).T).toBeCloseTo(216.65, 0)
  })
  it('Mars profile interpolates the MCD table', () => {
    expect(marsAtmosphere(0).rho).toBeCloseTo(1.533e-2, 4)
    expect(marsAtmosphere(40_000).rho).toBeCloseTo(3.304e-4, 6)
    const mid = marsAtmosphere(30_000).rho
    expect(mid).toBeLessThan(2.888e-3)
    expect(mid).toBeGreaterThan(3.304e-4)
  })
})

describe('orbit propagation', () => {
  it('keeps a 300 km circular orbit circular over 10 revolutions', () => {
    const r0 = 6378.137 + 300 // equatorial radius anchor from the research notes
    const v0 = Math.sqrt(MU_EARTH / r0)
    expect(v0).toBeCloseTo(7.7257, 3)
    const period = 2 * Math.PI * Math.sqrt((r0 * r0 * r0) / MU_EARTH)
    expect(period / 60).toBeCloseTo(90.5, 0)
    const s = propagate([r0, 0, 0], [0, v0, 0], 10 * period, MU_EARTH)
    expect(norm(s.r)).toBeCloseTo(r0, 2) // within 10 m
    const el = elementsFromState(s.r, s.v, MU_EARTH)
    expect(el.e).toBeLessThan(1e-6)
  })
  it('Lambert reproduces a Hohmann-like Earth–Mars transfer', () => {
    // circular coplanar Earth (1 au) → Mars (1.524 au), half a period
    const AU = 149_597_870.7
    const a = (AU + 1.52371 * AU) / 2
    const tof = Math.PI * Math.sqrt((a * a * a) / MU_SUN)
    expect(tof / 86400).toBeCloseTo(258.9, 0)
    // 180° transfers are singular for Lambert; use 176° with a slightly shorter TOF
    const th = (176 * Math.PI) / 180
    const r1: [number, number, number] = [AU, 0, 0]
    const r2: [number, number, number] = [1.52371 * AU * Math.cos(th), 1.52371 * AU * Math.sin(th), 0]
    const sol = lambert(r1, r2, tof * 0.985, MU_SUN, true)
    expect(sol.converged).toBe(true)
    const vEarth = Math.sqrt(MU_SUN / AU)
    const c3 = norm(sub(sol.v1, [0, vEarth, 0])) ** 2
    expect(c3).toBeGreaterThan(7.5)
    expect(c3).toBeLessThan(10.5)
    const vMars = Math.sqrt(MU_SUN / (1.52371 * AU))
    const vInf = norm(sub(sol.v2, [-vMars * Math.sin(th), vMars * Math.cos(th), 0]))
    expect(vInf).toBeGreaterThan(2.2)
    expect(vInf).toBeLessThan(3.2)
  })
})

describe('ephemeris + transfer windows', () => {
  it('Earth is ~1 au from the Sun and Mars ~1.38–1.67 au', () => {
    const jd = julianDate(new Date('2026-10-12T00:00:00Z'))
    const e = planetState('earth', jd)
    const m = planetState('mars', jd)
    const AU = 149_597_870.7
    expect(norm(e.r) / AU).toBeGreaterThan(0.98)
    expect(norm(e.r) / AU).toBeLessThan(1.02)
    expect(norm(m.r) / AU).toBeGreaterThan(1.38)
    expect(norm(m.r) / AU).toBeLessThan(1.67)
    expect(norm(e.v)).toBeCloseTo(29.78, 0)
    expect(norm(m.v)).toBeGreaterThan(21.9)
    expect(norm(m.v)).toBeLessThan(26.5)
  })
  it('matches the NASA Glenn 2026 opportunity (C3 ≈ 9.1, v∞ arrival ≈ 2.7 km/s)', () => {
    const t = computeTransfer(new Date('2026-10-31T00:00:00Z'), 292, 407, 0)
    expect(t.converged).toBe(true)
    expect(t.c3).toBeGreaterThan(8.3)
    expect(t.c3).toBeLessThan(10.2)
    expect(t.vInfArr).toBeGreaterThan(2.4)
    expect(t.vInfArr).toBeLessThan(3.1)
    expect(t.dvTmi).toBeCloseTo(3.59, 1)
  })
  it('reproduces the Conte 2020 anchor arithmetic (C3 14.045 from 300 km → 3.825 km/s)', () => {
    expect(escapeDv(14.045, R_EARTH_MEAN + 300 + 7.137)).toBeCloseTo(3.825, 2)
  })
})
