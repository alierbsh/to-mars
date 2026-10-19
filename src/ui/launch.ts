/** How a mission starts — shared by the opening (Intro) and the music, which counts from the countdown's 5. */

/** the clock's speed a mission starts at (the orbit and the cruise; liftoff and the moments that
 * matter still play in real time) — the lower third's buttons change it in flight */
export const SPEED = 10

/** the countdown: 5 … 1 a second apart, then "Ignition", and liftoff `igniteMs` later */
export const COUNTDOWN = { from: 5, tickMs: 1000, igniteMs: 900 }

/** from the countdown's first number to liftoff, in seconds */
export const COUNTDOWN_S = (COUNTDOWN.from * COUNTDOWN.tickMs + COUNTDOWN.igniteMs) / 1000
