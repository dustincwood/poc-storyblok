<script setup>
// Contents of one TopNavigation dropdown. Shown as a white panel under the item at lg,
// and inside the slide-out sub-panel below lg, so classes are split with lg: / max-lg:.
const props = defineProps({
  item: { type: Object, required: true },
})

// Static strings so Tailwind can find them
const columnWidths = { 3: 'lg:w-3/12', 4: 'lg:w-4/12', 6: 'lg:w-6/12', 12: 'lg:w-full' }
const linkGroupWidths = { 1: '', 2: 'lg:w-6/12', 3: 'lg:w-4/12' }

const panelClass = computed(() => {
  const base = 'z-1000 py-[15px] text-left text-[#212529] bg-white max-lg:text-[1.1rem] lg:absolute lg:top-full lg:mt-[6px] lg:text-base lg:text-[#343a40] lg:border lg:border-white lg:shadow-[0_-6px_0_#fff,0_1px_6px_rgba(0,0,0,0.2)]'
  if (props.item.mega) return [base, 'w-full px-[10px] pt-[30px] lg:left-0 lg:right-0']
  // Opens rightward from the item, like Bootstrap's .dropdown-menu; items near the right end of
  // the bar set alignRight (.dropdown-menu-right). Minimum widths never exceed the viewport.
  const side = props.item.alignRight ? 'lg:right-0' : 'lg:left-0'
  if (props.item.columns) {
    return [base, 'min-w-full px-[10px] py-[30px] lg:py-[15px]', side, props.item.columns.length > 2 ? 'lg:min-w-[min(710px,calc(100vw_-_2rem))]' : 'lg:min-w-[min(600px,calc(100vw_-_2rem))]']
  }
  return [base, 'min-w-40 lg:min-w-[300px]', side]
})

// Splits a column's links into `linkColumns` side-by-side lists
function linkGroups(column) {
  const count = column.linkColumns ?? 1
  const size = Math.ceil(column.links.length / count)
  return Array.from({ length: count }, (_, i) => column.links.slice(i * size, (i + 1) * size))
}

const link = 'block w-full py-1 font-condensed font-normal text-[1.2rem] text-[#212529] whitespace-normal hover:text-[#226baa] hover:underline focus:text-[#226baa] focus:underline active:text-white active:bg-[#2f3a50] lg:py-[0.1rem] lg:text-base lg:text-[#226baa]'
const columnBorder = 'max-lg:mb-[15px] max-lg:pb-[15px] max-lg:border-b max-lg:border-[#dee2e6] lg:border-r lg:border-header-mist'
</script>

<template>
  <!-- Comments stay inside the root elements: a comment beside a branch makes it a fragment,
       and v-show from TopNavigation then can't hide it during SSR -->
  <ul v-if="item.links" :class="panelClass">
    <!-- Single list, with optional { divider: true } entries -->
    <template v-for="(entry, i) in item.links" :key="i">
      <li v-if="entry.divider" class="h-0 my-2 overflow-hidden border-b border-[#dee2e6] lg:border-b-0 lg:border-t lg:border-header-mist" role="separator" />
      <li v-else class="mb-1">
        <a :class="[link, 'px-6']" :href="entry.to">
          <UIcon v-if="entry.icon" :name="entry.icon" class="mr-2 align-middle" />{{ entry.label }}
        </a>
      </li>
    </template>
  </ul>

  <div v-else :class="panelClass">
    <!-- Columns (multi-column and mega menus), listed in their desktop order -->
    <div class="flex flex-wrap items-center justify-between w-full mx-auto px-[15px]">
      <div class="flex flex-wrap -mx-[15px] lg:grow">
        <div
          v-for="(column, c) in item.columns"
          :key="c"
          class="relative w-full px-[15px] lg:flex lg:flex-col lg:items-stretch"
          :class="[columnWidths[column.width ?? 12 / item.columns.length], c < item.columns.length - 1 && columnBorder]"
        >
          <span v-if="column.title" class="block mb-[10px] font-condensed font-normal text-[1.4rem] text-[#838898] lg:text-[1.2rem] lg:text-[#495057]">
            {{ column.title }}
          </span>
          <p v-if="column.text" class="mb-4">{{ column.text }}</p>
          <p v-if="column.more" class="flex mb-4">
            <a class="ml-auto text-[#226baa] hover:underline lg:text-[#2472b5]" :href="column.more.to">{{ column.more.label }}</a>
          </p>
          <div v-if="column.links" class="flex flex-wrap -mx-[15px]">
            <ul
              v-for="(group, g) in linkGroups(column)"
              :key="g"
              class="relative w-full px-[15px] lg:leading-6"
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
