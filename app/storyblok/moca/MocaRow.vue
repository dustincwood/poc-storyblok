<script setup lang="ts">
// Bootstrap 4 .row: a wrapping flex row of moca-column blocks with 30px gutters
const props = defineProps<{
  blok: {
    columns?: any[]
    // .justify-content-*
    justify?: '' | 'start' | 'center' | 'end' | 'between' | 'around'
    // .align-items-*
    align?: '' | 'start' | 'center' | 'end'
    // Bootstrap spacer 0-5 above and below (.py-*)
    padding_y?: string
  }
}>()

const justifyClasses: Record<string, string> = {
  start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between', around: 'justify-around',
}
const alignClasses: Record<string, string> = { start: 'items-start', center: 'items-center', end: 'items-end' }
</script>

<template>
  <div v-editable="blok" :class="['flex flex-wrap -mx-[15px]', justifyClasses[blok.justify ?? ''], alignClasses[blok.align ?? ''], mocaSpace('py', blok.padding_y)]">
    <StoryblokComponent v-for="b in blok.columns" :key="b._uid" :blok="b" />
  </div>
</template>
