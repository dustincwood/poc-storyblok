<script setup lang="ts">
// Renders a plain heading element (h1-h6). <component :is="'h1'"> can't be used for this: Vue resolves
// "h1" to the globally registered Storyblok block app/storyblok/H1.vue before the HTML element.
defineOptions({ inheritAttrs: false })
const props = defineProps<{ tag: string }>()
const attrs = useAttrs()
const slots = useSlots()
// Attributes are passed on explicitly: a functional component only inherits class, style and listeners,
// which would drop the id (in-page anchors) and Storyblok's editable attributes
const Heading = () => h(props.tag, attrs, slots.default?.())
</script>

<template>
  <Heading />
</template>
