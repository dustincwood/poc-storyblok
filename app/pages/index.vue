<script setup>
const { story } = await useAsyncStoryblok("test-story", {
  api: {
    version: "draft", // or 'published'
  },
});
</script>

<template>
  <UContainer>
    <h1 class="text-3xl">Test Page</h1>
    <StoryblokComponent v-if="story" :blok="story.content" />
  </UContainer>
</template>