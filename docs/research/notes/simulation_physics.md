# Physics models, constants and validation anchors for an Earth-launch → Mars-cruise → Mars-EDL browser simulation

Conventions used throughout these notes: all sources accessed 2026-10-12. Each numeric item is tagged **[measured]** (observation/ephemeris/flight telemetry), **[modelled]** (fit or model output), **[estimated]** (published engineering estimate) or **[derived]** (my own arithmetic from cited constants — shown in the *Inferences* sub-sections, never in *Cited Findings*). Equations are written in plain text. SI units unless stated; μ (GM) values are given in km³/s² because that is how the ephemeris sources publish them — multiply by 1e9 for m³/s².

---

## Key question 1 — Planetary and orbital constants, JPL Keplerian elements, Kepler's equation, Julian dates

### Takeaway
Use JPL DE440 values for μ (Sun 1.32712440041279419e11 km³/s², Earth 398600.435507, Moon 4902.800118, Mars system 42828.375816), NSSDC fact-sheet values for radii/J2/rotation, and the JPL "Approximate Positions" Table 1 (valid 1800–2050, so it covers 2026–2040) with its 4-step algorithm and Newton iteration on Kepler's equation to place Earth–Moon barycentre and Mars in the heliocentric mean-ecliptic J2000 frame.

### Cited Findings

**Gravitational parameters (DE440) [measured/ephemeris]**
- GM_Sun = 1.32712440041279419e20 m³/s² (= 1.32712440041279419e11 km³/s²); AU = 149,597,870.7 km (IAU 2012); c = 299,792.458 km/s — [JPL SSD Astrodynamic Parameters](https://ssd.jpl.nasa.gov/astro_par.html)
- GM_Earth = 398600.435507 km³/s²; GM_Moon = 4902.800118 km³/s²; GM_Mars system = 42828.375816 km³/s² (Mars-only value not listed separately; the moons are negligible for this purpose); GM_Venus = 324858.592; GM_Jupiter system = 126712764.1 — [JPL SSD Astrodynamic Parameters](https://ssd.jpl.nasa.gov/astro_par.html)
- Cross-check: NSSDC gives GM_Earth = 0.39860e6 km³/s², GM_Mars = 0.042828e6 km³/s² — [NSSDC Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html)

**Earth [measured]**
- Mass 5.9722e24 kg; equatorial radius 6378.137 km; polar radius 6356.752 km; volumetric mean radius 6371.000 km; mean density 5513 kg/m³; equatorial surface gravity 9.780 m/s²; escape velocity 11.186 km/s; J2 = 1082.63e-6; sidereal rotation period 23.9345 h; length of day 24.0000 h; obliquity 23.44°; semimajor axis 149.598e6 km; sidereal orbit period 365.256 d; perihelion 147.095e6 km; aphelion 152.100e6 km; mean orbital velocity 29.78 km/s; eccentricity 0.0167 — [NSSDC Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html)
- Earth surface pressure 1014 mb, surface density 1.217 kg/m³, scale height 8.5 km, mean molecular weight 28.97, mean temperature 288 K — [NSSDC Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html)

**Mars [measured]**
- Mass 0.64169e24 kg; equatorial radius 3396.2 km; polar radius 3376.2 km; volumetric mean radius 3389.5 km; flattening 0.00589; mean density 3934 kg/m³; mean surface gravity 3.73 m/s²; equatorial surface acceleration 3.69 m/s² (polar 3.73); escape velocity 5.03 km/s; J2 = 1960.45e-6; sidereal rotation period 24.6229 h; length of day (sol) 24.6597 h; obliquity 25.19°; semimajor axis 227.956e6 km; sidereal orbit period 686.980 d; perihelion 206.650e6 km; aphelion 249.261e6 km; mean orbital velocity 24.08 km/s; orbit inclination 1.848°; eccentricity 0.0935 — [NSSDC Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html)

**JPL "Keplerian elements for approximate positions" — Table 1, valid 1800–2050, mean ecliptic and equinox of J2000 [modelled fit to DE ephemeris]**
Each row: element value at J2000, then rate per Julian century. Units: a in au, au/Cy; e dimensionless (the page header says "rad" but e is an eccentricity); I, L, ϖ (long. of perihelion), Ω (long. of ascending node) in deg, deg/Cy. — [JPL SSD Approximate Positions of the Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html)

```
               a              e               I                L            long.peri.(ϖ)   long.node.(Ω)
EM Bary   1.00000261      0.01671123     -0.00001531      100.46457166    102.93768193      0.0
 rates    0.00000562     -0.00004392     -0.01294668    35999.37244981      0.32327364      0.0
Mars      1.52371034      0.09339410      1.84969142       -4.55343205    -23.94362959     49.55953891
 rates    0.00001847      0.00007882     -0.00813131    19140.30268499      0.44441088     -0.29257343
Venus     0.72333566      0.00677672      3.39467605      181.97909950    131.60246718     76.67984255
 rates    0.00000390     -0.00004107     -0.00078890    58517.81538729      0.00268329     -0.27769418
Mercury   0.38709927      0.20563593      7.00497902      252.25032350     77.45779628     48.33076593
 rates    0.00000037      0.00001906     -0.00594749   149472.67411175      0.16047689     -0.12534081
Jupiter   5.20288700      0.04838624      1.30439695       34.39644051     14.72847983    100.47390909
 rates   -0.00011607     -0.00013253     -0.00183714     3034.74612775      0.21252668      0.20469106
Saturn    9.53667594      0.05386179      2.48599187       49.95424423     92.59887831    113.66242448
 rates   -0.00125060     -0.00050991      0.00193609     1222.49362201     -0.41897216     -0.28867794
```
("EM Bary" = Earth–Moon barycentre.) — [JPL SSD Approximate Positions of the Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html)

- Algorithm (verbatim structure): T = (T_eph − 2451545.0)/36525 with T_eph the Julian Ephemeris Date (JD_TDB). Step 1: element = element0 + rate·T for a, e, I, L, ϖ, Ω. Step 2: ω = ϖ − Ω (argument of perihelion); M = L − ϖ (mean anomaly; the extra b,c,s,f terms apply only to Jupiter–Neptune in Table 2b, not needed for Table 1). Step 3: reduce M to −180°..+180°, solve M = E − e*·sin E with e* = 57.29578·e (degrees). Step 4: x' = a(cos E − e), y' = a·sqrt(1 − e²)·sin E, z' = 0 in the orbital plane, x' toward perihelion — [JPL SSD Approximate Positions of the Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html)
- Rotation to J2000 ecliptic: x_ecl = (cos ω cos Ω − sin ω sin Ω cos I)·x' + (−sin ω cos Ω − cos ω sin Ω cos I)·y'; y_ecl = (cos ω sin Ω + sin ω cos Ω cos I)·x' + (−sin ω sin Ω + cos ω cos Ω cos I)·y'; z_ecl = (sin ω sin I)·x' + (cos ω sin I)·y'. To equatorial (ICRF/J2000): x_eq = x_ecl; y_eq = cos ε·y_ecl − sin ε·z_ecl; z_eq = sin ε·y_ecl + cos ε·z_ecl with ε = 23.43928° — [JPL SSD Approximate Positions of the Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html)
- Kepler solver (degrees): E0 = M + e*·sin M; iterate ΔM = M − (E_n − e*·sin E_n); ΔE = ΔM/(1 − e·cos E_n); E_{n+1} = E_n + ΔE; stop when |ΔE| ≤ 1e-6° — [JPL SSD Approximate Positions of the Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html)
- Stated accuracy 1800–2050: EM Bary longitude 20″, latitude 8″, distance 6,000 km; Mars longitude 40″, latitude 2″, distance 25,000 km. Elements are "not valid outside the given time-interval over which they were fit" — [JPL SSD Approximate Positions of the Planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html)

### Inferences
- **[derived] Equatorial surface rotation speed**: Earth v = 2π·6,378,137 m / (23.9345 h × 3600) = 2π·6,378,137/86,164.2 = **465.1 m/s**; Mars v = 2π·3,396,200/(24.6229×3600 = 88,642.4 s) = **240.7 m/s**. Angular rates: ω_Earth = 2π/86164.2 = 7.2921e-5 rad/s; ω_Mars = 2π/88642.4 = 7.0882e-5 rad/s (from fact-sheet periods above).
- **[derived] Validation anchors for the orbit code**: circular speed at 300 km altitude above Earth = sqrt(398600.4355/6678.137) = 7.7257 km/s (the Delta-v budget page quotes 7.73 km/s, see Q7); period = 90.5 min; escape speed at 300 km = 10.926 km/s; Earth–Mars synodic period = 1/(1/365.256 − 1/686.980) = 779.9 d.
- **[derived] Mars position check**: the table's Mars a = 1.52371034 au × 149,597,870.7 km = 227.94e6 km, matching the fact sheet's 227.956e6 km to 0.01 %.
- Table 1 gives the Earth–Moon barycentre, not Earth. The barycentre–Earth offset (~4,670 km) is far smaller than the stated 6,000 km distance error and irrelevant at AU scale; for the launch phase you work in an Earth-centred frame anyway, so use EM Bary as "Earth" for the heliocentric leg.
- **Julian date in JavaScript**: JD_UTC = Date.getTime()/86,400,000 + 2,440,587.5 (the Unix epoch 1970-01-01T00:00:00Z is JD 2440587.5 — standard identity, not from a fetched source). TDB − UTC is ≈ 69 s in the 2020s (TT−UTC = 37 s leap-second offset + 32.184 s); at Mars's mean orbital speed of 24.08 km/s that is a 1,700 km position shift, well inside the 25,000 km quoted accuracy, so UTC may be used in place of TDB for this application.
- Calendar → JD formula (Vallado, *Fundamentals of Astrodynamics*, Algorithm 14; valid 1900–2100; NOT fetched this session — verify against the book): JD = 367·Y − INT(7·(Y + INT((M+9)/12))/4) + INT(275·M/9) + D + 1,721,013.5 + (h + min/60 + s/3600)/24.
- For hyperbolic legs (escape/arrival) the equivalent of Kepler's equation is M_h = e·sinh(H) − H, solved by the same Newton iteration (textbook — Curtis, *Orbital Mechanics for Engineering Students*, ch. 3; not fetched).

### Gaps
- Moon radius and Earth–Moon distance were not on the Earth fact sheet (it links a separate Moon sheet, not fetched). Moon equatorial radius 1738.1 km and mean distance 384,400 km are standard values but unverified here.
- No fetched source for the Julian-day calendar algorithm or the TT−UTC offset; both are standard but should be checked against Vallado/USNO before use.

---

## Key question 2 — Launch ascent model (equations of motion, gravity turn, losses, Falcon 9 / Starship anchors, Cd vs Mach, Isp vs pressure)

### Takeaway
Model the vehicle in an Earth-centred inertial frame with thrust, point-mass gravity, and drag computed with the air-relative velocity (atmosphere co-rotating at ω_Earth); total Δv to LEO is ~9.3–9.5 km/s with ~1.5–2 km/s of gravity+drag losses (Shuttle: 9,285 m/s, gravity 62 % of losses). Flight-timeline anchors are solid (Falcon 9 CRS-8: Mach 1 at T+1:13, max-Q T+1:24, MECO T+2:30; Starship Flight 4/6: max-Q T+1:02, MECO T+2:32–2:46, hot-stage T+2:39–2:51 at ~72 km (IFT-3), SECO T+8:27–8:37), but velocities at MECO/SECO and a numeric Cd(Mach) curve were not found in fetched sources and must be treated as tunable.

### Cited Findings

**Thrust and Isp**
- Rocket thrust equation: F = ṁ·Ve + (pe − p0)·Ae, with ṁ the mass flow (set by the throat area, choked), Ve exit velocity and pe exit pressure (both set by the throat-to-exit area ratio), Ae nozzle exit area, p0 free-stream (ambient) pressure. "The exit pressure is only equal to free stream pressure at some design condition", hence the pressure term — [NASA Glenn, Rocket Thrust](https://www.grc.nasa.gov/www/k-12/airplane/rockth.html)
- Methane/LOX exhaust velocity example (100 atm chamber, expansion ratio 15): 2,536 m/s sea level, 2,834 m/s vacuum (ideal), with real values ≈ 0.92× (SL) and 0.94× (vac) of ideal — [arXiv 2107.13513](https://arxiv.org/pdf/2107.13513) [modelled]
- Raptor 2: 230 tf (2.26 MN) sea-level thrust, 258 tf (2.53 MN) vacuum thrust, Isp 347 s sea level (SpaceX-stated), chamber pressure 300 bar, mass 1,630 kg. Raptor 3: 250 tf (2.45 MN) SL / 275 tf (2.70 MN) vac, Isp 350 s SL / 380 s vac (SpaceX-stated), 330 bar (350 bar in ground test), mass 1,525 kg. Raptor Vacuum target Isp ≈ 380 s (3.7 km/s). Shared: O/F ≈ 3.6 (page also says ≈3.8), expansion ratio 34.34 (SL) / 80 (vac), total mass flow ≈ 650 kg/s (≈510 kg/s O2 + 140 kg/s CH4), throttle 40–100 %. The page flags internal inconsistencies (e.g., Raptor 1 Isp 327 s vs 350 s; Raptor 3 thrust 2,750/2,980 kN in one table vs 2.45/2.70 MN infobox) — [Wikipedia: SpaceX Raptor](https://en.wikipedia.org/wiki/SpaceX_Raptor) [SpaceX-stated/estimated]
- Super Heavy/Starship Flight 6: liftoff thrust ≈ 7,500 t and liftoff mass ≈ 5,000 t (Musk statements), ≈ 230 t per Raptor, 33 booster engines, 39 engines total — [Starship SpaceX Wiki, Flight Test 6](https://starship-spacex.fandom.com/wiki/Starship_Flight_Test_6) [SpaceX-stated]

**Δv to LEO and losses**
- Reaching LEO requires accelerating 0 → 7.8 km/s plus "1.5–2 km/s for atmospheric drag and gravity drag"; Earth surface → LEO is listed as 9.3–10 km/s; ISS orbit "about 9.4 km/s"; orbital speed at 300 km quoted as 7.73 km/s — [Wikipedia: Delta-v budget](https://en.wikipedia.org/wiki/Delta-v_budget) [estimated]
- Space Shuttle LEO requirement Δv = 9,285 m/s; gravity loss was 62 % of the Shuttle's Δv losses; a 190 km vs 400 km target orbit changes the requirement by 122 m/s; a slower 12.4-min ascent costs an extra 419–453 m/s of gravity loss — [arXiv 2107.13513](https://arxiv.org/pdf/2107.13513) [estimated]
- Drag reference area convention used in that launch-vehicle analysis: A = "the base area of the rocket" (π·d²/4) — [arXiv 2107.13513](https://arxiv.org/pdf/2107.13513)

**Falcon 9 timeline anchor (CRS-8, Falcon 9 Full Thrust, 7 Apr 2016, ~3,175 kg Dragon to 200×360 km, 51.6°) [measured, pre-flight published timeline]**
- Mach 1 at T+0:01:13; Max Q at T+0:01:24; MECO T+0:02:30; stage separation T+0:02:34; second-stage ignition T+0:02:41 (≈7-min burn); boostback ≈T+3:00 (3 engines); entry burn ≈T+7:00 (3 engines); landing burn ≈T+8:00 (1 engine); first-stage landing ≈T+9:00 (drone ship ≈300 km downrange); SECO T+0:10:00; Dragon separation T+0:10:30 — [Spaceflight Now, Falcon 9 23rd flight timeline](https://spaceflightnow.com/2016/04/07/timeline-for-the-falcon-9-rockets-23rd-flight/)

**Starship timeline anchors [measured, SpaceX webcast timelines as transcribed]**
- IFT-3 (14 Mar 2024): hot-staging/stage separation at T+2:50 at **72 km altitude**; Starship passed 100 km at T+3:34; a Starship speed of "26,000 km/h" is quoted but not tied to a specific event — [Cité de l'espace, IFT-3 step by step](https://en.cite-espace.com/space-news/starship-ift3-step-by-step-progress/)
- Flight 4 (6 Jun 2024): Max Q (throttle-down) T+1:02; booster MECO T+2:46; hot-staging separation T+2:51; boostback burn T+2:57–3:47; hot-stage ring jettison T+4:04; booster transonic T+7:04; booster landing burn T+7:09–7:24 (splashdown); **SECO T+8:37**; apogee 213 km, perigee −15 km, inclination 26.8°; reentry start T+44:54; ship transonic T+1:03:17, subsonic T+1:03:38; landing flip T+1:05:36; landing burn T+1:05:39; splashdown T+1:05:56 — [Wikipedia: Starship flight test 4](https://en.wikipedia.org/wiki/Starship_flight_test_4)
- Flight 6 (19 Nov 2024): Max Q T+1:02; MECO T+2:32; hot-staging T+2:39; boostback T+2:44–3:38; booster landing burn T+6:34–6:51; **SECO T+8:27**; in-space Raptor relight T+37:46–37:52; initial orbit 8 × 190 km raised to 50 × 228 km, inclination 26.3°; reentry start T+47:13; landing flip T+1:04:56; landing burn T+1:05:01; splashdown T+1:05:24 (≈23 s landing burn) — [Wikipedia: Starship flight test 6](https://en.wikipedia.org/wiki/Starship_flight_test_6); event times corroborated (within a few seconds) by [Starship SpaceX Wiki, Flight Test 6](https://starship-spacex.fandom.com/wiki/Starship_Flight_Test_6)
- Program status: 12 Starship launches through May 2026 (7 successes, 5 failures); first booster catch on Flight 5; Flight 12 (22 May 2026) was the first Block 3 vehicle — [Wikipedia: SpaceX Starship flight tests](https://en.wikipedia.org/wiki/SpaceX_Starship_flight_tests)

### Inferences
- **Equations of motion (ECI frame, standard rocket dynamics — textbook, e.g., Curtis ch. 13; not a fetched fact):**
  - r̈ = −μ·r/|r|³ + a_J2 (optional) + (T/m)·û_T − (½·ρ(h)·|v_rel|·Cd(M)·A/m)·v_rel
  - v_rel = v − ω_E × r (air-relative velocity; the atmosphere co-rotates), h = |r| − R_E (or geodetic altitude if you include flattening), M = |v_rel|/a(h)
  - ṁ = −T/(Isp(p0)·g0), g0 = 9.80665 m/s²
  - Thrust direction û_T: vertical until the kick time (~10 s), a small pitch kick (a few degrees), then û_T = v_rel/|v_rel| (gravity turn, zero angle of attack) until the atmosphere is negligible (> ~60–80 km), then a closed-loop or tabulated pitch to reach the target orbit. The "~10 s kick then follow the velocity vector" program and typical kick angles are standard practice but no fetched source states them — treat as tunable.
  - J2 acceleration (textbook, Vallado/Curtis; optional for a 90-min LEO loiter): a_J2 = −(3/2)·J2·μ·R²/r⁴ · [ x/r·(1 − 5z²/r²), y/r·(1 − 5z²/r²), z/r·(3 − 5z²/r²) ].
- **[derived] Isp vs ambient pressure** follows directly from the Glenn thrust equation: Isp(p0) = F/(ṁ·g0) = Isp_vac − p0·Ae/(ṁ·g0). Consistency check with Raptor 2 published numbers: ΔF(SL→vac) = 28 tf = 274.7 kN would imply Ae = 274.7e3/101,325 = 2.7 m², and Isp_vac = 347·258/230 ≈ 389 s — the SpaceX-stated SL/vac pairs are not fully self-consistent, so pick one Isp_vac and one Ae and let the formula generate Isp_SL.
- **[derived] Reference areas** (base-area convention): Starship/Super Heavy d = 9 m → A = 63.6 m²; Falcon 9 d = 3.66 m → A = 10.5 m² (diameters are widely published but not from a fetched source).
- **[derived from the Shuttle number]** With 62 % of the losses being gravity and total losses of 1.5–2 km/s, gravity loss ≈ 0.9–1.25 km/s and the remainder (drag + steering) ≈ 0.6–0.75 km/s for Shuttle-class ascents; a slender Falcon 9/Starship with a fast ascent should sit at the low end of gravity loss. This matches the 1.0–1.5 km/s gravity / 0.1–0.2 km/s drag rule of thumb in the task brief, but that split is not independently sourced here.
- The Falcon 9 CRS-8 timeline (max-Q at T+1:24) is later than the ~T+1:12 heard on modern Block 5 Starlink webcasts because CRS-8 was a heavy, lofted ISS mission; the ordering (Mach 1 → max-Q ≈ 10 s later → MECO ≈ 65 s later) is the robust anchor.
- Starship hot-staging at 72 km (IFT-3) is consistent with the brief's "~65 km"; a Starship-class simulation should stage at T+2:30–2:50 at 60–75 km and reach SECO at T+8:30 ± 10 s with an apogee of ~190–230 km and perigee near zero (suborbital-by-design test profile); for an orbital mission the engineer should target a ~7.7 km/s circular velocity at 200–300 km.

### Gaps
- **No fetched source gives velocities at Falcon 9 MECO/SECO or at Starship hot-staging/SECO** (the brief's ~1.6 km/s at staging and ~7.3 km/s at SECO could not be verified; the only speed found, 26,000 km/h ≈ 7.2 km/s, was not tied to an event). Treat these as plausible targets, not validated anchors.
- **No numeric Cd(Mach) table for a slender rocket was found** (Braeunig's site, the usual source, is blocked to automated fetching). Recommended tunable curve consistent with the brief: Cd ≈ 0.25–0.3 for M < 0.8, rising to a peak ≈ 0.5–0.6 at M ≈ 1.1–1.3, decaying to ≈ 0.3 by M = 3 and ≈ 0.25 for M ≥ 5. Label it "unsourced engineering rule of thumb" in the code.
- Max-Q dynamic pressure value (~30–35 kPa for Falcon 9) and Mach/altitude at max-Q were not found in fetched sources.
- Starship stage dry masses and propellant loads (≈3,400 t booster, ≈1,200 t ship) are commonly stated but did not appear in the fetched pages.
- Pitch-kick angle and timing in actual SpaceX guidance are not public.

---

## Key question 3 — Earth atmosphere (US Standard Atmosphere 1976 layers, exponential extension, density, speed of sound)

### Takeaway
Implement the seven USSA76 layers (0, 11, 20, 32, 47, 51, 71 km geopotential) with the two barometric formula forms and compute ρ = p·M/(R*·T); above 86 km use a piecewise-exponential extension (scale height ≈ 5.5–6 km up to ~120 km, growing above). The NASA Glenn three-zone curve fit is fine for quick work below ~47 km but is not valid above the stratopause.

### Cited Findings

**US Standard Atmosphere 1976 layer table (b = 0..6) [modelled standard]** — [Wikipedia: Barometric formula](https://en.wikipedia.org/wiki/Barometric_formula)

| b | h_b (m, geopotential) | P_b (Pa) | T_b (K) | L_b (K/m) | exponent g0·M/(R*·L_b) |
|---|---|---|---|---|---|
| 0 | 0 | 101325 | 288.15 | −0.0065 | −5.25588 |
| 1 | 11000 | 22632.1 | 216.65 | 0.0 | — |
| 2 | 20000 | 5474.89 | 216.65 | +0.001 | 34.1626 |
| 3 | 32000 | 868.019 | 228.65 | +0.0028 | 12.2009 |
| 4 | 47000 | 110.9063 | 270.65 | 0.0 | — |
| 5 | 51000 | 66.9389 | 270.65 | −0.0028 | −12.2009 |
| 6 | 71000 | 3.95642 | 214.65 | −0.002 | −17.0813 |

- Constants: g0 = 9.80665 m/s²; M = 28.9644 kg/kmol (0.0289644 kg/mol); R* = 8.31432e3 J/(kmol·K) (the 1976 standard's value; modern CODATA rounds to 8.31446); P0 = 101325 Pa — [Wikipedia: Barometric formula](https://en.wikipedia.org/wiki/Barometric_formula)

**NASA Glenn "Earth Atmosphere Model" curve fit (metric: h in m, T in °C, p in kPa, ρ in kg/m³) [modelled fit, 1960s data]** — [NASA Glenn, Earth Atmosphere Model](https://www.grc.nasa.gov/www/k-12/airplane/atmosmet.html)
- Troposphere, h < 11,000 m: T = 15.04 − 0.00649·h; p = 101.29·((T + 273.1)/288.08)^5.256
- Lower stratosphere, 11,000–25,000 m: T = −56.46; p = 22.65·exp(1.73 − 0.000157·h)
- Upper stratosphere, h > 25,000 m: T = −131.21 + 0.00299·h; p = 2.488·((T + 273.1)/216.6)^−11.388
- All zones: ρ = p/(0.2869·(T + 273.1)); page notes it is a "standard day" fit assuming p, T vary only with altitude.

### Inferences
- **Barometric formula forms** (the Wikipedia text describes them in words; the exponents in the table confirm the structure):
  - Gradient layer (L_b ≠ 0): T = T_b + L_b·(h − h_b); P = P_b·(T_b/T)^(g0·M/(R*·L_b))
  - Isothermal layer (L_b = 0): P = P_b·exp(−g0·M·(h − h_b)/(R*·T_b))
  - Density: ρ = P·M/(R*·T) = P/(R_air·T) with R_air = R*/M = 8314.32/28.9644 = 287.05 J/(kg·K) [derived]
  - Speed of sound: a = sqrt(γ·R_air·T) with γ = 1.4 → a = 20.05·sqrt(T) m/s, giving 340.3 m/s at 288.15 K [standard relation; verify on the NASA Glenn "speed of sound" page, not fetched]
- **[derived] Check at the 86 km top of the table** (86 km geometric ≈ 84.852 km geopotential using H = r0·Z/(r0 + Z), r0 = 6356.766 km — USSA76 geopotential conversion, not fetched): T = 214.65 − 2.0·13.852 = 186.95 K; P = 3.95642·(214.65/186.95)^(−17.0813) = 0.373 Pa; ρ = 0.373·28.9644/(8314.32·186.95) = 6.96e-6 kg/m³. These reproduce the USSA76 86-km values (0.3734 Pa, 6.958e-6 kg/m³) and are a good unit test.
- **Exponential extension above 86 km (approximate, from USSA76 table values as recalled — verify against NASA-TM-X-74335):** ρ(100 km) ≈ 5.6e-7, ρ(120 km) ≈ 2.2e-8, ρ(150 km) ≈ 2.1e-9 kg/m³. Implement ρ(h) = ρ(86)·exp(−(h − 86 km)/H) with H ≈ 5.6 km for 86–100 km, ≈ 6.2 km for 100–120 km, ≈ 12.7 km for 120–150 km (density scale heights fitted between those points). Above ~150 km set ρ = 0 for a game-grade sim; drag there is negligible on a 10-minute ascent. Known limit: the real thermosphere varies by a factor of several with solar activity, so nothing above 100 km should be trusted to better than ×2–3.
- **Glenn-fit limits [derived by comparison]**: the Glenn upper zone keeps T rising linearly and has no stratopause; above ~47 km it diverges from USSA76 (which turns over at 270.65 K and cools to 214.65 K by 71 km). Use the Glenn fit only below ~47 km; prefer the USSA76 layers everywhere since they cost nothing extra.
- Geopotential vs geometric altitude differs by 1.3 % at 86 km; for a browser sim you may feed geometric altitude directly into the layer table with < 2 % density error, or apply the r0·Z/(r0+Z) conversion.

### Gaps
- Braeunig's atmosphere page (which tabulates USSA76 to 1000 km) is blocked to automated fetching; the ≥ 86 km values above come from memory of the USSA76 tables and should be verified.
- No fetched source for the speed-of-sound relation or γ = 1.4 (standard physics).

---

## Key question 4 — Mars atmosphere (surface state, composition, NASA Glenn model, Mars-GRAM-class density profile, dust, speed of sound, entry interface)

### Takeaway
Surface pressure ≈ 636 Pa at the mean radius (seasonal 400–870 Pa), T ≈ 214 K, 95.1 % CO2 with mean molecular weight 43.49, pressure scale height ≈ 11 km near the surface but shrinking to ≈ 7–8 km in the cold 40–80 km region; the NASA Glenn two-zone fit (p = 0.699·exp(−0.00009·h) kPa) is good to ~30 km but overpredicts density by ≈ 2× at 40 km and ≈ 30× at 80 km, so EDL should use a piecewise-exponential fit through Mars Climate Database/Mars-GRAM values (ρ ≈ 1.5e-2, 7.1e-3, 2.9e-3, 3.3e-4, 1.9e-5, 1.3e-6 kg/m³ at 0, 10, 20, 40, 60, 80 km) with ±50 % (3σ) variability at 50–80 km.

### Cited Findings

**Bulk atmosphere [measured]** — [NSSDC Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html)
- Surface pressure 6.36 mb (636 Pa) at the mean radius, seasonal range 4.0–8.7 mb; 6.9–9 mb at the Viking 1 site; surface density ≈ 0.016 ± 0.006 kg/m³ (as the page currently reads); scale height 11.0 km; total atmospheric mass ≈ 2.5e16 kg; mean temperature ≈ 214 K (−59 °C); diurnal range 184–242 K at Viking 1; winds 2–7 m/s (summer), 5–10 m/s (fall), 17–30 m/s (dust storm)
- Mean molecular weight 43.49; composition by volume CO2 95.1 %, N2 2.59 %, Ar 1.94 %, O2 0.16 %, CO 0.06 %; minor: H2O 210 ppm, NO 100 ppm, Ne 2.5 ppm, HDO 0.85 ppm, Kr 0.3 ppm, Xe 0.08 ppm

**NASA Glenn "Mars Atmosphere Model" (metric: h in m, T in °C, p in kPa, ρ in kg/m³) [modelled fit to Mars Global Surveyor data, 1996/1999]** — [NASA Glenn, Mars Atmosphere Model](https://www.grc.nasa.gov/www/k-12/airplane/atmosmrm.html)
- Lower zone h < 7,000 m: T = −31 − 0.000998·h; p = 0.699·exp(−0.00009·h)
- Upper zone h > 7,000 m: T = −23.4 − 0.00222·h; p = 0.699·exp(−0.00009·h) (same pressure law in both zones as printed)
- Both zones: ρ = p/(0.1921·(T + 273.1)). The page states no validity range or error bounds.

**Mars Climate Database (LMD/ESA) example profile — Viking Lander 1 entry conditions, Ls = 98.9°, 20 Jul 1976, "bright dust" scenario [modelled GCM output]** — [MCD user manual, example output](https://www-mars.lmd.jussieu.fr/mars/esadoc/aopp/um/node10.html)

| nominal height (km) | height rel. ellipsoid (km) | T (K) | p (Pa) | ρ avg (kg/m³) | ρ low–high | H(p) (km) |
|---|---|---|---|---|---|---|
| 0 | −1.22 | 233.2 | 683.3 | 1.533e-2 | 1.466e-2–1.601e-2 | 11.98 |
| 10 | 8.78 | 205.4 | 280.5 | 7.130e-3 | 6.834e-3–7.426e-3 | 10.55 |
| 20 | 18.78 | 187.8 | 104.3 | 2.888e-3 | 2.776e-3–2.999e-3 | 9.65 |
| 40 | 38.78 | 137.9 | 8.738 | 3.304e-4 | 3.134e-4–3.473e-4 | 7.09 |
| 60 | 58.78 | 159.4 | 0.5805 | 1.921e-5 | 1.630e-5–2.213e-5 | 8.19 |
| 80 | 78.78 | 157.6 | 0.0394 | 1.310e-6 | 1.080e-6–1.540e-6 | 8.51 (H(ρ) 8.44) |

The database offers dust scenarios "Viking", "low dust", "dust storm τ = 2" and "dust storm τ = 5" but the example gives numbers only for the bright-dust case.

**Density variability [modelled, Mars-GRAM]**
- For Mars aerocapture the expected 3σ density variation in the 50–80 km band (where most deceleration occurs) is approximately ±50 %, and "uncertainty increases with altitude"; Mars has "relatively large seasonal variations", particularly in the thin upper atmosphere — [Girija, arXiv 2310.10067](https://arxiv.org/pdf/2310.10067)
- "The Mars atmosphere is approximately 1/100th in atmospheric density" of Earth's; vehicles with β above ~50 kg/m² never reach subsonic terminal velocity; subsonic conditions only occur below ~10 km — [Braun & Manning 2007](https://corpora.tika.apache.org/base/docs/govdocs1/095/095306.pdf)

### Inferences
- **[derived] The Glenn pressure law's 0.00009 /m is exactly a 11.11 km scale height** (1/0.00009 = 11,111 m), the origin of the "11.1 km" figure; the 0.1921 kJ/(kg·K) gas constant implies M = 8.314/0.1921 = 43.3 g/mol, consistent with the fact sheet's 43.49.
- **[derived] Glenn fit vs MCD table**: at 20 km Glenn gives p = 115.5 Pa, ρ = 2.93e-3 (MCD 104.3 Pa, 2.89e-3 — good); at 40 km Glenn gives p = 19.1 Pa, T = 160.9 K, ρ = 6.2e-4 (MCD 8.74 Pa, 137.9 K, 3.30e-4 — ≈ 1.9× too dense); at 80 km Glenn gives p = 0.52 Pa, ρ = 3.8e-5 (MCD 0.039 Pa, 1.31e-6 — ≈ 29× too dense). The Glenn fit's temperature also reaches 0 K at h = 112.5 km (−23.4 − 0.00222·h + 273.1 = 0), so it is unusable above ~90 km. **Use Glenn only for the last ~30 km; for the hypersonic phase use a table.**
- **[derived] Piecewise density scale heights from the MCD table** (ρ = ρ_i·exp(−(h − h_i)/H_i)): 0–10 km H = 13.1 km; 10–20 km 11.1 km; 20–40 km 9.2 km; 40–60 km 7.0 km; 60–80 km 7.5 km. (Density scale heights differ from pressure scale heights because T changes with height.)
- **[derived, extrapolation — uncertain by ×3 or more]** Continuing from 80 km with H ≈ 8–10 km: ρ(100 km) ≈ 1.1e-7 – 1.8e-7 kg/m³; ρ(125 km) ≈ 5e-9 – 1.5e-8 kg/m³. At 125 km and 6 km/s the dynamic pressure is q = ½·1e-8·(6000)² ≈ 0.2 Pa, i.e., aerodynamic forces are negligible there, which is why 125 km is a natural "entry interface" to switch from Keplerian propagation to integrated EDL. The Mars thermosphere above ~100 km warms and its scale height grows again, so a single exponential will under-predict density there; irrelevant for loads, relevant only for timing.
- **[derived] Speed of sound**: a = sqrt(γ·R·T) with R = 192.1 J/(kg·K) and γ ≈ 1.3 for cold CO2 (γ value is a standard thermodynamic figure, not fetched): a ≈ 229 m/s at 210 K, ≈ 245 m/s at 240 K, ≈ 186 m/s at the 138 K found at 40 km. The commonly quoted "~240 m/s" applies to warm near-surface air; in the cold middle atmosphere Mach numbers are higher for the same speed.
- Dust storms: the MCD scenario list (τ = 2, 5) and the fact sheet's dust-storm wind speeds confirm dust matters, but no fetched source quantified the density change. For the sim, exposing a "dust scenario" multiplier on density of roughly ±50 % at 40–80 km (the Girija 3σ figure) is a defensible knob.
- Mars-relative wind: 17–30 m/s dust-storm winds (fact sheet) are < 1 % of hypersonic speed but are comparable to the ~50 m/s touchdown-phase speeds, so include wind only in the terminal phase if at all.

### Gaps
- No fetched source gives Mars-GRAM density at 100 and 125 km; the values above are extrapolations.
- The fact sheet's mean molecular weight (43.49) differs slightly from the 43.34 g/mol in the task brief; the brief's value was not found in a fetched source.
- No quantitative dust-storm density/temperature perturbation table was found (Mars-GRAM documentation PDFs surfaced in search but were not fetched).
- The 125 km entry-interface convention and the MSL entry radius of 3522.2 km (= 125 km above a 3397.2 km reference) are standard in the EDL literature but did not appear explicitly in the fetched texts.

---

## Key question 5 — Mars EDL physics (entry velocities, flight-path angles, ballistic coefficients, L/D, peak g, Sutton–Graves heating, heat loads, TPS limits, radiative equilibrium)

### Takeaway
Past landers entered at 4.7 km/s (Viking, from orbit) to 7.26 km/s (Pathfinder, direct) at γ = −11.5° to −17° with β = 63–115 kg/m² and L/D 0–0.24; MSL (3152.5 kg, 4.519 m, L/D 0.24, 16° trim) saw ~15 g peak and had a 226 W/cm² / 6400 J/cm² PICA design envelope. Human-scale vehicles land at β ≈ 300–450 kg/m² (Braun & Manning) — a 150–250 t belly-first Starship on a ~450 m² planform at Cd 1.1–1.5 gives β ≈ 220–500 kg/m² [derived]. Stagnation heating: q = k·sqrt(ρ/R_n)·V³ with k ≈ 1.74e-4 (Earth air) and 1.89e-4 (Mars CO2/N2) in SI (W/m², ρ in kg/m³, R_n in m, V in m/s); the exact 1.7415e-4/1.9027e-4 digits were not found.

### Cited Findings

**Past-lander table (Braun & Manning 2007, Table 1) [measured for flown, planned for MSL/Phoenix]** — [Braun & Manning, "Mars Exploration Entry, Descent and Landing Challenges" (2007)](https://corpora.tika.apache.org/base/docs/govdocs1/095/095306.pdf); record also at [Caltech Authors](https://authors.library.caltech.edu/records/hb8y4-mqn88)

| Mission | Entry mass (kg) | β (kg/m²) | V_entry (km/s) | γ_entry (°) | L/D | Peak heat rate (W/cm²) | Chute dia (m) | Deploy Mach | Deploy alt (km) |
|---|---|---|---|---|---|---|---|---|---|
| Viking 1 & 2 (1976) | 992 | 64 | 4.7 | −17 | 0.18 | 26 | 16 | 1.1 | 5.79 |
| Pathfinder (1997) | 584 | 63 | 7.26 | −14.06 | 0 | 100 | 12.5 | 1.57 | 9.4 |
| MER-A Spirit (2004) | 827 | 94 | 5.4 | −11.49 | 0 | 44 | 14 | 1.77 | 7.4 |
| MER-B Opportunity (2004) | 832 | 94 | 5.5 | −11.47 | 0 | 44 | 14 | 1.77 | 7.4 |
| Phoenix (planned 2008) | 600 | 70 | 5.67 | −12.5 | 0.06 | 58 | 11.5 | 1.6 | 9 |
| MSL (planned, 2010 design) | 2800 | 115 | 6 | −15.2 | 0.22 | 155 | 19.7 | 2 | 6.5 |

- Human-scale vehicles: aerocapture of a 15 m, 100 t vehicle gives β ≈ 400 kg/m²; entry from orbit of an 80–120 t vehicle gives β ≈ 300–450 kg/m², "well above" the 63–94 kg/m² flown; aerocapture at 8.5 km/s has ≈ 20× the peak heating rate and ≈ 4× the integrated heat load of a 4 km/s entry from orbit; entry from orbit also reduces peak deceleration for crews relative to direct entry — [Braun & Manning 2007](https://corpora.tika.apache.org/base/docs/govdocs1/095/095306.pdf) [estimated]

**MSL as flown / as designed**
- Entry-vehicle mass 3152.5 kg (expected mass at entry interface); reference diameter 4.519 m nominal (4.500 m measured), reference area 16.039 m² nominal (15.904 m² measured); planet-relative entry velocity ≈ 6000 m/s; hypersonic angle of attack ≈ −16°; parachute deploy "near Mach 1.7"; entry-balance-mass jettison/SUFR "near Mach 2.0"; deceleration pulse ≈ 213 s; time on parachute ≈ 117 s; bank reversals at ≈ 612, 633, 663 s; reconstructed L/D 1–4 % below prediction — [Schoenenberger et al., AAS 13-306](https://ntrs.nasa.gov/api/citations/20130010088/downloads/20130010088.pdf) [measured, preliminary reconstruction]
- Design values: entry mass basis 3308 kg, entry velocity 5.9 km/s, design flight-path angles −14° (shallow) and −15.5° (steep), nominal L/D 0.24, trim angle of attack 16°, sideslip < 2°, **design heating limit 226 W/cm², design heat-load limit 6400 J/cm²**, reconstructed leeside surface heating up to 77.2 W/cm² — [MEDLI initial thermal assessment, AAS 2013-311](https://www.ssdl1.gatech.edu/sites/default/files/ssdl-files/papers/conferencePapers/AAS-2013-311.pdf) [design/estimated]
- Spherical apex (nose) radius 1.125 m on the 70° sphere-cone; PICA thickness 1.25 in (31.75 mm); free-stream enthalpy 18 MJ/kg; heatshield designed for > 200 W/cm²; boundary-layer transition observed at 63–65 s after entry — [MEDLI AIAA 2013-0908](https://www.ssdl1.gatech.edu/sites/default/files/ssdl-files/papers/conferencePapers/AIAA-2013-0908.pdf)
- Entry velocity ≈ 5.8 km/s; **peak deceleration 15 g**; peak heat-shield temperature 2,090 °C; heat shield 4.5 m PICA; 16 m parachute deployed at ≈ 10 km altitude, ≈ 470 m/s, rated to Mach 2.2, 289 kN max drag; heat-shield jettison ≈ 3.7 km; powered descent from ≈ 1.8 km at ≈ 100 m/s; eight Mars Lander Engines of 400–3,100 N each; 7.6 m sky-crane tether; two 75 kg tungsten balance masses ejected before entry, six 25 kg before parachute; RCS ≈ 500 N per thruster pair; EDL ≈ 7 min; EDL system 2,401 kg incl. 390 kg landing propellant; landing ellipse 20 × 7 km — [Wikipedia: Mars Science Laboratory](https://en.wikipedia.org/wiki/Mars_Science_Laboratory) [secondary source; values are measured/flight]

**Sutton–Graves stagnation-point convective heating**
- Formula (Mars Microprobe analysis, Eq. 1): q_s = k·ρ∞^0.5·R_n^−0.5·V∞³ with q_s in W/cm², ρ∞ in kg/m³, R_n in m, V∞ in m/s; **Mars (97 % CO2 / 3 % N2 by mass) k = 1.89e-8 in those units, i.e. 1.89e-4 in SI (W/m²)**; R_n is the nose radius of the sphere-cone (0.0875 m for Microprobe); accuracy vs CFD: ≈ 11 % low before peak heating, ≈ 18 % high after; Microprobe (direct entry) peak stagnation heating 194 W/cm² (CFD) and ≈ 8,800 J/cm² integrated — [Mitcheltree et al., AIAA 98-0170](https://ntrs.nasa.gov/api/citations/20040087200/downloads/20040087200.pdf) [modelled]
- Earth air: Sutton & Graves constant quoted as Q̇_K = 1.74e-4 W/m² (SI form q = Q̇_K·sqrt(ρ/r)·v³, optionally times an enthalpy-ratio factor (H_aw − H_w)/(H_aw − H_a)); that author adopts 1.83e-4 as a conservative upper value — [arXiv 2107.13513](https://arxiv.org/pdf/2107.13513) [modelled]

**TPS material limits**
- PICA (Stardust): nominal stagnation heat flux 1200 W/cm² at 12.6 km/s inertial entry, peak surface pressure 0.5 atm, nominal integrated heat load 36.5 kJ/cm² (overshoot ≈ 55 kJ/cm²); arcjet tests at 1630 W/cm² (0.65 atm), 1150 W/cm², 580 W/cm² and 400 W/cm²; test heat loads 5.8–49.9 kJ/cm²; bulk density 0.22–0.27 g/cm³; adhesive bondline limit 250 °C — [Covington, NASA PICA re-evaluation](https://ntrs.nasa.gov/api/citations/20070014634/downloads/20070014634.pdf) [measured]
- TUFROC (considered for Starship's heat shield) is rated for reusable entry above 1,600 °C and single use at 2,000 °C — [Mwaene & Banda, Qeios](https://qeios.com/read/VJ9NXB/pdf) [stated]

### Inferences
- **[derived] Entry speed ↔ hyperbolic excess speed** at the MSL entry radius r = 3522.2 km: V_entry = sqrt(v_inf² + 2μ_Mars/r) with 2μ/r = 2·42828.376/3522.2 = 24.32 km²/s². Hence v_inf = 2.44, 3.42, 4.23, 4.97, 5.65 km/s ↔ V_entry = 5.5, 6.0, 6.5, 7.0, 7.5 km/s; the 2020-window arrival v_inf of 2.5748 km/s (Q7) gives 5.56 km/s inertial. Mars's rotation at that radius is 2π·3522.2/88642 = 0.25 km/s, so planet-relative speed differs from inertial by up to ±0.25 km/s·cos(latitude) depending on approach azimuth — which explains the 5.8 vs 5.9 vs 6.0 km/s spread quoted for MSL in different sources (inertial vs relative, design vs flight).
- **[derived] Entry from orbit**: from a 400 km circular orbit (v = 3.36 km/s) a small deorbit burn gives V_entry ≈ sqrt(μ(2/r_EI − 1/a)) ≈ 3.55 km/s; from a 1-sol-class elliptical orbit (a ≈ 20,400 km) V_entry ≈ 4.7 km/s — matching Viking's 4.7 km/s. So "entry from orbit = 4–4.7 km/s" presumes high elliptical parking orbits; from low circular orbit it is ≈ 3.5–3.6 km/s.
- **[derived] MSL ballistic coefficient**: β = m/(Cd·A) = 3152.5/(Cd·16.04) = 131 kg/m² at Cd = 1.5, 140 kg/m² at Cd = 1.4 (the commonly quoted "~140" assumes Cd ≈ 1.4 at the 16° trim); the 115 kg/m² in Braun & Manning is the 2007 design point with 2800 kg.
- **[derived] Starship belly-first β**: with planform ≈ 9 m × 50 m = 450 m² (9 m diameter and ~50 m length are widely published, not from fetched sources) and Cd 1.1–1.5: m = 150 t → 222–303 kg/m²; m = 250 t → 370–505 kg/m². This brackets Braun & Manning's 300–450 kg/m² for 80–120 t human-scale vehicles. Use β ≈ 350 ± 100 kg/m² as the default and expose Cd and mass as sliders.
- **[derived] Sutton–Graves sanity numbers for the sim**: MSL-like, R_n = 1.125 m, ρ = 4e-4 kg/m³ (≈ 38 km on the MCD profile), V = 5.2 km/s: q = 1.89e-4·sqrt(4e-4/1.125)·5200³ = 5.0e5 W/m² = 50 W/cm² (laminar stagnation). The 226 W/cm² MSL design limit was driven by turbulent leeside heating with margin, so a Sutton–Graves-only sim will under-predict peak TPS heating on large blunt bodies by ≈ 2–4×; treat S-G as the "stagnation-point reference" and apply a margin factor for design checks. For Starship belly-first use a large effective radius (several metres for the belly, ~1–2 m for the nose) — the larger R_n is what keeps heat flux low; the price is the heat load spread over a huge area.
- **[derived] Radiative-equilibrium temperature**: T = (q/(ε·σ))^(1/4), σ = 5.670374419e-8 W·m⁻²·K⁻⁴ (CODATA 2018). With ε = 0.9: q = 30 W/cm² → 1,557 K (1,284 °C); 50 W/cm² → 1,769 K (1,496 °C); 63 W/cm² → 1,873 K (1,600 °C). Inverting: a reusable tile rated to 1,600 °C tolerates ≈ 63 W/cm²; 1,400 °C ≈ 40 W/cm². So a reusable Starship Mars entry must keep stagnation heat flux below roughly 40–60 W/cm², which at β ≈ 350 kg/m² and 6–7 km/s is only achievable with large nose/belly radii and a lifting trajectory. Peak heat-shield temperature 2,090 °C for MSL (above) corresponds via the same formula (ε ≈ 0.9) to ≈ 160 W/cm², consistent with the > 200 W/cm² design class.
- Peak deceleration scales as ≈ V_entry²·sin|γ|/(2·H·e) for ballistic entry (Allen–Eggers, textbook): steeper γ and faster V give higher g; MSL's 15 g at ~5.8 km/s, −15.5° is the anchor; a crewed Starship must fly shallower (−10° to −13°) and use lift to stay under ~4–5 g (crew limit not sourced here).

### Gaps
- The exact constants 1.7415e-4 (Earth) and 1.9027e-4 (Mars) in the brief were not found in any fetched source; fetched values are 1.74e-4 and 1.89e-4 (≈ 1 % lower for Mars). Either is fine for a sim; cite Sutton & Graves NASA TR R-376 (1971) if the four-digit versions are used.
- Reconstructed (as-flown) MSL peak heat flux and total heat load were not in the fetched texts — only the design limits (226 W/cm², 6,400 J/cm²) and the Wikipedia 15 g / 2,090 °C figures. The brief's "~5 kJ/cm²" as-flown load is unverified.
- **No published Starship Mars-entry analysis (β, L/D, peak g, heat flux, landing-burn Δv) was found** — searches returned unrelated NASA/Georgia Tech vehicles. The Starship numbers above are derived envelopes. Starship belly-flop L/D (often quoted ~0.3–0.5 at high angle of attack) is unsourced.
- Starship silica/ceramic tile temperature rating (~1,400–1,600 °C) and metallic-tile data were not found in fetched sources; only TUFROC's 1,600 °C reusable rating was.
- Crew deceleration limits (< 4–5 g sustained) were not sourced (NASA-STD-3001 would be the reference).

---

## Key question 6 — Terminal descent (parachute scaling, supersonic retropropulsion Δv, landing burn, plume–ground interaction)

### Takeaway
Braun & Manning show why chutes stop at ~1 t: decelerating 100 t from Mach 3 to 50 m/s would need a ≈ 130 m supersonic parachute (90 m for 50 t); all-propulsive descent from Mach 3 costs ≈ 1.0–1.25 km/s (incl. 265 m/s cross-range) at 20–30 % propellant mass fraction, while a Starship-class vehicle at β ≈ 300–500 kg/m² falls at a terminal speed of ≈ 385–500 m/s (Mach ≈ 1.6–2.1) near the surface [derived], consistent with a ≈ 0.5–1.0 km/s landing burn.

### Cited Findings
- "A parachute descent phase for human-class vehicles ... is likely impractical": a 100 t vehicle from Mach 3 to 50 m/s needs a supersonic chute of ≈ 130 m diameter; 50 t needs ≈ 90 m; the robotic class of ≈ 1 t is likely the limit of Viking-era technology; non-propulsive airbag systems are limited to ≈ 0.6 t; MSL's target landed payload was 0.75 t — [Braun & Manning 2007](https://corpora.tika.apache.org/base/docs/govdocs1/095/095306.pdf) [estimated]
- Supersonic retropropulsion: "little experience" firing large thrusters into high-dynamic-pressure supersonic flow; flow stability, control interaction and thermal protection are the key issues; propulsive descent from Mach 3 needs ≈ 1.0–1.25 km/s ΔV including a 265 m/s cross-range allowance; propellant mass fraction ≈ 20–30 % all-propulsive, ≈ 12–18 % parachute-assisted — [Braun & Manning 2007](https://corpora.tika.apache.org/base/docs/govdocs1/095/095306.pdf) [estimated]
- Flown parachute envelope: largest flown Mars chute 16 m (Viking, MSL), deploy Mach 1.1–2.0, deploy altitudes 5.8–9.4 km (Table 1 above); MSL chute rated to Mach 2.2 with 289 kN peak drag — [Braun & Manning 2007](https://corpora.tika.apache.org/base/docs/govdocs1/095/095306.pdf); [Wikipedia: Mars Science Laboratory](https://en.wikipedia.org/wiki/Mars_Science_Laboratory)
- Human exploration needs 40–80 t surface elements landed with tens-of-metres precision — [Braun & Manning 2007](https://corpora.tika.apache.org/base/docs/govdocs1/095/095306.pdf)
- Earth analogue for the final manoeuvre: Starship Flight 6 landing flip at T+1:04:56, landing burn start T+1:05:01, splashdown T+1:05:24 (≈ 23 s burn after a ≈ 5 s flip) — [Wikipedia: Starship flight test 6](https://en.wikipedia.org/wiki/Starship_flight_test_6)
- Delta-v table entry: Low Mars orbit ↔ Mars surface 4.1 km/s (ascent-equivalent) — [Wikipedia: Delta-v budget](https://en.wikipedia.org/wiki/Delta-v_budget)

### Inferences
- **[derived] Terminal velocity near the surface**: v_t = sqrt(2·β·g/ρ) with g = 3.71 m/s², ρ = 0.015 kg/m³: β = 300 → 385 m/s; β = 400 → 445 m/s; β = 500 → 497 m/s; with a ≈ 230–240 m/s that is Mach 1.6–2.1. A high-β vehicle therefore arrives at the landing-burn start (≈ 2–3 km) still supersonic — the Braun & Manning point that β > 50 kg/m² never goes subsonic.
- **[derived] Landing-burn Δv budget**: Δv ≈ v_at_ignition + g·t_burn + margin ≈ 450 + 3.71·40 + 100 ≈ 700 m/s for a 40 s burn — inside the brief's 0.5–1.0 km/s and below Braun & Manning's 1.0–1.25 km/s from Mach 3 (which includes 265 m/s cross-range). Expose ignition altitude and thrust-to-weight (Mars T/W 2–3 for a 3-engine landing) as parameters; higher T/W shortens the burn and cuts gravity loss.
- Propellant mass for the landing: with Isp ≈ 350 s (Raptor SL in Mars's near-vacuum behaves close to vacuum Isp; use ≈ 370 s) and Δv = 700 m/s, mass ratio = exp(700/(370·9.80665)) = 1.213 → ≈ 17.5 % of the landed mass, consistent with the 12–30 % range above.
- Plume–ground interaction: a Raptor-class landing on regolith will excavate; the sim can flag "cratering risk" below a chosen altitude/thrust threshold, but no quantitative erosion model was found in fetched sources (see Gaps).

### Gaps
- No fetched source on Raptor-class plume–surface interaction (cratering depth, ejecta) at Mars; NASA plume-surface-interaction work exists but was not retrieved.
- No published Starship-specific landing-burn parameters (ignition altitude/Mach, engine count, Δv) — only Earth test timings.
- The maximum parachute size actually demonstrated at Mars (16 m) vs the "~1 t class" statement is consistent, but a supersonic-parachute Mach/dynamic-pressure qualification envelope beyond MSL's Mach 2.2 was not sourced.

---

## Key question 7 — Interplanetary leg (patched conics, SOI radii, escape Δv, Lambert, porkchop plots, Oberth, Δv budgets, departure C3 / arrival v_inf by window)

### Takeaway
Patched conics with r_SOI,Earth = 924,652 km and r_SOI,Mars = 577,133 km, Standish elements for the planets, and a universal-variable Lambert solver (Newton on z with Stumpff functions) reproduce the 2020 reference transfer (C3 = 14.045 km²/s², arrival v_inf = 2.5748 km/s, 207 d, total Δv 5.892 km/s from 300 km LEO to 200 km LMO) — my recomputation from the constants here gives 3.825 + 2.067 = 5.892 km/s, a clean validation anchor. Window-by-window C3/v_inf for 2026–2033 were not found in fetched sources and must be generated by the sim's own porkchop routine.

### Cited Findings
- Sphere-of-influence radii: Earth r_SOI ≈ 924,652 km (≈ 145 Earth radii); Mars r_SOI ≈ 577,133 km (≈ 170 Mars radii) — [Conte, MS thesis (Penn State, 2014)](https://bpb-us-e1.wpmucdn.com/sites.psu.edu/dist/4/68541/files/2017/01/Davide_Conte_-_MS_Thesis-vhibgx.pdf) [derived in source from r_SOI = a·(m/M)^(2/5)]
- Patched-conic assumptions used there: impulsive burns; point-mass Sun, Earth, Mars within their SOIs; no SRP, oblateness or third bodies; planetary positions from Standish's algorithm (checked against JPL Horizons); Earth parking orbit 300 km circular; Mars capture into 200 km circular orbit at periapsis of the arrival hyperbola — [Conte thesis](https://bpb-us-e1.wpmucdn.com/sites.psu.edu/dist/4/68541/files/2017/01/Davide_Conte_-_MS_Thesis-vhibgx.pdf)
- Reference transfer (2020 window, minimum-Δv Type I): total Δv = 5.8921 km/s; C3 at launch = 14.045 km²/s²; arrival v_inf = 2.5748 km/s; depart 27 Jul 2020, arrive 19 Feb 2021, TOF 207 d; the minimum-total-Δv date pair generally differs from the minimum-C3 and minimum-v_inf pairs — [Conte thesis](https://bpb-us-e1.wpmucdn.com/sites.psu.edu/dist/4/68541/files/2017/01/Davide_Conte_-_MS_Thesis-vhibgx.pdf) [modelled]
- Lambert solver outline (universal variables, Curtis-style): universal anomaly χ with z = α·χ² (continuous across ellipse/hyperbola); Newton–Raphson on F(z) = 0 from z = 0; Stumpff functions C2(z), C3(z); Lagrange coefficients f, g (ġ, ḟ not needed for the velocities); sign of A chosen by comparing the minimum-energy transfer time with the requested TOF; prograde transfers only — [Conte thesis](https://bpb-us-e1.wpmucdn.com/sites.psu.edu/dist/4/68541/files/2017/01/Davide_Conte_-_MS_Thesis-vhibgx.pdf)
- 2033–2035 is named a favourable window where the ≈ 15-year orbital-mechanics cycle and the 11-year solar cycle "probably coincide" — [Conte thesis](https://bpb-us-e1.wpmucdn.com/sites.psu.edu/dist/4/68541/files/2017/01/Davide_Conte_-_MS_Thesis-vhibgx.pdf)
- Δv table (km/s): LEO → Mars transfer 4.3 ("typical", not minimal); Earth escape (C3 = 0) → Mars transfer 0.6; Mars transfer → Mars capture orbit 0.9; capture orbit → low Mars orbit 1.4; Mars transfer → LMO 2.7 (not minimal); LEO → TLI 3.20; Oberth effect: "using propellant at low potential energy/high speed multiplies the effect of a burn", assumed in the LEO-based figures (possible with high-thrust chemical propulsion) — [Wikipedia: Delta-v budget](https://en.wikipedia.org/wiki/Delta-v_budget) [estimated]
- A MATLAB porkchop-plot script for ballistic Earth–Mars trajectories exists as a worked example of the grid-of-dates method — [MathWorks File Exchange 39248](https://www.mathworks.com/matlabcentral/fileexchange/39248-earth-to-mars-interplanetary-pork-chop-plots)

### Inferences
- **Hyperbolic departure from a circular parking orbit** (textbook, Curtis ch. 8): Δv = sqrt(v_inf² + 2μ/r) − sqrt(μ/r), with C3 = v_inf². **[derived] Anchor**: r = 6678.137 km, C3 = 14.045 → v_p = sqrt(14.045 + 119.374) = 11.551 km/s, v_circ = 7.726 km/s, **Δv_depart = 3.825 km/s**. Mars capture into 200 km circular (r = 3596.2 km) from v_inf = 2.5748: v_p = sqrt(6.630 + 23.819) = 5.518 km/s, v_circ = 3.451 km/s, **Δv_capture = 2.067 km/s**; total 5.892 km/s = Conte's 5.8921 km/s. Reproducing this is the best end-to-end test of the engineer's constants + formulas.
- **[derived] Hohmann baseline** (circular coplanar, a_E = 1 au, a_M = 1.52371 au, μ_Sun above): transfer a_t = 1.26186 au; v_peri = 32.73 km/s vs Earth's 29.78 → v_inf,E = 2.95 km/s (C3 ≈ 8.7 km²/s²); v_apo = 21.48 km/s vs Mars's 24.08 → v_inf,M = 2.60 km/s; TOF = 258.9 d. Real windows (eccentric, inclined orbits) range from about this up to roughly C3 ≈ 15–20 km²/s² — the 2020 value of 14.0 is typical; 2033 should sit near the Hohmann floor and 2026/2028 above it. Those window rankings are inference from the ~15-year cycle statement, not fetched numbers.
- **Porkchop recipe**: for each (departure JD, arrival JD) on a grid (e.g., 1-day steps over ±120 d around the nominal window, TOF 120–400 d): compute r_E, v_E and r_M, v_M from the Standish elements (Q1) in heliocentric ecliptic J2000; solve Lambert (prograde) for v1, v2; C3 = |v1 − v_E|², v_inf,arr = |v2 − v_M|; contour C3 and v_inf,arr; the double-lobed shape separates Type I (< 180° transfer) and Type II (> 180°). Compute the planets' velocities by finite-differencing positions ±0.5 d (adequate at the Standish accuracy) or analytically from the elements.
- **Oberth effect in the sim**: perform departure as a single impulsive (or short finite) burn at LEO perigee rather than escaping first and then adding v_inf — the Delta-v budget table shows the saving (3.825 km/s from LEO for C3 = 14 vs. 7.726·(√2 − 1) = 3.20 km/s to escape plus 3.75 km/s of v_inf if added afterwards). Finite-burn gravity loss for a 10–20 min Raptor burn is small but non-zero; model it by integrating thrust over the burn arc.
- **Mid-course corrections**: typically tens of m/s total (two or three TCMs); no fetched source gives a number — budget ≈ 50 m/s as a placeholder and label it.
- **Heliocentric propagation**: once outside the Earth SOI the transfer is a two-body conic about the Sun; propagate analytically with Kepler's equation (Q1 method) rather than numerically — no accumulation of error and instantaneous scrubbing of the timeline. Switch to Mars-centred coordinates at r_SOI,Mars = 577,133 km (or earlier, at ~1e6 km, for smoother visuals) by subtracting Mars's position/velocity from the Standish ephemeris.

### Gaps
- **Departure C3 and arrival v_inf for the 2026, 2028/29, 2031 and 2033 windows were not found in fetched sources** (the thesis gives 2020 only; its 2033–2035 tables were not in the extracted text). The engineer's porkchop routine should generate them; sanity range from the Hohmann baseline: C3 ≈ 8–20 km²/s², v_inf,arr ≈ 2.5–4 km/s for Type I.
- Izzo's Lambert algorithm (poliastro/lamberthub) was not fetched; the Curtis universal-variable method above is sufficient and simpler to implement in TypeScript.
- Mid-course Δv budget unsourced.

---

## Key question 8 — Numerical integration, time steps, event handling, frames, unit scaling

### Takeaway
(Engineering recommendations — mostly inference; see Gaps for missing citations.) Use fixed-step RK4 for the thrusting/atmospheric phases (ascent 0.05–0.2 s, EDL 0.05–0.1 s), analytic Kepler propagation for coasts and the heliocentric cruise, event detection by bracketing/bisection on sign changes (staging, MECO, interface crossings), and separate frames per phase (ECI → heliocentric ecliptic J2000 → Mars-centred) with km/s or m/s units in float64.

### Cited Findings
- The Standish ephemeris algorithm plus Kepler's equation (Newton iteration to 1e-6°) is JPL's recommended way to compute approximate planetary positions for mission planning; higher-precision needs go to Horizons — [JPL SSD Approximate Positions](https://ssd.jpl.nasa.gov/planets/approx_pos.html)
- The reference porkchop/transfer study (Conte) integrates nothing numerically in the heliocentric phase: it uses conic (Lambert) arcs and Standish positions, with impulsive burns — [Conte thesis](https://bpb-us-e1.wpmucdn.com/sites.psu.edu/dist/4/68541/files/2017/01/Davide_Conte_-_MS_Thesis-vhibgx.pdf)
- Flight anchors that define the required temporal resolution: MSL's deceleration pulse lasts ≈ 213 s and the parachute phase ≈ 117 s — [Schoenenberger et al., AAS 13-306](https://ntrs.nasa.gov/api/citations/20130010088/downloads/20130010088.pdf); Starship's landing burn lasts ≈ 23 s after a ≈ 5 s flip — [Wikipedia: Starship flight test 6](https://en.wikipedia.org/wiki/Starship_flight_test_6)

### Inferences
- **Integrator choice**: RK4 (4th order, non-symplectic) is accurate and simple for the short, force-rich phases (thrust, drag, mass change) where symplecticity buys nothing because the system is not Hamiltonian. For long unpowered orbits (LEO loiter of hours–days while waiting for refuelling), RK4 slowly drifts in energy; either (a) propagate analytically with Kepler's equation (exact two-body, zero drift — preferred), or (b) use velocity-Verlet/leapfrog (2nd-order symplectic, bounded energy error) if you want J2 or drag perturbations. Textbook facts (Hairer–Lubich–Wanner; Wikipedia "Symplectic integrator"), not fetched this session.
- **Time steps**: ascent 0.05–0.2 s (thrust and Cd(M) change fast through max-Q; 0.1 s gives ≈ 6,000 steps for a 10-min ascent — trivial for a browser); orbit (if integrated) 1–10 s; cruise: analytic, evaluate at display frame rate; EDL hypersonic phase 0.05–0.1 s (peak-g pulse of ~10–20 s width must be resolved); landing burn 0.02–0.05 s (fast thrust vectoring). Run the physics in fixed steps decoupled from render frames.
- **Events**: detect sign changes of event functions (altitude − h_target, propellant mass − 0, time − t_MECO, Mach − M_deploy, |r| − r_SOI) between steps, then bisect or interpolate (Hermite with the stored derivative) to locate the event, apply the discontinuity (drop stage mass, change Cd/A/Isp, switch guidance mode), and restart integration from the event time. Never let a step straddle a staging event.
- **Frames**: ascent/LEO in ECI (origin Earth centre, J2000 equatorial; atmosphere rotates at ω_E, launch site at latitude φ has inertial speed 465.1·cos φ m/s — e.g., 408 m/s at 28.6° (KSC), 410 m/s at 26° (Boca Chica)); departure hyperbola in ECI until r_SOI; cruise in heliocentric mean-ecliptic J2000 (the JPL table frame) — rotate the Earth-relative v_inf vector into the ecliptic frame using ε = 23.43928° (Q1 matrix, inverse direction); arrival/EDL in a Mars-centred frame (Mars-centred inertial for the approach, then Mars-fixed rotating for descent and landing-site targeting; Mars's rotation 240.7 m/s at the equator must be added when converting inertial to planet-relative velocity at entry).
- **Units and precision**: float64 has ≈ 16 significant digits, so km and s (μ in km³/s², positions in km) or m and s both work; the only real hazard is computing a planet-relative state by subtracting two heliocentric vectors of ~2e8 km — the result is still good to ~1e-8 km, so no problem. Do normalise for Newton solvers (Kepler, Lambert: work in au/day or in units where μ = 1) to keep F(z) and its derivative O(1). Avoid single-precision WebGL buffers for physics state; convert only for rendering.
- **Validation tests to code**: (1) 300 km circular orbit stays within 1 m altitude over 10 orbits with analytic propagation; (2) Hohmann numbers of Q7 within 1 %; (3) Conte 2020 transfer Δv 5.892 km/s within 0.5 %; (4) USSA76 86 km density 6.96e-6 kg/m³; (5) MSL-like entry (3152 kg, β ≈ 135, L/D 0.24, 5.8 km/s rel., −15.5°) peaks near 12–15 g and deploys a chute near Mach 1.7–2 at ≈ 10 km; (6) Starship-class ascent reaches SECO at ≈ T+8:30 with ≈ 7.7 km/s at 200–300 km.

### Gaps
- No fetched source for RK4 vs symplectic integrator properties or for recommended step sizes; the recommendations are standard numerical-methods practice.
- No fetched source for launch-site latitudes (KSC 28.6° N, Boca Chica 26.0° N are widely published).

---

## Key question 9 — Propellant boil-off in LEO (LOX/CH4 and LH2), relevant to refuelling waits

### Takeaway
Fetched sources were thin: a 2006 Georgia Tech depot study implies ≈ 0.07 %/day combined boil-off for a 50 t LOX/LH2 depot with 50-layer MLI at 350 km (≈ 2,000 kg over 60 days), and NASA's 2015 zero-boil-off tests put the LOX ZBO mass break-even at ≈ 7–8 days of loiter; no LOX/LCH4 %/day figure or Starship-depot number was found, so the sim should expose boil-off as a parameter (order 0.05–0.5 %/day passive, ≈ 0 with active cooling) and label it uncertain.

### Cited Findings
- LEO depot sizing study (350 km, 28.5°, 10-year life, passive insulation = 50 layers of MLI): for a 50,000 kg usable LOX/LH2 load and 60 days storage, "more than 2,000 kg of extra propellant is needed to account for 60 days worth of boil-off"; the tool assumes zero boil-off when an active ZBO cryocooler is used; its Table 1 of passive boil-off rates was not in the extractable text — [Street, Georgia Tech AE 8900 (2006)](https://ssdl1.gatech.edu/sites/default/files/ssdl-files/papers/mastersProjects/StreetD-8900.pdf) [modelled]
- NASA ZBO ground test (LN2 as LOX surrogate, 1.2 m / 1.2 m³ tank, 220 K shroud simulating LEO): reverse turbo-Brayton cryocooler of 15 W at 77 K; passive parasitic heat ≈ 4.2 W (projected 1.2–1.5 W with better insulation); tank pressure rise cut 88 % with active cooling; pressure held ±0.1 psi for 19 days; scaling to a 7.5 m, 186 m³ LOX tank gives a loiter break-even of ≈ 7.3 days (≈ 8 days after a 6.5 % dry-mass increase) beyond which ZBO hardware beats carrying boil-off margin — [Plachta, Johnson & Feller, NASA/26th Space Cryogenics Workshop (2015)](https://ntrs.nasa.gov/api/citations/20150023073/downloads/20150023073.pdf) [measured/modelled]

### Inferences
- **[derived]** 2,000 kg / 50,000 kg over 60 days ≈ 4 % → ≈ 0.07 %/day for the combined LOX/LH2 depot with 50-layer MLI; LH2 (20 K) dominates such losses, so LOX-alone and LCH4 (90–112 K storage) with equivalent insulation should be lower per unit mass, order 0.01–0.1 %/day; a bare stainless Starship with no MLI and a sun-facing tank wall will be far worse (the brief's "% per day" class is plausible, but no fetched source supports a specific number).
- For the simulation: boil-off mass = m_prop·r·t_days with r a user-visible parameter; defaults r_LOX = r_CH4 = 0.1 %/day (passive, insulated), 0.5 %/day (uninsulated), ≈ 0 with sunshield + cryocooler; LH2 ≈ 3–10× higher. Also note that CH4 and O2 boil at different rates, shifting the mixture ratio — track them separately.
- A refuelling campaign of N tanker flights spaced several days apart implies a loiter of weeks; at 0.1 %/day a 1,200 t load loses ≈ 1.2 t/day, which is small compared with a tanker delivery (~100–150 t) but large compared with margin for the ~700 m/s Mars landing burn — hence the design interest in sunshields and ZBO.

### Gaps
- No fetched source gives LOX/LCH4 boil-off in %/day for an orbital tank, with or without sunshield; no SpaceX/NASA HLS depot figures were retrieved (NTRS 20120010675 and a TU Delft thesis surfaced in search but were not fetched).
- No LH2 %/day figure from a fetched source (the ≈ 0.07 %/day above is combined LOX/LH2 and derived).
