import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png", "pwa-192.png", "pwa-512.png", "pwa-512-maskable.png", "robots.txt"],
      manifest: {
        name: "Where Did I Put It?",
        short_name: "Where Is It",
        description:
          "Local-first household item finder. Find anything in your home in under 10 seconds.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#0a0a0b",
        theme_color: "#0a0a0b",
        categories: ["productivity", "utilities", "lifestyle"],
        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      // Use injectManifest mode so the service worker is bundled by
      // Vite (using esbuild, which works on Termux) instead of by
      // Workbox's internal terser-based bundler (which hangs on
      // Android ARM with "Unexpected early exit. This happens when
      // Promises returned by plugins cannot resolve.").
      //
      // We provide our own minimal sw.ts that uses the Workbox runtime
      // directly. Vite bundles it with esbuild (no terser), so it
      // works on Termux.
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectRegister: "auto",
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    target: "es2020",
    sourcemap: false,
    // Disable minification on the main bundle. Terser (Vite's default
    // minifier) can hang or fail on Termux (Android ARM) due to
    // worker_threads memory issues. Without minify, the bundle is
    // larger but the build completes reliably. For a personal-use PWA
    // served over localhost / Cloudflare Pages, this is fine.
    // (If you have a desktop machine available, you can re-enable
    // minify: "esbuild" there to get a smaller bundle for production.)
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          db: ["dexie", "dexie-react-hooks"],
        },
      },
    },
  },
});
