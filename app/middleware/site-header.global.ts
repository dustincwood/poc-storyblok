// Sets the site header's names and the top nav before the page renders (the layout renders them ahead of the
// page, so a page setting them itself would be too late for the server's HTML). Modern Campus gave each
// folder its own _siteLogo.inc and _topNav.inc; here the story's own fields win, else the nearest folder
// start page above it that sets them. The header and the nav are each inherited on their own (a sub-site
// can keep its parent's menu but name itself), and the header's four fields go together, so a sub-site
// never shows another site's parent.
import type { SiteHeader } from '~/composables/useSiteHeader'

type HeaderFields = {
  header_site_name?: string
  header_site_link?: SbLink
  header_parent_name?: string
  header_parent_link?: SbLink
}

function fromFields(fields: HeaderFields, ownSlug: string): SiteHeader {
  return {
    siteName: fields.header_site_name!.trim(),
    // An empty site link points at the page that sets the name
    siteUrl: mocaLinkHref(fields.header_site_link) || (ownSlug === 'home' ? '/' : `/${ownSlug}`),
    parentName: fields.header_parent_name?.trim() ?? '',
    parentUrl: mocaLinkHref(fields.header_parent_link) || '#',
  }
}

// /a/b/c -> the story itself (a/b/c, or a/b/c/ if it's a start page), then the start pages a/b/ and a/
function candidates(path: string) {
  const parts = path.split('/').filter(Boolean)
  if (!parts.length) return ['home']
  const own = parts.join('/')
  return [own, `${own}/`, ...Array.from({ length: parts.length - 1 }, (_, i) => `${parts.slice(0, parts.length - 1 - i).join('/')}/`)]
}

export default defineNuxtRouteMiddleware(async (to) => {
  const nuxtApp = useNuxtApp()
  const state = useSiteHeaderState()
  const nav = useTopNavState()
  // The server already looked it up for the first page
  if (import.meta.client && nuxtApp.isHydrating && nuxtApp.payload.serverRendered) return

  const version = import.meta.dev || to.query._storyblok ? 'draft' : 'published'
  const slugs = candidates(to.path)
  try {
    // One request for the story and every start page above it; only the header fields, not their bodies
    const { data } = await useStoryblokApi().get('cdn/stories', { version, by_slugs: slugs.join(','), excluding_fields: 'body' })
    const bySlug = new Map((data.stories as any[]).map(s => [s.full_slug, s]))
    const stories = slugs.map(s => bySlug.get(s))
    const found = stories.find(s => s?.content?.header_site_name?.trim())
    state.value = found ? fromFields(found.content, found.full_slug) : null
    const menu = stories.find(s => s?.content?.top_nav?.length)
    nav.value = menu ? navItems(menu.content.top_nav) : null
  }
  catch {
    // No header names or menu is better than no page: the header and nav show their defaults
    state.value = null
    nav.value = null
  }
})
