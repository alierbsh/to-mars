/**
 * The scoreboard: the site's question answered at a glance. Every rocket against every departure
 * window from 2026 to 2035, under one of the three assumption sets — 90 missions run ahead of
 * time with the same simulation (scripts/scoreboard.ts → src/data/scoreboard.json). A cell says
 * how the mission ends and what decided it; clicking it starts that mission.
 */
import { useEffect, useMemo, useState } from 'react'
import { VEHICLES } from '../data/vehicles'
import data from '../data/scoreboard.json'
import { useT, type Bundle } from '../i18n'
import { PRESETS } from '../sim/presets'
import { WINDOWS } from '../sim/transfer'
import { useAppStore } from '../state/store'
import { cellConfig, cellLabel, type ScoreCell, type ScoreboardData } from './scoreboardTypes'
import { presetTexts, vehicleTexts, windowTexts } from './texts'

const BOARD = data as ScoreboardData

/** the arrival speed at Mars, from a window's note ("arrival v∞ 2.7 km/s") */
function arrivalSpeed(note: string): number | null {
  const m = note.match(/arrival v∞ ([\d.]+) km\/s/)
  return m ? Number(m[1]) : null
}

function crewLine(c: ScoreCell, L: Bundle): string | null {
  const B = L.ui.board
  if (!c.crewed) return B.uncrewed
  if (c.crewLostDay != null) return B.crewLost({ day: c.crewLostDay, days: c.tripDays ?? 0 })
  if (c.outcome === 'failed-tmi') return B.crewSafe
  return null
}

export default function Scoreboard() {
  const L = useT()
  const B = L.ui.board
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
    <div className="board" role="dialog" aria-label={B.aria}>
      <div className="board__inner">
        <button className="board__close drawer__close" onClick={closeBoard} aria-label={B.close}>
          ×
        </button>
        <p className="label">{B.label}</p>
        <h1 className="board__title">{B.title}</h1>
        <p className="board__lead">{B.lead({ n: BOARD.cells.length })}</p>

        <div className="board__presets" role="group" aria-label={B.assumptions}>
          {PRESETS.map((p) => (
            <button key={p.id} className={`chip ${p.id === presetId ? 'chip--on' : ''}`} onClick={() => setPresetId(p.id)}>
              {presetTexts(p.id, L).name} <span className="board__count">{aliveBy(p.id)}</span>
            </button>
          ))}
        </div>
        <p className="hint board__hint">
          {presetTexts(preset.id, L).blurb} {B.starshipOnly}
        </p>

        <p className="board__summary">
          <span className={`board__big ${alive > 0 ? 'board__big--ok' : 'board__big--fail'}`}>{alive}</span>
          <span>
            {B.summary({ n: crewedTotal })}
            <span className="board__sub">
              {alive === 0 ? B.none({ n: VEHICLES.length, preset: presetTexts(preset.id, L).name }) : aliveShips.length === 1 ? B.allOf({ ship: vehicleTexts(aliveShips[0], L).short }) : aliveShips.map((id) => vehicleTexts(id, L).short).join(', ')}
            </span>
          </span>
        </p>

        <div className="board__scroll">
          <table className="board__table">
            <thead>
              <tr>
                <th className="board__corner" scope="col">
                  <span className="label">{B.rocket}</span>
                </th>
                {WINDOWS.map((w) => {
                  const v = arrivalSpeed(w.note)
                  return (
                    <th key={w.id} scope="col" className={windowNow?.id === w.id ? 'board__th--now' : ''}>
                      <span className="board__win">{windowTexts(w.id, L).label}</span>
                      <span className="board__winsub">{v != null ? B.arrives({ v }) : ''}</span>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {VEHICLES.map((v) => {
                const vt = vehicleTexts(v.id, L)
                return (
                  <tr key={v.id}>
                    <th scope="row" className="board__rowhead">
                      <span className="board__ship">{vt.short}</span>
                      <span className="board__badge">{vt.badge}</span>
                    </th>
                    {WINDOWS.map((w) => {
                      const c = cells.find((x) => x.vehicleId === v.id && x.windowId === w.id)
                      if (!c) return <td key={w.id} />
                      const { key, tone } = cellLabel(c)
                      const crew = crewLine(c, L)
                      const here = config.vehicleId === v.id && windowNow?.id === w.id && (current?.id === presetId || !v.refuelable)
                      const headline = L.t(c.msg?.headline ?? c.headline)
                      const detail = L.t(c.msg?.summary ?? c.detail)
                      return (
                        <td key={w.id}>
                          <button
                            className={`cell cell--${tone} ${here ? 'cell--here' : ''}`}
                            onClick={() => flyMission(cellConfig(v.id, presetId, w.id), 'scoreboard')}
                            title={B.cellTitle({ headline, detail, crew: crew ?? '' })}
                          >
                            <span className="cell__label">
                              <span className="cell__dot" aria-hidden="true" />
                              {B.cells[key]}
                            </span>
                            <span className="cell__detail">{detail}</span>
                            {crew && <span className="cell__crew">{crew}</span>}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="board__foot">{B.foot({ crew: BOARD.crew, date: L.n.date(BOARD.generated) })}</p>
      </div>
    </div>
  )
}
