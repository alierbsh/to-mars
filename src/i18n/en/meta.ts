/**
 * The page's own words, outside the app: the tab's title, the description for search engines, the
 * link preview. Read by the build as well (vite.config.ts writes them into each language's page),
 * so this file imports nothing. The interface's catalog (ui.ts) carries it as `meta`.
 */
export const META = {
  /** the browser tab */
  title: "Occupy Mars Simulation — can today's rockets carry a crew to Mars?",
  /** the page's description for search engines */
  description: "Pick one of today's most advanced rockets, give it a crew, and watch a physics simulation decide whether it reaches Mars: real masses, real engines, real orbital mechanics, real entry heating.",
  /** the text under the title when a link to the site is shared */
  shareDescription: 'Pick a rocket, give it a crew, and let the physics decide whether it gets to Mars — and what breaks first. Real masses, real engines, real orbital mechanics.',
  /** the link preview image, described (its title is share.question) */
  imageAlt: "Starship climbing over the Florida coast at the edge of space, under the title: Can today's rockets carry a crew to Mars?",
  /** the line under the title on the link preview image */
  cardText: 'Real masses, real engines, real orbital mechanics. Watch the physics decide.',
}
