/**
 * MSW 请求处理器 — 拦截所有后端 API 调用，返回 mock 数据。
 *
 * 覆盖范围：本文件只覆盖被页面真实调用的端点（11 个页面/组件涉及的 9 个 API 域）。
 * 未覆盖的端点会穿透到真实后端（由 onUnhandledRequest: "bypass" 控制）。
 */

import { http, HttpResponse } from "msw";
import type { TaskListItem } from "@/types";
import {
  mockDashboardStats,
  mockAlerts,
  mockRiskAssessments,
  mockRiskAssessmentDefault,
  mockPrecheck,
  mockBatchOnboard,
  mockFeatureStudio,
  mockVariables,
  mockSources,
  mockTaskList,
  mockTaskDetail,
} from "./data";

const BASE = "http://127.0.0.1:8000";

export const handlers = [
  // ─── Dashboard ───────────────────────────────────────────────────────
  http.get(`${BASE}/api/dashboard/stats`, () => HttpResponse.json(mockDashboardStats)),

  // ─── Alerts ──────────────────────────────────────────────────────────
  http.get(`${BASE}/api/alerts`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const level = url.searchParams.get("level");
    const limit = Number(url.searchParams.get("limit") ?? 50);

    let filtered = [...mockAlerts];
    if (status) filtered = filtered.filter((a) => a.alert_status === status);
    if (level) filtered = filtered.filter((a) => a.alert_level === level);
    return HttpResponse.json(filtered.slice(0, limit));
  }),

  http.post(`${BASE}/api/alerts/:alertId/resolve`, ({ params }) => {
    const id = Number(params.alertId);
    const alert = mockAlerts.find((a) => a.id === id);
    if (!alert) return new HttpResponse(null, { status: 404 });
    const resolved = { ...alert, alert_status: "resolved", resolved_at: new Date().toISOString() };
    return HttpResponse.json(resolved);
  }),

  // ─── Enterprises / Assessments ───────────────────────────────────────
  http.get(`${BASE}/api/enterprises/:id/assessments/latest`, ({ params }) => {
    const id = Number(params.id);
    const assessment = mockRiskAssessments[id] ?? mockRiskAssessmentDefault;
    return HttpResponse.json(assessment);
  }),

  // ─── Watchlist ───────────────────────────────────────────────────────
  http.post(`${BASE}/api/enterprises/watchlist/precheck`, async ({ request }) => {
    const body = (await request.json()) as { planned_count: number };
    return HttpResponse.json({ ...mockPrecheck, planned_count: body.planned_count });
  }),

  http.post(`${BASE}/api/enterprises/watchlist/batch-onboard`, async ({ request }) => {
    const body = (await request.json()) as { company_names: string[] };
    return HttpResponse.json({
      ...mockBatchOnboard,
      total_submitted: body.company_names.length,
      total_valid: body.company_names.length,
    });
  }),

  // ─── Feature Studio ──────────────────────────────────────────────────
  http.get(`${BASE}/api/scenario/post-loan/feature-studio`, () => {
    return HttpResponse.json(mockFeatureStudio);
  }),

  // ─── Data Dictionary ─────────────────────────────────────────────────
  http.get(`${BASE}/api/scenario/post-loan/data-dictionary/variables`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    const sourceCode = url.searchParams.get("source_code");
    let filtered = [...mockVariables];
    if (q) filtered = filtered.filter((v) => v.name.includes(q) || v.cn_name.includes(q));
    if (sourceCode) filtered = filtered.filter((v) => v.source_code === sourceCode);
    return HttpResponse.json(filtered);
  }),

  http.get(`${BASE}/api/scenario/post-loan/data-dictionary/sources`, () => {
    return HttpResponse.json(mockSources);
  }),

  // ─── Tasks ───────────────────────────────────────────────────────────
  http.get(`${BASE}/tasks`, ({ request }) => {
    const url = new URL(request.url);
    const taskType = url.searchParams.get("task_type");
    const status = url.searchParams.get("status");
    let filtered = [...mockTaskList];
    if (taskType) filtered = filtered.filter((t) => t.task_type === taskType);
    if (status) filtered = filtered.filter((t) => t.status === status);
    return HttpResponse.json(filtered);
  }),

  http.get(`${BASE}/tasks/:taskId`, ({ params }) => {
    const id = params.taskId as string;
    if (id === mockTaskDetail.task.task_id) return HttpResponse.json(mockTaskDetail);
    // Return generic detail for other task IDs that might appear in mockTaskList
    const task = mockTaskList.find((t) => t.task_id === id);
    if (!task) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({
      task: { ...task, description: "" },
      events: [],
    });
  }),

  http.post(`${BASE}/tasks`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    const taskId = `tsk_${Date.now()}`;
    const taskType = (body.task_type as TaskListItem["task_type"]) ?? "analysis";
    return HttpResponse.json({ task_id: taskId, task_type: taskType, status: "pending" });
  }),

  http.post(`${BASE}/tasks/review`, async () => {
    return HttpResponse.json({ task_id: `tsk_rev_${Date.now()}`, task_type: "review", status: "pending" });
  }),

  http.post(`${BASE}/tasks/analysis`, async () => {
    return HttpResponse.json({ task_id: `tsk_ana_${Date.now()}`, task_type: "analysis", status: "pending" });
  }),
];
