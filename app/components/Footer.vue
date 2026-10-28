<script setup>
// Vue port of z_Dustin_Wood/xsl/parts/footer-1.xsl.
// The CMS include _contentFooter.inc becomes siteName/siteUrl and columns (or the default slot,
// which replaces the fat footer's content entirely).
import { useWindowScroll } from '@vueuse/core'

const props = defineProps({
  hideFooter: { type: Boolean, default: false },
  lightFooter: { type: Boolean, default: false },
  siteName: { type: String, default: 'Footer Columns' },
  siteUrl: { type: String, default: 'https://www.usu.edu' },
  // Fat footer columns (see demoColumns below for every field). Falls back to demoColumns when not set.
  columns: { type: Array, default: null },
})

// Each column renders whichever of these it has, in this order:
// title, social, text, links (collapsible below lg), subscribe, buttons
const demoColumns = [
  {
    title: 'Contact Column',
    social: [
      { label: 'USU Facebook', to: 'http://www.facebook.com/UtahState', icon: 'i-fa6-brands-square-facebook' },
      { label: 'USU Twitter', to: 'http://twitter.com/USUAggies', icon: 'i-fa6-brands-square-twitter' },
      { label: 'USU YouTube', to: 'http://www.youtube.com/user/UtahStateUniversity', icon: 'i-fa6-brands-square-youtube' },
      { label: 'USU Instagram', to: 'http://instagram.com/usuaggielife/', icon: 'i-fa6-brands-instagram' },
    ],
    // Line breaks are kept
    text: 'Old Main Hill,\nLogan, UT\n84322\n(435) 797-1000',
  },
  {
    title: 'Link List',
    links: [
      { label: 'Quick Facts', to: '/about/at-a-glance/' },
      { label: 'History & Traditions', to: '/about/history/' },
      { label: 'News', to: '/today/' },
      { label: 'For Media', to: '/pressroom/' },
      { label: 'Recreation & Wellness', to: '/student-life/recreation-wellness/' },
      { label: 'Arts & Culture', to: '/arts-culture/' },
    ],
  },
  {
    title: 'Subscribe',
    text: 'Receive weekly USU news.',
    subscribe: { action: '#' },
  },
  {
    title: 'Image/Info Column',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    buttons: [
      { label: 'Apply', to: '/apply/' },
      { label: 'Visit', to: '/visit/' },
      { label: 'Give', to: 'http://www.usu.edu/giving/' },
      { label: 'Contact', to: '/contact/' },
      { label: 'Newsletter', to: '#' },
    ],
  },
]

const footerColumns = computed(() => props.columns ?? demoColumns)

// Colors for the default dark footer and the "light footer" option
const theme = computed(() => props.lightFooter
  ? {
      section: 'bg-[#f8f9fa] border-t border-[#dee2e6]',
      text: 'text-[#212529]',
      heading: 'text-[#384660]',
      listHeading: 'text-header-navy',
      link: 'text-[#226baa] hover:text-[#15436a] hover:underline',
      brand: 'text-header-sky hover:text-[#15436a] hover:underline',
    }
  : {
      section: 'bg-[#2f3a50]',
      text: 'text-white',
      heading: 'text-white',
      listHeading: 'text-white',
      link: 'text-white hover:text-white hover:underline',
      brand: 'text-white hover:underline',
    })

// Link lists open and close below lg, and are always open at lg
const openLists = ref({})
const toggleList = c => { openLists.value[c] = !openLists.value[c] }

const globalLinks = [
  { label: 'Maps & Directions', to: 'https://www.usu.edu/map/' },
  { label: 'Search USU', to: 'https://www.usu.edu/search/' },
  { label: 'Campus Safety', to: 'https://www.usu.edu/safety/' },
  { label: 'Jobs', to: 'https://jobs.usu.edu/' },
  { label: 'Contact', to: 'https://www.usu.edu/contact/' },
]
const legalLinks = [
  { label: 'Terms of Use', to: 'https://www.usu.edu/copyright/' },
  { label: 'Copyright', to: 'https://www.usu.edu/copyright/index.cfm#copyright' },
  { label: 'Privacy', to: 'https://www.usu.edu/privacy/' },
  { label: 'Accessibility', to: 'https://www.usu.edu/accessibility/contact' },
  { label: 'Non-Discrimination', to: 'https://www.usu.edu/equity/non-discrimination/' },
]

// Back-to-top button appears after scrolling 100px (init.js faded it in)
const { y: scrollY } = useWindowScroll()
const showBackToTop = computed(() => scrollY.value > 100)

function backToTop() {
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
}

const container = 'w-full mx-auto px-[15px] bs-xl:max-w-[1320px]'
// Column heading with the short rule underneath
const colBorder = 'relative flex self-center mb-2 pb-2 font-condensed text-base font-medium leading-none uppercase not-first:mt-4 after:absolute after:bottom-0 after:left-[10%] after:w-3/5 after:h-px after:bg-[#838898] bs-lg:self-start bs-lg:mb-4 bs-lg:after:left-0'
const list = 'flex flex-col items-center pl-0 mt-0 mb-4 leading-[1.8rem] list-none bs-lg:items-start'
const paragraph = 'mt-0 mb-4 text-center whitespace-pre-line bs-lg:text-left'
const footerList = 'mt-0 mb-4 px-[10px] bs-lg:inline bs-lg:m-0 bs-lg:pl-0'
const footerItem = 'py-[0.2rem] list-none bs-lg:inline bs-lg:mr-[15px]'
const footerLink = 'text-header-mist hover:text-white hover:underline'
</script>

<template>
  <!-- mt-auto pushes the footer to the bottom of short pages when its parent is a full-height flex column -->
  <footer id="site-footer" class="mt-auto">
    <!-- Editable Footer Content. -mb-6 tucks it under #global-footer's mt-6, as in production -->
    <section v-if="!hideFooter" id="fat-footer" class="-mb-6" :class="[theme.section, theme.text]">
      <div :class="container" class="py-12">
        <slot>
          <div class="flex flex-wrap -mx-[15px]">
            <div class="inline-flex mx-auto pb-4 text-center bs-lg:ml-4 bs-lg:text-left">
              <a class="mb-2 font-condensed text-[1.75rem] font-bold leading-none" :class="theme.brand" :href="siteUrl">{{ siteName }}</a>
            </div>
          </div>
          <div class="flex flex-wrap justify-between -mx-[15px]">
            <div
              v-for="(column, c) in footerColumns"
              :key="c"
              class="relative flex flex-col w-full mt-4 px-[15px] bs-lg:flex-1 bs-lg:min-w-0 bs-lg:mt-0"
            >
              <div v-if="column.title" :class="colBorder">
                <h2 class="m-0 font-condensed text-base font-medium leading-none" :class="column.links ? theme.listHeading : theme.heading">
                  <template v-if="column.links">
                    <button
                      type="button"
                      class="flex items-center uppercase cursor-pointer bs-lg:hidden"
                      :aria-expanded="!!openLists[c]"
                      :aria-controls="`footer-list-${c}`"
                      @click="toggleList(c)"
                    >
                      {{ column.title }}
                      <UIcon name="i-fa6-solid-caret-down" class="ml-1 text-[#838898] transition-transform" :class="openLists[c] && 'rotate-180'" />
                    </button>
                    <span class="max-bs-lg:hidden">{{ column.title }}</span>
                  </template>
                  <template v-else>{{ column.title }}</template>
                </h2>
              </div>

              <ul v-if="column.social" class="flex flex-row justify-center gap-2 mt-0 mb-6 pl-0 leading-[1.8rem] list-none bs-lg:justify-start">
                <li v-for="social in column.social" :key="social.label" class="inline-block">
                  <a :href="social.to" :class="lightFooter ? theme.link : 'text-white hover:text-[#ddd]'">
                    <UIcon :name="social.icon" class="size-8" /><span class="sr-only">{{ social.label }}</span>
                  </a>
                </li>
              </ul>

              <p v-if="column.text" :class="paragraph">{{ column.text }}</p>

              <ul v-if="column.links" :id="`footer-list-${c}`" :class="[list, !openLists[c] && 'max-bs-lg:hidden']">
                <li v-for="link in column.links" :key="link.label">
                  <a :class="theme.link" :href="link.to">{{ link.label }}</a>
                </li>
              </ul>

              <form v-if="column.subscribe" :action="column.subscribe.action" class="w-full" method="post" name="Subscribe to our newsletter">
                <fieldset class="min-w-0">
                  <legend class="sr-only">Subscribe to our newsletter</legend>
                  <label class="sr-only" :for="`footer-email-${c}`">Email</label>
                  <div class="relative flex flex-wrap items-stretch w-full">
                    <input
                      :id="`footer-email-${c}`"
                      type="email"
                      name="email"
                      placeholder="Email"
                      class="relative block flex-[1_1_auto] w-[1%] min-w-0 h-[calc(1.5em+0.75rem+2px)] py-1.5 px-3 text-base font-normal leading-normal text-[#495057] bg-white border border-header-mist rounded-l rounded-r-none transition-[border-color,box-shadow] duration-150 ease-in-out placeholder:text-[#6c757d] focus:z-3 focus:border-[#5e74a0] focus:outline-0 focus:shadow-[0_0_0_0.2rem_rgba(47,58,80,0.25)]"
                    >
                    <button
                      type="submit"
                      name="subscribe"
                      class="relative z-2 -ml-px py-1.5 px-3 font-condensed text-base font-normal leading-normal text-white bg-[#384660] border border-[#384660] rounded-r rounded-l-none cursor-pointer transition-colors duration-150 ease-in-out hover:bg-header-navy hover:border-header-navy focus:z-3 focus:bg-[#000d14] focus:border-[#000507] focus:underline focus:outline-none"
                    >
                      Submit
                    </button>
                  </div>
                </fieldset>
              </form>

              <ul v-if="column.buttons" class="pl-0 mt-0 mb-4 list-none">
                <li v-for="button in column.buttons" :key="button.label">
                  <a
                    class="block w-3/4 mx-auto mb-2 py-1.5 px-3 font-condensed font-bold text-[1.167rem] leading-normal text-center text-white bg-header-sky border border-header-sky rounded transition-colors duration-150 ease-in-out hover:text-white hover:bg-[#226baa] hover:border-[#226baa] hover:no-underline focus:bg-[#226baa] focus:border-[#226baa] focus:underline focus:outline-none"
                    :href="button.to"
                  >{{ button.label }}</a>
                </li>
              </ul>
            </div>
          </div>
        </slot>
      </div>
    </section>

    <!-- Global Footer -->
    <section id="global-footer" class="mt-6 bg-[#252f40]">
      <div :class="container">
        <div class="flex flex-wrap -mx-[15px] py-4 bs-lg:py-6">
          <div class="relative flex items-center justify-center w-full px-[15px] py-4 bs-lg:w-3/12">
            <a href="https://www.usu.edu">
              <img
                class="inline align-middle w-full max-w-[180px] h-auto m-auto md:max-w-[220px]"
                src="https://www.usu.edu/assets/bs4/images/logos/utah-state-logo-350.png"
                width="350"
                height="34"
                alt="Utah State University"
              >
            </a>
          </div>
          <div class="relative flex flex-row justify-center items-start w-full px-[15px] bs-lg:flex-col bs-lg:justify-start bs-lg:w-9/12">
            <div class="text-right bs-lg:text-left bs-lg:my-1">
              <ul :class="footerList">
                <li v-for="link in globalLinks" :key="link.label" :class="footerItem">
                  <a :class="footerLink" :href="link.to">{{ link.label }}</a>
                </li>
              </ul>
            </div>
            <div class="bs-lg:text-[0.9rem]">
              <ul :class="footerList">
                <li v-for="link in legalLinks" :key="link.label" :class="footerItem">
                  <a :class="footerLink" :href="link.to">{{ link.label }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Transition
      enter-active-class="transition-opacity duration-600"
      leave-active-class="transition-opacity duration-600"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <button
        v-show="showBackToTop"
        id="back-to-top"
        type="button"
        class="fixed right-[15px] bottom-[15px] z-6 pt-[6px] px-[12px] pb-[9px] text-[16px] text-white bg-black/50 rounded-[2px] cursor-pointer hover:bg-header-sky focus:bg-header-sky focus:outline-none"
        @click="backToTop"
      >
        <UIcon name="i-fa6-solid-chevron-up" class="align-middle" /><span class="sr-only">Back to top of the page</span>
      </button>
    </Transition>
  </footer>
</template>
