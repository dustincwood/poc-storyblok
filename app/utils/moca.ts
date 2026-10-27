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
  name = faRenamed[name] ?? name
  return name ? `i-${set}-${name}` : ''
}

// Font Awesome 5 names still used in content, renamed in version 6 (the Iconify sets have only the new names)
const faRenamed: Record<string, string> = {
  'university': 'building-columns',
  'search': 'magnifying-glass',
  'home': 'house',
  'calendar-alt': 'calendar-days',
  'external-link-alt': 'up-right-from-square',
  'info-circle': 'circle-info',
  'exclamation-triangle': 'triangle-exclamation',
  'exclamation-circle': 'circle-exclamation',
  'check-circle': 'circle-check',
  'question-circle': 'circle-question',
  'times': 'xmark',
  'map-marker-alt': 'location-dot',
  'phone-alt': 'phone',
  'user-friends': 'user-group',
  'file-alt': 'file-lines',
  'edit': 'pen-to-square',
  'chevron-circle-right': 'circle-chevron-right',
  'arrow-circle-right': 'circle-arrow-right',
  'hands-helping': 'handshake-angle',
}

// Font Awesome size class (fa-2x ... fa-10x, fa-lg) in an icon field -> CSS font-size, or undefined
export function faIconSize(value?: string) {
  const decoded = (value ?? '').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  const multiplier = decoded.match(/\bfa-(\d+)x\b/)?.[1]
  if (multiplier) return `${multiplier}em`
  return /\bfa-lg\b/.test(decoded) ? '1.333em' : undefined
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

// usu.edu color names (text-primary, text-blue, ...) used by migrated headings, titles and bars.
// Text colors are !important like Bootstrap's, so they beat the heading color.
export const mocaColors: Record<string, { text: string, bg: string }> = {
  'primary': { text: 'text-usu-primary!', bg: 'bg-usu-primary' },
  'blue': { text: 'text-usu-slate!', bg: 'bg-usu-slate' },
  'blue-dark': { text: 'text-usu-blue-dark!', bg: 'bg-usu-blue-dark' },
  'info': { text: 'text-usu-info!', bg: 'bg-usu-info' },
  'bright-light': { text: 'text-usu-bright-light!', bg: 'bg-usu-bright-light' },
  'success': { text: 'text-usu-success!', bg: 'bg-usu-success' },
  'warning': { text: 'text-usu-warning!', bg: 'bg-usu-warning' },
  'danger': { text: 'text-usu-danger!', bg: 'bg-usu-danger' },
  'dark': { text: 'text-usu-dark!', bg: 'bg-usu-dark' },
  'white': { text: 'text-white!', bg: 'bg-white' },
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
// `block` is .btn-block (full width).
export function mocaButtonClass(type = 'btn-white', outline = false, size = '', block = false) {
  const btnType = type.includes('btn') ? type : (legacyBtnTypes[type] ?? 'btn-white')
  const short = btnType.replace(/^btn-/, '')
  const canOutline = outline && !/secondary|link|white/.test(short) && btnType !== 'btn-light' && !!btnVariants[`outline-${short}`]
  const variant = btnVariants[canOutline ? `outline-${short}` : short] ?? btnVariants.white!
  const { box, text } = btnSizes[size] ?? btnSizes['']!

  return [
    block ? 'block w-full' : 'inline-block',
    'align-middle text-center select-none border font-condensed leading-normal no-underline cursor-pointer',
    'transition-colors duration-150 ease-in-out focus:underline focus:outline-none',
    box,
    variant.big ? 'text-[1.167rem] font-bold' : `${text} font-normal`,
    variant.cls,
  ].join(' ')
}

// Bootstrap 4 grid column widths (.col-{bp}-{n}, .col-{bp} = auto, .col-{bp}-auto = content), as flex-basis like Bootstrap.
// Breakpoint keys: '' (none), sm, md, lg, xl. Written out in full for Tailwind.
export const mocaColumnWidths: Record<string, Record<string, string>> = {
  '': {
    auto: 'basis-0 grow max-w-full',
    content: 'basis-auto grow-0 w-auto max-w-full',
    '1': 'basis-[8.333333%] grow-0 shrink-0 max-w-[8.333333%]',
    '2': 'basis-[16.666667%] grow-0 shrink-0 max-w-[16.666667%]',
    '3': 'basis-[25%] grow-0 shrink-0 max-w-[25%]',
    '4': 'basis-[33.333333%] grow-0 shrink-0 max-w-[33.333333%]',
    '5': 'basis-[41.666667%] grow-0 shrink-0 max-w-[41.666667%]',
    '6': 'basis-[50%] grow-0 shrink-0 max-w-[50%]',
    '7': 'basis-[58.333333%] grow-0 shrink-0 max-w-[58.333333%]',
    '8': 'basis-[66.666667%] grow-0 shrink-0 max-w-[66.666667%]',
    '9': 'basis-[75%] grow-0 shrink-0 max-w-[75%]',
    '10': 'basis-[83.333333%] grow-0 shrink-0 max-w-[83.333333%]',
    '11': 'basis-[91.666667%] grow-0 shrink-0 max-w-[91.666667%]',
    '12': 'basis-[100%] grow-0 shrink-0 max-w-[100%]',
  },
  'sm': {
    auto: 'bs-sm:basis-0 bs-sm:grow bs-sm:max-w-full',
    content: 'bs-sm:basis-auto bs-sm:grow-0 bs-sm:w-auto bs-sm:max-w-full',
    '1': 'bs-sm:basis-[8.333333%] bs-sm:grow-0 bs-sm:shrink-0 bs-sm:max-w-[8.333333%]',
    '2': 'bs-sm:basis-[16.666667%] bs-sm:grow-0 bs-sm:shrink-0 bs-sm:max-w-[16.666667%]',
    '3': 'bs-sm:basis-[25%] bs-sm:grow-0 bs-sm:shrink-0 bs-sm:max-w-[25%]',
    '4': 'bs-sm:basis-[33.333333%] bs-sm:grow-0 bs-sm:shrink-0 bs-sm:max-w-[33.333333%]',
    '5': 'bs-sm:basis-[41.666667%] bs-sm:grow-0 bs-sm:shrink-0 bs-sm:max-w-[41.666667%]',
    '6': 'bs-sm:basis-[50%] bs-sm:grow-0 bs-sm:shrink-0 bs-sm:max-w-[50%]',
    '7': 'bs-sm:basis-[58.333333%] bs-sm:grow-0 bs-sm:shrink-0 bs-sm:max-w-[58.333333%]',
    '8': 'bs-sm:basis-[66.666667%] bs-sm:grow-0 bs-sm:shrink-0 bs-sm:max-w-[66.666667%]',
    '9': 'bs-sm:basis-[75%] bs-sm:grow-0 bs-sm:shrink-0 bs-sm:max-w-[75%]',
    '10': 'bs-sm:basis-[83.333333%] bs-sm:grow-0 bs-sm:shrink-0 bs-sm:max-w-[83.333333%]',
    '11': 'bs-sm:basis-[91.666667%] bs-sm:grow-0 bs-sm:shrink-0 bs-sm:max-w-[91.666667%]',
    '12': 'bs-sm:basis-[100%] bs-sm:grow-0 bs-sm:shrink-0 bs-sm:max-w-[100%]',
  },
  'md': {
    auto: 'bs-md:basis-0 bs-md:grow bs-md:max-w-full',
    content: 'bs-md:basis-auto bs-md:grow-0 bs-md:w-auto bs-md:max-w-full',
    '1': 'bs-md:basis-[8.333333%] bs-md:grow-0 bs-md:shrink-0 bs-md:max-w-[8.333333%]',
    '2': 'bs-md:basis-[16.666667%] bs-md:grow-0 bs-md:shrink-0 bs-md:max-w-[16.666667%]',
    '3': 'bs-md:basis-[25%] bs-md:grow-0 bs-md:shrink-0 bs-md:max-w-[25%]',
    '4': 'bs-md:basis-[33.333333%] bs-md:grow-0 bs-md:shrink-0 bs-md:max-w-[33.333333%]',
    '5': 'bs-md:basis-[41.666667%] bs-md:grow-0 bs-md:shrink-0 bs-md:max-w-[41.666667%]',
    '6': 'bs-md:basis-[50%] bs-md:grow-0 bs-md:shrink-0 bs-md:max-w-[50%]',
    '7': 'bs-md:basis-[58.333333%] bs-md:grow-0 bs-md:shrink-0 bs-md:max-w-[58.333333%]',
    '8': 'bs-md:basis-[66.666667%] bs-md:grow-0 bs-md:shrink-0 bs-md:max-w-[66.666667%]',
    '9': 'bs-md:basis-[75%] bs-md:grow-0 bs-md:shrink-0 bs-md:max-w-[75%]',
    '10': 'bs-md:basis-[83.333333%] bs-md:grow-0 bs-md:shrink-0 bs-md:max-w-[83.333333%]',
    '11': 'bs-md:basis-[91.666667%] bs-md:grow-0 bs-md:shrink-0 bs-md:max-w-[91.666667%]',
    '12': 'bs-md:basis-[100%] bs-md:grow-0 bs-md:shrink-0 bs-md:max-w-[100%]',
  },
  'lg': {
    auto: 'bs-lg:basis-0 bs-lg:grow bs-lg:max-w-full',
    content: 'bs-lg:basis-auto bs-lg:grow-0 bs-lg:w-auto bs-lg:max-w-full',
    '1': 'bs-lg:basis-[8.333333%] bs-lg:grow-0 bs-lg:shrink-0 bs-lg:max-w-[8.333333%]',
    '2': 'bs-lg:basis-[16.666667%] bs-lg:grow-0 bs-lg:shrink-0 bs-lg:max-w-[16.666667%]',
    '3': 'bs-lg:basis-[25%] bs-lg:grow-0 bs-lg:shrink-0 bs-lg:max-w-[25%]',
    '4': 'bs-lg:basis-[33.333333%] bs-lg:grow-0 bs-lg:shrink-0 bs-lg:max-w-[33.333333%]',
    '5': 'bs-lg:basis-[41.666667%] bs-lg:grow-0 bs-lg:shrink-0 bs-lg:max-w-[41.666667%]',
    '6': 'bs-lg:basis-[50%] bs-lg:grow-0 bs-lg:shrink-0 bs-lg:max-w-[50%]',
    '7': 'bs-lg:basis-[58.333333%] bs-lg:grow-0 bs-lg:shrink-0 bs-lg:max-w-[58.333333%]',
    '8': 'bs-lg:basis-[66.666667%] bs-lg:grow-0 bs-lg:shrink-0 bs-lg:max-w-[66.666667%]',
    '9': 'bs-lg:basis-[75%] bs-lg:grow-0 bs-lg:shrink-0 bs-lg:max-w-[75%]',
    '10': 'bs-lg:basis-[83.333333%] bs-lg:grow-0 bs-lg:shrink-0 bs-lg:max-w-[83.333333%]',
    '11': 'bs-lg:basis-[91.666667%] bs-lg:grow-0 bs-lg:shrink-0 bs-lg:max-w-[91.666667%]',
    '12': 'bs-lg:basis-[100%] bs-lg:grow-0 bs-lg:shrink-0 bs-lg:max-w-[100%]',
  },
  'xl': {
    auto: 'bs-xl:basis-0 bs-xl:grow bs-xl:max-w-full',
    content: 'bs-xl:basis-auto bs-xl:grow-0 bs-xl:w-auto bs-xl:max-w-full',
    '1': 'bs-xl:basis-[8.333333%] bs-xl:grow-0 bs-xl:shrink-0 bs-xl:max-w-[8.333333%]',
    '2': 'bs-xl:basis-[16.666667%] bs-xl:grow-0 bs-xl:shrink-0 bs-xl:max-w-[16.666667%]',
    '3': 'bs-xl:basis-[25%] bs-xl:grow-0 bs-xl:shrink-0 bs-xl:max-w-[25%]',
    '4': 'bs-xl:basis-[33.333333%] bs-xl:grow-0 bs-xl:shrink-0 bs-xl:max-w-[33.333333%]',
    '5': 'bs-xl:basis-[41.666667%] bs-xl:grow-0 bs-xl:shrink-0 bs-xl:max-w-[41.666667%]',
    '6': 'bs-xl:basis-[50%] bs-xl:grow-0 bs-xl:shrink-0 bs-xl:max-w-[50%]',
    '7': 'bs-xl:basis-[58.333333%] bs-xl:grow-0 bs-xl:shrink-0 bs-xl:max-w-[58.333333%]',
    '8': 'bs-xl:basis-[66.666667%] bs-xl:grow-0 bs-xl:shrink-0 bs-xl:max-w-[66.666667%]',
    '9': 'bs-xl:basis-[75%] bs-xl:grow-0 bs-xl:shrink-0 bs-xl:max-w-[75%]',
    '10': 'bs-xl:basis-[83.333333%] bs-xl:grow-0 bs-xl:shrink-0 bs-xl:max-w-[83.333333%]',
    '11': 'bs-xl:basis-[91.666667%] bs-xl:grow-0 bs-xl:shrink-0 bs-xl:max-w-[91.666667%]',
    '12': 'bs-xl:basis-[100%] bs-xl:grow-0 bs-xl:shrink-0 bs-xl:max-w-[100%]',
  },
}

// Bootstrap image classes (.rounded, .rounded-circle, .img-thumbnail) by their option value.
// .rounded-circle is a 50% radius: a circle on a square photo, an ellipse otherwise.
export const mocaImageStyles: Record<string, string> = {
  'rounded': 'rounded',
  'rounded-circle': 'rounded-[50%]',
  'img-thumbnail': 'p-1 bg-white border border-usu-gray-300 rounded',
}

// Bootstrap 4 spacers 0-5 (0, .25, .5, 1, 1.5, 3rem) as Tailwind classes, per property
export const mocaSpacing: Record<string, Record<string, string>> = {
  'mt': { '0': 'mt-0', '1': 'mt-1', '2': 'mt-2', '3': 'mt-4', '4': 'mt-6', '5': 'mt-12' },
  'mb': { '0': 'mb-0', '1': 'mb-1', '2': 'mb-2', '3': 'mb-4', '4': 'mb-6', '5': 'mb-12' },
  'my': { '0': 'my-0', '1': 'my-1', '2': 'my-2', '3': 'my-4', '4': 'my-6', '5': 'my-12' },
  'py': { '0': 'py-0', '1': 'py-1', '2': 'py-2', '3': 'py-4', '4': 'py-6', '5': 'py-12' },
  'p': { '0': 'p-0', '1': 'p-1', '2': 'p-2', '3': 'p-4', '4': 'p-6', '5': 'p-12' },
}

// Spacing field value ('' or '0'-'5') -> class
export function mocaSpace(property: keyof typeof mocaSpacing, value?: string) {
  return value ? mocaSpacing[property]?.[value] ?? '' : ''
}

