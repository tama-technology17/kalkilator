# AGENTS.md

## Project

Static SPA (HTML/CSS/JS) — no build step, no bundler, no package manager.

## Quick Start

Open `index.html` in a browser or serve from any static file server. No install needed.

## Gotchas

- Google Sign-In requires a valid Client ID in `index.html:52` (`data-client_id`). The current one may be expired or unauthorized for local dev.
- Currency converter fetches live rates from `https://open.er-api.com/v6/latest/USD` — fails silently if offline.
- UI language is Indonesian (`lang="id"`).
- Adding a new "app" (view): create a `<div class="wrapper hidden" id="new-app">` in HTML, add a `<button class="nav-btn" data-target="new-app">` in sidebar nav, and handle visibility toggling in `script.js`.
- All views are toggled via the `.hidden` class (`display: none !important`).
- Skeleton loader shows on first page load for ~800ms then fades out. Dismiss logic is in `script.js` DOMContentLoaded.
