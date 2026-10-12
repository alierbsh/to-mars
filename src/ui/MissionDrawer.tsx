import { useState } from 'react'
import { VEHICLES } from '../data/vehicles'
import { PRESETS } from '../sim/presets'
import { WINDOWS } from '../sim/transfer'
import { useAppStore } from '../state/store'

function Slider({ label, value, min, max, step, unit, onChange, note, format }: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void; note?: string; format?: (v: number) => string }) {
  return (
    <label className="field">
      <span className="field__row">
        <span className="field__label">{label}</span>
        <span className="field__value">{format ? format(value) : `${value}${unit ? ` ${unit}` : ''}`}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {note && <span className="field__note">{note}</span>}
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <span>{label}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__track" aria-hidden="true" />
    </label>
  )
}

/** Mission set-up: the rocket, the window, the crew, and the assumptions that decide the verdict. Everything else is behind "Advanced". */
export default function MissionDrawer() {
  const config = useAppStore((s) => s.config)
  const setConfig = useAppStore((s) => s.setConfig)
  const open = useAppStore((s) => s.drawer === 'mission')
  const setDrawer = useAppStore((s) => s.setDrawer)
  const [advanced, setAdvanced] = useState(false)
  const vehicle = VEHICLES.find((v) => v.id === config.vehicleId)!
  const isShip = vehicle.refuelable
  const crewed = vehicle.spacecraft.crewCapacity > 0
  const dayMs = 86_400_000
  const depMs = new Date(config.departure + 'T00:00:00Z').getTime()
  const nearest = WINDOWS.reduce((best, w) => (Math.abs(new Date(w.departure + 'T00:00:00Z').getTime() - depMs) < Math.abs(new Date(best.departure + 'T00:00:00Z').getTime() - depMs) ? w : best), WINDOWS[0])
  const shiftDays = Math.round((depMs - new Date(nearest.departure + 'T00:00:00Z').getTime()) / dayMs)
  const windowId = Math.abs(shiftDays) <= 60 ? nearest.id : undefined
  const activePreset = PRESETS.find((p) => Object.entries(p.patch).every(([k, v]) => (config as unknown as Record<string, unknown>)[k] === v))

  return (
    <aside className={`drawer drawer--left ${open ? 'drawer--open' : ''}`} inert={!open}>
      <div className="drawer__head">
        <p className="label">Mission</p>
        <button className="drawer__close" onClick={() => setDrawer('mission')} aria-label="Close">
          ×
        </button>
      </div>
      <div className="drawer__body">
        <section className="section">
          <p className="label">Rocket</p>
          <ul className="vehicles">
            {VEHICLES.map((v) => (
              <li key={v.id}>
                <button className={`vehicle ${v.id === config.vehicleId ? 'vehicle--on' : ''}`} onClick={() => setConfig({ vehicleId: v.id, crew: Math.min(config.crew, Math.max(v.spacecraft.crewCapacity, 0)) || config.crew })}>
                  <span className="vehicle__name">{v.name}</span>
                  <span className="vehicle__meta">{v.badge}</span>
                  <span className="vehicle__tagline">{v.tagline}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="section">
          <p className="label">Departure</p>
          <div className="chips">
            {WINDOWS.map((w) => (
              <button key={w.id} className={`chip ${windowId === w.id ? 'chip--on' : ''}`} onClick={() => setConfig({ departure: w.departure, transitDays: w.transitDays })} title={w.note}>
                {w.label}
              </button>
            ))}
          </div>
          <p className="hint">{windowId ? nearest.note : `Custom departure ${config.departure}`}</p>
          <Slider label="Transit" value={config.transitDays} min={120} max={400} step={2} unit="days" onChange={(v) => setConfig({ transitDays: v })} />
        </section>

        <section className="section">
          <p className="label">Crew</p>
          {crewed ? (
            <Slider label="People aboard" value={Math.min(config.crew, vehicle.spacecraft.crewCapacity)} min={1} max={vehicle.spacecraft.crewCapacity} step={1} onChange={(v) => setConfig({ crew: v })} note={`${vehicle.spacecraft.name}: up to ${vehicle.spacecraft.crewCapacity}${vehicle.spacecraft.lifeSupportDays > 0 ? `, ${vehicle.spacecraft.lifeSupportDays} days of life support` : ''}`} />
          ) : (
            <p className="hint">No crew vehicle exists for this rocket — it flies a {vehicle.spacecraft.name.toLowerCase()}.</p>
          )}
        </section>

        {isShip && (
          <section className="section">
            <p className="label">Assumptions</p>
            <p className="hint">Four numbers nobody has measured decide the verdict: propellant per tanker, boil-off, launch cadence, tile limit. Pick a set.</p>
            <div className="presets">
              {PRESETS.map((p) => (
                <button key={p.id} className={`preset ${activePreset?.id === p.id ? 'preset--on' : ''}`} onClick={() => setConfig(p.patch)}>
                  <span className="preset__name">{p.name}</span>
                  <span className="preset__blurb">{p.blurb}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="section">
          <button className="disclosure" onClick={() => setAdvanced(!advanced)} aria-expanded={advanced}>
            <span className="label">Advanced</span>
            <span className={`disclosure__chev ${advanced ? 'disclosure__chev--open' : ''}`} aria-hidden="true" />
          </button>
          {advanced && (
            <div className="advanced">
              <Slider label="Departure shift" value={shiftDays} min={-60} max={60} step={2} unit="days" onChange={(v) => {
                const d = new Date(nearest.departure + 'T00:00:00Z')
                d.setUTCDate(d.getUTCDate() + v)
                setConfig({ departure: d.toISOString().slice(0, 10) })
              }} format={(v) => `${v >= 0 ? '+' : ''}${v} d · ${config.departure}`} />
              {isShip && (
                <>
                  <p className="label label--sub">Ship</p>
                  <Slider label="Crew systems" value={config.crewSystems / 1000} min={5} max={60} step={1} unit="t" onChange={(v) => setConfig({ crewSystems: v * 1000 })} note="Cabin, ECLSS hardware, storm shelter. NASA transit-habitat studies: 25–45 t." />
                  <Slider label="Cargo" value={config.cargo / 1000} min={0} max={100} step={1} unit="t" onChange={(v) => setConfig({ cargo: v * 1000 })} />
                  <Slider label="Consumables margin" value={config.consumablesMargin * 100} min={0} max={100} step={5} unit="%" onChange={(v) => setConfig({ consumablesMargin: v / 100 })} />
                  <Slider label="Water recovery" value={config.waterRecovery * 100} min={0} max={99} step={1} unit="%" onChange={(v) => setConfig({ waterRecovery: v / 100 })} note="ISS today: 98 % water, ~50 % oxygen." />
                  <Slider label="Oxygen recovery" value={config.oxygenRecovery * 100} min={0} max={95} step={5} unit="%" onChange={(v) => setConfig({ oxygenRecovery: v / 100 })} />
                  <Slider label="Ship dry mass" value={(config.shipDryMass ?? 140_000) / 1000} min={90} max={200} step={5} unit="t" onChange={(v) => setConfig({ shipDryMass: v * 1000 })} note="Unpublished. Musk 2021 target ~100 t; V2 performance implies much more." />
                  <Slider label="Booster dry mass" value={(config.boosterDryMass ?? 250_000) / 1000} min={180} max={320} step={5} unit="t" onChange={(v) => setConfig({ boosterDryMass: v * 1000 })} />
                  <Toggle label="Expend the booster" checked={config.expendable} onChange={(v) => setConfig({ expendable: v })} />
                  <p className="label label--sub">Refuelling</p>
                  <Slider label="Tankers available" value={config.tankers} min={0} max={20} step={1} onChange={(v) => setConfig({ tankers: v })} note="Only as many as the mission needs are launched." />
                  <Slider label="Propellant per tanker" value={config.propPerTanker / 1000} min={50} max={250} step={10} unit="t" onChange={(v) => setConfig({ propPerTanker: v * 1000 })} note="Claims: 100–150 t (V3), 200+ t (V4). Demonstrated: 0." />
                  <Slider label="Days between tankers" value={config.tankerCadenceDays} min={2} max={60} step={1} onChange={(v) => setConfig({ tankerCadenceDays: v })} note="2026 cadence: one Starship every ~60 days." />
                  <Slider label="Boil-off" value={config.boiloffPerDay * 100} min={0} max={1} step={0.01} onChange={(v) => setConfig({ boiloffPerDay: v / 100 })} note="Depot studies: 0.05–0.1 %/day with insulation; no Starship measurement exists." format={(v) => `${v.toFixed(2)} %/day`} />
                </>
              )}
              <p className="label label--sub">Mars arrival</p>
              <Slider label="Entry angle" value={config.entryFpaDeg} min={-20} max={-6} step={0.5} unit="°" onChange={(v) => setConfig({ entryFpaDeg: v })} note="Shallow skips out; steep piles on g and heat. Robotic landers used −11.5° to −17°." />
              <Slider label="Atmospheric density" value={config.densityScale * 100} min={50} max={150} step={5} unit="%" onChange={(v) => setConfig({ densityScale: v / 100 })} note="Mars-GRAM 3σ at 50–80 km is about ±50 % (season, dust)." />
              <Slider label="Heating margin" value={config.heatingMargin} min={1} max={3} step={0.1} onChange={(v) => setConfig({ heatingMargin: v })} note="Stagnation-point formula underpredicts peak heating on large blunt bodies by 2–4× (MSL)." format={(v) => `${v.toFixed(1)}×`} />
              <Slider label="Crew g-limit" value={config.gLimit} min={3} max={8} step={0.5} unit="g" onChange={(v) => setConfig({ gLimit: v })} note="4 g sustained is the NASA tolerance for a deconditioned crew; aerocapture studies use 5 g." />
              <Toggle label="Bank modulation" checked={config.autoBank} onChange={(v) => setConfig({ autoBank: v })} />
              <p className="label label--sub">Mars weather</p>
              <div className="chips">
                {(
                  [
                    ['random', 'Roll the dice'],
                    ['none', 'Clear'],
                    ['regional', 'Regional storm'],
                    ['global', 'Global storm'],
                  ] as const
                ).map(([id, name]) => (
                  <button key={id} className={`chip ${config.dustStorm === id ? 'chip--on' : ''}`} onClick={() => setConfig({ dustStorm: id })}>
                    {name}
                  </button>
                ))}
              </div>
              <p className="hint">Drawn from the storm record and the season at arrival (global storms: one Mars year in three, southern spring and summer). A storm lifts the entry density and blinds the landing's hazard avoidance.</p>
              <Slider label="Surface wind" value={config.surfaceWind} min={0} max={30} step={1} unit="m/s" onChange={(v) => setConfig({ surfaceWind: v })} note="In 0.6 % of Earth's air pressure even a 30 m/s gale cannot tip a landed ship; it matters for what the landing can see." />
            </div>
          )}
        </section>
      </div>
    </aside>
  )
}
