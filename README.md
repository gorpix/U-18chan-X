# U-18Chan Viewport Fit + OP Comments

Version 1.0

The two U-18Chan banner-ad containers are hidden but deliberately left in the document, allowing their banner-image requests to load without displaying them. The overlapping content-responsibility/DMCA notice is removed. The board navigation, title, and description are consolidated into a compact header pinned to the top of the viewport. Its measured height is applied to the page and index gallery automatically, preventing overlap and reclaiming the old ad space even when the header wraps at narrower window widths.

Fits expanded post images inside the visible browser area while preserving their aspect ratio:

- portrait images are limited by viewport height;
- landscape images are limited by viewport width;
- small images are not enlarged;
- normal clicks retain U-18Chan's expand/collapse behavior;
- **Shift-click** a fitted image to toggle its original dimensions.

On index boards, the extension reads U-18Chan's actual gallery structure (`#gallery_body .item`) and adds each topic's first-post comment directly beneath `.Subject`. Topic comments load only as cards approach the viewport, with at most two requests active at once.

Index cards use a uniform height so floated rows remain aligned. Comments appear as white text in a padded, scrollable box; long comments scroll inside the card instead of changing its height. The comment box includes one additional text line while the card height grows by the same amount, preserving row alignment.

Each box also shows `X replies · X images`, with the E-Hentai control kept on that same metadata row. Comments and counts are cached in `sessionStorage`, so revisiting or reloading an index during the same tab session avoids repeat topic requests. Only cards within 200px of the viewport begin loading.

The index now fills all available horizontal space with an auto-fitting grid. The bottom-right **Thumbnails: Small/Large** switch changes between 210px/150px and 300px/230px card/thumbnail sizing; the selected mode is saved for later visits. Both modes preserve aspect ratio without cropping and keep every row aligned.

An **Infinite scroll: On/Off** switch appears beside the thumbnail control and is off by default. When enabled, reaching the bottom fetches exactly the next numbered index page, appends its topic cards, and then waits until the new bottom is reached. Appended cards use the same lazy OP-comment loader, two-request limit, cache, and deduplication as the first page. The setting is saved across visits.

On the Furry Comics and Gay Furry Comics boards and indices, each card has a **Find E-Hentai** button. The same button appears beside the OP subject in individual thread view. It makes no external request until clicked. Gay boards search with the exact `m:furry$` tag; the other furry boards use `f:furry$`. Bracketed subject text and `by Artist` lines are treated as optional artist hints when scoring results. A confident result turns into an **E-Hentai · N pages** link; otherwise the button reports **None matched**. Matches are cached for 30 days, misses for 7 days, and multiple clicks are queued at least 3.2 seconds apart.

Individual thread pages also gain inline quotes and backlinks. A plain click on a local `>>post` link toggles a compact preview containing that post's header, text, and thumbnail. Modifier-clicks preserve normal browser navigation. Every referenced post receives a deduplicated `Replies: >>post` backlink list.

Image fitting is pure CSS against U-18Chan's actual `is-expanded` marker. It therefore applies to individual expansion and **Expand all images** without monitoring or rescanning the page.

## Greasemonkey / Tampermonkey installation

1. Open your userscript manager.
2. Create a new script.
3. Replace the template with the contents of `u18chan-viewport-fit.user.js`.
4. Save it, then reload U-18Chan.

## Unpacked Chromium installation

1. Open `chrome://extensions` (or `brave://extensions`, `edge://extensions`, etc.).
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `chromium` folder in this package.
5. Reload U-18Chan.

Chromium will request access to `e-hentai.org` solely for user-triggered gallery searches. The userscript declares the equivalent narrow userscript-manager connection permission.

Use either the userscript or the Chromium extension, not both at once.

## Why the script uses detection instead of one site class

U-18Chan rejects non-browser page fetching, and imageboard themes/engines can use different expanded-image class names. This script recognizes explicit expanded/full-size classes, full-size image URLs inside image links, and the common hidden-thumbnail-plus-expanded-image pattern. A mutation observer also handles images inserted after the initial page load.
