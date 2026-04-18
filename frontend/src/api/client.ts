import {
  ApiError,
  type CreateTaskPayload,
  type TaskResponse,
  type TaskListItem,
  type TaskDetail,
} from "@/types";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://127.0.0.1:8000";

const TIMEOUT_MS = 15_000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new ApiError(text || `请求失败（HTTP ${res.status}）`, res.status);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const e = err as Error;
    if (e.name === "AbortError") {
      throw new ApiError("请求超时");
    }
    throw new ApiError("服务不可用");
  } finally {
    clearTimeout(timer);
  }
}

export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return "资源不存在";
    return err.message;
  }
  return "服务暂时不可用";
}

export const api = {
  /** POST /tasks/review — 创建信审任务 */
  createReviewTask(formData: FormData): Promise<TaskResponse> {
    return request<TaskResponse>("/tasks/review", {
      method: "POST",
      body: formData,
    });
  },

  /** POST /tasks/analysis — 创建分析任务 */
  createAnalysisTask(formData: FormData): Promise<TaskResponse> {
    return request<TaskResponse>("/tasks/analysis", {
      method: "POST",
      body: formData,
    });
  },

  /** 创建任务（兼容旧接口） */
  createTask(payload: CreateTaskPayload): Promise<TaskResponse> {
    const formData = new FormData();
    formData.set("title", payload.description.slice(0, 50));
    formData.set("description", payload.description);
    formData.set("scenario_node", payload.scenario_node);

    if (payload.task_type === "review") {
      return this.createReviewTask(formData);
    }
    return this.createAnalysisTask(formData);
  },

  /** 创建任务（含文件） */
  createTaskWithFiles(formData: FormData): Promise<TaskResponse> {
    const taskType = formData.get("task_type") as string;
    if (taskType === "review") {
      return this.createReviewTask(formData);
    }
    return this.createAnalysisTask(formData);
  },

  /** GET /tasks — 任务列表 */
  listTasks(filters?: { task_type?: string; status?: string }, limit = 50): Promise<TaskListItem[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (filters?.task_type) params.set("task_type", filters.task_type);
    if (filters?.status) params.set("status", filters.status);
    return request<TaskListItem[]>(`/tasks?${params.toString()}`);
  },

  /** GET /tasks/{id} — 任务详情 */
  getTask(taskId: string): Promise<TaskDetail> {
    return request<TaskDetail>(`/tasks/${encodeURIComponent(taskId)}`);
  },

  /** GET /tasks/{id}/result — 任务结果 */
  getResult(taskId: string): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>(`/tasks/${encodeURIComponent(taskId)}/result`);
  },
};
