# Crewed Earth-to-Mars Mission Design: Delta-v, Mass, Human-Factor and Success Budgets (vehicle-independent)

Scope: the mission-design side of a crewed Mars mission, compiled so a simulation can test whether a given launch vehicle "reaches Mars with a crew". All values SI; every value carries its assumptions (parking-orbit altitude, window year, orbit shape). Values I derived from formulas are labelled **(derived)** and kept in the Inferences subsections.

Core formulas used throughout (standard two-body astrodynamics; see Braeunig and the NASA handbook for derivations):

- Characteristic energy: `C3 = v_inf^2` (km²/s²).
- Departure burn from a circular parking orbit of radius r: `dv_TMI = sqrt(C3 + 2*mu/r) - sqrt(mu/r)` with `mu_Earth = 398 600 km³/s²`. (Braeunig: "from a parking orbit the injection dv is simply the injection velocity minus the orbital velocity".)
- Capture into an orbit with periapsis rp and semi-major axis a, burn at periapsis: `dv_MOI = sqrt(v_inf^2 + 2*mu/rp) - sqrt(mu*(2/rp - 1/a))`, `mu_Mars = 42 828 km³/s²`. Same formula gives TEI from that orbit.
- Atmospheric-interface (entry) speed: `V_entry = sqrt(v_inf^2 + 2*mu/r_entry)`, r_entry = planet radius + ~125 km.
- Rocket equation: `m0/mf = exp(dv / (g0*Isp))`.
- Synodic period: `T_syn = 1/(1/T_Earth - 1/T_Mars)`.
- Hohmann time of flight: `TOF = pi*sqrt(a^3/mu_Sun)`, `a = (r1+r2)/2`.
- Boil-off: `m(t) = m0*(1 - r)^t`, r = fractional loss per day.

---

## Key Question 1: Launch windows and trajectories (synodic period, window dates, C3, transit times, fast transfers, conjunction vs opposition class)

### Takeaway
Windows recur every 779.9 days; NASA's Glenn handbook gives the minimum departure C3 for every window 2026–2045 (7.8–14.8 km²/s²), with 2033 the cheapest and 2037 the most expensive of the set. Ideal Hohmann transit is 259 days; crewed designs use 174–225-day "fast conjunction" transits, and the 80–150-day transits SpaceX has advertised require C3 roughly 3–5x the minimum plus Mars arrival speeds of 6–7.5 km/s. Conjunction-class (long-stay) missions total ~900–950 days; opposition-class (short-stay, Venus flyby) ~570 days.

### Cited Findings

**Synodic period and the 15-year cycle**
- Synodic period of Mars relative to Earth is "779.935 Earth days (approximately 2.14 years)", `T_syn = 2*pi/(omega_E - omega_M)`; Earth and Mars return to nearly the same relative positions "every 7 to 8 synodic periods, or every 15 to 17 years" — [NASA/TM-2010-216764, Interplanetary Mission Design Handbook: Earth-to-Mars Mission Opportunities 2026 to 2045 (Burke, Falck, McGuire, NASA GRC, Oct 2010)](https://ntrs.nasa.gov/api/citations/20100037210/downloads/20100037210.pdf)
- Minimum-energy windows occur "approximately two years and two months (specifically 780 days ...)" apart; the lowest available transfer energy varies on a roughly 16-year cycle (minima 1969/1971 and 1986/1988) — [Wikipedia: Exploration of Mars](https://en.wikipedia.org/wiki/Exploration_of_Mars)
- DRA 5.0: opportunities occur about every 2.1 years in a 15-year synodic cycle; exact trajectory repetition takes 79 years — [NASA-SP-2009-566, Mars DRA 5.0 (2009)](https://www.nasa.gov/wp-content/uploads/2015/09/373665main_nasa-sp-2009-566.pdf)
- Easiest (low-energy) windows need about half the energy of the peaks; the last low-energy window was 2023 — [Wikipedia: Human mission to Mars](https://en.wikipedia.org/wiki/Human_mission_to_Mars)

**Window months (calendar) for upcoming opportunities**
- 2026: Nov–Dec (MMX, Impulse/Relativity lander, ESCAPADE); 2028/29: Dec–Jan (Rosalind Franklin, Tianwen-3); 2031: Feb–Apr; 2033: Apr–May; 2035: May–Jul; 2037: Jul–Sep; 2039: Sep–Oct; 2041/42: Oct–Dec; 2043/44: Dec–Jan; 2046: Jan–Mar — [Wikipedia: Exploration of Mars](https://en.wikipedia.org/wiki/Exploration_of_Mars)
- SpaceX (May 2025): "the next Mars transfer window is November through December 2026", recurring every 26 months — [Spectrum News, 4 Jun 2025](https://mynews13.com/fl/orlando/space/2025/06/04/elon-musk-shares-how-starship-will-get-to-mars)

**Minimum departure C3 and arrival v_inf per opportunity (ballistic, conjunction-class, 407 km circular parking orbit, Mars arrival modelled as flyby, 2-day date grid)** — all from [NASA/TM-2010-216764 Tables 1–11](https://ntrs.nasa.gov/api/citations/20100037210/downloads/20100037210.pdf). TOF is derived from the printed launch/arrival dates.

| Opportunity | Min C3 (km²/s²) | Type | Launch → Arrival (min-C3 row) | TOF (d) | Mars arrival v_inf (km/s) |
|---|---|---|---|---|---|
| 2026 | 9.144 | II | 2026-10-31 → 2027-08-19 | 292 | 2.729 |
| 2026 (Type I row) | 11.11 | I | 2026-11-14 → 2027-08-09 | 268 | 2.915 |
| 2028 | 8.928 | II | 2028-12-02 → 2029-10-16 | 318 | 3.261 |
| 2028 (Type I row) | 9.048 | I | 2028-12-10 → 2029-07-20 | 222 | 4.892 |
| 2031 | 8.237 | II | 2031-02-23 → 2032-01-09 | 320 | 5.53 |
| 2031 (Type I row) | 9.00 | I | 2031-01-28 → 2031-08-06 | 190 | 5.541 |
| 2031 (low-v_inf rows) | 17.89 (I) / 12.48 (II) | | 2031-03-01 → 2031-09-27 / 2030-12-13 → 2031-09-25 | 210 / 285 | 3.777 / 3.445 |
| 2033 | 7.781 | II | 2033-04-28 → 2034-01-27 | 274 | 4.377 |
| 2033 (Type I row) | 8.412 | I | 2033-04-06 → 2033-10-01 | 178 | 3.956 |
| 2033 (low-v_inf row) | 9.266 | I | 2033-04-20 → 2033-11-06 | 200 | 3.311 |
| 2035 | 10.19 | I | 2035-04-21 → 2035-11-03 | 196 | 2.692 |  ← date likely mis-transcribed; the simulation's Lambert scan reproduces C3 10.19 / v_inf 2.69 at 2035-06-22 → 2036-01-06 (198 d)
| 2037 | 14.84 | II | 2037-06-18 → 2038-07-19 | 396 | 3.356 |
| 2039 | 12.17 | II | 2039-07-15 → 2040-07-09 | 360 | 2.701 |
| 2041 | 9.818 | II | 2041-10-19 → 2042-08-31 | 316 | 2.49 |
| 2043 | 8.969 | II | 2043-11-15 → 2044-09-16 | 306 | 2.793 |
| 2045/46 | 8.587 | II | 2046-01-22 → 2046-12-18 | 330 | 5.119 |

- The handbook states 2033 requires the least departure energy of the set; the high 2035 Type II value is because arrival approaches Mars aphelion (linked to the 2018 opportunity ~17 years earlier). Departure-energy plots extend to 50 km²/s²; the plotted TOF range is 100–450 days; up to two deep-space maneuvers were analysed (DSM contours 0–5 km/s) — [NASA/TM-2010-216764](https://ntrs.nasa.gov/api/citations/20100037210/downloads/20100037210.pdf)
- Launch-site constraint used: Cape Canaveral latitude 28.45°, launch azimuth 40°–115° — same source.

**Hohmann-class and crewed-class transit times**
- Hohmann outbound "consumes between 8 and 9 months"; a 2020-window Type-I example has TOF ≈ 207 days; Braeunig's TMI/MOI tables cover 180–230-day flights — [Braeunig, Rocket & Space Technology: Interplanetary Flight](http://www.braeunig.us/space/interpl.htm)
- Hohmann transit listed as 8.5 months — [Wikipedia: Delta-v budget](https://en.wikipedia.org/wiki/Delta-v_budget)
- Hohmann transfer to Mars takes 250 days (0.68 yr) — [Wikipedia: Free-return trajectory](https://en.wikipedia.org/wiki/Free-return_trajectory)
- DRA 5.0 crewed transits: ~180 days out, ~180 back (range 175–225 days by date); cargo ~350 days (minimum-energy cargo flight 202 days in 2035); example 2037 mission: 174 d out, 539 d stay, 201 d back, 914 d total (depart 2037-08-27, arrive 2038-02-17); 2035 case 180 d reducible to ~140 d; 2043 aerocapture case 240 d — [NASA-SP-2009-566](https://www.nasa.gov/wp-content/uploads/2015/09/373665main_nasa-sp-2009-566.pdf)
- Zubrin/Weaver (1993) piloted transfers at departure C3 = 25 km²/s²: 113 days (2003) to 190 days (2011), average ~160 days; Mars→Earth at C3 = 16 km²/s² — [Zubrin & Weaver, "Practical Methods for Near-Term Piloted Mars Missions" (1993)](https://marspapers.org/paper/Zubrin_1993_2.pdf)
- Mars Direct: 6-month cruises each way, 18-month surface stay, habitat launched 26 months after the ERV — [Wikipedia: Mars Direct](https://en.wikipedia.org/wiki/Mars_Direct)

**Fast transfers and their penalty**
- SpaceX IAC 2016: "journeys would have required 80 to 150 days of transit time", averaging ~115 days across nine synodic periods 2024–2041 — [Wikipedia: SpaceX Mars colonization program](https://en.wikipedia.org/wiki/SpaceX_Mars_colonization_program)
- Free-return comparison table: Hohmann 250-day transfer, total dv 3.34 km/s, abort return 1.5 yr; Zubrin 180-day transfer, dv 5.08 km/s, 2-year free return; 130-day transfer needs 7.93 km/s and gives a 4-year free return; DRA 5.0 advocates a 174-day transfer with TMI ≈ 4 km/s — [Wikipedia: Free-return trajectory](https://en.wikipedia.org/wiki/Free-return_trajectory)
- Braeunig 2020-window tables (200 km parking orbit): TMI 3808 m/s (190–195-day flight) up to 4386 m/s (180-day flight launched late); MOI into 1000 × 33 000 km orbit 799–1371 m/s; "TMI and MOI dv are generally inversely related"; a 1 % error in injection velocity gives ~15 % error in v_inf — [Braeunig](http://www.braeunig.us/space/interpl.htm)
- Ultra-fast 2031 round trips (academic preprint, Oct 2025): 33-day outbound needs C3 ≈ 488 km²/s² (v_inf 22.1 km/s, Mars arrival v_inf 26.3 km/s); 56-day outbound needs C3 ≈ 285 km²/s² (v_inf 16.9, Mars arrival 16.6 km/s) — not achievable with chemical propulsion per the authors; New Horizons C3 was ≈ 165 km²/s² for comparison — [Preprints.org 202510.1072](https://www.preprints.org/manuscript/202510.1072/v1)
- Nuclear (NTP/NEP) transits are quoted as 45–90 days — [Universe Today, 2033 study summary](https://www.universetoday.com/160753/2033-is-the-perfect-year-to-send-humans-to-mars-with-a-bonus-venus-flyby/)

**Conjunction vs opposition class**
- Conjunction (Hohmann) class: ~9 months out, ~500 days (16 months) at Mars, ~9 months back, ~34 months total; opposition-class round trips 400–450 days (< 15 months) at significantly higher energy; a 245-day round trip is possible only with on-orbit staging — [Wikipedia: Human mission to Mars](https://en.wikipedia.org/wiki/Human_mission_to_Mars)
- DRA 5.0 baseline is conjunction class: 500–540-day stay, 900–914-day total, "fast transits" — [NASA-SP-2009-566](https://www.nasa.gov/wp-content/uploads/2015/09/373665main_nasa-sp-2009-566.pdf)
- JPL 2033 opposition-class orbital mission (Price, Shishko, Mrozinski, Woolley, J. Spacecraft & Rockets DOI 10.2514/1.A35437): TMI April 2033, ~200 d outbound arriving Nov 2033, ~30 d in Mars orbit, ~340 d return including a Venus flyby, ~570 d (1.6 yr) total; conjunction alternative from the same window ~950 d with a 550-d stay; the Venus–Earth–Mars alignment enabling this recurs ~every 15 years; campaign needs 4 SLS + 13 commercial launches, ~1020.5 t combined payload — [Universe Today](https://www.universetoday.com/160753/2033-is-the-perfect-year-to-send-humans-to-mars-with-a-bonus-venus-flyby/)

### Inferences
- **(derived)** Hohmann ideal (circular coplanar 1.000 / 1.5237 AU): departure v_inf 2.945 km/s (C3 8.67 km²/s²), arrival v_inf 2.65 km/s, TOF 258.9 days; synodic period from sidereal years 779.95 days. These match the handbook's 779.935 d and the ~259-day textbook figure.
- **(derived)** The handbook's minimum-C3 windows sit at 7.8–14.8 km²/s², i.e. within ~0–70 % of the Hohmann C3 — the "window year" effect on departure energy is modest. The large year-to-year difference is at **arrival**: 2031 and 2033 minimum-C3 solutions arrive at 4.4–5.5 km/s v_inf versus 2.5–2.9 km/s in 2026/2035/2039/2041, which doubles capture dv and raises entry speed by ~1–2 km/s (see KQ2). A simulation must therefore treat departure C3 and arrival v_inf as a pair per launch/arrival date, not as a single "window cost".
- Fast-transfer rule of thumb from the cited cases: going from ~250 d to 180 d raises total dv by ~1.7 km/s (3.34 → 5.08); to 130 d by ~4.6 km/s (→ 7.93). The "80–150 day" SpaceX figure therefore implies C3 in the ~25–60 km²/s² class on the Earth side **and** arrival v_inf of ~5–7 km/s, which is why SpaceX relies on aerodynamic capture/entry rather than propulsive MOI.
- A simulation can model window dates as: departure 160-day span centred on the handbook minima (handbook plots cover 160 days of departure), arrival 400-day span.

### Gaps
- The handbook gives only ballistic (flyby) minima; it does not print a table of optimised deep-space-maneuver solutions, nor Mars→Earth return C3 per opportunity. Return-leg (TEI) v_inf by year was not found in a citable table; DRA 5.0 only shows plots (axis range 0–4.5 km/s) and names 2037 as worst-case TMI and 2030 as largest MOI.
- No primary SpaceX source for a specific C3 or arrival speed behind the "80–150 day" claim was retrievable (the New Space 2018 transcript is paywalled; spacex.com returned no body text).
- The dates in the handbook are for a 407 km parking orbit and a 90° (polar) parking inclination default with no plane-change dv; a real 28.5° LEO departure may add declination-dependent penalties the handbook does not quantify.

---

## Key Question 2: Delta-v budget per leg from LEO (TMI, MCC, MOI/aerocapture, EDL, ascent, TEI, Earth entry)

### Takeaway
Reference values: TMI 3.5–4.4 km/s from LEO (3.6 Hohmann-minimum, ~4.0–4.3 for 180-day crewed transits), propulsive MOI 0.8–2.0 km/s depending on arrival v_inf and target orbit (near zero with aerocapture, plus ~0.1 km/s periapsis raise), landing 0.5–1 km/s after aerodynamic deceleration, Mars ascent ~4.1 km/s to LMO (5–5.5 km/s in Zubrin's MAV with losses), TEI 0.8–2 km/s from a 1-sol orbit (1.7 km/s in Mars Direct), Earth entry 11.5–12.6 km/s (DRA caps at 12 km/s for Orion-class TPS). Mars entry speeds run 5.5–7.5 km/s (human architectures assume < 9.1 km/s).

### Cited Findings

**Reference delta-v tables**
- Classic solar-system dv map values: LEO → Mars transfer orbit 4.3 km/s ("typical", not minimal); Hohmann from LEO 3.6 km/s (2.9 km/s heliocentric, 11.3 km/s exiting LEO); Mars transfer → Mars capture orbit 0.9; capture orbit → low Mars orbit 1.4; transfer → LMO 2.7 (not minimal); LMO ↔ Mars surface 4.1 km/s (black numbers apply in either direction, i.e. also the ascent value); Earth surface → LEO ≈ 9.4 km/s (7.8 orbital + 1.5–2 km/s gravity/drag losses); Earth-Moon L2 → Mars transfer < 1.0 km/s; the page notes the Hohmann figures only reach Mars's orbital distance and that aerocapture or extra dv is needed to enter Mars orbit — [Wikipedia: Delta-v budget](https://en.wikipedia.org/wiki/Delta-v_budget)
- Braeunig 2020 window, 200 km circular parking orbit: TMI 3808–4386 m/s for 180–230-day flights; MOI into a 1000 × 33 000 km orbit 799–1371 m/s; example filter "TMI ≤ 3900 m/s and MOI ≤ 900 m/s" defines the feasible launch dates — [Braeunig](http://www.braeunig.us/space/interpl.htm)
- Zubrin & Weaver 1993 (chemical, aerobraking baseline): TMI 4.15 km/s cargo (C3 ≈ 16) and 4.6 km/s piloted (C3 ≈ 25), both including 5 % gravity loss; propulsive Mars capture alternative 1.6 km/s; post-aerocapture periapsis raise 0.1 km/s; landing 500 m/s (after aerobrake); TEI 1.7 km/s; departure from Mars parking orbit 1.73 km/s; MAV ascent 5.5 km/s expendable / 5.0 km/s reusable (with losses); aerobrake mass 15 % of decelerated mass; Mars entry ≈ 7 km/s for a 5 km/s hyperbolic approach; Earth entry 12.44 km/s for a 6 km/s approach — [Zubrin & Weaver 1993](https://marspapers.org/paper/Zubrin_1993_2.pdf)
- Free-return comparison: total dv 3.34 km/s (Hohmann, 250 d), 5.08 km/s (180 d), 7.93 km/s (130 d); DRA 5.0 174-day transfer at TMI ≈ 4 km/s; Mars entry corridor limited to < 9 km/s with flight-path-angle tolerance ~ ±0.5°; in some years a 2-year free return needs an extra 0.6–2.7 km/s kick at Mars — [Wikipedia: Free-return trajectory](https://en.wikipedia.org/wiki/Free-return_trajectory)

**DRA 5.0 (NASA reference architecture) leg assumptions**
- Departure from a 407 km circular Earth orbit; Mars capture into a 1-sol orbit of 250 km × 33 793 km; aerocapture for uncrewed cargo, propulsive capture for crew elements — [NASA-SP-2009-566](https://www.nasa.gov/wp-content/uploads/2015/09/373665main_nasa-sp-2009-566.pdf); [DRA 5.0 slides Jan 2009](https://ntrs.nasa.gov/api/citations/20090012109/downloads/20090012109.pdf)
- Crewed NTR MTV burn times: TMI 57.8 min, MOI 16 min, TEI 10.7 min (84.5 min total) with three 111 kN (25 klbf) engines at Isp 875–950 s; round-trip usable LH2 191.7 t; cargo TMI burn 39 min with ~91 t LH2 — [NASA-SP-2009-566 via NTRS](https://ntrs.nasa.gov/api/citations/20090040343/downloads/20090040343.pdf)
- Orion service module ~300 m/s for re-targeting and entry-corridor setup; Earth return entry speed limited to < 12 km/s to keep TPS "within Orion family" (lunar CEV 11 km/s) — [DRA 5.0 slides](https://ntrs.nasa.gov/api/citations/20090012109/downloads/20090012109.pdf); [NASA-SP-2009-566](https://ntrs.nasa.gov/api/citations/20090040343/downloads/20090040343.pdf)
- Descent engines: LOX/CH4, Isp 369 s, O/F 3.5, chamber pressure 600 psi, area ratio 200; aerocapture peak heating 462 W/cm² — [NASA-SP-2009-566](https://ntrs.nasa.gov/api/citations/20090040343/downloads/20090040343.pdf)

**Entry speeds (Mars and Earth)**
- Robotic Mars entry speeds: Viking 4.7 km/s (from orbit), Pathfinder 7.26, MER 5.4/5.5, Phoenix 5.67, MSL 6 km/s (planned) — [Braun & Manning 2007, Table 1](https://corpora.tika.apache.org/base/docs/govdocs1/095/095306.pdf); MSL actual atmospheric-interface speed ≈ 5.8 km/s — [Wikipedia: Mars Science Laboratory](https://en.wikipedia.org/wiki/Mars_Science_Laboratory)
- Human architectures: "Mars entry velocities under 9.1 km/s, a likely condition for most human Mars exploration architectures"; 8.5 km/s used as an aerocapture example — [Braun & Manning 2007](https://corpora.tika.apache.org/base/docs/govdocs1/095/095306.pdf)
- Aerocapture deceleration limit for crews: 5 g (scientific consensus); 24 of 93 reviewed Mars studies used aerocapture — [Wikipedia: Human mission to Mars](https://en.wikipedia.org/wiki/Human_mission_to_Mars)
- Earth return: DRA 12 km/s cap; Zubrin 12.44 km/s at v_inf 6 km/s — sources above.

### Inferences
- **(derived)** TMI dv from a 407 km circular orbit for the handbook minimum C3 values: 2026 3.59 km/s; 2028 3.58; 2031 3.55; 2033 3.53; 2035 3.64; 2037 3.84; 2039 3.72. From 200 km the same C3 costs ~0.04 km/s more. Faster-transfer anchors: C3 16 → 3.89; C3 25 → 4.27; C3 30 → 4.48; C3 40 → 4.89; C3 50 → 5.28; C3 60 → 5.66 km/s. These bracket the "3.6–4.3 km/s" conventional range (and the 4.6 km/s Zubrin figure includes 5 % gravity loss). Add 2–5 % for finite-burn/gravity losses with low-thrust NTR or long chemical burns (DRA's crewed TMI burn is 57.8 min).
- **(derived)** Propulsive MOI into the DRA 1-sol orbit (250 × 33 793 km) vs arrival v_inf: 2.5 km/s → 0.83; 2.7 → 0.92; 3.0 → 1.08; 3.5 → 1.35; 4.0 → 1.66; 4.5 → 1.99; 5.5 → 2.71 km/s. Into a 400 km circular LMO: 2.0–3.9 km/s over the same range (consistent with Wikipedia's 2.7 "typical"). Braeunig's 1000 × 33 000 km orbit: 0.90–2.88 km/s. So "MOI 0.9–2.0 km/s" holds for v_inf 2.5–4.5 km/s into a high-apoapsis orbit; it breaks for the 2031/2033 minimum-C3 arrivals (v_inf 5.5) unless aerocapture is used.
- **(derived)** Mars entry speed at 125 km vs v_inf: 2.5 → 5.53; 3.0 → 5.77; 3.5 → 6.05; 4.4 → 6.6; 5.0 → 7.02; 5.5 → 7.39; 6.0 → 7.77; 7.0 → 8.56 km/s. So the 5.5–7.5 km/s span quoted for crewed entry corresponds to v_inf ≈ 2.5–5.6 km/s, and the 9.1 km/s Braun–Manning ceiling corresponds to v_inf ≈ 7.6 km/s.
- **(derived)** Earth entry speed at 125 km vs return v_inf: 2.5 → 11.35; 3.0 → 11.47; 4.0 → 11.77; 5.0 → 12.15; 6.0 → 12.59; 7.0 → 13.10; 8.0 → 13.66 km/s. DRA's 12 km/s cap therefore allows return v_inf ≤ ~4.6 km/s; Zubrin's 12.44 km/s at v_inf 6 implies a lower entry-interface altitude convention than 125 km.
- **(derived)** TEI from the 1-sol orbit equals the MOI numbers above for the same v_inf (0.8–2.0 km/s for v_inf 2.5–4.5), matching Mars Direct's 1.7 km/s and the "1.5–2.5 km/s" conventional range (the upper end is from lower orbits or faster returns).
- **(derived)** Ideal impulsive Mars ascent (surface → 400 km circular, no rotation credit, no losses) is 3.74 km/s; equatorial rotation credit 0.24 km/s; adding gravity/drag/steering losses gives the ~4.1 km/s quoted by the dv map and the 5.0–5.5 km/s Zubrin budgets for a lossy MAV. A Starship-class vehicle returning direct to Earth from the surface needs ascent + TEI ≈ 4.1 + (escape from LMO ~1.4) + v_inf term, i.e. roughly 6.5–7.5 km/s single stage — consistent with Mars Direct's 5.5 ascent + 1.7 TEI = 7.2 km/s split across stages.
- Landing dv after aerodynamic deceleration: Zubrin 0.5 km/s (legged lander after aerobrake); MSL/Perseverance handover at ~100 m/s at 1.8 km altitude — for a Starship-class vehicle the propulsive terminal phase is typically budgeted at ~0.5–1 km/s including gravity losses and hover; no primary SpaceX figure was found (gap).
- Mid-course corrections are not itemised in any fetched source; DRA 5.0 budgets 5.2 t RCS propellant per cargo vehicle and Orion ~300 m/s for Earth-return retargeting. A simulation can allocate ~50–100 m/s per leg for MCC/TCM plus ~0.1 km/s periapsis raise after aerocapture (Zubrin).

### Gaps
- No single primary table of TMI/MOI/TEI by opportunity year for 2026–2045 exists in the fetched sources; DRA 5.0 Figure 4-2 has the curves but the text gives no values. The derived anchors above substitute for it.
- Propulsive landing dv for a 100-t-class vehicle after hypersonic/supersonic retropropulsion is not published by SpaceX; only Zubrin's 0.5 km/s (small lander) and MSL-class terminal speeds are citable.

---

## Key Question 3: Mass budget (DRA 5.0, Mars Direct, SpaceX, consumables per crew-day, shielding, power, minimum landed mass)

### Takeaway
NASA DRA 5.0 needs ~849 t IMLEO (NTR option: two 246.2 t cargo stacks + 356.4 t crewed stack) to land two ~40 t payloads (DAV 63.7 t and SHAB 64.2 t landers, 106–107 t each with aeroshell) and fly a 41.3 t transit habitat for 6 crew; Mars Direct lands ~25–36 t habitats and a 15–20 t ERV/MAV using 4–8 t of imported hydrogen to make 36–112 t of CH4/O2. Consumables run ~0.82 kg O2, ~4.35 kg total water (2.0 drinking), 1.5–2.4 kg food per crew-day before recycling.

### Cited Findings

**NASA Mars DRA 5.0 (6 crew, NTR baseline)**
- Cargo vehicle IMLEO 246.2 t each; cargo payload (aeroshell + EDL + descent stage + surface payload) 103 t; NTR stage launch mass 96.6 t; crewed Mars Transfer Vehicle IMLEO 356.4 t (96.7 m long), launched as 106.2 t, 91.4 t, 96 t and 62.8 t components; max payload delivered to surface by a cargo element ≈ 40 t; LH2 tank capacities 59.4 t (core stage) and 34.1 t (in-line); Earth-return CEV sizing 10 t crew module + 4 t service module; commuter habitat ~21.5 t with 12.1 kWe — [NASA-SP-2009-566 (NTRS copy)](https://ntrs.nasa.gov/api/citations/20090040343/downloads/20090040343.pdf)
- Element masses: DAV lander 63.7 t (106.6 t with aeroshell); SHAB lander 64.2 t (107.0 t with aeroshell); MTV transit habitat 41.3 t; Orion 10.0 t; NTR vehicles 238.1 t (DAV and SHAB stacks) and 283.4 t (MTV stack); Ares V to LEO 130.8 t (jettisoned shroud) or 83.6 t payload + 50.0 t dual-use shroud; landed payload ~40 t; required surface payload 40–50 t; required TMI mass capability 110–125 t; round-trip cargo to/from Mars orbit ~50 t; 7+ Ares V launches per mission on 30-day centres; 10 m × 30 m aeroshell/shroud — [DRA 5.0 slides, 15 Jan 2009](https://ntrs.nasa.gov/api/citations/20090012109/downloads/20090012109.pdf)
- Ares V gross liftoff mass ≈ 3323 t; gross payloads 126.5 t (dual-use shroud) / 120.0 t (standard); net payload reduced 8–10 % for adapters/margins; dual-use aeroshell structure ≈ 40 t; human-class landed payloads 30–50 t; NTR: 5 Ares V over 120 days for cargo + 4 over 90 days for crew; chemical option 7 launches for two cargo vehicles + 5 for the crew vehicle — [NASA-SP-2009-566](https://www.nasa.gov/wp-content/uploads/2015/09/373665main_nasa-sp-2009-566.pdf)
- Transit habitat supports 6 crew for 400 days plus 550 contingency days in Mars orbit; surface habitat supports up to 550 days; Orion dormant 900 days — [DRA 5.0 slides](https://ntrs.nasa.gov/api/citations/20090012109/downloads/20090012109.pdf)
- ISRU: 24 t O2 for ascent, 2 t O2 for life support, 3.5 t water; ISRU cuts lander mass 30 %; 400 kg hydrogen brought from Earth; methane fuel imported; two ISRU plants for redundancy; 30 kWe fission surface power (scaled from a 40 kWe lunar design) placed 1 km from the lander — [DRA 5.0 slides](https://ntrs.nasa.gov/api/citations/20090012109/downloads/20090012109.pdf); [NASA-SP-2009-566](https://ntrs.nasa.gov/api/citations/20090040343/downloads/20090040343.pdf)

**Mars Direct / Semi-Direct (Zubrin)**
- Mars Direct: Ares launcher puts 121 t into a 300 km orbit and boosts 47 t toward Mars; ERV carries 8 t of hydrogen; surface chemistry yields up to 112 t CH4/O2, 96 t needed for the return trip; only 7 % of return propellant carried from Earth; ~10 months to produce; crew 4; habitat aerobrakes — [Wikipedia: Mars Direct](https://en.wikipedia.org/wiki/Mars_Direct)
- Semi-Direct (Zubrin & Weaver 1993): HLV 120 t to LEO (200 t to 300 km in the Table 1 variant); TMI payloads 72 t cargo / 60 t piloted; Transfer-and-Surface Hab 36.5 t (surface hab 30.0 t); ERV hab 15.0 t, ERV hab + MAV 20.0 t; hab primary structure < 1 t for 200 m³ (4 crew); 4.0 t LH2 → 36 t CH4/O2 + 18 t water; 24 t CH4/O2 for ascent + 12 t for rovers; Mars Direct yields CH4/O2 equal to 18x the imported hydrogen; power 2 × 6 kWe DIPS per lander, 48 kWe base total; ISRU needs ~15 kWe (Semi-Direct) / ~50 kWe (Mars Direct); food cache for 4 years, 800-day hab food supply covers a 2-year free return — [Zubrin & Weaver 1993](https://marspapers.org/paper/Zubrin_1993_2.pdf)

**SpaceX Starship (claims, not demonstrated)**
- Tanker designed to carry ~100 t of propellant to LEO (2016); HLS needs "approximately ten tanker launches" to a depot before a lunar landing — [Wikipedia: Orbital propellant depot](https://en.wikipedia.org/wiki/Orbital_propellant_depot); [Wikipedia: Starship Propellant Transfer Demonstration](https://en.wikipedia.org/wiki/Starship_Propellant_Transfer_Demonstration)
- Planned cadence (Musk, 29 May 2025): 2026/27 window ~50 % chance; then ~20 missions in 2028/29, 100 in 2030/31, up to 500 by 2033; Sept 2024: five uncrewed Starships planned for 2026; 9 Feb 2026: Musk announced a 5–7-year delay to focus on lunar missions (as reported by Wikipedia; treat as reported, not verified here) — [Wikipedia: SpaceX Mars colonization program](https://en.wikipedia.org/wiki/SpaceX_Mars_colonization_program)
- Musk (May 2025): first uncrewed Starship to Mars 2026, Optimus robot 2027, first humans "by 2028", lead landing site Arcadia region, orbital refilling still to be worked out — [Spectrum News](https://mynews13.com/fl/orlando/space/2025/06/04/elon-musk-shares-how-starship-will-get-to-mars)

**Life-support consumables per crew-member-day (BVAD-derived; Anderson et al. 2018 BVAD values as reproduced in a 2024 review)** — [Frontiers in Space Technologies 2024](https://www.frontiersin.org/journals/space-technologies/articles/10.3389/frspt.2024.1461389/full)

| Item | kg per crew-member-day | Note |
|---|---|---|
| O2 consumed | 0.818 | BVAD (Anderson 2018) |
| CO2 produced | 1.040 | |
| Total water required | 4.350 | = drinking 2.000 + food rehydration 0.500 + medical 0.050 + hygiene 0.400 + urinal flush 0.300 + water in food 0.700 + metabolic water 0.400 |
| Urine | 1.200 (1.500 incl. flush) | 85 % recovery assumed in UPA |
| Food, packaged as shipped | 1.830 (2002 study) / 2.390 (2017 study) | |
| Food consumed, unpackaged | 1.510 | packaging waste 0.260, food adhered to packaging 0.100 |
| Clothing | 0.206–1.690 | study-dependent |
| Hygiene supplies | 0.781 | |
| Cabin air leakage | 0.272 kg/day per crew member | NASA 2021 |

- BVAD defaults: values not given per capita assume a crew of four; the daily mass balance is drawn for an 82 kg astronaut; power-mass penalty example 87.1 kg/kWe (100 kWe nuclear plant, 8708 kg) — [NASA BVAD 2022 (NASA/TP-2015-218570/REV2)](https://ntrs.nasa.gov/api/citations/20210024855/downloads/BVAD_2.15.22-final.pdf)
- Zubrin's 1993 consumables table (per person-day): O2 1.0 kg, dry food 0.5 kg, whole food 1.0 kg, potable water 4.0 kg, wash water 26.0 kg; without ISRU/recycling consumables rise from 9 t to 22 t for the mission — [Zubrin & Weaver 1993](https://marspapers.org/paper/Zubrin_1993_2.pdf)
- Mars habitat breathing-mix concept 40 % Ar / 40 % N2 / 20 % O2; bone-loss models predict 33 % of astronauts at risk of osteoporosis — [Wikipedia: Human mission to Mars](https://en.wikipedia.org/wiki/Human_mission_to_Mars)

**Radiation shielding and power masses**
- Zubrin: solar-flare shelter is a 2 m airlock shielded by stored consumables; regolith shielding not counted; surface dose ≈ 1/4 of interplanetary — [Zubrin & Weaver 1993](https://marspapers.org/paper/Zubrin_1993_2.pdf)
- DRA 5.0: 30 kWe fission reactor at 1 km standoff, crew dose guideline < 5 rem/yr (50 mSv/yr) from the reactor — [NASA-SP-2009-566](https://ntrs.nasa.gov/api/citations/20090040343/downloads/20090040343.pdf)
- BVAD power-mass penalty 87.1 kg/kWe for a 100 kWe nuclear plant — [BVAD 2022](https://ntrs.nasa.gov/api/citations/20210024855/downloads/BVAD_2.15.22-final.pdf)

### Inferences
- **(derived)** DRA 5.0 IMLEO = 2 × 246.2 + 356.4 = 848.8 t ≈ the "850 t" figure commonly quoted; the chemical/aerocapture alternative needs 12 launches (7 + 5) vs 9 (5 + 4) for NTR, implying ~1200–1250 t IMLEO at ~100 t/launch (the exact chemical IMLEO was not in the fetched text).
- Landed-mass convergence: NASA-style architectures land ~40 t per lander (DAV/SHAB, 106–107 t entry mass each), Mars Direct ~25–36 t habitats plus a 15–20 t ERV/MAV; i.e. "tens of tonnes per landing" with 2–3 landings per crew mission. A 100 t-per-ship architecture is 2.5x the largest NASA reference lander and ~100x the largest actual landing (Perseverance 1.0 t rover / ~3.5 t entry vehicle, KQ6).
- **(derived)** Open-loop consumables for 6 crew × 900 days at BVAD rates: O2 4.4 t, water 23.5 t, packaged food 9.9–12.9 t (~38–41 t total); with ISS-class closure (98 % water, 50–75 % O2) water drops to ~0.5 t resupply-equivalent and O2 to 1.1–2.2 t, leaving food (~10–13 t) as the dominant consumable — matching DRA's "2 t O2 for life support + 3.5 t water from ISRU" and Zubrin's 9 t vs 22 t comparison.
- Zubrin's 1.0 kg O2 and 4.0 kg potable water per day are conservative relative to BVAD (0.818 / 2.5 drinking+prep); a simulation should use BVAD nominal and Zubrin as the margin case.

### Gaps
- The original Mars Direct (Zubrin & Baker 1990) element masses (commonly quoted ERV ≈ 28 t, hab ≈ 25 t landed) were not confirmed in any fetched source; Wikipedia gives only the 47 t TMI payload, and the 1993 paper's "28 t" is an enlarged later-evolution ERV. Mark as unverified.
- SpaceX's "100–150 t landed per Starship" and the crew-ship vs cargo-ship split were not retrievable from a primary source in this session (paywalled transcript, scripted spacex.com page); only the tanker ~100 t and HLS ~10-tanker figures are citable.
- BVAD habitable-volume minima, ECLSS hardware mass per crew and metabolic heat were in sections the fetch could not reach (the PDF text truncated at ~100k characters).
- No source gave a radiation-shielding mass per m² or per crew for a storm shelter beyond "stored consumables".

---

## Key Question 4: Human factors as go/no-go constraints (radiation, g-loads, deconditioning, SPEs, confinement, aborts, margins)

### Takeaway
Measured dose rates are 1.84 mSv/day in transit and ~0.64–0.7 mSv/day on the surface, giving ~1.0 Sv for a 180+500+180-day mission — above NASA's 600 mSv career limit (NASA-STD-3001 Vol 1 Rev B) and the 250 mSv design-SPE limit must be met by a storm shelter. Crew g-limits cite 4 g +Gx as tolerable for ≥ 60 min and ~5 g as the aerocapture consensus; abort options are free-return trajectories (2-year at C3 ≈ 25) and an orbital safe haven with contingency food.

### Cited Findings

**Radiation environment (MSL RAD measurements)**
- RAD cruise dose rate 1.84 mSv/day; surface 0.64 mSv/day; total ≈ 1.01 Sv for 180-day cruise + 500-day surface + 180-day return (Hassler et al., Science, Dec 2013); measured near solar maximum when GCR flux is relatively low; ESA career limit 1 Sv (≈ 5 % lifetime fatal-cancer increase); NASA standard caps excess cancer risk at 3 % — [Scientific American, Dec 2013](https://www.scientificamerican.com/article/radiation-on-mars-managea)
- MSL RAD cruise measurement implies a 0.66 Sv round-trip transit dose (Zeitlin et al. 2013); Sept 2017 solar storm temporarily doubled surface radiation — [Wikipedia: Human mission to Mars](https://en.wikipedia.org/wiki/Human_mission_to_Mars)
- NASA OCHMO technical brief uses 1.5 mSv/day as the transit exposure example (saving 90 days of transit avoids 135 mSv) — [NASA OCHMO Radiation Protection Technical Brief (OCHMO-TB-020 Rev E)](https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf)
- Zubrin: surface dose about a quarter of interplanetary; one year of cosmic radiation ≈ 1 % cancer incidence — [Zubrin & Weaver 1993](https://marspapers.org/paper/Zubrin_1993_2.pdf)

**NASA radiation standards**
- Career limit [V1 4030]: total career effective dose "shall be less than 600 mSv", applies to all ages and sexes; SPE limit [V1 4031]: design reference SPE (sum of the October 1989 events) < 250 mSv effective dose; ALARA [V1 4029]; nuclear sources [V1 4032] < 20 mSv per mission year; SPE-rate basis ~0.5 mSv/day surface with a 10 % allowance (0.05 mSv/day, ~20 mSv/yr) — NASA-STD-3001 Vol 1 Rev B as summarised in [OCHMO Radiation Protection Technical Brief](https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf)
- DRA 5.0 reactor guideline: < 5 rem/yr to crew, 1 km standoff — [NASA-SP-2009-566](https://ntrs.nasa.gov/api/citations/20090040343/downloads/20090040343.pdf)

**Acceleration (g) limits**
- Sustained translational acceleration limits are requirement [V2 6064] (exposure > 0.5 s), given in Figures 6.5-(2-7)/Tables 6.5-(1-6) of NASA-STD-3001 Vol 2 (not reproduced in the brief); ±Ax (eyeballs in/out): +2 g tolerable ≥ 24 h, 4 g tolerable up to at least 60 min; +Az: 3–4 g "impossible to raise oneself", grayout after 3–4 s; 4–6 g blackout after ~5 s; > 6 g protection needed; transient (≤ 0.5 s) loads use the Brinkley model [V2 6069/6070] — [NASA OCHMO Acceleration Technical Brief](https://www.nasa.gov/sites/default/files/atoms/files/acceleration_technical_brief_ochmo.pdf)
- Artemis +Gz sustained limits (NASA/TM-20205008196): seated without compression garment, long-duration curve: 1 g up to 30 s, 0.8 g at 50 s, 0.68 g at 80 s, 0.5 g (4.91 m/s²) from 120 s onward; seated with lower-body compression garment 2 g for 0.5 s, 1.3 g at 10 s, 1 g at 30 s; limits "account for deconditioning" but no separate post-flight limit set is defined; countermeasures recommended for surface stays > 30 days — [NASA/TM-20205008196](https://www.nasa.gov/wp-content/uploads/2023/03/tm-20205008196.pdf)
- Aerocapture deceleration limit for crews: 5 g (consensus of reviewed studies) — [Wikipedia: Human mission to Mars](https://en.wikipedia.org/wiki/Human_mission_to_Mars)
- For scale, the robotic MSL entry peaked at 15 g — [Wikipedia: Mars Science Laboratory](https://en.wikipedia.org/wiki/Mars_Science_Laboratory)

**Deconditioning, psychology, aborts, margins**
- Bone-loss models: 33 % of astronauts at risk of osteoporosis on a Mars mission; cramped conditions for more than one Earth year, possibly two or three; communication latency 4–24 min — [Wikipedia: Human mission to Mars](https://en.wikipedia.org/wiki/Human_mission_to_Mars)
- Free-return abort: trajectories near C3 = 25 km²/s² return to Earth 2 years after departure without propulsion; hab food sized for an 800-day mission to cover the 2-year free return — [Zubrin & Weaver 1993](https://marspapers.org/paper/Zubrin_1993_2.pdf); 2- and 1.5-year free-return orbits do not rely on Mars gravity; in some years a 0.6–2.7 km/s kick at Mars is needed because entry must stay < 9 km/s — [Wikipedia: Free-return trajectory](https://en.wikipedia.org/wiki/Free-return_trajectory)
- DRA 5.0 abort/contingency conventions: the MTV carries contingency food and serves as an orbital "safe haven" if the surface mission is aborted until the TEI window opens; transit habitat sized for 400 days + 550 contingency days in Mars orbit — [NASA-SP-2009-566](https://ntrs.nasa.gov/api/citations/20090040343/downloads/20090040343.pdf); [DRA 5.0 slides](https://ntrs.nasa.gov/api/citations/20090012109/downloads/20090012109.pdf)
- Round-trip light time up to 44 min at ~400 million km — [NASA-SP-2009-566](https://www.nasa.gov/wp-content/uploads/2015/09/373665main_nasa-sp-2009-566.pdf)

### Inferences
- **(derived)** Dose budget at RAD rates: a 180/500/180-day conjunction mission ≈ 1.84×360 + 0.64×500 = 0.66 + 0.32 = 0.98–1.01 Sv (matches Hassler); a 570-day opposition mission (200 + 30 orbit + 340) ≈ 1.84×570 ≈ 1.05 Sv — i.e. short-stay missions do not reduce dose because the crew spends the whole time in deep space; a 2 × 115-day fast transit with a 500-day stay ≈ 0.42 + 0.32 = 0.74 Sv. All exceed the 600 mSv career limit without shielding credit, so a simulation should treat "dose > 600 mSv" as a waiver condition rather than a hard failure, and "SPE dose > 250 mSv" (no storm shelter) as a hard failure.
- Go/no-go g-criterion for a simulation: sustained entry deceleration ≤ 4–5 g (+Gx, seated) for deconditioned crew, consistent with the 4 g/60 min tolerance line and the 5 g aerocapture consensus; 15 g robotic-style entries are out of bounds.
- Abort-mode availability is trajectory-dependent: a free return is "free" only near C3 ≈ 25 (2-year) or Hohmann (1.5-year with Mars gravity) and requires 800+ days of consumables; fast (130-day) transfers give only 4-year free returns, so effectively no survivable abort after TMI.

### Gaps
- A numeric NASA requirement specifically for deconditioned crew at Mars entry/Earth return (the often-quoted "≤ 4 g sustained") was not found in text form; the governing curves are figures in NASA-STD-3001 Vol 2 that did not extract. Treat 4–5 g as a design-practice value, not a cited requirement.
- Primary Zeitlin 2013 / Hassler 2014 papers were not fetched directly; numbers come via Scientific American and Wikipedia summaries.
- Consumables-margin conventions (e.g., percent reserve on food/water) were not stated numerically in any fetched source beyond DRA's "550 contingency days" and Zubrin's 800-day food for a 500-day mission.

---

## Key Question 5: Success criteria and failure modes (P(LOC)/P(LOM) targets, long-duration reliability, ECLSS closure, boil-off, heat shield, g, life support, windows, landing hazards, dust storms)

### Takeaway
NASA's safety community has put a Mars/deep-space mission at roughly 1-in-75 probability of loss of crew (vs 1-in-270 for LEO commercial crew, 1-in-1400 Orion ascent, 1-in-650 Orion EDL). ISS ECLSS now recovers 98 % of water and ~50 % of oxygen from CO2 (target 75 %). Cryogenic boil-off of ~0.1 %/day (LH2 best-case 0.13 %/day; LOX 0.016 %/day) is the standard depot assumption, and a global dust storm has roughly a 1-in-3 chance per Martian year.

### Cited Findings

**Probability targets**
- NASA safety experts determined a 1-in-75 loss-of-crew rate for Mars or asteroid missions planned for the 2030s with SLS; 1-in-270 is the LEO threshold accepted in 2010; Orion launch/ascent requirement 1-in-1400, SLS ascent 1-in-550, Orion entry/descent/landing 1-in-650; Commercial Crew interim 1-in-200 to offset MMOD; shuttle early-program risk estimated 1-in-12 (ASAP 2011); Astronaut Office goal 999-in-1000 — [Aerospace America, "Maximizing Safety", Oct 2015](https://digitaleditions.walsworth.com/article/MAXIMIZING+SAFETY/2274835/273637/article.html)
- Commercial Crew requirements: loss on ascent ≤ 1 in 500; loss on entry 1 in 500 (independently); overall mission ≤ 1 in 270 including MMOD over up to 210 days — [Wikipedia: Human-rating certification](https://en.wikipedia.org/wiki/Human-rating_certification)

**ECLSS closure (ISS, 2023–2025)**
- ISS ECLSS reached 98 % water recovery (June 2023) with the Brine Processor Assembly, up from 93–94 % — [NASA, 20 Jun 2023](https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station/)
- Oxygen: ~51 % currently recovered from CO2, target 75 %; water recycling "approximately 90 %" in the review's baseline with 98 % target; Sabatier design output 907.184 kg/yr for a seven-person crew; OGA design rate 2.3–9.2 kg/day — [Frontiers in Space Technologies 2024](https://www.frontiersin.org/journals/space-technologies/articles/10.3389/frspt.2024.1461389/full)

**Propellant boil-off (for the LEO wait before TMI and for Mars-surface loiter)**
- Best tank designs: LH2 ≈ 0.13 %/day (3.8 %/month); LOX ≈ 0.016 %/day (0.49 %/month); "Simple Depot" LH2 approaching 0.1 %/day; a 2010 NASA Ares V Mars study assumed 0.1 %/day hydrolox, which produced 70 t of boil-off and an extra Ares V flight and "must fall by an order of magnitude or more"; zero-boil-off break-even vs passive storage in LEO: ~5 days for O2, 8.5 days for methane, 64 days for hydrogen (NASA Glenn 2003); SMIRF test eliminated LH2 boil-off with 34 MLI layers and a 15–17.5 W cryocooler on a 1400 L tank — [Wikipedia: Orbital propellant depot](https://en.wikipedia.org/wiki/Orbital_propellant_depot)
- Depot design goal "1/10 of 1 percent a day or only 3 percent a month"; Constellation lunar stack would have had "about two weeks" before hydrogen boil-off ruined the stack — [National Space Society, Orbital Propellant Depots](https://nss.org/orbital-propellant-depots-building-the-interplanetary-highway/)
- GaTech depot study: a 50 000 kg LOX/LH2 depot without ZBO needs "more than 2,000 kg of extra propellant" for 60 days (≈ 33 kg/day, ≈ 0.07 %/day derived), 50 MLI layers assumed — [Street, Georgia Tech SSDL](https://ssdl1.gatech.edu/sites/default/files/ssdl-files/papers/mastersProjects/StreetD-8900.pdf)
- SpaceX: ship-to-ship transfer demo NET late 2026, second launch 3–4 weeks later; boil-off monitoring will determine how many tankers are needed; the depot has extra battery capacity to loiter longer; no boil-off rate published — [Wikipedia: Starship Propellant Transfer Demonstration](https://en.wikipedia.org/wiki/Starship_Propellant_Transfer_Demonstration)

**Entry/heat-shield and landing constraints**
- Human-scale aerocapture/entry below 9.1 km/s; entry flight-path-angle tolerance ~ ±0.5°; Viking-era technology limit ≈ 0.6–1 t landed; human plans need 40–80 t landed within tens of metres of pre-placed assets; little experience firing large thrusters into supersonic flow — [Braun & Manning 2007](https://corpora.tika.apache.org/base/docs/govdocs1/095/095306.pdf); [Wikipedia: Free-return trajectory](https://en.wikipedia.org/wiki/Free-return_trajectory)
- DRA 5.0 aerocapture peak heating 462 W/cm²; Earth entry ≤ 12 km/s for Orion-family TPS — [NASA-SP-2009-566](https://ntrs.nasa.gov/api/citations/20090040343/downloads/20090040343.pdf)
- Current-technology soft-landing criterion includes mass "less than 0.6 tonnes"; Curiosity needed a 4.5 m aeroshell — [Wikipedia: Mars landing](https://en.wikipedia.org/wiki/Mars_landing)

**Dust storms and surface environment**
- Chance of a planet-wide dust storm in a given Martian year ≈ 1 in 3 (since the 1950s); global storms in 1971 (Mariner 9), 2001, 2007 (rovers shut down science; power loss), 2018 (planet-wide by 20 June); storms cluster at perihelion/southern spring–summer; dust lifting needs 18–22 m/s winds; mean surface pressure ≈ 600 Pa; Viking site temperatures −17 °C to −107 °C; global storms narrow the diurnal range from 50 °C to ~10 °C — [Wikipedia: Climate of Mars](https://en.wikipedia.org/wiki/Climate_of_Mars)

**Launch-campaign timing constraints (missed-window risk)**
- DRA 5.0: 7+ heavy-lift launches on 30-day centres, 300-day campaign; cargo pre-deployed ~26 months before crew; crew launch period "a few weeks" — [DRA 5.0 slides](https://ntrs.nasa.gov/api/citations/20090012109/downloads/20090012109.pdf); [Universe Today (Price et al. 2033)](https://www.universetoday.com/160753/2033-is-the-perfect-year-to-send-humans-to-mars-with-a-bonus-venus-flyby/)
- SpaceX HLS: ~10 tanker launches before one lunar landing — [Wikipedia: Starship Propellant Transfer Demonstration](https://en.wikipedia.org/wiki/Starship_Propellant_Transfer_Demonstration)

### Inferences
- Failure-mode checklist for a simulation, with thresholds grounded in the citations above: (1) **insufficient dv**: required TMI(C3 for chosen date) + MCC + MOI/aerocapture + landing > vehicle dv after boil-off; (2) **boil-off during refuelling wait**: at 0.1 %/day a 1200 t load loses ~1.2 t/day (≈ 36 t/month, ≈ 70 t over 60 days for a 1200 t stack); LH2 stages lose ~4 %/month, LOX ~0.5 %/month; (3) **heat-shield exceedance**: Mars entry > ~9 km/s or Earth entry > 12 km/s (Orion-class TPS); (4) **g-overload**: sustained > 4–5 g; (5) **life-support exhaustion**: consumables < BVAD rates × (mission days + contingency days, DRA uses +550 d); (6) **missed window**: campaign (tanker count × cadence + checkout) must finish inside the ~160-day departure span, with C3 rising steeply at the edges (Braeunig's 2020 table spans 3808–4386 m/s); (7) **landing-site hazard**: ellipse 7.7 × 6.6 km (TRN) to 20 × 7 km (MSL) vs pre-placed assets; (8) **dust-storm season**: 1-in-3 chance per Mars year of a global storm, worst near perihelion; solar-powered surface systems lose power (2007 precedent).
- LOC bookkeeping: with 1-in-1400 ascent, 1-in-650 EDL and the deep-space 1-in-75 figure, the dominant risk is the long-duration in-space/surface phase, i.e. system reliability and ECLSS, not launch.
- **(derived)** At current ISS closure (98 % water, ~51 % O2), the non-recoverable O2 shortfall is ~0.4 kg/CM-d, i.e. 2.2 t for 6 crew × 900 d, consistent with DRA's 2 t ISRU O2 for life support.

### Gaps
- No single NASA document fetched states a Mars-specific P(LOC) *requirement*; the 1-in-75 figure is a journalistic report of a NASA safety-expert determination (2015). The suggested "1-in-75 to 1-in-270" range should be presented as reported goals, not a standard.
- No published boil-off rate for LOX/CH4 in Starship-class tanks was found; the methane value exists only via the "8.5-day ZBO break-even" statement. Use 0.05–0.1 %/day as a bracket and flag it.
- Long-duration system reliability figures (MTBF, spares mass fraction) were not found in the fetched sources.

---

## Key Question 6: Historical statistics and EDL calibration points

### Takeaway
Of 48 Mars missions launched through 2025, 19–20 succeeded and 18 failed (11 at launch); of 17 landing attempts, 10 fully succeeded (11 counting Mars 3). All successful landers to date have entry masses ≤ ~3.5 t and landed ≤ ~1 t at 4.7–7.3 km/s entry speeds with ballistic coefficients 63–115 kg/m²; a 100 t-class crewed lander is ~30x the heaviest entry vehicle flown.

### Cited Findings
- Mission totals (48 numbered missions through 2025): 19 successful (plus Phobos 2 "mostly successful"), 1 partial failure (Mars 4), 18 failed (11 launch failures, 7 spacecraft failures), 8 still operational, 1 en route (ESCAPADE, launched 13 Nov 2025); 17 lander/rover attempts, 11 soft landings including Mars 3 (contact lost ~110 s after landing), 10 fully successful; both Deep Space 2 penetrators failed — [Wikipedia: List of missions to Mars](https://en.wikipedia.org/wiki/List_of_missions_to_Mars)
- "Roughly sixty percent of all spacecraft destined for Mars failed before completing their missions" — [Wikipedia: Exploration of Mars](https://en.wikipedia.org/wiki/Exploration_of_Mars); "Out of 5–6 NASA missions in the 1990s, only 2 worked" — [Wikipedia: Mars landing](https://en.wikipedia.org/wiki/Mars_landing)
- Landing attempts and outcomes: Mars 2 (1971, impacted), Mars 3 (1971, soft landing, signal lost), Mars 6 (1973, failed on impact), Mars 7 (1973, missed planet by 1300 km), Viking 1 & 2 (1976, success), Pathfinder (1997, airbags, success), Mars Polar Lander (1999, failed), Beagle 2 (2003, lost; panels not fully deployed), Spirit/Opportunity (2004, success), Phoenix (2008, success), Curiosity (2012, sky crane, success), Schiaparelli (2016, crashed), InSight (2018, success), Perseverance (2021, sky crane, success), Tianwen-1/Zhurong (2021, success) — [Wikipedia: Mars landing](https://en.wikipedia.org/wiki/Mars_landing)

**EDL calibration table (Braun & Manning 2007, Table 1; Phoenix and MSL values were pre-flight)** — [Braun & Manning, "Mars Exploration Entry, Descent and Landing Challenges", J. Spacecraft & Rockets 2007](https://corpora.tika.apache.org/base/docs/govdocs1/095/095306.pdf)

| Mission | Entry mass (kg) | Touchdown / useful landed mass (kg) | Entry speed (km/s) | FPA (deg) | Ballistic coeff. (kg/m²) | Aeroshell dia (m) | L/D | Parachute dia (m) | Landing method | Site elev. (km MOLA) | 3σ ellipse (km) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Viking 1/2 (1976) | 992 | 590 / 244 | 4.7 (from orbit) | −17 | 64 | 3.5 | 0.18 | 16 | legs + throttled monoprop | −3.5 | 280 × 100 |
| Pathfinder (1997) | 584 | 360 / 92 | 7.26 (direct) | −14.06 | 63 | 2.65 | 0 | 12.5 | airbags + solid retros | −2.5 | 200 × 100 |
| MER-A Spirit (2004) | 827 | 539 / 173 | 5.4 | −11.49 | 94 | 2.65 | 0 | 14 | airbags + solids | −1.9 | 80 × 12 |
| MER-B Opportunity (2004) | 832 | 539 / 173 | 5.5 | −11.47 | 94 | 2.65 | 0 | 14 | airbags + solids | −1.4 | 80 × 12 |
| Phoenix (2008, planned) | 600 | 364 / 167 | 5.67 | −12.5 | 70 | 2.65 | 0.06 | 11.5 | legs + pulsed engines | −3.5 | 260 × 30 |
| MSL (2012, planned) | 2800 | 1541 / 775 | 6 | −15.2 | 115 | 4.6 | 0.22 | 19.7 | sky crane | +2 | 20 × 20 |

- MSL as flown: launch mass 3839 kg (infobox; 3893 kg in body text) = cruise stage 539 + EDL system 2401 (incl. 390 kg landing propellant) + rover 899 kg; heat shield 4.5 m PICA; atmospheric interface ≈ 5.8 km/s; peak deceleration 15 g; parachute 16 m deployed at ~10 km, Mach 2.2, 470 m/s; powered-descent handover at 1.8 km / 100 m/s; eight 400–3100 N engines; target ellipse 20 × 7 km, landed 2.4 km from centre; Gale site −4451 m — [Wikipedia: Mars Science Laboratory](https://en.wikipedia.org/wiki/Mars_Science_Laboratory)
- Mars 2020 as flown: launch mass 4060.5 kg = cruise stage 539 + aeroshell/back shell 575 + heat shield 440 + descent stage 1070 (incl. 400 kg propellant) + Perseverance rover 1025 kg; parachute 21.5 m (81 kg); sky crane; TRN landing ellipse 7.7 × 6.6 km with 40 m positioning error; sky-crane phase at ~320 km/h (89 m/s) from ~1.9 km — [Wikipedia: Mars 2020](https://en.wikipedia.org/wiki/Mars_2020)
- Braun & Manning: landing ~0.75 t at +2 km MOLA "is stretching the limits of our Viking-era EDL technology"; human missions need 40–80 t landed — [Braun & Manning 2007](https://corpora.tika.apache.org/base/docs/govdocs1/095/095306.pdf)
- DRA 5.0 notes robotic EDL experience exists only for payloads above 1 t in a very limited sense ("large-payload landing challenge threshold > 2 t"), vs 40–50 t required — [DRA 5.0 slides](https://ntrs.nasa.gov/api/citations/20090012109/downloads/20090012109.pdf)

### Inferences
- **(derived)** Overall mission success rate ≈ 19–20/48 ≈ 40–42 % (≈ 48 % if the 11 launch failures are excluded, i.e. of spacecraft that left Earth); lander success ≈ 10–11/17 ≈ 59–65 %; US landers since Viking are 9 of 10 (Mars Polar Lander the exception), so the "~50 %" folk figure is dominated by 1960s–70s Soviet attempts and launch failures.
- **(derived)** Perseverance entry-vehicle mass ≈ 4060.5 − 539 (cruise stage) ≈ 3520 kg, landed mass ≈ 1025 kg rover + ~670 kg descent stage (dry) — the heaviest Mars entry to date. A 100 t Starship-class entry is ~28x that entry mass and ~100x the landed useful mass; ballistic coefficients for such vehicles would be several hundred kg/m² (vs 63–115 flown), which is why supersonic retropropulsion rather than parachutes is assumed.
- Calibration anchors for an entry model: entry speed 4.7 km/s (from orbit) to 7.26 km/s (direct, Pathfinder); FPA −11.5° to −17°; peak decel ~15 g for MSL-class (robotic, acceptable) vs ≤ 5 g for crew; parachute deploy ~Mach 2.2 at ~10 km; terminal handover ~1.8–1.9 km altitude at ~90–100 m/s.

### Gaps
- Entry masses and entry speeds for InSight, Tianwen-1/Zhurong and Schiaparelli were not in the fetched sources; Phoenix and MSL values in the Braun & Manning table are pre-flight predictions (MSL grew from 2800 kg planned to ~3300 kg as flown per the derived Wikipedia sum).
- Wikipedia's "Mars landing" page gives no masses; "List of missions to Mars" gives dates but no masses, so the per-lander mass column relies on Braun & Manning (2007) plus the MSL/Mars 2020 articles.
