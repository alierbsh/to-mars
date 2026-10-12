# Independent expert assessments of crewed-Mars feasibility with existing / late-development rockets (status as of 12 Oct 2026)

Scope note for the writer: this file separates **stated fact** (test results, documents, measurements) from **opinion** (named person + date). Items that rest on events after June 2026 are flagged **[post-June-2026; verified only via the cited secondary source]**. Where I did arithmetic myself it is labeled "my calculation". The STPI/IDA 2019 report PDF and several CNN pages could not be fetched (robots/blocked); where I rely on second-hand summaries I say so.

---

## Key Question 0 (context): Where Starship actually stands in October 2026

### Takeaway
As of 12 Oct 2026 Starship has reached orbit exactly once (Flight 14, 28 Sep 2026), has never caught/recovered an upper stage, has never flown beyond LEO, has never demonstrated ship-to-ship propellant transfer, and has never landed on another body. The 2026 Mars window passed with no SpaceX vehicle departing.

### Cited Findings
- Flights 12 (22 May 2026, Block 3, B19/S39, first flight from OLP-2) and 13 (24 Jul 2026, Block 3, B20/S40) were both "transatmospheric" (just short of orbit); both boosters failed their landing burns (Flight 12: only 1 engine relit for landing; Flight 13: 10 of 13 landing-burn engines lit, 5 more lost before impact). Ship 40 made a controlled splashdown and tipped over intact for the first time, allowing heat-shield imagery. 13 flights total through July 2026: 8 successes, 5 failures; zero Ship catches, booster catches on Flights 5, 7, 8 only — [Wikipedia, List of Starship launches](https://en.wikipedia.org/wiki/List_of_Starship_launches) **[post-June-2026; verified only via Wikipedia]**
- Flight 13 deployed functioning Starlink V3 satellites for the first time (previous 12 flights carried simulators); SpaceX called it the softest ship touchdown yet — [KeepTrack Space Brief, 26 Jul 2026](https://keeptrack.space/space-brief/space-brief-2026-07-26) **[post-June-2026]**
- Flight 14 launched 28 Sep 2026 07:48 CDT from Starbase; FAA approval came only two days before launch; Starship "reached full orbit at an altitude of 170 miles (275 km)" and deployed 26 Starlink V3 satellites — Starship's first orbital and first commercial flight. One of 33 booster Raptors failed on ascent; one of three vacuum Raptors shut down early during the second-stage burn, and Mission Control worried about orbital insertion and deorbit margins; the mission was shortened from up to 10 hours to about two hours "to avoid stranding the craft or an uncontrolled reentry over a populated area"; ship made a controlled splashdown off Hawaii; both stages were expended — [New Atlas, 28 Sep 2026](https://newatlas.com/space-systems/starship-orbits-earth-landmark-event/) **[post-June-2026; single secondary source]**
- Pre-flight plan for Flight 14 (Space.com, 15–17 Sep 2026): six orbits at ~275 km, ~10-hour mission, no ship catch planned; "Super Heavy has been caught by the tower three times, but never Ship." SpaceX statement: "By going to orbit, the next phase of developing Starship to be fully and rapidly reusable can begin." — [Space.com, Mike Wall](https://www.space.com/space-exploration/launches-spacecraft/spacex-next-starship-launch-now-on-sept-28-for-1st-orbital-flight) **[post-June-2026]**
- Flight 15 (B22/S42, "fourth Block 3 pair") listed NET 19 Oct 2026 then reportedly moved to 8 Nov 2026; objective: first attempted tower catch of a Ship; the same blog claims Flight 15 will "begin testing" docking/hatch mechanisms for a propellant-transfer demo — **unsourced, promotional Tesla-accessories blog; treat as unverified** — [Basenor blog](https://www.basenor.com/blogs/news/starship-flight-14-captured-on-film-flight-15-is-next) **[post-June-2026; unverified]**
- "No Starship has yet gone beyond Earth orbit or landed on another world. Ship-to-ship propellant transfer in orbit has not been demonstrated." The 2026 Mars opportunity "passed without a SpaceX vehicle departing for Mars." SpaceX's Mars web page now advertises cargo to the Martian surface "no earlier than 2028" at $100 million per metric ton — [ScienceBlog, 15 Aug 2026](https://scienceblog.com/t-spacex-mars-deadlines-2016-2018-2022-2026-2028/) **[post-June-2026; secondary source]**
- Wikipedia's upcoming list: NASA propellant-transfer demo "target (prototype depot)" 2026 with "chaser (prototype tanker)" ~3–4 weeks later, dates TBA; propellant depot 2027 TBA; HLS uncrewed lunar demo March 2027 "after an estimated high-teens number of refueling flights"; Mars uncrewed demo: no date (TBA), ~5 upper stages planned, Italian Space Agency among payload customers; Polaris III (first crewed Starship) TBA, "not expected until Starship has flown at least 100 successful cargo flights, though this is not a firm requirement" — [Wikipedia, List of Starship launches](https://en.wikipedia.org/wiki/List_of_Starship_launches)

### Inferences
- The gap between "first orbit achieved with two engine-outs and a shortened mission" (Sep 2026) and "crew-rated vehicle able to loiter weeks in LEO, be refilled ~12+ times, cruise 6 months, and land on Mars" is the central programmatic fact a simulation's verdict logic should encode: every downstream milestone (ship recovery, transfer demo, depot loiter, HLS landing, Mars uncrewed landing) is still in the future as of October 2026.

### Gaps
- I could not confirm from a primary SpaceX statement when/how the "no earlier than 2028" Mars cargo date was posted; both sources are secondary (ScienceBlog citing SpaceX's web page; 19FortyFive citing a Forbes piece dated 9 Jul 2026).

---

## Key Question 1: The refueling problem (tanker counts, boil-off, loiter, transfer demo, cadence, pads)

### Takeaway
Independent counts cluster at ~12 tanker launches per fully fueled Starship (vs. SpaceX's historical "8–10"), with NASA/GAO/ASAP estimates for HLS running "more than 15" to "high teens"; boil-off adds 1–2 more per ship and is unmeasured in flight. Ship-to-ship transfer has never been attempted (only a 5 t intra-ship test in 2024) and the demo slipped from 2025 to NET late 2026; Starbase is licensed for 25 launches/year, so a 5-ship Mars fleet (~60 tanker launches) in one window exceeds current permitted capacity.

### Cited Findings
**Tanker counts**
- Each Mars-bound Starship needs about 1,200 t propellant (933 t LOX, 267 t LCH4); tankers carry ~100 t each, so each Starship needs roughly 12 tanker launches (Donald Rapp, independent analyst); the five ships Musk proposed for 2026 would need ~60 — [Aerospace America (AIAA), "A Closer Look at SpaceX's Mars Plan", ca. Sep 2025](https://aerospaceamerica.aiaa.org/aiaa-spacex/)
- Boil-off losses "could require one or two extra refueling missions per ship" and refueling models "have not been validated with real cryogenic flight data" — William Notardonato (former NASA engineer, CEO Eta Space), quoted in [Aerospace America](https://aerospaceamerica.aiaa.org/aiaa-spacex/)
- Minimum HLS campaign: 1 Depot + 11 Tanker refills + 1 HLS (article's own count sums to 13), assuming 100 t per tanker and zero boil-off; "NASA and GAO estimates range from 'high single digits' to 'high teens' (e.g., 15–18)"; FAQ gives 12–18 for Artemis III — [New Space Economy, 10 Dec 2025](https://newspaceeconomy.ca/2025/12/10/orbital-refueling-of-the-starship-architecture-operational-mechanics-feasibility-analysis-and-strategic-timeline/) (no named authors)
- GAO-24-106256 coverage: filling an Earth-orbit depot "will take more than 15 Starship launches for this one mission"; GAO judged a 2025 landing unlikely, early 2027 more likely; HLS plan allowed 79 months of development, "13 months shorter than the average for NASA projects" — [SpacePolicyOnline, 1 Dec 2023](https://spacepolicyonline.com/news/gao-2025-unlikely-for-first-artemis-lunar-landing-maybe-2027/)
- ASAP 2025 annual report (released Feb 2026): "SpaceX has proposed at least twelve tanker launches to refuel Starship HLS in Earth orbit"; report "cast doubt on the current Artemis III timeline and the feasibility of the Artemis III mission goals" — [Starlust, 27 Feb 2026](https://starlust.org/nas-as-2025-aerospace-safety-advisory-panel-report-reveals-critical-risks-for-artemis-iii-mission/)
- Starship HLS needs "approximately ten tanker launches" (Ars Technica, 30 Apr 2024, per Wikipedia); NASA's HLS manager (unnamed) said in 2024 autonomous transfer must be done "more than once or twice or three times" before a crewed flight — [Wikipedia, Starship Propellant Transfer Demonstration](https://en.wikipedia.org/wiki/Starship_Propellant_Transfer_Demonstration)
- ASAP Q3 2025 (meeting 20–30 Jul 2025; Starbase visit by Paul Hill, Kent Rominger, Charlie Precourt): "the number of tankers needed to fill the depots is unknown"; cryogenic transfer "in microgravity has never been done"; Hill (former JSC Director of Mission Operations) judged a 2027 HLS "highly questionable" and said the schedule is "significantly challenged" and could be "years late"; V3 upgrades to tanker/depot and Raptor V3 reliability named as threats; competing priority with Starlink V3 — [SpacePolicyOnline, Marcia Smith, 21 Sep 2025](https://spacepolicyonline.com/news/nasa-safety-panel-estimates-significant-delays-for-starship-hls/)

**Boil-off and loiter**
- No in-flight boil-off rate has been published; Wikipedia: "boil-off rates measured in orbit will determine propellant losses and how many tankers are needed"; insulation and vacuum-jacketed lines introduced on first Block 2 ship (S33) — [Wikipedia](https://en.wikipedia.org/wiki/Starship_Propellant_Transfer_Demonstration)
- Modeled example: 1%/day loss with 10 days between tankers → 10% lost between launches; "approx. 1% per day or less with shielding" without active cooling; without zero-boil-off cryocoolers cadence must be "one Tanker every few days"; depot may wait "weeks or months" if it has cryocoolers; launch windows ~once per day — [New Space Economy, 10 Dec 2025](https://newspaceeconomy.ca/2025/12/10/orbital-refueling-of-the-starship-architecture-operational-mechanics-feasibility-analysis-and-strategic-timeline/)
- "Cryogenic propellant evaporates in space, so Starship can't stay in orbit indefinitely" — [Houston Chronicle, ca. spring 2025](https://preview-prod.w.houstonchronicle.com/news/houston-texas/space/article/musk-starship-mars-vision-reality-20353217.php)

**Transfer demonstration status**
- Only demonstration so far: IFT-3 (14 Mar 2024) moved propellant between two tanks on the same vehicle; SpaceX "transferred 5 tons between tanks in one Starship in 2024"; full ship-to-ship transfer "planned for 2026, but it hasn't been demonstrated" — [Aerospace America](https://aerospaceamerica.aiaa.org/aiaa-spacex/); [Wikipedia](https://en.wikipedia.org/wiki/Starship_Propellant_Transfer_Demonstration)
- Demo plan: first launch places a depot-configured ship (more batteries, better insulation) in LEO; second launch 3–4 weeks later docks a tanker; pressure differential moves propellant; infobox: "NET late 2026" — [Wikipedia](https://en.wikipedia.org/wiki/Starship_Propellant_Transfer_Demonstration)
- NASA OIG IG-26-004 (10 Mar 2026): "Both SpaceX and Blue Origin face challenges demonstrating in-space propellant transfer"; uncrewed demos need less propellant so "end-to-end propellant aggregation will not be fully flight tested" — [SpacePolicyOnline, 10–11 Mar 2026](https://spacepolicyonline.com/news/nasa-ig-applauds-nasa-contracting-for-artemis-hls-raises-concerns-about-crew-safety/)
- Phil Smith (BryceTech): orbital refilling "a significant but certainly not insurmountable engineering challenge" — [Houston Chronicle, ca. spring 2025](https://preview-prod.w.houstonchronicle.com/news/houston-texas/space/article/musk-starship-mars-vision-reality-20353217.php)

**Cadence and pads**
- FAA final environmental assessment, 6 May 2025: 25 Starship launches per year at Starbase (up from 5), plus up to 25 landings per year for each stage — [Space.com](https://www.space.com/space-exploration/private-spaceflight/spacex-gets-faa-approval-for-25-starship-launches-per-year)
- A 2024 hope of up to 25 launches in 2025 "did not occur" — [Wikipedia](https://en.wikipedia.org/wiki/List_of_Starship_launches)
- Second Starbase tower under construction; LC-39A tower in Florida; no numeric throughput given — [New Space Economy](https://newspaceeconomy.ca/2025/12/10/orbital-refueling-of-the-starship-architecture-operational-mechanics-feasibility-analysis-and-strategic-timeline/)
- Actual 2026 cadence through Sep: three flights (22 May, 24 Jul, 28 Sep) — i.e., ~2-month centers — [Wikipedia](https://en.wikipedia.org/wiki/List_of_Starship_launches); [New Atlas](https://newatlas.com/space-systems/starship-orbits-earth-landmark-event/)

### Inferences
- With 12 tankers/ship at ~1%/day boil-off and a 2-month flight cadence (2026 actual), a single ship could never be filled: it would lose more than it gained. A credible Mars campaign requires both an orders-of-magnitude cadence increase (days, not months) and demonstrated low boil-off or active cooling — both unproven as of Oct 2026 (my inference from the figures above).
- A 5-ship window needing ~60 tanker launches in a few weeks is incompatible with a 25-launch/year Starbase license and no completed Florida Starship pad (my inference).

### Gaps
- No published measured on-orbit boil-off rate for Starship exists (all sources model it).
- No independent source gives the exact propellant payload a Block 3 tanker can deliver (Wikipedia: "unknown").
- I did not find the Florida (LC-39A/SLC-37) Starship launch-rate EIS numbers in fetched text.

---

## Key Question 2: The Mars EDL problem at 100+ t

### Takeaway
The heaviest object ever soft-landed on Mars is Perseverance at 1,026 kg (Feb 2021); Starship proposes ~100× that mass, using supersonic retropropulsion that has never been flown at Mars and a 52-m vertical lander whose tip-over risk ASAP/OIG already call "questionable" for the Moon. Plume-surface cratering data exist only to ~5,000 lbf thrust with "no direct flight-scale measurements."

### Cited Findings
**The scaling gap**
- Heaviest payload soft-landed on Mars: NASA/JPL Perseverance, 1,026.4 kg, 18 Feb 2021, Jezero Crater — [Guinness World Records](https://www.guinnessworldrecords.com/world-records/650337-heaviest-payload-soft-landed-on-mars)
- Viking-heritage 70° sphere-cone + parachutes "suited to relatively small payloads of up to about 1 metric ton"; parachutes "impractical" above ~20 t ("too big to deploy effectively and reliably"); supersonic retropropulsion may be needed "as early as Mach 5"; in NASA Glenn wind-tunnel tests at lower chamber pressures the bow shock "stayed very close to the body," which was "unexpected" and affects heating via shock impingement; thrust coefficient peaked ~0.36 below 500 psia — Bryan Palaszewski, NASA Glenn, [NTRS 20150009951](https://ntrs.nasa.gov/api/citations/20150009951/downloads/20150009951.pdf) (2010 tests, cites through 2012)
- Starship plan: metallic-ceramic hex tiles for aerobraking from ~7.5 km/s to ~1 km/s, then vertical landing of a ~52 m ship; NASA landers used single-use ablators, parachutes, airbags/sky crane — [Aerospace America](https://aerospaceamerica.aiaa.org/aiaa-spacex/)
- Maiwald et al. (TU Dresden, 2024) assume aerobraking at 7.5 km/s Mars arrival and 12.5 km/s Earth return; they flag that "the risk of damage from kicked-up dust and stones should be investigated" — [Scientific Reports 14:11804, 23 May 2024](https://www.nature.com/articles/s41598-024-54012-0)

**Tall-lander / tip-over concern (opinions and official assessments)**
- Scott Hubbard (former NASA Ames director, first NASA Mars Program director), ca. Sep 2025: a tall, slender vehicle is risky to land, citing the Odysseus lunar lander tip-over (2024); Starship is "nowhere near" Falcon's reliability record; SpaceX "may have hit the limits of its iterative testing approach" — [Aerospace America](https://aerospaceamerica.aiaa.org/aiaa-spacex/)
- NASA OIG IG-26-004 (10 Mar 2026): Starship HLS is 171 ft tall; OIG concerned "its landing momentum on rugged South Pole terrain could cause it to tip over"; crew cabin ~115 ft up with "no other method for the crew to enter the vehicle from the lunar surface" if the elevator fails (NASA "top risk"); uncrewed demo need not carry ECLSS, airlocks or elevator — [SpacePolicyOnline, 10 Mar 2026](https://spacepolicyonline.com/news/nasa-ig-applauds-nasa-contracting-for-artemis-hls-raises-concerns-about-crew-safety/)
- ASAP 2025 Annual Report (Feb 2026): choice of a 170-ft HLS for rough, poorly-lit polar terrain "questionable at best"; cites "intricate operational design," "complex concept of operations" — [Starlust, 27 Feb 2026](https://starlust.org/nas-as-2025-aerospace-safety-advisory-panel-report-reveals-critical-risks-for-artemis-iii-mission/)

**Plume-surface interaction (PSI) and landing-zone prep**
- Korzun (NASA Langley) & Mehta (NASA MSFC), IPPW, 8 Jul 2021: MSL (2012) surface erosion began at ~63 m altitude; crater depths 5–20 cm to bedrock; rocks >1.5 cm landed on the rover deck and a wind sensor was damaged; InSight (2018) crater ~20 in wide × 7 in deep, a footpad on the rim could have tilted the lander ~5°; Mars 2020 saw paint erosion, deck debris and dust that "nearly obscured the rover by touchdown"; Viking used an 18-nozzle "showerhead" to keep impingement pressure <2 kPa; existing test data span <2 lbf (sub-scale) to 5,000 lbf (large-scale hot-fire); "no direct flight-scale measurements exist to inform large-scale landing systems" — [PSI presentation PDF](https://hulc.nianet.org/wp-content/uploads/2023/03/PSI-Maturing-Predictive-Environments-for-Propulsive-Landing-on-the-Moon-and-Mars.pdf)
- Related literature exists on mitigation via landing mats (AIAA SciTech 2026) and "natural landing pads" (Acta Astronautica 2026) — titles only, not fetched: [AIAA 2026-2832](https://arc.aiaa.org/doi/10.2514/6.2026-2832); [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0094576526000536)

**The "no demonstrated landing" problem**
- "No Starship has yet gone beyond Earth orbit or landed on another world" — [ScienceBlog, 15 Aug 2026](https://scienceblog.com/t-spacex-mars-deadlines-2016-2018-2022-2026-2028/) **[post-June-2026]**
- Robert Zubrin, ca. Sep 2025: "The notion they're going to land a Starship on Mars that they launch next year is not true." — [Aerospace America](https://aerospaceamerica.aiaa.org/aiaa-spacex/)
- Amit Kshatriya (NASA deputy AA, Moon to Mars Program), Feb 2025 panel: "The Mars landing problem is complicated. The transit problem, super complicated." — [CNBC via NBC Boston, 17 May 2025](https://www.nbcboston.com/news/business/money-report/the-challenges-facing-elon-musk-and-nasa-in-sending-humans-to-mars/3716400/)
- Maciej Cegłowski (Feb 2025): landing "adds a chain of unrelated hard problems: arrival, entry, landing, surface operations, ascent, and rendezvous" — [Idle Words, 20 Feb 2025](https://idlewords.com/2025/02/the_shape_of_a_mars_mission.htm)

### Inferences
- A 100 t Starship landing is ~100× the record landed mass and ~5× the mass at which parachutes stop working; the only available decelerators are heat shield + SRP + vertical landing, each of which has at best partial Earth-atmosphere analogues (Falcon 9 entry burns; Starship suborbital flips) and no Mars flight data (my synthesis).
- The Raptor plume at Mars landing is roughly two orders of magnitude above the largest hot-fire PSI test (5,000 lbf), so cratering/ejecta/tilt at touchdown is an unquantified failure mode — supporting Hubbard's tip-over argument (my inference).

### Gaps
- No peer-reviewed Starship-specific Mars EDL paper with peak heating / g-load figures was found in reachable sources; phys.org "new Mars landing approach" (Nov 2024) could not be fetched.
- No GAO or ASAP statement specifically about Starship *Mars* EDL was found; their concerns are about the lunar HLS and are extrapolated here.

---

## Key Question 3: Life support and crew health (ECLSS, radiation, gravity, medical, psychology)

### Takeaway
ISS recovers ~98% of water but only ~50% of oxygen from CO2, and NASA's own ECLSS engineers say failure predictions "have been inaccurate in many instances"; a 2–3-year mission with no resupply has never been attempted. GCR dose in transit (~1.8 mSv/day measured by Curiosity) means NASA's 600 mSv career limit is reached roughly 400 days into a ~3-year round trip; NASA's HRP rates radiation, SANS, behavioral health and nutrition as "red" for Mars.

### Cited Findings
**ECLSS closure and reliability**
- ISS ECLSS "can recover and recycle about 98 percent of the water on the station" — [NASA MSFC ECLSS fact sheet, Aug 2025](https://www.nasa.gov/wp-content/uploads/2025/08/g-657270-59-hp-environmental-control-and-life-support-system-eclss.pdf?emrc=a8506e)
- ISS Sabatier reactor "theoretically capable of recovering approximately 50% of the oxygen" in metabolic CO2; Plasma Pyrolysis Assembly baselined to reach ~75%; Mars architecture needs ">75%"; "ISS failure-mode and life predictions have been inaccurate in many instances" and reliability uncertainty "remains high to date"; Transit Habitat Regen ECLSS must "support four crewmembers for the mission duration without logistics resupply"; wrong repair accounting "could either prevent the architecture from closing or be catastrophic to mission success" — Howard, Stanley, Schunk, Kessler, Nickens (NASA MSFC), [ICES-2022-196](https://ntrs.nasa.gov/api/citations/20220006727/downloads/ICES-2022-196.pdf)
- 2023 ISS replacements included a heat exchanger, multiple water separators, 21 charcoal filters, and a CO2-removal blower that failed on its first replacement; some ORUs weigh hundreds of kg because a tiny internal sensor failed; Mars needs "order of magnitude" reliability gains and "spare parts cannot brute-force the problem" — Maciej Cegłowski (opinion), [Idle Words, 20 Feb 2025](https://idlewords.com/2025/02/the_shape_of_a_mars_mission.htm)
- Maiwald et al. (2024) modeled crew consumables at "100% recovery, as an optimistic best case" and still found no feasible scenario — [Scientific Reports, 23 May 2024](https://www.nature.com/articles/s41598-024-54012-0)
- Kshatriya (NASA), Feb 2025: "The reliability has to be super high." — [CNBC/NBC Boston, 17 May 2025](https://www.nbcboston.com/news/business/money-report/the-challenges-facing-elon-musk-and-nasa-in-sending-humans-to-mars/3716400/)

**Radiation**
- Curiosity RAD measured an average 1.8 mSv/day of GCR during cruise to Mars (only ~3% from SPEs); Cary Zeitlin (SwRI): "like getting a whole-body CT scan once every five or six days"; 1 Sv ≈ 5% added fatal-cancer risk — [NASA JPL, 30 May 2013](https://www.jpl.nasa.gov/news/data-from-nasa-rovers-voyage-to-mars-aids-planning/). My calculation: 1.8 mSv/day × 180 days ≈ 0.32 Sv per one-way transit, ≈0.65 Sv for two transits alone.
- NASA career limit: <600 mSv total effective dose, universal for all ages/sexes (NASA-STD-3001 Vol.1 Rev B); design SPE (Oct 1989 sum) must be held <250 mSv/event; missions >6 months: ≥20 g/cm² vehicle shielding recommended; storm shelter of ~10 cm water-equivalent for a 1-in-100-year event, ~20 cm for 1-in-1000; Mars surface ~0.5 mSv/day — [NASA OCHMO-TB-020 Rev E, 27 Dec 2022](https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf)
- Ramos et al. (IJMS, 24 Jan 2023), FLUKA-type modeling: equivalent dose at solar minimum ~1.5 → 1.05 mSv/day behind 0–10 g/cm² Al, rising slightly at 20 g/cm² (so 10 g/cm² is better than 20); solar max ≈ one-third of solar min; a 650-day free-space scenario is "always below ICRP's 1 Sv career limit but above NASA's 600 mSv limit"; cites Simonsen et al.: Mars mission at solar min 300–450 mGy absorbed / 870–1200 mSv equivalent — [MDPI](https://www.mdpi.com/1422-0067/24/3/2328)
- NASA's 600 mSv limit "could be reached about 400 days into a roughly three-year round trip"; Mars surface radiation 60–120× Earth's — [Houston Chronicle, ca. spring 2025](https://preview-prod.w.houstonchronicle.com/news/houston-texas/space/article/musk-starship-mars-vision-reality-20353217.php)
- Maiwald et al. mass model carries 30 t polyethylene radiation shielding and 22.1 t MMOD shielding per Starship — [Scientific Reports](https://www.nature.com/articles/s41598-024-54012-0)
- Cegłowski: uncertainty widens radiation risk estimate "by at least a factor of two"; for long-stay orbital missions, risk of death or incapacitation from the heavy-ion GCR component "may exceed 50%" (he cites this from NASA-related literature; treat as his reading) — [Idle Words, Feb 2025](https://idlewords.com/2025/02/the_shape_of_a_mars_mission.htm)

**HRP "red risks" (NASA Human Research Program)**
- Patel, Brunstetter, Tarver, Whitmire, Zwart, Smith, Huff (npj Microgravity 6:33, 5 Nov 2020): four red-rated risks for a ~3-year Mars DRM — (1) space radiation (cancer, cardiovascular, cognitive): 300–450 mGy per mission vs 30–120 mGy for 6–12-month ISS; cardiovascular could raise exposure-induced death risk ~40% over cancer alone; (2) SANS: ~69% of US ISS crew show >20 µm retinal thickening, 15–20% chorioretinal folds, ~29% globe flattening; (3) behavioral health: Mars-500 (520 days, 6 crew) — one crewmember reported depressive symptoms in 93% of weeks, two crew accounted for 85% of perceived conflicts; (4) inadequate food/nutrition. Red = "greatest likelihood of occurrence and most significant impact"; yellow = medium; green = controlled — [Nature npj Microgravity](https://www.nature.com/articles/s41526-020-00124-6)

**Gravity, medical, isolation**
- Bone loses ~1% mineral density per month in spaceflight; comm delays up to 22 minutes each way mean "Earth physicians can't help in emergencies"; medicine expiration an issue — Farhan Asrar (Toronto Metropolitan Univ. School of Medicine) via [Houston Chronicle](https://preview-prod.w.houstonchronicle.com/news/houston-texas/space/article/musk-starship-mars-vision-reality-20353217.php)
- Deconditioning exposure ~1.5× the human endurance record on a short stay, ~2.5× on a long stay; partial-gravity (0.38 g) effects unknown — Cegłowski, [Idle Words](https://idlewords.com/2025/02/the_shape_of_a_mars_mission.htm)
- Kelly Weinersmith (co-author, *A City on Mars*), 8 Nov 2023: sending people before more radiation research "would feel like human experimentation"; "we gotta slow it down a lot"; but "I don't think any of these issues need to stop us from going to Mars" — [Space.com interview](https://www.space.com/a-city-on-mars-author-interview). A rebuttal exists from the National Space Society (not fetched): [NSS critique PDF](https://nss.org/wp-content/uploads/NSS-JOURNAL-Critique-of-A-City-on-Mars.pdf)

### Inferences
- A conjunction-class mission (~180 + ~500 + ~180 days) at measured transit rates plus ~0.5 mSv/day on the surface totals on the order of 0.9 Sv (my calculation: 0.65 Sv transit + 500 × 0.5 mSv ≈ 0.25 Sv) — above NASA's 600 mSv limit without heavy shielding or a waiver, consistent with the Ramos/Simonsen ranges. This is a rule-change problem, not a showstopper, but it is a quantifiable "fails first" candidate for a NASA-standards-compliant mission.
- ECLSS is the one subsystem where no amount of launch mass directly buys reliability (Howard et al.; Cegłowski): it is the most likely "what fails first" candidate for a 1,000-day mission in a simulation calibrated on ISS repair history.

### Gaps
- No public per-component MTBF table for ISS ECLSS (UPA/OGA/CDRA/WPA) was found; Howard et al. explicitly say reliability data are inadequate.
- I did not find a 2025–2026 HRP update to the red/yellow ratings; the 2020 paper is the latest reachable primary statement.

---

## Key Question 4: Abort and safety (no LAS, loss-of-crew benchmarks, free return, no rescue)

### Takeaway
NASA's own benchmarks (Commercial Crew 1-in-200 for 210 days; OIG's ~1-in-30 for a full Artemis lunar landing) have no Mars analogue, and NASA officials in March 2026 declined even to state Artemis II's number. NASA chose not to require in-space rescue for HLS; a Mars crew's only abort after departure is a ~2-year loop home. The one peer-reviewed launch-campaign reliability study (Cates et al., 2013) found ~50% campaign success with no spare launches, ~80% with two.

### Cited Findings
**Loss-of-crew benchmarks (stated by NASA / OIG)**
- OIG estimate: ~1-in-30 risk of failure overall for a crewed Artemis lunar-surface mission, ~1-in-40 during moon operations; Commercial Crew requirement 1-in-200 for a 210-day ISS mission; Apollo ~1-in-10; Shuttle managers believed 1-in-100 but retrospective analysis gave ~1-in-10 for early flights; Lori Glaze (acting AA, ESDMD), 12 Mar 2026: "I wouldn't actually put a number on it"; John Honeycutt (Artemis 2 MMT chair): new rockets succeed on debut ~50% of the time; Artemis 2 "probably not 1 in 50" but "probably not 1 in 2"; NASA is "not sure we understand what they mean" regarding LOC/LOM assessments — [Space.com, Mike Wall, 13 Mar 2026](https://www.space.com/space-exploration/artemis/how-risky-is-the-artemis-2-astronaut-launch-to-the-moon-nasa-would-rather-not-say)
- NASA OIG IG-26-004 (10 Mar 2026): NASA "chose not to require in-space crew rescue capabilities" for HLS; "crew survival analyses were insufficient"; NASA–SpaceX disagreement on manual-control requirement shows a "worsening trend"; automation "may lock in" as the only landing method and SpaceX could request a waiver; end-to-end ascent, return and docking with Orion/Gateway not required of the uncrewed demo; NASA concurred with the two crew-safety recommendations — [SpacePolicyOnline, 10 Mar 2026](https://spacepolicyonline.com/news/nasa-ig-applauds-nasa-contracting-for-artemis-hls-raises-concerns-about-crew-safety/)
- ASAP 2025 report: NASA leadership "packed too many objectives into a single mission" after Artemis II; concern about "a culture of fulfilling service contracts" — [Starlust, 27 Feb 2026](https://starlust.org/nas-as-2025-aerospace-safety-advisory-panel-report-reveals-critical-risks-for-artemis-iii-mission/)

**Quantified campaign-reliability modeling**
- Cates (SAIC), Stromgren (Binera), Cirillo & Goodliff (NASA Langley), IEEE Aerospace 2013: discrete-event simulation (1,000 replications/case) of DRA-5-class Mars campaigns of 4–13 SLS launches; average campaign success ~0.5 with no spare launches, ~0.75 with one, ~0.80 with two; best case (NTR, pre-deploy, 130 t SLS, dual-string ground processing, 2 spares) ≈0.847, rising to ≈0.944 when the second spare is held until after crew launch; input LOM rates: SLS ascent 1.7–3.3%, automated docking 1.03%, crewed docking 0.435%, departure burn 1.2% per vehicle, MMOD 1e-5 per element-day, crew health 9.72e-5 per astronaut-day; "Having a spare launch capability provides significant improvement to mission success"; DRA 5.0's 30-day launch centers could not be supported by single-string ground processing — [Academia.edu copy](https://www.academia.edu/47017047/Launch_and_assembly_reliability_analysis_for_Mars_human_space_exploration_missions)

**Abort geometry / "no rescue"**
- Once departed, "the only alternative to finishing the mission is a looping return that takes about two years"; Mars missions must be "acutely risk-averse"; notional toy model: a 30-month mission gives 68% chance of safe return, a 6-month abort capability raises it to 85%, a 3-month abort to 92% (author stresses these are illustrative) — Cegłowski, [Idle Words, 20 Feb 2025](https://idlewords.com/2025/02/the_shape_of_a_mars_mission.htm)
- Maiwald et al.: return is "the most constraining element" — Mars ascent alone consumes 4,782 m/s (72%) of a 6,651 m/s return budget, leaving 1,330 m/s for everything else; return window opens 500 days after landing — [Scientific Reports, 2024](https://www.nature.com/articles/s41598-024-54012-0)
- Zubrin: the first crewed mission should be a round trip so the crew can deliver "the full report" — [Faster, Please! podcast #72 transcript, date not stated (context: 2025)](https://fasterplease.substack.com/p/mars-or-bust-my-chat-transcript-with)
- Starship's reliability record: Hubbard, "nowhere near" Falcon's — [Aerospace America](https://aerospaceamerica.aiaa.org/aiaa-spacex/); Flight 14 flew with two engine-outs and a curtailed mission — [New Atlas, 28 Sep 2026](https://newatlas.com/space-systems/starship-orbits-earth-landmark-event/) **[post-June-2026]**
- Polaris III, the first planned crewed Starship flight, "not expected until Starship has flown at least 100 successful cargo flights" (non-firm) — [Wikipedia](https://en.wikipedia.org/wiki/List_of_Starship_launches)

### Inferences
- Applying the Cates methodology to a Starship Mars campaign (12+ tanker launches per ship, several ships, autonomous dockings each ~1% LOM) implies that without spare tankers and multiple pads, the probability of simply completing propellant aggregation inside a window is well below 50% at historical reliability — before any crew risk is counted (my inference from Cates' sensitivity results).
- No NASA document sets a Mars LOC requirement; the only quantified anchors are 1-in-200 (ISS, 210 days) and ~1-in-30 (Artemis landing). A Mars mission ~5× longer than an ISS stay with no rescue would, by NASA's own logic, need to be *safer per day* than anything flown — the opposite of what an early Starship record supports (my inference).

### Gaps
- I did not fetch a primary source stating explicitly that Starship has no launch-abort system (it is widely reported; the OIG report only discusses HLS ascent requirements). The writer should state it as common knowledge or seek a direct SpaceX/NASA citation.
- No NASA document with a *Mars-specific* LOC/LOM probability requirement was found.
- The "1-in-75" figure in the brief did not appear in any source fetched; the OIG/Space.com numbers are ~1-in-30 (full mission) and ~1-in-40 (lunar ops).

---

## Key Question 5: Programmatic and timeline reality (SpaceX, NASA, China)

### Takeaway
Every SpaceX Mars date since 2016 has slipped by one window: 2018 → 2022 → 2026 → now "no earlier than 2028" for cargo; Musk's May-2025 "50/50 for late 2026" resolved as a miss. NASA has never set an official crewed-Mars date (officials call 2040 "audacious"); the 2026 Isaacman reshuffle emphasizes a lunar base by 2030 and a nuclear-powered *robotic* Mars pathfinder by end-2028, not a crewed Mars mission. China's 2033 crewed target rests on a 2021 CALT statement with scant detail.

### Cited Findings
**SpaceX statements and slips**
- 29–30 May 2025: Musk gave a "50-50 chance" of an uncrewed Starship to Mars by end-2026; first flight would carry Tesla Optimus robots; if missed, SpaceX would wait ~two years; context: Flight 9 (27 May 2025) spun out of control after a fuel leak — [Al Jazeera, 30 May 2025](https://www.aljazeera.com/news/2025/5/30/musk-says-50-50-chance-of-sending-uncrewed-starship-to-mars-by-late-2026)
- Musk's May 2025 Starbase roadmap: 5 uncrewed ships in 2026; ~20 ships in 2028 incl. at least one crewed; first crewed landing "as soon as" 2029; 100 ships in 2031, 500 in 2033; eventual "1,000 or 2,000 ships per Mars rendezvous." Musk's August 2025 post on X: first uncrewed ships "more likely" ~3.5 years out, crewed ~5.5 years — [Aerospace America, ca. Sep 2025](https://aerospaceamerica.aiaa.org/aiaa-spacex/)
- Deadline history: 27 Apr 2016 Red Dragon "as early as 2018"; Sep 2017 BFR cargo "2022" ("not a typo"), crew 2024; 7 Sep 2024 Musk: uncrewed Starships to Mars "in two years"; SpaceX Mars page now "no earlier than 2028" at $100M/t; a NASA IG audit of March 2026 "documented delays in propellant transfer and an uncrewed landing demonstration" — [ScienceBlog, 15 Aug 2026](https://scienceblog.com/t-spacex-mars-deadlines-2016-2018-2022-2026-2028/) **[post-June-2026; secondary]**
- "That timeline has slipped" (citing Forbes, 9 Jul 2026); SpaceX "reportedly shifting its near-term focus toward the Moon, which Musk once called a distraction"; the late-2026 opportunity "effectively disappeared"; next window late 2028/early 2029 — [19FortyFive, Harrison Kass, 9 Aug 2026](https://www.19fortyfive.com/2026/08/the-mars-launch-window-opens-in-november-2026-and-closes-about-a-month-later-the-next-one-is-in-2029/) **[post-June-2026; secondary]**
- Expert opinions on the 2026 date (ca. spring 2025): Steven Berg (Rutgers): "It's really hard for me to be that optimistic based on the recent Starship test results"; expects a two-year slip best case, "up to a decade" worst case. Phil Smith (BryceTech): hesitant to dismiss, SpaceX "has proven it can execute hard missions once believed beyond its abilities" — [Houston Chronicle](https://preview-prod.w.houstonchronicle.com/news/houston-texas/space/article/musk-starship-mars-vision-reality-20353217.php)
- Casey Dreier (Planetary Society), ca. Sep 2025: plan "not guaranteed" but SpaceX is "incredibly capable." Robert Moses (retired NASA Langley): "I like it. I like it a lot"; a 2028 slip "still gives him one more opportunity before 2033" — [Aerospace America](https://aerospaceamerica.aiaa.org/aiaa-spacex/)
- Zubrin (2025): the administration's 2028 landing goal — "I do not think that is realistic"; "landing the first humans on Mars in 2033 is entirely reasonable" if handled correctly — [Faster, Please! transcript](https://fasterplease.substack.com/p/mars-or-bust-my-chat-transcript-with)

**NASA official position and the 2025–2026 political push**
- Jim Reuter (AA, NASA STMD), Humans to Mars Summit, May 2023: Mars by 2040 "is an audacious goal for us to meet"; landing in 2040 means departing 2039; astronauts may orbit Mars by 2033; "very short time to develop technologies"; Jim Free: "We need Starship to launch and be successful for our first lander" — [Space.com via Yahoo, May 2023](https://news.yahoo.com/sending-astronauts-mars-2040-audacious-100028629.html)
- Amit Kshatriya (NASA), Feb 2025: radiation "very severe"; "The propulsion capability is not – you know, we got to get better in all those areas"; CNBC: NASA officials say 2040 would be "audacious" — [CNBC/NBC Boston, 17 May 2025](https://www.nbcboston.com/news/business/money-report/the-challenges-facing-elon-musk-and-nasa-in-sending-humans-to-mars/3716400/)
- Spring 2026 (Politico via Yahoo): NASA spokesperson Bethany Stevens: NASA is "evaluating every opportunity, including launch windows in 2026 and 2028, to test technologies that will land humans on Mars"; White House budget proposal would roughly halve NASA science, add "$1 billion in new investments for Mars-focused programs," and cancel SLS/Orion after two crewed launches; Musk called Artemis "extremely inefficient," tweeted "We're going straight to Mars," called the Moon a "distraction"; Isaacman said NASA could be "paralleling" Artemis and Mars — [Yahoo News](https://www.yahoo.com/news/nasa-eyes-2026-mars-launch-183922168.html)
- 24 Mar 2026: Trump's December executive order calls for astronauts on the lunar surface by 2028 and "initial elements" of a base by 2030; NASA to invest ~$20B over seven years; CLPS 2.0 robotic landers monthly from 2027, 25 missions by 2028; Gateway being dropped; Artemis III converted to an in-space docking test (2027); "Space Reactor 1 Freedom" nuclear-powered spacecraft to Mars before end-2028 carrying "Ingenuity-class copters," described by Isaacman as a "pathfinder effort" for commercial fission power — [Aerospace America, Paul Brinkmann, 24 Mar 2026](https://aerospaceamerica.aiaa.org/nasa-details-plan-to-establish-lunar-surface-base-by-2030-send-nuclear-powered-spacecraft-to-mars/)
- Isaacman's 27 Feb 2026 Artemis changes: Artemis III → Earth-orbital test 2027; Artemis IV → first landing 2028 — [SpacePolicyOnline, 10 Mar 2026](https://spacepolicyonline.com/news/nasa-ig-applauds-nasa-contracting-for-artemis-hls-raises-concerns-about-crew-safety/)
- Jim Bridenstine (former NASA Administrator), 2025: Starship likely won't be ready by 2027; Acting Administrator Sean Duffy: would be "damned" if China reached the Moon first — [SpacePolicyOnline, 21 Sep 2025](https://spacepolicyonline.com/news/nasa-safety-panel-estimates-significant-delays-for-starship-hls/)
- Independent STPI/IDA 2019 report "Evaluation of a Human Mission to Mars by 2033" (second-hand; PDF not fetchable): long-duration life support, 500-kWe SEP, cryogenic propellants, refueling and reusability would not be ready for 2033; Deep Space Transport not ready to depart before 2037 or 2039 even with increased funding; Hoppy Price (JPL) proposed a 570-day orbit-only mission in 2033 with surface missions from ~2037; 2015 Smith & Spudis estimate up to $1.5T (2015 $) — [Interesting Engineering, 21 Apr 2023](https://interestingengineering.com/science/the-first-mission-to-mars-by-2033)

**China**
- Wang Xiaojun (head, CALT), GLEX 2021 (14–17 Jun 2021, by video): crewed Mars launches in 2033, 2035, 2037, 2041 "and beyond"; uncrewed sample-return ~2030 (CNSA's Xu Hongliang); nuclear propulsion "an important option"; base-building phase uses local water/oxygen/power — [CGTN, 26 Jun 2021](https://news.cgtn.com/news/2021-06-26/China-plans-to-launch-first-crewed-mission-to-Mars-in-2033-11oS5qxFp0k/index.html)
- CNBC (May 2025): China "plans an autonomous Mars research station by 2038" — [NBC Boston](https://www.nbcboston.com/news/business/money-report/the-challenges-facing-elon-musk-and-nasa-in-sending-humans-to-mars/3716400/)
- Interesting Engineering (2023): Chinese details have been "scant" — [IE](https://interestingengineering.com/science/the-first-mission-to-mars-by-2033)

### Inferences
- The base rate for SpaceX Mars dates is a one-window (26-month) slip per announcement cycle (2018→2022→2026→2028); applying it to "NET 2028 cargo" implies 2030–31 cargo and crewed no earlier than early-to-mid 2030s even on an optimistic path (my inference from the documented pattern).
- NASA's 2026 posture (lunar base, robotic nuclear Mars pathfinder) is *compatible with* but does not *commit to* a crewed Mars mission before 2040; the "late 2030s" remains the only official-adjacent horizon (Reuter 2023, Kshatriya 2025).

### Gaps
- I could not fetch the Forbes 9 Jul 2026 article on the slip, the CNN 24 Mar 2026 piece, or any direct SpaceX statement about the 2028 date — all are second-hand.
- No primary Chinese document after 2021 on crewed Mars dates was found.
- The STPI 2019 PDF (DTIC) failed to load; conclusions above are via Interesting Engineering's summary.

---

## Key Question 6: Counter-arguments from supporters and explicit systems-engineering/probability analyses

### Takeaway
Supporters argue Starship's mass abundance (Handmer) and SpaceX's execution record (Smith, Dreier, Moses) make brute-force architectures viable; the sharpest friendly critic (Zubrin) accepts Starship as a heavy-lifter but says refueling a 100 t ship on Mars (600 t propellant, ~600 kW) is the wrong architecture and proposes a 1/5-scale "Starboat." The only peer-reviewed end-to-end systems analysis (Maiwald et al., TU Dresden, 2024) "was not able to find a feasible Mars mission scenario using Starship," chiefly because return propellant production needs ~2,400 t and ~3.6 MW of surface power.

### Cited Findings
**Supporters**
- Casey Handmer, "Starship is Still Not Understood," 28 Oct 2021: Starship removes the mass constraint; "A dollar spent on mass optimization no longer buys a dollar saved on launch cost"; <$10M/launch for >100 t to LEO, eventually ~$50/kg; a refueled Starship could deliver >100 t "anywhere in the solar system for under $100m"; global capacity from ~500 t/yr to perhaps 500 t/week; Mars goal "a million tonnes of cargo to the Martian surface in ten launch windows"; Raptor, landing and stainless-steel risks "largely retired," heat shield has "known fallbacks"; acknowledges industry should plan for Starship flying "in 2022, 2025, or never" — [Handmer blog](https://caseyhandmer.wordpress.com/2021/10/28/starship-is-still-not-understood/) (opinion; author gives no formal credentials in the post)
- Casey Dreier (Planetary Society), Robert Moses (ret. NASA Langley), Phil Smith (BryceTech) — see KQ5 quotes — [Aerospace America](https://aerospaceamerica.aiaa.org/aiaa-spacex/); [Houston Chronicle](https://preview-prod.w.houstonchronicle.com/news/houston-texas/space/article/musk-starship-mars-vision-reality-20353217.php)
- A full propellant load cuts transit to 3–4 months, reducing GCR exposure — Robert Moses, [Aerospace America](https://aerospaceamerica.aiaa.org/aiaa-spacex/)

**Zubrin's "friendly" critique and Starboat**
- Refueling a Starship on Mars "requires approximately 600 tons of propellant" vs ~120 t for Mars Direct vehicles; making 600 t in 18 months ≈ continuous 600 kW; a solar array for that: ~60,000 m², ~240 t, "three Starship flights just to deliver"; nuclear reactor at that power ~10 t. Starboat: Starship-type vehicle "scaled down by about a factor of five in mass"; 120 t propellant for direct surface-to-Earth return, 50 t for low-Mars-orbit rendezvous; one LMO tanker supports five returns; carries 5 t to Mars direct or 25 t with one tanker refuel — [NextBigFuture, Brian Wang, 4 Mar 2025](https://www.nextbigfuture.com/2025/03/zubrins-new-mars-plan-with-a-mini-starship-called-starboat.html)
- Zubrin (2025): Starship is "suboptimal as an ascent vehicle" at ~100 t dry; Starboat "10 to 20 percent of Starship's size" cuts propellant "by about an order of magnitude"; "Starship plus Starboat is the flight hardware combination that can do both the moon and Mars"; rejects 1,000-ship D-Day colonization: "You have to supply Mars from Mars, beyond very small numbers"; rejects the autarky-refuge rationale; favors 30 rovers + 30 helicopters first; "A human expedition to Mars doesn't need to grow food" (bring 2 years of food) — [Faster, Please! transcript](https://fasterplease.substack.com/p/mars-or-bust-my-chat-transcript-with)
- Zubrin also warned political shifts could stall progress; argued rovers/helicopters beat Optimus robots — [Aerospace America](https://aerospaceamerica.aiaa.org/aiaa-spacex/)

**Peer-reviewed systems analysis (negative)**
- Maiwald, Bauerfeind, Fälker, Westphal, … Bach (TU Dresden), *Scientific Reports* 14:11804, 23 May 2024, "About feasibility of SpaceX's human exploration Mars mission scenario with Starship": scenario = 2 cargo ships 2027, 2 cargo + 2 crewed ships 2029, crew of 12, 180-day transits, 500-day stay, return on ISRU propellant; ESA margins (20% system); bottom-up on-orbit mass 1,510.5 t vs SpaceX's stated figures ("exceeds ... by more than 100 MT"); usable propellant 1,176.5 t; max Δv 5,588 m/s; late-2028/early-2029 window minimum Δv 5,435 m/s ("at the edge of capability"), max payload 114.4 t; 2033 window 4,820 m/s and 178.7 t (+56%); return: Mars ascent 4,782 m/s = 72% of 6,651 m/s budget; ISRU: 1,200 t per returning ship → 2,400 t for two ships in 470 days = 5,107 kg/day; power 3.6 MW total (two 2-MW fission reactors ~64 t) with propellant plant 3.06–3.37 MW; water extraction ~510 kW; solar rejected as primary surface power (dust, low flux); ISRU "only tested under lab conditions" (MOXIE excepted); conclusions: "The mission plans by SpaceX are not feasible in their current form"; "not able to find a feasible Mars mission scenario using Starship" even with 100% consumable recovery; gaps "unlikely ... closed until the end of the decade"; recommends international participation — [Nature Sci Rep (HTML)](https://www.nature.com/articles/s41598-024-54012-0); [PDF](https://www.nature.com/articles/s41598-024-54012-0.pdf)
- Surface power comparison: NASA DRA-5 needs ~1,450 m² of solar for 25 t LOX; SpaceX's equivalent would be ~38,400 m² (figures attributed to Michael Hecht and NASA); Rapp: ~33 t regolith/day processed for 5 t propellant at 15% water content — [Aerospace America](https://aerospaceamerica.aiaa.org/aiaa-spacex/)
- Launch-campaign probability modeling (Cates et al. 2013) — see KQ4 — [Academia.edu](https://www.academia.edu/47017047/Launch_and_assembly_reliability_analysis_for_Mars_human_space_exploration_missions)

**Skeptics' overall verdicts (opinion)**
- Cegłowski (Feb 2025): Mars is achievable "but not quickly"; "a sky full of Starships would not remove the need for multi-year trials of life support"; "the only practical path to exploring Mars in our lifetime ... is to stop requiring people to accompany the machinery" — [Idle Words](https://idlewords.com/2025/02/the_shape_of_a_mars_mission.htm)
- Weinersmiths (Nov 2023): public belief in a multiplanetary species by ~2050 is "naively optimistic" — [Space.com](https://www.space.com/a-city-on-mars-author-interview)

### Inferences
- The supporters' and critics' numbers are not actually in conflict on physics; they diverge on *architecture*: Handmer assumes mass abundance solves problems; Maiwald and Zubrin show the problem that mass abundance does not solve is **Mars-surface power for return propellant** (MW-class, reactor-dependent). A simulation's "what fails first" for a return-capable Starship mission should therefore be ISRU power/production, not launch mass (my synthesis).
- Zubrin's and Maiwald's numbers are consistent in direction (hundreds of kW to MW), though they differ ~5× in scale because Zubrin assumes a lighter return (600 t) versus Maiwald's full 1,200 t per ship.

### Gaps
- I found no systems-engineering paper that assigns an explicit end-to-end *probability of mission success* to a Starship Mars architecture; Cates et al. (SLS-based) is the closest quantified campaign model.
- NSS's published rebuttal to *A City on Mars* was located but not read.

---

## Key Question 7: "Minimum viable crewed Mars mission" definitions in use

### Takeaway
Experts converge on crew of 4–6, conjunction-class (~180 d out / ~500 d surface / ~180 d back, ~1,000 d total) as the only sensible exploration profile; opposition-class (30–90 d stay, ~650 d total) saves nothing but adds Δv and deep-space time. NASA's DRA 5.0 lands ~40 t-class elements with pre-deployed cargo one window early, ISRU oxygen for ascent and fission surface power — far below Starship's 100 t-per-landing paradigm, which Zubrin and Maiwald both call oversized for a first return mission.

### Cited Findings
- NASA DRA 5.0 (SP-2009-566, 2009): crew of 6; conjunction (long-stay) class; transit ~180 days each way (175–225 outbound depending on date); surface stay ~18 months (~500 days); at least 7 Ares V cargo launches at 30-day centers plus one crew launch; Descent/Ascent Vehicle and Surface Habitat pre-deployed ~2 years ahead on minimum-energy (~350-day) transfers; ascent propellant partly from Martian atmosphere (ISRU); nuclear fission surface power chosen over solar — [NASA SP-2009-566 PDF](https://www.nasa.gov/wp-content/uploads/2015/09/373665main_nasa-sp-2009-566.pdf)
- Opposition (short-stay): ~650 days total (six months out, 30–90-day stay, ~400 days back, trajectory cutting close to the Sun with more propellant); conjunction: ~1,000 days (six months out, 17 months on Mars, six back); round trips under ~500 days need propulsion breakthroughs ("split/sprint," NTR); he states the 2009 reference architecture used four crew (note: conflicts with DRA 5.0's crew of six above) and a later "shoestring" short-stay plan would send four crew with two landing — Cegłowski, [Idle Words, Feb 2025](https://idlewords.com/2025/02/the_shape_of_a_mars_mission.htm)
- NASA Transit Habitat ECLSS sized for four crew without resupply — Howard et al., [ICES-2022-196](https://ntrs.nasa.gov/api/citations/20220006727/downloads/ICES-2022-196.pdf)
- Hoppy Price (JPL chief engineer, Mars Exploration Program) et al.: 570-day orbit-only mission for 2033, surface from ~2037 — [Interesting Engineering, 2023](https://interestingengineering.com/science/the-first-mission-to-mars-by-2033)
- NASA 2023 concept: Gateway analog missions — 6 months in Gateway, 30 days on the Moon, 6 months back — as Mars rehearsals — [Space.com via Yahoo, 2023](https://news.yahoo.com/sending-astronauts-mars-2040-audacious-100028629.html)
- Zubrin's minimum: bring two years of food (no farming), round-trip first mission, Mars Direct-class return propellant ~120 t made from CO2 + water; Starboat as the landing/ascent element — [Faster, Please!](https://fasterplease.substack.com/p/mars-or-bust-my-chat-transcript-with); [NextBigFuture](https://www.nextbigfuture.com/2025/03/zubrins-new-mars-plan-with-a-mini-starship-called-starboat.html)
- SpaceX's implicit "minimum": per Maiwald's reading of SpaceX material — crew of 12, 2 cargo ships pre-positioned one window early (power + ISRU gear), 100 t payload per ship, full 1,200 t ISRU refuel for return; "SpaceX provided no ISRU details" — [Scientific Reports, 2024](https://www.nature.com/articles/s41598-024-54012-0)
- Musk's version of pre-positioning: Optimus robots install power/infrastructure and scout for water ice before crews; 2028: ~20 ships "most carry more Optimus robots" — [Aerospace America](https://aerospaceamerica.aiaa.org/aiaa-spacex/)
- Cates et al.: pre-deploying cargo improved campaign reliability (fewer launches per window) though "offset by longer asset loiter time at Mars" — [Academia.edu](https://www.academia.edu/47017047/Launch_and_assembly_reliability_analysis_for_Mars_human_space_exploration_missions)
- ISRU prerequisite scale: 25 t LOX needs ~1,450 m² solar (DRA-5); SpaceX-scale ~38,400 m² (Hecht/NASA figures) — [Aerospace America](https://aerospaceamerica.aiaa.org/aiaa-spacex/)

### Inferences
- A defensible "minimum viable" definition for a simulation: crew 4 (NASA Transit Hab sizing; Cegłowski's reading), conjunction class ~1,000 days, cargo/power/ISRU plant landed and verified one window (26 months) earlier, return propellant either pre-made on Mars (≥120 t for a small ascent vehicle; 600–1,200 t for a full Starship) or carried from Earth, fission surface power in the hundreds of kW to MW range, and ≥1 spare launch per critical element. Every one of these is unflown as of Oct 2026 (my synthesis).
- The 100 t-per-landing Starship paradigm is not required by any expert's minimum mission; it is a *consequence* of using Starship as the lander. The landed-mass "need" is 30–60 t class in NASA/Zubrin architectures (my inference; DRA 5.0 per-lander mass not confirmed in fetched text).

### Gaps
- DRA 5.0's exact per-lander landed mass (~40 t) and total IMLEO (~850 t) were beyond the truncated fetch; the writer should treat "~40 t per lander" as unverified here.
- Crew-size conflict (DRA 5.0 says 6; Cegłowski says 4 for "the 2009 reference architecture") is unresolved; DRA 5.0 is the primary source.
