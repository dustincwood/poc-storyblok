// Sets the site header fields (page content type: header_site_name, header_site_link, header_parent_name,
// header_parent_link) on folder start pages, saving drafts. Sub-pages and sub-folders inherit them.
//
// Usage: node scripts/migrate-mc/set-header.mjs <headers.json> --space <id>
// headers.json: [{ "story": "<full_slug of a start page>", "site": "Name", "parent": "Name", "parentStory": "<full_slug>" }]
//   site/parent are the names; parentStory makes the parent name a story link (empty site link: the page itself)
// Uses the token from `storyblok login` (~/.storyblok/credentials.json) or STORYBLOK_PERSONAL_ACCESS_TOKEN.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const args = process.argv.slice(2)
const space = args.includes('--space') ? args[args.indexOf('--space') + 1] : undefined
if (!args[0] || !space) {
  console.error('Usage: node scripts/migrate-mc/set-header.mjs <headers.json> --space <id>')
  process.exit(1)
}
const headers = JSON.parse(fs.readFileSync(args[0], 'utf8'))

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
const bySlug = async fullSlug => {
  const { stories } = await mapi('GET', `/stories/?with_slug=${encodeURIComponent(fullSlug)}`)
  if (!stories[0]) throw new Error(`No story ${fullSlug}`)
  return stories[0]
}
const storyLink = s => ({ id: s.uuid, linktype: 'story', fieldtype: 'multilink', cached_url: s.full_slug })
const empty = { id: '', url: '', linktype: 'story', fieldtype: 'multilink', cached_url: '' }

for (const h of headers) {
  const found = await bySlug(h.story)
  // The listing has no content; the full story does
  const { story } = await mapi('GET', `/stories/${found.id}`)
  const parent = h.parentStory ? await bySlug(h.parentStory) : undefined
  Object.assign(story.content, {
    header_site_name: h.site ?? '',
    header_site_link: empty,
    header_parent_name: h.parent ?? '',
    header_parent_link: parent ? storyLink(parent) : empty,
  })
  await mapi('PUT', `/stories/${story.id}`, { story: { content: story.content }, publish: 0, force_update: 1 })
  console.log(`  ${story.full_slug}: "${h.site}"${h.parent ? ` / "${h.parent}"` : ''} (draft)`)
}
