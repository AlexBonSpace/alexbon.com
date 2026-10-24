import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    // Only the project's own tests: without this Vitest also runs the copies inside
    // .claude/worktrees/* (Claude Code worktrees), doubling the suite locally.
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setupTests.ts"],
    pool: "threads",
    coverage: {
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx,js,jsx}"],
      exclude: ["src/content/**/*", "src/components/**/*.astro", "dist/**/*"],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
