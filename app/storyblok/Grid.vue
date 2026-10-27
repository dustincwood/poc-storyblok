<script setup lang="ts">
  const props = defineProps<{
    blok: {
      columns: any[]
      // Storyblok number fields arrive as strings, e.g. "2"
      cols: number | string
    }
  }>()

  // Full class names so Tailwind can detect them at build time. One column on phones, stepping up to the
  // chosen count, so wide grids don't run off small screens.
  const gridColsMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }

  const gridCols = computed(() => gridColsMap[Number(props.blok.cols)] ?? 'grid-cols-1')
</script>

<template>
  <div v-editable="blok" class="grid gap-4" :class="gridCols">
    <StoryblokComponent v-for="currentBlok in blok.columns" :key="currentBlok._uid" :blok="currentBlok" />
    <!-- Items from other components (e.g. StoryList's cards) go in the same grid -->
    <slot />
  </div>
</template>
