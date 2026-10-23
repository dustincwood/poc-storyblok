<script setup lang="ts">
// Vue port of component-video-banner (video-banner-youtube-bs4.md), YouTube type only
const props = defineProps<{
  blok: {
    url?: string
    aspect_ratio?: '16by9' | '21by9' | '4by3' | '1by1'
  }
}>()

// .embed-responsive-{ratio}
const ratios: Record<string, string> = {
  '16by9': 'aspect-video',
  '21by9': 'aspect-[21/9]',
  '4by3': 'aspect-[4/3]',
  '1by1': 'aspect-square',
}

const videoId = computed(() => youtubeId(props.blok.url))
</script>

<template>
  <div
    v-if="videoId"
    v-editable="blok"
    :class="['relative block w-full overflow-hidden', ratios[blok.aspect_ratio ?? ''] ?? ratios['16by9']]"
  >
    <iframe
      :src="`https://www.youtube.com/embed/${videoId}`"
      title="YouTube video player"
      allowfullscreen
      class="absolute inset-0 size-full border-0"
    />
  </div>
</template>
