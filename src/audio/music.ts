/**
 * The background music: one track (public/music/back.mp3), only through a Starship mission that
 * ends well — from the countdown on, while the mission plays (MusicDriver says when). On by
 * default; the top bar's switch turns it off and is remembered. An <audio> element streams the
 * track (decoded whole it would take ~100 MB) and loops it; its volume fades in and out where the
 * browser lets a page set it (iOS does not: there it starts and stops). Browsers start sound only
 * after a click: the launch button primes the element, and when a start is refused (a deep link
 * that plays on its own) the next click or key starts it.
 */
const SRC = `${import.meta.env.BASE_URL}music/back.mp3`
/** the old sound switch's key: who turned the site's sound off keeps it off */
const KEY = 'occupy-mars:muted'
const VOLUME = 0.7
/** a full fade, in ms; the volume moves in steps */
const FADE_MS = 1600
const STEP_MS = 50
/** the events that let a page start sound (keydown, a mouse press, the end of a touch) */
const GESTURES = ['pointerdown', 'pointerup', 'touchend', 'keydown'] as const

class Music {
  /** the listener's switch */
  on = true
  private el: HTMLAudioElement | null = null
  /** the mission has music and is playing now */
  private wanted = false
  /** the mission it is wanted for, and the one it last played for: a new mission starts from the top */
  private key: string | null = null
  private playedFor: string | null = null
  private timer: number | null = null
  private waiting = false
  private listeners = new Set<() => void>()

  constructor() {
    try {
      this.on = localStorage.getItem(KEY) !== '1'
    } catch {
      /* storage blocked: on */
    }
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => this.update())
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
      localStorage.setItem(KEY, on ? '0' : '1')
    } catch {
      /* not remembered */
    }
    this.listeners.forEach((fn) => fn())
    this.update()
  }

  /** inside a click (the launch button): play the element silently for a moment, so that starting
   * it later, once the physics says the mission ends well, is allowed (iOS asks this of each element) */
  prime() {
    if (!this.on) return
    const el = this.element()
    if (!el.paused) return
    el.muted = true
    el.play().then(
      () => {
        if (!this.wanted) el.pause()
        el.muted = false
      },
      () => {
        el.muted = false
      },
    )
  }

  /** whether the music should play now, and for which mission */
  set(wanted: boolean, key: string) {
    this.wanted = wanted
    this.key = key
    this.update()
  }

  private element() {
    if (!this.el) {
      const el = new Audio()
      el.src = SRC
      el.loop = true
      el.preload = 'auto'
      el.volume = 0
      this.el = el
    }
    return this.el
  }

  private update() {
    if (this.wanted && this.on && document.visibilityState !== 'hidden') this.start()
    else this.stop()
  }

  private start() {
    const el = this.element()
    if (this.playedFor !== this.key) {
      el.currentTime = 0
      this.playedFor = this.key
    }
    if (!el.paused) {
      this.fadeTo(VOLUME)
      return
    }
    el.volume = 0
    el.play().then(
      () => {
        this.stopWaiting()
        this.update() // (it may no longer be wanted by the time the browser has started it)
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
    this.fadeTo(0, () => el.pause())
  }

  /** move the volume to `target` over a share of FADE_MS, by the clock (a busy or background page
   * runs its timers late) */
  private fadeTo(target: number, done?: () => void) {
    const el = this.el
    if (!el) return
    if (this.timer !== null) window.clearInterval(this.timer)
    const from = el.volume
    const ms = (Math.abs(target - from) / VOLUME) * FADE_MS
    const t0 = performance.now()
    const finish = () => {
      if (this.timer !== null) window.clearInterval(this.timer)
      this.timer = null
      done?.()
    }
    if (ms < 1) {
      finish()
      return
    }
    this.timer = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms)
      el.volume = from + (target - from) * k
      // (where the volume cannot be set it never moves — iOS: finish at once)
      if (k >= 1 || el.volume === from) finish()
    }, STEP_MS)
  }

  private retry = () => this.update()

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
