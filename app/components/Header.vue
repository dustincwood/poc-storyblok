<script setup>
// Vue port of z_Dustin_Wood/xsl/parts/header-1.xsl.
// The CMS includes become props/slots: _siteLogo.inc -> siteName/parentName (or the #site-logo slot),
// _callToAction.inc -> the #call-to-action slot.
const props = defineProps({
  hideTopLinks: { type: Boolean, default: false },
  showUsuLogo: { type: Boolean, default: true },
  siteName: { type: String, default: 'Site Name' },
  siteUrl: { type: String, default: '/' },
  parentName: { type: String, default: 'Parent Organization' },
  parentUrl: { type: String, default: '#' },
  // Adds the "This site" search option when set
  siteSearchUrl: { type: String, default: '' },
})

const slots = useSlots()
const hasUnit = computed(() => !!props.siteName || !!slots['site-logo'])

const quickLinks = [
  { label: 'Apply', to: 'https://www.usu.edu/apply/' },
  { label: 'Visit', to: 'https://www.usu.edu/visit/' },
  { label: 'Give', to: 'https://www.usu.edu/advancement/' },
  { label: 'Calendar', to: 'https://www.usu.edu/calendar/' },
  { label: 'A-Z Index', to: 'https://www.usu.edu/azindex/' },
  { label: 'Directory', to: 'https://directory.usu.edu/' },
  { label: 'Libraries', to: 'https://library.usu.edu/' },
]

// Quick links panel (Bootstrap collapse in the original)
const quickLinksOpen = ref(false)
const quickLinksToggle = ref(null)

function closeQuickLinks() {
  if (!quickLinksOpen.value) return
  quickLinksOpen.value = false
  quickLinksToggle.value?.focus()
}

// Search overlay. Each option sets the form action and the input placeholder, as init.js did.
// Shared with TopNavigation.vue, whose mobile menu also opens the search overlay
const searchOpen = useState('search-open', () => false)
const searchTerms = ref('')

const searchOptions = computed(() => [
  { id: 'all_sites', label: 'All USU sites', placeholder: 'Search USU sites', action: 'https://www.usu.edu/search/' },
  ...(props.siteSearchUrl
    ? [{ id: 'this_site', label: 'This site', placeholder: 'Search this site', action: props.siteSearchUrl }]
    : []),
  { id: 'people', label: 'People', placeholder: 'Search people', action: 'https://www.usu.edu/directory/' },
])
const searchType = ref('all_sites')
const selectedSearch = computed(() => searchOptions.value.find(o => o.id === searchType.value) ?? searchOptions.value[0])

function submitSearch() {
  const url = `${selectedSearch.value.action}?q=${encodeURIComponent(searchTerms.value)}`
  return navigateTo(url, { external: true })
}

const navLink = 'flex items-center gap-2 m-0 py-2 px-2 font-condensed font-normal text-[80%] text-white uppercase cursor-pointer aria-expanded:bg-header-slate hover:bg-header-sky hover:no-underline focus-visible:bg-header-sky'
const quickLink = 'text-header-mist hover:text-white hover:underline focus:text-white focus:underline'
const container = 'w-full mx-auto px-[15px] xl:max-w-[1320px]'
const row = 'flex flex-wrap -mx-[15px]'
</script>

<template>
  <div id="site-header" class="hidden lg:block bg-header-navy">
    <!-- Header Navigation -->
    <nav
      v-if="!hideTopLinks"
      id="site-header-nav"
      class="p-0 m-0 bg-header-navy"
      aria-label="Quick Menu"
      @keydown.esc="closeQuickLinks"
    >
      <!-- grid-rows 0fr -> 1fr animates the panel to its natural height; inert keeps closed links out of the tab order -->
      <div
        id="header-quicklinks"
        class="grid transition-[grid-template-rows] duration-350 ease-[ease] motion-reduce:transition-none"
        :class="quickLinksOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        :inert="!quickLinksOpen"
      >
        <div class="overflow-hidden bg-header-slate text-white">
          <div :class="container">
            <div :class="row">
              <div class="relative flex justify-end grow basis-0 min-w-0 max-w-full w-full px-[15px] py-4">
                <ul class="m-0 mr-4 pl-0 list-none text-[80%] font-normal">
                  <li v-for="link in quickLinks" :key="link.label" class="inline-block not-last:mr-2">
                    <a :class="quickLink" :href="link.to">{{ link.label }}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="relative flex flex-nowrap items-center justify-start py-0 my-0 px-4">
        <!-- The links sit absolutely over the top of the brand area, so this bar has no height of its own -->
        <div class="relative flex flex-nowrap items-center justify-between w-full mx-auto px-0 xl:max-w-[1320px]">
          <div class="absolute inset-x-0 top-0 z-1 flex grow basis-auto items-center justify-end">
            <ul class="flex flex-row pl-0 mb-0 list-none">
              <li>
                <button
                  id="quick-links"
                  ref="quickLinksToggle"
                  type="button"
                  :class="navLink"
                  aria-controls="header-quicklinks"
                  :aria-expanded="quickLinksOpen"
                  @click="quickLinksOpen = !quickLinksOpen"
                >
                  <UIcon name="i-fa6-solid-list" />Quick Links
                </button>
              </li>
              <li>
                <a :class="navLink" href="https://my.usu.edu"><UIcon name="i-fa6-solid-user" />MyUSU</a>
              </li>
              <li>
                <button
                  id="header-search-btn"
                  type="button"
                  :class="navLink"
                  aria-haspopup="dialog"
                  @click="searchOpen = true"
                >
                  <UIcon name="i-fa6-solid-magnifying-glass" />Search
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>

    <!-- Header Brand -->
    <div :class="container">
      <div :class="row">
        <div class="flex flex-row min-h-[120px] pt-2 ml-4">
          <a v-if="showUsuLogo" class="self-center" href="https://www.usu.edu/">
            <img
              class="inline align-middle h-[29px] w-auto"
              src="https://www.usu.edu/assets/bs4/images/logos/utah-state-logo.svg"
              width="300"
              height="29"
              alt="Utah State University logo"
            >
          </a>

          <div
            v-if="hasUnit"
            class="flex flex-col self-center justify-center ml-4 pl-4 text-header-steel border-l-2 border-header-steel hover:text-white"
          >
            <slot name="site-logo">
              <NuxtLink
                class="font-condensed text-left text-[1.4rem] leading-[1.7rem] text-header-steel hover:text-white hover:underline xl:text-[1.6rem] xl:leading-8"
                :to="siteUrl"
              >
                {{ siteName }}
              </NuxtLink>
              <!-- #15436a is Bootstrap's link hover color; production shows it here too -->
              <NuxtLink
                v-if="parentName"
                class="font-condensed text-[1.1rem] leading-[1.4rem] text-white hover:text-[#15436a] hover:underline xl:text-[1.15rem]"
                :to="parentUrl"
              >
                {{ parentName }}
              </NuxtLink>
            </slot>
          </div>
        </div>

        <div v-if="$slots['call-to-action']" class="flex self-end ml-auto p-4 font-condensed text-[1.25rem] leading-normal text-white">
          <slot name="call-to-action" />
        </div>
      </div>
    </div>
  </div>

  <!-- Search Overlay: UModal supplies the focus trap, Esc to close and focus return to the Search button -->
  <UModal
    v-model:open="searchOpen"
    fullscreen
    title="Search Utah State University"
    description="Choose where to search, then enter your search terms."
    :ui="{ overlay: 'z-50', content: 'z-50 bg-header-sky font-system ring-0 divide-y-0' }"
  >
    <template #content="{ close }">
      <div class="relative flex">
        <button
          id="close-search"
          type="button"
          class="flex ml-auto m-4 p-2 font-condensed font-normal text-[1.25rem] leading-normal text-white cursor-pointer bg-transparent border border-transparent rounded-[0.3rem] hover:text-header-navy focus:text-header-navy focus:outline-none"
          @click="close"
        >
          <span class="sr-only">Close search</span><UIcon name="i-fa6-solid-xmark" />
        </button>
      </div>
      <div :class="container">
        <div :class="[row, 'justify-center']">
          <form
            id="search_form"
            class="relative w-full px-[15px] sm:w-10/12 lg:w-8/12"
            :action="selectedSearch.action"
            method="get"
            @submit.prevent="submitSearch"
          >
            <h2 class="my-12 font-condensed font-bold leading-none text-[1.5rem] lg:text-[1.8rem] text-header-navy">
              Search Utah State University:
            </h2>
            <fieldset class="min-w-0">
              <legend class="sr-only">I want to search</legend>
              <div v-for="option in searchOptions" :key="option.id" class="relative inline-flex min-h-6 pl-6 mr-4">
                <input
                  :id="option.id"
                  v-model="searchType"
                  type="radio"
                  name="search_type"
                  class="peer absolute left-0 -z-1 w-4 h-5 opacity-0"
                  :value="option.id"
                >
                <!-- Bootstrap 4 custom-radio: before: is the circle, after: the white dot when checked -->
                <label
                  :for="option.id"
                  class="relative inline-block mb-0 align-top font-condensed font-medium leading-none text-[1.25rem] text-white before:absolute before:top-1 before:-left-6 before:block before:size-4 before:pointer-events-none before:bg-white before:border before:border-[#adb5bd] before:rounded-full before:transition-[background-color,border-color,box-shadow] before:duration-150 before:ease-in-out after:absolute after:top-[9px] after:-left-[19px] after:size-1.5 after:rounded-full after:bg-white after:opacity-0 peer-checked:before:bg-[#2f3a50] peer-checked:before:border-[#2f3a50] peer-checked:after:opacity-100 peer-focus-visible:before:shadow-[0_0_0_0.2rem_rgba(47,58,80,0.25)] peer-[:focus:not(:checked)]:before:border-[#5e74a0]"
                >{{ option.label }}</label>
              </div>
            </fieldset>
            <div class="relative flex items-stretch w-full my-4">
              <label for="search_terms" class="sr-only">Search terms</label>
              <input
                id="search_terms"
                v-model="searchTerms"
                type="text"
                name="q"
                class="block flex-1 min-w-0 h-10 lg:h-15 py-1.5 px-3 text-[1.4rem] lg:text-[1.8rem] font-normal leading-normal text-white bg-transparent border-0 border-b border-header-mist rounded-none placeholder:text-white placeholder:opacity-100 focus:outline-none"
                :placeholder="selectedSearch.placeholder"
                autofocus
              >
              <button
                id="submit-search"
                type="submit"
                class="py-1.5 px-3 text-base text-white cursor-pointer bg-transparent border-0 border-b border-header-mist rounded-none hover:text-header-navy focus:text-header-navy focus:outline-none"
              >
                <span class="sr-only">Submit search</span><UIcon name="i-fa6-solid-magnifying-glass" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </UModal>
</template>
