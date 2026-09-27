/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from https://harshagarwal2412-cell.github.io/carrier-agent-cockpit/ on GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? "/carrier-agent-cockpit/" : "/",
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
