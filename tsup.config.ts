import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/react/index.ts", "src/contract/index.ts", "src/ws/index.ts"],
  format: ["esm", "cjs"],
  outExtension({ format }) {
    return { js: format === "esm" ? ".mjs" : ".cjs" };
  },
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ["react", "viem", "@tanstack/react-query", "socket.io-client"],
});
