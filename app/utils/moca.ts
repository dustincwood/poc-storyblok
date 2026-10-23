// Shared helpers for the Modern Campus (moca) Storyblok blocks in app/storyblok/moca.
// Class strings are written out in full so Tailwind can find them at build time.

export interface SbLink {
  linktype?: 'url' | 'story' | 'email' | 'asset'
  url?: string
  cached_url?: string
  email?: string
  anchor?: string
  target?: string
  story?: { full_slug?: string }
}

export interface SbAsset {
  filename?: string
  alt?: string
}

// Storyblok multilink field -> href ('' when the field is empty)
export function mocaLinkHref(link?: SbLink | null) {
  if (!link) return ''
  if (link.linktype === 'email') return link.email ? `mailto:${link.email}` : ''

  let href = link.url || link.cached_url || ''
  if (link.linktype === 'story') {
    const slug = (link.story?.full_slug ?? link.cached_url ?? '').replace(/^\/+/, '')
    if (!slug) return ''
    href = slug === 'home' ? '/' : `/${slug}`
  }
  if (href && link.anchor) href += `#${link.anchor}`
  return href
}

// Empty Storyblok rich text is a doc holding one empty paragraph
export function hasRichText(doc?: { content?: { type: string, content?: unknown[] }[] } | null) {
  return !!doc?.content?.some(node => node.type !== 'paragraph' || node.content?.length)
}

// Accepts "fa-solid fa-house", "fas fa-house", or a pasted <i class="fa-solid fa-house"></i>.
// Returns the matching Iconify name for <UIcon>, e.g. "i-fa6-solid-house".
const faSets: Record<string, string> = {
  'fa-solid': 'fa6-solid', 'fas': 'fa6-solid',
  'fa-regular': 'fa6-regular', 'far': 'fa6-regular',
  'fa-brands': 'fa6-brands', 'fab': 'fa6-brands',
}
const faModifier = /^fa-(\d+x|2?xs|sm|lg|2?xl|fw|li|ul|border|inverse|spin.*|pulse|beat.*|bounce|fade|flip.*|shake|rotate-.*|stack.*|pull-.*|swap-opacity)$/

export function faIconName(value?: string) {
  if (!value) return ''
  const decoded = value.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  const classes = (decoded.match(/class\s*=\s*["']([^"']*)["']/)?.[1] ?? decoded).trim().split(/\s+/)

  let set = 'fa6-solid'
  let name = ''
  for (const c of classes) {
    if (faSets[c]) set = faSets[c]
    else if (c.startsWith('fa-') && !faModifier.test(c)) name ||= c.slice(3)
  }
  // A bare icon name such as "house"
  if (!name && classes.length === 1 && /^[a-z0-9-]+$/.test(classes[0]!)) name = classes[0]!
  return name ? `i-${set}-${name}` : ''
}

// Video ID from any common YouTube URL form (watch?v=, youtu.be/, embed/, shorts/) or a bare ID
export function youtubeId(url?: string) {
  if (!url) return ''
  return url.match(/(?:[?&]v=|youtu\.be\/|\/embed\/|\/shorts\/)([\w-]{11})/)?.[1]
    ?? (/^[\w-]{11}$/.test(url.trim()) ? url.trim() : '')
}

// Bootstrap 4 .container with the usu.edu override (1320px from 992px up, 1070px for .container-narrow)
export function mocaContainer(narrow = false) {
  return narrow
    ? 'w-full mx-auto px-[15px] bs-sm:max-w-[540px] bs-md:max-w-[720px] bs-lg:max-w-[1070px]'
    : 'w-full mx-auto px-[15px] bs-sm:max-w-[540px] bs-md:max-w-[720px] bs-lg:max-w-[1320px]'
}

// Bootstrap headings as styled on usu.edu (Roboto Condensed 500, #384660, smaller below 992px)
export const mocaHeading = {
  h1: 'font-condensed font-medium text-usu-slate leading-[1.1] text-[1.8125rem] bs-lg:text-[2.5rem]',
  h2: 'font-condensed font-medium text-usu-slate leading-[1.2] text-[1.625rem] bs-lg:text-[2rem]',
  h3: 'font-condensed font-medium text-usu-slate leading-[1.2] text-[1.4375rem] bs-lg:text-[1.75rem]',
  h4: 'font-condensed font-medium text-usu-slate leading-[1.2] text-[1.25rem] bs-lg:text-[1.5rem]',
  h5: 'font-condensed font-medium text-usu-slate leading-[1.2] text-[1.176rem] bs-lg:text-[1.25rem]',
  h6: 'font-condensed font-medium text-usu-slate leading-[1.2] text-base',
}

// Bootstrap .card and its parts. Header and footer are white on usu.edu, which is the card's own
// background, so they set none and a bg-* class can be added without a conflict.
export const mocaCard = {
  base: 'relative flex flex-col w-full min-w-0 break-words bg-white bg-clip-border border border-black/[.125] rounded',
  header: 'px-5 py-3 mb-0 border-b border-black/[.125] first:rounded-t-[calc(.25rem-1px)]',
  body: 'flex-auto min-h-px p-5',
  footer: 'px-5 py-3 border-t border-black/[.125] last:rounded-b-[calc(.25rem-1px)]',
}

// Bootstrap .bg-* classes used as card colors (!important, as in Bootstrap, so they beat the card's white)
export const mocaBg: Record<string, string> = {
  'bg-primary': 'bg-usu-primary!',
  'bg-info': 'bg-usu-info!',
  'bg-success': 'bg-usu-success!',
  'bg-warning': 'bg-usu-warning!',
  'bg-danger': 'bg-usu-danger!',
  'bg-dark': 'bg-usu-dark!',
  'bg-gray-dark': 'bg-usu-gray-dark!',
  'bg-gray-darker': 'bg-usu-gray-darker!',
  'bg-light': 'bg-usu-gray-100!',
  'bg-secondary': 'bg-usu-gray-300!',
}

// .btn-* variants. `big` variants set their own font size and weight (1.167rem bold in main.css),
// which wins over .btn-sm/.btn-lg font sizes.
const btnVariants: Record<string, { cls: string, big?: boolean }> = {
  'primary': { cls: 'bg-usu-slate border-usu-slate text-white hover:bg-usu-navy hover:border-usu-navy' },
  'secondary': { cls: 'bg-usu-gray-300 border-usu-gray-300 text-usu-text hover:bg-[#c8cfd6] hover:border-[#c1c9d0]' },
  'success': { cls: 'bg-usu-success border-usu-success text-white hover:bg-[#46652c] hover:border-[#405d28]' },
  'info': { cls: 'bg-usu-info border-usu-info text-white hover:bg-[#1c578a] hover:border-[#1a5080]' },
  'warning': { cls: 'bg-usu-warning border-usu-warning text-white hover:bg-[#884b02] hover:border-[#7c4401]' },
  'danger': { cls: 'bg-usu-danger border-usu-danger text-white hover:bg-[#831e0a] hover:border-[#771b09]' },
  'light': { cls: 'bg-usu-gray-100 border-usu-gray-100 text-usu-text hover:bg-[#e2e6ea] hover:border-[#dae0e5]' },
  'dark': { cls: 'bg-usu-dark border-usu-dark text-white hover:bg-[#23272b] hover:border-[#1d2124]' },
  'link': { cls: 'border-transparent text-usu-info hover:text-usu-info-dark hover:underline' },
  'white': { cls: 'bg-white border-usu-gray-400 text-usu-navy hover:bg-usu-gray-300 hover:text-usu-text' },
  'blue': { cls: 'bg-usu-info border-usu-info text-white hover:bg-usu-slate hover:border-usu-slate focus:bg-usu-slate focus:border-usu-slate' },
  'bright-light': { big: true, cls: 'bg-usu-bright-light border-usu-bright-light text-white hover:bg-usu-info hover:border-usu-info focus:bg-usu-info focus:border-usu-info' },
  'green': { big: true, cls: 'bg-usu-green border-usu-green text-white hover:bg-usu-green-dark hover:border-usu-green-dark' },
  'sage': { big: true, cls: 'bg-usu-sage border-usu-sage text-white hover:bg-[#608d77] hover:border-[#608d77] focus:bg-[#608d77]' },
  'sand': { big: true, cls: 'bg-usu-sand border-usu-sand text-[#1e252b] hover:bg-[#e6dfcf] hover:border-[#e6dfcf] focus:bg-[#e6dfcf]' },
  'blue-dark': { big: true, cls: 'bg-usu-blue-dark border-usu-blue-dark text-white hover:bg-usu-bright-light hover:border-usu-bright-light focus:bg-usu-bright-light' },
  'outline-primary': { big: true, cls: 'bg-transparent border-usu-slate text-usu-slate hover:bg-usu-slate hover:text-white' },
  'outline-secondary': { cls: 'bg-transparent border-white text-white hover:bg-white hover:text-[#333] focus:bg-white focus:text-[#333]' },
  'outline-success': { cls: 'bg-transparent border-usu-success text-usu-success hover:bg-usu-success hover:text-white' },
  'outline-info': { cls: 'bg-transparent border-usu-info text-usu-info hover:bg-usu-info hover:text-white' },
  'outline-warning': { cls: 'bg-transparent border-usu-warning text-usu-warning hover:bg-usu-warning hover:text-white' },
  'outline-danger': { cls: 'bg-transparent border-usu-danger text-usu-danger hover:bg-usu-danger hover:text-white' },
  'outline-dark': { cls: 'bg-transparent border-usu-dark text-usu-dark hover:bg-usu-dark hover:text-white' },
  'outline-green': { big: true, cls: 'bg-white border-usu-green text-usu-green hover:bg-usu-green-dark hover:border-usu-green-dark hover:text-white' },
  'outline-bright-light': { big: true, cls: 'bg-white border-usu-bright-light text-usu-bright-light hover:bg-usu-info hover:border-usu-info hover:text-white focus:bg-usu-info focus:text-white' },
}

const btnSizes: Record<string, { box: string, text: string }> = {
  'btn-sm': { box: 'px-2 py-1 rounded-[.2rem]', text: 'text-sm' },
  'btn-lg': { box: 'px-4 py-2 rounded-[.3rem]', text: 'text-xl' },
  '': { box: 'px-3 py-1.5 rounded', text: 'text-base' },
}

// Older content stored the color name instead of a btn-* class
const legacyBtnTypes: Record<string, string> = { Info: 'btn-info', Primary: 'btn-primary', Success: 'btn-success', Warning: 'btn-warning' }

// Port of the component-button class logic: `outline` switches to .btn-outline-* when one exists
// (never for secondary, light, link or white), and unknown types fall back to .btn-white.
export function mocaButtonClass(type = 'btn-white', outline = false, size = '') {
  const btnType = type.includes('btn') ? type : (legacyBtnTypes[type] ?? 'btn-white')
  const short = btnType.replace(/^btn-/, '')
  const canOutline = outline && !/secondary|link|white/.test(short) && btnType !== 'btn-light' && !!btnVariants[`outline-${short}`]
  const variant = btnVariants[canOutline ? `outline-${short}` : short] ?? btnVariants.white!
  const { box, text } = btnSizes[size] ?? btnSizes['']!

  return [
    'inline-block align-middle text-center select-none border font-condensed leading-normal no-underline cursor-pointer',
    'transition-colors duration-150 ease-in-out focus:underline focus:outline-none',
    box,
    variant.big ? 'text-[1.167rem] font-bold' : `${text} font-normal`,
    variant.cls,
  ].join(' ')
}
