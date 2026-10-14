/**
 * The scoreboard: the site's question answered at a glance. Every rocket against every departure
 * window from 2026 to 2035, under one of the three assumption sets — 90 missions run ahead of
 * time with the same simulation (scripts/scoreboard.ts → src/data/scoreboard.json). A cell says
 * how the mission ends and what decided it; clicking it starts that mission.
 */
import { useEffect, useMemo, useState } from 'react'
import { VEHICLES } from '../data/vehicles'
import data from '../data/scoreboard.json'
import { PRESETS } from '../sim/presets'
import { WINDOWS } from '../sim/transfer'
import { useAppStore } from '../state/store'
import { cellConfig, cellLabel, type ScoreCell, type ScoreboardData } from './scoreboardTypes'

const BOARD = data as ScoreboardData

/** "arrival v∞ 2.7 km/s" from a window's note */
function arrival(note: string): string {
  const m = note.match(/arrival v∞ ([\d.]+) km\/s/)
  return m ? `arrives at ${m[1]} km/s` : ''
}

function crewLine(c: ScoreCell): string | null {
  if (!c.crewed) return 'Uncrewed'
  if (c.crewLostDay != null) return `Crew lost on day ${c.crewLostDay} of ${c.tripDays} — life support`
  if (c.outcome === 'failed-tmi') return 'Crew safe in Earth orbit'
  return null
}

export default function Scoreboard() {
  const closeBoard = useAppStore((s) => s.closeBoard)
  const flyMission = useAppStore((s) => s.flyMission)
  const config = useAppStore((s) => s.config)
  // open on the assumption set the viewer is using, SpaceX's claims otherwise
  const current = PRESETS.find((p) => Object.entries(p.patch).every(([k, v]) => (config as unknown as Record<string, unknown>)[k] === v))
  const [presetId, setPresetId] = useState(current?.id ?? PRESETS[0].id)
  const preset = PRESETS.find((p) => p.id === presetId)!
  const windowNow = WINDOWS.find((w) => w.departure === config.departure && w.transitDays === config.transitDays)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBoard()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeBoard])

  const cells = useMemo(() => BOARD.cells.filter((c) => c.presetId === presetId), [presetId])
  const aliveCells = cells.filter((c) => c.crewed && c.crewAlive && c.outcome === 'landed')
  const alive = aliveCells.length
  const aliveShips = [...new Set(aliveCells.map((c) => c.vehicleId))]
  const crewedTotal = cells.filter((c) => c.crewed).length
  // the same count under each assumption set, for the chips
  const aliveBy = (id: string) => BOARD.cells.filter((c) => c.presetId === id && c.crewed && c.crewAlive && c.outcome === 'landed').length

  return (
    <div className="board" role="dialog" aria-label="Scoreboard">
      <div className="board__inner">
        <button className="board__close drawer__close" onClick={closeBoard} aria-label="Close the scoreboard">
          ×
        </button>
        <p className="label">Scoreboard</p>
        <h1 className="board__title">Which rockets get a crew to Mars alive?</h1>
        <p className="board__lead">
          Every rocket, every departure window from 2026 to 2035, under three sets of assumptions — {BOARD.cells.length} missions, run with the same physics as the simulation.
        </p>

        <div className="board__presets" role="group" aria-label="Assumptions">
          {PRESETS.map((p) => (
            <button key={p.id} className={`chip ${p.id === presetId ? 'chip--on' : ''}`} onClick={() => setPresetId(p.id)}>
              {p.name} <span className="board__count">{aliveBy(p.id)}</span>
            </button>
          ))}
        </div>
        <p className="hint board__hint">
          {preset.blurb} These assumptions only change Starship — it is the only ship here that refuels in orbit.
        </p>

        <p className="board__summary">
          <span className={`board__big ${alive > 0 ? 'board__big--ok' : 'board__big--fail'}`}>{alive}</span>
          <span>
            of {crewedTotal} crewed missions land with the crew alive
            <span className="board__sub">
              {alive === 0 ? `none of the ${VEHICLES.length} rockets makes it under ${preset.name.toLowerCase()}` : aliveShips.length === 1 ? `all of them ${VEHICLES.find((v) => v.id === aliveShips[0])?.short}` : aliveShips.map((id) => VEHICLES.find((v) => v.id === id)?.short).join(', ')}
            </span>
          </span>
        </p>

        <div className="board__scroll">
          <table className="board__table">
            <thead>
              <tr>
                <th className="board__corner" scope="col">
                  <span className="label">Rocket</span>
                </th>
                {WINDOWS.map((w) => (
                  <th key={w.id} scope="col" className={windowNow?.id === w.id ? 'board__th--now' : ''}>
                    <span className="board__win">{w.label}</span>
                    <span className="board__winsub">{arrival(w.note)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VEHICLES.map((v) => (
                <tr key={v.id}>
                  <th scope="row" className="board__rowhead">
                    <span className="board__ship">{v.short}</span>
                    <span className="board__badge">{v.badge}</span>
                  </th>
                  {WINDOWS.map((w) => {
                    const c = cells.find((x) => x.vehicleId === v.id && x.windowId === w.id)
                    if (!c) return <td key={w.id} />
                    const { label, tone } = cellLabel(c)
                    const crew = crewLine(c)
                    const here = config.vehicleId === v.id && windowNow?.id === w.id && (current?.id === presetId || !v.refuelable)
                    return (
                      <td key={w.id}>
                        <button
                          className={`cell cell--${tone} ${here ? 'cell--here' : ''}`}
                          onClick={() => flyMission(cellConfig(v.id, presetId, w.id), 'scoreboard')}
                          title={`${c.headline}. ${c.detail}${crew ? ` ${crew}.` : ''} — click to fly this mission`}
                        >
                          <span className="cell__label">
                            <span className="cell__dot" aria-hidden="true" />
                            {label}
                          </span>
                          <span className="cell__detail">{c.detail}</span>
                          {crew && <span className="cell__crew">{crew}</span>}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="board__foot">
          Crew of {BOARD.crew} where the ship carries one (fewer if its capsule seats fewer). The weather at Mars is drawn from the storm record for each arrival date. Computed {BOARD.generated}. Click a mission to fly it.
        </p>
      </div>
    </div>
  )
}
