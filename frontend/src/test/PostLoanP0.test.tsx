import { render, screen } from "@testing-library/react";
import { App as AntApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "@/pages/Monitor/Dashboard";
import Workbench from "@/pages/Risk/Workbench";
import { theme } from "@/theme";

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <ConfigProvider theme={theme} locale={zhCN}>
      <AntApp>
        <MemoryRouter>{ui}</MemoryRouter>
      </AntApp>
    </ConfigProvider>,
  );
}

describe("post-loan P0 interview flow", () => {
  test("dashboard presents the core warning-monitoring board metrics", () => {
    renderWithProviders(<Dashboard />);

    expect(screen.getByText("今日预警概览")).toBeInTheDocument();
    expect(screen.getByText("总预警数")).toBeInTheDocument();
    expect(screen.getAllByText("红灯").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("黄灯").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("处置率")).toBeInTheDocument();
    expect(screen.getByText("预警类型分布")).toBeInTheDocument();
    expect(screen.getByText("模型效果监控")).toBeInTheDocument();
    expect(screen.getByText(/PSI: 0\.08/)).toBeInTheDocument();
    expect(screen.getByText(/KS: 0\.42/)).toBeInTheDocument();
    expect(screen.getByText(/命中率: 68%/)).toBeInTheDocument();
    expect(screen.getByText("待处置预警列表")).toBeInTheDocument();
  });

  test("workbench presents customer details, risk profile, and disposal actions", () => {
    renderWithProviders(<Workbench />);

    expect(screen.getByText("客户信息")).toBeInTheDocument();
    expect(screen.getByText("预警详情")).toBeInTheDocument();
    expect(screen.getByText("命中规则")).toBeInTheDocument();
    expect(screen.getByText(/RULE_023/)).toBeInTheDocument();
    expect(screen.getByText("风险画像")).toBeInTheDocument();
    expect(screen.getByText(/近3个月涉诉3起/)).toBeInTheDocument();
    expect(screen.getByText("处置操作")).toBeInTheDocument();
    expect(screen.getByText("电话核实")).toBeInTheDocument();
    expect(screen.getByText("上门走访")).toBeInTheDocument();
    expect(screen.getByText("要求增信")).toBeInTheDocument();
    expect(screen.getByText("提前回收")).toBeInTheDocument();
    expect(screen.getByText("处置记录")).toBeInTheDocument();
  });
});
