<script setup lang="ts">
// Vue port of component-jumbotron (hero-banner-bs4.md), styles from modular.css .jumbotron-full.
// usu.edu sizes the banner with init.js (resizeJumbotronFull): the set height, 200px below 577px,
// and never shorter than its content plus 48px. Here that is a min-height plus padding.
const props = defineProps<{
  blok: {
    background_image?: SbAsset
    // Darken only a bar behind the text (bottom-left text only) instead of the whole image
    partial_background?: boolean
    text_location?: 'jumbotron-content-bottom-left' | 'jumbotron-content-center' | 'jumbotron-content-top-left'
    // Any CSS length, e.g. 300px or 50vh
    height?: string
    container_width?: 'default' | 'narrow'
    header?: string
    subheader?: string
    content?: any
    button?: any[]
  }
}>()

const hasImage = computed(() => !!props.blok.background_image?.filename)
const location = computed(() => props.blok.text_location || 'jumbotron-content-bottom-left')
const centered = computed(() => location.value === 'jumbotron-content-center')
const bottomLeft = computed(() => location.value === 'jumbotron-content-bottom-left')
const hasText = computed(() => !!props.blok.header || !!props.blok.subheader || hasRichText(props.blok.content))

// .jumbotron-title-bottom: a dark bar across the bottom holds the text instead of a full overlay
const titleBottom = computed(() => props.blok.partial_background && hasImage.value && bottomLeft.value && hasText.value)
const showOverlay = computed(() => hasImage.value && !(props.blok.partial_background && bottomLeft.value))

const heroClass = computed(() => [
  'relative flex w-full justify-center overflow-x-hidden min-h-[200px] bs-sm:min-h-(--hero-height)',
  // .jumbotron-full-image on navy, or .color-blend when there is no image
  hasImage.value ? 'bg-usu-navy bg-cover bg-center' : 'bg-linear-to-r from-usu-blend to-usu-slate',
  centered.value && 'items-center py-6',
  location.value === 'jumbotron-content-top-left' && 'items-start py-6',
  bottomLeft.value && (titleBottom.value ? 'items-end pt-12' : 'items-end pt-6'),
])

const heroStyle = computed(() => ({
  'backgroundImage': hasImage.value ? `url('${props.blok.background_image!.filename}')` : undefined,
  '--hero-height': props.blok.height || (titleBottom.value ? '400px' : '300px'),
}))

const container = computed(() => mocaContainer(props.blok.container_width === 'narrow'))
const textWidth = computed(() => centered.value ? '' : 'max-w-[38ch]')
// The title sits in .jumbotron-content.xl: main.css's .xl h1 is 2.8125rem from 992px (the plain h1's 2.5rem
// below that stays 1.8125rem either way)
// (! because mocaHeading.h1's own bs-lg size would otherwise compete with it)
const titleClass = [mocaHeading.h1, 'bs-lg:text-[2.8125rem]! m-0 font-bold! text-white!']
const leadWidth = computed(() => centered.value ? '' : 'max-w-[60ch]')
</script>

<template>
  <div v-editable="blok" :class="heroClass" :style="heroStyle">
    <!-- .jumbotron-title-bottom needs the container inside .jumbotron-content, the reverse of the usual order -->
    <div v-if="titleBottom" class="relative z-3 w-full self-end py-6 bg-black/70 text-left text-white">
      <div :class="container">
        <h1 v-if="blok.header" :class="[titleClass, textWidth]">{{ blok.header }}</h1>
        <p v-if="blok.subheader" :class="['mt-3 mb-0 text-xl bs-lg:text-[1.375rem] font-light', leadWidth]">{{ blok.subheader }}</p>
        <MocaRichText :doc="blok.content" variant="hero" />
        <div v-if="blok.button?.[0]?.text" class="mt-2">
          <StoryblokComponent v-for="b in blok.button" :key="b._uid" :blok="b" />
        </div>
      </div>
    </div>

    <div v-else :class="container">
      <div :class="['relative z-3 text-white', centered ? 'text-center' : 'text-left', bottomLeft && 'mb-6']">
        <h1 v-if="blok.header" :class="[titleClass, textWidth]">{{ blok.header }}</h1>
        <p v-if="blok.subheader" :class="['mt-3 mb-0 text-xl bs-lg:text-[1.375rem] font-light', leadWidth]">{{ blok.subheader }}</p>
        <MocaRichText :doc="blok.content" :variant="centered ? 'hero-center' : 'hero'" />
        <div v-if="blok.button?.[0]?.text" class="mt-2">
          <StoryblokComponent v-for="b in blok.button" :key="b._uid" :blok="b" />
        </div>
      </div>
    </div>

    <!-- .jumbotron-overlay: a dark tile over the whole image -->
    <div v-if="showOverlay" class="absolute inset-0 z-2 bg-[url(/moca/blur.png)]" />
  </div>
</template>
