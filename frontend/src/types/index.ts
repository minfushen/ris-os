// 枚举类型
export type TaskType =
  | "analysis"    // 归因分析
  | "backtest"    // 离线回测
  | "strategy"    // 策略发布申请
  | "inspection"  // 抽检样本
  | "fraud"       // 欺诈排查
  | "review";     // 信审任务

export type TaskStatus =
  | "created"     // 旧任务流：已创建
  | "accepted"    // 旧任务流：已接单
  | "running"     // 旧任务流：运行中
  | "waiting_user" // 旧任务流：等待确认
  | "pending"     // 待处理
  | "processing"  // 处理中
  | "reviewing"   // 待复核（审批流）
  | "completed"   // 已完成
  | "rejected"    // 已驳回
  | "failed";     // 已失败

export type ScenarioNode = "credit" | "draw" | "post_loan";

// API 响应类型
export interface TaskResponse {
  task_id: string;
  task_type: TaskType;
  status: TaskStatus;
}

export interface TaskListItem {
  task_id: string;
  task_type: TaskType;
  status: TaskStatus;
  title: string;
  scenario_node: ScenarioNode;
  created_at: string;
  updated_at: string;
  summary?: string | null;
}

export type TaskBrief = TaskListItem;

export interface TaskFilters {
  task_type: string;
  status: string;
}

export interface TaskDetail {
  task: TaskListItem & {
    description: string;
    error_message?: string | null;
  };
  result?: AnalysisResult | ReviewResult;
  events: TaskEvent[];
}

export interface TaskEvent {
  id: number;
  task_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

// 分析结果
export interface AnalysisResult {
  scenario_node: ScenarioNode;
  summary: string;
  metrics: Record<string, number | null>;
  charts: ChartData[];
  key_findings: string[];
  next_actions: string[];
}

export interface ChartData {
  type: "bar" | "table" | "trend";
  title: string;
  labels?: string[];
  values?: number[];
  columns?: string[];
  rows?: (string | number)[][];
}

// 信审结果
export interface ReviewResult {
  scenario_node: ScenarioNode;
  summary: string;
  file_count: number;
  files: FileItem[];
  missing_items: MissingItem[];
  risk_flags: RiskFlag[];
  review_sheet: ReviewSheet;
  key_findings: string[];
  next_actions: string[];
}

export interface FileItem {
  name: string;
  type: string;
}

export interface MissingItem {
  item: string;
  priority: "high" | "medium" | "low";
}

export interface RiskFlag {
  name: string;
  level: "HIGH" | "MEDIUM" | "LOW";
  reason: string;
}

export interface ReviewSheet {
  columns: string[];
  rows: (string | number)[][];
}

// 请求类型
export interface CreateTaskPayload {
  task_type: TaskType;
  description: string;
  scenario_node: ScenarioNode;
}

// 错误类型
export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ============ 首页展示类型 ============

// 业务部门
export interface BusinessDept {
  id: string;
  name: string;
  taskCount: number;
  activeCount: number;
}

// 业务产品
export interface BusinessProduct {
  id: string;
  name: string;
  deptId: string;
  scenario: string;
  status: "active" | "inactive";
}

// 中台系统状态
export type SystemStatus = "normal" | "warning" | "error" | "maintenance";

export interface PlatformSystem {
  id: string;
  name: string;
  status: SystemStatus;
  metrics: { label: string; value: string | number }[];
  lastSync?: string;
}

// 指标数据（用于 MetricsPanel）
export interface MetricsData {
  [key: string]: number | null;
}
