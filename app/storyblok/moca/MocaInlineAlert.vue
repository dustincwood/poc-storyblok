<script setup lang="ts">
// Vue port of component-inline-alert (inline-alert-bs4.md), styles from modular.css .inlinealert
const props = defineProps<{
  blok: {
    color?: 'default' | 'info' | 'success' | 'warning' | 'danger'
    icon?: string
    title?: string
    body?: any
    size?: 'Default' | 'Large'
  }
}>()

// [icon panel background, title color]; anything else keeps the navy default
const alertColors: Record<string, [string, string]> = {
  info: ['bg-usu-info', 'text-usu-info'],
  success: ['bg-usu-success', 'text-usu-success'],
  warning: ['bg-usu-warning', 'text-usu-warning'],
  danger: ['bg-usu-danger', 'text-usu-danger'],
}

const colors = computed(() => alertColors[props.blok.color ?? ''] ?? ['bg-usu-navy', 'text-usu-navy'])
const large = computed(() => props.blok.size === 'Large')
</script>

<template>
  <div
    v-editable="blok"
    class="relative flex min-h-[50px] my-2 overflow-hidden bg-white border border-usu-line rounded"
  >
    <div
      :class="[
        'flex items-center justify-center text-white rounded-l',
        large ? 'min-w-[75px] text-[1.75rem]' : 'min-w-[50px] text-xl',
        colors[0],
      ]"
    >
      <MocaFaIcon :icon="blok.icon" />
    </div>
    <div :class="['self-center px-4', large ? 'py-6' : 'py-[.2rem]']">
      <div :class="['font-bold', large && 'font-condensed text-2xl leading-normal', colors[1]]">{{ blok.title }}</div>
      <MocaRichText :doc="blok.body" class="text-sm" />
    </div>
  </div>
</template>
