<script setup lang="ts">
// Font Awesome icon from a Modern Campus icon field ("fa-solid fa-house" or a pasted <i> tag),
// rendered through Iconify's fa6 sets. Sized in em like Font Awesome, so fa-2x is font-size: 2em.
const props = defineProps<{
  icon?: string
}>()

const name = computed(() => faIconName(props.icon))
</script>

<template>
  <UIcon v-if="name" :name="name" class="size-[1em] align-[-0.125em]" />
</template>
