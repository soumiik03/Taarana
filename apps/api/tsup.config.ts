import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts", "./src/server.ts"],
  noExternal: [
    "@teachyst",
    "@repo/logger",
    "@repo/database",
    "@repo/trpc",
    "@repo/inngest"
  ],
  splitting: false,
  bundle: true,
  outDir: "./dist",
  format: ["esm"],
  platform: "node",
  target: "node20",
  banner: {
    js: `import { createRequire } from "module"; const require = createRequire(import.meta.url);`,
  },
  clean: true,
  env: { IS_SERVER_BUILD: "true" },
  loader: { ".json": "copy" },
  minify: true,
  sourcemap: false,
});
