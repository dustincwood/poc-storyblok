<script setup lang="ts">
// The page's header names and menu (middleware/site-header.global.ts); until set, the components show their
// defaults. The mobile menu bar shows the same site name as the header.
const header = useSiteHeaderState()
const nav = useTopNavState()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <Header v-bind="header ?? {}" />
    <TopNavigation
      :items="nav"
      v-bind="header ? { siteName: header.siteName, siteUrl: header.siteUrl } : {}"
    />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </div>
</template>
