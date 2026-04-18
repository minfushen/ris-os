/**
 * Bundle 分析脚本
 * 用法：node scripts/analyze-bundle.mjs
 * 输出：每个 chunk 的大小 + 前 N 大模块来源
 */
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const result = await build({
  root,
  plugins: [react()],
  resolve: { alias: { "@": resolve(root, "src") } },
  build: {
    rollupOptions: { output: {} },
    write: false,          // 不写磁盘，只分析
    reportCompressedSize: false,
  },
  logLevel: "silent",
});

// result 是 RollupOutput[]
const outputs = Array.isArray(result) ? result : [result];

for (const output of outputs) {
  const chunks = output.output
    .filter((c) => c.type === "chunk")
    .map((c) => ({
      name: c.fileName,
      size: Buffer.byteLength(c.code, "utf8"),
      modules: Object.entries(c.modules ?? {})
        .map(([id, m]) => ({ id: id.replace(root, ""), size: m.renderedLength }))
        .sort((a, b) => b.size - a.size)
        .slice(0, 5),
    }))
    .sort((a, b) => b.size - a.size);

  console.log("\n=== Chunk 分析（按大小降序）===\n");
  for (const chunk of chunks) {
    const kb = (chunk.size / 1024).toFixed(1);
    console.log(`📦 ${chunk.name}  ${kb} kB`);
    for (const mod of chunk.modules) {
      const modKb = (mod.size / 1024).toFixed(1);
      if (mod.size > 1000) {
        console.log(`   └─ ${mod.id}  ${modKb} kB`);
      }
    }
  }
}
