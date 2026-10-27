<script setup lang="ts">
// A rounded, bordered box whose title sits on its top border, as written by hand on usu.edu pages:
// <div class="border rounded p-4 my-5"><div class="text-center mt-n5 mb-4 pt-1 mx-4"><span class="h2 ...">.
// The title's background is the surrounding MocaBand color (--moca-band-bg), white outside a band.
const props = defineProps<{
  blok: {
    title?: string
    title_color?: 'info' | 'primary' | 'slate' | 'white'
    title_bold?: boolean
    border_color?: '' | 'bright-light' | 'info' | 'primary'
    // Bootstrap spacers 0-5 above and below the box
    margin_top?: string
    margin_bottom?: string
    content?: any[]
  }
}>()

const titleColors: Record<string, string> = {
  info: 'text-usu-info!',
  primary: 'text-usu-primary!',
  slate: 'text-usu-slate!',
  white: 'text-white!',
}
const borderColors: Record<string, string> = {
  'bright-light': 'border-usu-bright-light',
  'info': 'border-usu-info',
  'primary': 'border-usu-primary',
}
</script>

<template>
  <div
    v-editable="blok"
    :class="[
      'p-6 border rounded',
      borderColors[blok.border_color ?? ''] ?? 'border-usu-gray-300',
      mocaSpace('mt', blok.margin_top ?? '5'),
      mocaSpace('mb', blok.margin_bottom ?? '5'),
    ]"
  >
    <div v-if="blok.title" class="-mt-12 mb-6 pt-1 mx-6 text-center">
      <span
        :class="[
          mocaHeading.h2,
          // Inline like the original span: the vertical padding paints the background without adding height
          'px-6 py-4 bg-[var(--moca-band-bg,#fff)]',
          titleColors[blok.title_color ?? ''] ?? '',
          blok.title_bold && 'font-bold!',
        ]"
      >{{ blok.title }}</span>
    </div>
    <StoryblokComponent v-for="b in blok.content" :key="b._uid" :blok="b" />
  </div>
</template>
