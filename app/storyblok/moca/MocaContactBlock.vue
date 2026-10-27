<script setup lang="ts">
// Vue port of component-contact-block (z_XSL_staging/_resources/xsl/_shared/components.xsl)
const props = defineProps<{
  blok: {
    name?: string
    // Job title or role, shown under the name
    description?: string
    // horizontal: photo in a third-width column beside the details; vertical: photo above
    orientation?: 'horizontal' | 'vertical'
    image?: SbAsset
    image_style?: '' | 'rounded' | 'rounded-circle' | 'img-thumbnail'
    location?: string
    phone?: string
    fax?: string
    email?: string
    address_name?: string
    address_line1?: string
    address_line2?: string
    city?: string
    state?: string
    zip?: string
    // Appointment link; shown as a "Schedule an Appointment" button
    schedule?: SbLink
  }
}>()

const vertical = computed(() => props.blok.orientation === 'vertical')
const hasAddress = computed(() => ['address_line1', 'address_line2', 'city', 'state', 'zip'].some(k => props.blok[k as keyof typeof props.blok]))
const scheduleHref = computed(() => mocaLinkHref(props.blok.schedule))

// Content links are underlined on usu.edu (main#content a)
const link = 'text-usu-info underline hover:text-usu-info-dark'
</script>

<template>
  <div v-editable="blok">
    <div v-if="blok.name" :class="[mocaHeading.h3, 'mb-2']">{{ blok.name }}</div>
    <p v-if="blok.description" class="mb-4">{{ blok.description }}</p>

    <div class="flex flex-wrap -mx-[15px]">
      <div v-if="blok.image?.filename" :class="vertical ? 'p-4' : 'w-full px-[15px] pb-2 bs-sm:w-1/3'">
        <img
          :src="blok.image.filename"
          :alt="blok.image.alt ?? ''"
          :class="['max-w-full h-auto', mocaImageStyles[blok.image_style ?? '']]"
        >
      </div>
      <div :class="vertical ? 'w-full px-[15px] bs-sm:w-2/3' : 'flex-1 basis-0 max-w-full px-[15px]'">
        <p class="mb-4">
          <template v-if="blok.location"><strong>Office Location: </strong>{{ blok.location }}<br></template>
          <template v-if="blok.phone"><strong>Phone: </strong><a :href="`tel:${blok.phone}`" :class="link">{{ blok.phone }}</a><br></template>
          <template v-if="blok.fax"><strong>Fax: </strong><a :href="`tel:${blok.fax}`" :class="link">{{ blok.fax }}</a><br></template>
          <template v-if="blok.email"><strong>Email: </strong><a :href="`mailto:${blok.email}`" :class="link">{{ blok.email }}</a></template>
        </p>

        <p v-if="hasAddress" class="mb-4">
          <strong>Mailing Address:</strong><br>
          <template v-if="blok.address_name">{{ blok.address_name }}<br></template>
          <template v-if="blok.address_line1">{{ blok.address_line1 }}<br></template>
          <template v-if="blok.address_line2">{{ blok.address_line2 }}<br></template>
          {{ blok.city }}{{ blok.city && blok.state ? ', ' : '' }}{{ blok.state }}{{ blok.city || blok.state ? ' ' : '' }}
          <template v-if="blok.zip">{{ blok.zip }}<br></template>
        </p>

        <NuxtLink v-if="scheduleHref" :to="scheduleHref" :target="blok.schedule?.target" :class="[mocaButtonClass('btn-info'), 'my-2']">
          Schedule an Appointment
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
