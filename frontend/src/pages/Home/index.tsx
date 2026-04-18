import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, App } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTaskStore } from "@/store/taskStore";
import { api } from "@/api/client";
import type { TaskType, ScenarioNode, TaskResponse } from "@/types";
import {
  computeQueueStats,
  countMyBacklog,
  pickDominantBacklogTaskType,
  pickUrgentTitle,
  type HomeTaskRow,
} from "@/utils/workbenchStats";
import type { QueueMetricKey } from "./WorkbenchOverview";
import type { HeroCta } from "./HomeHero";
import HomeHero from "./HomeHero";
import WorkbenchOverview from "./WorkbenchOverview";
import QuickEntryPanel from "./QuickEntryPanel";
import Searchlight from "./Searchlight";
import TaskDataGrid from "./TaskDataGrid";
import TaskDrawer from "./TaskDrawer";
import type { RealtimeAlert } from "@/hooks/useRealtimePush";

const MOCK_TASKS: HomeTaskRow[] = [
  { task_id: "TK-001", task_type: "analysis" as TaskType, status: "processing" as const, title: "自动审批率跌 5%", scenario_node: "credit" as const, created_at: "2026-04-17T10:30:00", updated_at: "2026-04-17T10:30:00", initiator: "系统告警", trigger: "自动告警" },
  { task_id: "TK-002", task_type: "backtest" as TaskType, status: "completed" as const, title: "离线回测-V3.2版本", scenario_node: "credit" as const, created_at: "2026-04-17T09:15:00", updated_at: "2026-04-17T10:00:00", initiator: "李四(策略)", trigger: "手动发起" },
  { task_id: "TK-003", task_type: "strategy" as TaskType, status: "reviewing" as const, title: "放宽小微贷准入年龄的策略变更", scenario_node: "credit" as const, created_at: "2026-04-17T08:00:00", updated_at: "2026-04-17T08:00:00", initiator: "王五(风控)", trigger: "手动发起" },
  { task_id: "TK-004", task_type: "inspection" as TaskType, status: "processing" as const, title: "4月第一周通过客群抽样复检", scenario_node: "credit" as const, created_at: "2026-04-16T14:00:00", updated_at: "2026-04-17T11:00:00", initiator: "张三(质检)", trigger: "手动发起" },
  { task_id: "TK-005", task_type: "analysis" as TaskType, status: "completed" as const, title: "B卡模型PSI超阈值告警分析", scenario_node: "credit" as const, created_at: "2026-04-16T10:00:00", updated_at: "2026-04-16T12:00:00", initiator: "系统告警", trigger: "自动告警" },
];

const DOMINANT_CTA: Record<TaskType, { primary: HeroCta; secondary: HeroCta }> = {
  analysis: {
    primary: { label: "发起归因分析", action: "analysis" },
    secondary: { label: "发起仿真回测", action: "backtest" },
  },
  backtest: {
    primary: { label: "发起仿真回测", action: "backtest" },
    secondary: { label: "发起归因分析", action: "analysis" },
  },
  strategy: {
    primary: { label: "打开策略发布流程", action: "strategy" },
    secondary: { label: "发起仿真回测", action: "backtest" },
  },
  inspection: {
    primary: { label: "发起专家抽检", action: "inspection" },
    secondary: { label: "发起归因分析", action: "analysis" },
  },
  fraud: {
    primary: { label: "进入欺诈排查", action: "fraud" },
    secondary: { label: "发起归因分析", action: "analysis" },
  },
  review: {
    primary: { label: "发起专家抽检", action: "inspection" },
    secondary: { label: "发起归因分析", action: "analysis" },
  },
};

function snoozeSyntheticRow(alert: RealtimeAlert): HomeTaskRow {
  const now = new Date().toISOString();
  return {
    task_id: `SQZ-${alert.id}`,
    task_type: "analysis",
    status: "pending",
    title: `[稍后异动] ${alert.title}`,
    scenario_node: "credit",
    created_at: now,
    updated_at: now,
    initiator: "本人",
    trigger: "探照灯稍后处理",
  };
}

export default function Home() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const tasks = useTaskStore((s) => s.tasks);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const loading = useTaskStore((s) => s.loading);
  const taskError = useTaskStore((s) => s.error);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<TaskType | null>(null);
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null);
  const [snoozeRows, setSnoozeRows] = useState<HomeTaskRow[]>([]);

  const isDemoData = tasks.length === 0 || Boolean(taskError);
  const displayTasks = tasks.length > 0 ? tasks : MOCK_TASKS;
  const displayTasksMerged = useMemo(() => [...snoozeRows, ...displayTasks], [snoozeRows, displayTasks]);

  const queueStats = useMemo(() => computeQueueStats(displayTasksMerged), [displayTasksMerged]);
  const myBacklogCount = useMemo(() => countMyBacklog(displayTasksMerged), [displayTasksMerged]);
  const urgentSummary = useMemo(() => pickUrgentTitle(displayTasksMerged), [displayTasksMerged]);

  const dominantType = useMemo(() => pickDominantBacklogTaskType(displayTasksMerged), [displayTasksMerged]);
  const heroCtas = useMemo(() => {
    const key = dominantType ?? "analysis";
    return DOMINANT_CTA[key] ?? DOMINANT_CTA.analysis;
  }, [dominantType]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const scrollToQueue = useCallback(() => {
    requestAnimationFrame(() => {
      document.getElementById("work-queue")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const openTaskDrawer = (type: TaskType) => {
    setDrawerType(type);
    setDrawerOpen(true);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "analysis":
        openTaskDrawer("analysis");
        break;
      case "backtest":
        openTaskDrawer("backtest");
        break;
      case "strategy":
        navigate("/strategy/publish");
        break;
      case "inspection":
        openTaskDrawer("inspection");
        break;
      case "fraud":
        navigate("/risk/fraud");
        break;
      case "data":
        navigate("/data/dictionary");
        break;
      default:
        void message.info(`功能开发中：${action}`);
    }
  };

  const handleSearchlightAction = (itemId: string, action: string) => {
    if (action === "发起归因" || action === "发起捞回分析") {
      openTaskDrawer("analysis");
      void message.success(`已关联异动 ${itemId}，请填写并提交创建任务`);
      return;
    }
    if (action === "查看详情" || action === "查看渠道拆解") {
      void message.info("详情下钻开发中，将跳转至监控模块");
      navigate("/monitor/dashboard");
      return;
    }
    if (action === "查看图谱") {
      void message.info("关系图谱开发中");
      navigate("/risk/fraud");
      return;
    }
    void message.info(`功能开发中：${action}`);
  };

  const handleSnoozeToQueue = (item: RealtimeAlert) => {
    setSnoozeRows((prev) => {
      const row = snoozeSyntheticRow(item);
      return [row, ...prev.filter((r) => r.task_id !== row.task_id)];
    });
    void message.info("已加入工作项列表（演示：稍后异动待办）");
    scrollToQueue();
  };

  const handleQueueMetricClick = (key: QueueMetricKey) => {
    const wqMap: Record<QueueMetricKey, string> = {
      pending: "pending",
      processing: "processing",
      reviewing: "reviewing",
      completed_today: "completed_today",
    };
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("wq", wqMap[key]);
      return next;
    });
    scrollToQueue();
  };

  const handleRiskCardClick = (key: "anomaly" | "pass_rate") => {
    if (key === "anomaly") navigate("/monitor/dashboard");
    else navigate("/monitor/reports");
  };

  const handleSubmitTask = async (type: TaskType, values: unknown): Promise<TaskResponse> => {
    if (type === "analysis" || type === "review") {
      const v = values as { description: string; scenario_node?: string };
      const res = await api.createTask({
        task_type: type,
        description: v.description,
        scenario_node: (v.scenario_node || "credit") as ScenarioNode,
      });
      void fetchTasks();
      return res;
    }
    const v = values as { description?: string };
    const res = await api.createTask({
      task_type: "analysis",
      description: v.description || `${type} 任务`,
      scenario_node: "credit" as ScenarioNode,
    });
    void fetchTasks();
    return res;
  };

  const handleTaskCreated = (taskId: string) => {
    setHighlightTaskId(taskId);
    scrollToQueue();
  };

  const handleProcessTask = (row: HomeTaskRow) => {
    openTaskDrawer(row.task_type);
    void message.info(`处理「${row.title}」：已打开「${row.task_type}」类新建/处置入口（演示）`);
  };

  return (
    <div className="space-y-4">
      {taskError && (
        <Alert
          type="warning"
          showIcon
          message="无法连接任务服务"
          description={`${taskError}。请确认已在 backend 目录启动 API（默认 http://127.0.0.1:8000），并检查 frontend/.env.development 中的 VITE_API_BASE_URL。下方列表展示为演示数据。`}
          className="rounded-lg"
        />
      )}

      {/* P1 D2：先 L1 总览 + L3 工作项，再 Hero / 快捷 / 探照灯 */}
      <WorkbenchOverview
        queueStats={queueStats}
        onQueueMetricClick={handleQueueMetricClick}
        onRiskCardClick={handleRiskCardClick}
      />

      <TaskDataGrid
        tasks={displayTasksMerged}
        loading={loading}
        onRefresh={() => void fetchTasks()}
        onCreateTask={openTaskDrawer}
        isDemoData={isDemoData}
        highlightTaskId={highlightTaskId}
        onHighlightConsumed={() => setHighlightTaskId(null)}
        onProcessTask={handleProcessTask}
      />

      <HomeHero
        onQuickAction={handleQuickAction}
        myBacklogCount={myBacklogCount}
        urgentSummary={urgentSummary}
        primaryCta={heroCtas.primary}
        secondaryCta={heroCtas.secondary}
      />

      <QuickEntryPanel
        onLaunch={(key) => handleQuickAction(key)}
        onGoto={(path) => navigate(path)}
      />

      <Searchlight onAction={handleSearchlightAction} onSnoozeToQueue={handleSnoozeToQueue} />

      <TaskDrawer
        open={drawerOpen}
        taskType={drawerType}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerType(null);
        }}
        onSubmit={handleSubmitTask}
        onCreated={handleTaskCreated}
      />
    </div>
  );
}
