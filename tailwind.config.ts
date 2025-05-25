import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#35D07F",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#FBCC5C",
          foreground: "#000000",
        },
        border: "#e5e7eb",
        card: "#ffffff",
      },
    },
  },
  plugins: [],
};
export default config;
