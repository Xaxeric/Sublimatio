/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./src/**/*.{html,js}", "./js/**/*.{html,js}"],
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
          cyan: "#00f0ff",
          amber: "#f59e0b",
          rose: "#F32626",
          emerald: "#10b981",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-sublimate": "sublimate 0.8s ease-out forwards",
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
      },
    },
  },
  plugins: [],
};
