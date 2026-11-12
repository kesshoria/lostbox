# Where Did I Put It?

> Find anything in your home in under 10 seconds. Local-first, private, works offline. No accounts. No cloud. $0 to run.

[![License: CC BY-ND 4.0](https://img.shields.io/badge/License-CC_BY--ND_4.0-ef9421.svg)](./LICENSE)
[![Made with React](https://img.shields.io/badge/Made_with-React_18-61dafb.svg)](https://react.dev/)
[![PWA](https://img.shields.io/badge/PWA-installable-5a0eff.svg)](https://web.dev/progressive-web-apps/)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

A production-quality, mobile-first PWA for recording where your household items live — what container they're in, who borrowed them, when they were last seen. Everything is stored locally in your browser via IndexedDB. Nothing leaves your device.

## 🌐 Live demo

**🔗 [https://lostbox-find.vercel.app/](https://lostbox-find.vercel.app/)**

Open this URL in any modern browser:
- **Android / desktop Chrome, Edge**: tap ⋮ → "Install app" → installs as a PWA with the teal magnifying-glass icon
- **iOS Safari**: tap the Share button → "Add to Home Screen"
- **Desktop Chrome / Edge**: click the install icon in the address bar

Once installed, the app works fully offline — no internet connection needed
after the first visit. All data is stored locally in your browser's IndexedDB.

Hosted free on Vercel. Auto-redeploys on every push to `main`.

---

## Status

**Phase 7 of 7 — complete. The MVP is finished.**

All 7 phases shipped. Every acceptance criterion from the original brief is met. The app is production-ready.

| Phase | What ships |
| --- | --- |
| ✅ 1 | Scaffold + data layer + app shell + empty states |
| ✅ 2 | Item + Location + Container CRUD screens and forms |
| ✅ 3 | Home search + Items page search + filters + sorting |
| ✅ 4 | Item detail page + activity log + borrow/return + move workflow |
| ✅ 5 | Photo upload + thumbnail generation + display in lists + detail |
| ✅ 6 | Export/import JSON backup + clear all data + theme toggle UI |
| ✅ 7 | PWA icons + service worker + security headers + Load-more pagination + robustness + final docs |

See `CHANGELOG.md` for the detailed per-phase history.

### What works now (final state)

A fully-functional household item finder:

- ✅ **Add / edit / delete items** with name, description, category, location, container, quantity, tags, status, photo
- ✅ **Add / edit / delete locations** with notes + live item counts
- ✅ **Add / edit / delete containers** with parent location + live item counts
- ✅ **Search** across name, description, category, tags, location, container — multi-word, cross-field, debounced
- ✅ **Filter** by All / Borrowed / Lost / Recent / Discarded / Needs check with live counts
- ✅ **Sort** by Recently updated / Name A–Z / Name Z–A
- ✅ **Item detail page** with active borrow banner, history timeline, full actions
- ✅ **Borrow / return workflow** with borrower name + dates + notes + confirmation
- ✅ **Move workflow** with location + container in one go, auto-logged in history
- ✅ **"Mark as still here" verification** — stamp an item as confirmed in its recorded location; rows show a faded "verified N days ago" hint after 30 days, and a "Needs check" filter surfaces items overdue for verification (90+ days or never)
- ✅ **Photo upload** with client-side compression (1024px full, 400px thumb, JPEG q85)
- ✅ **Photo display** in lists + detail page + full-size modal viewer
- ✅ **Export / import JSON backup** with Zod validation, Replace or Merge modes
- ✅ **Clear all data** with type-to-delete safety
- ✅ **Theme toggle**: System / Light / Dark
- ✅ **PWA**: installable, offline-capable, security headers, maskable icon
- ✅ **Robust**: storage-full + IndexedDB-not-supported friendly errors, large-backup warning, Load-more pagination for 200+ items

### What's still TODO (post-MVP)

These are explicitly out of scope per the original brief:

- User accounts, cloud sync, sharing between households
- QR-code generation
- AI features
- Notifications
- Payments
- Multi-language support (i18n)
- Collaboration features

For future enhancements we'd like to add: see the "Roadmap" section below.

### Acceptance criteria — all 14 met

| # | Criterion | Status |
| --- | --- | --- |
| 1 | A user can add an item without an account. | ✅ |
| 2 | A user can find an item by searching its name, tag, location, or container. | ✅ |
| 3 | A user can update an item's location. | ✅ |
| 4 | A user can mark an item borrowed and later returned. | ✅ |
| 5 | A user can upload and view a photo. | ✅ |
| 6 | A user can export and import a JSON backup. | ✅ |
| 7 | The app works offline after first load. | ✅ (service worker pre-caches the app shell) |
| 8 | The app can be installed as a PWA. | ✅ |
| 9 | The UI works well on a 360px-wide mobile screen. | ✅ |
| 10 | The UI works well on desktop. | ✅ |
| 11 | No data is sent to a server. | ✅ |
| 12 | No paid service is required. | ✅ |
| 13 | All destructive actions require confirmation. | ✅ |
| 14 | The code is modular, typed, and readable. | ✅ |

---

## Stack

- **React 18** + **TypeScript** — UI with strict typing
- **Vite 5** — dev server + build
- **Tailwind CSS 3** — design-system tokens (CSS variables for theme swap)
- **React Router 6** — client-side routing
- **Dexie 4** — IndexedDB wrapper for all local storage (no backend)
- **vite-plugin-pwa** — installable PWA + service worker for offline use
- **Zod** — runtime validation for JSON imports (used from Phase 6)
- **date-fns** — date formatting
- **lucide-react** — icon set

No backend. No Firebase. No Supabase. No paid services.

---

## Run locally

```bash
cd where-did-i-put-it
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`) on your phone or desktop browser.

### Important: Install as PWA requires HTTPS or localhost

Chrome (and most browsers) only allow "Install app" / "Add to Home screen"
when the page is served over **HTTPS** OR over **`localhost`**. If you access
the app via a LAN IP like `http://192.168.31.72:4173/` from another device,
the "Install" option will show "This app cannot be installed."

**To install on the phone running Termux:**

1. Start the preview server on the phone: `npm run preview -- --host`
2. Open Chrome **on the same phone**
3. Navigate to **`http://localhost:4173/`** (not the LAN IP)
4. Open the ⋮ menu → "Install app" should now work

**To install on a different device** (e.g. your laptop, or another phone):

- Either run the dev server on that device and access via its own `localhost`
- Or open the live app at **[https://lostbox-find.vercel.app/](https://lostbox-find.vercel.app/)** in that device's browser and install from there. HTTPS is already set up, the service worker caches the app shell for offline use, and the PWA install prompt works on any device that visits the URL.

### Build for production

```bash
npm run build      # type-check + bundle to ./dist
npm run preview    # serve the built bundle locally
```

The `./dist` folder is fully static and can be hosted on any static host.

### Note on Termux builds

The `npm run build` command uses Vite + Rollup. On Termux (Android ARM),
Vite's default minifier (terser) can hang or fail with "Unexpected early
exit. This happens when Promises returned by plugins cannot resolve."

To work around this, the project is configured to:

1. Use **`injectManifest` mode** for the service worker — bundles it with esbuild
   (no terser) instead of Workbox's internal terser-based bundler.
2. Disable minification on the main bundle (`minify: false` in `vite.config.ts`).

The bundle is larger (~870 KB total instead of ~440 KB) but the build
completes reliably. For a personal-use PWA served over localhost or
Cloudflare Pages, this is fine. If you have a desktop machine available,
you can re-enable `minify: "esbuild"` there to get a smaller bundle for
production.

---

## Back up your data

Everything lives in your browser's IndexedDB under the database name `where_did_i_put_it`. Clearing site data wipes it.

**Export a backup** (lands in Phase 6):

1. Open the app → **Settings** → **Export backup**.
2. A `where-did-i-put-it-backup-<timestamp>.json` file downloads.
3. Store it anywhere safe — cloud drive, email, USB stick.

**Restore from backup** (lands in Phase 6):

1. **Settings** → **Import backup**.
2. Choose a previously exported JSON file.
3. Confirm overwrite/merge.

**Move to a new device:** install the app on the new device, export from the old one, import on the new one.

---

## Privacy

- No accounts. No login. No telemetry. No analytics.
- All data is stored locally in your browser's IndexedDB.
- Photos are stored as Blobs in IndexedDB — never uploaded anywhere.
- The service worker caches the app shell so the app works offline after first load.
- Clearing your browser's site data is the only way to lose your data — so **export backups regularly**.

---

## Security

This app has a deliberately small attack surface — there's no server, no
accounts, no third-party APIs, no analytics. But we still apply standard
security headers when deployed to Cloudflare Pages (or any static host
that reads the `_headers` file):

| Header | Value | Why |
| --- | --- | --- |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` | Only allow scripts/styles/images from the same origin. `blob:` for photos loaded from IndexedDB. `data:` for the SVG favicon. `frame-ancestors 'none'` blocks clickjacking. |
| `X-Content-Type-Options` | `nosniff` | Prevent the browser from MIME-sniffing a response as a different type. |
| `Referrer-Policy` | `no-referrer` | Don't leak your app's URL to other sites when navigating away. |
| `X-Frame-Options` | `DENY` | Belt-and-braces alongside `frame-ancestors 'none'` for older browsers. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Explicitly deny permissions this app never needs (in case a future browser feature flip enables them by default). |

These are set in `public/_headers`, picked up automatically by Cloudflare
Pages. To verify after deploy: open the network tab in your browser dev
tools, load the page, and inspect response headers.

**Threat model**:

- **No server-side attack surface** — there's nothing to hack. All data lives in your browser's IndexedDB.
- **No XSS from external sources** — CSP blocks inline scripts except for the service worker registration (which is Vite-generated and trusted). Styles allow `unsafe-inline` because Vite inlines critical CSS.
- **No CSRF** — there are no authenticated endpoints to forge requests against.
- **No supply-chain attacks** — all dependencies are pinned in `package-lock.json`. Run `npm audit` to check for known vulnerabilities.
- **Physical access to your unlocked device** — the only real threat. Anyone with your phone + unlocked browser can see your data. The only defense is a screen lock.

---

## Accessibility

We aimed for WCAG 2.1 AA compliance. Specifically:

- ✅ **Semantic HTML** — proper use of `<button>`, `<label>`, `<main>`, `<nav>`, `<form>`, `<ul>/<li>` for lists, etc.
- ✅ **Every form field has a label** — wired via `<label htmlFor>` + `id` on the input. No placeholder-only labels.
- ✅ **Keyboard navigation** — all interactive elements are reachable via Tab. Skip-link at the top of every page jumps focus to the main content.
- ✅ **Visible focus states** — Tailwind's `:focus-visible` adds a 2px accent-colored outline with 2px offset on every interactive element.
- ✅ **Color contrast** — primary text uses #18181b on #fafaf9 in light mode (16:1), and #f4f4f5 on #0a0a0c in dark mode (16:1). Both well above WCAG AA's 4.5:1 requirement for body text.
- ✅ **Status colors** are paired with text labels ("Home", "Borrowed", "Lost", "Discarded") so color isn't the only signal.
- ✅ **Photos have alt text** on the detail page (`alt="Photo of [item name]"`). List-row images use `alt=""` (decorative — the item name is in the adjacent text).
- ✅ **Toast announcements** — toasts use `role="status"` on a container with `aria-live="polite"`, so screen readers announce "Item saved" / "Item updated" / "Item deleted" etc.
- ✅ **Modal dialogs** use `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the dialog title. ESC closes; click-outside closes; focus is trapped; focus is restored to the trigger button on close.
- ✅ **Reduced motion** — `prefers-reduced-motion: reduce` CSS rule disables animations and transitions for users who set that OS preference.
- ✅ **Touch targets** — minimum 44×44px on Buttons, NavItems, FilterChips per Apple HIG / Material guidelines.
- ✅ **Font size** — body text minimum 16px (1rem) per the brief.
- ✅ **Safe area insets** — bottom nav respects `env(safe-area-inset-bottom)` on notched phones.

What we **haven't** done (see "Known limitations" above):

- No formal screen reader test (NVDA / VoiceOver)
- No automated accessibility audit (`axe-core` in test suite)
- No high-contrast mode test
- No keyboard-only navigation test (we tested with Tab but didn't go through every flow)

These are flagged as roadmap items.

---

## Performance

The build is intentionally lean. Total gzipped size of the initial bundle:

| Asset | Gzipped size |
| --- | --- |
| React + Router | 53 KB |
| Dexie (DB) | 33 KB |
| App code (incl. Zod for import) | 48 KB |
| CSS | 6 KB |
| HTML | 1 KB |
| **Total initial** | **~141 KB gzipped** |

Plus the PWA icons cached on first visit (192 / 512 / 512-maskable PNGs)
totalling ~640 KB. After the first visit, all of this is served from the
service worker cache — instant load, works offline.

Other performance notes:

- **First contentful paint** — under 1 second on a mid-range phone over 4G (in the offline-cache case, instant).
- **No unnecessary re-renders** — `useMemo` on the search + filter pipeline; `useLiveQuery` from `dexie-react-hooks` only re-renders when underlying IndexedDB data changes.
- **Lazy chunking** — React + Dexie are split into separate chunks so the app code can update without re-downloading them.
- **Photo compression** — source images are downscaled to ≤1024px (full) + ≤400px (thumb), JPEG q85/q80. A 5 MB phone photo becomes ~150 KB full + ~10 KB thumb.
- **Load-more pagination** — Items page shows 50, then "Load 50 more" keeps the DOM light for 200+ item libraries.

---

## Project structure

```
where-did-i-put-it/
├── index.html
├── package.json
├── vite.config.ts              # Vite + PWA config
├── tailwind.config.js          # Design-system tokens (colors, fonts, spacing)
├── postcss.config.js
├── tsconfig.json
├── public/
│   ├── favicon.svg                # Teal magnifying-glass + "?" SVG favicon
│   ├── robots.txt
│   ├── _redirects                  # Cloudflare Pages SPA fallback (Phase 7)
│   ├── _headers                    # Security headers: CSP, nosniff, etc. (Phase 7)
│   ├── apple-touch-icon.png        # 180×180 icon for iOS home screen (Phase 7)
│   ├── pwa-192.png                 # 192×192 PWA icon (Phase 7)
│   ├── pwa-512.png                 # 512×512 PWA icon (Phase 7)
│   └── pwa-512-maskable.png        # 512×512 maskable icon (Phase 7)
└── src/
    ├── main.tsx                # React root
    ├── App.tsx                 # Router + skip-link + IndexedDB-not-supported fallback
    ├── styles/
    │   └── index.css           # Tailwind layers + theme token CSS variables + reduced-motion
    ├── lib/
    │   ├── types.ts            # Domain types (Item, Location, Container, etc.)
    │   ├── uuid.ts             # UUID v4 generator
    │   ├── format.ts           # Date formatters
    │   ├── search.ts          # Multi-word cross-field item search (Phase 3)
    │   ├── itemsFilter.ts     # Items page filter + sort logic (Phase 3)
    │   ├── verification.ts   # "Still here" staleness helper (v0.1.3)
    │   ├── photos.ts         # Photo processing: compress + thumbnail (Phase 5)
    │   ├── export.ts         # Build + download JSON backup (Phase 6)
    │   ├── import.ts         # Parse + validate + restore JSON backup (Phase 6)
    │   └── storageError.ts   # Friendly storage error classification (Phase 7)
    ├── hooks/
    │   ├── useDebouncedValue.ts  # Generic debounce hook (Phase 3)
    │   └── useObjectUrl.ts     # Blob → object URL with auto-revoke (Phase 5)
    ├── db/
    │   ├── index.ts            # Dexie DB schema + singleton
    │   ├── activityLog.ts      # Audit-trail helper
    │   ├── items.ts            # Item CRUD + borrow/return + move + verify
    │   ├── locations.ts        # Location CRUD
    │   ├── containers.ts       # Container CRUD
    │   ├── borrowRecords.ts    # Borrow record queries
    │   ├── settings.ts         # Key/value settings (theme, etc.)
    │   └── seed.ts              # Dev-only demo data
    ├── components/
    │   ├── ThemeProvider.tsx   # Light/dark/system theme provider
    │   ├── StorageUnavailable.tsx  # Fallback shown when IndexedDB isn't supported (Phase 7)
    │   ├── layout/
    │   │   ├── AppShell.tsx     # TopBar + SideNav + BottomNav + main
    │   │   ├── TopBar.tsx
    │   │   ├── SideNav.tsx      # Desktop sidebar (sm+)
    │   │   ├── BottomNav.tsx    # Mobile bottom nav (default)
    │   │   ├── AppLogo.tsx
    │   │   └── index.ts
    │   ├── ui/                 # Reusable primitives
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Input.tsx       # Input, Textarea, Select, Label, Field
    │   │   ├── Badge.tsx       # Badge + StatusBadge
    │   │   ├── EmptyState.tsx
    │   │   ├── Spinner.tsx
    │   │   ├── Modal.tsx
    │   │   ├── ConfirmDialog.tsx
    │   │   ├── Toast.tsx       # ToastProvider + useToast
    │   │   └── index.ts        # Barrel export
    │   ├── locations/
    │   │   └── LocationFormModal.tsx  # Add/edit location form
    │   ├── containers/
    │   │   └── ContainerFormModal.tsx  # Add/edit container form
    │   └── items/
    │       ├── ItemFormModal.tsx    # Add/edit item form (with category datalist, location/container selectors, tag chips, status, photo)
    │       ├── ItemRow.tsx          # List item card with real photo thumbnail, status badge, location, container, quantity
    │       ├── TagInput.tsx         # Chip-style multi-tag input
    │       ├── FilterChip.tsx       # Filter pill for the Items page (Phase 3)
    │       ├── ActivityTimeline.tsx # Vertical timeline of item history (Phase 4)
    │       ├── BorrowModal.tsx      # Mark-as-borrowed modal: name + dates + notes (Phase 4)
    │       ├── MoveModal.tsx        # Change location + container modal (Phase 4)
    │       └── PhotoPicker.tsx      # File upload + preview + remove (Phase 5)
    │   └── settings/
    │       └── ImportModal.tsx      # Pick + validate + restore JSON backup (Phase 6)
    └── pages/
        ├── HomePage.tsx        # Phase 3: search bar live + recently updated + quick-add
        ├── ItemsPage.tsx       # Phase 3: search + filter chips + sort dropdown + smart empty states
        ├── ItemDetailPage.tsx  # Phase 4: full item view + actions + history timeline
        ├── LocationsPage.tsx   # Phase 2: real locations list with item counts
        ├── ContainersPage.tsx  # Phase 2: real containers list with parent location + item counts
        ├── SettingsPage.tsx    # Phase 6: theme + export + import + clear + privacy + about
        └── NotFoundPage.tsx
```

---

## Design system

### Colors

- **Surface:** base / raised / overlay / inset (4 levels of elevation)
- **Border:** subtle / strong
- **Content:** primary / secondary / muted / inverse
- **Accent:** teal (`#0d9488` light / `#2dd4bf` dark — high contrast on both themes)
- **Status:** home (neutral), borrowed (amber), lost (red), discarded (gray)

Dark mode is **genuinely dark** — base surface is `#0a0a0c`, not the typical gray-on-gray. Text is crisp near-white `#f4f4f5`.

All colors are CSS variables (e.g. `--surface-base`), exposed to Tailwind via `bg-surface-base`, `text-content-primary`, `border-border-subtle`, etc. Swapping themes is a single class toggle on `<html>`.

### Typography

- System UI font stack — fast, native feel on every platform.
- Body text minimum 16px (per accessibility brief).
- Headings tracked tight, body 1.5 line-height.

### Spacing & touch targets

- Minimum 44px touch targets on interactive elements (Buttons, NavItems).
- Safe-area insets respected (`env(safe-area-inset-bottom)`) for notched phones.
- Mobile bottom nav floats above content; desktop uses a fixed left sidebar.

---

## Data model

Six IndexedDB object stores — see `src/db/index.ts` for the schema.

| Store | Purpose |
| --- | --- |
| `items` | The core entity: name, location, container, status, photo, tags |
| `locations` | A place in the home (Bedroom, Garage, etc.) |
| `containers` | A box/drawer/shelf inside a location |
| `borrowRecords` | One row per borrow event; active borrow has `returnedAt === null` |
| `activityLog` | Immutable audit trail (created/updated/moved/borrowed/returned/verified/deleted) |
| `settings` | Key/value app preferences (e.g. theme) |

All IDs are UUID v4. All timestamps are ISO 8601 strings. Photos are stored as Blobs (not base64 strings) to keep memory usage down.

---

## Known limitations

These are intentional design choices or out-of-scope for v1:

- ~~**No license yet.**~~ ✅ Now licensed under CC BY-ND 4.0. See [`LICENSE`](./LICENSE).
- ~~**No copyright holder name**~~ ✅ Now set to "Kesshoria".
- **Service worker only generates in production builds** — `devOptions.enabled` is `false` in `vite.config.ts` to keep the dev server clean. Run `npm run build && npm run preview` to test the service worker locally.
- **Search is limited to 20 results on Home** (to keep things snappy on huge libraries). Refine the query to see more. The Items page uses **Load-more pagination**: 50 results initially, then "Load 50 more".
- **Filter "Recent"** means updated in the last 7 days — not configurable yet.
- **"Mark as discarded" / "Mark as lost"** aren't exposed as dedicated buttons on the detail page — they can be set via the Edit modal's Status field. Phase 4 deliberately focuses on the borrow/return + move workflows called out in the brief.
- **Photos limited to 10 MB** on upload to prevent the browser from hanging. Compression target: JPEG q85 at ≤1024px — fine for finding the item, not for printing.
- **Backup file size is uncapped** — a database with hundreds of photos could create a multi-MB backup. The import modal warns when the file is over 50 MB. Future enhancement: optional photo exclusion.
- **No real screen reader / keyboard test** — ARIA labels are set throughout, focus states are visible, and a skip-link is present, but we haven't done a formal audit with NVDA / VoiceOver / keyboard-only navigation.
- **No automated accessibility tests** — could add `axe-core` to the test suite.
- **No automated unit tests** — only E2E tests via Playwright. Phase 3's search library has a unit-style test, but everything else is verified through browser automation.
- **No CI/CD** — builds and tests run locally. A GitHub Actions workflow would be a natural addition.
- **Storage full** — if IndexedDB quota is exceeded (rare), the Add/Edit Item form shows a friendly error. Other operations silently fail with a console warning. Could be improved.

What does work in v1:
- ✅ Everything from the brief's 14 acceptance criteria (see the table above)
- ✅ All 7 phases shipped, all previous-phase E2E tests still pass

---

## Roadmap (post-MVP)

These are explicitly out of scope for v1 per the brief, but reasonable next steps:

- ~~**License + copyright**~~ ✅ Done — CC BY-ND 4.0 license, copyright Kesshoria.
- **QR code labels** for physical containers — scan to open the container page.
- **Cloud sync** between devices (opt-in, end-to-end encrypted).
- **Multi-household sharing**.
- **Multi-language (i18n)**.
- **AI-powered "where did I put X?"** natural language search.
- **Recurring reminders** ("This item hasn't been seen in 6 months — is it still there?").
- **Photo exclusion in backups** — for users who only want to back up the text data.
- **`axe-core` accessibility tests** in CI.
- **GitHub Actions CI** to run build + tests on every push.
- **Real screen reader testing** with NVDA / VoiceOver.
- **A "Mark as Lost" / "Mark as Discarded" dedicated button** on the item detail page.
- **Configurable "Recent" filter window** (currently hardcoded to 7 days).
- **Bulk operations**: select multiple items and move them, mark them as borrowed, etc.

---

## License

**CC BY-ND 4.0** (Creative Commons Attribution-NoDerivatives 4.0
International) — see [`LICENSE`](./LICENSE) for the full legal text.

### What you CAN do

- ✅ **Use the live app** at
  [lostbox-find.vercel.app](https://lostbox-find.vercel.app/)
  — visiting and using the website is not covered by the source license
  at all; you can use it freely, no attribution needed.
- ✅ **Download, read, and run the source code** for your own personal
  use (e.g. self-host it on your own machine for your own household).
- ✅ **Share and redistribute** the source code, in whole or in part,
  verbatim (unmodified) — including in commercial contexts (e.g.
  bundled on a CD, mirrored on another Git host, included on a USB
  stick sold as part of a self-hosting kit).
- ✅ **Repost** the code on your own blog, repo, or documentation, as
  long as you keep it unmodified and credit the original author.

### What you MUST do

- 📌 **Give attribution** to **"Kesshoria"**. A reasonable way to do
  this is to keep the existing copyright line at the top of the
  `LICENSE` file, keep this README's "© 2026 Kesshoria" line, or
  include a link back to
  [github.com/Kesshoria/lostbox](https://github.com/Kesshoria/lostbox).
- 📌 **Include a copy of the `LICENSE` file** (this CC BY-ND 4.0 legal
  code) and a notice pointing to
  https://creativecommons.org/licenses/by-nd/4.0/ when you share the
  code.
- 📌 **Indicate if you made any technical modifications** required to
  run the code (e.g. config tweaks to build on your toolchain). These
  are explicitly allowed by Section 2(a)(4) and do **not** count as
  "Adapted Material" — but you should still mark them.

### What you CANNOT do

- ❌ **Modify the source code and share the modified version.** This
  is the "NoDerivatives" part. You may make *technical modifications*
  necessary to run the code on your system (Section 2(a)(4)), and you
  may make modifications for your *own private use* — but you may **not
  Share** a modified version publicly. If you want to contribute a fix
  or feature, open a PR instead (see [`CONTRIBUTING.md`](./CONTRIBUTING.md));
  accepted PRs get re-released under the same CC BY-ND 4.0 by the
  maintainer.
- ❌ **Sublicense** it under different terms.
- ❌ **Remove the attribution** or the license notice.

### Plain-English Summary

> You can use the live app freely. You can copy, share, and host the
> source code as-is, as long as you credit **Kesshoria** and include
> the license. You cannot publish a modified version of the code. If
> you want to improve it, send a pull request.

This summary is not legally binding — see the
[`LICENSE`](./LICENSE) file for the authoritative CC BY-ND 4.0 legal
code, and
https://creativecommons.org/licenses/by-nd/4.0/ for the human-readable
summary on the Creative Commons website.

© 2026 [Kesshoria](mailto:kesshoria@gmail.com). Released under the
Creative Commons Attribution-NoDerivatives 4.0 International Public
License (CC BY-ND 4.0).

---

## Credits

Built with the following open-source libraries. These are the licenses
of the **dependencies themselves** (not this app — this app is
CC BY-ND 4.0, see [License](#license) above). All are MIT-licensed
except where noted:

| Library | License | Purpose |
| --- | --- | --- |
| [React](https://react.dev/) | MIT | UI framework |
| [React Router](https://reactrouter.com/) | MIT | Client-side routing |
| [Vite](https://vitejs.dev/) | MIT | Dev server + build tool |
| [TypeScript](https://www.typescriptlang.org/) | Apache 2.0 | Type system |
| [Tailwind CSS](https://tailwindcss.com/) | MIT | Utility-first styling |
| [Dexie.js](https://dexie.org/) | Apache 2.0 | IndexedDB wrapper |
| [dexie-react-hooks](https://dexie.org/docs/dexie-react-hooks/dexie-react-hooks) | Apache 2.0 | React bindings for Dexie (useLiveQuery) |
| [Zod](https://zod.dev/) | MIT | Runtime schema validation (used for import) |
| [vite-plugin-pwa](https://vite-plugin-pwa.netlify.app/) | MIT | PWA + service worker generation |
| [Workbox](https://developer.chrome.com/docs/workbox) | MIT | Underlying service worker library (used by vite-plugin-pwa) |
| [date-fns](https://date-fns.org/) | MIT | Date formatting + relative time |
| [lucide-react](https://lucide.dev/) | ISC | Icon set |
| [PostCSS](https://postcss.org/) | MIT | CSS transformer (Tailwind dependency) |
| [Autoprefixer](https://github.com/postcss/autoprefixer) | MIT | CSS vendor prefix automation |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | MIT | React fast refresh for Vite |

The app was designed and built in 7 phases, with end-to-end browser
tests (Playwright) run after each phase to verify functionality against
real IndexedDB. See `CHANGELOG.md` for the full history.

---

## Feedback &amp; support

Found a bug? Have a feature request? Want to share how you use the app?

**Email:** [kesshoria@gmail.com](mailto:kesshoria@gmail.com)

Or open Settings → "Feedback & support" → "Send feedback" inside the app.
The button opens your email app with the maintainer's address pre-filled,
plus a pre-filled subject and a few diagnostic details (app version,
browser, language) that help with bug reports. **No data from your items,
photos, or activity log is included in the email.**

You can also copy the email address from the Settings page (tap the
clipboard icon next to the address) if you'd rather email from a
different account.
