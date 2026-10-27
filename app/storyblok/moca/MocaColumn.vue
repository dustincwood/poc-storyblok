<script setup lang="ts">
// Bootstrap 4 column inside a moca-row. Widths are per breakpoint, like col-12 col-md col-lg-4:
// a number of twelfths, auto (.col, equal share) or content (.col-auto). Empty inherits the smaller one.
const props = defineProps<{
  blok: {
    width?: string
    width_sm?: string
    width_md?: string
    width_lg?: string
    width_xl?: string
    // .order-* and .order-lg-*
    order?: '' | 'first' | 'last' | '1' | '2' | '3'
    order_lg?: '' | 'first' | 'last' | '1' | '2' | '3'
    // Bootstrap spacers 0-5 (mt-*, mb-*)
    margin_top?: string
    margin_bottom?: string
    // .d-flex: lets a card inside fill the column's height, so cards in a row line up
    stretch?: boolean
    // lg-up: only from 992px (.d-none .d-lg-block); below-lg: only under 992px (.d-lg-none)
    display?: '' | 'lg-up' | 'below-lg'
    // .align-self-*
    align_self?: '' | 'start' | 'center' | 'end'
    text_align?: '' | 'center'
    // .mx-n5 with z-index 3: overlaps its neighbors, e.g. arrows between step cards
    overlap?: boolean
    content?: any[]
  }
}>()

const displays: Record<string, string> = { 'lg-up': 'hidden bs-lg:block', 'below-lg': 'bs-lg:hidden' }
const alignSelf: Record<string, string> = { start: 'self-start', center: 'self-center', end: 'self-end' }

const orders: Record<string, Record<string, string>> = {
  '': { first: 'order-first', last: 'order-last', 1: 'order-1', 2: 'order-2', 3: 'order-3' },
  'lg': { first: 'bs-lg:order-first', last: 'bs-lg:order-last', 1: 'bs-lg:order-1', 2: 'bs-lg:order-2', 3: 'bs-lg:order-3' },
}

const columnClass = computed(() => [
  'relative w-full px-[15px]',
  mocaColumnWidths['']![props.blok.width ?? ''],
  mocaColumnWidths.sm![props.blok.width_sm ?? ''],
  mocaColumnWidths.md![props.blok.width_md ?? ''],
  mocaColumnWidths.lg![props.blok.width_lg ?? ''],
  mocaColumnWidths.xl![props.blok.width_xl ?? ''],
  orders['']![props.blok.order ?? ''],
  orders.lg![props.blok.order_lg ?? ''],
  mocaSpace('mt', props.blok.margin_top),
  mocaSpace('mb', props.blok.margin_bottom),
  // stretch's flex replaces display's block; a column hidden below lg stays hidden
  props.blok.stretch ? (props.blok.display === 'lg-up' ? 'hidden bs-lg:flex' : 'flex') : displays[props.blok.display ?? ''],
  props.blok.stretch && props.blok.display === 'below-lg' && 'bs-lg:hidden',
  alignSelf[props.blok.align_self ?? ''],
  props.blok.text_align === 'center' && 'text-center',
  props.blok.overlap && '-mx-12 z-3',
])
</script>

<template>
  <div v-editable="blok" :class="columnClass">
    <StoryblokComponent v-for="b in blok.content" :key="b._uid" :blok="b" />
  </div>
</template>
