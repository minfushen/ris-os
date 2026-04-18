import { render, screen } from "@testing-library/react";
import { App as AntApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { MemoryRouter } from "react-router-dom";
import Home from "@/pages/Home";
import { theme } from "@/theme";

function renderHome() {
  return render(
    <ConfigProvider theme={theme} locale={zhCN}>
      <AntApp>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </AntApp>
    </ConfigProvider>
  );
}

describe("Home shell", () => {
  test("renders the new workbench skeleton", () => {
    renderHome();

    expect(screen.getByText("工作项中心")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("关键词")).toBeInTheDocument();
    expect(screen.getAllByText("自动审批率跌 5%").length).toBeGreaterThanOrEqual(1);
  });
});
