<script setup lang="ts">
// The page sets the header's names (useSiteHeader); until it does, the header shows its defaults
const header = useSiteHeaderState()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <Header v-bind="header ?? {}" />
    <TopNavigation />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </div>
</template>
