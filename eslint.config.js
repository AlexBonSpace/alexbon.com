// @ts-check
import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import eslintPluginAstro from "eslint-plugin-astro";

export default [
  eslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // Warn about console.log, but allow console.warn and console.error
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // TypeScript handles this
      "no-undef": "off",
      // Disable base no-unused-vars rule in favor of @typescript-eslint version
      "no-unused-vars": "off",
      // Allow unused vars with _ prefix (common pattern for unused function params)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  ...eslintPluginAstro.configs.recommended,
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "src/lib/.cache/**",
      "scripts/.algolia-cache.json",
    ],
  },
];
