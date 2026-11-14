/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        chakra: ['"Chakra Petch"', "sans-serif"],
        rajdhani: ['"Rajdhani"', "sans-serif"],
        mono: ['"Kode Mono"', "monospace"],
      },
      colors: {
        sublimatio: {
          bg: "#070b1f",
          dark: "#040714",
          surface: "#080d24",
          card: "rgba(8, 13, 36, 0.65)",
          border: "#0a102e",
          "border-glow": "#1a2868",
          accent: "#1a39ed",
          glow: "#20348d",
          text: "#c6cfff",
          subtle: "#a1a9d9",
          muted: "#6e78a7",
          tertiary: "#6e78a7",
          amber: "#f59e0b",
          red: "#F32626",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-sublimate": "sublimate 0.8s ease-out forwards",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-in forwards",
        "modal-in": "modal-in 0.2s ease-out",
        "modal-out": "modal-out 0.2s ease-in forwards",
        "slide-down": "slide-down 0.2s ease-out",
        "slide-up": "slide-up 0.2s ease-in forwards",
        "toast-in": "toast-in 0.25s ease-out",
        "toast-out": "toast-out 0.25s ease-in forwards",
      },
      keyframes: {
        sublimate: {
          "0%": { opacity: "1", transform: "scale(1)", filter: "blur(0px)" },
          "50%": {
            opacity: "0.6",
            transform: "scale(0.98)",
            filter: "blur(3px) brightness(1.8)",
          },
          "100%": {
            opacity: "0",
            transform: "scale(0.9)",
            filter: "blur(10px) brightness(2)",
          },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "modal-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "modal-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.96)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(-6px)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "toast-out": {
          from: { opacity: "1", transform: "translateX(0)" },
          to: { opacity: "0", transform: "translateX(16px)" },
        },
      },
    },
  },
  plugins: [],
};
