// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import cloudflare from "@astrojs/cloudflare";
import { fileURLToPath } from "node:url";

const srcDir = fileURLToPath(new URL("./src", import.meta.url));
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
    for (const [fileName, chunk] of Object.entries(bundle)) {
      if (
        chunk.type === "chunk" &&
        fileName.includes("_@astro-renderers_") &&
        !chunk.code.includes("alexbon MessageChannel polyfill")
      ) {
        chunk.code = `${messageChannelPolyfill}\n${chunk.code}`;
      }
    }
  },
});

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
    plugins: [messageChannelPolyfillPlugin()],
    resolve: {
      alias: {
        "@": srcDir,
      },
    },
  },
});
