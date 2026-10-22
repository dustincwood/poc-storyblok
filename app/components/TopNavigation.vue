<script setup>
// Vue port of z_Dustin_Wood/xsl/parts/main-navigation-1.xsl.
// The CMS includes become props: _topNav.inc -> items, _mobileNav.inc -> siteName/siteUrl,
// _subNav.inc -> subNav. Below lg the menu is a USlideover (focus trap, scroll lock, Esc and
// backdrop, which init.js handled by hand); at lg it is a horizontal bar with dropdowns.
import { onClickOutside, useMediaQuery, useWindowScroll } from '@vueuse/core'

const props = defineProps({
  // Menu items (see demoItems below for every shape). Falls back to demoItems when not set.
  items: { type: Array, default: null },
  hideTopNav: { type: Boolean, default: false },
  showMobileNav: { type: Boolean, default: true },
  // Site name shown in the mobile bar
  siteName: { type: String, default: 'Site Name' },
  siteUrl: { type: String, default: '/' },
  // Page menu under the main bar: { title, items: [{ label, to, active, children: [{ label, to, active }] }] }
  subNav: { type: Object, default: null },
})

const demoItems = [
  { label: 'Home', to: '/' },
  {
    label: '1 Column',
    links: [
      { label: 'Link 1', to: '#' }, { label: 'Link 2', to: '#' },
      { divider: true },
      { label: 'Link 3', to: '#' }, { label: 'Link 4', to: '#' }, { label: 'Link 5', to: '#' },
      { divider: true },
      { label: 'Link 6', to: '#' }, { label: 'Link 7', to: '#' },
      { divider: true },
      { label: 'Link 8', to: '#' },
    ],
  },
  {
    label: '2 Columns',
    columns: [
      { links: [{ label: 'Link 1', to: '#' }, { label: 'Link 2', to: '#' }, { label: 'Link 3', to: '#' }] },
      { links: [{ label: 'Link 4', to: '#' }, { label: 'Link 5', to: '#' }, { label: 'Link 6', to: '#' }] },
    ],
  },
  {
    label: '3 Columns',
    columns: [
      { links: [{ label: 'Link 1', to: '#' }, { label: 'Link 2', to: '#' }, { label: 'Link 3', to: '#' }] },
      { links: [{ label: 'Link 4', to: '#' }, { label: 'Link 5', to: '#' }, { label: 'Link 6', to: '#' }] },
      { links: [{ label: 'Link 7', to: '#' }, { label: 'Link 8', to: '#' }, { label: 'Link 9', to: '#' }] },
    ],
  },
  {
    label: 'Megamenu',
    // Full width of the bar; column width is in twelfths (3, 4, 6 or 12)
    mega: true,
    columns: [
      {
        width: 3,
        title: 'Column Title',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore aliqua. Ut enim ad minim veniam, quis nostrud ex ea commodo consequat.',
        more: { label: 'Read more', to: '#' },
      },
      {
        width: 6,
        title: 'Column Title',
        linkColumns: 2,
        links: [
          { label: 'Consectetur adipiscing', to: '#' }, { label: 'Eiusmod', to: '#' }, { label: 'Labore et dolore', to: '#' },
          { label: 'With icon', to: '#', icon: 'i-fa6-solid-calendar-days' }, { label: 'Ut enim ad minim veniam quis nostrud', to: '#' }, { label: 'Labore', to: '#' },
        ],
      },
      { width: 3, links: [{ label: 'Consectetur adipiscing', to: '#' }, { label: 'Veniam', to: '#' }, { label: 'Lorem ipsum', to: '#' }] },
    ],
  },
  { label: 'Sign Up', to: '#', button: true },
]

const navItems = computed(() => props.items ?? demoItems)
const isDropdown = item => !!(item.links || item.columns)

const quickLinks = [
  { label: 'Apply', to: 'https://www.usu.edu/apply/' },
  { label: 'Visit', to: 'https://www.usu.edu/visit/' },
  { label: 'Give', to: 'https://www.usu.edu/giving/' },
  { label: 'Calendar', to: 'https://www.usu.edu/calendar/' },
  { label: 'A-Z Index', to: 'https://www.usu.edu/azindex/' },
  { label: 'Directory', to: 'https://directory.usu.edu/' },
  { label: 'Libraries', to: 'https://library.usu.edu/' },
]

// Shared with Header.vue, which renders the search overlay
const searchOpen = useState('search-open', () => false)

// Darker bar once the page has scrolled past 200px (init.js's .navbar-scroll)
const { y: scrollY } = useWindowScroll()
const scrolled = computed(() => scrollY.value > 200)

// Desktop dropdowns: one open at a time, closed by an outside click or Esc
const openIndex = ref(null)
const desktopNav = ref(null)
const desktopToggles = {}

function toggleDropdown(i) {
  openIndex.value = openIndex.value === i ? null : i
}

function closeDropdown() {
  if (openIndex.value === null) return
  desktopToggles[openIndex.value]?.focus()
  openIndex.value = null
}

onClickOutside(desktopNav, () => { openIndex.value = null })

// Mobile slide-out menu and its sub-panels ('quick' is the Quick Links panel)
const mobileOpen = ref(false)
const openSub = ref(null)
const subToggles = {}
const subBackButtons = {}

async function showSub(key) {
  openSub.value = key
  await nextTick()
  subBackButtons[key]?.focus()
}

function closeSub() {
  const key = openSub.value
  openSub.value = null
  subToggles[key]?.focus()
}

// Esc closes an open sub-panel first, then the menu
function onMenuEscape(event) {
  if (openSub.value === null) return
  event.preventDefault()
  closeSub()
}

watch(mobileOpen, (open) => { if (!open) openSub.value = null })

// Reset whichever menu no longer applies when the window crosses lg
const isDesktop = useMediaQuery('(min-width: 64rem)')
watch(isDesktop, (desktop) => {
  if (desktop) mobileOpen.value = false
  else openIndex.value = null
})

// Page menu (Bootstrap collapse in the original)
const subNavOpen = ref(false)

const desktopLink = 'flex items-center self-stretch m-0 pt-3 px-3 pb-[0.6rem] font-condensed font-normal text-base whitespace-nowrap border-b-3 cursor-pointer xl:text-[1.125rem]'
const desktopLinkIdle = 'text-white border-transparent hover:border-[#e1eaf9] focus-visible:border-[#e1eaf9]'
const navButton = 'flex items-center self-stretch m-0 pt-3 px-8 pb-[0.6rem] font-condensed font-bold text-[1.167rem] text-white whitespace-nowrap bg-header-sky border-b-3 border-transparent hover:border-white focus-visible:border-white'
const mobileLink = 'flex items-center w-[calc(100%-50px)] mx-[25px] py-2 font-condensed text-[1.2rem] text-left cursor-pointer'
const offcanvasButton = 'inline-flex items-center gap-1 my-2 py-1.5 px-3 font-condensed font-normal text-[1.3rem] leading-normal text-white bg-header-slate border border-transparent rounded cursor-pointer transition-colors duration-150 ease-in-out hover:bg-header-sky focus:bg-header-sky focus:outline-none'
const subPanel = 'absolute inset-0 z-10 overflow-y-auto bg-header-slate transition-[translate,visibility] duration-300 ease-in-out motion-reduce:transition-none'
const toggler = 'absolute top-0 right-0 bottom-0 flex items-center my-[0.55rem] sm:mr-2 px-2 py-1 text-[1.25rem] leading-none bg-transparent rounded cursor-pointer hover:bg-header-sky focus:bg-header-sky lg:hidden'
const uLogo = 'inline align-middle max-w-full h-auto pr-1 sm:pr-2'
const navContainer = 'flex flex-wrap items-center justify-between w-full mx-auto xl:max-w-[1320px]'
</script>

<template>
  <!-- z-40 rather than Bootstrap's 1020 so Nuxt UI overlays (z-50) open above it -->
  <nav
    id="master-nav"
    class="sticky top-0 z-40 flex flex-wrap items-center justify-between p-0 font-system bg-header-navy lg:flex-row lg:flex-nowrap lg:justify-start lg:transition-[background-color] lg:duration-500"
    :class="scrolled ? 'lg:bg-header-navy' : 'lg:bg-header-slate'"
    aria-label="Main menu"
  >
    <div :class="navContainer" class="p-0 lg:flex-nowrap">
      <!-- Mobile bar -->
      <div class="flex grow justify-between pl-0 pr-14 lg:hidden">
        <div class="flex flex-col justify-center ml-2 sm:ml-4 mr-2 my-4 pr-1">
          <a href="https://www.usu.edu">
            <img width="80" height="61" src="https://www.usu.edu/assets/bs4/images/logos/u-state-logo.svg" :class="uLogo" alt="UState logo">
          </a>
        </div>
        <NuxtLink
          v-if="siteName && showMobileNav"
          class="flex grow self-center justify-center py-4 font-condensed text-[1.2rem] leading-6 text-center text-white sm:text-[1.3rem] md:text-[1.5rem]"
          :to="siteUrl"
        >
          {{ siteName }}
        </NuxtLink>
        <div v-else class="m-auto py-6">
          <a class="self-center" href="https://www.usu.edu/">
            <img width="80" height="61" src="https://www.usu.edu/assets/bs4/images/logos/u-state-logo.svg" :class="uLogo" alt="UState logo">
          </a>
        </div>
        <button :class="toggler" type="button" aria-haspopup="dialog" @click="mobileOpen = true">
          <span class="sr-only">Open main menu</span>
          <UIcon name="i-lucide-menu" class="size-[1.5em] text-white/80" />
        </button>
      </div>

      <!-- Desktop bar -->
      <ul
        v-if="!hideTopNav"
        ref="desktopNav"
        class="hidden lg:flex lg:flex-row lg:grow mb-0 p-0 list-none"
        @keydown.esc="closeDropdown"
      >
        <li
          v-for="(item, i) in navItems"
          :key="item.label"
          class="flex"
          :class="[!item.mega && 'relative', item.button && 'ml-auto mr-4']"
        >
          <template v-if="isDropdown(item)">
            <button
              :ref="el => desktopToggles[i] = el"
              type="button"
              :class="[desktopLink, openIndex === i ? ['text-[#495057] bg-white', scrolled ? 'border-white' : 'border-transparent'] : desktopLinkIdle]"
              :aria-expanded="openIndex === i"
              @click="toggleDropdown(i)"
            >
              {{ item.label }}
              <UIcon name="i-fa6-solid-angle-down" class="size-4 ml-2 transition-transform" :class="openIndex === i && 'rotate-180'" />
            </button>
            <TopNavigationDropdown v-show="openIndex === i" :item="item" />
          </template>
          <a v-else-if="item.button" :class="[navButton, 'ml-4']" :href="item.to">{{ item.label }}</a>
          <a v-else :class="[desktopLink, desktopLinkIdle]" :href="item.to">{{ item.label }}</a>
        </li>
      </ul>
    </div>
  </nav>

  <!-- Mobile slide-out menu -->
  <USlideover
    v-model:open="mobileOpen"
    side="right"
    title="Main navigation"
    description="Site menu, quick links and search"
    :content="{ onEscapeKeyDown: onMenuEscape }"
    :ui="{
      overlay: 'z-50 bg-black/40',
      content: 'z-50 w-full sm:w-1/2 sm:max-w-none bg-header-slate divide-y-0 sm:ring-0 shadow-[-0.5rem_0_0.5rem_0.25rem_rgba(17,17,17,0.2)] font-system',
    }"
  >
    <template #content="{ close }">
      <div class="relative h-full overflow-hidden">
        <div class="h-full overflow-y-auto">
          <div class="flex px-2 font-condensed text-[1.3rem] text-white">
            <button type="button" :class="offcanvasButton" @click="close">
              <UIcon name="i-fa6-solid-xmark" /> Close
            </button>
            <button type="button" :class="[offcanvasButton, 'ml-auto']" aria-haspopup="dialog" @click="searchOpen = true">
              <span class="sr-only">Open search</span>
              <UIcon name="i-fa6-solid-magnifying-glass" class="size-5" />
            </button>
          </div>

          <ul v-if="!hideTopNav" class="flex flex-col mb-0 py-[30px] list-none bg-white">
            <li v-for="(item, i) in navItems" :key="item.label" :class="item.button && 'mt-6'">
              <template v-if="isDropdown(item)">
                <button
                  :ref="el => subToggles[i] = el"
                  type="button"
                  :class="[mobileLink, 'text-[#212529] border-b-2 border-[#dee2e6]']"
                  :aria-expanded="openSub === i"
                  @click="showSub(i)"
                >
                  {{ item.label }}
                  <UIcon name="i-fa6-solid-angle-right" class="size-[1.33em] ml-auto" />
                </button>
                <div :class="[subPanel, openSub === i ? 'translate-x-0 visible' : 'translate-x-full invisible']">
                  <div class="flex justify-between px-2 font-condensed text-[1.3rem] text-white">
                    <button :ref="el => subBackButtons[i] = el" type="button" :class="offcanvasButton" @click="closeSub">
                      <UIcon name="i-fa6-solid-xmark" /> Close
                    </button>
                    <div class="self-center mx-4">{{ item.label }}</div>
                  </div>
                  <TopNavigationDropdown :item="item" />
                </div>
              </template>
              <a v-else-if="item.button" :class="navButton" :href="item.to">{{ item.label }}</a>
              <a v-else :class="[mobileLink, 'text-[#212529] border-b-2 border-[#dee2e6]']" :href="item.to">{{ item.label }}</a>
            </li>
          </ul>

          <!-- Quick Links / MyUSU -->
          <ul class="flex flex-col mb-0 py-4 list-none bg-header-slate">
            <li>
              <button
                :ref="el => subToggles.quick = el"
                type="button"
                :class="[mobileLink, 'text-header-mist border-b border-[#384660] hover:text-white']"
                :aria-expanded="openSub === 'quick'"
                @click="showSub('quick')"
              >
                <UIcon name="i-fa6-solid-list" class="mr-2" />Quick Links
                <UIcon name="i-fa6-solid-angle-right" class="size-[1.6rem] ml-auto" />
              </button>
              <div :class="[subPanel, openSub === 'quick' ? 'translate-x-0 visible' : 'translate-x-full invisible']">
                <div class="flex justify-between px-2 font-condensed text-[1.3rem] text-white">
                  <button :ref="el => subBackButtons.quick = el" type="button" :class="offcanvasButton" @click="closeSub">
                    <UIcon name="i-fa6-solid-xmark" /> Close
                  </button>
                  <div class="self-center mx-4">Quick Links</div>
                </div>
                <TopNavigationDropdown :item="{ links: quickLinks }" />
              </div>
            </li>
            <li>
              <a :class="[mobileLink, 'text-header-mist border-b border-[#384660] hover:text-white']" href="https://my.usu.edu">
                <UIcon name="i-fa6-solid-user" class="mr-2" />MyUSU
              </a>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </USlideover>

  <!-- Page menu (_subNav.inc) -->
  <nav
    v-if="subNav"
    id="sub-menu"
    class="relative flex flex-wrap items-center justify-between px-0 pt-1 pb-0 font-condensed bg-[#e9ecef] border border-t-0 border-[#dee2e6] lg:flex-col lg:items-stretch lg:pb-1"
    aria-label="Page menu"
  >
    <div :class="navContainer" class="px-3 lg:pl-[0.6rem]">
      <div class="flex grow justify-between lg:grow-0 lg:justify-start">
        <button
          class="order-2 flex items-center py-1 pl-0 pr-0 ml-0 text-[1.25rem] leading-none bg-transparent rounded cursor-pointer lg:order-1 lg:pr-4"
          type="button"
          aria-controls="sub-menu-navbar"
          :aria-expanded="subNavOpen"
          @click="subNavOpen = !subNavOpen"
        >
          <span class="sr-only">Toggle page menu</span>
          <UIcon name="i-lucide-menu" class="size-[1.5em] text-[#343a40]/80" />
        </button>
        <button
          type="button"
          class="flex grow self-center justify-center text-center text-[1.2rem] leading-6 text-[#226baa] cursor-pointer hover:text-header-sky lg:order-2 lg:grow-0 lg:text-left"
          aria-controls="sub-menu-navbar"
          :aria-expanded="subNavOpen"
          @click="subNavOpen = !subNavOpen"
        >
          {{ subNav.title }}
        </button>
      </div>
      <!-- grid-rows 0fr -> 1fr animates the panel to its natural height -->
      <div
        id="sub-menu-navbar"
        class="grid basis-full grow transition-[grid-template-rows] duration-350 ease-[ease] motion-reduce:transition-none"
        :class="subNavOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        :inert="!subNavOpen"
      >
        <div class="overflow-hidden">
          <ul class="flex flex-col w-full pl-0 mb-0 py-4 list-none">
            <li v-for="link in subNav.items" :key="link.label" class="border-t border-header-mist last:border-b" :class="link.active && 'bg-[#e9ecef]'">
              <a
                class="block py-2 px-[5px] hover:bg-[#dee2e6]"
                :class="link.active ? 'text-[#226baa]' : 'text-[#212529]'"
                :href="link.to"
              >{{ link.label }}</a>
              <ul v-if="link.children" class="pl-0 list-none">
                <li v-for="child in link.children" :key="child.label" class="border-t border-header-mist">
                  <a
                    class="block py-2 pr-[5px] pl-5 hover:bg-[#dee2e6]"
                    :class="child.active ? 'text-[#226baa]' : 'text-[#212529]'"
                    :href="child.to"
                  >{{ child.label }}</a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>
