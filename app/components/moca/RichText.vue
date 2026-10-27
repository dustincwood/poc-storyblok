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
      // Content links are underlined on usu.edu (main#content a)
      '[&_a]:text-usu-info [&_a]:underline [&_a:hover]:text-usu-info-dark',
      '[&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic',
      '[&_ul]:list-disc [&_ul_ul]:list-[circle] [&_ul_ul_ul]:list-[square] [&_ol]:list-decimal [&_ul]:mb-4 [&_ol]:mb-4 [&_ul]:pl-10 [&_ol]:pl-10 [&_li_ul]:mb-0 [&_li_ol]:mb-0',
      // Storyblok wraps each list item's text in a <p>; on usu.edu items have no paragraph spacing
      '[&_li>p]:mb-0',
      '[&_:is(h1,h2,h3,h4,h5,h6)]:font-condensed [&_:is(h1,h2,h3,h4,h5,h6)]:font-medium [&_:is(h1,h2,h3,h4,h5,h6)]:leading-[1.2] [&_:is(h1,h2,h3,h4,h5,h6)]:mt-4 [&_:is(h1,h2,h3,h4,h5,h6)]:mb-2',
      // #384660 as on usu.edu; MocaBand sets --moca-heading to white on dark backgrounds
      '[&_:is(h1,h2,h3,h4,h5,h6)]:text-[var(--moca-heading,var(--color-usu-slate))]',
      '[&_h1]:text-[1.8125rem] bs-lg:[&_h1]:text-[2.5rem] [&_h1]:leading-[1.1]',
      '[&_h2]:text-[1.625rem] bs-lg:[&_h2]:text-[2rem] [&_h3]:text-[1.4375rem] bs-lg:[&_h3]:text-[1.75rem] [&_h4]:text-[1.25rem] bs-lg:[&_h4]:text-[1.5rem]',
      '[&_blockquote]:mb-4 [&_blockquote]:text-xl [&_hr]:my-4 [&_hr]:border-black/10',
      // Images keep their proportions and never overflow (Bootstrap's .img-fluid)
      '[&_img]:max-w-full [&_img]:h-auto',
      // usu.edu's #content p ~ h2/h3: more space when the heading follows copy
      '[&_p~:is(h2,h3)]:mt-8!',
    ]"
  >
    <StoryblokRichText :document="doc" />
  </div>
</template>
