// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import cloudflare from "@astrojs/cloudflare";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  output: "server",
  trailingSlash: "always",
  adapter: cloudflare({
    imageService: "passthrough",
  }),
  session: {
    driver: "memory",
  },
  integrations: [react(), mdx()],
  vite: {
    resolve: {
      alias: {
        "@": srcDir,
      },
    },
  },
});
