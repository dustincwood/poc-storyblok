<script setup lang="ts">
// A plain wrapper for spacing and alignment, for hand-written <div class="mb-4"> / <div class="text-center">,
// and the styled boxes built from utilities: <div class="p-3 rounded border bg-info text-white h-100">
const props = defineProps<{
  blok: {
    // Bootstrap spacers 0-5
    margin_top?: string
    margin_bottom?: string
    // Space inside, above and below (.py-*): unlike margins, it doesn't collapse into neighbours' margins
    padding_y?: string
    // Space inside on all sides (.p-*)
    padding?: string
    // A Bootstrap background class (mocaBg): bg-white, bg-light, bg-info, ...
    background?: string
    border?: boolean
    rounded?: boolean
    // White text (.text-white); headings and links inside turn white too
    text_white?: boolean
    // Fills its column's height (.h-100), so boxes in a row line up
    full_height?: boolean
    text_align?: '' | 'center' | 'right'
    content?: any[]
  }
}>()

const aligns: Record<string, string> = { center: 'text-center', right: 'text-right' }
// On a dark background, or with white text, headings inside are white (MocaRichText, MocaHeading read it)
const lightText = computed(() => props.blok.text_white || mocaDarkBg.includes(props.blok.background ?? ''))
</script>

<template>
  <div
    v-editable="blok"
    :style="lightText ? { '--moca-heading': '#fff' } : undefined"
    :class="[
      mocaSpace('mt', blok.margin_top),
      mocaSpace('mb', blok.margin_bottom),
      mocaSpace('p', blok.padding),
      mocaSpace('py', blok.padding_y),
      mocaBg[blok.background ?? ''],
      blok.border && 'border border-usu-gray-300',
      blok.rounded && 'rounded',
      blok.text_white && 'text-white [&_a]:text-white! [&_:is(h1,h2,h3,h4,h5,h6)]:text-white!',
      blok.full_height && 'h-full',
      aligns[blok.text_align ?? ''],
    ]"
  >
    <StoryblokComponent v-for="b in blok.content" :key="b._uid" :blok="b" />
  </div>
</template>
