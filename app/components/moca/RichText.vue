<script setup lang="ts">
// Storyblok rich text with the usu.edu content styles (Bootstrap 4 element defaults + main.css).
// Used by the Modern Campus blocks in app/storyblok/moca wherever the original copied WYSIWYG content.
const props = withDefaults(defineProps<{
  doc?: any
  // hero: paragraphs as styled inside .jumbotron-content (60ch wide, .75rem above, none below);
  // hero-center: the same without the width limit (.jumbotron-content-center)
  variant?: 'default' | 'hero' | 'hero-center'
}>(), { variant: 'default' })

const paragraphs = {
  'default': '[&_p]:mb-4',
  'hero': '[&_p]:mt-3 [&_p]:mb-0 [&_p]:max-w-[60ch]',
  'hero-center': '[&_p]:mt-3 [&_p]:mb-0',
}

const show = computed(() => hasRichText(props.doc))
</script>

<template>
  <div
    v-if="show"
    :class="[
      paragraphs[variant],
      '[&_a]:text-usu-info [&_a]:no-underline [&_a:hover]:text-usu-info-dark [&_a:hover]:underline',
      '[&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic',
      '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:mb-4 [&_ol]:mb-4 [&_ul]:pl-10 [&_ol]:pl-10 [&_li_ul]:mb-0 [&_li_ol]:mb-0',
      '[&_:is(h1,h2,h3,h4,h5,h6)]:font-condensed [&_:is(h1,h2,h3,h4,h5,h6)]:font-medium [&_:is(h1,h2,h3,h4,h5,h6)]:leading-[1.2] [&_:is(h1,h2,h3,h4,h5,h6)]:mt-4 [&_:is(h1,h2,h3,h4,h5,h6)]:mb-2',
      '[&_h2]:text-[1.625rem] bs-lg:[&_h2]:text-[2rem] [&_h3]:text-[1.4375rem] bs-lg:[&_h3]:text-[1.75rem] [&_h4]:text-[1.25rem] bs-lg:[&_h4]:text-[1.5rem]',
      '[&_blockquote]:mb-4 [&_blockquote]:text-xl [&_hr]:my-4 [&_hr]:border-black/10',
      '[&>:is(h1,h2,h3,h4,h5,h6):first-child]:mt-0',
    ]"
  >
    <StoryblokRichText :document="doc" />
  </div>
</template>
