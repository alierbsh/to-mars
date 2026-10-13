/**
 * The sound of the mission, synthesised (no samples to license): the roar of a sea-level engine
 * cluster as filtered noise with a sub-bass rumble and the crackle of large rockets (random
 * bursts through a resonant band), rising through engine start, thinning with the air as the
 * vehicle climbs until space goes silent; the hiss of plasma at Mars entry; the muffled roar of
 * the landing burn in the thin Martian air; the thud of touchdown or the boom of an impact.
 * Everything is driven per frame from the mission state. The context is created on the first
 * click (browsers' autoplay rules); a mute switch is remembered.
 */
import type { PlumeKind } from '../scene/Plume'

const KEY = 'occupy-mars:muted'

interface Voice {
  roar: GainNode
  roarLp: BiquadFilterNode
  roarBp: BiquadFilterNode
  rumble: GainNode
  rumbleOsc: OscillatorNode
  sub: OscillatorNode
  hiss: GainNode
  hissHp: BiquadFilterNode
  crackle: GainNode
}

export interface SoundParams {
  /** 0–1 thrust of what is firing, sea-level equivalent (after air thinning and distance) */
  roar: number
  /** 0–1 crackle density (big engines close by) */
  crackle: number
  /** roar colour: 0 = deep (F-1, Raptor cluster) … 1 = bright (small engines) */
  bright: number
  /** low-pass cutoff factor 0–1 (1 = open; the thin Martian air muffles) */
  open: number
  /** 0–1 plasma hiss (entry) */
  hiss: number
  /** 0–1 wind / air rush */
  rush: number
}

class SoundEngine {
  ctx: AudioContext | null = null
  master: GainNode | null = null
  voice: Voice | null = null
  muted = false
  private lastBurst = 0
  private noise: AudioBuffer | null = null
  private burst: AudioBuffer | null = null
  private cur: SoundParams = { roar: 0, crackle: 0, bright: 0.3, open: 1, hiss: 0, rush: 0 }
  private thudAt = -1

  constructor() {
    try {
      this.muted = localStorage.getItem(KEY) === '1'
    } catch {
      /* private mode */
    }
  }

  /** create (or resume) the context — call from a click handler */
  enable() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.muted ? 0 : 1
      this.master.connect(this.ctx.destination)
      this.build()
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  setMuted(m: boolean) {
    this.muted = m
    try {
      localStorage.setItem(KEY, m ? '1' : '0')
    } catch {
      /* ignore */
    }
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.05)
  }

  private makeNoise(seconds: number, brown: boolean): AudioBuffer {
    const ctx = this.ctx!
    const n = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(2, n, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c)
      let last = 0
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1
        if (brown) {
          last = (last + 0.02 * w) / 1.02
          d[i] = last * 3.5
        } else d[i] = w
      }
    }
    return buf
  }

  private build() {
    const ctx = this.ctx!
    const master = this.master!
    this.noise = this.makeNoise(4, true)
    // a short crackle burst: a few ms of noise with a sharp attack
    this.burst = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate)
    {
      const d = this.burst.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.25))
    }
    // the roar: brown noise → low-pass (the mass of it) + band-pass (the tearing mid)
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    src.loop = true
    src.start()
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 400
    lp.Q.value = 0.7
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 900
    bp.Q.value = 0.8
    const shaper = ctx.createWaveShaper()
    const curve = new Float32Array(1024)
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1
      curve[i] = Math.tanh(x * 2.2)
    }
    shaper.curve = curve
    const roar = ctx.createGain()
    roar.gain.value = 0
    src.connect(lp)
    src.connect(bp)
    lp.connect(shaper)
    bp.connect(shaper)
    shaper.connect(roar)
    roar.connect(master)
    // the rumble: sub-bass with a slow wobble
    const rumbleOsc = ctx.createOscillator()
    rumbleOsc.type = 'sawtooth'
    rumbleOsc.frequency.value = 31
    const sub = ctx.createOscillator()
    sub.type = 'sine'
    sub.frequency.value = 19
    const rumbleLp = ctx.createBiquadFilter()
    rumbleLp.type = 'lowpass'
    rumbleLp.frequency.value = 70
    const rumble = ctx.createGain()
    rumble.gain.value = 0
    rumbleOsc.connect(rumbleLp)
    sub.connect(rumbleLp)
    rumbleLp.connect(rumble)
    rumble.connect(master)
    rumbleOsc.start()
    sub.start()
    // the hiss: white-ish noise through a high-pass
    const hsrc = ctx.createBufferSource()
    hsrc.buffer = this.makeNoise(3, false)
    hsrc.loop = true
    hsrc.start()
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 1800
    const hiss = ctx.createGain()
    hiss.gain.value = 0
    hsrc.connect(hp)
    hp.connect(hiss)
    hiss.connect(master)
    // crackle bursts go through their own gain
    const crackle = ctx.createGain()
    crackle.gain.value = 0
    const cbp = ctx.createBiquadFilter()
    cbp.type = 'bandpass'
    cbp.frequency.value = 650
    cbp.Q.value = 1.2
    cbp.connect(crackle)
    crackle.connect(master)
    this.voice = { roar, roarLp: lp, roarBp: bp, rumble, rumbleOsc, sub, hiss, hissHp: hp, crackle }
    ;(this.voice as Voice & { cbp: BiquadFilterNode }).cbp = cbp
  }

  /** per-frame update */
  update(p: SoundParams, dt: number) {
    if (!this.ctx || !this.voice) return
    const ctx = this.ctx
    const v = this.voice
    const now = ctx.currentTime
    // smooth the parameters a little so frames don't click
    const k = 1 - Math.exp(-dt * 10)
    this.cur.roar += (p.roar - this.cur.roar) * k
    this.cur.crackle += (p.crackle - this.cur.crackle) * k
    this.cur.bright += (p.bright - this.cur.bright) * k
    this.cur.open += (p.open - this.cur.open) * k
    this.cur.hiss += (p.hiss - this.cur.hiss) * k
    this.cur.rush += (p.rush - this.cur.rush) * k
    const c = this.cur
    const T = 0.04
    v.roar.gain.setTargetAtTime(0.9 * c.roar, now, T)
    v.roarLp.frequency.setTargetAtTime((220 + 900 * c.bright) * (0.25 + 0.75 * c.open), now, T)
    v.roarBp.frequency.setTargetAtTime((700 + 1600 * c.bright) * (0.3 + 0.7 * c.open), now, T)
    v.rumble.gain.setTargetAtTime(0.5 * c.roar * (1 - 0.5 * c.bright) * (0.6 + 0.4 * (0.5 + 0.5 * Math.sin(now * 2.3) * Math.sin(now * 3.7))), now, T)
    v.hiss.gain.setTargetAtTime(0.35 * c.hiss + 0.12 * c.rush, now, T)
    v.hissHp.frequency.setTargetAtTime(1500 + 2500 * c.hiss, now, T)
    v.crackle.gain.setTargetAtTime(1.2 * c.crackle, now, T)
    // crackle: random bursts, denser with the parameter
    if (c.crackle > 0.02 && this.burst) {
      const rate = 6 + 30 * c.crackle // bursts per second
      if (now - this.lastBurst > 1 / rate * (0.5 + Math.random())) {
        this.lastBurst = now
        const b = ctx.createBufferSource()
        b.buffer = this.burst
        b.playbackRate.value = 0.6 + Math.random() * 1.2
        const g = ctx.createGain()
        g.gain.value = 0.4 + Math.random() * 0.8
        b.connect(g)
        g.connect((v as Voice & { cbp: BiquadFilterNode }).cbp)
        b.start()
      }
    }
  }

  /** one-off: touchdown thud or impact boom */
  thud(strength = 1, boom = false) {
    if (!this.ctx || !this.noise) return
    const ctx = this.ctx
    if (ctx.currentTime - this.thudAt < 0.5) return
    this.thudAt = ctx.currentTime
    const b = ctx.createBufferSource()
    b.buffer = this.noise
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = boom ? 160 : 90
    const g = ctx.createGain()
    const now = ctx.currentTime
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(Math.min(1.5, 1.2 * strength), now + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, now + (boom ? 2.5 : 0.9))
    b.connect(lp)
    lp.connect(g)
    g.connect(this.master!)
    b.start(now, Math.random() * 2)
    b.stop(now + 3)
  }
}

export const sound = new SoundEngine()

/** the roar's colour per propellant: kerosene and methane clusters are deep; hydrogen engines whine */
export function brightnessFor(kind: PlumeKind): number {
  return kind === 'hydrolox' ? 0.75 : kind === 'solid' ? 0.45 : kind === 'hypergolic' ? 0.6 : 0.25
}
