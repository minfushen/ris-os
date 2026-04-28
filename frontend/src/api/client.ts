import {
  ApiError,
  type CreateTaskPayload,
  type TaskResponse,
  type TaskListItem,
  type TaskDetail,
} from "@/types";
import type {
  DataDictionarySourceRow,
  DataDictionaryVariableRow,
  PostLoanFeatureStudioResponse,
} from "@/types/scenarioPostLoan";
import type {
  VendorRiskAssessment,
  QccCompanyInfo,
  QccRiskInfo,
  QccOperationInfo,
  AssessVendorRiskRequest,
} from "@/types/qcc";
import type {
  Enterprise,
  RiskAssessment,
  Alert,
  OverdueLoanAlertCandidate,
  DashboardStats,
  AssessEnterpriseRiskResponse,
  BatchOnboardWatchlistResponse,
  WatchlistPrecheckResponse,
} from "@/types/enterprise";

/** 后端根地址。注意：若 .env 里把 VITE_API_BASE_URL 设成空字符串，相对路径会打到 Vite 同源并 404，这里按「未配置」处理。 */
function resolveApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (raw && raw.length > 0) {
    return raw.replace(/\/$/, "");
  }
  return "http://127.0.0.1:8000";
}

export const API_BASE_URL = resolveApiBaseUrl();

/** 贷后场景资源路径（与 FastAPI 双挂载一致：/api/scenario/post-loan 与 /scenario/post-loan） */
const POST_LOAN_API_PREFIX = "/api/scenario/post-loan";

const BASE_URL = API_BASE_URL;

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
    throw new ApiError(
      `无法连接 ${BASE_URL}（后端未启动、端口不一致或跨域被拦）。请在后端目录执行：uvicorn app:app --reload --port 8000`,
    );
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

  // ─── 贷后场景 REST：`/scenario/post-loan/*` ─────────────────────────────

  /** GET …/feature-studio — 特征工作室聚合数据 */
  getPostLoanFeatureStudio(): Promise<PostLoanFeatureStudioResponse> {
    return request<PostLoanFeatureStudioResponse>(`${POST_LOAN_API_PREFIX}/feature-studio`);
  },

  /** GET …/data-dictionary/variables — 变量字典（查询参数过滤） */
  listPostLoanDataDictionaryVariables(params?: {
    q?: string;
    source_code?: string;
    refresh?: string;
  }): Promise<DataDictionaryVariableRow[]> {
    const sp = new URLSearchParams();
    if (params?.q?.trim()) sp.set("q", params.q.trim());
    if (params?.source_code) sp.set("source_code", params.source_code);
    if (params?.refresh) sp.set("refresh", params.refresh);
    const qs = sp.toString();
    return request<DataDictionaryVariableRow[]>(
      `${POST_LOAN_API_PREFIX}/data-dictionary/variables${qs ? `?${qs}` : ""}`,
    );
  },

  /** GET …/data-dictionary/sources — 数据源列表 */
  listPostLoanDataDictionarySources(): Promise<DataDictionarySourceRow[]> {
    return request<DataDictionarySourceRow[]>(`${POST_LOAN_API_PREFIX}/data-dictionary/sources`);
  },

  // ─── 企查查风险评估：`/api/qcc/*` ─────────────────────────────

  /** POST /api/qcc/assess-vendor-risk — 企业风险评估 */
  assessVendorRisk(companyName: string, dimensions?: string[]): Promise<VendorRiskAssessment> {
    const payload: AssessVendorRiskRequest = {
      company_name: companyName,
      dimensions,
    };
    return request<VendorRiskAssessment>("/api/qcc/assess-vendor-risk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  /** GET /api/qcc/company/{company_name} — 获取企业工商信息 */
  getQccCompanyInfo(companyName: string): Promise<QccCompanyInfo> {
    return request<QccCompanyInfo>(`/api/qcc/company/${encodeURIComponent(companyName)}`);
  },

  /** GET /api/qcc/risk/{company_name} — 获取企业风险信息 */
  getQccRiskInfo(companyName: string): Promise<QccRiskInfo> {
    return request<QccRiskInfo>(`/api/qcc/risk/${encodeURIComponent(companyName)}`);
  },

  /** GET /api/qcc/operation/{company_name} — 获取企业经营信息 */
  getQccOperationInfo(companyName: string): Promise<QccOperationInfo> {
    return request<QccOperationInfo>(`/api/qcc/operation/${encodeURIComponent(companyName)}`);
  },

  // ─── 企业数据中心：`/api/enterprises/*` ─────────────────────────────

  /** POST /api/enterprises/register — 注册企业 */
  registerEnterprise(companyName: string): Promise<Enterprise> {
    return request<Enterprise>("/api/enterprises/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_name: companyName }),
    });
  },

  /** GET /api/enterprises/{id} — 获取企业档案 */
  getEnterprise(enterpriseId: number): Promise<Enterprise> {
    return request<Enterprise>(`/api/enterprises/${enterpriseId}`);
  },

  /** GET /api/enterprises — 获取企业列表 */
  listEnterprises(limit = 50): Promise<Enterprise[]> {
    return request<Enterprise[]>(`/api/enterprises?limit=${limit}`);
  },

  /** POST /api/enterprises/{id}/assess — 评估企业风险 */
  assessEnterpriseRisk(enterpriseId: number): Promise<AssessEnterpriseRiskResponse> {
    return request<AssessEnterpriseRiskResponse>(`/api/enterprises/${enterpriseId}/assess`, {
      method: "POST",
    });
  },

  /** POST /api/enterprises/watchlist/batch-onboard — 批量入池并评估名单 */
  batchOnboardWatchlist(
    companyNames: string[],
    mode: "low_cost" | "full" = "low_cost",
  ): Promise<BatchOnboardWatchlistResponse> {
    return request<BatchOnboardWatchlistResponse>("/api/enterprises/watchlist/batch-onboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company_names: companyNames, mode }),
    });
  },

  /** POST /api/enterprises/watchlist/precheck — 批量入池前额度预检 */
  precheckWatchlistOnboard(
    mode: "low_cost" | "full",
    plannedCount: number,
  ): Promise<WatchlistPrecheckResponse> {
    return request<WatchlistPrecheckResponse>("/api/enterprises/watchlist/precheck", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode, planned_count: plannedCount }),
    });
  },

  /** GET /api/enterprises/{id}/assessments/latest — 获取最新评估 */
  getLatestAssessment(enterpriseId: number): Promise<RiskAssessment> {
    return request<RiskAssessment>(`/api/enterprises/${enterpriseId}/assessments/latest`);
  },

  /** GET /api/enterprises/{id}/assessments/history — 获取评估历史 */
  getAssessmentHistory(enterpriseId: number, limit = 10): Promise<RiskAssessment[]> {
    return request<RiskAssessment[]>(`/api/enterprises/${enterpriseId}/assessments/history?limit=${limit}`);
  },

  // ─── 预警管理：`/api/alerts/*` ─────────────────────────────

  /** GET /api/alerts — 获取预警列表 */
  getAlertList(filters?: {
    status?: string;
    level?: string;
    limit?: number;
  }): Promise<Alert[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.level) params.set("level", filters.level);
    if (filters?.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return request<Alert[]>(`/api/alerts${qs ? `?${qs}` : ""}`);
  },

  /** GET /api/alerts/loan-overdue — 获取逾期贷款候选 */
  getOverdueLoanAlertCandidates(limit = 20): Promise<OverdueLoanAlertCandidate[]> {
    return request<OverdueLoanAlertCandidate[]>(`/api/alerts/loan-overdue?limit=${limit}`);
  },

  /** POST /api/alerts/{id}/resolve — 解决预警 */
  resolveAlert(alertId: number): Promise<Alert> {
    return request<Alert>(`/api/alerts/${alertId}/resolve`, {
      method: "POST",
    });
  },

  // ─── 大盘统计：`/api/dashboard/*` ─────────────────────────────

  /** GET /api/dashboard/stats — 获取统计数据 */
  getDashboardStats(): Promise<DashboardStats> {
    return request<DashboardStats>("/api/dashboard/stats");
  },
};
