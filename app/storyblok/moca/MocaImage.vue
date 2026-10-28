<script setup lang="ts">
// An image on its own, as hand-written on usu.edu: <img class="img-fluid rounded-circle w-100" ...>,
// or a paragraph holding only an image: <p class="text-center"><img width="342" ...></p>
const props = defineProps<{
  blok: {
    image?: SbAsset
    // Bootstrap image class: rounded, rounded-circle, img-thumbnail (mocaImageStyles)
    image_style?: '' | 'rounded' | 'rounded-circle' | 'img-thumbnail'
    // Stretch to the column's width (.w-100); otherwise its own width, never wider than the column
    full_width?: boolean
    // Display width in pixels (the img width attribute); empty keeps the image's own
    width?: string
    align?: '' | 'center' | 'right'
    // Space below as a Bootstrap spacer 0-5
    margin_bottom?: string
  }
}>()

const aligns: Record<string, string> = { center: 'mx-auto', right: 'ml-auto' }
const width = computed(() => Number(props.blok.width) > 0 ? `${Number(props.blok.width)}px` : undefined)
</script>

<template>
  <img
    v-if="blok.image?.filename"
    v-editable="blok"
    :src="blok.image.filename"
    :alt="blok.image.alt ?? ''"
    :style="{ width }"
    :class="[
      'block max-w-full h-auto',
      blok.full_width && 'w-full',
      aligns[blok.align ?? ''],
      mocaImageStyles[blok.image_style ?? ''],
      mocaSpace('mb', blok.margin_bottom),
    ]"
  >
</template>
