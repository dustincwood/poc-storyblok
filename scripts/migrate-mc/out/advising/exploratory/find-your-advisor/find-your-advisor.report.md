# Dry run: Find Your Advisor

Source: `C:/development/mc-sites/USU/advising/exploratory/find-your-advisor.pcf`
Published: https://www.usu.edu/advising/exploratory/find-your-advisor
Output: `scripts\migrate-mc\out\advising\exploratory\find-your-advisor\find-your-advisor.story.json` (nothing was sent to Storyblok)

## Page

- **Title:** Find Your Advisor
- **Description:** Schedule a time to meet with your advisor and gather information about the next step in your path
- **Side navigation:** (none selected); **banner gallery:** showGallery
- The `page` block has no fields for the title, description or side-nav setting yet; they're listed here only.

## Blocks generated

- `moca-hero-banner` × 1
- `moca-container` × 1
- `moca-row` × 4
- `moca-column` × 7
- `moca-text` × 38
- `moca-box` × 3
- `moca-image` × 1
- `moca-heading` × 1
- `moca-button` × 1


## Lost (not representable in the target blocks)

- **Column classes:** <div class="form-group col-lg-4">: form-group; <div class="form-group col-lg-4 d-none">: form-group
- **Heading classes:** <label class="h4 text-bright-light text-bold">: text-bright-light text-bold
- **Wrapper classes:** <select class="form-control">; <div class="d-none">; <div class="card my-1">; <div class="card-body">
- **Rich text formatting:** `id` "advisorContact" on `<p>` can not be transformed to rich text.; `class` "h3 text-bright-light d-none text-center" on `<p>` can not be transformed to rich text.; `id` "errorMessage" on `<p>` can not be transformed to rich text.; `class` "text-center h3" on `<p>` can not be transformed to rich text.; `class` "m-0" on `<p>` can not be transformed to rich text.
- **Button classes:** "Schedule an Appointment": mt-3 text-access




## Assets to upload

- https://www.usu.edu/advising/images/advisors/USU_Placeholder_Directory.png



## Advisor finder (advisor-finder.mjs)

The form and advising.js were replaced by one moca-advisor-finder: 17 advisor entries from
https://www.usu.edu/advising/_resources/scripts/advising.js, 23 locations, 8 focus areas and
5 undecided advisors from the page. The blocks generated above are superseded.
