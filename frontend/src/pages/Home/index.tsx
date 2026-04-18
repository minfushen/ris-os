import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, App, Typography } from "antd";

const { Text } = Typography;
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTaskStore } from "@/store/taskStore";
import { api } from "@/api/client";
import type { TaskType, ScenarioNode, TaskResponse } from "@/types";
import { countMyBacklog, pickDominantBacklogTaskType, pickUrgentTitle, type HomeTaskRow } from "@/utils/workbenchStats";
import type { HeroCta } from "./HomeHero";
import HomeHero from "./HomeHero";
import DutyBriefBar from "./DutyBriefBar";
import StrategyReviewSummary from "./StrategyReviewSummary";
import QuickEntryPanel from "./QuickEntryPanel";
import Searchlight from "./Searchlight";
import TopDashboard from "./TopDashboard";
import TaskDataGrid from "./TaskDataGrid";
import TaskDrawer from "./TaskDrawer";
import type { RealtimeAlert } from "@/hooks/useRealtimePush";

const MOCK_TASKS: HomeTaskRow[] = [
  {
    task_id: "TK-001",
    task_type: "analysis",
    status: "processing",
    title: "自动审批率跌 5%",
    scenario_node: "credit",
    created_at: "2026-04-17T10:30:00",
    updated_at: "2026-04-17T10:30:00",
    priority: "P0",
    current_handler: "张三(风控)",
    sla_due_at: "2026-04-17T18:00:00",
    progress_pct: 62,
    initiator: "系统告警",
    trigger: "自动告警",
  },
  {
    task_id: "TK-002",
    task_type: "backtest",
    status: "completed",
    title: "离线回测-V3.2版本",
    scenario_node: "draw",
    created_at: "2026-04-17T09:15:00",
    updated_at: "2026-04-17T10:00:00",
    priority: "P2",
    current_handler: "—",
    sla_due_at: null,
    progress_pct: 100,
    initiator: "李四(策略)",
    trigger: "手动发起",
  },
  {
    task_id: "TK-003",
    task_type: "strategy",
    status: "reviewing",
    title: "放宽小微贷准入年龄的策略变更",
    scenario_node: "credit",
    created_at: "2026-04-17T08:00:00",
    updated_at: "2026-04-17T08:00:00",
    priority: "P0",
    current_handler: "李四(策略)",
    sla_due_at: "2026-04-17T20:00:00",
    progress_pct: 88,
    initiator: "王五(风控)",
    trigger: "手动发起",
  },
  {
    task_id: "TK-004",
    task_type: "inspection",
    status: "processing",
    title: "4月第一周通过客群抽样复检",
    scenario_node: "post_loan",
    created_at: "2026-04-16T14:00:00",
    updated_at: "2026-04-17T11:00:00",
    priority: "P1",
    current_handler: "张三(质检)",
    sla_due_at: "2026-04-18T09:00:00",
    progress_pct: 45,
    initiator: "张三(质检)",
    trigger: "手动发起",
  },
  {
    task_id: "TK-005",
    task_type: "analysis",
    status: "completed",
    title: "B卡模型PSI超阈值告警分析",
    scenario_node: "general",
    created_at: "2026-04-16T10:00:00",
    updated_at: "2026-04-16T12:00:00",
    priority: "P2",
    current_handler: "王五(风控)",
    sla_due_at: null,
    progress_pct: 100,
    initiator: "系统告警",
    trigger: "自动告警",
  },
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
  const now = new Date();
  const nowIso = now.toISOString();
  const sla = new Date(now.getTime() + 24 * 3600_000).toISOString();
  return {
    task_id: `SQZ-${alert.id}`,
    task_type: "analysis",
    status: "pending",
    title: `[稍后异动] ${alert.title}`,
    scenario_node: "credit",
    created_at: nowIso,
    updated_at: nowIso,
    priority: "P1",
    current_handler: "本人",
    sla_due_at: sla,
    progress_pct: 12,
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
  const [sinceLastVisitLabel, setSinceLastVisitLabel] = useState("—");
  const [briefClock, setBriefClock] = useState(() => Date.now());

  const isDemoData = tasks.length === 0 || Boolean(taskError);
  const displayTasks = tasks.length > 0 ? tasks : MOCK_TASKS;
  const displayTasksMerged = useMemo(() => [...snoozeRows, ...displayTasks], [snoozeRows, displayTasks]);

  const myBacklogCount = useMemo(() => countMyBacklog(displayTasksMerged), [displayTasksMerged]);
  const urgentSummary = useMemo(() => pickUrgentTitle(displayTasksMerged), [displayTasksMerged]);

  const dominantType = useMemo(() => pickDominantBacklogTaskType(displayTasksMerged), [displayTasksMerged]);
  /** 与历史「晨间简报」演示口径一致：高危异动条数（接入实时推送后可改为 store 汇总） */
  const dutyHighRiskAlertCount = 3;
  const dutyUpdatedAt = useMemo(() => {
    const d = new Date(briefClock);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }, [briefClock]);

  const heroCtas = useMemo(() => {
    const key = dominantType ?? "analysis";
    return DOMINANT_CTA[key] ?? DOMINANT_CTA.analysis;
  }, [dominantType]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const id = window.setInterval(() => setBriefClock(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const key = "ris_home_prev_open_ts";
    const now = Date.now();
    const prevRaw = sessionStorage.getItem(key);
    const prev = prevRaw ? Number(prevRaw) : NaN;
    sessionStorage.setItem(key, String(now));
    if (!Number.isFinite(prev) || prev <= 0) {
      setSinceLastVisitLabel("本会话首次");
      return;
    }
    const hours = Math.max(0, Math.round((now - prev) / 3_600_000));
    setSinceLastVisitLabel(hours < 1 ? "不足 1 小时" : `${hours} 小时`);
  }, []);

  const scrollToQueue = useCallback(() => {
    requestAnimationFrame(() => {
      document.getElementById("work-queue")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const scrollToSearchlight = useCallback(() => {
    requestAnimationFrame(() => {
      document.getElementById("searchlight-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const handleDutyBriefHighRisk = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("sl", "high");
      return next;
    });
    scrollToSearchlight();
  }, [setSearchParams, scrollToSearchlight]);

  const handleDutyBriefMyPending = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", "mine");
      next.delete("wq");
      return next;
    });
    scrollToQueue();
  }, [setSearchParams, scrollToQueue]);

  const handleDutyBriefMetric = useCallback(() => {
    navigate("/monitor/reports");
  }, [navigate]);

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
    if (action === "查看图谱" || action === "查看关联图谱") {
      void message.info("关系图谱开发中");
      navigate("/risk/fraud");
      return;
    }
    if (action === "规则暂停") {
      void message.success(`已生成规则暂停变更单草稿（关联 ${itemId}），待双人复核后生效`);
      return;
    }
    if (action === "拉取样数据") {
      void message.success(`已提交样本拉取任务（关联 ${itemId}），结果将推送至数据工作台`);
      return;
    }
    if (action === "申请协助转派") {
      void message.info(`已打开转派/协助说明（告警 ${itemId}）：将通知值班长或策略 Owner`);
      return;
    }
    if (action === "转策略排查") {
      void message.success(`已创建策略排查工单草稿（关联 ${itemId}）`);
      navigate("/strategy/list");
      return;
    }
    if (action === "转人工复核") {
      void message.success(`已派送信审/专家复核队列（关联 ${itemId}）`);
      navigate("/risk/inspection");
      return;
    }
    if (action === "查看同类历史工单") {
      void message.info(`打开同类历史工单列表（关联 ${itemId}）：将按规则类型聚合展示`);
      navigate("/monitor/dashboard");
      return;
    }
    if (action === "处置完成关闭" || action === "忽略并记录原因") {
      void message.info(`已记录审计事件：${action} · ${itemId}`);
      return;
    }
    if (action === "加入黑名单") {
      void message.warning(`黑名单变更需双人复核（演示）：${itemId}`);
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
    <div className="space-y-6">
      {taskError && (
        <Alert
          type="warning"
          showIcon
          message="无法连接任务服务"
          description={`${taskError}。请确认已在 backend 目录启动 API（默认 http://127.0.0.1:8000），并检查 frontend/.env.development 中的 VITE_API_BASE_URL。下方列表展示为演示数据。`}
          className="rounded-lg"
        />
      )}

      {/* 指挥台：当班简报 → 异动探照灯 → 核心指标总览 → 风险工单池 → 策略与复核 → 快捷入口 → 品牌区（可折叠） */}
      <DutyBriefBar
        shiftLabel="白班"
        dutyOfficer="张三(值班)"
        sinceLastLoginLabel={sinceLastVisitLabel}
        highRiskAlertCount={dutyHighRiskAlertCount}
        myPendingWorkCount={myBacklogCount}
        metricSummary="授信通过率 -2.1%"
        updatedAtTime={dutyUpdatedAt}
        onClickHighRiskAlerts={handleDutyBriefHighRisk}
        onClickMyPending={handleDutyBriefMyPending}
        onClickMetricSummary={handleDutyBriefMetric}
      />

      <Searchlight onAction={handleSearchlightAction} onSnoozeToQueue={handleSnoozeToQueue} />

      <section className="section-shell">
        <div className="section-header">
          <Text className="section-title">核心指标总览</Text>
          <Text type="secondary" className="section-subtitle ml-2">
            授信 / 支用 / 进件与队列阈值（演示口径）
          </Text>
        </div>
        <div className="section-body">
          <TopDashboard />
        </div>
      </section>

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

      <StrategyReviewSummary
        onGotoPublish={() => navigate("/strategy/publish")}
        onGotoInspection={() => navigate("/risk/inspection")}
        onGotoRules={() => navigate("/strategy/rules")}
      />

      <QuickEntryPanel
        onLaunch={(key) => handleQuickAction(key)}
        onGoto={(path) => navigate(path)}
      />

      <details className="rounded-[var(--radius-glass)] border border-border-soft glass-panel overflow-hidden group">
        <summary className="px-4 py-2.5 text-xs text-text-muted cursor-pointer list-none flex items-center gap-2 select-none hover:bg-white/40">
          <span className="group-open:hidden">展开「风控 OS」品牌区与主操作</span>
          <span className="hidden group-open:inline">收起品牌区</span>
        </summary>
        <div className="px-4 pb-4 border-t border-border-soft">
          <HomeHero
            onQuickAction={handleQuickAction}
            myBacklogCount={myBacklogCount}
            urgentSummary={urgentSummary}
            primaryCta={heroCtas.primary}
            secondaryCta={heroCtas.secondary}
          />
        </div>
      </details>

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
