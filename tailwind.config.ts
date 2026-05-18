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
        background: "#050816",
        foreground: "#F8FAFC",
        muted: "#94A3B8",
        electric: "#3B82F6",
        cyanx: "#22D3EE",
        success: "#10B981",
        border: "rgba(148, 163, 184, 0.16)",
        card: "rgba(15, 23, 42, 0.66)",
      },
      fontFamily: {
        sans: ["var(--font-tajawal)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 0 42px rgba(34, 211, 238, 0.18)",
        premium: "0 24px 90px rgba(0, 0, 0, 0.38)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      backgroundImage: {
        "tech-grid":
          "linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
