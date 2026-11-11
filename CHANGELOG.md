# Changelog

All notable changes to **Where Did I Put It?** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-11-10

The complete MVP, built in 7 phases. Every acceptance criterion from the
original brief is met. The app is production-ready and can be deployed to
any static host (Cloudflare Pages recommended — $0 forever).

### Post-Phase-7 (deploy prep) — License + GitHub readiness

- **MIT License added**: A proper `LICENSE` file with `Copyright (c) 2026 Kesshoria`.
  The MIT license is the most permissive widely-used open-source license —
  anyone can use, modify, distribute, sublicense, or sell the code, as long
  as they include the original copyright + license text.
- **Copyright holder set**: Kesshoria (matches the email in Settings → Feedback).
- **README polished for public GitHub**:
  - Added badge row (License: MIT, Made with React 18, PWA: installable, PRs welcome)
  - Added "🌐 Live demo" section near the top (with a placeholder for the
    Cloudflare Pages URL — to be filled in after deploy)
  - Replaced the "TBD" License section with a clean MIT summary + what users
    are free to do (use, modify, distribute, sublicense, sell)
  - Crossed out the "no license yet" + "no copyright holder" items in Known
    Limitations + Roadmap (both done)
- **`CONTRIBUTING.md` added**: A friendly guide for potential contributors
  explaining how to set up the dev environment, what coding conventions to
  follow, the PR process, and how to handle i18n translations.
- **`.gitignore` hardened**: Added entries for `*.tsbuildinfo`, `dev-dist-ssr`,
  `.env*` (so secrets don't accidentally get committed), and Playwright test
  artifacts (`test-results`, `playwright-report`, `playwright/.cache`).

### Post-Phase-7 — Feedback & support

- **Feedback card on Settings page**: A new card between "Privacy" and
  "Danger zone" with the maintainer's email (`kesshoria@gmail.com`) and a
  "Send feedback" button.
- **mailto: link with pre-filled body**: Tapping "Send feedback" opens the
  user's email app with the maintainer's address, a pre-filled subject
  ("Feedback for Where Did I Put It?"), and a body that includes a few
  diagnostic details (app version, platform, language, connection state,
  user-agent) that help with bug reports. **No user data** (items, photos,
  activity log) is included — only generic browser/OS info that's already
  visible to any website.
- **Copy email button**: A small clipboard icon next to the email address
  copies it to the clipboard — useful if the user wants to email from a
  different account, or if `mailto:` doesn't work on their device.
- **README update**: Added a "Feedback & support" section near the credits,
  with the email address and a link.

### Phase 7 — PWA + Robustness + Polish

- **PWA icons**: Generated 4 PNG icons (192, 512, 512-maskable, 180 apple-touch) showing a teal rounded-square with a white magnifying glass containing a "?" mark. Maskable variant keeps the glyph in the 80% safe zone.
- **Favicon**: Replaced the placeholder SVG with a matching magnifying-glass + "?" icon.
- **Manifest references**: `index.html` now references all icon sizes + the apple-touch-icon.
- **Cloudflare Pages SPA fallback**: Added `public/_redirects` with `/* /index.html 200` so deep links like `/items/abc` don't 404 on static hosts.
- **Security headers**: Added `public/_headers` with `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, and `Permissions-Policy: camera=(), microphone=(), geolocation=()`. Belts-and-braces for an app that doesn't use any of those.
- **Service worker**: `vite-plugin-pwa` generates a service worker in production builds. Pre-caches 18 entries (HTML, CSS, JS, all icon sizes, robots.txt) so the app shell loads instantly and works offline after first visit.
- **Reduced motion**: `prefers-reduced-motion: reduce` CSS rule already in place since Phase 1 — disables animations for users who set that OS preference.
- **Storage error handling**: When IndexedDB writes fail (e.g. quota exceeded), the Add/Edit Item form shows a friendly "Your browser's storage is full" error instead of a generic failure.
- **IndexedDB-not-supported fallback**: Added a `<StorageUnavailable>` component shown when the browser doesn't support IndexedDB at all (very old browsers or some private-mode sessions). Friendly message + suggestions.
- **Large backup warning**: Import modal now shows the file size in the preview, and warns "Large backup — import may take a few seconds" if the file is over 50 MB.
- **Load-more pagination**: Items page now shows the first 50 matching items, with a "Load 50 more" button to expand. Resets when search/filter/sort changes. Keeps the page snappy for libraries of 200+ items.
- **CHANGELOG.md**: This file.
- **README.md**: Major expansion — full feature list, deploy guide (Cloudflare Pages direct upload + Git integration), accessibility notes, privacy section, library credits, known limitations, future roadmap, license placeholder.
- **Removed unused**: cleaned up dynamic-import warning in SettingsPage.

### Phase 6 — Export/Import + Clear + Theme

- **Export backup**: Settings → Export backup downloads `where-did-i-put-it-backup-YYYY-MM-DD-HHMM.json`. Includes all items, locations, containers, borrow records, activity log, settings; photos serialized as base64 in a `photos` map keyed by itemId. Toast confirms with counts + size.
- **Import backup**: Modal with file picker. Parsed + validated with Zod — clear errors for invalid JSON or wrong structure. Preview shows item/location/container/borrow/activity/photo counts. Two modes: **Replace** (wipe then restore — recommended for moving devices) or **Merge** (add alongside existing, skip duplicates by ID). Confirm dialog with mode-specific warning. Photos restored from base64 to Blobs.
- **Clear all data**: Settings → Clear all data → confirmation dialog with **type-to-delete** safety (must type "delete" to enable the button). Wipes all 6 object stores. Toast confirms.
- **Theme toggle** (already live since Phase 1): System / Light / Dark radio buttons on Settings page.
- **Privacy card**: "Private by design" explanation in Settings.
- **App version** display.

### Phase 5 — Photo Upload

- **PhotoPicker component**: File picker + preview + remove. Accepts JPG, PNG, WEBP, GIF, BMP. Max 10 MB.
- **Client-side compression**: Source image loaded into canvas, downscaled to fit ≤1024px (full) and ≤400px (thumb), exported as JPEG q85 / q80. A 5 MB phone photo becomes ~150 KB full + ~10 KB thumb.
- **Storage as Blobs**: Photos stored in IndexedDB as Blobs (not base64) per the brief. Object URLs are created via `useObjectUrl` hook (auto-revokes on unmount/blob-change to prevent memory leaks).
- **ItemRow thumbnails**: Real `<img>` for the thumbnail in item lists on Home and Items page.
- **ItemDetailPage photo**: Larger thumbnail in the header card. Tap opens a full-size photo modal (max 60vh, ESC + click-outside + Close button to dismiss).
- **Edit flow**: Edit form pre-loads the existing photo. Remove clears it. Save persists.
- **Bug fix**: Toast portal was conditionally rendered (`{toasts.length > 0 && createPortal(...)}`) which crashed React when the toast's setTimeout cleanup fired during Modal transitions. Fixed by always mounting the portal container.

### Phase 4 — Item Detail + Borrow/Return + Move

- **ItemDetailPage** at `/items/:id`: Full item view with name, quantity, status badge, active borrow banner, "Where it lives" section (location + container + Change location button), Details section (description, tags, dates), Actions grid (Mark borrowed/returned, Change location, Edit details, Delete), History timeline.
- **ActivityTimeline** component: Vertical timeline showing all activity for an item — created, updated, moved, borrowed, returned, deleted — with icons and relative time ("3 minutes ago").
- **BorrowModal**: Mark as borrowed — collects borrower name (required), borrowed date (defaults today), expected return date (optional, validated not before borrowed date), notes. Sets status to "borrowed"; banner shows on detail page; "Borrowed" filter catches it.
- **Return workflow**: Confirmation dialog mentions borrower + dates. On confirm, status returns to "home" and a "Returned" entry appears in the timeline. Idempotent — safe to call when not borrowed.
- **MoveModal**: Change location + container in one go. Container selector filtered by location. Move auto-logs a "Moved" entry to the activity log.
- **Edge cases**: Visiting `/items/<invalid-id>` shows "Item not found" with back button. Mark borrowed with empty name → validation error. Mark borrowed twice → "Item is already borrowed" error. Validation errors don't close the modal.
- **Behavior change**: Tapping an item row now navigates to the detail page (was: opened edit modal directly). Edit is reachable from the detail page.

### Phase 3 — Search + Filters + Sort

- **Multi-word cross-field search**: `src/lib/search.ts` — tokenizes the query, matches all tokens as substrings across name, description, category, tags, location name, container name. Case-insensitive. Per the brief example, "hdmi tv" matches "HDMI cable" in "Drawer under TV".
- **Debounced search**: 200ms via `useDebouncedValue` hook.
- **Home page search bar**: Live results replace the "Recently updated" preview. Clear button (X). "No matching items" empty state with "Add this item" CTA when no results.
- **Items page search**: Same search bar, combined with filters.
- **Filter chips**: All / Borrowed / Lost / Recent (last 7 days) / Discarded — with live counts.
- **Sort dropdown**: Recently updated / Name A–Z / Name Z–A.
- **Filter + search combine**: "tv" search + Lost filter → only TV remote.
- **Smart empty states**: "No items yet" / "No matching items" / "No borrowed items" / "No items marked as lost" etc.

### Phase 2 — Item + Location + Container CRUD

- **Locations CRUD**: Add/edit/delete locations with notes. Item counts shown live. Delete with confirmation. Warns when deleting a location with items (items are kept, location cleared).
- **Containers CRUD**: Add/edit/delete containers with parent location selector. Item counts + parent location shown. Same delete behavior as locations.
- **Items CRUD**: Add/edit/delete items with name (required), description, category (with datalist autocomplete from existing categories), location, container (filtered by selected location), quantity, tags (chip-style input), status. Delete with confirmation. Toast after every save/update/delete.
- **Recently updated preview**: Home page shows top 5 most recently updated items.
- **Quick-add buttons**: On Home, Items, Locations, Containers — topbar + empty states.
- **All destructive actions require confirmation**: delete item, delete location, delete container.

### Phase 1 — Scaffold + Data Layer + App Shell

- **Stack**: Vite 5 + React 18 + TypeScript + Tailwind CSS 3 + React Router 6 + Dexie 4 (IndexedDB) + vite-plugin-pwa + Zod + date-fns + lucide-react.
- **Design system**: CSS-variable theme tokens for true dark mode + light mode. Teal accent. Status colors: home (neutral), borrowed (amber), lost (red), discarded (gray). Dark theme is genuinely near-black (#0a0a0c), not gray-on-gray.
- **Typography**: System UI font stack. Body text minimum 16px.
- **Mobile-first layout**: Bottom nav (mobile) + side nav (desktop). TopBar with logo + page title. AppShell wraps every page. Skip-link for keyboard users.
- **UI primitives**: Button (5 variants × 4 sizes), Card, Input/Textarea/Select/Label/Field, Badge/StatusBadge, EmptyState, Spinner, Modal (with focus trap + ESC + click-outside), ConfirmDialog (with type-to-confirm), Toast (ToastProvider + useToast).
- **ThemeProvider**: Light/dark/system, applied via `<html>` class. Cached in localStorage to avoid flash on reload. Source-of-truth pref stored in IndexedDB.
- **Data layer**: Dexie schema with 6 object stores (items, locations, containers, borrowRecords, activityLog, settings). All CRUD operations wrap activity log writes in transactions. UUIDs via `crypto.randomUUID()`. ISO 8601 timestamps.
- **Empty states**: All 5 routes (Home, Items, Locations, Containers, Settings) render with proper empty states + CTAs.
- **PWA manifest**: Generated by vite-plugin-pwa with name, short_name, description, start_url, scope, display: standalone, orientation: portrait, background_color, theme_color, categories, icons array.

### Pre-Phase 1 — Project brief

- 13-page product brief defining: product goal, target users, MVP scope (16 must-haves + 9 explicit non-goals), 5 core user flows, complete data model, 7 screens, UX requirements, technical requirements, search behavior, 14 edge cases, visual design direction, deliverables, 14 acceptance criteria, implementation order.

## Pre-release notes

- **License**: TBD. The README has a placeholder section; we'll pick a license (MIT, personal-use, etc.) in a future revision.
- **Copyright holder**: TBD. Same — placeholder in README.
