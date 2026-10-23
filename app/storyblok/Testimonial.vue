<script setup lang="ts">
  defineProps<{
    blok: {
      comment: String
      name: String
      videoLink: any
      videoName: String
    }
  }>()
</script>

<template>
  <div class="p-4 bg-emerald-200" v-editable="blok">
    <p class="text-fuchsia-800 text-3xl font-bold">{{ blok.comment }}</p>
    <p class="text-fuchsia-600">{{ blok.name }}</p>

    <NuxtLink
      :to="blok.videoLink.url"
      target="_blank"
      class="flex items-center mt-4 hover:underline"
    >
      {{ blok.videoName }}
    </NuxtLink>
  </div>
</template>
