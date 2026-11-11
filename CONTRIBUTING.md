# Contributing to Where Did I Put It?

Thanks for your interest in improving this app! The project is MIT-licensed
and open to contributions of all sizes — bug fixes, new features, accessibility
improvements, translations, documentation, even just typo fixes.

## Ways to contribute

- 🐛 **Report a bug** — open an issue with steps to reproduce + screenshots
- 💡 **Suggest a feature** — open an issue with the use case (not just the solution)
- 🔧 **Submit a pull request** — fix a bug, implement a feature, improve docs
- 🌍 **Translate the UI** — see "Internationalization" below
- ♿ **Improve accessibility** — audit with `axe-core`, test with a screen reader
- 📝 **Improve docs** — typos, clearer explanations, more examples

## Before you start

1. **Search existing issues** — your bug or idea might already be reported
2. **Open an issue first** for any non-trivial change — discussing the approach
   before writing code saves everyone's time
3. **Keep PRs small and focused** — one feature/fix per PR is much easier to review

## Development setup

You'll need:

- Node.js 18+ (Node 20 recommended)
- npm 9+ (comes with Node)
- A modern browser (Chrome, Firefox, Safari, Edge)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/lostbox.git
cd lostbox

# Install dependencies
npm install

# Start the dev server (with hot reload)
npm run dev
# → open http://localhost:5173 in your browser

# Build for production (also runs TypeScript type-check)
npm run build

# Preview the production build locally
npm run preview
# → open http://localhost:4173 in your browser
```

## Project structure

See `README.md` → "Project structure" for the full tree. Quick orientation:

- `src/lib/` — pure logic (search, photos, export, import, filters, types)
- `src/db/` — IndexedDB data-access layer (Dexie)
- `src/hooks/` — React hooks (debounce, object URLs)
- `src/components/` — reusable UI primitives + feature components
- `src/pages/` — top-level routes (Home, Items, ItemDetail, Locations, Containers, Settings)
- `src/styles/` — Tailwind setup + theme tokens
- `public/` — static assets (icons, favicon, _redirects, _headers)
- `src/sw.ts` — service worker source (bundled by Vite via injectManifest)

## Coding conventions

- **TypeScript strict mode** — no `any`, no `@ts-ignore`. If a type is genuinely
  unknown, use `unknown` and narrow it.
- **Tests** — for any non-trivial `src/lib/` change, add a test in
  `scripts/tests/` that can be run with `node --experimental-strip-types`.
  For UI changes, add a Playwright E2E test in `scripts/verify-phase*.mjs`.
- **No backend** — the app stays 100% local-first. Don't add features that
  require a server. (Cloud sync is a future option, but it'll be opt-in.)
- **Privacy** — never add tracking, analytics, or third-party scripts. The
  `Content-Security-Policy` in `public/_headers` blocks them anyway.
- **Accessibility** — every interactive element must be reachable by keyboard
  and have an accessible name. New components should match the existing
  patterns (e.g. `Modal` for dialogs, `Button` for buttons).

## Commit message style

No strict format, but please use a clear subject line under 60 characters
that says what changed:

```
Add "Mark as Lost" button to item detail page
Fix toast not showing after merge-mode import
Update README license section to clarify CC BY-ND 4.0
```

## Pull request process

1. Fork the repo + create a feature branch (`git checkout -b feature/mark-as-lost`)
2. Make your changes, commit them with clear messages
3. Run `npm run build` — make sure it passes with no TypeScript errors
4. If you added/changed UI behavior, add a Playwright E2E test
5. Open a PR with a clear description of what changed + why
6. Reference any related issues ("Fixes #12", "Closes #5")

That's it — your PR will be reviewed as soon as possible.

## Internationalization (i18n)

The app is currently English-only. If you want to add a translation:

1. Open an issue first to coordinate (so two people don't translate the same
   language in parallel)
2. We'll extract all UI strings to a `src/locales/en.json` file as a baseline
3. You translate that file to `src/locales/<your-language>.json`
4. We'll wire up a language picker in Settings

This is a future feature — the i18n infrastructure isn't in place yet, so
please open an issue before starting translation work.

## Questions?

Open an issue with the `question` label, or email the maintainer:
**[kesshoria@gmail.com](mailto:kesshoria@gmail.com)**

— Kesshoria
