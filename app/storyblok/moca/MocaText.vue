<script setup lang="ts">
// Rich text outside Modern Campus components (the WYSIWYG content of a migrated page)
const props = defineProps<{
  blok: {
    text?: any
    // lead: Bootstrap's .lead paragraphs (1.25rem, light)
    style?: '' | 'lead'
    // Bootstrap .table styling for tables in the text: plain (.table) or striped (.table-striped).
    // Either way the table scrolls sideways below 768px (.table-responsive-md).
    table_style?: '' | 'plain' | 'striped'
  }
}>()

const table = [
  'max-bs-md:overflow-x-auto',
  '[&_table]:w-full [&_table]:mb-4 [&_table]:border-collapse',
  '[&_:is(td,th)]:p-3 [&_:is(td,th)]:align-top [&_:is(td,th)]:text-left [&_:is(td,th)]:border-t [&_:is(td,th)]:border-usu-gray-300',
  '[&_thead_th]:align-bottom [&_thead_th]:border-b-2 [&_:is(td,th)_p]:mb-0',
]
// main.css colors striped rows #e9ecef rather than Bootstrap's 5% black
const striped = '[&_tbody_tr:nth-of-type(odd)]:bg-usu-gray-200'
</script>

<template>
  <MocaRichText
    v-editable="blok"
    data-moca="text"
    :doc="blok.text"
    :class="[
      // .lead: 1.25rem, light; the body's 1.5 line height, not text-xl's own
      blok.style === 'lead' && '[&_p]:text-xl [&_p]:leading-normal [&_p]:font-light',
      blok.table_style && table,
      blok.table_style === 'striped' && striped,
    ]"
  />
</template>
