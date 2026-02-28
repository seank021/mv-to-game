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
        primary: "#FF6B9D",
        background: "#0D0D2B",
        success: "#4ECDC4",
        danger: "#FF6B6B",
        warning: "#FFE66D",
        surface: "#1A1A3E",
        "surface-light": "#2A2A5E",
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        sans: ['"Pretendard"', "sans-serif"],
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "blink-fast": "blink 0.5s step-end infinite",
        pulse: "pulse 1s ease-in-out infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        glow: "glow 2s ease-in-out infinite",
        typing: "typing 0.05s steps(1)",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        slideUp: {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px #FFE66D, 0 0 10px #FFE66D" },
          "50%": { boxShadow: "0 0 20px #FFE66D, 0 0 40px #FFE66D" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
