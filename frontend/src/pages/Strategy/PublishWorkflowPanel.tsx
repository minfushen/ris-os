import { useMemo, useState } from "react";
import {
  Typography,
  Steps,
  Table,
  Button,
  Space,
  Alert,
  Tag,
  Modal,
  Divider,
  App,
} from "antd";
import { RollbackOutlined, RocketOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

export type WorkflowStepStatus = "wait" | "process" | "finish" | "error";

export interface WorkflowStepDef {
  key: string;
  title: string;
  description: string;
  status: WorkflowStepStatus;
  /** 当前卡在该节点的处理人（演示） */
  assignee?: string;
}

export interface AuditLogRow {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
}

const INITIAL_STEPS: WorkflowStepDef[] = [
  { key: "change", title: "策略变更", description: "Diff 已锁定", status: "finish" },
  { key: "backtest", title: "回测验证", description: "离线回放通过", status: "finish" },
  { key: "impact", title: "影响评估", description: "评估报告已归档", status: "finish" },
  { key: "tech", title: "技术审核", description: "引擎组签字", status: "finish" },
  { key: "biz", title: "业务审核", description: "授信政策室", status: "process", assignee: "王五(授信)" },
  { key: "compliance", title: "合规审核", description: "消金合规", status: "wait" },
  { key: "canary", title: "灰度上线", description: "10% 流量", status: "wait" },
  { key: "monitor", title: "监控确认", description: "指标对比窗口", status: "wait" },
  { key: "full", title: "全量推送", description: "生产全量", status: "wait" },
];

const INITIAL_AUDIT: AuditLogRow[] = [
  {
    id: "1",
    at: "2026-04-18 09:12:03",
    actor: "张三(策略)",
    action: "提交发布申请",
    detail: "版本 V3.1→V3.2，灰度 10%，熔断开启",
  },
  {
    id: "2",
    at: "2026-04-18 09:40:22",
    actor: "李四(引擎)",
    action: "技术审核通过",
    detail: "规则包校验 / 影子比对无异常",
  },
  {
    id: "3",
    at: "2026-04-18 10:05:00",
    actor: "系统",
    action: "待办生成",
    detail: "业务审核节点待处理人：王五(授信)",
  },
];

interface GrayscaleMetricRow {
  key: string;
  metric: string;
  baseline: string;
  canary: string;
  delta: string;
  flag: "ok" | "warn" | "risk";
}

const GRAYSCALE_METRICS: GrayscaleMetricRow[] = [
  { key: "1", metric: "通过率", baseline: "72.1%", canary: "74.0%", delta: "+1.9ppt", flag: "ok" },
  { key: "2", metric: "首逾 FPD7", baseline: "2.81%", canary: "2.76%", delta: "-0.05ppt", flag: "ok" },
  { key: "3", metric: "件均授信(万)", baseline: "3.18", canary: "3.22", delta: "+0.04", flag: "warn" },
  { key: "4", metric: "欺诈拦截率", baseline: "3.05%", canary: "3.42%", delta: "+0.37ppt", flag: "warn" },
  { key: "5", metric: "规则耗时 P99(ms)", baseline: "118", canary: "124", delta: "+6", flag: "ok" },
];

interface PublishWorkflowPanelProps {
  changeId: string;
}

export default function PublishWorkflowPanel({ changeId }: PublishWorkflowPanelProps) {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [steps, setSteps] = useState<WorkflowStepDef[]>(INITIAL_STEPS);
  const [audit, setAudit] = useState<AuditLogRow[]>(INITIAL_AUDIT);
  const [canaryActive, setCanaryActive] = useState(false);

  const currentBlocker = useMemo(() => {
    const p = steps.find((s) => s.status === "process");
    return p ? `${p.title} — ${p.assignee ?? "待分配"}` : null;
  }, [steps]);

  const pushAudit = (actor: string, action: string, detail: string) => {
    const row: AuditLogRow = {
      id: `${Date.now()}`,
      at: new Date().toLocaleString("zh-CN", { hour12: false }),
      actor,
      action,
      detail,
    };
    setAudit((prev) => [row, ...prev]);
  };

  const handleSimulateCanaryStart = () => {
    Modal.confirm({
      title: "开始灰度观察窗？",
      content: "演示：将「灰度上线」标为进行中，并打开下方指标对比面板。",
      onOk: () => {
        setCanaryActive(true);
        setSteps((prev) =>
          prev.map((s) => {
            if (s.key === "biz") return { ...s, status: "finish" as const, assignee: undefined };
            if (s.key === "compliance") return { ...s, status: "finish" as const };
            if (s.key === "canary") return { ...s, status: "process" as const, description: "10% 流量观测中" };
            return s;
          })
        );
        pushAudit("王五(授信)", "业务/合规审核通过", "演示：进入灰度阶段");
      },
    });
  };

  const handleFullRollout = () => {
    Modal.confirm({
      title: "确认全量推送？",
      content: "生产将把新版本切换为 100% 流量（演示，无真实调用）。",
      onOk: () => {
        setSteps((prev) =>
          prev.map((s) => {
            if (s.key === "canary" || s.key === "monitor") return { ...s, status: "finish" as const };
            if (s.key === "full") return { ...s, status: "finish" as const, description: "已全量" };
            return s;
          })
        );
        pushAudit("当前用户", "确认全量推送", `变更单 ${changeId} 关闭灰度窗并全量生效`);
        void message.success("已标记为全量生效（演示），可在审计表中留痕");
      },
    });
  };

  const handleRollback = () => {
    Modal.confirm({
      title: "执行灰度回滚？",
      content: "将切回线上基线版本，并记录审计（演示）。",
      okType: "danger",
      onOk: () => {
        setSteps((prev) =>
          prev.map((s) => {
            if (s.key === "canary") return { ...s, status: "error" as const, description: "已回滚" };
            if (s.key === "monitor" || s.key === "full") return { ...s, status: "wait" as const };
            return s;
          })
        );
        setCanaryActive(false);
        pushAudit("当前用户", "灰度回滚", `变更单 ${changeId} 已回滚至 V3.1`);
      },
    });
  };

  const activeIndex = steps.findIndex((s) => s.status === "process");
  const errIdx = steps.findIndex((s) => s.status === "error");
  const stepsCurrent =
    activeIndex >= 0 ? activeIndex : errIdx >= 0 ? errIdx : Math.max(0, steps.length - 1);

  const stepItems = steps.map((s) => ({
    title: s.title,
    description: (
      <span className="text-[11px] text-text-muted">
        {s.description}
        {s.assignee ? ` · ${s.assignee}` : ""}
      </span>
    ),
    status: s.status,
  }));

  const auditColumns: ColumnsType<AuditLogRow> = [
    { title: "时间", dataIndex: "at", width: 160, render: (t) => <Text className="text-xs">{t}</Text> },
    { title: "操作人", dataIndex: "actor", width: 120, render: (t) => <Text className="text-xs">{t}</Text> },
    { title: "动作", dataIndex: "action", width: 140, render: (t) => <Tag className="text-xs m-0">{t}</Tag> },
    { title: "摘要", dataIndex: "detail", ellipsis: true, render: (t) => <Text className="text-xs">{t}</Text> },
  ];

  const grayColumns: ColumnsType<GrayscaleMetricRow> = [
    { title: "指标", dataIndex: "metric", width: 140, render: (t) => <Text strong className="text-xs">{t}</Text> },
    { title: "基线(旧版全量)", dataIndex: "baseline", render: (t) => <Text className="text-xs">{t}</Text> },
    { title: `灰度(新策略 ${changeId})`, dataIndex: "canary", render: (t) => <Text className="text-xs">{t}</Text> },
    {
      title: "偏差",
      dataIndex: "delta",
      width: 100,
      render: (t: string, r) => (
        <Text className="text-xs" type={r.flag === "risk" ? "danger" : r.flag === "warn" ? "warning" : "secondary"}>
          {t}
        </Text>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Alert
        type="info"
        showIcon
        message={`变更单 ${changeId}`}
        description="以下为银行级发布流水线示意：可查看节点责任人、灰度期指标对比，并在观察窗结束后闭环「全量」或「回滚」。审计表记录谁、何时、做了什么。"
      />

      <ModuleSectionCard title="发布流程（彩虹状态）" subtitle="行业常见 9 步：当前阻塞节点高亮">
        {currentBlocker && (
          <Alert type="warning" showIcon className="layout-mb-md" message="当前阻塞" description={currentBlocker} />
        )}
        <Steps
          direction="horizontal"
          size="small"
          current={stepsCurrent}
          items={stepItems}
          className="overflow-x-auto pb-2"
        />
        <Divider className="my-3" />
        <Space wrap>
          <Button size="small" onClick={handleSimulateCanaryStart}>
            演示：推进至灰度阶段
          </Button>
          <Text type="secondary" className="text-xs">
            真实环境由审批流引擎驱动节点状态；此处按钮仅用于联调 UI。
          </Text>
        </Space>
      </ModuleSectionCard>

      <ModuleSectionCard
        title="灰度监控对比"
        subtitle={canaryActive ? "灰度窗口内：基线 vs 灰度桶实时对比（演示数据）" : "待进入灰度阶段后展示对比表"}
      >
        {canaryActive ? (
          <>
            <Table
              size="small"
              pagination={false}
              rowKey="key"
              dataSource={GRAYSCALE_METRICS}
              columns={grayColumns}
              className="layout-mb-md"
            />
            <Space wrap>
              <Button type="primary" icon={<RocketOutlined />} onClick={handleFullRollout}>
                确认全量推送
              </Button>
              <Button danger icon={<RollbackOutlined />} onClick={handleRollback}>
                执行回滚
              </Button>
            </Space>
          </>
        ) : (
          <Text type="secondary" className="text-sm">
            灰度流量生效后，此处展示通过率/逾期/欺诈/耗时的并排对比，并支持一键全量或回滚闭环。
          </Text>
        )}
      </ModuleSectionCard>

      <ModuleSectionCard title="变更记录 / 审计日志" subtitle="监管与内审硬需求：谁、何时、对什么做了操作">
        <Table size="small" pagination={{ pageSize: 8 }} rowKey="id" dataSource={audit} columns={auditColumns} />
      </ModuleSectionCard>

      <div className="text-right">
        <Button onClick={() => navigate("/strategy/products")}>返回产品线策略集</Button>
      </div>
    </div>
  );
}
