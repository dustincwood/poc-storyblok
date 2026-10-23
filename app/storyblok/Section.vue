<script setup lang="ts">
  const props = defineProps<{
    blok: {
      children: any[]
      bgColor: string
    }
  }>()

  const sectionBackgroundMap: Record<string, string> = {
    'fuchsia': 'bg-fuchsia-300',
    'emerald': 'bg-emerald-300',
    'blue': 'bg-blue-300',
  }

  const sectionBackground = computed(() => sectionBackgroundMap[props.blok.bgColor] ?? '')
</script>

<template>
  <div :class="sectionBackground" class="py-5" v-editable="blok">
    <UContainer>
      <StoryblokComponent v-for="currentBlok in blok.children" :key="currentBlok._uid" :blok="currentBlok" />
    </UContainer>
  </div>
</template>