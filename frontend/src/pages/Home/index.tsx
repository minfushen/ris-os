import { useCallback, useEffect, useState } from "react";
import { Alert, App, Typography } from "antd";
import "./postLoan/post-loan-ui.css";

const { Text } = Typography;
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "@/store/taskStore";
import { api, API_BASE_URL } from "@/api/client";
import type { TaskType, TaskResponse } from "@/types";
import type { AnalysisFormValues } from "./AnalysisForm";
import type { ReviewFormValues } from "./ReviewForm";
import PostLoanCoreKpis, { type PostLoanKpiKey } from "./postLoan/PostLoanCoreKpis";
import PostLoanSearchlight from "./postLoan/PostLoanSearchlight";
import MyDisposalQueue from "./postLoan/MyDisposalQueue";
import PostLoanQuickActions, { type PostLoanQuickActionDef } from "./postLoan/PostLoanQuickActions";
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
          document.getElementById("searchlight-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
          break;
        case "timeout":
          document.getElementById("work-queue")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    (_id: string) => {
      void message.success("已认领核查（演示），跳转预警核查工作台");
      navigate("/risk/workbench");
    },
    [message, navigate],
  );

  const handleViewAlertDetail = useCallback(
    (_id: string) => {
      void message.info("打开预警详情（演示）：可下钻至客户借据与外部数据源");
      navigate("/risk/workbench");
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

  return (
    <div className="space-y-6">
      {taskError && (
        <Alert
          type="warning"
          showIcon
          message="无法连接任务服务"
          description={`${taskError}。当前前端请求基址：${API_BASE_URL}。队列区为演示数据；接入后端后待核查列表可与 GET /tasks 同步。`}
          className="rounded-xl pl-fade-in-up"
          style={{ borderRadius: 12 }}
        />
      )}

      {/* 页面标题区 - 吸顶效果 */}
      <div 
        className="rounded-xl px-6 py-5 sticky top-0 z-10 pl-fade-in-up"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 251, 252, 0.95) 100%)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02)"
        }}
      >
        <Text strong className="text-[19px] text-[#1a1a1a] font-semibold leading-tight">
          首页 · 贷后资产总览
        </Text>
        <Text className="pl-aux-text mt-2 block text-[13px] leading-relaxed opacity-75">
          今日有没有新增预警客户、资产质量有没有恶化、我的处置工单有没有超时 — 三类问题一页收口。
        </Text>
      </div>

      {/* KPI 区域 - 添加背景板 */}
      <div 
        className="rounded-2xl p-5 pl-fade-in-up"
        style={{
          background: "linear-gradient(135deg, rgba(59, 107, 125, 0.02) 0%, rgba(59, 107, 125, 0.01) 100%)",
          border: "1px solid rgba(59, 107, 125, 0.08)"
        }}
      >
        <PostLoanCoreKpis onDrill={handleKpiDrill} />
      </div>

      <div className="pl-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <PostLoanSearchlight
          onClaimVerify={handleClaimVerify}
          onViewDetail={handleViewAlertDetail}
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
    </div>
  );
}
