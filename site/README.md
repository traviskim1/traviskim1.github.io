# Travis Kim — personal website

Local, responsive personal website built from `../personal-website-outline.md`. Nothing has been published. All supplied text, project titles, news order, and research statuses are retained, with the later requested edits: portrait on the left; no tk logo or standalone university/section labels; no caption instruction on 2026 Selects; Alignment without Personas credited to “SPAR Research mentored by Matthew Khoriaty”.

## Run locally

Use Node.js 22.13 or later and npm. In a terminal:

```sh
cd /Users/traviskim/Documents/CS/personal_website/site
npm ci
npm run dev
```

Open the URL printed in the terminal (normally http://127.0.0.1:3000). Changes refresh automatically. Stop with Ctrl+C. Dependencies are already installed in this workspace, so `npm ci` is only needed on a new checkout or after dependency changes.

To check the production version:

```sh
npm run typecheck
npm run build
npm run preview
```

The static preview is at http://127.0.0.1:4173. All public output is in `dist/client/`. Do not open HTML files directly from Finder; use the preview server.

## Update content

Edit **`content/site.json`**. It holds the biography, portrait, contact links, CV URL, six news entries, three research entries, and eleven projects. No component edits are necessary for ordinary content updates. `biographyLinks` maps lab names in the biography to their URLs; `emailDisplay` controls the small obfuscated address under the name. Email, LinkedIn, and CV icons sit under the portrait. Keep the three `[here]` markers in the biography: they map, in order, to the CV, publication, and sewing project links. Restart/rebuild after changing build-time environment settings.

Missing values should remain empty strings (`""`) or empty arrays (`[]`). They produce labeled placeholders or inactive links. No email address, social platform, paper URL, photo metadata, lift results, or personal description has been invented.

### Photos

Put image files in **`public/media/`**. Subfolders are already provided for `portrait`, `research`, and each project slug. Use optimized JPG, WebP, PNG, or AVIF images; around 1600–2400 px wide is usually sufficient for gallery images. Set the portrait path and alt text in `portrait` and `portraitAlt`:

```json
"portrait": "/media/portrait/travis.jpg",
"portraitAlt": "Your description of the portrait"
```

A research entry uses `image`. A project uses `cover` for its card (otherwise its first photo is used), plus `photos` for the gallery. Photo order in the array is gallery order. Replace the empty photo array with entries shaped like this, using your own values:

```json
"photos": [
  {
    "src": "/media/2026-selects/your-photo.jpg",
    "alt": "Describe what appears in this photo",
    "location": "",
    "camera": "",
    "lens": "",
    "focalLength": "",
    "aperture": "",
    "shutterSpeed": "",
    "iso": "",
    "caption": ""
  }
]
```

Enter location and settings only when known. ISO is entered without the `ISO` prefix. Other settings can include their units (`50 mm`, `f/2.8`, `1/250 s`). Empty fields are omitted; when all location/settings data is absent, the caption says it is to be added. Photography captions reveal on hover and keyboard focus, and tap/Enter/Space pins them. Tap again unpins them; Escape dismisses them. Sewing/powerlifting photos can use a simple `src`, `alt`, and optional `caption`.

### Descriptions and lift results

Set each project's `description`. On powerlifting projects, set `reflections` and `results`, e.g. objects with `lift` and `result` keys; enter your actual numbers **with units**. `\n` in description/reflection strings makes a line break. The detail page puts galleries first and descriptions/reflections afterward.

### Links and video

- `cvUrl`: your Google Drive URL. Both CV links then open it directly.
- `email`: your email address, without `mailto:`.
- `profiles`: replace the pending entry with objects containing your chosen `label` and `url`.
- Research `url`: a paper/project destination. Keep voice-clone research `status` as `In Progress` until ready; its biography link activates only when both `status` is `Published` and `url` is supplied.
- Research `status`: exactly `Published` or `In Progress`; filters follow this value.
- `news[].url`: fill the missing Helicon destinations when available. `news[].linkText` specifies the exact phrase to show in bold accent color and link; the rest of the announcement remains plain text. Missing URLs keep the phrase emphasized but inactive. The supplied news array is displayed in order.
- Fiction project `url`: activates its card directly to the literary publication.
- Navy Selvedge Jeans `videoUrl`: paste a YouTube watch, short, share, or embed URL. Supported URLs become the featured embedded video. The video stays before the gallery.
- Project `supportingUrl` / `supportingLabel`: fabric/vendor links shown after the gallery and description.

## Design and source files

- `app/globals.css`: responsive layout, main palette (`#479064`, `#9DA3D7`, `#C78666`), category colors, and caption treatments. Darker related shades keep small text readable.
- `app/page.tsx`: Home biography and news.
- `app/research/page.tsx` and `components/research-list.tsx`: Research and its filters.
- `app/fun-projects/page.tsx` and `components/project-list.tsx`: Personal Interests and category filters.
- `app/fun-projects/[slug]/page.tsx`: gallery pages, YouTube, descriptions, and lift results.
- `components/photo-gallery.tsx`: photography captions.
- `components/site-header.tsx`: top navigation.

Design references inspected before implementation: [Karan Ahuja](https://karan-ahuja.com/), [Fai Poungpeth](https://fai-poungpeth.github.io/), [publications](https://fai-poungpeth.github.io/publications/), [Fun Projects](https://karan-ahuja.com/fun_projects/index.html), and [Glass Blowing](https://karan-ahuja.com/glass_blowing.html). Layout and stylesheet inspection informed the typography, filters, project cards, and photo-first galleries. No reference imagery was copied.

## Eventual GitHub Pages publishing — not performed

This is a static export with ordinary internal links; no server or database is required after building. The build creates directory `index.html` files so gallery URLs can be opened directly, and includes `.nojekyll` for underscore-prefixed assets. This packaging step also avoids a trailing-slash redirect issue in the pinned Vinext exporter.

For a repository named `YOUR_USERNAME.github.io`, use the normal `npm run build`. For a project repository served at `YOUR_USERNAME.github.io/REPOSITORY/`, build with:

```sh
NEXT_PUBLIC_BASE_PATH=/REPOSITORY npm run build
NEXT_PUBLIC_BASE_PATH=/REPOSITORY npm run preview
```

Publish only the contents of `dist/client/` when ready, typically through a GitHub Pages Actions workflow that runs `npm ci` and `npm run build`. No workflow, remote repository, or deployment was created. Keep `node_modules`, `.env` files, and generated build folders out of source control.

## Validation

Production export and TypeScript checks are run during implementation. DOM-based interaction checks cover research filters and the empty Published state, all project category counts, inactive fiction cards, arrow-key filter focus, and tap/focus/Escape caption behavior. Static output checks cover every local route and referenced asset, supplied text, and pending links. A connected browser is unavailable in this session, so visual desktop/mobile QA remains to be checked in your browser; responsive rules are implemented at 850, 620, and 390 px.

The homepage sewing link carries `?from=home`; both project back arrows return to Home for that entry point. Project cards and direct gallery links default to Personal Interests.

Personal Interests blurbs are editable in `content/site.json` → `interests`. Each has a `category`, `phrase`, and `blurb`; blurbs support `[link text](https://...)` and `*italic titles*`. Popovers open on hover or tap/click; keyboard users can focus the phrase and press Enter/Space, reach the links with Tab, and dismiss with Escape. Project `date` values use `YYYY-MM`; cards and detail pages display the full month and year and sort descending with stable same-month ordering. Existing `/fun-projects/` URLs stay unchanged.
