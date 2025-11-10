import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF8A80",
        secondary: "#FFD180",
        accent: "#8C9EFF",
        success: "#69F0AE"
      },
      fontFamily: {
        rounded: ["Nunito", "system-ui", "sans-serif"],
        dyslexic: ["OpenDyslexic", "Nunito", "system-ui"]
      }
    }
  },
  plugins: []
} satisfies Config;
