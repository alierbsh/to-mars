/**
 * Vehicle catalogue. Every number traces to docs/research/ (report tables 9–13, 19–20).
 * Confidence: Y high (official / several independent sources), O medium (Wikipedia-grade,
 * consistent), D low (single secondary source or estimate), T derived in the research notes.
 * Unpublished masses are flagged as estimates and are exposed as sliders in the UI.
 */
import type { Vehicle } from '../sim/types'

const tf = 9806.65 // N per tonne-force

export const VEHICLES: Vehicle[] = [
  {
    id: 'starship-v3',
    name: 'Starship V3 (Super Heavy + Ship)',
    short: 'Starship V3',
    manufacturer: 'SpaceX',
    status: 'development',
    badge: 'in development',
    tagline: 'The only vehicle designed for the whole chain — if orbital refuelling works.',
    description:
      '124 m, 9 m stainless-steel two-stage. 33 Raptor 3 on the booster, 6 on the ship. Flew three times in 2026; reached orbit once (Flight 14, Sep 28). Ship-to-ship propellant transfer never attempted.',
    height: 124.4,
    stages: [
      {
        id: 'superheavy',
        name: 'Super Heavy B3',
        role: 'core',
        dryMass: 250_000, // unpublished: 200–275 t bracket (D/T)
        propMass: 3_650_000, // O (relative statement Y)
        engines: [{ label: 'Raptor 3', count: 33, thrustVac: 275 * tf, ispVac: 350, ispSL: 330, minThrottle: 0.4 }],
        reserveFrac: 0.06, // boostback + landing (T)
        diameter: 9,
        length: 72.3,
        reusable: true,
      },
      {
        id: 'ship',
        name: 'Starship S3',
        role: 'upper',
        dryMass: 140_000, // unpublished: 100–160 t bracket (D/T), incl. ~10 t heat shield
        propMass: 1_600_000,
        engines: [
          { label: 'Raptor 3 (sea level)', count: 3, thrustVac: 275 * tf, ispVac: 350, ispSL: 330, minThrottle: 0.4 },
          { label: 'Raptor Vacuum', count: 3, thrustVac: 306 * tf, ispVac: 380, exitArea: 4.5, minThrottle: 0.4 },
        ],
        diameter: 9,
        length: 52.1,
        reusable: true,
      },
    ],
    fairingMass: 0,
    fairingJettisonAlt: null,
    spacecraft: {
      id: 'ship-crew',
      name: 'Starship crew ship',
      dryMass: 0, // the ship itself is the final stage; crew systems + cargo are mission parameters
      propMass: 0,
      isp: 365,
      thrust: 17_000_000,
      crewCapacity: 12,
      lifeSupportDays: 0, // sized from consumables
      volume: 1000,
      entry: {
        kind: 'ship',
        refArea: 450, // 9 m × 50 m planform, belly-first (T)
        cd: 1.3, // 1.1–1.5 (T)
        ld: 0.35, // belly-flop trim estimate (unsourced)
        noseRadius: 4.5, // body radius, belly-first stagnation line
        // Calibrated: the model's Sutton–Graves peak for the Earth LEO re-entries Starship has survived
        // (7.4–7.7 km/s, 170–200 t) is 43–49 W/cm²; 1,400 °C radiative equilibrium ≈ 40 W/cm² (T).
        tpsLimit: 50,
        tpsName: 'Hexagonal silica tiles, reusable (~1,400 °C; Earth LEO re-entry demonstrated)',
        heatLoadLimit: 0,
      },
      landing: {
        thrust: 3 * 275 * tf,
        isp: 350,
        minThrottle: 0.4,
        reserve: 60_000, // ~0.9 km/s supersonic-retropropulsion landing burn on ~220 t at β ≈ 430 (model result)
        label: '3 × Raptor 3 (sea level), flip + landing burn',
      },
      shielding: 0,
    },
    launchSite: { name: 'Kennedy LC-39A (Starship pad)', lat: 28.6, pad: 'lc39a-starship' },
    maxAccelG: 4,
    refuelable: true,
    refuelCapacity: 1_600_000,
    record: '14 flights (2023–26): 1 orbital. Booster catch 3/3 in 2024–25, 0/3 with V3. Refuelling: not demonstrated.',
    sources: [
      { label: 'Wikipedia: SpaceX Starship', url: 'https://en.wikipedia.org/wiki/SpaceX_Starship' },
      { label: 'Wikipedia: SpaceX Raptor', url: 'https://en.wikipedia.org/wiki/SpaceX_Raptor' },
      { label: 'Research report, Tables 2, 3, 9', url: 'docs/research/rapor-insanli-mars-gorevi-icin-roketler.md' },
    ],
    confidence: 'Propellant loads O, thrust/Isp Y/O, dry masses D (sliders), aero D/T',
  },
  {
    id: 'sls-orion',
    name: 'SLS Block 1 + Orion',
    short: 'SLS + Orion',
    manufacturer: 'NASA / Boeing / Lockheed',
    status: 'flown',
    badge: 'flown · crewed',
    tagline: 'The only crew-rated deep-space system that has flown. 21 days of life support.',
    description:
      '98 m, 2,610 t. Two 5-segment SRBs, four RS-25s on the orange core, single-RL10 ICPS, Orion capsule with ESA service module. Artemis II carried four astronauts around the Moon in April 2026. Block 1B/2 upgrades cancelled Feb 2026.',
    height: 98.3,
    stages: [
      {
        id: 'srb',
        name: 'Five-segment SRB',
        role: 'booster',
        count: 2,
        dryMass: 97_000, // gross 730 t; propellant unpublished → 633 t (5-seg PBAN estimate, D)
        propMass: 633_000,
        engines: [{ label: 'Solid motor', count: 1, thrustVac: 14_200_000, ispVac: 269, exitArea: 11.5, minThrottle: 1 }],
        diameter: 3.7,
        length: 54,
      },
      {
        id: 'core',
        name: 'Core stage',
        role: 'core',
        dryMass: 97_940,
        propMass: 984_000,
        engines: [{ label: 'RS-25', count: 4, thrustVac: 2_280_000, ispVac: 452, ispSL: 366, minThrottle: 0.67 }],
        diameter: 8.4,
        length: 64.6,
      },
      {
        id: 'icps',
        name: 'ICPS',
        role: 'upper',
        dryMass: 3_490,
        propMass: 28_576,
        engines: [{ label: 'RL10B-2', count: 1, thrustVac: 110_100, ispVac: 465.5, minThrottle: 1 }],
        diameter: 5.1,
        length: 13.7,
      },
    ],
    fairingMass: 6_900, // launch abort system tower, jettisoned after SRB sep
    fairingJettisonAlt: 85_000,
    spacecraft: {
      id: 'orion',
      name: 'Orion (CM + ESM)',
      dryMass: 17_900,
      propMass: 8_600,
      isp: 316, // AJ10 MON-3/MMH, assumption (T)
      thrust: 26_600,
      crewCapacity: 4,
      lifeSupportDays: 21,
      volume: 8.9,
      entry: {
        kind: 'capsule',
        refArea: 19.9,
        cd: 1.3,
        ld: 0.25,
        noseRadius: 6.0,
        tpsLimit: 450,
        tpsName: 'Avcoat ablator (Earth-return rated, 11 km/s flown)',
      },
      landing: null,
      shielding: 32,
      entryMass: 10_400, // crew module only; ESM jettisoned before entry
    },
    launchSite: { name: 'Kennedy LC-39B', lat: 28.6, pad: 'lc39b-ml' },
    maxAccelG: 4,
    refuelable: false,
    record: '2 flights, 2 successes (Artemis I 2022, Artemis II Apr 2026). ~1 launch per 10 months, ≥$2.5 B each.',
    sources: [
      { label: 'Wikipedia: Space Launch System', url: 'https://en.wikipedia.org/wiki/Space_Launch_System' },
      { label: 'NASA SLS Reference Guide 2022', url: 'https://www.nasa.gov/wp-content/uploads/2022/03/sls-reference-guide-2022-v2-508-0.pdf' },
      { label: 'Wikipedia: Orion', url: 'https://en.wikipedia.org/wiki/Orion_(spacecraft)' },
    ],
    confidence: 'Core/ICPS/Orion masses O, SRB propellant D, Orion Isp T',
  },
  {
    id: 'falcon-heavy-dragon',
    name: 'Falcon Heavy + Crew Dragon',
    short: 'Falcon Heavy',
    manufacturer: 'SpaceX',
    status: 'flown',
    badge: 'flown · 13/13',
    tagline: 'The most reliable heavy lifter. 16.8 t to Mars — about one Dragon, with a week of air.',
    description:
      '70 m, three Falcon 9 cores, 27 Merlin 1D. 13 launches, 13 successes, incl. Europa Clipper (6 t, fully expendable). Here it flies the "Red Dragon" idea SpaceX cancelled in 2017: a Crew Dragon on a trans-Mars injection, landing on its SuperDracos.',
    height: 70,
    stages: [
      {
        id: 'side',
        name: 'Side booster',
        role: 'booster',
        count: 2,
        dryMass: 22_200,
        propMass: 410_900,
        engines: [{ label: 'Merlin 1D', count: 9, thrustVac: 914_000, ispVac: 311, ispSL: 282, minThrottle: 0.4 }],
        reserveFrac: 0.07,
        diameter: 3.7,
        length: 42.6,
        reusable: true,
      },
      {
        id: 'center',
        name: 'Center core',
        role: 'core',
        dryMass: 22_200,
        propMass: 410_900,
        engines: [{ label: 'Merlin 1D', count: 9, thrustVac: 914_000, ispVac: 311, ispSL: 282, minThrottle: 0.4 }],
        throttleWhileBoosters: 0.7,
        diameter: 3.7,
        length: 47.1,
      },
      {
        id: 's2',
        name: 'Second stage',
        role: 'upper',
        dryMass: 4_000,
        propMass: 107_500,
        engines: [{ label: 'Merlin Vacuum', count: 1, thrustVac: 934_000, ispVac: 348, minThrottle: 0.4 }],
        diameter: 3.7,
        length: 12.6,
      },
    ],
    fairingMass: 0,
    fairingJettisonAlt: null,
    spacecraft: {
      id: 'dragon',
      name: 'Crew Dragon (+ trunk)',
      dryMass: 11_100,
      propMass: 1_388,
      isp: 235,
      thrust: 8 * 71_000,
      crewCapacity: 4,
      lifeSupportDays: 7,
      volume: 9.3,
      entry: {
        kind: 'capsule',
        refArea: 12.6,
        cd: 1.3,
        ld: 0.18,
        noseRadius: 4.5,
        tpsLimit: 1200,
        tpsName: 'PICA-X ablator',
      },
      landing: {
        thrust: 8 * 71_000,
        isp: 235,
        minThrottle: 0.2,
        reserve: 1_388,
        label: '8 × SuperDraco',
      },
      shielding: 0,
      entryMass: 9_100, // capsule without trunk, incl. SuperDraco propellant
    },
    launchSite: { name: 'Kennedy LC-39A', lat: 28.6, pad: 'lc39a-fss' },
    maxAccelG: 4,
    refuelable: false,
    record: '13 launches, 13 successes (2018–2026). Red Dragon to Mars was cancelled in 2017.',
    sources: [
      { label: 'Wikipedia: Falcon Heavy', url: 'https://en.wikipedia.org/wiki/Falcon_Heavy' },
      { label: 'Wikipedia: Falcon 9 Block 5', url: 'https://en.wikipedia.org/wiki/Falcon_9_Block_5' },
      { label: 'Wikipedia: SpaceX Dragon 2', url: 'https://en.wikipedia.org/wiki/SpaceX_Dragon_2' },
    ],
    confidence: 'Stage masses O, Dragon masses O/D, Dragon free-flight life support D',
  },
  {
    id: 'new-glenn',
    name: 'New Glenn (7x2)',
    short: 'New Glenn',
    manufacturer: 'Blue Origin',
    status: 'flown',
    badge: 'flown · 2/3',
    tagline: 'A 98 m methalox heavy lifter with no crew vehicle to carry. Flies a 6 t probe here.',
    description:
      '98 m, 7 m diameter, seven BE-4s and a hydrolox second stage. Three flights: NG-1 (Jan 2025), NG-2 with NASA ESCAPADE to Mars (Nov 2025), NG-3 (Apr 2026, wrong orbit). A fourth vehicle destroyed the only pad in May 2026. Stage masses are unpublished — estimates.',
    height: 98,
    stages: [
      {
        id: 'gs1',
        name: 'GS1',
        role: 'core',
        dryMass: 95_000, // unpublished (D)
        propMass: 1_270_000, // from tank volumes (T, D)
        engines: [{ label: 'BE-4', count: 7, thrustVac: 3_100_000, ispVac: 340, ispSL: 312, minThrottle: 0.4 }],
        reserveFrac: 0.08,
        diameter: 7,
        length: 57.5,
        reusable: true,
      },
      {
        id: 'gs2',
        name: 'GS2',
        role: 'upper',
        dryMass: 25_000, // unpublished (D)
        propMass: 260_000, // from burn time × mass flow (T)
        engines: [{ label: 'BE-3U', count: 2, thrustVac: 890_000, ispVac: 445, minThrottle: 0.4 }],
        diameter: 7,
        length: 23.4,
      },
    ],
    fairingMass: 4_000,
    fairingJettisonAlt: 110_000,
    spacecraft: {
      id: 'probe',
      name: 'Notional 6 t Mars probe (no crew)',
      dryMass: 6_000,
      propMass: 0,
      isp: 0,
      thrust: 0,
      crewCapacity: 0,
      lifeSupportDays: 0,
      volume: 0,
      entry: null,
      landing: null,
      shielding: 0,
    },
    launchSite: { name: 'Cape Canaveral LC-36', lat: 28.5, pad: 'lc36' },
    maxAccelG: 6,
    refuelable: false,
    record: '3 flights: 2 successes, 1 failure. Booster landed 2/3. Pad LC-36 destroyed 28 May 2026; return to flight NET Dec 2026.',
    sources: [
      { label: 'Blue Origin: New Glenn', url: 'https://www.blueorigin.com/new-glenn' },
      { label: 'Wikipedia: New Glenn', url: 'https://en.wikipedia.org/wiki/New_Glenn' },
    ],
    confidence: 'Thrust/Isp Y/O, all stage masses D/T (unpublished)',
  },
  {
    id: 'long-march-10',
    name: 'Long March 10 + Mengzhou',
    short: 'Long March 10',
    manufacturer: 'CASC / CMSA',
    status: 'development',
    badge: 'in development',
    tagline: "China's crewed lunar rocket: three 5 m cores, 21 YF-100K. Built for the Moon, not Mars.",
    description:
      '92.5 m, 2,189 t, ≥27 t to TLI. The single-core 10A flew a suborbital crew-abort test in Feb 2026; the first orbital flight of the 10B variant was reported in July 2026 (unverified). Mengzhou is a 3-seat lunar capsule.',
    height: 92.5,
    stages: [
      {
        id: 'lm10-booster',
        name: 'Side core',
        role: 'booster',
        count: 2,
        dryMass: 42_000, // unpublished (D)
        propMass: 520_000,
        engines: [{ label: 'YF-100K', count: 7, thrustVac: 1_396_000, ispVac: 337, ispSL: 301.6, minThrottle: 0.5 }],
        diameter: 5,
        length: 58,
      },
      {
        id: 'lm10-core',
        name: 'Core stage',
        role: 'core',
        dryMass: 55_000, // unpublished (D)
        propMass: 680_000,
        engines: [{ label: 'YF-100K', count: 7, thrustVac: 1_396_000, ispVac: 337, ispSL: 301.6, minThrottle: 0.5 }],
        diameter: 5,
        length: 58,
      },
      {
        id: 'lm10-s2',
        name: 'Second stage',
        role: 'core',
        dryMass: 15_000, // unpublished (D)
        propMass: 185_000,
        engines: [{ label: 'YF-100M', count: 2, thrustVac: 1_460_000, ispVac: 352.3, minThrottle: 0.5 }],
        diameter: 5,
        length: 11,
      },
      {
        id: 'lm10-s3',
        name: 'Third stage (hydrolox)',
        role: 'upper',
        dryMass: 6_500, // unpublished (D)
        propMass: 59_000,
        engines: [{ label: 'YF-75E', count: 3, thrustVac: 92_100, ispVac: 451.1, minThrottle: 1 }],
        diameter: 5,
        length: 10,
      },
    ],
    fairingMass: 7_000, // escape tower + shroud (D)
    fairingJettisonAlt: 85_000,
    spacecraft: {
      id: 'mengzhou',
      name: 'Mengzhou (lunar variant)',
      dryMass: 20_500, // D
      propMass: 5_500, // D
      isp: 316,
      thrust: 25_000,
      crewCapacity: 3,
      lifeSupportDays: 21, // assumed Orion-like (D)
      volume: 13,
      entry: {
        kind: 'capsule',
        refArea: 15.9,
        cd: 1.3,
        ld: 0.25,
        noseRadius: 5.5,
        tpsLimit: 450,
        tpsName: 'Ablative shield (lunar-return rated)',
      },
      landing: null,
      shielding: 0,
      entryMass: 7_000, // return module estimate (D)
    },
    launchSite: { name: 'Cape Canaveral SLC-37 (notional; built for Wenchang)', lat: 28.5, pad: 'slc37' },
    maxAccelG: 4,
    refuelable: false,
    record: '0 orbital flights of the three-core version. 10A suborbital abort test Feb 2026 (success).',
    sources: [
      { label: 'Wikipedia: Long March 10', url: 'https://en.wikipedia.org/wiki/Long_March_10' },
      { label: 'Wikipedia: Mengzhou', url: 'https://en.wikipedia.org/wiki/Mengzhou_(spacecraft)' },
    ],
    confidence: 'Propellant/thrust/Isp O, dry masses D, Mengzhou D',
  },
  {
    id: 'saturn-v-apollo',
    name: 'Saturn V + Apollo CSM',
    short: 'Saturn V',
    manufacturer: 'NASA / Boeing / North American / Douglas',
    status: 'historical',
    badge: 'historical · 13/13',
    tagline: 'The benchmark. 111 m, 2,900 t, 13 flights, zero crew lost. Two weeks of life support.',
    description:
      'Three stages: S-IC with five F-1s, S-II with five J-2s, restartable S-IVB. Sent 24 people to the Moon 1968–72. Here the S-IVB and the Apollo Service Propulsion System try a trans-Mars injection instead of TLI.',
    height: 110.6,
    stages: [
      {
        id: 's-ic',
        name: 'S-IC',
        role: 'core',
        dryMass: 130_000,
        propMass: 2_160_000,
        engines: [{ label: 'F-1', count: 5, thrustVac: 7_770_000, ispVac: 304, ispSL: 263, minThrottle: 1 }],
        diameter: 10.06,
        length: 42,
      },
      {
        id: 's-ii',
        name: 'S-II',
        role: 'core',
        dryMass: 39_000,
        propMass: 456_000,
        engines: [{ label: 'J-2', count: 5, thrustVac: 1_033_000, ispVac: 421, minThrottle: 1 }],
        diameter: 10.06,
        length: 24.9,
      },
      {
        id: 's-ivb',
        name: 'S-IVB',
        role: 'upper',
        dryMass: 13_500,
        propMass: 109_000,
        engines: [{ label: 'J-2', count: 1, thrustVac: 1_033_000, ispVac: 421, minThrottle: 1 }],
        diameter: 6.6,
        length: 17.8,
      },
    ],
    fairingMass: 4_000, // launch escape system
    fairingJettisonAlt: 90_000,
    spacecraft: {
      id: 'apollo-csm',
      name: 'Apollo CSM',
      dryMass: 11_900,
      propMass: 18_400,
      isp: 314,
      thrust: 91_000,
      crewCapacity: 3,
      lifeSupportDays: 14,
      volume: 6.2,
      entry: {
        kind: 'capsule',
        refArea: 12.0,
        cd: 1.3,
        ld: 0.3,
        noseRadius: 4.69,
        tpsLimit: 450,
        tpsName: 'Avcoat ablator (11 km/s lunar return)',
      },
      landing: null,
      shielding: 0,
      entryMass: 5_800, // command module only
    },
    launchSite: { name: 'Kennedy LC-39A (1969)', lat: 28.6, pad: 'lc39a-lut' },
    maxAccelG: 4,
    refuelable: false,
    record: '13 launches 1967–73, 13 successes (Apollo 6 partial). Retired 1973.',
    sources: [
      { label: 'Wikipedia: Saturn V', url: 'https://en.wikipedia.org/wiki/Saturn_V' },
      { label: 'Wikipedia: Apollo CSM', url: 'https://en.wikipedia.org/wiki/Apollo_command_and_service_module' },
    ],
    confidence: 'All masses O (well documented)',
  },
]

export const vehicleById = (id: string): Vehicle => {
  const v = VEHICLES.find((x) => x.id === id)
  if (!v) throw new Error(`unknown vehicle ${id}`)
  return v
}
