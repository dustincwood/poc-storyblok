<script setup lang="ts">
  // A page's main heading, as Nuxt UI's page header
  defineProps<{
    blok: {
      title: string
    }
  }>()
</script>

<template>
  <UPageHeader v-editable="blok" :title="blok.title" />
</template>
