// Polyfill MessageChannel for Cloudflare Workers where it may be missing.
if (typeof globalThis.MessageChannel === "undefined") {
  type MessageHandler = ((event: { data: unknown }) => void) | null;

  class PolyfillPort {
    onmessage: MessageHandler = null;
    private peer?: PolyfillPort;

    // Keep TypeScript happy when compiled to JS.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    start() {}

    close() {
      this.peer = undefined;
      this.onmessage = null;
    }

    postMessage(value: unknown) {
      const target = this.peer;
      if (!target || !target.onmessage) {
        return;
      }
      queueMicrotask(() => {
        target.onmessage?.({ data: value });
      });
    }

    setPeer(port: PolyfillPort) {
      this.peer = port;
    }
  }

  class PolyfillMessageChannel {
    port1: PolyfillPort;
    port2: PolyfillPort;

    constructor() {
      this.port1 = new PolyfillPort();
      this.port2 = new PolyfillPort();
      this.port1.setPeer(this.port2);
      this.port2.setPeer(this.port1);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).MessageChannel = PolyfillMessageChannel;
}
