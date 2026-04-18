import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider, App as AntApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import { theme } from "@/theme";
import App from "./App";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <StrictMode>
    <ConfigProvider theme={theme} locale={zhCN}>
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </StrictMode>
);
