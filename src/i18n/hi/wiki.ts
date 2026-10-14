/** The wiki — hi (translated from en/wiki.ts; same chapters). */
import type { WikiCatalog } from '../types'

export const WIKI: WikiCatalog = {
  why: {
    title: 'Why a city on Mars',
    lead: 'The one-planet problem, and why Mars is the only answer within reach.',
    body: [
      'Every living thing that has ever existed has lived on one planet. That makes life fragile in a way we rarely think about: a large enough asteroid, a supervolcano, a war, a bad century — and there is no backup. A second, self-sustaining settlement is the first real insurance policy life has ever been offered.',
      'Mars is the only candidate close enough. Its day is 24 hours 37 minutes, so plants and people keep a familiar rhythm. There is water, frozen in the ground and at the poles. The thin air is carbon dioxide, which with water and electricity becomes methane and oxygen — rocket fuel, and something to breathe. Sunlight is weaker than here, about 43 % at the equator, but enough for crops under glass.',
      'None of that makes it a home. It makes it a frontier that could become one. This site asks the first question on the way there: can the rockets that exist today carry a crew to the surface alive — and if not, what breaks first?',
    ],
  },
  rockets: {
    title: 'Why rockets are mostly fuel',
    lead: 'The rocket equation in one paragraph, and why vehicles come in stages.',
    body: [
      'A rocket moves by throwing mass out of the back very fast. To go faster it has to throw more, but the propellant it has not thrown yet is dead weight that also has to be accelerated. That feedback is brutal: reaching orbit needs a change of speed of about 9.4 km/s, and with the best chemical engines that means roughly 90 % of a rocket on the pad is propellant. Starship V3 weighs about 5,700 tonnes on the pad and under 400 tonnes empty.',
      'Staging is the escape from that arithmetic. Once the first tanks are empty they are dropped, so the engines of the next stage push only what is still useful. Every vehicle here has two or three stages; Falcon Heavy and SLS also strap boosters to the side of the core and drop them first.',
      '## What the simulation does with it',
      'Each stage carries its real dry mass, propellant load and engines (thrust and efficiency at sea level and in vacuum). Numbers nobody has published — Starship’s dry masses above all — are not guessed once and hidden: they are sliders under Mission settings → Advanced, with the published bracket as the range.',
    ],
  },
  liftoff: {
    title: 'Liftoff and the first minutes',
    lead: 'Ignition, the hold-down, max-Q, and why a rocket leans over almost at once.',
    body: [
      'The engines light a few seconds before the clock reaches zero and are checked while clamps hold the vehicle down; only when every engine is healthy is it released. At liftoff the thrust is only slightly more than the weight — Starship accelerates at about 0.5 g — so the first seconds are slow. The deluge water you see is there to protect the pad from the sound as much as the heat: the acoustic energy alone would shake the vehicle apart.',
      'Within seconds the vehicle begins to tilt east. Going straight up would waste everything: orbit is not about height but about speed — 28,000 km/h sideways. The tilt, called the gravity turn, lets gravity swing the nose over gradually while the rocket keeps thrusting along its direction of travel, which is the most efficient path there is.',
      '## Max-Q',
      'About a minute in, the rocket is going fast but the air is still thick. The force of the airflow — dynamic pressure, "Q" — peaks here, around 25–35 kPa for these vehicles. Engines are throttled down for a few seconds so the structure is not pushed past its limits, then back up as the air thins. The speed of sound is passed around the same time.',
      '## In the simulation',
      'The climb is integrated step by step: thrust that rises as the air pressure falls, drag from the real atmosphere, the gravity turn and a closed-loop guidance law that steers into the target orbit. Crewed vehicles are held to 4 g.',
    ],
  },
  staging: {
    title: 'Staging and the ride to orbit',
    lead: 'MECO, separation, the long second burn, and what "in orbit" really means.',
    body: [
      'Two to three minutes in, the first stage has burned almost everything it carried. Its engines cut off (MECO — main engine cut-off), the stages separate, and the upper stage lights. Starship does this "hot": the ship’s engines ignite while still attached, pushing off the booster. The booster is now at 60–70 km and 6,000–8,000 km/h, nowhere near orbit, and falls back toward the sea; Starship’s and Falcon’s boosters fly back to be caught or landed.',
      'The upper stage burns for another six to eight minutes, nearly horizontal, until it reaches orbital speed — about 7.8 km/s, 28,000 km/h, at 200 km. At that speed the ground curves away as fast as the vehicle falls toward it: that is all an orbit is, a fall that never lands. SECO (second engine cut-off) marks the moment.',
      '## Why it can fail',
      'Not enough propellant, and the vehicle falls short: it either re-enters immediately or reaches an orbit whose low point still skims the air. The simulation reports the orbit it reached (perigee × apogee) and how much propellant was left — that residual is what the rest of the mission has to live on.',
    ],
  },
  refuelling: {
    title: 'Orbit and refuelling',
    lead: 'Why Starship arrives in orbit nearly empty, and how tankers fill it.',
    body: [
      'Getting to orbit uses almost all the propellant a rocket carries. Starship reaches orbit with roughly 100–200 tonnes left in a 1,600-tonne tank — far too little to push itself to Mars and land. SpaceX’s plan is to fly tanker Starships, dock, and pump propellant across, over and over, until the ship is full enough for the trip.',
      'Three numbers decide whether this works, and none of them has been measured in flight yet: how much a tanker actually delivers per flight (the plan says ~100 tonnes), how fast the cryogenic propellant boils off while it waits in sunlight (a fraction of a percent per day, compounding), and how quickly tankers can be launched. Slow cadence means more boil-off and more tankers; too slow and the departure window closes before the ship is full.',
      'The Propellant dial on the lower third shows tonnes aboard against what the mission needs; the timeline marks each tanker docking. The three presets — SpaceX’s claims, independent estimates, what has been demonstrated — bracket those unknowns.',
      'Everything else (Orion, Dragon, Mengzhou, Apollo) cannot be refuelled: whatever propellant their upper stage has left in orbit is all they get.',
    ],
  },
  window: {
    title: 'The launch window',
    lead: 'Why Mars is reachable only every 26 months, and why some years are harder than others.',
    body: [
      'Earth and Mars both circle the Sun, Earth faster. A ship leaving Earth does not aim at where Mars is but at where it will be eight or nine months later, coasting on an ellipse that touches both orbits. That geometry lines up only once every 26 months; miss it, and the next chance is two years away.',
      'The windows are not equal. Mars’s orbit is noticeably elliptical, so in some years the two planets meet where Mars is far from the Sun and the ship arrives slowly; in others (2031, 2033) it arrives fast. The number that captures this is v-infinity, the leftover speed relative to the planet: 2.7 km/s for the easy windows, over 5 km/s for the hard ones. Arrival speed becomes entry speed, and entry speed becomes heat.',
      '## In the simulation',
      'The transfer is solved as Lambert’s problem on JPL’s planetary positions, for the chosen departure date and trip length, and checked against NASA’s published minimum-energy opportunities. Mission settings lets you pick the window; the porkchop plot under Data shows how departure and arrival dates trade against each other.',
    ],
  },
  tmi: {
    title: 'Trans-Mars injection',
    lead: 'The one burn that turns an orbit around Earth into a path to Mars.',
    body: [
      'From a 200 km parking orbit the ship needs another 3.6–4.0 km/s to escape Earth and arrive at the right speed. It gets the best value for that propellant by burning at the lowest, fastest point of its orbit — the Oberth effect: a given push adds more energy when you are already moving fast. For Starship the burn lasts a minute and a half and uses several hundred tonnes.',
      'If the ship cannot make the whole number, the mission ends here. Short by a little, and it reaches an orbit that never leaves Earth’s neighbourhood ("stuck in orbit"); the crew comes home, and the window is lost.',
    ],
  },
  cruise: {
    title: 'The cruise',
    lead: 'Six to nine months of coasting: air, water, food, and the radiation nobody can turn off.',
    body: [
      'After the burn the engines are off for the rest of the way: the ship coasts on its ellipse with only small course corrections. Nothing happens, and that is the problem. The crew has to be kept alive the whole time from what was packed.',
      'NASA’s daily budget per person is about 0.9 kg of oxygen, 2.4 kg of food and 3.5 kg of water, before recycling. A good life-support loop recovers most of the water and some of the oxygen; a capsule designed for three weeks does not have one at all. The simulation carries each vehicle’s real free-flight capability: Orion 21 days, Apollo 14, Dragon about a week — against a trip of 200–300 days.',
      '## Radiation',
      'Outside Earth’s magnetic field the crew is exposed to galactic cosmic rays all the time. The Curiosity rover measured 1.8 mSv per day on the way to Mars; a nine-month trip is about 500 mSv, most of a career limit of 600 mSv, and the trip home doubles it. There is no light shielding that stops it. The dial counts it up as you go.',
    ],
  },
  entry: {
    title: 'Entry: hitting the air at 6 km/s',
    lead: 'Why Mars is the hardest place in the solar system to land on, and what the heat shield is for.',
    body: [
      'The ship arrives at 5.5–7.5 km/s, far faster than anything can be slowed by engines alone. The atmosphere is the brake: the vehicle plunges in and the air in front of it is compressed and heated to thousands of degrees. The heat shield — the black tiles on Starship’s belly, the ablative base of a capsule — takes that energy and keeps it away from the structure. The glow you see is real: the air itself becomes plasma.',
      'Mars’s air is about 1 % as thick as Earth’s. That is thick enough to burn you up and thin enough that it does not slow you down much: a capsule that would gently float down on Earth is still supersonic a few kilometres above Mars. Every system that has landed there has needed something extra — parachutes the size of a house, airbags, a rocket crane. For a crew-sized vehicle, only rockets will do.',
      '## The numbers',
      'Peak heating is measured in watts per square centimetre at the nose. Starship’s tiles are rated here at 50 W/cm², calibrated so the Earth re-entries it has flown come out at 43–49. The 2031 and 2033 windows arrive fast enough to push past that. Peak deceleration for a crew weakened by months of weightlessness is held to 5 g. The pull-out is the moment the descent rate stops growing and the ship starts flying rather than falling.',
    ],
  },
  landing: {
    title: 'The belly flop and the flip',
    lead: 'Starship’s way down: fall flat, light the engines, swing upright, land on fire.',
    body: [
      'Below about 20 km Starship is falling belly-first like a skydiver, its four flaps steering by changing how much drag each side makes. It is still going faster than sound. A few kilometres up, three engines light while the ship is still horizontal, and the thrust swings it upright — the flip — in a few seconds. From there it is a hover-slam: the engines must kill several hundred metres per second of fall in about thirty seconds, with nothing to spare.',
      'This is supersonic retropropulsion: firing engines into air that is coming at you faster than sound. It was unproven until Falcon 9 boosters started doing it over the Atlantic; at Mars it has never been done. The simulation models the burn as a "suicide burn" that starts as late as it dares, credits the drag, and keeps a 30 % margin of thrust for control.',
      '## The capsules',
      'Orion, Dragon, Mengzhou and Apollo have no landing engines that can do this; they were built to splash down under parachutes on Earth. At Mars their parachutes would open into air too thin to matter. They hit the ground at terminal velocity — several hundred metres per second — and the simulation says so.',
    ],
  },
  verdict: {
    title: 'Touchdown, and what the verdict means',
    lead: 'The six outcomes, and why the site tells you what broke first.',
    body: [
      'A mission ends in one of six ways: landed with the crew alive; crashed (it reached the ground too fast); burned up (the heat shield was exceeded during entry); stuck in Earth orbit (not enough propellant to leave); lost in transit (the crew outlived its air, water or food, or the radiation dose); or a flyby (no way to slow down at Mars, so the ship swings past and keeps going).',
      'The verdict names the first thing that failed, with its numbers, because that is the useful answer: it tells you what would have to change. A capsule that runs out of life support on day 21 does not need a better heat shield.',
      'Landing alive is not the end of the problem — it is where the city question begins. But it is the question this site set out to answer.',
    ],
  },
  weather: {
    title: 'Dust storms',
    lead: 'The one thing about Mars that can change the answer from one month to the next.',
    body: [
      'Mars has seasons, and a dust-storm season: southern spring and summer, when the planet is closest to the Sun. Most years bring regional storms; roughly one Mars year in three a storm grows until it wraps the whole planet and the surface disappears for weeks. Dust lifted to high altitude also makes the upper atmosphere denser — which changes the entry.',
      'The simulation draws the weather for the arrival date from the historical record: the season from the solar longitude, a storm roll seeded by the date, the extra density, the surface wind, and the chance that a landing system which cannot see the ground sets down on a rock. You can override it under Mission settings → Advanced to see a clear day.',
    ],
  },
  unknowns: {
    title: 'What nobody knows yet',
    lead: 'The four numbers that decide the Starship verdict, and how to play with them.',
    body: [
      'Four quantities have never been measured and dominate the Starship answer: the ship’s dry mass (published only as a bracket), the propellant a tanker really delivers, the daily boil-off in orbit, and the heat flux the tiles can survive at Mars. The three presets bracket them; the sliders under Mission settings → Advanced let you set your own.',
      'The site’s position is simple: where a number is unknown it is a control, not a constant. A verdict is only as honest as the inputs behind it, so the inputs are on the table.',
    ],
  },
  models: {
    title: 'The physics behind it',
    lead: 'What is actually being computed, in one page.',
    body: [
      '- Launch: a planar ascent in the rotating-atmosphere frame integrated with 4th-order Runge–Kutta at 0.1 s; US Standard Atmosphere 1976; pressure-dependent thrust and Isp per engine; drag from Mach-dependent coefficients; a gravity turn and a closed-loop insertion law; the pitch-kick searched for the most propellant left in orbit.',
      '- Orbit: a tanker campaign with compounding boil-off and a launch cadence, checked against the departure period.',
      '- Transfer: Lambert’s problem on JPL’s approximate planetary elements (valid 1800–2050), with the Oberth effect, a finite-burn allowance and mid-course corrections; checked against NASA Glenn’s 2026/2028/2031/2033 opportunities to within 1 %.',
      '- Cruise: NASA’s crew consumables budget with ECLSS recovery; the Curiosity (MSL RAD) cruise dose rate against the 600 mSv career limit.',
      '- Entry: the Mars Climate Database density profile with a dust factor; lift with a bank rule; Sutton–Graves stagnation heating, calibrated on Starship’s Earth re-entries; g-load against a deconditioned-crew limit; a supersonic-retropropulsion landing burn with drag credit.',
      'Every number traces to a sourced research note with a confidence tag. The scenery — the Cape, the Earth, Mars — is built from NASA and Natural Earth data and painted to look the way it does from a rocket.',
    ],
  },
}
