/**
 * Two-body orbital mechanics: Stumpff functions, universal-variable Kepler propagation,
 * Lambert's problem (Curtis, "Orbital Mechanics for Engineering Students", algorithms 3.3/3.4/5.2),
 * and classical elements from a state vector. Units: km, km/s, s.
 */
import type { Vec3 } from './vec'
import { add, cross, dot, norm, scale, sub } from './vec'

export function stumpffC(z: number): number {
  if (z > 1e-8) return (1 - Math.cos(Math.sqrt(z))) / z
  if (z < -1e-8) return (Math.cosh(Math.sqrt(-z)) - 1) / -z
  return 0.5
}

export function stumpffS(z: number): number {
  if (z > 1e-8) {
    const s = Math.sqrt(z)
    return (s - Math.sin(s)) / (s * s * s)
  }
  if (z < -1e-8) {
    const s = Math.sqrt(-z)
    return (Math.sinh(s) - s) / (s * s * s)
  }
  return 1 / 6
}

/** Propagate a state by dt seconds under μ (universal variables). */
export function propagate(r0: Vec3, v0: Vec3, dt: number, mu: number): { r: Vec3; v: Vec3 } {
  if (dt === 0) return { r: r0, v: v0 }
  const r0n = norm(r0)
  const v0n = norm(v0)
  const vr0 = dot(r0, v0) / r0n
  const alpha = 2 / r0n - (v0n * v0n) / mu // 1/a
  const sqMu = Math.sqrt(mu)
  // initial guess for universal anomaly chi
  let chi = Math.abs(alpha) > 1e-12 ? sqMu * Math.abs(alpha) * dt : (sqMu * dt) / r0n
  if (alpha < 0) {
    // hyperbolic guess (Vallado)
    const a = 1 / alpha
    chi =
      Math.sign(dt) *
      Math.sqrt(-a) *
      Math.log((-2 * mu * alpha * dt) / (dot(r0, v0) + Math.sign(dt) * Math.sqrt(-mu * a) * (1 - r0n * alpha)))
    if (!Number.isFinite(chi)) chi = (sqMu * dt) / r0n
  }
  for (let i = 0; i < 60; i++) {
    const z = alpha * chi * chi
    const C = stumpffC(z)
    const S = stumpffS(z)
    const F = ((r0n * vr0) / sqMu) * chi * chi * C + (1 - alpha * r0n) * chi * chi * chi * S + r0n * chi - sqMu * dt
    const dF = ((r0n * vr0) / sqMu) * chi * (1 - alpha * chi * chi * S) + (1 - alpha * r0n) * chi * chi * C + r0n
    const ratio = F / dF
    chi -= ratio
    if (Math.abs(ratio) < 1e-10) break
  }
  const z = alpha * chi * chi
  const C = stumpffC(z)
  const S = stumpffS(z)
  const f = 1 - ((chi * chi) / r0n) * C
  const g = dt - (1 / sqMu) * chi * chi * chi * S
  const r = add(scale(r0, f), scale(v0, g))
  const rn = norm(r)
  const fdot = (sqMu / (rn * r0n)) * (alpha * chi * chi * chi * S - chi)
  const gdot = 1 - ((chi * chi) / rn) * C
  const v = add(scale(r0, fdot), scale(v0, gdot))
  return { r, v }
}

export interface LambertResult {
  v1: Vec3
  v2: Vec3
  converged: boolean
}

/**
 * Lambert's problem: velocities at r1 and r2 for a transfer of `dt` seconds.
 * Single revolution, prograde (transfer angle measured so that the angular momentum has +z).
 */
export function lambert(r1: Vec3, r2: Vec3, dt: number, mu: number, prograde = true): LambertResult {
  const r1n = norm(r1)
  const r2n = norm(r2)
  const c12 = cross(r1, r2)
  let theta = Math.acos(Math.max(-1, Math.min(1, dot(r1, r2) / (r1n * r2n))))
  if (prograde ? c12[2] < 0 : c12[2] >= 0) theta = 2 * Math.PI - theta
  const A = Math.sin(theta) * Math.sqrt((r1n * r2n) / (1 - Math.cos(theta)))
  const sqMu = Math.sqrt(mu)
  const y = (z: number) => r1n + r2n + (A * (z * stumpffS(z) - 1)) / Math.sqrt(stumpffC(z))
  const F = (z: number) => {
    const yz = y(z)
    if (yz < 0) return -1e30
    return Math.pow(yz / stumpffC(z), 1.5) * stumpffS(z) + A * Math.sqrt(yz) - sqMu * dt
  }
  // Bracket a sign change, then bisect (F increases with z for the single-rev case).
  let lo = -4 * Math.PI * Math.PI
  let hi = 4 * Math.PI * Math.PI - 1e-6
  // y must be positive: move lo up until y(lo) > 0
  for (let i = 0; i < 200 && y(lo) < 0; i++) lo += 0.5
  let Flo = F(lo)
  let Fhi = F(hi)
  let converged = true
  if (Flo > 0 || Fhi < 0) converged = false
  let z = 0
  for (let i = 0; i < 200; i++) {
    z = 0.5 * (lo + hi)
    const Fz = F(z)
    if (Math.abs(Fz) < 1e-6 * sqMu * dt || hi - lo < 1e-12) break
    if (Fz * Flo < 0) {
      hi = z
      Fhi = Fz
    } else {
      lo = z
      Flo = Fz
    }
  }
  void Fhi
  const yz = y(z)
  const f = 1 - yz / r1n
  const g = A * Math.sqrt(yz / mu)
  const gdot = 1 - yz / r2n
  const v1 = scale(sub(r2, scale(r1, f)), 1 / g)
  const v2 = scale(sub(scale(r2, gdot), r1), 1 / g)
  return { v1, v2, converged }
}

export interface OrbitalElements {
  a: number // km (negative for hyperbolic)
  e: number
  i: number // rad
  rp: number // periapsis radius km
  ra: number // apoapsis radius km (Infinity if e >= 1)
  energy: number // km²/s²
  period: number // s (Infinity if unbound)
}

export function elementsFromState(r: Vec3, v: Vec3, mu: number): OrbitalElements {
  const rn = norm(r)
  const vn = norm(v)
  const h = cross(r, v)
  const hn = norm(h)
  const energy = (vn * vn) / 2 - mu / rn
  const a = -mu / (2 * energy)
  const evec = sub(scale(cross(v, h), 1 / mu), scale(r, 1 / rn))
  const e = norm(evec)
  const i = Math.acos(Math.max(-1, Math.min(1, h[2] / hn)))
  const p = (hn * hn) / mu
  const rp = p / (1 + e)
  const ra = e < 1 ? p / (1 - e) : Infinity
  const period = e < 1 ? 2 * Math.PI * Math.sqrt((a * a * a) / mu) : Infinity
  return { a, e, i, rp, ra, energy, period }
}
