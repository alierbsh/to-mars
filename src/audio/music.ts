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
/** how far the track may stray from where it should be before it is moved: once playing (and
 * only when MusicDriver says the mission keeps the default pace), and when it starts */
const DRIFT_S = 1
const START_S = 0.15
/** under DRIFT_S it is brought back by playing a little faster or slower (pitch kept): at most
 * this share, a quarter of the gap per second */
const NUDGE = 0.06
/** the events that let a page start sound (keydown, a mouse press, the end of a touch) */
const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'keydown'] as const

class Music {
  /** the listener's switch */
  on = true
  private el: HTMLAudioElement | null = null
  /** the mission is running with its music (the countdown, or playing), and where the track should be */
  private running = false
  private target = 0
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
    this.apply(false)
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
   * mission is running with its music, where the track should be, and whether to hold it there
   * while it plays (the default pace, or just after a jump) or let it run on.
   */
  drive(running: boolean, target: number, hold: boolean) {
    this.running = running
    this.target = target
    this.apply(hold)
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

  private apply(hold: boolean, gesture = false) {
    if (!this.audible()) {
      this.stop()
      return
    }
    const el = this.element()
    const ahead = el.currentTime - this.target
    if (!el.paused) {
      if (hold && Math.abs(ahead) > DRIFT_S) {
        el.currentTime = this.target
        el.playbackRate = 1
      } else el.playbackRate = hold && Math.abs(ahead) > 0.05 ? 1 - Math.max(-NUDGE, Math.min(NUDGE, ahead * 0.25)) : 1
      this.fadeTo(VOLUME, FADE_IN_MS)
      return
    }
    // refused once, it waits for a click or a key rather than asking again every tick
    if (this.waiting && !gesture) return
    el.playbackRate = 1
    if (Math.abs(ahead) > START_S) el.currentTime = this.target
    el.play().then(
      () => {
        this.stopWaiting()
        // (it may no longer be wanted by the time the browser has started it)
        if (this.audible()) this.fadeTo(VOLUME, FADE_IN_MS)
        else this.stop()
      },
      (e: unknown) => {
        // refused without a click: try again on the next one (anything else — a missing file — gives up)
        if (e instanceof DOMException && e.name === 'NotAllowedError') this.waitForGesture()
      },
    )
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

  private retry = () => this.apply(true, true)

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
