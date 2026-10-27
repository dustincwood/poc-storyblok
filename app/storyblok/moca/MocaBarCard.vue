<script setup lang="ts">
// A white card with a colored title and a colored bar along its bottom edge, as hand-written on usu.edu:
// <div class="card w-100"><div class="card-body"><h3 class="text-primary">...</h3>...</div>
// <div class="bg-primary rounded-bottom mb-0 py-2"></div></div>
const props = defineProps<{
  blok: {
    title?: string
    // mocaColors names (primary, blue, info, bright-light, ...)
    title_color?: string
    body?: any
    bar_color?: string
  }
}>()
</script>

<template>
  <div v-editable="blok" :class="mocaCard.base">
    <div :class="mocaCard.body">
      <h3 v-if="blok.title" :class="[mocaHeading.h3, 'mt-0 mb-2', mocaColors[blok.title_color ?? '']?.text]">{{ blok.title }}</h3>
      <MocaRichText :doc="blok.body" class="[&_ul]:pl-4!" />
    </div>
    <div v-if="blok.bar_color" :class="['py-2 rounded-b-[calc(.25rem-1px)]', mocaColors[blok.bar_color]?.bg]" />
  </div>
</template>
