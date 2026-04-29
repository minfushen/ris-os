import { useCallback, useEffect, useState } from "react";
import { App, Typography } from "antd";
import "./postLoan/post-loan-ui.css";

const { Text } = Typography;
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "@/store/taskStore";
import { api, API_BASE_URL } from "@/api/client";
import { PLATFORM_NAME, PLATFORM_SUBTITLE } from "@/config/brand";
import { useDemoRoleStore } from "@/store/demoRoleStore";
import type { TaskType, TaskResponse } from "@/types";
import type { AnalysisFormValues } from "./AnalysisForm";
import type { ReviewFormValues } from "./ReviewForm";
import PostLoanCoreKpis, { type PostLoanKpiKey } from "./postLoan/PostLoanCoreKpis";
import PostLoanAssetCockpit from "./postLoan/PostLoanAssetCockpit";
import PostLoanSearchlight from "./postLoan/PostLoanSearchlight";
import MyDisposalQueue from "./postLoan/MyDisposalQueue";
import PostLoanQuickActions, { type PostLoanQuickActionDef } from "./postLoan/PostLoanQuickActions";
import ModelerWorkbench from "./postLoan/ModelerWorkbench";
import ApproverWorkbench from "./postLoan/ApproverWorkbench";
import TaskDrawer from "./TaskDrawer";
import {
  PlusOutlined,
  AimOutlined,
  ControlOutlined,
  FileTextOutlined,
  LineChartOutlined,
} from "@ant-design/icons";

function buildAnalysisTaskDescription(v: AnalysisFormValues): string {
  const parts = [
    `类型:${v.analysisType}`,
    `指标:${v.targetMetric}`,
    `场景:${v.scenario}`,
    v.description?.trim(),
  ].filter(Boolean);
  const raw = parts.join(" · ").slice(0, 450) || "贷后预警归因分析";
  return raw.length >= 10 ? raw : `${raw} · 补充说明待完善`;
}

export default function Home() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const taskError = useTaskStore((s) => s.error);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const { role } = useDemoRoleStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<TaskType | null>(null);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const openTaskDrawer = (type: TaskType) => {
    setDrawerType(type);
    setDrawerOpen(true);
  };

  const handleKpiDrill = useCallback(
    (key: PostLoanKpiKey) => {
      switch (key) {
        case "m1":
          navigate("/monitor/asset-quality");
          break;
        case "newAlert":
          navigate("/monitor/dashboard");
          break;
        case "timeout":
          navigate("/risk/workbench");
          break;
        case "effectiveness":
          navigate("/strategy/rules");
          break;
        default:
          break;
      }
    },
    [navigate],
  );

  const handleClaimVerify = useCallback(
    (id: string) => {
      void message.success("已认领核查（演示），跳转预警核查工作台");
      if (id.startsWith("loan-")) {
        const loanId = id.replace("loan-", "");
        navigate(`/risk/workbench?source=loan-overdue&loan_id=${encodeURIComponent(loanId)}`);
        return;
      }
      navigate(`/risk/workbench?alert_id=${encodeURIComponent(id)}`);
    },
    [message, navigate],
  );

  const handleJoinQueue = useCallback(
    (_id: string) => {
      void message.success("已加入我的处置队列（演示）");
      document.getElementById("work-queue")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [message],
  );

  const handleSubmitTask = async (type: TaskType, values: unknown): Promise<TaskResponse> => {
    if (type === "analysis") {
      const v = values as AnalysisFormValues;
      const res = await api.createTask({
        task_type: "analysis",
        description: buildAnalysisTaskDescription(v),
        scenario_node: v.scenario,
      });
      void fetchTasks();
      return res;
    }
    if (type === "review") {
      const v = values as ReviewFormValues;
      const res = await api.createTask({
        task_type: "review",
        description: v.description,
        scenario_node: v.scenario,
      });
      void fetchTasks();
      return res;
    }
    const v = values as { description?: string };
    const res = await api.createTask({
      task_type: "analysis",
      description: v.description || `${type} 任务`,
      scenario_node: "post_loan",
    });
    void fetchTasks();
    return res;
  };

  const quickActions: PostLoanQuickActionDef[] = [
    {
      key: "attribution",
      label: "发起预警归因",
      icon: <PlusOutlined />,
      onClick: () => openTaskDrawer("analysis"),
    },
    {
      key: "visit",
      label: "上门走访记录",
      icon: <AimOutlined />,
      onClick: () => {
        void message.info("走访记录录入（演示）：可对接移动采集 / 影像件");
        navigate("/risk/collection");
      },
    },
    {
      key: "threshold",
      label: "调整预警阈值",
      icon: <ControlOutlined />,
      onClick: () => navigate("/strategy/rules"),
    },
    {
      key: "collection",
      label: "催收策略配置",
      icon: <FileTextOutlined />,
      onClick: () => navigate("/strategy/products"),
    },
    {
      key: "quality",
      label: "资产质量看板",
      icon: <LineChartOutlined />,
      onClick: () => navigate("/monitor/asset-quality"),
    },
  ];

  const isManager = role === "relationship_manager";
  const isModeler = role === "risk_modeler";
  const isApprover = role === "strategy_approver";

  return (
    <div className="flex flex-col gap-3">
      {isManager && taskError && (
        <details
          aria-label="任务服务调试信息（任务服务连接失败）"
          className="max-w-full self-start rounded-md border border-border-soft bg-white/70 px-2.5 py-1 text-[12px] text-text-muted shadow-sm"
        >
          <summary className="cursor-pointer select-none text-text-secondary">
            <span className="sr-only">任务服务连接失败：</span>
            <span>任务服务调试信息</span>
          </summary>
          <div className="mt-1 max-w-[760px] leading-relaxed">
            无法连接任务服务：{taskError}。当前前端请求基址：{API_BASE_URL}。队列区为演示数据；接入后端后待核查列表可与 GET /tasks 同步。
          </div>
        </details>
      )}

      <div className="pl-home-page-header pl-fade-in-up">
        <Text strong className="block font-medium leading-tight text-text-primary" style={{ fontSize: "var(--font-size-lg)" }}>
          {PLATFORM_NAME}
        </Text>
        <Text className="mt-1.5 block font-normal leading-relaxed text-text-secondary" style={{ fontSize: "var(--font-size-base)" }}>
          {PLATFORM_SUBTITLE}
        </Text>
      </div>

      {isManager && (
        <>
          <div className="pl-home-kpi-shell pl-fade-in-up">
            <PostLoanCoreKpis onDrill={handleKpiDrill} />
          </div>

          <div className="pl-fade-in-up" style={{ animationDelay: "0.05s" }}>
            <PostLoanAssetCockpit />
          </div>

          <div className="pl-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <PostLoanSearchlight
              onClaimVerify={handleClaimVerify}
              onJoinQueue={handleJoinQueue}
            />
          </div>

          <div className="pl-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <MyDisposalQueue onOpenItem={() => navigate("/risk/workbench")} />
          </div>

          <div className="pl-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <PostLoanQuickActions actions={quickActions} />
          </div>

          <TaskDrawer
            open={drawerOpen}
            taskType={drawerType}
            onClose={() => {
              setDrawerOpen(false);
              setDrawerType(null);
            }}
            onSubmit={handleSubmitTask}
          />
        </>
      )}

      {isModeler && <ModelerWorkbench />}
      {isApprover && <ApproverWorkbench />}
    </div>
  );
}
