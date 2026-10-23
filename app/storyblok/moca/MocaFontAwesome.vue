<script setup lang="ts">
// Vue port of component-font-awesome (font-awesome-icon-bs4.md)
const props = defineProps<{
  blok: {
    icon?: string
    link?: SbLink
    // Link title; "External Link" when empty
    link_title?: string
    sr_only?: string
  }
}>()

const href = computed(() => mocaLinkHref(props.blok.link))
const title = computed(() => props.blok.link_title || 'External Link')
</script>

<template>
  <NuxtLink
    v-if="href"
    v-editable="blok"
    :to="href"
    :target="blok.link?.target"
    :title="title"
    :aria-label="title"
    class="text-usu-info hover:text-usu-info-dark"
  >
    <MocaFaIcon :icon="blok.icon" />
  </NuxtLink>
  <span v-else v-editable="blok">
    <MocaFaIcon :icon="blok.icon" />
    <span v-if="blok.sr_only" class="sr-only">{{ blok.sr_only }}</span>
  </span>
</template>
