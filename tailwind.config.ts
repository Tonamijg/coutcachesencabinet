import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2f8",
          100: "#dbe4f0",
          200: "#b6c8e0",
          300: "#8fa9cd",
          400: "#5c7ead",
          500: "#3a5a85",
          600: "#28436a",
          700: "#1c3252",
          800: "#152742",
          900: "#0f1c30",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
