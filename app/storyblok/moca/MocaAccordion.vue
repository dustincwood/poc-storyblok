<script setup lang="ts">
// Vue port of component-transform (accordion-and-tabs-up-to-15-bs4.md).
// display: accordion (default), tabs, or pills. Each panel is a moca-accordion-panel blok rendered here.
// Tabs collapse into an accordion below 992px, as .tab-content-responsive does on usu.edu.
const props = defineProps<{
  blok: {
    display?: 'accordion' | 'tabs' | 'pills'
    panels?: {
      _uid: string
      title?: string
      content?: any
    }[]
  }
}>()

const id = useId()
const panels = computed(() => props.blok.panels ?? [])
// Accordion shows panels with a title or content; tabs and pills only panels with content
const accordionPanels = computed(() => panels.value.filter(p => p.title || hasRichText(p.content)))
const contentPanels = computed(() => panels.value.filter(p => hasRichText(p.content)))

// Accordion: all closed, one open at a time (data-parent)
const openPanel = ref<string | null>(null)
// Tabs and pills: the first is active. Below 992px, tab panes are an accordion with the first open.
const activePanel = ref(contentPanels.value[0]?._uid)
const openTabPanel = ref<string | null>(contentPanels.value[0]?._uid ?? null)
// Falls back to the first panel if the active one is removed while editing
const active = computed(() =>
  contentPanels.value.some(p => p._uid === activePanel.value) ? activePanel.value : contentPanels.value[0]?._uid,
)

function toggleAccordion(uid: string) {
  openPanel.value = openPanel.value === uid ? null : uid
}

function toggleTab(uid: string) {
  openTabPanel.value = openTabPanel.value === uid ? null : uid
}

const collapseClass = (open: boolean) => [
  'grid transition-[grid-template-rows] duration-[350ms] ease-in-out',
  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
]

// .accordion .card-header .btn and .tab-content .card .btn[data-toggle=collapse]
const headerButton = 'flex grow w-full justify-between gap-2 px-3 py-1.5 text-left font-condensed font-normal text-[1.1rem] leading-normal text-usu-navy cursor-pointer focus:underline focus:outline-none aria-expanded:focus:no-underline'
</script>

<template>
  <!-- Tabs -->
  <div v-if="blok.display === 'tabs'" v-editable="blok">
    <ul class="hidden bs-lg:flex flex-wrap border-b border-usu-gray-300" role="tablist">
      <li v-for="(panel, i) in contentPanels" :key="panel._uid" class="-mb-px" role="presentation">
        <button
          :id="`${id}-tab-${i}`"
          type="button"
          role="tab"
          :aria-selected="active === panel._uid"
          :aria-controls="`${id}-pane-${i}`"
          :class="[
            'block px-4 py-2 border rounded-t font-condensed text-[1.1rem] cursor-pointer',
            active === panel._uid
              ? 'text-usu-gray-darker bg-white border-usu-gray-300 border-b-white'
              : 'text-usu-info border-transparent hover:bg-usu-gray-200 hover:text-usu-slate hover:border-usu-gray-200 hover:border-b-usu-gray-300 focus:bg-usu-gray-200 focus:text-usu-slate',
          ]"
          @click="activePanel = panel._uid"
        >
          {{ panel.title || `Tab Title ${i + 1}` }}
        </button>
      </li>
    </ul>

    <div>
      <div
        v-for="(panel, i) in contentPanels"
        :id="`${id}-pane-${i}`"
        :key="panel._uid"
        v-editable="panel"
        role="tabpanel"
        :aria-labelledby="`${id}-tab-${i}`"
        :class="[
          'relative flex flex-col bg-white border border-black/[.125] rounded mb-[5px] bs-lg:mb-0 bs-lg:border-t-0',
          active !== panel._uid && 'bs-lg:hidden',
        ]"
      >
        <div class="bs-lg:hidden border-b border-black/[.125]">
          <div class="m-0">
            <button
              type="button"
              :class="headerButton"
              :aria-expanded="openTabPanel === panel._uid"
              @click="toggleTab(panel._uid)"
            >
              {{ panel.title || `Tab Title ${i + 1}` }}
              <UIcon
                name="i-fa6-solid-caret-down"
                :class="['self-center shrink-0 size-[1em]', openTabPanel === panel._uid && 'rotate-180']"
              />
            </button>
          </div>
        </div>
        <div :class="[collapseClass(openTabPanel === panel._uid), 'bs-lg:grid-rows-[1fr]', openTabPanel !== panel._uid && 'max-bs-lg:invisible']">
          <div class="overflow-hidden">
            <MocaRichText :doc="panel.content" class="p-5" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Pills -->
  <div v-else-if="blok.display === 'pills'" v-editable="blok" class="flex flex-wrap -mx-[15px]">
    <div class="w-full px-[15px] bs-lg:w-1/4">
      <div class="flex flex-col font-condensed text-[1.1rem]" role="tablist" aria-orientation="vertical">
        <button
          v-for="(panel, i) in contentPanels"
          :id="`${id}-pill-${i}`"
          :key="panel._uid"
          type="button"
          role="tab"
          :aria-selected="active === panel._uid"
          :aria-controls="`${id}-pill-pane-${i}`"
          :class="[
            'block px-4 py-2 rounded text-left cursor-pointer',
            active === panel._uid ? 'text-white bg-usu-blue-dark' : 'text-usu-info hover:text-usu-info-dark',
          ]"
          @click="activePanel = panel._uid"
        >
          {{ panel.title || `Pill Title ${i + 1}` }}
        </button>
      </div>
    </div>
    <div class="w-full px-[15px] bs-lg:w-3/4">
      <template v-for="(panel, i) in contentPanels" :key="panel._uid">
        <div
          v-if="active === panel._uid"
          :id="`${id}-pill-pane-${i}`"
          v-editable="panel"
          role="tabpanel"
          :aria-labelledby="`${id}-pill-${i}`"
        >
          <MocaRichText :doc="panel.content" />
        </div>
      </template>
    </div>
  </div>

  <!-- Accordion (.accordion.accordion-caret) -->
  <div v-else v-editable="blok">
    <div v-for="(panel, i) in accordionPanels" :key="panel._uid" v-editable="panel" class="relative flex flex-col my-4 bg-white overflow-hidden">
      <div class="p-1 bg-usu-gray-200">
        <h2 class="m-0">
          <button
            :id="`${id}-heading-${i}`"
            type="button"
            :class="[headerButton, 'hover:text-usu-info focus:text-usu-info']"
            :aria-expanded="openPanel === panel._uid"
            :aria-controls="`${id}-collapse-${i}`"
            @click="toggleAccordion(panel._uid)"
          >
            {{ panel.title || `Accordion Title ${i + 1}` }}
            <UIcon
              name="i-fa6-solid-caret-down"
              :class="['self-center shrink-0 size-[1em] text-usu-gray-dark transition-transform duration-500', openPanel === panel._uid && 'rotate-180']"
            />
          </button>
        </h2>
      </div>
      <div
        :id="`${id}-collapse-${i}`"
        role="region"
        :aria-labelledby="`${id}-heading-${i}`"
        :inert="openPanel !== panel._uid"
        :class="collapseClass(openPanel === panel._uid)"
      >
        <div class="overflow-hidden">
          <MocaRichText :doc="panel.content" class="p-5 bg-usu-gray-100" />
        </div>
      </div>
    </div>
  </div>
</template>
