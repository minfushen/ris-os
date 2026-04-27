import { render, screen } from "@testing-library/react";
import { App as AntApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { MemoryRouter } from "react-router-dom";
import Home from "@/pages/Home";
import { theme } from "@/theme";
import { PLATFORM_NAME } from "@/config/brand";
import { useTaskStore } from "@/store/taskStore";

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
  const initialTaskStoreState = useTaskStore.getState();

  beforeEach(() => {
    useTaskStore.getState().stopPolling();
    useTaskStore.setState(
      {
        ...initialTaskStoreState,
        fetchTasks: async () => {},
      },
      true,
    );
  });

  afterEach(() => {
    useTaskStore.getState().stopPolling();
    useTaskStore.setState(initialTaskStoreState, true);
  });

  test("renders the post-loan home shell", () => {
    renderHome();

    expect(screen.getByText(PLATFORM_NAME)).toBeInTheDocument();
    expect(screen.getByText("核心资产指标")).toBeInTheDocument();
    expect(screen.getByText("今日预警大盘")).toBeInTheDocument();
    expect(screen.getByText("我的处置队列")).toBeInTheDocument();
    expect(screen.getByText("便捷操作")).toBeInTheDocument();
  });

  test("hides task service failures from the primary banner area", () => {
    useTaskStore.setState({
      error: "无法连接 http://127.0.0.1:8000",
      fetchTasks: async () => {},
    });

    renderHome();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    const details = screen.getByText("任务服务调试信息").closest("details");
    expect(details).toBeInTheDocument();
    expect(details).not.toHaveAttribute("open");
  });
});
