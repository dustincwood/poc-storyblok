<script setup lang="ts">
// An image on its own, as hand-written on usu.edu: <img class="img-fluid rounded-circle w-100" ...>
const props = defineProps<{
  blok: {
    image?: SbAsset
    // Bootstrap image class: rounded, rounded-circle, img-thumbnail (mocaImageStyles)
    image_style?: '' | 'rounded' | 'rounded-circle' | 'img-thumbnail'
    // Stretch to the column's width (.w-100); otherwise its own width, never wider than the column
    full_width?: boolean
    // Space below as a Bootstrap spacer 0-5
    margin_bottom?: string
  }
}>()
</script>

<template>
  <img
    v-if="blok.image?.filename"
    v-editable="blok"
    :src="blok.image.filename"
    :alt="blok.image.alt ?? ''"
    :class="[
      'block max-w-full h-auto',
      blok.full_width && 'w-full',
      mocaImageStyles[blok.image_style ?? ''],
      mocaSpace('mb', blok.margin_bottom),
    ]"
  >
</template>
