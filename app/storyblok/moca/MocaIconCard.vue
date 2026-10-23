<script setup lang="ts">
// Vue port of component-icon-card (card-font-awesome-icon-card-bs4.md)
const props = defineProps<{
  blok: {
    // 'default' (white) or a Bootstrap background class: bg-primary, bg-info, ...
    color?: string
    icon?: string
    // Font Awesome fa-{n}x multiplier
    icon_size?: string
    sr_only?: string
    header?: string
    body?: string
    button_text?: string
    button_link?: SbLink
  }
}>()

const colored = computed(() => !!props.blok.color && props.blok.color !== 'default')
const cardColor = computed(() => colored.value ? mocaBg[props.blok.color!] : '')
// .text-white / .text-primary are !important in Bootstrap, so they beat the heading color
const textColor = computed(() => colored.value ? 'text-white!' : 'text-usu-primary!')
const iconSize = computed(() => Number(props.blok.icon_size) > 0 ? `${Number(props.blok.icon_size)}em` : undefined)
</script>

<template>
  <div v-editable="blok" :class="[mocaCard.base, cardColor, 'text-center']">
    <div :class="[mocaCard.body, textColor]">
      <span class="my-6" :style="{ fontSize: iconSize }"><MocaFaIcon :icon="blok.icon" /></span>
      <span v-if="blok.sr_only" class="sr-only">{{ blok.sr_only }}</span>
      <h2 v-if="blok.header" :class="[mocaHeading.h3, 'my-4', textColor]">{{ blok.header }}</h2>
      <p v-if="blok.body" class="mb-4 text-xl font-light">{{ blok.body }}</p>
    </div>

    <div v-if="blok.button_text" :class="['px-5 pt-3 pb-6 rounded-b-[calc(.25rem-1px)]', cardColor]">
      <NuxtLink
        :to="mocaLinkHref(blok.button_link) || undefined"
        :target="blok.button_link?.target"
        :class="mocaButtonClass(colored ? 'btn-outline-secondary' : 'btn-outline-dark')"
      >
        {{ blok.button_text }}
      </NuxtLink>
    </div>
  </div>
</template>
