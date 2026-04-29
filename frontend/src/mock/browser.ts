/**
 * MSW 浏览器 Worker — 在浏览器环境中启动 Service Worker 拦截网络请求。
 *
 * 使用方式（main.tsx）：
 *   import { startMockService } from "./mock/browser";
 *   startMockService().then(() => { mount app });
 */

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

let worker: ReturnType<typeof setupWorker> | null = null;

export async function startMockService(): Promise<void> {
  // 当用户明确设置 VITE_USE_MOCKS=false 时跳过 mock
  if (import.meta.env.VITE_USE_MOCKS === "false") return;

  if (!worker) {
    worker = setupWorker(...handlers);
  }

  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
}

export async function stopMockService(): Promise<void> {
  if (worker) {
    await worker.stop();
    worker = null;
  }
}
