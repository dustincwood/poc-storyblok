// Find Your Advisor (advising/exploratory/find-your-advisor) is a script-driven form, not content: run
// migrate.mjs first for the hero, then this to replace the page body with a moca-advisor-finder holding
// the advisor data from advising.js and the page.
//
// Usage: node scripts/migrate-mc/advisor-finder.mjs <name.story.json> <page.pcf> --published <url>
// advising.js is read as text (its object literals converted to JSON), never run.
import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import { decode } from 'entities'
import { parse, ELEMENT_NODE, TEXT_NODE, renderSync as render } from 'ultrahtml'
import { htmlToStoryblokRichtext } from '@storyblok/richtext/html-parser'

const args = process.argv.slice(2)
const [storyFile, pcfPath] = args
const published = args.includes('--published') ? args[args.indexOf('--published') + 1] : undefined
if (!storyFile || !pcfPath || !published) {
  console.error('Usage: node scripts/migrate-mc/advisor-finder.mjs <name.story.json> <page.pcf> --published <url>')
  process.exit(1)
}

const blok = (component, fields = {}) => ({ _uid: randomUUID(), component, ...fields })
const isEl = (n, name) => n.type === ELEMENT_NODE && (!name || n.name === name)
const findAll = (n, test) => [...(test(n) ? [n] : []), ...(n.children ?? []).flatMap(c => findAll(c, test))]
const find = (n, test) => findAll(n, test)[0]
const text = n => n.type === TEXT_NODE ? n.value : (n.children ?? []).map(text).join('')
const clean = s => decode(s).replace(/\s+/g, ' ').trim()
const byId = (doc, id) => find(doc, n => isEl(n) && n.attributes.id === id)

// ---------- The page: labels, location list, undecided advisors, error message ----------

const pcf = parse(fs.readFileSync(pcfPath, 'utf8').replace(/<!--[\s\S]*?-->/g, ''))
const labelFor = id => clean(text(find(pcf, n => isEl(n, 'label') && n.attributes.for === id)))
const locationOptions = findAll(byId(pcf, 'location'), n => isEl(n, 'option') && n.attributes.value)
// Advisors name locations by option value; the finder lists them by label (Price -> USU Eastern - Price)
const locationLabel = new Map(locationOptions.map(o => [o.attributes.value.toLowerCase(), clean(text(o))]))

const undecided = byId(pcf, 'undecided')
const undecidedTitle = clean(text(find(undecided, n => isEl(n, 'p'))))
const undecidedCards = findAll(undecided, n => isEl(n) && (n.attributes.class ?? '').split(/\s+/).includes('card-body'))
  .map(body => `<p>${(find(body, n => isEl(n, 'p')).children ?? []).map(render).join('')}</p>`)

// ---------- advising.js: the advisors and the Logan focus areas ----------

const scriptSrc = (await (await fetch(published)).text()).match(/<script[^>]+src="([^"]*advising\.js)"/)?.[1]
if (!scriptSrc) throw new Error('No advising.js script on the published page')
const script = await (await fetch(new URL(scriptSrc, published))).text()

// An array literal of plain objects and strings -> JSON: drop comments, quote keys, drop trailing commas
function literal(name) {
  const start = script.indexOf(`const ${name} = [`)
  if (start < 0) throw new Error(`No ${name} in advising.js`)
  const body = script.slice(script.indexOf('[', start), script.indexOf('];', start) + 1)
  return JSON.parse(body
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":')
    .replace(/,(\s*[}\]])/g, '$1'))
}
const advisorData = literal('advisorData')
const focusAreas = literal('loganFocusAreas')

const advisors = advisorData.map(a => blok('moca-advisor', {
  name: a.name,
  // Some photos are site-relative (/advising/images/...)
  image: a.image ? { filename: new URL(a.image, published).href, alt: a.name, fieldtype: 'asset' } : undefined,
  phone: a.phone,
  email: a.email,
  appointment_link: a.appointmentLink ? { linktype: 'url', url: a.appointmentLink, cached_url: a.appointmentLink, fieldtype: 'multilink' } : undefined,
  locations: a.location.split(',').map(l => locationLabel.get(l.trim().toLowerCase()) ?? l.trim()).filter(Boolean).join(', '),
  focus_area: a.focusArea,
  last_name_range: a.lastNameRange,
}))

const finder = blok('moca-advisor-finder', {
  location_label: labelFor('location'),
  locations: locationOptions.map(o => clean(text(o))).join('\n'),
  focus_area_label: labelFor('focusArea'),
  focus_areas: focusAreas.join('\n'),
  last_name_label: labelFor('lastNameRange'),
  advisors,
  undecided_option: 'Undecided',
  undecided_title: undecidedTitle,
  undecided: htmlToStoryblokRichtext(undecidedCards.join('')),
  error_message: clean(text(byId(pcf, 'errorMessage'))),
  button_text: clean(text(byId(pcf, 'advisorLink'))),
})

// ---------- The story: the hero from migrate.mjs, then the finder in the page's container ----------

const doc = JSON.parse(fs.readFileSync(storyFile, 'utf8'))
const body = doc.story.content.body
const hero = body.find(b => b.component === 'moca-hero-banner')
doc.story.content.body = [...(hero ? [hero] : []), blok('moca-container', { width: 'default', margin_y: '5', padding_y: '', content: [finder] })]
fs.writeFileSync(storyFile, JSON.stringify(doc, null, 2) + '\n')

const reportFile = storyFile.replace(/\.story\.json$/, '.report.md')
if (fs.existsSync(reportFile)) fs.appendFileSync(reportFile, `
## Advisor finder (advisor-finder.mjs)

The form and advising.js were replaced by one moca-advisor-finder: ${advisors.length} advisor entries from
${new URL(scriptSrc, published)}, ${locationOptions.length} locations, ${focusAreas.length} focus areas and
${undecidedCards.length} undecided advisors from the page. The blocks generated above are superseded.
`)
console.log(`Advisor finder: ${advisors.length} advisors, ${locationOptions.length} locations, ${focusAreas.length} focus areas, ${undecidedCards.length} undecided`)
