<script setup lang="ts">
// Vue port of component-youtube (youtube-embed-bs4.md)
const props = defineProps<{
  blok: {
    url?: string
  }
}>()

const videoId = computed(() => youtubeId(props.blok.url))
</script>

<template>
  <!-- .embed-responsive.embed-responsive-16by9 -->
  <div v-if="videoId" v-editable="blok" class="relative block w-full aspect-video overflow-hidden">
    <iframe
      :src="`https://www.youtube.com/embed/${videoId}?rel=0&enablejsapi=1`"
      title="YouTube video player"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      loading="lazy"
      class="absolute inset-0 size-full border-0"
    />
  </div>
</template>
