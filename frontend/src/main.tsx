import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider, App as AntApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import { theme } from "@/theme";
import App from "./App";

async function bootstrap() {
  // 开发/演示模式：VITE_USE_MOCKS 未显式设为 false 时启动 MSW mock 层
  if (import.meta.env.VITE_USE_MOCKS !== "false") {
    const { startMockService } = await import("./mock/browser");
    await startMockService();
  }

  const rootEl = document.getElementById("root")!;
  createRoot(rootEl).render(
    <StrictMode>
      <ConfigProvider theme={theme} locale={zhCN}>
        <AntApp>
          <App />
        </AntApp>
      </ConfigProvider>
    </StrictMode>,
  );
}

bootstrap();
