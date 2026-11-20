import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  // Vitest only covers the frontend; backend/ has its own Jest setup.
  test: {
    include: ["src/**/*.test.{js,jsx}"],
  },
});
