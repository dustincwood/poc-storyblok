<script setup lang="ts">
// A plain wrapper for spacing and alignment, for hand-written <div class="mb-4"> / <div class="text-center">
const props = defineProps<{
  blok: {
    // Bootstrap spacers 0-5
    margin_top?: string
    margin_bottom?: string
    text_align?: '' | 'center' | 'right'
    content?: any[]
  }
}>()

const aligns: Record<string, string> = { center: 'text-center', right: 'text-right' }
</script>

<template>
  <div v-editable="blok" :class="[mocaSpace('mt', blok.margin_top), mocaSpace('mb', blok.margin_bottom), aligns[blok.text_align ?? '']]">
    <StoryblokComponent v-for="b in blok.content" :key="b._uid" :blok="b" />
  </div>
</template>
