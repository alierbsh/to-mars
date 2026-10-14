import { useMemo } from 'react'
import { useT } from '../i18n'

export interface Series {
  name: string
  color: string
  points: Array<[number, number]>
  /** draw on a secondary (right) axis */
  right?: boolean
  dashed?: boolean
}

interface Props {
  series: Series[]
  xLabel?: string
  yLabel?: string
  yRightLabel?: string
  height?: number
  xFormat?: (v: number) => string
  marker?: number // x position of a vertical marker (e.g. playback time)
  yMin?: number
}

function niceTicks(min: number, max: number, n = 4): number[] {
  if (!(max > min)) return [min]
  const span = max - min
  const raw = span / n
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = (norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag
  const out: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(Number(v.toFixed(10)))
  return out
}

export function LineChart({ series, xLabel, yLabel, yRightLabel, height = 160, xFormat, marker, yMin }: Props) {
  const L = useT()
  const W = 420
  const H = height
  const padL = 44
  const padR = series.some((s) => s.right) ? 44 : 12
  const padT = 10
  const padB = 26
  const { xs, ys, ysR } = useMemo(() => {
    let x0 = Infinity
    let x1 = -Infinity
    let y0 = Infinity
    let y1 = -Infinity
    let r0 = Infinity
    let r1 = -Infinity
    for (const s of series)
      for (const [x, y] of s.points) {
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue
        x0 = Math.min(x0, x)
        x1 = Math.max(x1, x)
        if (s.right) {
          r0 = Math.min(r0, y)
          r1 = Math.max(r1, y)
        } else {
          y0 = Math.min(y0, y)
          y1 = Math.max(y1, y)
        }
      }
    if (yMin !== undefined) y0 = Math.min(y0, yMin)
    if (y0 === y1) y1 = y0 + 1
    if (r0 === r1) r1 = r0 + 1
    if (x0 === x1) x1 = x0 + 1
    return { xs: [x0, x1], ys: [y0, y1], ysR: [r0, r1] }
  }, [series, yMin])
  const sx = (x: number) => padL + ((x - xs[0]) / (xs[1] - xs[0])) * (W - padL - padR)
  const sy = (y: number) => padT + (1 - (y - ys[0]) / (ys[1] - ys[0])) * (H - padT - padB)
  const syR = (y: number) => padT + (1 - (y - ysR[0]) / (ysR[1] - ysR[0])) * (H - padT - padB)
  const paths = useMemo(
    () =>
      series.map((s) =>
        s.points
          .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
          .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${(s.right ? syR(y) : sy(y)).toFixed(1)}`)
          .join(' '),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, xs, ys, ysR, padL, padR, H],
  )
  const xt = niceTicks(xs[0], xs[1], 5)
  const yt = niceTicks(ys[0], ys[1], 4)
  const ytR = niceTicks(ysR[0], ysR[1], 4)
  const fmt = (v: number) => (Math.abs(v) >= 1000 ? `${L.n.f(v / 1000, v >= 10000 ? 0 : 1)}k` : L.n.n(Number(v.toFixed(2))))
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img">
      {yt.map((v) => (
        <g key={`y${v}`}>
          <line x1={padL} x2={W - padR} y1={sy(v)} y2={sy(v)} className="chart__grid" />
          <text x={padL - 6} y={sy(v) + 3} className="chart__tick" textAnchor="end">
            {fmt(v)}
          </text>
        </g>
      ))}
      {series.some((s) => s.right) &&
        ytR.map((v) => (
          <text key={`r${v}`} x={W - padR + 6} y={syR(v) + 3} className="chart__tick chart__tick--right">
            {fmt(v)}
          </text>
        ))}
      {xt.map((v) => (
        <text key={`x${v}`} x={sx(v)} y={H - padB + 14} className="chart__tick" textAnchor="middle">
          {xFormat ? xFormat(v) : fmt(v)}
        </text>
      ))}
      {yLabel && (
        <text x={padL} y={padT - 2} className="chart__axis">
          {yLabel}
        </text>
      )}
      {yRightLabel && (
        <text x={W - padR} y={padT - 2} className="chart__axis" textAnchor="end">
          {yRightLabel}
        </text>
      )}
      {xLabel && (
        <text x={W - padR} y={H - 2} className="chart__axis" textAnchor="end">
          {xLabel}
        </text>
      )}
      {paths.map((d, i) => (
        <path key={series[i].name} d={d} fill="none" stroke={series[i].color} strokeWidth={1.6} strokeDasharray={series[i].dashed ? '4 3' : undefined} />
      ))}
      {marker !== undefined && Number.isFinite(marker) && marker >= xs[0] && marker <= xs[1] && (
        <line x1={sx(marker)} x2={sx(marker)} y1={padT} y2={H - padB} className="chart__marker" />
      )}
      <g>
        {series.map((s, i) => (
          <g key={`l${s.name}`} transform={`translate(${padL + 8 + i * 110}, ${padT + 10})`}>
            <line x1={0} x2={14} y1={0} y2={0} stroke={s.color} strokeWidth={2} strokeDasharray={s.dashed ? '4 3' : undefined} />
            <text x={18} y={3} className="chart__legend">
              {s.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}
