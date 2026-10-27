<script setup lang="ts">
// Port of .card-tier1 (templateresources.usu.edu/_resources/css/tier-1.css): an image card with its
// title on a dark gradient at the bottom, the whole card a link, zooming the image on hover
const props = defineProps<{
  blok: {
    image?: SbAsset
    link?: SbLink
    title?: string
    // Optional text under the title, on the same gradient
    text?: string
    // Font Awesome classes shown before the title, e.g. fa-solid fa-magnifying-glass
    icon?: string
    // .ratio-{w}x{h}; empty is the default 300px minimum height
    ratio?: '' | '1x1' | '2x3' | '3x4' | '4x3' | '3x2'
    shadow?: boolean
  }
}>()

const ratios: Record<string, string> = {
  '1x1': 'aspect-square min-h-0',
  '2x3': 'aspect-[2/3] min-h-0',
  '3x4': 'aspect-[3/4] min-h-0',
  '4x3': 'aspect-[4/3] min-h-0',
  '3x2': 'aspect-[3/2] min-h-0',
}
</script>

<template>
  <!-- isolate: the image (-2) and caption fade (-1) sit behind the caption but inside the card -->
  <div
    v-editable="blok"
    :class="[
      'group relative isolate z-3 flex flex-col justify-end items-end w-full min-h-[300px] max-bs-lg:max-h-[300px] pt-[80px] overflow-hidden rounded-[10px]',
      ratios[blok.ratio ?? ''],
      blok.shadow && 'shadow-[0_.5rem_1rem_rgba(0,0,0,.15)]',
    ]"
  >
    <NuxtLink
      :to="mocaLinkHref(blok.link) || undefined"
      :target="blok.link?.target"
      class="w-full text-white no-underline after:absolute after:inset-0 after:z-1"
    >
      <div
        class="relative w-full px-5 py-2.5 bg-linear-to-t from-black/60 to-black/40 before:absolute before:inset-x-0 before:bottom-full before:h-[150px] before:-z-1 before:bg-linear-to-t before:from-black/40 before:to-black/0"
      >
        <h3 :class="[mocaHeading.h3, 'mt-4 mb-2 font-bold! text-white!']">
          <MocaFaIcon v-if="blok.icon" :icon="blok.icon" class="mr-1" />
          {{ blok.title }}
        </h3>
        <p v-if="blok.text" class="mb-4">{{ blok.text }}</p>
      </div>
      <img
        v-if="blok.image?.filename"
        :src="blok.image.filename"
        :alt="blok.image.alt ?? ''"
        class="absolute inset-0 -z-2 size-full object-cover transition-all duration-300 group-hover:scale-110"
      >
    </NuxtLink>
  </div>
</template>
