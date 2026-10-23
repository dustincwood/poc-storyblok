<script setup lang="ts">
// Vue port of component-block-quote (quote-block-bs4.md)
const props = defineProps<{
  blok: {
    style?: 'default' | 'bars'
    quote?: string
    author?: string
  }
}>()

// div.icon-hr: the icon centered between two thin rules
const iconHr = 'flex items-center before:grow before:border-b before:border-usu-gray-300 after:grow after:border-b after:border-usu-gray-300'
// .blockquote-footer (Bootstrap's ::before em dash is written into the template)
const footer = 'block text-[80%] text-usu-muted'
</script>

<template>
  <blockquote v-if="blok.style === 'bars'" v-editable="blok" class="mb-4 text-xl">
    <div :class="[iconHr, 'mb-4']">
      <UIcon name="i-fa6-solid-quote-left" class="mx-4 size-[1em] text-[2em] text-usu-bright-light" />
    </div>
    <p class="mb-4 italic">{{ blok.quote }}</p>
    <footer v-if="blok.author" :class="[footer, 'text-right']">&mdash;&nbsp;{{ blok.author }}</footer>
    <div :class="[iconHr, 'mt-4']">
      <UIcon name="i-fa6-solid-quote-right" class="mx-4 size-[1em] text-[2em] text-usu-bright-light" />
    </div>
  </blockquote>
  <blockquote v-else v-editable="blok" class="mb-4 text-xl">
    <p class="my-0">"{{ blok.quote }}"</p>
    <footer v-if="blok.author" :class="footer">&mdash;&nbsp;{{ blok.author }}</footer>
  </blockquote>
</template>
