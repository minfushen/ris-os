import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTaskStore } from "./taskStore";

// mock api/client 避免真实网络请求
vi.mock("@/api/client", () => ({
  api: {
    listTasks: vi.fn().mockResolvedValue([
      {
        id: 1,
        title: "测试任务",
        status: "open",
        task_type: "review",
        priority: "high",
      },
    ]),
  },
  formatApiError: (err: unknown) =>
    err instanceof Error ? err.message : "服务暂时不可用",
}));

describe("taskStore", () => {
  beforeEach(() => {
    useTaskStore.setState({
      tasks: [],
      filters: { task_type: "", status: "" },
      loading: false,
      error: null,
    });
  });

  it("初始状态为空列表，loading=false，error=null", () => {
    const state = useTaskStore.getState();
    expect(state.tasks).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("fetchTasks 成功后填充 tasks，loading 恢复 false", async () => {
    await useTaskStore.getState().fetchTasks();
    const state = useTaskStore.getState();
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].title).toBe("测试任务");
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("setFilters 更新 filters 并触发 fetchTasks", async () => {
    useTaskStore.getState().setFilters({ status: "open" });
    expect(useTaskStore.getState().filters.status).toBe("open");
  });

  it("fetchTasks 失败时设置 error，loading 恢复 false", async () => {
    const { api } = await import("@/api/client");
    vi.mocked(api.listTasks).mockRejectedValueOnce(new Error("网络异常"));

    await useTaskStore.getState().fetchTasks();
    const state = useTaskStore.getState();
    expect(state.error).toBe("网络异常");
    expect(state.loading).toBe(false);
  });
});
