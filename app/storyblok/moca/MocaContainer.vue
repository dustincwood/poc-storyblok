<script setup lang="ts">
// Bootstrap .container (with the usu.edu widths) and its vertical spacing, e.g. "container my-5"
const props = defineProps<{
  blok: {
    width?: 'default' | 'narrow' | 'fluid'
    // Bootstrap spacers 0-5
    margin_y?: string
    padding_y?: string
    content?: any[]
  }
}>()

const widthClass = computed(() => props.blok.width === 'fluid'
  ? 'w-full mx-auto px-[15px]'
  : mocaContainer(props.blok.width === 'narrow'))
</script>

<template>
  <div v-editable="blok" :class="[widthClass, mocaSpace('my', blok.margin_y), mocaSpace('py', blok.padding_y)]">
    <StoryblokComponent v-for="b in blok.content" :key="b._uid" :blok="b" />
  </div>
</template>
