<script setup lang="ts">
// Full-width background band, e.g. <div class="bg-primary py-3"> around a container.
// Dark backgrounds make the text and rich-text headings white, and every band shares its color with
// MocaTitledBox through --moca-band-bg so a title set into a border hides the line behind it.
const props = defineProps<{
  blok: {
    background?: 'bg-primary' | 'bg-info' | 'bg-dark' | 'bg-blue-dark' | 'bg-light' | 'bg-gray-200' | 'bg-white'
    // Bootstrap spacers 0-5
    padding_y?: string
    // topographic: tier-1.css .bg-topographic contour lines over the background color
    pattern?: '' | 'topographic'
    content?: any[]
  }
}>()

// [background class, color for --moca-band-bg, dark]
const backgrounds: Record<string, [string, string, boolean]> = {
  'bg-primary': ['bg-usu-primary', 'var(--color-usu-primary)', true],
  'bg-info': ['bg-usu-info', 'var(--color-usu-info)', true],
  'bg-dark': ['bg-usu-dark', 'var(--color-usu-dark)', true],
  'bg-blue-dark': ['bg-usu-blue-dark', 'var(--color-usu-blue-dark)', true],
  'bg-light': ['bg-usu-gray-100', 'var(--color-usu-gray-100)', false],
  'bg-gray-200': ['bg-usu-gray-200', 'var(--color-usu-gray-200)', false],
  'bg-white': ['bg-white', '#fff', false],
}

const bg = computed(() => backgrounds[props.blok.background ?? ''] ?? backgrounds['bg-white']!)
const style = computed(() => ({
  '--moca-band-bg': bg.value[1],
  ...(bg.value[2] && { '--moca-heading': '#fff' }),
}))
</script>

<template>
  <div
    v-editable="blok"
    :class="[
      bg[0], bg[2] && 'text-white', mocaSpace('py', blok.padding_y),
      blok.pattern === 'topographic' && 'bg-[url(/moca/topo-lines.svg)] bg-size-[1400px] bg-repeat',
    ]"
    :style="style"
  >
    <StoryblokComponent v-for="b in blok.content" :key="b._uid" :blok="b" />
  </div>
</template>
