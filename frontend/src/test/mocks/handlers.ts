/**
 * 测试用 MSW handlers — 复用统一 mock 数据源。
 *
 * 测试通过 setupServer(handlers) 使用本文件导出的 handlers。
 * 测试环境的 MSW 与浏览器共享 mock 基础数据（@/mock/data.ts），
 * 仅覆盖差异通过 runtime handler override（server.use(...)）实现。
 */

import { http, HttpResponse } from "msw";
import type { TaskDetail, TaskResponse } from "@/types";
import { mockTaskList } from "@/mock/data";

const BASE = "http://127.0.0.1:8000";

export const MOCK_ANALYSIS_TASK_ID = "tsk_001";
export const MOCK_REVIEW_TASK_ID = "tsk_002";

export const handlers = [
  // GET /tasks
  http.get(`${BASE}/tasks`, () => HttpResponse.json(mockTaskList)),

  // GET /tasks/:taskId
  http.get(`${BASE}/tasks/:taskId`, ({ params }) => {
    const id = params.taskId as string;
    const task = mockTaskList.find((t) => t.task_id === id);
    if (!task) return new HttpResponse(null, { status: 404 });

    const detail: TaskDetail = {
      task: {
        ...task,
        description: task.title,
      },
      events: [],
    };
    return HttpResponse.json(detail);
  }),

  // POST /tasks
  http.post(`${BASE}/tasks`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    const resp: TaskResponse = {
      task_id: `tsk_${Date.now()}`,
      task_type: (body.task_type as TaskResponse["task_type"]) ?? "analysis",
      status: "pending",
    };
    return HttpResponse.json(resp);
  }),

  // POST /tasks/review
  http.post(`${BASE}/tasks/review`, async () => {
    const resp: TaskResponse = {
      task_id: `tsk_rev_${Date.now()}`,
      task_type: "review",
      status: "pending",
    };
    return HttpResponse.json(resp);
  }),

  // POST /tasks/analysis
  http.post(`${BASE}/tasks/analysis`, async () => {
    const resp: TaskResponse = {
      task_id: `tsk_ana_${Date.now()}`,
      task_type: "analysis",
      status: "pending",
    };
    return HttpResponse.json(resp);
  }),

  // GET /tasks/:taskId/events
  http.get(`${BASE}/tasks/:taskId/events`, () => HttpResponse.json([])),

  // GET /tasks/:taskId/result
  http.get(`${BASE}/tasks/:taskId/result`, ({ params }) => {
    return HttpResponse.json({
      task_id: params.taskId as string,
      summary: "Mock result",
      key_findings: [],
      next_actions: [],
    });
  }),
];
