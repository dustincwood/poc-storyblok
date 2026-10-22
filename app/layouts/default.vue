<template>
  <div class="flex min-h-screen flex-col">
    <Header />
    <TopNavigation />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </div>
</template>
