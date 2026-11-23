import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Tailwind v4 compiles through @tailwindcss/vite, not PostCSS. Prevent Vite
  // from discovering a parent checkout's legacy postcss.config.cjs.
  css: {
    postcss: {},
  },
  server: {
    port: 5173,
    open: false,
  },
  // Vitest only covers the frontend; backend/ has its own Jest setup.
  test: {
    include: ["src/**/*.test.{js,jsx}"],
  },
});
