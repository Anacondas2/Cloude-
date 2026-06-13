import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#04110b",
          900: "#06180f",
          850: "#082014",
          800: "#0a2818",
          700: "#0e3522",
          600: "#13442c",
          500: "#1b5e3a",
        },
        emerald2: {
          500: "#1fd07a",
          400: "#34e08c",
          300: "#5cf0a8",
        },
        lime2: {
          400: "#a3e635",
          300: "#bef264",
        },
        cream: "#eef3ed",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        "neu-out":
          "8px 8px 24px rgba(0,0,0,0.55), -6px -6px 20px rgba(40,90,60,0.10)",
        "neu-in":
          "inset 4px 4px 12px rgba(0,0,0,0.55), inset -3px -3px 10px rgba(40,90,60,0.10)",
        glow: "0 0 0 1px rgba(52,224,140,0.35), 0 0 28px rgba(31,208,122,0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "translateX(-120%) skewX(-12deg)", opacity: "0" },
          "40%": { opacity: "0.8" },
          "100%": { transform: "translateX(220%) skewX(-12deg)", opacity: "0" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        sweep: "sweep 0.9s ease-out",
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
