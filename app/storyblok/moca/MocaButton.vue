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
    // Full width (.btn-block)
    block?: boolean
    // Fills its column's height with the label centered (.h-100.d-flex.justify-content-center.align-items-center),
    // so a row of buttons stays even when some labels wrap
    fill_height?: boolean
  }
}>()

const buttonClass = computed(() => [
  mocaButtonClass(props.blok.type || 'btn-white', props.blok.outline, props.blok.size, props.blok.block),
  props.blok.fill_height && 'h-full flex! items-center justify-center',
])
</script>

<template>
  <div
    v-if="blok.text"
    v-editable="blok"
    :class="[blok.block ? 'w-full' : blok.centered ? 'text-center' : 'inline-block', blok.fill_height && 'h-full']"
  >
    <NuxtLink :to="mocaLinkHref(blok.link) || undefined" :target="blok.link?.target" :class="buttonClass">
      {{ blok.text }}
    </NuxtLink>
  </div>
</template>
