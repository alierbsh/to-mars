import { useState } from 'react'
import { VEHICLES } from '../data/vehicles'
import { LANGS, useT } from '../i18n'
import { detectQuality, saveQuality } from '../scene/quality'
import { PRESETS } from '../sim/presets'
import { WINDOWS } from '../sim/transfer'
import { useAppStore } from '../state/store'
import { LangList } from './LangPicker'
import { presetTexts, vehicleTexts, windowTexts } from './texts'

function Slider({ label, value, min, max, step, unit, onChange, note, format }: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void; note?: string; format?: (v: number) => string }) {
  const L = useT()
  return (
    <label className="field">
      <span className="field__row">
        <span className="field__label">{label}</span>
        <span className="field__value">{format ? format(value) : L.ui.settings.value({ v: value, unit: unit ?? '' })}</span>
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

/** Mission settings: the graphics tier first, then the rocket, the window, the crew, and the assumptions that decide the verdict. Everything else is behind "Advanced". */
export default function MissionDrawer() {
  const L = useT()
  const S = L.ui.settings
  const config = useAppStore((s) => s.config)
  const setConfig = useAppStore((s) => s.setConfig)
  const open = useAppStore((s) => s.drawer === 'mission')
  const setDrawer = useAppStore((s) => s.setDrawer)
  const setIntro = useAppStore((s) => s.setIntro)
  const setPlaying = useAppStore((s) => s.setPlaying)
  const quality = useAppStore((s) => s.quality)
  const qualityPinned = useAppStore((s) => s.qualityPinned)
  const setQuality = useAppStore((s) => s.setQuality)
  const [advanced, setAdvanced] = useState(false)
  const vehicle = VEHICLES.find((v) => v.id === config.vehicleId)!
  const vt = vehicleTexts(vehicle.id, L)
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
        <p className="label">{S.title}</p>
        <button className="drawer__close" onClick={() => setDrawer('mission')} aria-label={S.close}>
          ×
        </button>
      </div>
      <div className="drawer__body">
        <section className="section">
          <p className="label">{S.graphics}</p>
          <div className="chips">
            {(['auto', 'high', 'medium', 'low'] as const).map((id) => (
              <button
                key={id}
                className={`chip ${(id === 'auto' ? !qualityPinned : qualityPinned && quality === id) ? 'chip--on' : ''}`}
                onClick={() => {
                  if (id === 'auto') {
                    saveQuality(null)
                    setQuality(detectQuality(), false)
                  } else setQuality(id, true)
                }}
              >
                {S.quality[id]}
              </button>
            ))}
          </div>
          <p className="hint">{S.qualityNow({ q: S.quality[quality], auto: !qualityPinned })}</p>
        </section>
        {LANGS.length > 1 && (
          <section className="section">
            <p className="label">{L.ui.lang.label}</p>
            <LangList className="langlist--chips" />
          </section>
        )}
        <section className="section">
          <p className="label">{S.rocket}</p>
          <div className="vehicle vehicle--on vehicle--fixed">
            <span className="vehicle__name">{vt.name}</span>
            <span className="vehicle__meta">{vt.badge}</span>
            <span className="vehicle__tagline">{vt.tagline}</span>
          </div>
          <p className="hint">{S.rocketHint}</p>
          <button
            className="chip"
            onClick={() => {
              setPlaying(false)
              setDrawer('mission')
              setIntro('pick')
            }}
          >
            {S.newMission}
          </button>
        </section>

        <section className="section">
          <p className="label">{S.departure}</p>
          <div className="chips">
            {WINDOWS.map((w) => (
              <button key={w.id} className={`chip ${windowId === w.id ? 'chip--on' : ''}`} onClick={() => setConfig({ departure: w.departure, transitDays: w.transitDays })} title={windowTexts(w.id, L).note}>
                {windowTexts(w.id, L).label}
              </button>
            ))}
          </div>
          <p className="hint">{windowId ? windowTexts(nearest.id, L).note : S.customDeparture({ date: L.n.date(config.departure) })}</p>
          <Slider label={S.transit} value={config.transitDays} min={120} max={400} step={2} unit={S.days} onChange={(v) => setConfig({ transitDays: v })} />
        </section>

        <section className="section">
          <p className="label">{S.crew}</p>
          {crewed ? (
            <Slider label={S.peopleAboard} value={Math.min(config.crew, vehicle.spacecraft.crewCapacity)} min={1} max={vehicle.spacecraft.crewCapacity} step={1} onChange={(v) => setConfig({ crew: v })} note={S.crewNote({ sc: vt.spacecraft, max: vehicle.spacecraft.crewCapacity, days: vehicle.spacecraft.lifeSupportDays })} />
          ) : (
            <p className="hint">{S.noCrew({ sc: vt.spacecraft })}</p>
          )}
        </section>

        {isShip && (
          <section className="section">
            <p className="label">{S.assumptions}</p>
            <p className="hint">{S.assumptionsHint}</p>
            <div className="presets">
              {PRESETS.map((p) => (
                <button key={p.id} className={`preset ${activePreset?.id === p.id ? 'preset--on' : ''}`} onClick={() => setConfig(p.patch)}>
                  <span className="preset__name">{presetTexts(p.id, L).name}</span>
                  <span className="preset__blurb">{presetTexts(p.id, L).blurb}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="section">
          <button className="disclosure" onClick={() => setAdvanced(!advanced)} aria-expanded={advanced}>
            <span className="label">{S.advanced}</span>
            <span className={`disclosure__chev ${advanced ? 'disclosure__chev--open' : ''}`} aria-hidden="true" />
          </button>
          {advanced && (
            <div className="advanced">
              <Slider label={S.shift} value={shiftDays} min={-60} max={60} step={2} unit={S.days} onChange={(v) => {
                const d = new Date(nearest.departure + 'T00:00:00Z')
                d.setUTCDate(d.getUTCDate() + v)
                setConfig({ departure: d.toISOString().slice(0, 10) })
              }} format={(v) => S.shiftValue({ d: v, date: L.n.date(config.departure) })} />
              {isShip && (
                <>
                  <p className="label label--sub">{S.ship}</p>
                  <Slider label={S.crewSystems} value={config.crewSystems / 1000} min={5} max={60} step={1} unit="t" onChange={(v) => setConfig({ crewSystems: v * 1000 })} note={S.crewSystemsNote} />
                  <Slider label={S.cargo} value={config.cargo / 1000} min={0} max={100} step={1} unit="t" onChange={(v) => setConfig({ cargo: v * 1000 })} />
                  <Slider label={S.consumables} value={config.consumablesMargin * 100} min={0} max={100} step={5} unit="%" onChange={(v) => setConfig({ consumablesMargin: v / 100 })} />
                  <Slider label={S.water} value={config.waterRecovery * 100} min={0} max={99} step={1} unit="%" onChange={(v) => setConfig({ waterRecovery: v / 100 })} note={S.waterNote} />
                  <Slider label={S.oxygen} value={config.oxygenRecovery * 100} min={0} max={95} step={5} unit="%" onChange={(v) => setConfig({ oxygenRecovery: v / 100 })} />
                  <Slider label={S.shipDry} value={(config.shipDryMass ?? 140_000) / 1000} min={90} max={200} step={5} unit="t" onChange={(v) => setConfig({ shipDryMass: v * 1000 })} note={S.shipDryNote} />
                  <Slider label={S.boosterDry} value={(config.boosterDryMass ?? 250_000) / 1000} min={180} max={320} step={5} unit="t" onChange={(v) => setConfig({ boosterDryMass: v * 1000 })} />
                  <Toggle label={S.expend} checked={config.expendable} onChange={(v) => setConfig({ expendable: v })} />
                  <p className="label label--sub">{S.refuelling}</p>
                  <Slider label={S.tankers} value={config.tankers} min={0} max={20} step={1} onChange={(v) => setConfig({ tankers: v })} note={S.tankersNote} />
                  <Slider label={S.perTanker} value={config.propPerTanker / 1000} min={50} max={250} step={10} unit="t" onChange={(v) => setConfig({ propPerTanker: v * 1000 })} note={S.perTankerNote} />
                  <Slider label={S.cadence} value={config.tankerCadenceDays} min={2} max={60} step={1} onChange={(v) => setConfig({ tankerCadenceDays: v })} note={S.cadenceNote} />
                  <Slider label={S.boiloff} value={config.boiloffPerDay * 100} min={0} max={1} step={0.01} onChange={(v) => setConfig({ boiloffPerDay: v / 100 })} note={S.boiloffNote} format={(v) => S.boiloffValue({ v })} />
                </>
              )}
              <p className="label label--sub">{S.arrival}</p>
              <Slider label={S.fpa} value={config.entryFpaDeg} min={-20} max={-6} step={0.5} unit="°" onChange={(v) => setConfig({ entryFpaDeg: v })} note={S.fpaNote} />
              <Slider label={S.density} value={config.densityScale * 100} min={50} max={150} step={5} unit="%" onChange={(v) => setConfig({ densityScale: v / 100 })} note={S.densityNote} />
              <Slider label={S.heating} value={config.heatingMargin} min={1} max={3} step={0.1} onChange={(v) => setConfig({ heatingMargin: v })} note={S.heatingNote} format={(v) => S.heatingValue({ v })} />
              <Slider label={S.gLimit} value={config.gLimit} min={3} max={8} step={0.5} unit="g" onChange={(v) => setConfig({ gLimit: v })} note={S.gLimitNote} />
              <Toggle label={S.bank} checked={config.autoBank} onChange={(v) => setConfig({ autoBank: v })} />
              <p className="label label--sub">{S.weather}</p>
              <div className="chips">
                {(['random', 'none', 'regional', 'global'] as const).map((id) => (
                  <button key={id} className={`chip ${config.dustStorm === id ? 'chip--on' : ''}`} onClick={() => setConfig({ dustStorm: id })}>
                    {S.storms[id]}
                  </button>
                ))}
              </div>
              <p className="hint">{S.weatherHint}</p>
              <Slider label={S.wind} value={config.surfaceWind} min={0} max={30} step={1} unit="m/s" onChange={(v) => setConfig({ surfaceWind: v })} note={S.windNote} />
            </div>
          )}
        </section>

      </div>
    </aside>
  )
}
