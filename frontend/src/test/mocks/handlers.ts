/**
 * MSW request handlers — 覆盖所有后端接口的 mock 响应。
 * 测试文件通过 setupServer(handlers) 使用。
 */
import { http, HttpResponse } from "msw";
import type {
  CreateTaskResponse,
  ResultOut,
  TaskBrief,
  TaskEventOut,
  TaskOut,
} from "@/types";

const BASE = "http://127.0.0.1:8000";

// ─── 固定 fixture ─────────────────────────────────────────────────────────────

export const MOCK_ANALYSIS_TASK_ID = "tsk_analysis001";
export const MOCK_REVIEW_TASK_ID = "tsk_review0001";

export const mockAnalysisTask: TaskOut = {
  task_id: MOCK_ANALYSIS_TASK_ID,
  task_type: "analysis",
  status: "completed",
  title: "授信通过率分析",
  description: "分析本周授信通过率变动",
  scenario_node: "credit",
  created_at: "2026-04-16T10:00:00+00:00",
  updated_at: "2026-04-16T10:01:00+00:00",
  error_message: null,
};

export const mockReviewTask: TaskOut = {
  task_id: MOCK_REVIEW_TASK_ID,
  task_type: "review",
  status: "completed",
  title: "信审材料核查",
  description: "核查上传的申请材料",
  scenario_node: "general",
  created_at: "2026-04-16T10:00:00+00:00",
  updated_at: "2026-04-16T10:01:00+00:00",
  error_message: null,
};

export const mockTaskList: TaskBrief[] = [
  {
    task_id: MOCK_ANALYSIS_TASK_ID,
    task_type: "analysis",
    status: "completed",
    title: "授信通过率分析",
    created_at: "2026-04-16T10:00:00+00:00",
    updated_at: "2026-04-16T10:01:00+00:00",
    recent_progress: "已完成",
    summary: "授信通过率 72.3%",
  },
  {
    task_id: MOCK_REVIEW_TASK_ID,
    task_type: "review",
    status: "running",
    title: "信审材料核查",
    created_at: "2026-04-16T10:05:00+00:00",
    updated_at: "2026-04-16T10:05:30+00:00",
    recent_progress: "处理中",
    summary: null,
  },
];

export const mockAnalysisResult: ResultOut = {
  task_id: MOCK_ANALYSIS_TASK_ID,
  summary: "授信节点分析完成：通过率 72.3%",
  result: {
    scenario_node: "credit",
    summary: "授信节点分析完成：通过率 72.3%",
    steps: [
      { name: "解析任务描述", status: "done", detail: "识别场景节点" },
      { name: "查询数据源", status: "done", detail: "从 sqlite_04 拉取指标" },
      { name: "计算核心指标", status: "done", detail: "授信通过率 72.3%" },
    ],
    metrics: {
      credit_approval_rate: 0.723,
      draw_approval_rate: null,
      apply_cnt: 1000,
      approved_cnt: 723,
    },
    charts: [
      {
        type: "bar",
        title: "授信节点关键指标",
        labels: ["申请量", "通过量"],
        values: [1000, 723],
      },
    ],
    key_findings: ["通过率口径需标注授信/支用节点"],
    next_actions: ["按渠道拆解"],
    task_description: "分析本周授信通过率变动",
  },
  export_ref: null,
};

export const mockReviewResult: ResultOut = {
  task_id: MOCK_REVIEW_TASK_ID,
  summary: "信审辅助完成：缺失项 2，疑点 2。",
  result: {
    scenario_node: "general",
    summary: "信审辅助完成：缺失项 2，疑点 2。",
    steps: [
      { name: "接收材料", status: "done", detail: "已接收上传文件" },
      { name: "字段抽取", status: "done", detail: "从材料中抽取关键字段" },
      { name: "完整性核查", status: "done", detail: "识别缺失项" },
    ],
    file_list: [
      { name: "申请表.pdf", type: "pdf", status: "processed" },
      { name: "身份证.jpg", type: "image", status: "pending" },
    ],
    extracted_fields: [
      { field: "申请人姓名", value: "张三", confidence: 0.95 },
      { field: "申请金额", value: "50000", confidence: 0.88 },
    ],
    missing_items: [
      { item: "身份证明附件", priority: "high" },
      { item: "近三个月流水摘要", priority: "medium" },
    ],
    risk_flags: [
      { name: "金额口径不一致", level: "HIGH", reason: "申请金额与材料描述存在差异" },
    ],
    review_sheet: {
      columns: ["file", "missing_count", "risk_count", "max_risk_level", "summary"],
      rows: [["申请表.pdf", 2, 1, "HIGH", "资料需补齐后复核"]],
    },
    key_findings: ["共发现 2 项缺失材料"],
    next_actions: ["补充身份证明附件"],
    task_description: "核查上传的申请材料",
  },
  export_ref: null,
};

export const mockEvents: TaskEventOut[] = [
  {
    id: 1,
    task_id: MOCK_ANALYSIS_TASK_ID,
    event_type: "TASK_CREATED",
    payload: { title: "授信通过率分析" },
    created_at: "2026-04-16T10:00:00+00:00",
  },
  {
    id: 2,
    task_id: MOCK_ANALYSIS_TASK_ID,
    event_type: "TASK_ACCEPTED",
    payload: {},
    created_at: "2026-04-16T10:00:01+00:00",
  },
  {
    id: 3,
    task_id: MOCK_ANALYSIS_TASK_ID,
    event_type: "TASK_RUNNING",
    payload: {},
    created_at: "2026-04-16T10:00:02+00:00",
  },
  {
    id: 4,
    task_id: MOCK_ANALYSIS_TASK_ID,
    event_type: "TASK_COMPLETED",
    payload: {},
    created_at: "2026-04-16T10:01:00+00:00",
  },
];

// ─── MSW handlers ─────────────────────────────────────────────────────────────

export const handlers = [
  // POST /tasks
  http.post(`${BASE}/tasks`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const resp: CreateTaskResponse = {
      task_id: "tsk_new00001",
      task_type: (body.task_type as "analysis" | "review") ?? "analysis",
      initial_status: "created",
      redirect_target: "#/taskflow",
    };
    return HttpResponse.json(resp);
  }),

  // POST /tasks/with-files
  http.post(`${BASE}/tasks/with-files`, async () => {
    const resp: CreateTaskResponse = {
      task_id: "tsk_withfile1",
      task_type: "review",
      initial_status: "created",
      redirect_target: "#/taskflow",
    };
    return HttpResponse.json(resp);
  }),

  // GET /tasks
  http.get(`${BASE}/tasks`, () => {
    return HttpResponse.json(mockTaskList);
  }),

  // GET /tasks/:taskId — analysis
  http.get(`${BASE}/tasks/${MOCK_ANALYSIS_TASK_ID}`, () => {
    return HttpResponse.json(mockAnalysisTask);
  }),

  // GET /tasks/:taskId — review
  http.get(`${BASE}/tasks/${MOCK_REVIEW_TASK_ID}`, () => {
    return HttpResponse.json(mockReviewTask);
  }),

  // GET /tasks/:taskId/result — analysis
  http.get(`${BASE}/tasks/${MOCK_ANALYSIS_TASK_ID}/result`, () => {
    return HttpResponse.json(mockAnalysisResult);
  }),

  // GET /tasks/:taskId/result — review
  http.get(`${BASE}/tasks/${MOCK_REVIEW_TASK_ID}/result`, () => {
    return HttpResponse.json(mockReviewResult);
  }),

  // GET /tasks/:taskId/result-brief
  http.get(`${BASE}/tasks/:taskId/result-brief`, ({ params }) => {
    return HttpResponse.json({
      task_id: params.taskId,
      summary: "摘要示意",
      key_findings: ["发现1"],
      next_actions: ["行动1"],
      missing_count: 2,
      risk_flag_count: 1,
    });
  }),

  // GET /tasks/:taskId/events
  http.get(`${BASE}/tasks/${MOCK_ANALYSIS_TASK_ID}/events`, () => {
    return HttpResponse.json(mockEvents);
  }),

  http.get(`${BASE}/tasks/${MOCK_REVIEW_TASK_ID}/events`, () => {
    return HttpResponse.json([]);
  }),
];
