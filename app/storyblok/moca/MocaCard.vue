<script setup lang="ts">
// Vue port of component-card-block (card-bs4.md)
const props = defineProps<{
  blok: {
    // Bootstrap background class for the header: bg-primary, bg-info, bg-gray-darker, ...
    color?: string
    header?: string
    image?: SbAsset
    image_location?: 'card-img-top' | 'card-img-bottom'
    image_link?: SbLink
    body?: any
    button?: any[]
  }
}>()

const hasImage = computed(() => !!props.blok.image?.filename)
const hasBody = computed(() => hasRichText(props.blok.body))
const hasButton = computed(() => !!props.blok.button?.[0]?.text)
const imageOnTop = computed(() => props.blok.image_location !== 'card-img-bottom')
const imageLink = computed(() => mocaLinkHref(props.blok.image_link))

const headerClass = computed(() => [
  mocaCard.header,
  mocaHeading.h4,
  mocaBg[props.blok.color ?? ''],
  // Dark headers get white bold text (Bootstrap's !important utilities)
  ['bg-primary', 'bg-gray-darker', 'bg-info'].includes(props.blok.color ?? '') && 'text-white! font-bold!',
  // A header-only card drops the header's bottom border
  !hasBody.value && !hasButton.value && 'border-b-0! mb-1!',
])

const imageClass = computed(() => [
  'block w-full h-auto max-w-full shrink-0',
  imageOnTop.value ? 'rounded-t-[calc(.25rem-1px)]' : 'rounded-b-[calc(.25rem-1px)]',
])
</script>

<template>
  <div
    v-if="blok.header || hasBody || hasImage"
    v-editable="blok"
    :class="mocaCard.base"
  >
    <template v-if="hasImage && imageOnTop">
      <NuxtLink v-if="imageLink" :to="imageLink" :target="blok.image_link?.target">
        <img :src="blok.image!.filename" :alt="blok.image!.alt ?? ''" :class="imageClass">
      </NuxtLink>
      <img v-else :src="blok.image!.filename" :alt="blok.image!.alt ?? ''" :class="imageClass">
    </template>

    <div v-if="blok.header" :class="headerClass">{{ blok.header }}</div>

    <template v-if="hasImage && !imageOnTop">
      <NuxtLink v-if="imageLink" :to="imageLink" :target="blok.image_link?.target">
        <img :src="blok.image!.filename" :alt="blok.image!.alt ?? ''" :class="imageClass">
      </NuxtLink>
      <img v-else :src="blok.image!.filename" :alt="blok.image!.alt ?? ''" :class="imageClass">
    </template>

    <!-- Rendered when there is a button too, so cards in a row stay the same height -->
    <div v-if="hasBody || hasButton" :class="mocaCard.body">
      <MocaRichText :doc="blok.body" />
    </div>

    <!-- .nav-card footer: no top border, button aligned right -->
    <div v-if="hasButton" class="px-5 py-3 flex flex-wrap justify-end rounded-b-[calc(.25rem-1px)]">
      <StoryblokComponent v-for="b in blok.button" :key="b._uid" :blok="b" />
    </div>
  </div>
</template>
