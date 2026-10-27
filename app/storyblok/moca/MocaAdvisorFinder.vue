<script setup lang="ts">
// Port of usu.edu's "Find Your Advisor" (advising/_resources/scripts/advising.js) with its data in Storyblok.
// Students pick a location; a location with several advisors then asks for a focus area (when any of
// them has one) or a last-name range; the first matching advisor shows. One focus area shows a list of
// advisors (undecided) instead.
type Advisor = {
  _uid: string
  name?: string
  image?: SbAsset
  phone?: string
  email?: string
  appointment_link?: SbLink
  // Comma-separated entries of the finder's locations
  locations?: string
  focus_area?: string
  last_name_range?: string
}

const props = defineProps<{
  blok: {
    location_label?: string
    // One per line
    locations?: string
    focus_area_label?: string
    focus_areas?: string
    last_name_label?: string
    advisors?: Advisor[]
    undecided_option?: string
    undecided_title?: string
    // One paragraph per advisor, each shown as a card
    undecided?: any
    error_message?: string
    button_text?: string
  }
}>()

const lines = (text?: string) => (text ?? '').split('\n').map(s => s.trim()).filter(Boolean)
const same = (a?: string, b?: string) => (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase()

const location = ref('')
const focusArea = ref('')
const lastName = ref('')
watch(location, () => { focusArea.value = ''; lastName.value = '' })
watch(focusArea, () => { lastName.value = '' })

const atLocation = computed(() => (props.blok.advisors ?? [])
  .filter(a => (a.locations ?? '').split(',').some(l => same(l, location.value))))
// Several advisors here, and they differ by focus area
const asksFocusArea = computed(() => atLocation.value.length > 1 && atLocation.value.some(a => a.focus_area?.trim()))
const undecided = computed(() => asksFocusArea.value && !!focusArea.value && same(focusArea.value, props.blok.undecided_option))
const inFocusArea = computed(() => asksFocusArea.value
  ? atLocation.value.filter(a => same(a.focus_area, focusArea.value))
  : atLocation.value)
// Still several: they differ by last name
const asksLastName = computed(() => !undecided.value && inFocusArea.value.length > 1
  && (!asksFocusArea.value || !!focusArea.value))
const lastNameRanges = computed(() => [...new Set(inFocusArea.value.map(a => a.last_name_range?.trim()).filter(Boolean))].sort() as string[])

// The advisors the choices so far narrow down to, or null while a choice is still missing
const matches = computed(() => {
  if (!location.value || undecided.value) return null
  if (asksFocusArea.value && !focusArea.value) return null
  if (asksLastName.value) return lastName.value ? inFocusArea.value.filter(a => same(a.last_name_range, lastName.value)) : null
  return inFocusArea.value
})
const advisor = computed(() => matches.value?.[0])

// Location | Focus area, then the last-name range on its own line, as on usu.edu
const advisorTitle = computed(() => [location.value, focusArea.value].filter(Boolean).join(' | '))

// Bootstrap 4 .form-control
const select = 'block w-full h-[calc(1.5em+.75rem+2px)] px-3 py-1.5 text-base leading-normal text-[#495057] bg-white border border-[#ced4da] rounded focus:border-[#80bdff] focus:outline-0 focus:shadow-[0_0_0_.2rem_rgba(0,123,255,.25)]'
const label = [mocaHeading.h4, 'inline-block mb-2 font-bold!', mocaColors['bright-light']!.text]
const link = 'text-usu-info underline hover:text-usu-info-dark'
// .form-group.col-lg-4
const field = 'w-full bs-lg:basis-[33.333333%] bs-lg:max-w-[33.333333%] grow-0 shrink-0 px-[15px] mb-4'
// .card.my-1 > .card-body > p.m-0, one per paragraph of the undecided list
const cards = '[&_p]:my-1! [&_p]:p-5 [&_p]:bg-white [&_p]:border [&_p]:border-[rgba(0,0,0,.125)] [&_p]:rounded'
</script>

<template>
  <div v-editable="blok">
    <form class="flex flex-wrap -mx-[15px]" @submit.prevent>
      <div :class="field">
        <label :class="label" :for="`location-${blok._uid}`">{{ blok.location_label }}</label>
        <select :id="`location-${blok._uid}`" v-model="location" :class="select">
          <option disabled value="">Choose...</option>
          <option v-for="l in lines(blok.locations)" :key="l" :value="l">{{ l }}</option>
        </select>
      </div>
      <div v-if="asksFocusArea" :class="field">
        <label :class="label" :for="`focus-${blok._uid}`">{{ blok.focus_area_label }}</label>
        <select :id="`focus-${blok._uid}`" v-model="focusArea" :class="select">
          <option disabled value="">Choose...</option>
          <option v-for="f in lines(blok.focus_areas)" :key="f" :value="f">{{ f }}</option>
        </select>
      </div>
      <div v-if="asksLastName" :class="field">
        <label :class="label" :for="`last-${blok._uid}`">{{ blok.last_name_label }}</label>
        <select :id="`last-${blok._uid}`" v-model="lastName" :class="select">
          <option disabled value="">Choose...</option>
          <option v-for="r in lastNameRanges" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>
    </form>

    <div class="flex justify-center -mx-[15px]" aria-live="polite">
      <div class="w-full bs-lg:basis-[50%] bs-lg:max-w-[50%] px-[15px]">
        <div v-if="advisor" v-editable="advisor" class="flex mt-6 -mx-[15px]">
          <div class="basis-[41.666667%] grow-0 shrink-0 max-w-[41.666667%] px-[15px]">
            <!-- A photo that fails to load leaves the space blank, as on usu.edu, instead of showing its alt text -->
            <img
              v-if="advisor.image?.filename"
              :key="advisor.image.filename"
              :src="advisor.image.filename"
              :alt="advisor.image.alt || advisor.name || ''"
              class="block w-full h-auto mb-4"
              @error="($event.target as HTMLImageElement).style.visibility = 'hidden'"
            >
          </div>
          <div class="basis-[58.333333%] grow-0 shrink-0 max-w-[58.333333%] px-[15px] wrap-anywhere">
            <h4 :class="[mocaHeading.h4, 'mt-4 mb-0']">{{ advisor.name }}</h4>
            <p class="mb-4">{{ advisorTitle }}<template v-if="lastName"><br>{{ lastName }}</template></p>
            <p v-if="advisor.phone || advisor.email" class="mb-4">
              <!-- Phone links keep the text color on usu.edu -->
              <template v-if="advisor.phone"><a :href="`tel:${advisor.phone}`">{{ advisor.phone }}</a><br></template>
              <a v-if="advisor.email" :href="`mailto:${advisor.email}`" :class="link">{{ advisor.email }}</a>
            </p>
            <p v-if="mocaLinkHref(advisor.appointment_link)" class="mb-4">
              <a :href="mocaLinkHref(advisor.appointment_link)" target="_blank" rel="noopener" :class="[mocaButtonClass('btn-bright-light', false, 'btn-sm'), 'mt-4']">
                {{ blok.button_text || 'Schedule an Appointment' }}
              </a>
            </p>
          </div>
        </div>

        <p v-else-if="matches" :class="[mocaHeading.h3, 'mb-2 text-center', mocaColors['bright-light']!.text]">
          {{ blok.error_message }}
        </p>

        <div v-else-if="undecided" class="mt-6">
          <p :class="[mocaHeading.h3, 'mb-2 text-center']">{{ blok.undecided_title }}</p>
          
          <MocaRichText :doc="blok.undecided" :class="cards" />
        </div>
      </div>
    </div>
  </div>
</template>
