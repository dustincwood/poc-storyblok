<script setup>
  const { story } = await useAsyncStoryblok('test-story', {
    api: {
      version: 'draft', // or 'published'
    },
  })
</script>

<template>
  <UContainer>
  </UContainer>
  <StoryblokComponent v-if="story" :blok="story.content" />
</template>
