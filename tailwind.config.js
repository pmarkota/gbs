/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 1s ease-out",
        slideUp: "slideUp 0.8s ease-out",
        pulse: "pulse 2s infinite",
        glow: "glow 2s infinite",
        overlaySlide: "overlaySlide 1.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(212, 175, 55, 0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.5)" },
        },
        overlaySlide: {
          "0%": { transform: "translateY(50vh)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
