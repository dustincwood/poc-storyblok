<script setup lang="ts">
// A heading with the usu.edu heading styles plus the options hand-written pages add with classes:
// color (text-*), centering, bold (text-bold), and rules on both sides (a row of border-bottom columns
// around the heading, as in "Chat With Someone")
const props = defineProps<{
  blok: {
    text?: string
    // h1 only for a page title when the page has no hero
    level?: 'h1' | 'h2' | 'h3' | 'h4'
    // A mocaColors name; empty keeps the slate heading color
    color?: string
    align?: '' | 'center'
    bold?: boolean
    // Thin lines left and right of the heading, from 768px up
    rules?: boolean
    // Bootstrap spacer 0-5 below; empty keeps the heading's .5rem
    margin_bottom?: string
    // id for in-page links (#anchor), e.g. from a row of jump buttons
    anchor?: string
  }
}>()

const tag = computed(() => props.blok.level || 'h2')
const headingClass = computed(() => [
  mocaHeading[tag.value],
  'mt-4',
  // usu.edu's #content p ~ h2/h3: more space when copy comes anywhere before the heading in the same
  // parent (here, an earlier text block)
  (tag.value === 'h2' || tag.value === 'h3') && '[[data-moca=text]~&]:mt-8',
  mocaSpace('mb', props.blok.margin_bottom) || 'mb-2',
  mocaColors[props.blok.color ?? '']?.text,
  (props.blok.align === 'center' || props.blok.rules) && 'text-center',
  props.blok.bold && 'font-bold!',
])
// Bootstrap's .border-bottom (#dee2e6), which reads as white on a dark band
const ruleClass = 'hidden bs-md:block grow mt-1 border-b border-usu-gray-300'
</script>

<template>
  <div v-if="blok.rules" v-editable="blok" class="flex items-center gap-[30px] px-4">
    <div :class="ruleClass" />
    <MocaHeadingTag :tag="tag" :id="blok.anchor || undefined" :class="headingClass">{{ blok.text }}</MocaHeadingTag>
    <div :class="ruleClass" />
  </div>
  <MocaHeadingTag :tag="tag" v-else v-editable="blok" :id="blok.anchor || undefined" :class="headingClass">{{ blok.text }}</MocaHeadingTag>
</template>
