// The site header's names for the current page, set by middleware/site-header.global.ts before the page
// renders, and read by the layout for <Header>. null: the header shows its own defaults.
export type SiteHeader = {
  siteName: string
  siteUrl: string
  parentName: string
  parentUrl: string
}

export const useSiteHeaderState = () => useState<SiteHeader | null>('site-header', () => null)
