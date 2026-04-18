import { create } from "zustand";
import { api, formatApiError } from "@/api/client";
import type { TaskBrief, TaskFilters } from "@/types";

interface TaskStoreState {
  tasks: TaskBrief[];
  filters: TaskFilters;
  loading: boolean;
  error: string | null;
  pollingInterval: number; // ms

  // Actions
  setFilters: (filters: Partial<TaskFilters>) => void;
  fetchTasks: () => Promise<void>;
  startPolling: () => () => void; // 返回 cleanup 函数
  stopPolling: () => void;
}

// 内部轮询 timer 引用（store 外部管理，避免序列化问题）
let _pollingTimer: ReturnType<typeof setInterval> | null = null;

export const useTaskStore = create<TaskStoreState>((set, get) => ({
  tasks: [],
  filters: { task_type: "", status: "" },
  loading: false,
  error: null,
  pollingInterval: 5_000,

  setFilters(partial) {
    set((s) => ({ filters: { ...s.filters, ...partial } }));
    // 筛选变更时立即拉取
    void get().fetchTasks();
  },

  async fetchTasks() {
    set({ loading: true, error: null });
    try {
      const tasks = await api.listTasks(get().filters);
      set({ tasks, loading: false });
    } catch (err) {
      set({ loading: false, error: formatApiError(err) });
    }
  },

  startPolling() {
    // 先立即拉取一次
    void get().fetchTasks();

    const tick = () => {
      // 页面隐藏时跳过
      if (document.visibilityState === "hidden") return;
      void get().fetchTasks();
    };

    _pollingTimer = setInterval(tick, get().pollingInterval);

    // 页面重新可见时立即拉取
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void get().fetchTasks();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    // 返回 cleanup
    return () => {
      get().stopPolling();
      document.removeEventListener("visibilitychange", onVisible);
    };
  },

  stopPolling() {
    if (_pollingTimer !== null) {
      clearInterval(_pollingTimer);
      _pollingTimer = null;
    }
  },
}));
