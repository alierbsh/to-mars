export const fmtT = (t: number): string => {
  if (t < 0) t = 0
  if (t < 3600) {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `T+${m}:${s.toString().padStart(2, '0')}`
  }
  if (t < 86_400 * 2) return `T+${(t / 3600).toFixed(1)} h`
  return `day ${Math.floor(t / 86_400)}`
}

export const fmtDur = (s: number): string => {
  if (s < 90) return `${s.toFixed(0)} s`
  if (s < 3600 * 2) return `${(s / 60).toFixed(0)} min`
  if (s < 86_400 * 2) return `${(s / 3600).toFixed(1)} h`
  return `${(s / 86_400).toFixed(0)} days`
}

export const tonnes = (kg: number, d = 0): string => `${(kg / 1000).toFixed(d)} t`
export const km = (m: number, d = 0): string => `${(m / 1000).toFixed(d)} km`
export const ms = (v: number): string => `${v.toFixed(0)} m/s`
export const kms = (v: number, d = 2): string => `${v.toFixed(d)} km/s`

export const dateLabel = (jd: number): string => {
  const d = new Date((jd - 2_440_587.5) * 86_400_000)
  return d.toISOString().slice(0, 10)
}
