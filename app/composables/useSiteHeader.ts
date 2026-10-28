// The site header's names and the top nav for the current page, set by middleware/site-header.global.ts
// before the page renders, and read by the layout. null: the components show their own defaults.
export type SiteHeader = {
  siteName: string
  siteUrl: string
  parentName: string
  parentUrl: string
}

export const useSiteHeaderState = () => useState<SiteHeader | null>('site-header', () => null)

// TopNavigation's item shapes (see its demoItems)
export type NavItem = {
  label: string
  to?: string
  target?: string
  button?: boolean
  alignRight?: boolean
  mega?: boolean
  links?: NavLink[]
  columns?: { title?: string, text?: string, width?: number, linkColumns?: number, links?: NavLink[], more?: NavLink }[]
}
type NavLink = { label: string, to: string, target?: string, icon?: string } | { divider: true }

export const useTopNavState = () => useState<NavItem[] | null>('top-nav', () => null)

const navLink = (b: any): NavLink => ({
  label: b.label ?? '',
  to: mocaLinkHref(b.link) || '#',
  ...(b.link?.target && { target: b.link.target }),
  ...(b.icon && { icon: faIconName(b.icon) }),
})

// A page's top_nav blocks (nav-link, nav-dropdown, nav-columns) -> TopNavigation items
export function navItems(blocks: any[]): NavItem[] {
  return blocks.map((b) => {
    if (b.component === 'nav-dropdown') {
      return {
        label: b.label ?? '',
        alignRight: !!b.align_right,
        links: (b.links ?? []).map((l: any) => l.component === 'nav-divider' ? { divider: true } : navLink(l)),
      }
    }
    if (b.component === 'nav-columns') {
      return {
        label: b.label ?? '',
        mega: !!b.mega,
        alignRight: !!b.align_right,
        columns: (b.columns ?? []).map((c: any) => ({
          ...(c.title && { title: c.title }),
          ...(c.text && { text: c.text }),
          ...(Number(c.width) && { width: Number(c.width) }),
          ...(Number(c.link_columns) > 1 && { linkColumns: Number(c.link_columns) }),
          links: (c.links ?? []).map(navLink),
          ...(c.more?.[0] && { more: navLink(c.more[0]) }),
        })),
      }
    }
    const link = navLink(b) as { label: string, to: string, target?: string }
    return { ...link, ...(b.button && { button: true }) }
  })
}
