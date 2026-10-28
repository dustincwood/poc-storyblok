<script setup>
import { useMediaQuery, useResizeObserver } from '@vueuse/core'

// Contents of one TopNavigation dropdown. Shown as a white panel under the item at lg,
// and inside the slide-out sub-panel below lg, so classes are split with bs-lg: / max-bs-lg:.
const props = defineProps({
  item: { type: Object, required: true },
})

// Static strings so Tailwind can find them
const columnWidths = { 3: 'bs-lg:w-3/12', 4: 'bs-lg:w-4/12', 6: 'bs-lg:w-6/12', 12: 'bs-lg:w-full' }
const linkGroupWidths = { 1: '', 2: 'bs-lg:w-6/12', 3: 'bs-lg:w-4/12' }

const panelClass = computed(() => {
  const base = 'z-1000 py-[15px] text-left text-[#212529] bg-white max-bs-lg:text-[1.1rem] bs-lg:absolute bs-lg:top-full bs-lg:mt-[6px] bs-lg:text-base bs-lg:text-[#343a40] bs-lg:border bs-lg:border-white bs-lg:shadow-[0_-6px_0_#fff,0_1px_6px_rgba(0,0,0,0.2)]'
  if (props.item.mega) return [base, 'w-full px-[10px] pt-[30px] bs-lg:left-0 bs-lg:right-0']
  // Opens rightward from the item, like Bootstrap's .dropdown-menu; items near the right end of
  // the bar set alignRight (.dropdown-menu-right). Minimum widths never exceed the viewport.
  const side = props.item.alignRight ? 'bs-lg:right-0' : 'bs-lg:left-0'
  if (props.item.columns) {
    return [base, 'min-w-full px-[10px] py-[30px] bs-lg:py-[15px]', side, props.item.columns.length > 2 ? 'bs-lg:min-w-[min(710px,calc(100vw_-_2rem))]' : 'bs-lg:min-w-[min(600px,calc(100vw_-_2rem))]']
  }
  return [base, 'min-w-40 bs-lg:min-w-[300px]', side]
})

// A panel opening rightward from an item near the end of the bar can run past the window (3 Columns at
// 1000px). Like Bootstrap's dropdowns (Popper), it shifts left just enough to stay in view, keeping a 1rem
// margin. Measured when it appears: the parent shows it with v-show, which resizes it from 0.
const panel = ref()
const shift = ref(0)
const isDesktop = useMediaQuery('(min-width: 62rem)')
useResizeObserver(panel, () => {
  const el = panel.value
  if (!el || props.item.mega || !isDesktop.value || !el.offsetParent) return
  const margin = 16
  const rect = el.getBoundingClientRect()
  // Where it would be without the current shift
  const left = rect.left + shift.value
  const overflow = left + rect.width - (document.documentElement.clientWidth - margin)
  shift.value = overflow > 0 ? Math.min(overflow, left - margin) : 0
})
const panelStyle = computed(() => shift.value ? { transform: `translateX(-${shift.value}px)` } : undefined)

// Splits a column's links into `linkColumns` side-by-side lists
function linkGroups(column) {
  const count = column.linkColumns ?? 1
  const size = Math.ceil(column.links.length / count)
  return Array.from({ length: count }, (_, i) => column.links.slice(i * size, (i + 1) * size))
}

const link = 'block w-full py-1 font-condensed font-normal text-[1.2rem] text-[#212529] whitespace-normal hover:text-[#226baa] hover:underline focus:text-[#226baa] focus:underline active:text-white active:bg-[#2f3a50] bs-lg:py-[0.1rem] bs-lg:text-base bs-lg:text-[#226baa]'
const columnBorder = 'max-bs-lg:mb-[15px] max-bs-lg:pb-[15px] max-bs-lg:border-b max-bs-lg:border-[#dee2e6] bs-lg:border-r bs-lg:border-header-mist'
</script>

<template>
  <!-- Comments stay inside the root elements: a comment beside a branch makes it a fragment,
       and v-show from TopNavigation then can't hide it during SSR -->
  <ul v-if="item.links" ref="panel" :class="panelClass" :style="panelStyle">
    <!-- Single list, with optional { divider: true } entries -->
    <template v-for="(entry, i) in item.links" :key="i">
      <li v-if="entry.divider" class="h-0 my-2 overflow-hidden border-b border-[#dee2e6] bs-lg:border-b-0 bs-lg:border-t bs-lg:border-header-mist" role="separator" />
      <li v-else class="mb-1">
        <a :class="[link, 'px-6']" :href="entry.to">
          <UIcon v-if="entry.icon" :name="entry.icon" class="mr-2 align-middle" />{{ entry.label }}
        </a>
      </li>
    </template>
  </ul>

  <div v-else ref="panel" :class="panelClass" :style="panelStyle">
    <!-- Columns (multi-column and mega menus), listed in their desktop order -->
    <div class="flex flex-wrap items-center justify-between w-full mx-auto px-[15px]">
      <div class="flex flex-wrap -mx-[15px] bs-lg:grow">
        <div
          v-for="(column, c) in item.columns"
          :key="c"
          class="relative w-full px-[15px] bs-lg:flex bs-lg:flex-col bs-lg:items-stretch"
          :class="[columnWidths[column.width ?? 12 / item.columns.length], c < item.columns.length - 1 && columnBorder]"
        >
          <span v-if="column.title" class="block mb-[10px] font-condensed font-normal text-[1.4rem] text-[#838898] bs-lg:text-[1.2rem] bs-lg:text-[#495057]">
            {{ column.title }}
          </span>
          <p v-if="column.text" class="mb-4">{{ column.text }}</p>
          <p v-if="column.more" class="flex mb-4">
            <a class="ml-auto text-[#226baa] hover:underline bs-lg:text-[#2472b5]" :href="column.more.to">{{ column.more.label }}</a>
          </p>
          <div v-if="column.links" class="flex flex-wrap -mx-[15px]">
            <ul
              v-for="(group, g) in linkGroups(column)"
              :key="g"
              class="relative w-full px-[15px] bs-lg:leading-6"
              :class="linkGroupWidths[column.linkColumns ?? 1]"
            >
              <li v-for="entry in group" :key="entry.label" class="mb-1">
                <a :class="link" :href="entry.to">
                  <UIcon v-if="entry.icon" :name="entry.icon" class="mr-2 align-middle" />{{ entry.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
