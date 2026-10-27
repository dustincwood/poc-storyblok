<script setup lang="ts">
// A colored header bar over a bordered list, as hand-written on usu.edu:
// <div class="card border-0"><h3 class="h4 text-white card-header bg-primary">Resources</h3>
// <ul class="list-group list-group-flush border"><li class="list-group-item"><a>...</a></li></ul></div>
const props = defineProps<{
  blok: {
    title?: string
    // mocaColors name for the header bar
    header_color?: string
    // A bulleted list; each item becomes a row
    body?: any
  }
}>()

// .list-group-flush rows inside a .border box
const list = [
  '[&_ul]:list-none! [&_ul]:p-0! [&_ul]:m-0! [&_ul]:border [&_ul]:border-usu-gray-300',
  '[&_li]:px-5 [&_li]:py-3 [&_li]:bg-white [&_li+li]:border-t [&_li+li]:border-black/[.125] [&_li_p]:mb-0',
]
</script>

<template>
  <div v-editable="blok" class="relative flex flex-col w-full min-w-0 break-words">
    <h3
      v-if="blok.title"
      :class="[mocaHeading.h4, 'm-0 px-5 py-3 text-white! rounded-t-[calc(.25rem-1px)]', mocaColors[blok.header_color ?? '']?.bg ?? 'bg-usu-primary']"
    >
      {{ blok.title }}
    </h3>
    <MocaRichText :doc="blok.body" :class="list" />
  </div>
</template>
