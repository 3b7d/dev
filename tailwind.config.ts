import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted-foreground) / <alpha-value>)",
        "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
        electric: "rgb(var(--primary) / <alpha-value>)",
        cyanx: "rgb(var(--primary) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        success: "#10B981",
        border: "rgb(var(--border) / 0.9)",
        card: "rgb(var(--card) / <alpha-value>)",
        "surface-secondary": "rgb(var(--surface-secondary) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-tajawal)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 0 18px rgba(37, 99, 235, 0.14)",
        premium: "0 16px 36px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
