// Creates a dry-run story (from migrate.mjs) in Storyblok as an unpublished draft: uploads the images it
// uses to the asset library, creates the folders on its path, then creates or updates the story.
// Reruns reuse what was created before (push-state.json next to the story file), so nothing is duplicated.
//
// Usage: node scripts/migrate-mc/push.mjs <name.story.json> --space <id> --path <folder/path> [--asset-folder <name>]
//   --path          Storyblok folders to put the story in, created when missing (e.g. advising-migration-test/advising)
//   --asset-folder  Asset folder for the uploads; defaults to the first folder in --path
// Uses the token from `storyblok login` (~/.storyblok/credentials.json) or STORYBLOK_PERSONAL_ACCESS_TOKEN.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const args = process.argv.slice(2)
const opt = name => args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined
const storyFile = args[0]
const space = opt('space')
const folderPath = (opt('path') ?? '').split('/').filter(Boolean)
if (!storyFile || !space || !folderPath.length) {
  console.error('Usage: node scripts/migrate-mc/push.mjs <name.story.json> --space <id> --path <folder/path> [--asset-folder <name>]')
  process.exit(1)
}
const assetFolderName = opt('asset-folder') ?? folderPath[0]

// ---------- Management API ----------

const credentials = (() => {
  try { return JSON.parse(fs.readFileSync(path.join(os.homedir(), '.storyblok', 'credentials.json'), 'utf8')) } catch { return {} }
})()
const login = Object.values(credentials)[0]
const token = process.env.STORYBLOK_PERSONAL_ACCESS_TOKEN ?? login?.password
if (!token) throw new Error('No token: run `npx storyblok login` or set STORYBLOK_PERSONAL_ACCESS_TOKEN')
const regionHosts = { eu: 'mapi.storyblok.com', us: 'api-us.storyblok.com', ca: 'api-ca.storyblok.com', ap: 'api-ap.storyblok.com', cn: 'app.storyblokchina.cn' }
const base = `https://${regionHosts[login?.region ?? 'eu']}/v1/spaces/${space}`

async function mapi(method, url, body) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(base + url, {
      method,
      headers: { 'Authorization': token, 'Content-Type': 'application/json' },
      body: body && JSON.stringify(body),
    })
    // Rate limited: back off and retry
    if (res.status === 429 && attempt < 5) { await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); continue }
    const text = await res.text()
    if (!res.ok) throw new Error(`${method} ${url} -> ${res.status} ${text.slice(0, 300)}`)
    return text ? JSON.parse(text) : {}
  }
}

// ---------- State ----------

const stateFile = path.join(path.dirname(storyFile), 'push-state.json')
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : {}
state.assets ??= {}
const saveState = () => fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n')

// ---------- Assets ----------

async function assetFolderId() {
  if (state.assetFolder?.name === assetFolderName) return state.assetFolder.id
  const { asset_folders } = await mapi('GET', `/asset_folders/?search=${encodeURIComponent(assetFolderName)}`)
  const folder = asset_folders.find(f => f.name === assetFolderName && !f.parent_id)
    ?? (await mapi('POST', '/asset_folders/', { asset_folder: { name: assetFolderName } })).asset_folder
  state.assetFolder = { name: assetFolderName, id: folder.id }
  saveState()
  return folder.id
}

async function upload(sourceUrl) {
  if (state.assets[sourceUrl]) return state.assets[sourceUrl]

  const download = await fetch(sourceUrl)
  if (!download.ok) throw new Error(`Download ${sourceUrl} -> ${download.status}`)
  const file = Buffer.from(await download.arrayBuffer())
  const filename = decodeURIComponent(new URL(sourceUrl).pathname.split('/').pop())

  // 1. Signed request  2. Upload to S3 with every signed field, then the file  3. Validate
  const signed = await mapi('POST', '/assets/', { filename, asset_folder_id: await assetFolderId(), validate_upload: 1 })
  const form = new FormData()
  for (const [key, value] of Object.entries(signed.fields)) form.append(key, value)
  form.append('file', new Blob([file]), filename)
  const s3 = await fetch(signed.post_url, { method: 'POST', body: form })
  if (!s3.ok) throw new Error(`Upload ${filename} -> ${s3.status} ${(await s3.text()).slice(0, 300)}`)
  await mapi('GET', `/assets/${signed.id}/finish_upload`)

  const asset = { id: signed.id, filename: signed.pretty_url.startsWith('//') ? `https:${signed.pretty_url}` : signed.pretty_url }
  state.assets[sourceUrl] = asset
  saveState()
  console.log(`  uploaded ${filename} -> ${asset.filename}`)
  return asset
}

// Replaces every asset field, and every image inside rich text, that still points at its source with the
// uploaded copy
async function uploadAssets(node) {
  if (Array.isArray(node)) { for (const n of node) await uploadAssets(n); return }
  if (!node || typeof node !== 'object') return
  if (node.fieldtype === 'asset' && node.filename && !node.id) {
    const asset = await upload(node.filename)
    Object.assign(node, { id: asset.id, filename: asset.filename, name: '', title: '', focus: '', copyright: '', is_external_url: false })
    return
  }
  if (node.type === 'image' && node.attrs?.src && !node.attrs.id) {
    const asset = await upload(node.attrs.src)
    Object.assign(node.attrs, { id: asset.id, src: asset.filename })
    return
  }
  for (const value of Object.values(node)) await uploadAssets(value)
}

// ---------- Folders and story ----------

async function findStory(fullSlug) {
  const { stories } = await mapi('GET', `/stories/?with_slug=${encodeURIComponent(fullSlug)}`)
  return stories[0]
}

async function ensureFolders() {
  state.folders ??= {}
  let parentId = 0
  for (let i = 0; i < folderPath.length; i++) {
    const fullSlug = folderPath.slice(0, i + 1).join('/')
    const existing = state.folders[fullSlug] ?? (await findStory(fullSlug))?.id
    if (existing) { parentId = state.folders[fullSlug] = existing; continue }
    const { story } = await mapi('POST', '/stories/', { story: { name: folderPath[i], slug: folderPath[i], is_folder: true, parent_id: parentId } })
    console.log(`  created folder ${fullSlug}`)
    parentId = state.folders[fullSlug] = story.id
    saveState()
  }
  return parentId
}

const { story } = JSON.parse(fs.readFileSync(storyFile, 'utf8'))
console.log(`Pushing "${story.name}" to space ${space} under ${folderPath.join('/')}/`)

await uploadAssets(story.content)
const parentId = await ensureFolders()

const payload = { story: { ...story, parent_id: parentId }, publish: 0 }
const existingId = state.story?.parentId === parentId ? state.story.id : undefined
const saved = existingId
  ? (await mapi('PUT', `/stories/${existingId}`, { ...payload, force_update: 1 })).story
  : (await mapi('POST', '/stories/', payload)).story
state.story = { id: saved.id, parentId, full_slug: saved.full_slug }
saveState()

console.log(`  ${existingId ? 'updated' : 'created'} story ${saved.full_slug} (id ${saved.id}, draft)`)
console.log(`Open: https://app.storyblok.com/#/me/spaces/${space}/stories/0/0/${saved.id}`)
