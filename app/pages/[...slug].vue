<script setup lang="ts">
// Renders the Storyblok story at the current path, e.g. /advising-migration-test/advising/ -> that folder's
// start page. index.vue still handles /.
// Drafts show in development and inside the Storyblok Visual Editor (which adds ?_storyblok=...);
// elsewhere only published content.
// Re-created per path, so navigating between two stories loads the second one
definePageMeta({ key: route => route.path })

const route = useRoute()
const slug = ([] as string[]).concat(route.params.slug ?? []).filter(Boolean).join('/')
const version = import.meta.dev || route.query._storyblok ? 'draft' : 'published'

const { story, error } = await useAsyncStoryblok(slug, {
  api: { version },
})

if (error.value || !story.value) {
  throw createError({ statusCode: 404, statusMessage: `No Storyblok story at /${slug}`, fatal: true })
}

useHead({ title: story.value.name })
</script>

<template>
  <StoryblokComponent v-if="story" :blok="story.content" />
</template>
