<script setup lang="ts">
// Vue port of component-image-with-text-overlay (image-with-text-overlay-all-sites.md)
const props = defineProps<{
  blok: {
    image?: SbAsset
    link?: SbLink
    text?: string
    // over: caption bar on the image; top/bottom: card header above/below it
    text_location?: 'over' | 'top' | 'bottom'
    text_color?: 'default' | 'primary' | 'dark'
  }
}>()

const href = computed(() => mocaLinkHref(props.blok.link) || undefined)

const headerColors: Record<string, string> = {
  primary: 'bg-usu-primary text-white!',
  dark: 'bg-usu-dark text-white!',
}

// .onHoverFloat: usu.edu adds .shadow-lg on hover, which also scales it up
const hoverFloat = 'relative overflow-hidden transition-all duration-150 ease-in-out hover:z-50 hover:scale-105 hover:shadow-[0_1rem_3rem_rgba(0,0,0,.175)]'
</script>

<template>
  <div v-if="blok.text_location === 'over'" v-editable="blok">
    <!-- .img-content-overlay.ratio-16by9 -->
    <NuxtLink
      :to="href"
      :target="blok.link?.target"
      :class="[hoverFloat, 'block w-full pb-[56.26%] bg-cover bg-center']"
      :style="{ backgroundImage: `url('${blok.image?.filename}')` }"
    >
      <div class="absolute inset-x-0 bottom-4 p-4 bg-usu-navy/80 text-white">
        <div :class="[mocaHeading.h3, 'my-0 text-white!']">{{ blok.text }}</div>
      </div>
    </NuxtLink>
  </div>

  <div v-else v-editable="blok" :class="[mocaCard.base, hoverFloat]">
    <div v-if="blok.text_location === 'top'" :class="[mocaCard.header, mocaHeading.h4, headerColors[blok.text_color ?? '']]">
      {{ blok.text }}
    </div>
    <!-- .stretched-link makes the whole card clickable -->
    <NuxtLink :to="href" :target="blok.link?.target" class="after:absolute after:inset-0 after:z-[1]">
      <img :src="blok.image?.filename" :alt="blok.image?.alt ?? ''" class="block mx-auto max-w-full">
    </NuxtLink>
    <div v-if="blok.text_location === 'bottom'" :class="[mocaCard.header, mocaHeading.h4, headerColors[blok.text_color ?? '']]">
      {{ blok.text }}
    </div>
  </div>
</template>
