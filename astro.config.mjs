// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import cloudflare from "@astrojs/cloudflare";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));
// Load-bearing, do not remove. dist/_worker.js/index.js statically imports the renderers
// chunk, and react-dom/server's browser build runs `new MessageChannel()` unguarded at
// module scope. workerd has no MessageChannel, so without this the worker throws
// "ReferenceError: MessageChannel is not defined" at startup and every SSR route 500s.
// Verified 2026-08-13: enabling nodejs_compat does NOT provide it either.
const messageChannelPolyfill = `/* alexbon MessageChannel polyfill */
if (typeof globalThis.MessageChannel === "undefined") {
  class PolyfillPort {
    constructor() {
      this.peer = void 0;
      this.onmessage = null;
    }
    start() {}
    close() {
      this.peer = void 0;
      this.onmessage = null;
    }
    postMessage(value) {
      const target = this.peer;
      if (!target || typeof target.onmessage !== "function") {
        return;
      }
      queueMicrotask(() => {
        target.onmessage?.({ data: value });
      });
    }
    setPeer(port) {
      this.peer = port;
    }
  }
  class PolyfillMessageChannel {
    constructor() {
      this.port1 = new PolyfillPort();
      this.port2 = new PolyfillPort();
      this.port1.setPeer(this.port2);
      this.port2.setPeer(this.port1);
    }
  }
  globalThis.MessageChannel = PolyfillMessageChannel;
}`;
const messageChannelPolyfillPlugin = () => ({
  name: "alexbon-cloudflare-messagechannel-polyfill",
  apply: "build",
  enforce: "post",
  generateBundle(_options, bundle) {
    // Match on content, not on chunk file name: the previous `_@astro-renderers_` name
    // check would silently stop applying if an Astro or Vite upgrade renamed the chunk,
    // and React SSR would then die in workerd at runtime instead of at build time.
    // Nothing needs patching in the client bundle, so an empty pass here is expected.
    // Browsers already have MessageChannel, so the client bundle must not carry this.
    // Guarded in the fail-safe direction: an unknown environment still gets patched,
    // because over-patching only wastes bytes while under-patching breaks the worker.
    if (this.environment?.name === "client") return;
    for (const chunk of Object.values(bundle)) {
      if (chunk.type !== "chunk") continue;
      if (!/\bnew MessageChannel\b/.test(chunk.code)) continue;
      if (chunk.code.includes("alexbon MessageChannel polyfill")) continue;
      chunk.code = `${messageChannelPolyfill}\n${chunk.code}`;
    }
  },
});

export default defineConfig({
  output: "server",
  trailingSlash: "always",
  // Astro 7 defaults to 'jsx' whitespace rules, which can drop spaces between inline
  // elements. Keep the HTML-aware behaviour so the upgrade does not change rendering.
  compressHTML: true,
  adapter: cloudflare({
    imageService: "passthrough",
  }),
  i18n: {
    defaultLocale: "ua",
    locales: ["ua", "ru", "en"],
    routing: {
      prefixDefaultLocale: true,
      // Astro 6 flipped this default from true to false; set explicitly to keep behaviour.
      redirectToDefaultLocale: true,
    },
  },
  integrations: [react(), mdx()],
  vite: {
    plugins: [messageChannelPolyfillPlugin()],
    resolve: {
      alias: {
        "@": srcDir,
      },
    },
  },
});
