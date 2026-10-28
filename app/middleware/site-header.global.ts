// Sets the site header's names before the page renders (the layout renders <Header> ahead of the page, so a
// page setting them itself would be too late for the server's HTML). Modern Campus gave each folder its own
// _siteLogo.inc; here the story's own header fields win, else the nearest folder start page above it that
// sets a site name. The four fields go together, so a sub-site never shows another site's parent.
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
  // The server already looked it up for the first page
  if (import.meta.client && nuxtApp.isHydrating && nuxtApp.payload.serverRendered) return

  const version = import.meta.dev || to.query._storyblok ? 'draft' : 'published'
  const slugs = candidates(to.path)
  try {
    // One request for the story and every start page above it; only the header fields, not their bodies
    const { data } = await useStoryblokApi().get('cdn/stories', { version, by_slugs: slugs.join(','), excluding_fields: 'body' })
    const bySlug = new Map((data.stories as any[]).map(s => [s.full_slug, s]))
    const found = slugs.map(s => bySlug.get(s)).find(s => s?.content?.header_site_name?.trim())
    state.value = found ? fromFields(found.content, found.full_slug) : null
  }
  catch {
    // No header names is better than no page: the header shows its defaults
    state.value = null
  }
})
