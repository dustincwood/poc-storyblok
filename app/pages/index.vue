<script setup>
  // The space's root story, "home" (Real path / in the Visual Editor). Drafts in development and inside the
  // Visual Editor, published content elsewhere, as on every other page.
  const route = useRoute()
  const version = import.meta.dev || route.query._storyblok ? 'draft' : 'published'

  const { story } = await useAsyncStoryblok('home', {
    api: { version },
  })
</script>

<template>
  <UContainer>
    <StoryblokComponent v-if="story" :blok="story.content" />
  </UContainer>
</template>
