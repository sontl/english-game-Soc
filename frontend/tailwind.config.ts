import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF8A80",
        secondary: "#FFD180",
        accent: "#8C9EFF",
        success: "#69F0AE",
        bubblegum: "#FF80AB",
        mint: "#A5F2D4",
        sky: "#B3E5FC",
        lavender: "#D1C4E9"
      },
      fontFamily: {
        fun: ["'Fredoka'", "'Baloo 2'", "Nunito", "system-ui", "sans-serif"],
        rounded: ["Nunito", "system-ui", "sans-serif"],
        dyslexic: ["OpenDyslexic", "Nunito", "system-ui"]
      },
      dropShadow: {
        bubbly: "0 15px 35px rgba(255, 138, 128, 0.25)",
        glow: "0 8px 24px rgba(140, 158, 255, 0.25)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" }
        },
        sway: {
          "0%, 100%": { transform: "rotate(2deg)" },
          "50%": { transform: "rotate(-2deg)" }
        }
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "float-delayed": "float 10s ease-in-out infinite",
        sway: "sway 12s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;
