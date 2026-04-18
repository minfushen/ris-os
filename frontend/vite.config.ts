import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── React 框架核心：react / react-dom / scheduler
          // 必须先于 recharts 匹配，防止 react-dom 被拉进 vendor-charts
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          // ── 图表库：recharts + decimal.js-light
          // 约 400KB，只在 AnalysisDetail 用，单独隔离
          // 懒加载路由确保它不进首屏
          if (
            id.includes("/node_modules/recharts/") ||
            id.includes("/node_modules/decimal.js-light/")
          ) {
            return "vendor-charts";
          }
        },
      },
    },
  },
});
