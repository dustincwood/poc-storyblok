<script setup lang="ts">
// Vue port of component-button (button-bs4.md)
const props = defineProps<{
  blok: {
    text: string
    link: SbLink
    // btn-primary, btn-info, btn-bright-light, ... (see mocaButtonClass)
    type?: string
    outline?: boolean
    size?: '' | 'btn-sm' | 'btn-lg'
    centered?: boolean
  }
}>()

const buttonClass = computed(() => mocaButtonClass(props.blok.type || 'btn-white', props.blok.outline, props.blok.size))
</script>

<template>
  <div v-if="blok.text" v-editable="blok" :class="blok.centered ? 'text-center' : 'inline-block'">
    <NuxtLink :to="mocaLinkHref(blok.link) || undefined" :target="blok.link?.target" :class="buttonClass">
      {{ blok.text }}
    </NuxtLink>
  </div>
</template>
