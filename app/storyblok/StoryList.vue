<script setup lang="ts">
  // A card for every story in the space (except the page showing the list), in a Grid. Each card links to
  // the story's page. Like the pages themselves, drafts are listed in development and the Visual Editor;
  // elsewhere only published stories, so no card leads to a page that isn't live.
  const props = defineProps<{
    blok: {
      // Storyblok number fields arrive as strings, e.g. "3"
      cols: number | string
    }
  }>()

  const route = useRoute()
  const version = import.meta.dev || route.query._storyblok ? 'draft' : 'published'
  const current = route.path.replace(/^\/|\/$/g, '') || 'home'

  const { data: stories } = await useAsyncData(`story-list-${version}`, async () => {
    const all = await useStoryblokApi().getAll('cdn/stories', { version, per_page: 100 })
    // Only what the cards show, so the page payload stays small
    return all
      .map((s: any) => ({ uuid: s.uuid as string, name: s.name as string, fullSlug: s.full_slug as string }))
      .sort((a, b) => a.fullSlug.localeCompare(b.fullSlug))
  })

  const cards = computed(() => (stories.value ?? []).filter(s => s.fullSlug.replace(/\/$/, '') !== current))
</script>

<template>
  <!-- py-8 matches the page header's spacing above -->
  <Grid v-editable="blok" :blok="{ cols: blok.cols, columns: [] }" class="py-8">
    <!-- The whole card is the link -->
    <NuxtLink
      v-for="story in cards"
      :key="story.uuid"
      :to="`/${story.fullSlug}`"
      class="group block rounded-lg focus-visible:outline-2 focus-visible:outline-primary"
    >
      <UCard class="h-full transition-colors group-hover:bg-elevated">
        <h2 class="font-semibold text-highlighted">{{ story.name }}</h2>
        <!-- Long slugs wrap after a slash rather than mid-word -->
        <p class="mt-1 text-sm text-muted wrap-anywhere">
          <template v-for="(part, i) in story.fullSlug.split('/')" :key="i">{{ i ? '/' : '' }}<wbr v-if="i">{{ part }}</template>
        </p>
      </UCard>
    </NuxtLink>
  </Grid>
</template>
