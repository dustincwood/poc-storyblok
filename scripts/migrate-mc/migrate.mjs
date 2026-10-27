// Dry run of a Modern Campus page (.pcf) -> Storyblok story JSON plus a report of what didn't map cleanly.
// Nothing is sent to Storyblok.
//
// Usage: node scripts/migrate-mc/migrate.mjs <page.pcf> --published <url> [--out <dir>]
//   --published  The page's live URL. {{f:...}}/{{a:...}} dependency tags only resolve to paths in
//                Modern Campus, so they're matched against the published HTML (by link text, image alt).
import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { parse, ELEMENT_NODE, TEXT_NODE, renderSync as render } from 'ultrahtml'
import { decodeHTML } from 'entities'
import { htmlToStoryblokRichtext } from '@storyblok/richtext/html-parser'

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
const componentMap = JSON.parse(fs.readFileSync(path.join(here, 'component-map.json'), 'utf8'))

const args = process.argv.slice(2)
const pcfPath = args[0]
const published = args[args.indexOf('--published') + 1]
const outDir = args.includes('--out') ? args[args.indexOf('--out') + 1] : path.join(here, 'out')
if (!pcfPath || !args.includes('--published')) {
  console.error('Usage: node scripts/migrate-mc/migrate.mjs <page.pcf> --published <url> [--out <dir>]')
  process.exit(1)
}

// Everything that didn't map cleanly, grouped by kind for the report
const report = { lost: [], approximated: [], unresolved: [], unknownComponents: [], assets: new Set(), notes: [] }
const lost = (what, detail) => report.lost.push({ what, detail })

// ---------- Helpers ----------

const uid = () => randomUUID()
const blok = (component, fields = {}) => ({ _uid: uid(), component, ...fields })
const classes = node => (node.attributes?.class ?? '').split(/\s+/).filter(Boolean)
const hasClass = (node, c) => classes(node).includes(c)
const isEl = (node, name) => node.type === ELEMENT_NODE && (!name || node.name === name)
const text = node => node.type === TEXT_NODE ? node.value : (node.children ?? []).map(text).join('')
const norm = s => decodeHTML(s ?? '').replace(/\s+/g, ' ').trim().toLowerCase()

// Values are HTML-escaped once or twice in the source (&amp;#39;); decode until stable
function decode(value) {
  let v = String(value ?? '')
  for (let i = 0; i < 3; i++) {
    const next = decodeHTML(v)
    if (next === v) break
    v = next
  }
  return v
}

// ---------- Dependency tags, resolved from the published page ----------

const publishedHtml = await (await fetch(published)).text()
const publishedDoc = parse(publishedHtml)
const publishedOrigin = new URL(published).origin
const absolute = url => url && url.startsWith('/') ? publishedOrigin + url : url

// Published links keyed by link text, images by alt text plus the enclosing link's text
const publishedLinks = new Map()
const publishedImages = new Map()
function indexPublished(node, linkText = '') {
  if (isEl(node, 'a') && node.attributes.href) {
    const key = norm(text(node))
    if (key && !publishedLinks.has(key)) publishedLinks.set(key, node.attributes.href)
    linkText = key
  }
  if (isEl(node, 'img') && node.attributes.src) {
    publishedImages.set(`${norm(node.attributes.alt)}|${linkText}`, node.attributes.src)
  }
  for (const child of node.children ?? []) indexPublished(child, linkText)
}
indexPublished(publishedDoc)
const heroImage = publishedHtml.match(/jumbotron-full[^>]*background-image:\s*url\(([^)]+)\)/)?.[1]

const isTag = v => /^\{\{[a-z]:\d+\}\}$/.test(v ?? '')

function resolveTag(tag, { linkText, alt, context }) {
  const found = linkText !== undefined
    ? publishedLinks.get(norm(linkText))
    : publishedImages.get(`${norm(alt)}|${norm(context)}`)
  if (found) return absolute(found)
  report.unresolved.push({ tag, near: linkText ?? `image alt "${alt}" in "${context}"` })
  return ''
}

// Asset tags in running text ({{a:N}}, a reusable snippet) have no link text or alt to match on: the words
// around the tag are found on the published page, and what sits between them there is the snippet's text
let publishedText
const collapse = s => decode(s).replace(/\s+/g, ' ')
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
function resolveTextTags(html) {
  return html.replace(/\{\{a:\d+\}\}/g, (tag, offset) => {
    if (/(href|src)=["']?$/.test(html.slice(Math.max(0, offset - 6), offset))) return tag
    publishedText ??= collapse(text(publishedDoc))
    const plain = s => collapse(s.replace(/<[^>]*>/g, ''))
    const before = plain(html.slice(Math.max(0, offset - 300), offset)).slice(-40)
    const after = plain(html.slice(offset + tag.length, offset + tag.length + 300)).slice(0, 40)
    const found = publishedText.match(new RegExp(`${escapeRe(before)}(.{1,200}?)${escapeRe(after)}`))?.[1]
    if (found === undefined) {
      report.unresolved.push({ tag, near: `text "…${before.trim()} ${tag} ${after.trim()}…"` })
      return tag
    }
    report.notes.push(`Snippet ${tag} in text was replaced by its published text "${found.trim()}" (as plain text; edit it in Storyblok if the snippet should stay shared)`)
    return found.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  })
}

// Rewrites tags in a WYSIWYG fragment's links and images using the published page
function resolveTagsInHtml(html) {
  const doc = parse(html)
  const walk = (node, linkText = '') => {
    if (isEl(node, 'a')) {
      linkText = text(node)
      if (isTag(node.attributes.href)) node.attributes.href = resolveTag(node.attributes.href, { linkText })
    }
    if (isEl(node, 'img') && isTag(node.attributes.src)) {
      node.attributes.src = resolveTag(node.attributes.src, { alt: node.attributes.alt, context: linkText })
    }
    for (const child of node.children ?? []) walk(child, linkText)
  }
  walk(doc)
  return render(doc)
}

// ---------- Field values ----------

function toAsset(url, alt = '') {
  if (!url) return undefined
  report.assets.add(url)
  return { filename: url, alt, fieldtype: 'asset' }
}

// Links back into the site being migrated; these become story links once its pages exist in Storyblok
const internalLinks = new Set()

function toLink(url) {
  if (!url) return undefined
  // An href from the HTML still has its entities (&amp;); the link field holds the plain URL
  url = decode(url)
  // usu.edu serves page.php at page too; one form keeps links to the same page matchable to its story
  if (url.startsWith(publishedOrigin)) url = url.replace(/(\/index)?\.php(?=[?#]|$)/, m => m.startsWith('/index') ? '/' : '')
  if (url.startsWith(published)) internalLinks.add(url)
  return url.startsWith('mailto:')
    // An empty ?subject= says nothing and would show in the editor's email field
    ? { linktype: 'email', email: url.slice(7).replace(/[?&]\w+=(?=&|$)/g, '').replace(/^([^?]*)&/, '$1?'), fieldtype: 'multilink' }
    : { linktype: 'url', url, cached_url: url, fieldtype: 'multilink' }
}

function toRichtext(html) {
  // The converter warns about every class it can't keep; collect those for the report
  const warnings = []
  const warn = console.warn
  console.warn = (...m) => warnings.push(m.join(' ').replace(/^\[StoryblokRichText\] - /, ''))
  try {
    // Empty class attributes carry nothing but still trigger a warning
    const doc = htmlToStoryblokRichtext(resolveTextTags(resolveTagsInHtml(html)).replace(/\sclass=""/g, ''))
    // Trailing empty paragraphs (stray <br> and &nbsp; left by the editor) only add space at the end;
    // a document that is nothing but one stays, as a spacer (see flush in convertNodes)
    const isEmpty = n => n.type === 'paragraph' && (n.content ?? []).every(c => c.type === 'hard_break' || (c.type === 'text' && !c.text.trim()))
    while (doc.content?.length > 1 && isEmpty(doc.content.at(-1))) doc.content.pop()
    // Images inside the text are uploaded by push.mjs too
    const images = node => node?.type === 'image' && node.attrs?.src ? [node.attrs.src] : (node?.content ?? []).flatMap(images)
    for (const src of images(doc)) report.assets.add(src)
    return doc
  } finally {
    console.warn = warn
    for (const w of new Set(warnings)) lost('Rich text formatting', w)
  }
}

// Sets a dotted target path such as "button.link.target" or "image.alt"
function setPath(obj, target, value) {
  const keys = target.split('.')
  let o = obj
  for (const k of keys.slice(0, -1)) o = o[k] ??= {}
  o[keys.at(-1)] = value
}

// ---------- Modern Campus components ----------

function convertComponent(id, data, context) {
  const def = componentMap[id]
  if (!def || !def.component) {
    report.unknownComponents.push({ id, name: def?.name ?? 'unknown', reason: def?.deferred ?? 'not in component-map.json' })
    return [blok('moca-text', { text: toRichtext(`<p>[Modern Campus component ${id}${def ? ` (${def.name})` : ''} not migrated]</p>`) })]
  }

  const fields = {}
  const button = {}
  const raw = (hash) => data[hash] ?? ''
  // The title lets resolveComponentTag find this component on the published page
  const titleHash = Object.keys(def.fields).find(h => ['header', 'title', 'name'].includes(def.fields[h]?.split(':')[0]))
  context = { ...context, title: titleHash ? clean(raw(titleHash)) : '' }

  const assign = (target, value) => {
    const [targetPath, type] = target.split(':')
    if (value === '' || value === undefined) return
    const valueMap = def.values?.[Object.keys(def.fields).find(h => def.fields[h] === target)] ?? def.values?.[targetPath]
    if (valueMap && Object.hasOwn(valueMap, value)) value = valueMap[value]

    if (type === 'html') value = toRichtext(decode(value))
    else if (type === 'bool') value = value === 'true'
    else {
      value = decode(value)
      if (type === 'link' && isTag(value)) value = resolveComponentTag(value, targetPath, context)
      if (type === 'link' && targetPath.endsWith('filename')) value = absolute(value)
      if (type === 'link' && !targetPath.endsWith('filename')) value = toLink(absolute(value))
    }
    if (targetPath.endsWith('size') && value === 'btn') value = ''

    if (targetPath.startsWith('button.')) setPath(button, targetPath.slice(7), value)
    else if (targetPath.endsWith('.filename')) setPath(fields, targetPath.replace(/\.filename$/, ''), toAsset(value, fields[targetPath.split('.')[0]]?.alt))
    else if (targetPath.endsWith('.alt') && fields[targetPath.split('.')[0]]?.filename) fields[targetPath.split('.')[0]].alt = value
    else if (targetPath.endsWith('.target')) setPath(fields, targetPath, value)
    else setPath(fields, targetPath, value)
  }

  for (const [hash, target] of Object.entries(def.fields)) {
    if (!target) continue
    let value = raw(hash)
    if (value === '' && def.fallbacks?.[target.split(':')[0]]) {
      value = def.fallbacks[target.split(':')[0]].map(raw).find(Boolean) ?? ''
    }
    assign(target, value)
  }
  for (const [target, hash] of Object.entries(def.derived ?? {})) if (!target.startsWith('$')) assign(target, raw(hash))
  for (const [target, value] of Object.entries(def.fixed ?? {})) {
    if (target.startsWith('$') || target === 'button.classes') continue
    if (target.startsWith('button.')) setPath(button, target.slice(7), value)
    else setPath(fields, target, value)
  }

  // Alt text set before its image: attach it now
  for (const k of Object.keys(fields)) if (fields[k]?.fieldtype === 'asset' && !fields[k].alt) {
    const altHash = Object.keys(def.fields).find(h => def.fields[h] === `${k}.alt`)
    if (altHash) fields[k].alt = decode(raw(altHash))
  }

  // Components with a nested button get one moca-button blok, only when it has text
  if (button.text) fields.button = [blok('moca-button', { ...button, type: button.type || 'btn-white' })]

  // Link targets set before the link existed land on an empty object; drop those
  for (const k of Object.keys(fields)) if (fields[k] && typeof fields[k] === 'object' && !Array.isArray(fields[k]) && Object.keys(fields[k]).length === 1 && fields[k].target) delete fields[k]

  for (const hash of def.unknown ?? []) if (raw(hash)) report.notes.push(`Component ${id} (${def.name}): unmapped field ${hash.slice(0, 8)} has a value: "${decode(raw(hash)).slice(0, 60)}"`)
  return [blok(def.component, fields)]
}

// Tags inside component data have no link text to match; use what's known about the published page
function resolveComponentTag(tag, targetPath, context) {
  if (context.component === '3338' && targetPath === 'background_image.filename' && heroImage) return heroImage
  const found = context.title && fromPublishedCard(context.title, targetPath)
  if (found) return found
  report.unresolved.push({ tag, near: `component ${context.component} field ${targetPath}` })
  return ''
}

// The component as rendered on the published page: the smallest .card holding its title. An image field
// takes the card's image, a button link its .btn, any other link its first link.
function fromPublishedCard(title, targetPath) {
  const key = norm(title)
  const card = findAll(publishedDoc, n => isEl(n) && hasClass(n, 'card') && norm(text(n)).includes(key))
    .sort((a, b) => text(a).length - text(b).length)[0]
  if (!card) return undefined
  if (targetPath.endsWith('filename')) return find(card, n => isEl(n, 'img'))?.attributes.src
  if (targetPath.startsWith('button.')) return find(card, n => isEl(n, 'a') && hasClass(n, 'btn'))?.attributes.href
  return find(card, n => isEl(n, 'a'))?.attributes.href
}

// ---------- Hand-written HTML ----------

const btnType = /^btn-(primary|secondary|success|info|warning|danger|light|dark|link|white|blue|bright-light|green|sage|sand|blue-dark)$/
const btnOutline = /^btn-outline-(.+)$/

function convertButton(a) {
  const cls = classes(a)
  const outline = cls.map(c => c.match(btnOutline)?.[1]).find(Boolean)
  const type = outline ? `btn-${outline}` : cls.find(c => btnType.test(c)) ?? 'btn-white'
  // h-100 with flex centering: an even row of buttons whose labels may wrap
  const fillHeight = cls.includes('h-100')
  const known = ['btn', 'btn-block', 'btn-lg', 'btn-sm', 'btn-wrap', 'text-bold', type, outline && `btn-outline-${outline}`,
    ...fillHeight ? ['h-100', 'd-flex', 'justify-content-center', 'align-items-center'] : []]
  const extra = cls.filter(c => !known.includes(c))
  if (extra.length) lost('Button classes', `"${text(a).trim()}": ${extra.join(' ')}`)
  const href = isTag(a.attributes.href) ? resolveTag(a.attributes.href, { linkText: text(a) }) : a.attributes.href
  return blok('moca-button', {
    text: decode(text(a)).replace(/\s+/g, ' ').trim(),
    link: { ...toLink(absolute(href)), ...(a.attributes.target && { target: a.attributes.target }) },
    type,
    outline: !!outline,
    size: cls.includes('btn-lg') ? 'btn-lg' : cls.includes('btn-sm') ? 'btn-sm' : '',
    block: cls.includes('btn-block'),
    fill_height: fillHeight,
    centered: false,
  })
}

// Bootstrap spacer class (my-5, mb-lg-0 ...) -> its 0-5 value, only for the plain (all-breakpoint) form
const spacer = (cls, prop) => cls.map(c => c.match(new RegExp(`^${prop}-([0-5])$`))?.[1]).find(v => v !== undefined) ?? ''

// Lists classes the target block doesn't represent
function lostClasses(what, node, handled) {
  const extra = classes(node).filter(c => !handled.some(h => h instanceof RegExp ? h.test(c) : h === c))
  if (extra.length) lost(what, `<${node.name} class="${classes(node).join(' ')}">: ${extra.join(' ')}`)
}

const find = (node, test) => test(node) ? node : (node.children ?? []).map(c => find(c, test)).find(Boolean)
const findAll = (node, test) => [...(test(node) ? [node] : []), ...(node.children ?? []).flatMap(c => findAll(c, test))]
// Decoded text with whitespace collapsed
const clean = value => decode(value).replace(/\s+/g, ' ').trim()

// .card-tier1: an image card whose heading sits on the image, the whole card a link
function convertTier1Card(card) {
  const a = find(card, n => isEl(n, 'a'))
  const heading = find(card, n => isEl(n, 'h3') || isEl(n, 'h2'))
  const img = find(card, n => isEl(n, 'img'))
  const icon = find(card, n => isEl(n, 'i'))
  const title = clean(text(heading ?? card))
  const href = isTag(a?.attributes.href) ? resolveTag(a.attributes.href, { linkText: text(a) }) : a?.attributes.href
  const src = isTag(img?.attributes.src) ? resolveTag(img.attributes.src, { alt: img.attributes.alt, context: text(a) }) : img?.attributes.src
  lostClasses('Card classes', card, ['card-tier1', 'shadow', /^ratio-/, /^m[tby]-[0-5]$/, 'h-100', 'd-flex', 'flex-column'])
  return boxIfSpaced(card, blok('moca-tier1-card', {
    image: toAsset(absolute(src), img?.attributes.alt === '...' ? '' : img?.attributes.alt ?? ''),
    link: { ...toLink(absolute(href)), ...(a?.attributes.target && { target: a.attributes.target }) },
    title,
    text: findAll(card, n => isEl(n, 'p')).map(p => clean(text(p))).join('\n\n'),
    icon: icon ? classes(icon).filter(c => !/^text-/.test(c)).join(' ') : '',
    ratio: classes(card).map(c => c.match(/^ratio-(\d+x\d+)$/)?.[1]).find(Boolean) ?? '',
    shadow: hasClass(card, 'shadow'),
  }))
}

// .container / .container-fluid with vertical spacing
function convertContainer(node) {
  const cls = classes(node)
  lostClasses('Container classes', node, ['container', 'container-fluid', /^my-[0-5]$/, /^py-[0-5]$/])
  return blok('moca-container', {
    width: cls.includes('container-fluid') ? 'fluid' : cls.includes('container-narrow') ? 'narrow' : 'default',
    margin_y: spacer(cls, 'my'),
    padding_y: spacer(cls, 'py'),
    content: convertNodes(node.children ?? []),
  })
}

const bandBackgrounds = ['bg-primary', 'bg-info', 'bg-dark', 'bg-blue-dark', 'bg-light', 'bg-gray-200', 'bg-white']

// A full-width background band
function convertBand(node) {
  const cls = classes(node)
  lostClasses('Band classes', node, [...bandBackgrounds, /^py-[0-5]$/, 'bg-topographic'])
  return blok('moca-band', {
    background: cls.find(c => bandBackgrounds.includes(c)),
    padding_y: spacer(cls, 'py'),
    pattern: cls.includes('bg-topographic') ? 'topographic' : '',
    content: convertNodes(node.children ?? []),
  })
}

// <div class="border rounded p-4 my-5"><div class="text-center mt-n5 ..."><span class="h2 ...">Title</span></div>...</div>
function convertTitledBox(box, titleWrap) {
  const span = find(titleWrap, n => isEl(n) && classes(n).some(c => /^h[1-6]$/.test(c))) ?? titleWrap
  const spanCls = classes(span)
  const color = ['info', 'primary', 'white'].find(c => spanCls.includes(`text-${c}`)) ?? 'slate'
  lostClasses('Titled box classes', box, ['border', 'rounded', 'p-4', /^border-(bright-light|info|primary)$/, /^m[tby]-[0-5]$/])
  lostClasses('Titled box title classes', span, [/^h[1-6]$/, 'text-center', /^text-(info|primary|white)$/, 'text-bold', /^bg-/, 'px-4', 'py-3'])
  const cls = classes(box)
  return blok('moca-titled-box', {
    title: clean(text(span)),
    title_color: color,
    title_bold: spanCls.includes('text-bold'),
    border_color: cls.map(c => c.match(/^border-(bright-light|info|primary)$/)?.[1]).find(Boolean) ?? '',
    margin_top: spacer(cls, 'mt') || spacer(cls, 'my'),
    margin_bottom: spacer(cls, 'mb') || spacer(cls, 'my'),
    content: convertNodes((box.children ?? []).filter(n => n !== titleWrap)),
  })
}

const isTitledBox = node => hasClass(node, 'border') && (node.children ?? []).some(n => isEl(n) && hasClass(n, 'mt-n5'))

// A colored .card whose heading-styled link is the title: the color-blend kind (icon floated right, text
// below) and the solid kind (icon in a narrow column on the left)
const titleLink = node => isEl(node, 'a') && classes(node).some(c => /^h[34]$/.test(c))
const isLinkCard = node => hasClass(node, 'card') && !hasClass(node, 'card-tier1') && !!find(node, titleLink) && !find(node, n => isEl(n, 'img'))

function convertLinkCard(card) {
  const a = find(card, titleLink)
  const cls = classes(card)
  const iconNode = find(card, n => n.name === 'mc-component' || (isEl(n, 'i') && classes(n).some(c => c.startsWith('fa'))))
  const iconRight = !!find(card, n => hasClass(n, 'float-right') && !!find(n, m => m === iconNode))
  const href = isTag(a.attributes.href) ? resolveTag(a.attributes.href, { linkText: text(a) }) : a.attributes.href
  lostClasses('Link card classes', card, ['card', 'bg-info', 'bg-primary', 'color-blend', 'text-white', 'onHoverFloat', 'rounded', 'p-3', 'd-flex', 'flex-column', 'justify-content-center', 'h-100', 'w-100', 'h-40', /^m[tby]-[0-5]$/])
  return boxIfSpaced(card, blok('moca-link-card', {
    title: clean(text(a)),
    link: { ...toLink(absolute(href)), ...(a.attributes.target && { target: a.attributes.target }) },
    text: findAll(card, n => isEl(n, 'p')).map(p => clean(text(p))).join('\n\n'),
    icon: iconIcon(iconNode),
    icon_position: iconRight ? 'right' : 'left',
    background: cls.includes('color-blend') ? 'color-blend' : cls.includes('bg-primary') ? 'primary' : 'info',
    title_size: classes(a).includes('h4') ? 'h4' : 'h3',
  }))
}

// The icon classes from a Font Awesome component (3894) or an <i class="fa-...">
function iconIcon(node) {
  if (!node) return ''
  if (node.name === 'mc-component') {
    const data = JSON.parse(decodeURIComponent(node.attributes['data-json']))
    const iconHash = Object.keys(componentMap['3894'].fields).find(h => componentMap['3894'].fields[h] === 'icon')
    return decode(data[iconHash] ?? '').match(/class\s*=\s*["']([^"']*)["']/)?.[1] ?? ''
  }
  return classes(node).filter(c => !/^text-/.test(c)).join(' ')
}

// A white .card with a colored title and a colored .rounded-bottom bar after its body
const isBarCard = node => hasClass(node, 'card') && (node.children ?? []).some(n => isEl(n) && hasClass(n, 'rounded-bottom') && classes(n).some(c => c.startsWith('bg-')))

function convertBarCard(card) {
  const body = (card.children ?? []).find(n => isEl(n) && hasClass(n, 'card-body'))
  const bar = (card.children ?? []).find(n => isEl(n) && hasClass(n, 'rounded-bottom'))
  const heading = (body?.children ?? []).find(n => isEl(n) && /^h[1-6]$/.test(n.name))
  const colorOf = (node, prefix) => classes(node).map(c => c.match(new RegExp(`^${prefix}-(.+)$`))?.[1]).find(c => c && mocaColorNames.includes(c)) ?? ''
  lostClasses('Bar card classes', card, ['card', 'w-100', 'h-100', /^m[tby]-[0-5]$/])
  return boxIfSpaced(card, blok('moca-bar-card', {
    title: heading ? clean(text(heading)) : '',
    title_color: heading ? colorOf(heading, 'text') : '',
    body: toRichtext((body?.children ?? []).filter(n => n !== heading).map(render).join('')),
    bar_color: colorOf(bar, 'bg'),
  }))
}

// <div class="card"><hN class="card-header bg-primary ...">Title</hN><ul class="list-group ...">...</ul></div>
const isListCard = node => hasClass(node, 'card')
  && (node.children ?? []).some(n => isEl(n) && hasClass(n, 'card-header'))
  && (node.children ?? []).some(n => isEl(n, 'ul') && hasClass(n, 'list-group'))

function convertListCard(card) {
  const header = (card.children ?? []).find(n => isEl(n) && hasClass(n, 'card-header'))
  const list = (card.children ?? []).find(n => isEl(n, 'ul') && hasClass(n, 'list-group'))
  lostClasses('List card classes', card, ['card', 'border-0', /^m[tby]-[0-5]$/])
  lostClasses('List card header classes', header, ['card-header', /^h[1-6]$/, 'text-white', /^bg-/])
  // The list is rebuilt without its classes; the block styles it as a list group
  const plainList = `<ul>${findAll(list, n => isEl(n, 'li')).map(li => `<li>${(li.children ?? []).map(render).join('')}</li>`).join('')}</ul>`
  return boxIfSpaced(card, blok('moca-list-card', {
    title: clean(text(header)),
    header_color: classes(header).map(c => c.match(/^bg-(.+)$/)?.[1]).find(c => c && mocaColorNames.includes(c)) ?? 'primary',
    body: toRichtext(plainList),
  }))
}

// A <table> as its own moca-text, keeping Bootstrap's table style as the block's table_style
function convertTable(table) {
  const cls = classes(table)
  lostClasses('Table classes', table, ['table', 'table-striped', /^table-responsive/, 'table-default-responsive-md'])
  return blok('moca-text', {
    text: toRichtext(render(table).replace(/<table[^>]*>/, '<table>')),
    table_style: cls.includes('table-striped') ? 'striped' : 'plain',
  })
}

// Color names moca-heading, moca-bar-card and moca-link-card understand (mocaColors in app/utils/moca.ts)
const mocaColorNames = ['primary', 'blue', 'blue-dark', 'info', 'bright-light', 'success', 'warning', 'danger', 'dark', 'white']

// A heading with classes or a style -> moca-heading (color, centering, bold, spacing)
function convertHeading(node) {
  const cls = classes(node)
  const level = { h5: 'h4', h6: 'h4' }[node.name] ?? node.name
  lostClasses('Heading classes', node, [/^text-/, 'text-bold', /^mb-[0-5]$/, /^mt-[0-5]$/, /^pb-[1-5]$/])
  // pb-N adds to the heading's .5rem margin; the nearest spacer stands in for both
  const paddingBottom = spacer(cls, 'pb')
  return blok('moca-heading', {
    text: clean(text(node)),
    level,
    color: cls.map(c => c.match(/^text-(.+)$/)?.[1]).find(c => c && mocaColorNames.includes(c)) ?? '',
    align: cls.includes('text-center') || /text-align:\s*center/.test(node.attributes.style ?? '') ? 'center' : '',
    bold: cls.includes('text-bold'),
    margin_bottom: spacer(cls, 'mb') || { '1': '3', '2': '3', '3': '4', '4': '4', '5': '5' }[paddingBottom] || '',
    anchor: node.attributes.id ?? '',
  })
}

// A row of three columns: an empty .border-bottom column, the heading, another .border-bottom column
function asRuleHeading(row) {
  const cols = (row.children ?? []).filter(n => isEl(n))
  if (cols.length !== 3 || !hasClass(cols[0], 'border-bottom') || !hasClass(cols[2], 'border-bottom')) return undefined
  const heading = find(cols[1], n => isEl(n) && /^h[1-6]$/.test(n.name))
  if (!heading) return undefined
  return { ...convertHeading(heading), rules: true, align: 'center' }
}

// <div class="step-guide vertical"><div class="step"><div class="step-indicator">1</div>
// <div class="step-description"><h3>Header</h3>...</div><div class="step-bar"></div></div>...</div>
// The leading text of each step is its content; rows and components after it go in its blocks
function convertStepGuide(guide) {
  lostClasses('Step guide classes', guide, ['step-guide', 'vertical', /^m[tby]-[0-5]$/])
  let level = 'h2'
  const steps = findAll(guide, n => isEl(n) && hasClass(n, 'step')).map(step => {
    const description = find(step, n => isEl(n) && hasClass(n, 'step-description')) ?? step
    const heading = (description.children ?? []).find(n => isEl(n) && isHeading(n))
    if (heading?.name === 'h3') level = 'h3'
    if (heading) lostClasses('Step header classes', heading, [/^h[1-6]$/, /^text-/])
    const converted = convertNodes((description.children ?? []).filter(n => n !== heading))
    const [first] = converted
    const hasText = first?.component === 'moca-text' && !first.style && !first.table_style
    return blok('moca-step', {
      header: heading ? clean(text(heading)) : '',
      header_color: classes(heading ?? {}).map(c => c.match(/^text-(.+)$/)?.[1]).find(c => c && mocaColorNames.includes(c)) ?? '',
      content: hasText ? first.text : toRichtext(''),
      blocks: hasText ? converted.slice(1) : converted,
    })
  })
  return boxIfSpaced(guide, blok('moca-step-guide', { heading_level: level, steps }))
}

// Only <a class="btn"> elements, apart from whitespace and &nbsp;
const isButtonParagraph = p => {
  const kids = (p.children ?? []).filter(n => isEl(n) || decode(n.value ?? '').trim())
  return kids.length > 0 && kids.every(n => isEl(n, 'a') && hasClass(n, 'btn'))
}

// <img class="rounded-circle w-100 mb-3"> -> moca-image
function convertImage(img) {
  const cls = classes(img)
  const src = isTag(img.attributes.src) ? resolveTag(img.attributes.src, { alt: img.attributes.alt, context: '' }) : img.attributes.src
  lostClasses('Image classes', img, ['img-fluid', 'rounded', 'rounded-circle', 'img-thumbnail', 'w-100', /^mb-[0-5]$/])
  return blok('moca-image', {
    image: toAsset(absolute(src), img.attributes.alt ?? ''),
    image_style: ['rounded-circle', 'img-thumbnail', 'rounded'].find(c => cls.includes(c)) ?? '',
    full_width: cls.includes('w-100'),
    margin_bottom: spacer(cls, 'mb'),
  })
}

// Bootstrap column classes -> moca-column fields
const columnClass = /^col(?:-(sm|md|lg|xl))?(?:-(\d{1,2}|auto))?$/
function convertColumn(cell) {
  const fields = {}
  for (const c of classes(cell)) {
    const m = c.match(columnClass)
    if (!m) continue
    fields[m[1] ? `width_${m[1]}` : 'width'] = m[2] === 'auto' ? 'content' : m[2] ?? 'auto'
  }
  const cls = classes(cell)
  const order = bp => cls.map(c => c.match(new RegExp(`^order-${bp ? `${bp}-` : ''}(first|last|[1-3])$`))?.[1]).find(Boolean) ?? ''
  const display = cls.includes('d-none') && cls.includes('d-lg-block') ? 'lg-up' : cls.includes('d-lg-none') ? 'below-lg' : ''
  lostClasses('Column classes', cell, [columnClass, /^order-(lg-)?(first|last|[1-3])$/, /^m[tby]-[0-5]$/, 'd-flex', 'd-none', 'd-lg-block', 'd-lg-none', 'd-sm-block', 'd-block', /^align-self-/, 'text-center', 'mx-n5'])
  return blok('moca-column', {
    ...fields,
    order: order(''),
    order_lg: order('lg'),
    margin_top: spacer(cls, 'mt') || spacer(cls, 'my'),
    margin_bottom: spacer(cls, 'mb') || spacer(cls, 'my'),
    stretch: cls.includes('d-flex'),
    display,
    align_self: cls.map(c => c.match(/^align-self-(start|center|end)$/)?.[1]).find(Boolean) ?? '',
    text_align: cls.includes('text-center') ? 'center' : '',
    overlap: cls.includes('mx-n5'),
    content: convertNodes(cell.children ?? []),
  })
}

// Bootstrap .row -> moca-row of moca-column blocks
function convertRow(row) {
  const ruleHeading = asRuleHeading(row)
  if (ruleHeading) return ruleHeading
  const cls = classes(row)
  const justify = cls.map(c => c.match(/^justify-content-(start|center|end|between|around)$/)?.[1]).find(Boolean) ?? ''
  const align = cls.map(c => c.match(/^align-items-(start|center|end)$/)?.[1]).find(Boolean) ?? ''
  lostClasses('Row classes', row, ['row', /^justify-content-/, /^align-items-/, /^m[tby]-[0-5]$/, /^py-[0-5]$/])
  const columns = []
  let stray = []
  const flushStray = () => {
    const content = convertNodes(stray)
    if (content.length) {
      columns.push(blok('moca-column', { width: '12', content }))
      report.notes.push('Content directly inside a .row (not in a column) was put in a full-width column')
    }
    stray = []
  }
  for (const node of row.children ?? []) {
    if (isEl(node) && classes(node).some(c => columnClass.test(c))) { flushStray(); columns.push(convertColumn(node)) }
    else stray.push(node)
  }
  flushStray()
  return boxIfSpaced(row, blok('moca-row', { justify, align, padding_y: spacer(cls, 'py'), columns }))
}

// Wraps a converted element in a moca-box when the source element had margin classes (mb-4 on a card)
function boxIfSpaced(node, converted) {
  const cls = classes(node)
  const top = spacer(cls, 'mt') || spacer(cls, 'my')
  const bottom = spacer(cls, 'mb') || spacer(cls, 'my')
  return top || bottom ? blok('moca-box', { margin_top: top, margin_bottom: bottom, content: [converted] }) : converted
}

// <div class="mb-4"> / <div class="text-center">: only spacing and alignment
const boxClass = /^(m[tby]-[0-5]|text-(center|right))$/
const isBox = node => node.name === 'div' && classes(node).length > 0 && classes(node).every(c => boxClass.test(c))

function convertBox(node) {
  const cls = classes(node)
  return blok('moca-box', {
    margin_top: spacer(cls, 'mt') || spacer(cls, 'my'),
    margin_bottom: spacer(cls, 'mb') || spacer(cls, 'my'),
    text_align: cls.includes('text-center') ? 'center' : cls.includes('text-right') ? 'right' : '',
    content: convertNodes(node.children ?? []),
  })
}

// Containers and wrappers whose classes are only layout: keep the content, list the classes
function unwrap(node) {
  const cls = classes(node)
  if (cls.length) lost('Wrapper classes', `<${node.name} class="${cls.join(' ')}">`)
  return convertNodes(node.children ?? [])
}

const blockTags = new Set(['p', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'table', 'hr', 'img'])
const isHeading = node => /^h[1-6]$/.test(node.name)
const inlineTags = ['span', 'strong', 'em', 'b', 'i', 'u', 'font']

function convertNodes(nodes) {
  const out = []
  let buffer = ''
  const flush = () => {
    // Rich text can't hold a component; one that got this far would vanish without a trace
    for (const [, id] of buffer.matchAll(/<mc-component data-id="(\d+)"/g)) lost('Components inside text', `${id} (${componentMap[id]?.name ?? 'unknown'}) was dropped`)
    const hasContent = /<(img|hr|table)\b/.test(buffer) || decode(buffer.replace(/<[^>]*>/g, '')).replace(/[\s ]/g, '')
    // An empty paragraph (<p>&nbsp;</p>) is the editor's spacer: kept, except at the end of its parent below
    if (hasContent || /<p\b/.test(buffer)) out.push(Object.defineProperty(blok('moca-text', { text: toRichtext(buffer) }), 'spacer', { value: !hasContent }))
    buffer = ''
  }

  for (const node of nodes) {
    if (node.type === TEXT_NODE) { buffer += node.value; continue }
    if (!isEl(node)) continue
    const cls = classes(node)

    if (node.name === 'mc-component') {
      flush()
      out.push(...convertComponent(node.attributes['data-id'], JSON.parse(decodeURIComponent(node.attributes['data-json'])), { component: node.attributes['data-id'] }))
    }
    // The editor wraps components in a <p>; the component is the content. A button keeps the paragraph's
    // 1rem below it (cards sit in stretched columns, where a wrapper would break their equal heights).
    else if (isEl(node, 'p') && find(node, n => n.name === 'mc-component')) {
      flush()
      const inner = convertNodes(node.children ?? [])
      out.push(...inner.length && inner.every(b => b.component === 'moca-button')
        ? [blok('moca-box', { margin_top: '', margin_bottom: '3', content: inner })]
        : inner)
    }
    // A paragraph holding only buttons (<p class="text-center"><a class="btn ...">): the buttons, centered with
    // the paragraph, keeping its 1rem below
    else if (isEl(node, 'p') && isButtonParagraph(node)) {
      flush()
      lostClasses('Button paragraph classes', node, ['text-center'])
      const buttons = (node.children ?? []).filter(n => isEl(n, 'a')).map(a => ({ ...convertButton(a), centered: cls.includes('text-center') }))
      out.push(blok('moca-box', { margin_top: '', margin_bottom: '3', content: buttons }))
    }
    // An image standing on its own (not inside text) keeps its shape and width classes as a moca-image
    else if (isEl(node, 'img')) { flush(); out.push(convertImage(node)) }
    // ... sometimes inside a <span> or other inline wrapper too
    else if (inlineTags.includes(node.name) && find(node, n => n.name === 'mc-component')) {
      flush()
      out.push(...convertNodes(node.children ?? []))
    }
    else if (isEl(node, 'a') && cls.includes('btn')) { flush(); out.push(convertButton(node)) }
    else if (cls.includes('step-guide')) { flush(); out.push(convertStepGuide(node)) }
    else if (cls.includes('card-tier1')) { flush(); out.push(convertTier1Card(node)) }
    else if (isListCard(node)) { flush(); out.push(convertListCard(node)) }
    else if (isBarCard(node)) { flush(); out.push(convertBarCard(node)) }
    else if (isEl(node, 'table')) { flush(); out.push(convertTable(node)) }
    else if (isLinkCard(node)) { flush(); out.push(convertLinkCard(node)) }
    else if (cls.includes('row')) { flush(); out.push(convertRow(node)) }
    else if (cls.includes('container') || cls.includes('container-fluid')) { flush(); out.push(convertContainer(node)) }
    else if (isTitledBox(node)) {
      flush()
      out.push(convertTitledBox(node, node.children.find(n => isEl(n) && hasClass(n, 'mt-n5'))))
    }
    // .lead paragraphs keep their look as their own moca-text
    else if (isEl(node, 'p') && cls.includes('lead')) {
      flush()
      lostClasses('Paragraph classes', node, ['lead'])
      out.push(blok('moca-text', { text: toRichtext(`<p>${(node.children ?? []).map(render).join('')}</p>`), style: 'lead' }))
    }
    // Headings with classes, a style (color, centering, bold) or an id (an in-page link target) can't keep
    // them in rich text
    // An h1 is the page title (on pages without a hero) and gets its own block too
    else if (isHeading(node) && (cls.length || node.attributes.style || node.attributes.id || node.name === 'h1')) { flush(); out.push(convertHeading(node)) }
    // Checked before backgrounds: <span class="bg-primary h2"> is a heading, not a band
    else if (cls.some(c => /^h[1-6]$/.test(c)) && !blockTags.has(node.name)) {
      // <span class="h2"> styled as a heading becomes a real heading
      const level = cls.find(c => /^h[1-6]$/.test(c))
      lostClasses('Heading classes', node, [level])
      buffer += `<${level}>${(node.children ?? []).map(render).join('')}</${level}>`
    }
    // A standalone Font Awesome icon (not inside text)
    else if (isEl(node, 'i') && cls.some(c => /^fa-/.test(c))) {
      flush()
      out.push(blok('moca-font-awesome', { icon: cls.filter(c => !/^text-/.test(c)).join(' ') }))
    }
    else if (node.name === 'div' && cls.some(c => bandBackgrounds.includes(c))) { flush(); out.push(convertBand(node)) }
    else if (isBox(node)) { flush(); out.push(convertBox(node)) }
    // A column outside any row still has its 15px side padding on usu.edu, which indents what's inside
    else if (node.name === 'div' && cls.some(c => columnClass.test(c))) { flush(); out.push(convertColumn(node)) }
    else if (blockTags.has(node.name) || ['span', 'strong', 'em', 'b', 'i', 'a', 'br'].includes(node.name)) buffer += render(node)
    else { flush(); out.push(...unwrap(node)) }
  }
  flush()
  // A trailing spacer only adds space after the last block
  while (out.at(-1)?.spacer) out.pop()
  return out
}

// ---------- The .pcf page ----------

let pcf = fs.readFileSync(pcfPath, 'utf8')
pcf = pcf.replace(/<!--[\s\S]*?-->/g, '')

// Component markers -> placeholder elements carrying their data
const componentRe = /~\[com\[(\d+) \d+ \d+(\{.*?\})\]\]~/gs
pcf = pcf.replace(componentRe, (_, id, json) => {
  const data = JSON.parse(json.replace(/[\r\n\t]/g, ' ').replace(/\\(?!["\\/bfnrtu])/g, '')).data
  return `<mc-component data-id="${id}" data-json="${encodeURIComponent(JSON.stringify(data))}"></mc-component>`
})

const meta = {
  title: decode(pcf.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ''),
  description: decode(pcf.match(/<meta name="Description" content="([^"]*)"/i)?.[1] ?? ''),
}
const selected = name => pcf.match(new RegExp(`name="${name}"[\\s\\S]*?</parameter>`))?.[0].match(/value="([^"]*)" selected="true"/)?.[1] ?? ''
const settings = { showSideNav: selected('showSideNav') || '(none selected)', galleryType: selected('gallery-type') }

// The page body: <content> with its ouc:div regions unwrapped and editor tags removed
const contentHtml = (pcf.match(/<content>([\s\S]*?)<\/content>/)?.[1] ?? '')
  .replace(/<ouc:editor[^>]*\/>/g, '')
  .replace(/<ouc:div[^>]*>/g, '').replace(/<\/ouc:div>/g, '')
  .replace(/<nocontainer\s*\/>/g, '')

// Without <nocontainer /> the page template puts the content in a .container
const converted = convertNodes(parse(contentHtml).children)
const body = /<nocontainer\s*\/>/.test(pcf) ? converted : [blok('moca-container', { width: 'default', margin_y: '', padding_y: '', content: converted })]

// ---------- Output ----------

const relPath = path.basename(pcfPath, '.pcf')
const story = {
  story: {
    name: meta.title,
    slug: relPath === 'index' ? 'index' : relPath,
    is_startpage: relPath === 'index',
    content: { _uid: uid(), component: 'page', body },
  },
}

const counts = {}
const count = list => list.forEach(b => {
  counts[b.component] = (counts[b.component] ?? 0) + 1
  for (const v of Object.values(b)) if (Array.isArray(v)) count(v.filter(x => x?.component))
})
count(body)

fs.mkdirSync(outDir, { recursive: true })
const base = path.join(outDir, relPath)
fs.writeFileSync(`${base}.story.json`, JSON.stringify(story, null, 2) + '\n')

const section = (title, rows) => rows.length ? `\n## ${title}\n\n${rows.join('\n')}\n` : ''
const md = `# Dry run: ${meta.title}

Source: \`${pcfPath}\`
Published: ${published}
Output: \`${base}.story.json\` (nothing was sent to Storyblok)

## Page

- **Title:** ${meta.title}
- **Description:** ${meta.description}
- **Side navigation:** ${settings.showSideNav}; **banner gallery:** ${settings.galleryType || 'none'}
- The \`page\` block has no fields for the title, description or side-nav setting yet; they're listed here only.

## Blocks generated

${Object.entries(counts).map(([c, n]) => `- \`${c}\` × ${n}`).join('\n')}
${section('Approximated (structure kept, look differs)', report.approximated.map(a => `- **${a.what}** → \`${a.as}\`: ${a.detail}`))}
${section('Lost (not representable in the target blocks)', Object.entries(Object.groupBy(report.lost, l => l.what)).map(([what, items]) => `- **${what}:** ${[...new Set(items.map(i => i.detail))].join('; ')}`))}
${section('Unresolved dependency tags', report.unresolved.map(u => `- \`${u.tag}\` near ${u.near}`))}
${section('Components not migrated', report.unknownComponents.map(c => `- ${c.id} (${c.name}): ${c.reason}`))}
${section('Assets to upload', [...report.assets].map(a => `- ${a}`))}
${section('Links into this site (kept as URLs; should become story links)', [...internalLinks].map(l => `- ${l}`))}
${section('Other notes', [...new Set(report.notes)].map(n => `- ${n}`))}`
fs.writeFileSync(`${base}.report.md`, md)

console.log(`Wrote ${base}.story.json and ${base}.report.md`)
console.log(Object.entries(counts).map(([c, n]) => `${c} x${n}`).join(', '))
console.log(`approximated ${report.approximated.length}, lost ${report.lost.length}, unresolved tags ${report.unresolved.length}, components not migrated ${report.unknownComponents.length}, assets ${report.assets.size}`)
