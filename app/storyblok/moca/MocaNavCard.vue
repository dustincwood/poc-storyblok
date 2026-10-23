<script setup lang="ts">
// Vue port of component-nav-card (card-navigation-bs4.md)
const props = defineProps<{
  blok: {
    color?: 'None' | 'Primary' | 'Info'
    title?: string
    body?: any
    button?: any[]
  }
}>()

const accentColors: Record<string, string> = {
  Primary: 'bg-usu-primary',
  Info: 'bg-usu-info',
}
</script>

<template>
  <div v-editable="blok" :class="[mocaCard.base, 'mb-4']">
    <div :class="mocaCard.body">
      <div v-if="blok.title" :class="[mocaHeading.h3, 'mb-2 font-bold!']">{{ blok.title }}</div>
      <MocaRichText :doc="blok.body" />
    </div>
    <!-- .nav-card footer: no top border, button aligned right -->
    <div class="px-5 py-3 flex flex-wrap justify-end">
      <StoryblokComponent v-for="b in blok.button" :key="b._uid" :blok="b" />
    </div>
    <!-- .card-footer.p-2.border-0: a 1rem color bar (white when the color is None) -->
    <div :class="['p-2 rounded-b-[calc(.25rem-1px)]', accentColors[blok.color ?? '']]" />
  </div>
</template>
