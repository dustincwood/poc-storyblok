# Dry run: Advisors

Source: `C:/development/mc-sites/USU/advising/advisors/index.pcf`
Published: https://www.usu.edu/advising/advisors/
Output: `scripts\migrate-mc\out\advising\advisors\index.story.json` (nothing was sent to Storyblok)

## Page

- **Title:** Advisors
- **Description:** Utah State University's advising community resources for training and development. 
- **Side navigation:** (none selected); **banner gallery:** showGallery
- The `page` block has no fields for the title, description or side-nav setting yet; they're listed here only.

## Blocks generated

- `moca-hero-banner` × 1
- `moca-container` × 1
- `moca-text` × 7
- `moca-heading` × 3
- `moca-row` × 1
- `moca-column` × 3
- `moca-profile-card` × 3
- `moca-info-block` × 1
- `moca-box` × 2
- `moca-button` × 2


## Lost (not representable in the target blocks)

- **Rich text formatting:** `scope` "col" on `<th>` can not be transformed to rich text.



## Components not migrated

- 950 (CP Directory Feed (All Sites)): Custom Modern Campus development: renders <cpfeed> from tagged directory profiles. Needs its own data source in Storyblok (e.g. tagged person stories or the directory API); address later


## Assets to upload

- https://www.usu.edu/advising/advisors/images/advisor-banner.png
- https://www.usu.edu/advising/images/advisors/kotynek-shelly.jpg
- https://www.usu.edu/advising/images/advisors/rasmuson-madison.jpg
- https://www.usu.edu/advising/images/advisors/roholt-kaylee.jpg
- https://www.usu.edu/advising/advisors/images/theskinny.png


## Links into this site (kept as URLs; should become story links)

- https://www.usu.edu/advising/advisors/advising-guide
- https://www.usu.edu/advising/advisors/professional-development


## Other notes

- Directory feed 1: its 3 people were copied from the published page as moca-profile-cards (name and photo no longer link to the directory); they won't update when the directory does
