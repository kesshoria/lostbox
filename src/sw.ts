// ============================================================
// Service worker source — bundled by Vite (via esbuild) instead
// of by Workbox's internal terser-based bundler.
//
// Using injectManifest mode because Workbox's default GenerateSW
// mode uses @rollup/plugin-terser internally, which hangs or fails
// on Termux (Android ARM) with:
//   "Unexpected early exit. This happens when Promises returned by
//    plugins cannot resolve. Unfinished hook action(s) on exit:
//    (terser) renderChunk"
//
// This file uses Workbox's runtime API directly. Vite + esbuild
// bundle it (no terser) so it builds cleanly on Termux.
// ============================================================

/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim, setCacheNameDetails } from "workbox-core";

// Use a custom cache prefix so we don't collide with other apps on
// the same origin (e.g. if you have multiple PWAs on localhost).
setCacheNameDetails({ prefix: "wdipi" });

// Clean up any caches from older versions of the service worker.
cleanupOutdatedCaches();

// Tell the service worker to take control immediately on the first
// navigation, rather than waiting for all existing clients to close.
// This matches vite-plugin-pwa's autoUpdate behavior.
self.skipWaiting();
clientsClaim();

// Precache all the assets that vite-plugin-pwa has injected into
// `self.__WB_MANIFEST`. This is the same manifest that GenerateSW
// mode would use — it's a list of URLs + revision hashes computed
// at build time.
//
// `precacheAndRoute` registers a fetch handler that serves these
// assets from cache when offline, falling back to network when
// online. For everything else (HTML, dynamic routes), we use a
// navigateFallback strategy by also precaching index.html.
declare const self: ServiceWorkerGlobalScope;

// IMPORTANT: This file must contain EXACTLY ONE occurrence of
// `self.__WB_MANIFEST`. Workbox's injectManifest step looks for this
// token and replaces it with the precache manifest. If it appears
// more than once, the build fails with "AssertionError: Please
// ensure that your 'swSrc' file contains only one match".
const precacheManifest = self.__WB_MANIFEST || [];
precacheAndRoute(precacheManifest);

// For navigation requests (HTML pages), serve index.html from cache
// when offline. This makes the app work as an SPA even when offline —
// any deep link like /items/abc falls back to /index.html, which
// React Router then handles client-side.
//
// (Vite + React Router already handles this via the public/_redirects
// file on Cloudflare Pages, but for the offline case we also need it
// here in the service worker.)
import { registerRoute, NavigationRoute } from "workbox-routing";
import { createHandlerBoundToURL } from "workbox-precaching";

// Only register the navigation route if we actually precached
// index.html (which happens when the build has assets to cache).
if (precacheManifest.length > 0) {
  const handler = createHandlerBoundToURL("/index.html");
  const navigationRoute = new NavigationRoute(handler, {
    // Don't intercept direct requests for non-HTML assets.
    denylist: [/^\/assets\//, /^\/pwa-/, /^\/favicon/, /^\/robots\.txt/, /^\/_redirects/, /^\/_headers/, /^\/manifest\.webmanifest/],
  });
  registerRoute(navigationRoute);
}
