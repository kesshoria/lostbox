/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surface tokens (CSS variables so we can swap themes cleanly)
        surface: {
          base: "rgb(var(--surface-base) / <alpha-value>)",
          raised: "rgb(var(--surface-raised) / <alpha-value>)",
          overlay: "rgb(var(--surface-overlay) / <alpha-value>)",
          inset: "rgb(var(--surface-inset) / <alpha-value>)",
        },
        border: {
          subtle: "rgb(var(--border-subtle) / <alpha-value>)",
          strong: "rgb(var(--border-strong) / <alpha-value>)",
        },
        content: {
          primary: "rgb(var(--content-primary) / <alpha-value>)",
          secondary: "rgb(var(--content-secondary) / <alpha-value>)",
          muted: "rgb(var(--content-muted) / <alpha-value>)",
          inverse: "rgb(var(--content-inverse) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          hover: "rgb(var(--accent-hover) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
          contrast: "rgb(var(--accent-contrast) / <alpha-value>)",
        },
        status: {
          home: "rgb(var(--status-home) / <alpha-value>)",
          borrowed: "rgb(var(--status-borrowed) / <alpha-value>)",
          lost: "rgb(var(--status-lost) / <alpha-value>)",
          discarded: "rgb(var(--status-discarded) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
      },
      fontSize: {
        // Body text minimum 16px per brief
        body: ["1rem", { lineHeight: "1.5" }],
      },
      borderRadius: {
        card: "0.875rem",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.03)",
        raised:
          "0 4px 16px -4px rgba(0,0,0,0.18), 0 1px 3px -1px rgba(0,0,0,0.08)",
      },
      spacing: {
        // Safe-area-friendly spacing for mobile
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
      transitionTimingFunction: {
        // Subtle, professional easing — no springy bounce
        calm: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};
