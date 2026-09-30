import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        risk: {
          low: "#22c55e",
          mod: "#eab308",
          high: "#f97316",
          very: "#ef4444",
          extreme: "#b91c1c",
        },
        slate: {
          950: "#070b14",
          900: "#0a0f1c",
          850: "#0d1526",
          800: "#162238",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
