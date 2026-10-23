<script setup lang="ts">
// Vue port of component-alert-card (card-alert-bs4.md)
const props = defineProps<{
  blok: {
    color?: 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'dark'
    header?: string
    body?: any
    button_text?: string
    button_link?: SbLink
  }
}>()

const color = computed(() => props.blok.color || 'primary')

// .bg-{color} on the header; the button uses .btn-{color}
const headerColors: Record<string, string> = {
  primary: 'bg-usu-primary',
  info: 'bg-usu-info',
  success: 'bg-usu-success',
  warning: 'bg-usu-warning',
  danger: 'bg-usu-danger',
  dark: 'bg-usu-dark',
}
</script>

<template>
  <div v-editable="blok" :class="[mocaCard.base, 'mb-4']">
    <!-- .text-bold and .text-white are !important in Bootstrap, so they beat the heading styles -->
    <div :class="[mocaCard.header, mocaHeading.h4, 'font-bold! text-white!', headerColors[color]]">{{ blok.header }}</div>
    <div :class="mocaCard.body">
      <MocaRichText :doc="blok.body" />
    </div>
    <div v-if="blok.button_text" :class="mocaCard.footer">
      <NuxtLink
        :to="mocaLinkHref(blok.button_link) || undefined"
        :target="blok.button_link?.target"
        :class="mocaButtonClass(`btn-${color}`)"
      >
        {{ blok.button_text }}
      </NuxtLink>
    </div>
  </div>
</template>
