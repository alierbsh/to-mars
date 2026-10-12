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

export default function Sidebar() {
  const config = useAppStore((s) => s.config)
  const setConfig = useAppStore((s) => s.setConfig)
  const vehicle = VEHICLES.find((v) => v.id === config.vehicleId)!
  const isShip = vehicle.refuelable
  const crewed = vehicle.spacecraft.crewCapacity > 0
  const dayMs = 86_400_000
  const depMs = new Date(config.departure + 'T00:00:00Z').getTime()
  const nearest = WINDOWS.reduce((best, w) => (Math.abs(new Date(w.departure + 'T00:00:00Z').getTime() - depMs) < Math.abs(new Date(best.departure + 'T00:00:00Z').getTime() - depMs) ? w : best), WINDOWS[0])
  const shiftDays = Math.round((depMs - new Date(nearest.departure + 'T00:00:00Z').getTime()) / dayMs)
  const windowId = Math.abs(shiftDays) <= 60 ? nearest.id : undefined

  return (
    <aside className="sidebar">
      <section className="group">
        <h2 className="group__title">Rocket</h2>
        <ul className="vehicles">
          {VEHICLES.map((v) => (
            <li key={v.id}>
              <button className={`vehicle ${v.id === config.vehicleId ? 'vehicle--selected' : ''}`} onClick={() => setConfig({ vehicleId: v.id, crew: Math.min(config.crew, Math.max(v.spacecraft.crewCapacity, 0)) || config.crew })}>
                <span className="vehicle__head">
                  <span className="vehicle__name">{v.name}</span>
                  <span className={`status status--${v.status}`}>{v.badge}</span>
                </span>
                <span className="vehicle__tagline">{v.tagline}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="group">
        <h2 className="group__title">Departure</h2>
        <div className="chips">
          {WINDOWS.map((w) => (
            <button key={w.id} className={`chip ${windowId === w.id ? 'chip--on' : ''}`} onClick={() => setConfig({ departure: w.departure, transitDays: w.transitDays })} title={w.note}>
              {w.label}
            </button>
          ))}
        </div>
        <p className="group__note">{windowId ? nearest.note : `Custom departure ${config.departure}`}</p>
        <Slider label="Transit time" value={config.transitDays} min={120} max={400} step={2} unit="days" onChange={(v) => setConfig({ transitDays: v })} note="Shorter transits cost departure Δv and arrive faster — hotter entry, more g." />
        <Slider label="Departure shift" value={shiftDays} min={-60} max={60} step={2} unit="days" onChange={(v) => {
          const d = new Date(nearest.departure + 'T00:00:00Z')
          d.setUTCDate(d.getUTCDate() + v)
          setConfig({ departure: d.toISOString().slice(0, 10) })
        }} format={(v) => `${v >= 0 ? '+' : ''}${v} d · ${config.departure}`} />
      </section>

      <section className="group">
        <h2 className="group__title">Crew & payload</h2>
        {crewed ? (
          <Slider label="Crew" value={Math.min(config.crew, vehicle.spacecraft.crewCapacity)} min={1} max={vehicle.spacecraft.crewCapacity} step={1} onChange={(v) => setConfig({ crew: v })} note={`${vehicle.spacecraft.name}: up to ${vehicle.spacecraft.crewCapacity}, ${vehicle.spacecraft.lifeSupportDays > 0 ? `${vehicle.spacecraft.lifeSupportDays} days of life support` : 'life support sized from consumables'}`} />
        ) : (
          <p className="group__note">No crew vehicle exists for this rocket. It flies a {vehicle.spacecraft.name.toLowerCase()}.</p>
        )}
        {isShip && (
          <>
            <Slider label="Crew systems" value={config.crewSystems / 1000} min={5} max={60} step={1} unit="t" onChange={(v) => setConfig({ crewSystems: v * 1000 })} note="Cabin, ECLSS hardware, storm shelter. NASA transit-habitat studies: 25–45 t." />
            <Slider label="Cargo" value={config.cargo / 1000} min={0} max={100} step={1} unit="t" onChange={(v) => setConfig({ cargo: v * 1000 })} />
            <Slider label="Consumables margin" value={config.consumablesMargin * 100} min={0} max={100} step={5} unit="%" onChange={(v) => setConfig({ consumablesMargin: v / 100 })} />
            <Slider label="Water recovery" value={config.waterRecovery * 100} min={0} max={99} step={1} unit="%" onChange={(v) => setConfig({ waterRecovery: v / 100 })} note="ISS today: 98 % water, ~50 % oxygen." />
            <Slider label="Oxygen recovery" value={config.oxygenRecovery * 100} min={0} max={95} step={5} unit="%" onChange={(v) => setConfig({ oxygenRecovery: v / 100 })} />
          </>
        )}
      </section>

      {isShip && (
        <section className="group">
          <h2 className="group__title">What has to be true</h2>
          <p className="group__note">The verdict hinges on four unmeasured numbers. Pick a set, then drag.</p>
          <div className="chips">
            {PRESETS.map((p) => (
              <button key={p.id} className="chip" onClick={() => setConfig(p.patch)} title={p.blurb}>
                {p.name}
              </button>
            ))}
          </div>
          <Slider label="Tankers available" value={config.tankers} min={0} max={20} step={1} onChange={(v) => setConfig({ tankers: v })} note="Only as many as the mission needs are launched." />
          <Slider label="Propellant per tanker" value={config.propPerTanker / 1000} min={50} max={250} step={10} unit="t" onChange={(v) => setConfig({ propPerTanker: v * 1000 })} note="Claims: 100–150 t (V3), 200+ t (V4). Demonstrated: 0." />
          <Slider label="Days between tankers" value={config.tankerCadenceDays} min={2} max={60} step={1} onChange={(v) => setConfig({ tankerCadenceDays: v })} note="2026 cadence: one Starship every ~60 days." />
          <Slider label="Boil-off" value={config.boiloffPerDay * 100} min={0} max={1} step={0.01} unit="%/day" onChange={(v) => setConfig({ boiloffPerDay: v / 100 })} note="Depot studies: 0.05–0.1 %/day with insulation; no Starship measurement exists." format={(v) => `${v.toFixed(2)} %/day`} />
          <Slider label="Ship dry mass" value={(config.shipDryMass ?? 140_000) / 1000} min={90} max={200} step={5} unit="t" onChange={(v) => setConfig({ shipDryMass: v * 1000 })} note="Unpublished. Musk 2021 target ~100 t; V2 performance implies much more." />
          <Slider label="Booster dry mass" value={(config.boosterDryMass ?? 250_000) / 1000} min={180} max={320} step={5} unit="t" onChange={(v) => setConfig({ boosterDryMass: v * 1000 })} />
          <label className="check">
            <input type="checkbox" checked={config.expendable} onChange={(e) => setConfig({ expendable: e.target.checked })} /> Expend the booster (no boost-back reserve)
          </label>
        </section>
      )}

      <section className="group">
        <h2 className="group__title">Mars arrival</h2>
        <Slider label="Entry angle" value={config.entryFpaDeg} min={-20} max={-6} step={0.5} unit="°" onChange={(v) => setConfig({ entryFpaDeg: v })} note="Shallow skips out; steep piles on g and heat. Robotic landers used −11.5° to −17°." />
        <Slider label="Atmospheric density" value={config.densityScale * 100} min={50} max={150} step={5} unit="%" onChange={(v) => setConfig({ densityScale: v / 100 })} note="Mars-GRAM 3σ at 50–80 km is about ±50 % (season, dust)." />
        <Slider label="Heating margin" value={config.heatingMargin} min={1} max={3} step={0.1} unit="×" onChange={(v) => setConfig({ heatingMargin: v })} note="Stagnation-point formula underpredicts peak heating on large blunt bodies by 2–4× (MSL)." format={(v) => `${v.toFixed(1)}×`} />
        <Slider label="Crew g-limit" value={config.gLimit} min={3} max={8} step={0.5} unit="g" onChange={(v) => setConfig({ gLimit: v })} note="4 g sustained is the NASA tolerance for a deconditioned crew; aerocapture studies use 5 g." />
        <label className="check">
          <input type="checkbox" checked={config.autoBank} onChange={(e) => setConfig({ autoBank: e.target.checked })} /> Bank modulation (lift up, then neutral after pull-out)
        </label>
      </section>
    </aside>
  )
}
