<script setup lang="ts">
// Font Awesome icon from a Modern Campus icon field ("fa-solid fa-house fa-2x" or a pasted <i> tag),
// rendered through Iconify's fa6 sets. Sized in em like Font Awesome: fa-2x is font-size: 2em, or `size`.
const props = defineProps<{
  icon?: string
  // Multiplier like fa-{n}x; overrides a size class in `icon`
  size?: string
}>()

const name = computed(() => faIconName(props.icon))
const fontSize = computed(() => Number(props.size) > 0 ? `${Number(props.size)}em` : faIconSize(props.icon))
</script>

<template>
  <UIcon v-if="name" :name="name" class="size-[1em] align-[-0.125em]" :style="fontSize && { fontSize }" />
</template>
