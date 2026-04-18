import type { TaskStatus, TaskType } from "@/types";

export interface HomeTaskRow {
  task_id: string;
  task_type: TaskType;
  status: TaskStatus;
  title: string;
  scenario_node: string;
  created_at: string;
  updated_at: string;
  priority?: "P0" | "P1" | "P2";
  current_handler?: string | null;
  sla_due_at?: string | null;
  progress_pct?: number | null;
  initiator?: string;
  trigger?: string;
}

/** 计入「我的待办」队列的状态（未完成闭环） */
const BACKLOG_STATUSES: TaskStatus[] = [
  "created",
  "accepted",
  "running",
  "waiting_user",
  "pending",
  "processing",
  "reviewing",
];

export function isBacklogStatus(status: TaskStatus): boolean {
  return BACKLOG_STATUSES.includes(status);
}

export function countMyBacklog(tasks: HomeTaskRow[]): number {
  return tasks.filter((t) => isBacklogStatus(t.status)).length;
}

export function pickUrgentTitle(tasks: HomeTaskRow[]): string | null {
  const order: TaskStatus[] = ["processing", "reviewing", "pending", "created"];
  for (const st of order) {
    const hit = tasks.find((t) => t.status === st);
    if (hit) return hit.title;
  }
  return null;
}

const TYPE_PRIORITY: TaskType[] = [
  "analysis",
  "inspection",
  "strategy",
  "backtest",
  "fraud",
  "review",
];

/**
 * 待办队列中占比最高的任务类型（同数按 TYPE_PRIORITY 先后），用于 Hero 主按钮与队列对齐（P1 H2）。
 */
export function pickDominantBacklogTaskType(tasks: HomeTaskRow[]): TaskType | null {
  const backlog = tasks.filter((t) => isBacklogStatus(t.status));
  if (backlog.length === 0) return null;
  const counts = new Map<TaskType, number>();
  for (const t of backlog) {
    counts.set(t.task_type, (counts.get(t.task_type) ?? 0) + 1);
  }
  let max = 0;
  for (const c of counts.values()) max = Math.max(max, c);
  for (const typ of TYPE_PRIORITY) {
    if ((counts.get(typ) ?? 0) === max && max > 0) return typ;
  }
  return null;
}

function isSameLocalDay(iso: string, now = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export interface QueueOverviewStats {
  pending: number;
  processing: number;
  reviewing: number;
  completedToday: number;
}

export function computeQueueStats(tasks: HomeTaskRow[], now = new Date()): QueueOverviewStats {
  const pendingLike = tasks.filter((t) => t.status === "pending" || t.status === "created").length;
  const processing = tasks.filter((t) => t.status === "processing").length;
  const reviewing = tasks.filter((t) => t.status === "reviewing").length;
  const completedToday = tasks.filter(
    (t) => t.status === "completed" && isSameLocalDay(t.updated_at, now)
  ).length;
  return { pending: pendingLike, processing, reviewing, completedToday };
}
