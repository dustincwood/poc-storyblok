// A published usu.edu page's top nav (the site's _topNav.inc as rendered) -> the page type's top_nav blocks:
// nav-link, nav-dropdown (with nav-link / nav-divider), nav-columns (with nav-column).
// Used by migrate.mjs (url links) and set-nav.mjs (links to migrated stories where they exist).
import { randomUUID } from 'node:crypto'
import { decode } from 'entities'
import { ELEMENT_NODE, TEXT_NODE } from 'ultrahtml'

const isEl = (n, name) => n?.type === ELEMENT_NODE && (!name || n.name === name)
const classes = n => (n?.attributes?.class ?? '').split(/\s+/).filter(Boolean)
const has = (n, c) => classes(n).includes(c)
const findAll = (n, test) => [...(test(n) ? [n] : []), ...(n.children ?? []).flatMap(c => findAll(c, test))]
const find = (n, test) => findAll(n, test)[0]
const text = n => n.type === TEXT_NODE ? n.value : (n.children ?? []).map(text).join('')
const clean = s => decode(s).replace(/\s+/g, ' ').trim()
const blok = (component, fields) => ({ _uid: randomUUID(), component, ...fields })

// The site menu: the first .navbar-nav inside #master-nav that isn't the global quick-links list
export function publishedMenu(doc) {
  const master = find(doc, n => isEl(n) && n.attributes.id === 'master-nav')
  return master && find(master, n => isEl(n, 'ul') && has(n, 'navbar-nav') && !has(n, 'navbar-global'))
}

// toLink(href) -> a multilink field value
export function navBlocks(menu, toLink) {
  if (!menu) return []
  const linkBlock = a => blok('nav-link', {
    label: clean(text(a)),
    link: toLink(decode(a.attributes.href ?? '')),
    ...(has(a, 'nav-btn') && { button: true }),
  })
  return (menu.children ?? []).filter(li => isEl(li, 'li')).map((li) => {
    const panel = find(li, n => isEl(n) && has(n, 'dropdown-menu'))
    const top = (li.children ?? []).find(n => isEl(n, 'a'))
    if (!panel) return linkBlock(top)
    // The toggle's own text (its icon has none)
    const label = clean(text(top))
    const alignRight = has(panel, 'dropdown-menu-right')
    const cols = findAll(panel, n => isEl(n) && classes(n).some(c => /^col(-|$)/.test(c)))
    if (cols.length) {
      return blok('nav-columns', {
        label,
        mega: has(li, 'dropdown-mega') || has(panel, 'mega-menu') || classes(panel).some(c => /mega/.test(c)),
        align_right: alignRight,
        columns: cols.map(col => blok('nav-column', {
          title: clean(text(find(col, n => isEl(n) && /^h[1-6]$/.test(n.name)) ?? { type: TEXT_NODE, value: '' })),
          text: '',
          links: findAll(col, n => isEl(n, 'a') && n.attributes.href).map(linkBlock),
          link_columns: '1',
          more: [],
          width: '',
        })),
      })
    }
    // One list; <hr> between items is a divider
    const items = []
    const walk = n => {
      for (const c of n.children ?? []) {
        if (isEl(c, 'hr') || (isEl(c) && has(c, 'dropdown-divider'))) items.push(blok('nav-divider', {}))
        else if (isEl(c, 'a') && c.attributes.href) items.push(linkBlock(c))
        else if (isEl(c)) walk(c)
      }
    }
    walk(panel)
    return blok('nav-dropdown', { label, links: items, align_right: alignRight })
  })
}

// Comparable form: labels and addresses only
export const navSignature = blocks => JSON.stringify(blocks.map(b => [b.component, b.label, b.link?.url ?? b.link?.cached_url,
  (b.links ?? []).map(l => [l.component, l.label, l.link?.url ?? l.link?.cached_url]),
  (b.columns ?? []).map(c => [c.title, (c.links ?? []).map(l => [l.label, l.link?.url ?? l.link?.cached_url])])]))
