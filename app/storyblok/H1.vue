<script setup lang="ts">
  defineProps<{
    blok: {
      heading: String
    }
  }>()
</script>

<template>
  <h1 class="text-3xl font-bold">{{ blok.heading }}</h1>
</template>