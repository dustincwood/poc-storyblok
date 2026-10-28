<script setup lang="ts">
// A person from a directory feed (component 950, directoryHorizontal style), copied from the published feed:
// photo beside the name, title, department, phone, email, office and an appointment button.
// The feed linked the name and photo to the person's directory page; this card doesn't.
const props = defineProps<{
  blok: {
    image?: SbAsset
    name?: string
    // Job title (.h5); a line break in it starts a new line, as the feed's <br> does
    title?: string
    // Department or assignment (.h6, normal weight)
    department?: string
    phone?: string
    email?: string
    // Office location
    location?: string
    // Appointment link; shown as a "Schedule an Appointment" button
    schedule?: SbLink
  }
}>()

const scheduleHref = computed(() => mocaLinkHref(props.blok.schedule))
</script>

<template>
  <div v-editable="blok" class="flex -mx-[15px]">
    <div class="basis-[41.666667%] grow-0 shrink-0 max-w-[41.666667%] px-[15px]">
      <img
        v-if="blok.image?.filename"
        :src="blok.image.filename"
        :alt="blok.image.alt || blok.name || ''"
        class="block max-w-full h-auto mb-2"
      >
    </div>
    <!-- .text-break: long email addresses wrap instead of widening the column -->
    <div class="basis-[58.333333%] grow-0 shrink-0 max-w-[58.333333%] px-[15px] wrap-anywhere">
      <h3 v-if="blok.name" :class="[mocaHeading.h4, 'mt-0 mb-2 leading-none! font-bold!']">{{ blok.name }}</h3>
      <p v-if="blok.title" class="mb-2 font-condensed font-bold leading-[1.2] text-[1.176rem] text-usu-slate whitespace-pre-line">{{ blok.title }}</p>
      <p v-if="blok.department" class="mb-2 font-condensed leading-[1.2] text-base text-usu-slate">{{ blok.department }}</p>
      <div v-if="blok.phone">Phone: {{ blok.phone }}</div>
      <div v-if="blok.email">
        Email: <a :href="`mailto:${blok.email}`" class="text-usu-info underline hover:text-usu-info-dark">{{ blok.email }}</a>
      </div>
      <div v-if="blok.location">Office Location: {{ blok.location }}</div>
      <a v-if="scheduleHref" :href="scheduleHref" :target="blok.schedule?.target" :class="[mocaButtonClass('btn-info'), 'my-2']">
        Schedule an Appointment
      </a>
    </div>
  </div>
</template>
