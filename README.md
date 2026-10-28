# U-18chan-X

Userscript v1.3 for improving U-18Chan's catalog and thread views.

## Changelog

### v1.3

- Quotes and backlinks nest: links inside an inline preview open their own preview.
- Hovering a quote or backlink lightens the referenced post if it's on screen, otherwise shows it next to the pointer.
- E-Hentai matching only on comics boards (/c/, /gc/ and their indexes).
- Fixed board detection on `/board/u18chan/<board>/topic/...` URLs (tab title and E-Hentai button).

### v1.2

- Shift-click a thumbnail (collapsed or expanded) to view it at original size.
- Catalog cards are a single box with the comment under the thumbnail; fixed titles overlapping thumbnails.
- Header ad hidden (still loads) without leaving empty space; removed "Page generated in…" line.
- Failed catalog loads retry; infinite scroll backs off on errors and keeps loading short pages.
- Added auto-update URLs.

## Added

- Responsive catalog grid with small/large thumbnail modes.
- OP comments plus reply and image counts on catalog cards.
- Optional infinite scrolling through older catalog pages.
- User-triggered E-Hentai matching with page counts on comics cards and threads.
- Nestable inline previews for quotes and backlinks, hover highlighting, and wheel-click jump navigation.
- Descriptive tab titles using the board name or thread subject.
- Compact fixed site header.
- Shift-click to view an image at its original dimensions.

## Fixed

- Expanded images fit inside the viewport, including **Expand all images**.
- Catalog rows stay aligned when comments differ in length.
- Catalog content no longer overlaps the header or responsibility notice.
- E-Hentai page counts no longer include digits from timestamps.
- Banner ads are hidden while their image elements remain available to load.

## Installation

1. Install Tampermonkey, Violentmonkey, or Greasemonkey.
2. Open the [userscript](https://raw.githubusercontent.com/gorpix/U-18chan-X/main/u18chan-viewport-fit.user.js).
3. Confirm installation in your userscript manager, then reload U-18Chan.
