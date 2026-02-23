import { context } from "esbuild"

const isDev = process.argv.includes("--watch")

const ctx = await context({
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "esm",
  outdir: "dist",
  sourcemap: isDev,
  minify: !isDev,
  tsconfig: "tsconfig.json",
  alias: {
    "@controllers": "./src/controllers",
    "@types": "./src/types",
    "@utils": "./src/utils",
  }
})

if (isDev) {
  await ctx.watch()
  console.log("👀 Watching...")
} else {
  await ctx.rebuild()
  await ctx.dispose()
  console.log("✅ Build finished")
}