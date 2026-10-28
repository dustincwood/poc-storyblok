// Sets the top nav (the page type's top_nav) on start pages from their published usu.edu menus, saving
// drafts. Links to pages already migrated become story links, so they stay in the Storyblok site; the rest
// point at usu.edu. Sub-pages and sub-folders inherit a start page's menu.
//
// Usage: node scripts/migrate-mc/set-nav.mjs <navs.json> --space <id> --prefix <folder>
// navs.json: [{ "story": "<full_slug of a start page>", "published": "<its usu.edu url>" }]
// --prefix: the Storyblok folder the migrated site sits in, e.g. advising-migration-test (usu.edu's
//   /advising/exploratory/ is then the story advising-migration-test/advising/exploratory/)
// Uses the token from `storyblok login` (~/.storyblok/credentials.json) or STORYBLOK_PERSONAL_ACCESS_TOKEN.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parse } from 'ultrahtml'
import { navBlocks, publishedMenu } from './nav.mjs'

const args = process.argv.slice(2)
const opt = name => args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined
const space = opt('space')
const prefix = (opt('prefix') ?? '').replace(/^\/|\/$/g, '')
if (!args[0] || !space || !prefix) {
  console.error('Usage: node scripts/migrate-mc/set-nav.mjs <navs.json> --space <id> --prefix <folder>')
  process.exit(1)
}
const navs = JSON.parse(fs.readFileSync(args[0], 'utf8'))

const login = (() => { try { return Object.values(JSON.parse(fs.readFileSync(path.join(os.homedir(), '.storyblok', 'credentials.json'), 'utf8')))[0] } catch { return undefined } })()
const token = process.env.STORYBLOK_PERSONAL_ACCESS_TOKEN ?? login?.password
if (!token) throw new Error('No token: run `npx storyblok login` or set STORYBLOK_PERSONAL_ACCESS_TOKEN')
const base = `https://mapi.storyblok.com/v1/spaces/${space}`
async function mapi(method, url, body) {
  const res = await fetch(base + url, { method, headers: { Authorization: token, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status} ${text.slice(0, 200)}`)
  return text ? JSON.parse(text) : {}
}

// Every migrated story under the prefix, by full slug
const stories = new Map()
for (let page = 1; ; page++) {
  const { stories: list } = await mapi('GET', `/stories/?starts_with=${encodeURIComponent(prefix + '/')}&per_page=100&page=${page}`)
  for (const s of list) if (!s.is_folder) stories.set(s.full_slug, s)
  if (list.length < 100) break
}

// A usu.edu address -> the migrated story's slug: /advising/exploratory/index.php -> <prefix>/advising/exploratory/
const USU = 'https://www.usu.edu'
function storyFor(href) {
  const url = new URL(href, USU)
  if (url.origin !== USU) return undefined
  const p = url.pathname.replace(/\/index\.php$/, '/').replace(/\.php$/, '')
  return stories.get(`${prefix}${p}`) ?? stories.get(`${prefix}${p}/`)
}
let toStory = 0, toUsu = 0
function toLink(href) {
  const s = storyFor(href)
  if (s) { toStory++; return { id: s.uuid, linktype: 'story', fieldtype: 'multilink', cached_url: s.full_slug } }
  toUsu++
  const url = new URL(href, USU).href.replace(/^(https:\/\/www\.usu\.edu\/.*?)(\/index)?\.php(?=[?#]|$)/, (_, p, idx) => idx ? `${p}/` : p)
  return { url, linktype: 'url', fieldtype: 'multilink', cached_url: url }
}

for (const n of navs) {
  const html = await (await fetch(n.published, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text()
  const top_nav = navBlocks(publishedMenu(parse(html)), toLink)
  if (!top_nav.length) throw new Error(`No menu on ${n.published}`)
  const found = stories.get(n.story)
  if (!found) throw new Error(`No story ${n.story}`)
  const { story } = await mapi('GET', `/stories/${found.id}`)
  story.content.top_nav = top_nav
  await mapi('PUT', `/stories/${story.id}`, { story: { content: story.content }, publish: 0, force_update: 1 })
  console.log(`  ${story.full_slug}: ${top_nav.map(b => b.label + (b.links ? ` (${b.links.length})` : '')).join(' · ')} (draft)`)
}
console.log(`Links: ${toStory} to migrated stories, ${toUsu} to usu.edu`)
