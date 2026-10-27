<script setup lang="ts">
// Vue port of component-step-guide (step-guide.md), styles from modular.css .step-guide.
// Each step is a moca-step blok rendered here directly, numbered from 1.
const props = defineProps<{
  blok: {
    // h3 when the guide sits under an h2 section heading
    heading_level?: 'h2' | 'h3'
    steps?: {
      _uid: string
      header?: string
      // mocaColors name; slate when empty
      header_color?: string
      content?: any
      // Layout blocks after the text (a row of columns, a component)
      blocks?: any[]
    }[]
  }
}>()

const headingTag = computed(() => props.blok.heading_level === 'h3' ? 'h3' : 'h2')
</script>

<template>
  <div v-editable="blok">
    <div v-for="(step, i) in blok.steps" :key="step._uid" v-editable="step" class="relative flex mb-8">
      <div
        class="shrink-0 size-[50px] mr-4 bg-white border-3 border-usu-line rounded-full text-center text-[1.75rem] leading-[42px] font-bold text-usu-slate"
      >
        {{ i + 1 }}
      </div>
      <div class="min-w-0 grow">
        <MocaHeadingTag :tag="headingTag" :class="[mocaHeading[headingTag], headingTag === 'h3' ? 'mb-1' : 'mb-0', mocaColors[step.header_color ?? '']?.text]">
          {{ step.header }}
        </MocaHeadingTag>
        <MocaRichText :doc="step.content" />
        <StoryblokComponent v-for="child in step.blocks" :key="child._uid" :blok="child" />
      </div>
      <!-- The connector to the next step; none after the last -->
      <div
        v-if="i < blok.steps!.length - 1"
        class="absolute left-[2px] top-[60px] -bottom-[25px] w-[25px] border-r-3 border-usu-line"
      />
    </div>
  </div>
</template>
