/**
 * The background music: one track (public/music/back.mp3), made on the default Starship flight —
 * from the countdown's 5 to the touchdown, its swells on the rocket's moments — and played only
 * through a Starship mission that ends well. MusicDriver drives it with where the track should be
 * (musicClock: the mission time as the default flight reaches it), so it always stands where it
 * would have been playing all along: the switch, a pause, a hidden tab or a jump in the timeline
 * only decide whether it is heard, never where it resumes. It does not loop: it ends with the
 * landing.
 *
 * An <audio> element streams it (decoded whole it would take ~100 MB); its volume fades by the
 * clock where the browser lets a page set it (iOS does not: it starts and stops). On by default;
 * the top bar's switch turns it off, remembered. Browsers start sound only after a click: the
 * launch button primes the element (the track opens in silence), and a start the browser refuses
 * waits for the next click or key.
 */
const SRC = `${import.meta.env.BASE_URL}music/back.mp3`
/** the switch's own key ('off' once turned off): on for everyone at first — the old sound
 * switch's choice ('occupy-mars:muted') does not carry over */
const KEY = 'occupy-mars:music'
const VOLUME = 0.7
/** fades, ms: in, and out (a pause or the switch) */
const FADE_IN_MS = 600
const FADE_OUT_MS = 350
const STEP_MS = 40
/** how far the track may stray from where it should be before it is moved, s: once playing (only
 * while MusicDriver holds it to the mission) — rarely needed, as the mission keeps real time while
 * the track plays (keepsTime) — and when it starts or the mission jumps. Never by playing faster or
 * slower: on a phone that warbles, and a phone's coarse clock would keep it changing. */
const DRIFT_S = 2
const START_S = 0.15
/** within what is already loaded a move costs no fetch: then a smaller stray is put right, s */
const NEAR_S = 0.75
/** after the track is moved it is left alone this long, ms (a phone fetches the new place over the
 * network: measured at once, it would look late and be moved again, and again) */
const SETTLE_MS = 4000
/** the events that let a page start sound (keydown, a mouse press, the end of a touch) */
const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'keydown'] as const

type Mode = 'free' | 'hold' | 'jump'

class Music {
  /** the listener's switch */
  on = true
  private el: HTMLAudioElement | null = null
  /** the mission is running with its music (the countdown, or playing), and where the track should be */
  private running = false
  private target = 0
  private mode: Mode = 'free'
  /** when the target was given (performance.now) */
  private targetAt = 0
  /** when the track was last moved or started (performance.now) */
  private moved = -Infinity
  private timer: number | null = null
  /** where the running fade is going */
  private fading = -1
  private waiting = false
  private listeners = new Set<() => void>()

  constructor() {
    try {
      this.on = localStorage.getItem(KEY) !== 'off'
    } catch {
      /* storage blocked: on */
    }
    if (typeof document !== 'undefined')
      document.addEventListener('visibilitychange', () => {
        // hidden, the mission stops too; back, the next drive() starts it where the mission is then
        if (document.visibilityState === 'hidden') this.stop()
      })
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  setOn(on: boolean) {
    this.on = on
    try {
      localStorage.setItem(KEY, on ? 'on' : 'off')
    } catch {
      /* not remembered */
    }
    this.listeners.forEach((fn) => fn())
    this.apply()
  }

  /** inside a click (the launch button): start the element (the track opens in silence) so that
   * starting it later is allowed — iOS asks this of each element */
  prime() {
    if (!this.on) return
    const el = this.element()
    if (!el.paused) return
    el.play().then(
      () => {
        if (!this.audible()) el.pause()
      },
      () => {},
    )
  }

  /**
   * Where things stand, from MusicDriver (a few times a second and on every change): whether the
   * mission is running with its music, where the track should be, and how closely to keep it there
   * while it plays — 'hold' at the start speed, 'jump' when the mission has just jumped (a seek, a
   * restart), 'free' at another speed (it runs on by itself).
   */
  drive(running: boolean, target: number, mode: Mode) {
    this.running = running
    this.target = target
    this.targetAt = performance.now()
    this.mode = mode
    this.apply()
  }

  /** the track is playing, held to the mission: the mission should keep real time through a stall
   * (Playback lifts its cap on a frame's step) so the two stay together without moving the track */
  keepsTime() {
    return !!this.el && !this.el.paused && this.mode !== 'free' && this.audible()
  }

  private element() {
    if (!this.el) {
      const el = new Audio()
      el.src = SRC
      el.preload = 'auto'
      el.volume = 0
      this.el = el
    }
    return this.el
  }

  private audible() {
    const end = this.el && Number.isFinite(this.el.duration) ? this.el.duration : Infinity
    return this.running && this.on && document.visibilityState !== 'hidden' && this.target < end - 0.05
  }

  private apply(gesture = false) {
    if (!this.audible()) {
      this.stop()
      return
    }
    const el = this.element()
    const now = performance.now()
    const want = this.expected(now)
    const off = Math.abs(el.currentTime - want)
    if (!el.paused) {
      if (
        (this.mode === 'jump' && off > START_S) ||
        (this.mode === 'hold' && ((off > NEAR_S && this.loaded(el, want)) || (off > DRIFT_S && now - this.moved > SETTLE_MS)))
      )
        this.seek(el, want, now)
      this.fadeTo(VOLUME, FADE_IN_MS)
      return
    }
    // refused once, it waits for a click or a key rather than asking again every tick
    if (this.waiting && !gesture) return
    if (off > START_S) this.seek(el, want, now)
    else this.moved = now
    el.play().then(
      () => {
        this.stopWaiting()
        // (it may no longer be wanted by the time the browser has started it)
        if (!this.audible()) {
          this.stop()
          return
        }
        // the start took time (a phone fetches the place over the network): the mission has moved
        // on — catch up once, now that the place is loaded and a move costs nothing
        const at = performance.now()
        const late = this.expected(at) - el.currentTime
        if (this.mode !== 'free' && late > 0.25 && this.loaded(el, this.expected(at))) this.seek(el, this.expected(at), at)
        this.fadeTo(VOLUME, FADE_IN_MS)
      },
      (e: unknown) => {
        // refused without a click: try again on the next one (anything else — a missing file — gives up)
        if (e instanceof DOMException && e.name === 'NotAllowedError') this.waitForGesture()
      },
    )
  }

  /** where the track should be now: the last target, moved on by the time since while the mission
   * runs at the start speed (the target comes a few times a second; a start takes a while) */
  private expected(now: number) {
    return this.target + (this.running && this.mode !== 'free' ? (now - this.targetAt) / 1000 : 0)
  }

  /** the track is loaded around `t` (a move there costs no fetch) */
  private loaded(el: HTMLAudioElement, t: number) {
    const b = el.buffered
    for (let i = 0; i < b.length; i++) if (t >= b.start(i) && t + 1 <= b.end(i)) return true
    return false
  }

  private seek(el: HTMLAudioElement, t: number, now: number) {
    this.moved = now
    try {
      el.currentTime = t
    } catch {
      /* (an old WebKit refuses before the file's length is known: it starts where it is) */
    }
  }

  private stop() {
    const el = this.el
    if (!el || el.paused) return
    this.fadeTo(0, FADE_OUT_MS, () => el.pause())
  }

  /** move the volume to `target` over a share of `full` ms, by the clock (a busy or background
   * page runs its timers late) */
  private fadeTo(target: number, full: number, done?: () => void) {
    const el = this.el
    if (!el) return
    // a fade already on its way there goes on (drive() asks again every tick)
    if (this.timer !== null && this.fading === target) return
    if (this.timer !== null) window.clearInterval(this.timer)
    this.timer = null
    this.fading = target
    const from = el.volume
    const ms = (Math.abs(target - from) / VOLUME) * full
    if (ms < 1) {
      done?.()
      return
    }
    const t0 = performance.now()
    this.timer = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms)
      el.volume = from + (target - from) * k
      // (where the volume cannot be set it never moves — iOS: finish at once)
      if (k >= 1 || el.volume === from) {
        if (this.timer !== null) window.clearInterval(this.timer)
        this.timer = null
        done?.()
      }
    }, STEP_MS)
  }

  private retry = () => this.apply(true)

  private waitForGesture() {
    if (this.waiting) return
    this.waiting = true
    for (const g of GESTURES) window.addEventListener(g, this.retry, { capture: true })
  }

  private stopWaiting() {
    if (!this.waiting) return
    this.waiting = false
    for (const g of GESTURES) window.removeEventListener(g, this.retry, { capture: true })
  }
}

export const music = new Music()
