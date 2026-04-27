import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { App as AntApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { vi } from "vitest";
import { theme } from "@/theme";

async function renderAppAt(pathname: string) {
  cleanup();
  vi.resetModules();
  window.history.pushState({}, "", pathname);
  const { default: App } = await import("@/App");
  return render(
    <ConfigProvider theme={theme} locale={zhCN}>
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>,
  );
}

describe("App routing", () => {
  test("loads monitor dashboard from a normal browser path", async () => {
    await renderAppAt("/monitor/dashboard");

    expect(await screen.findByText("贷后预警监控大盘")).toBeInTheDocument();
    expect(await screen.findByText("今日预警概览")).toBeInTheDocument();
  });

  test("loads architecture narrative page from a normal browser path", async () => {
    await renderAppAt("/architecture/integration");

    expect(await screen.findByText("系统集成与闭环说明")).toBeInTheDocument();
    expect(await screen.findByText("系统集成架构图")).toBeInTheDocument();
    expect(await screen.findByText("数据流向图")).toBeInTheDocument();
    expect(await screen.findByText("监控驱动迭代")).toBeInTheDocument();
    expect((await screen.findAllByText("多渠道预警触达")).length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText("P2 暂缓能力边界")).toBeInTheDocument();
    expect((await screen.findAllByText("演示讲解")).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText("系统集成架构")).length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText("数据流向说明")).toBeInTheDocument();
    expect(await screen.findByText("闭环设计亮点")).toBeInTheDocument();
  });

  test("sidebar presents an interview demo information architecture", async () => {
    await renderAppAt("/monitor/dashboard");

    expect(await screen.findByText("平台首页")).toBeInTheDocument();
    expect(await screen.findByText("预警监控")).toBeInTheDocument();
    expect(await screen.findByText("处置闭环")).toBeInTheDocument();
    expect(await screen.findByText("策略与模型")).toBeInTheDocument();
    expect(await screen.findByText("模型工厂")).toBeInTheDocument();
    expect(await screen.findByText("模型版本库")).toBeInTheDocument();
    expect(await screen.findByText("决策流编排")).toBeInTheDocument();
    expect(await screen.findByText("仿真回溯")).toBeInTheDocument();
    expect(await screen.findByText("数据与特征")).toBeInTheDocument();
    expect(await screen.findByText("知识沉淀")).toBeInTheDocument();
    expect(await screen.findByText("智能体协同")).toBeInTheDocument();
    expect(await screen.findByText("预警归因 Agent")).toBeInTheDocument();
    expect(await screen.findByText("处置建议 Agent")).toBeInTheDocument();
    expect(await screen.findByText("策略调优 Agent")).toBeInTheDocument();
    expect(await screen.findByText("话术合规 Agent")).toBeInTheDocument();
    expect(await screen.findByText("复盘质检 Agent")).toBeInTheDocument();
    expect(await screen.findByText("Agent 运行监控")).toBeInTheDocument();
    expect(await screen.findByText("演示讲解")).toBeInTheDocument();
    expect(await screen.findByText("预警核查工作台")).toBeInTheDocument();
    expect(await screen.findByText("产品策略")).toBeInTheDocument();
    expect(await screen.findByText("系统集成架构")).toBeInTheDocument();
    expect(screen.queryByText("更多")).not.toBeInTheDocument();
  });

  test("loads agent collaboration pages from normal browser paths", async () => {
    await renderAppAt("/agents/attribution");

    expect((await screen.findAllByText("预警归因 Agent")).length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText("输入数据")).toBeInTheDocument();
    expect(await screen.findByText("推理过程")).toBeInTheDocument();
    expect(await screen.findByText("输出与边界")).toBeInTheDocument();

    await renderAppAt("/agents/ops-monitor");
    expect((await screen.findAllByText("Agent 运行监控")).length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText("Agent 运行指标")).toBeInTheDocument();
    expect((await screen.findAllByText("人工采纳率")).length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText("审计日志")).toBeInTheDocument();

    await renderAppAt("/agents/disposition");
    expect((await screen.findAllByText("处置建议 Agent")).length).toBeGreaterThanOrEqual(1);

    await renderAppAt("/agents/strategy-tuning");
    expect((await screen.findAllByText("策略调优 Agent")).length).toBeGreaterThanOrEqual(1);

    await renderAppAt("/agents/script-compliance");
    expect((await screen.findAllByText("话术合规 Agent")).length).toBeGreaterThanOrEqual(1);

    await renderAppAt("/agents/review-qa");
    expect((await screen.findAllByText("复盘质检 Agent")).length).toBeGreaterThanOrEqual(1);
  });

  test("loads model factory and decision engine strategy pages", async () => {
    await renderAppAt("/strategy/model-factory");

    expect((await screen.findAllByText("模型工厂")).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText(/样本圈选/)).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText(/训练实验/)).length).toBeGreaterThanOrEqual(1);

    await renderAppAt("/strategy/decision-flow");
    expect((await screen.findAllByText("决策流编排")).length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText("模型评分节点")).toBeInTheDocument();
    expect(await screen.findByText("触达动作节点")).toBeInTheDocument();

    await renderAppAt("/strategy/model-registry");
    expect((await screen.findAllByText("模型版本库")).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText("Champion")).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText("Challenger")).length).toBeGreaterThanOrEqual(1);
  });

  test("workbench exposes customer-level monitoring report actions", async () => {
    await renderAppAt("/risk/workbench");

    expect(await screen.findByText("生成贷后监控报告")).toBeInTheDocument();
    expect(await screen.findByText("报告预览")).toBeInTheDocument();
    expect(await screen.findByText("下载 PDF")).toBeInTheDocument();
    expect((await screen.findAllByText("审计留档")).length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText("基于当前客户预警、企查查 MCP、司法财报与处置记录生成报告")).toBeInTheDocument();
  });

  test("report center archives generated monitoring reports", async () => {
    await renderAppAt("/monitor/reports");

    expect((await screen.findAllByText("监控报告库")).length).toBeGreaterThanOrEqual(1);

    expect(await screen.findByText("信贷风险定期监控报告（深度分析版）")).toBeInTheDocument();
    expect(await screen.findByText("某大型房企B（破产重整）")).toBeInTheDocument();
    expect((await screen.findAllByText("审计留档编号：SKILL-CRM-HD-20260415-002")).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText("预览")).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText("下载")).length).toBeGreaterThanOrEqual(1);
  });

  test("backtest route keeps single-rule regression as the default workflow", async () => {
    await renderAppAt("/strategy/backtest");

    expect((await screen.findAllByText("仿真回溯")).length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText("单规则回溯")).toBeInTheDocument();
    expect(await screen.findByText("策略包仿真")).toBeInTheDocument();
    expect(await screen.findByText("决策流联调")).toBeInTheDocument();
    expect((await screen.findAllByText(/阈值变化影响/)).length).toBeGreaterThanOrEqual(1);
  });

  test("sidebar groups can collapse while keeping the current route group visible", async () => {
    await renderAppAt("/monitor/dashboard");
    const sidebar = screen.getByRole("complementary", { name: "主导航" });

    expect(await within(sidebar).findByText("预警核查工作台")).toBeInTheDocument();
    fireEvent.click(within(sidebar).getByText("处置闭环"));
    expect(within(sidebar).queryByText("预警核查工作台")).not.toBeInTheDocument();
    fireEvent.click(within(sidebar).getByText("处置闭环"));
    expect(within(sidebar).getByText("预警核查工作台")).toBeInTheDocument();

    fireEvent.click(within(sidebar).getByText("预警监控"));
    expect(within(sidebar).getByText("预警大盘")).toBeInTheDocument();
  });

  test("hash demo entries keep a single active sidebar item", async () => {
    await renderAppAt("/architecture/integration#data-flow");

    expect(await screen.findByText("系统集成与闭环说明")).toBeInTheDocument();
    const sidebar = screen.getByRole("complementary", { name: "主导航" });
    expect(within(sidebar).getByText("数据流向说明").closest(".sider-nav-item")).toHaveClass(
      "sider-nav-item-active",
    );
    expect(within(sidebar).getByText("系统集成架构").closest(".sider-nav-item")).not.toHaveClass(
      "sider-nav-item-active",
    );
  });
});
