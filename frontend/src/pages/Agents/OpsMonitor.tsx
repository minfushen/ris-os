import { Button, Space, Table, Tag, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const AGENT_METRICS = [
  { label: "任务成功率", value: "96.4%", note: "近 24 小时", tone: "green" },
  { label: "平均推理耗时", value: "21s", note: "P95 48s", tone: "blue" },
  { label: "工具调用失败率", value: "1.8%", note: "主要为外部数据超时", tone: "gold" },
  { label: "人工采纳率", value: "73%", note: "建议被确认采用", tone: "green" },
  { label: "高风险拦截", value: "14", note: "需主管复核", tone: "red" },
  { label: "审计覆盖率", value: "100%", note: "关键动作留痕", tone: "green" },
];

const AGENT_ROWS = [
  { agent: "预警归因 Agent", status: "运行中", success: "98.1%", latency: "18s", adoption: "76%", risk: "低" },
  { agent: "处置建议 Agent", status: "运行中", success: "95.8%", latency: "24s", adoption: "71%", risk: "中" },
  { agent: "策略调优 Agent", status: "待复核", success: "93.5%", latency: "32s", adoption: "64%", risk: "中" },
  { agent: "话术合规 Agent", status: "运行中", success: "97.2%", latency: "15s", adoption: "79%", risk: "低" },
  { agent: "复盘质检 Agent", status: "运行中", success: "94.7%", latency: "28s", adoption: "68%", risk: "中" },
];

const AUDIT_ROWS = [
  { id: "A-2401", at: "2026-04-18 09:20", agent: "预警归因 Agent", action: "生成归因摘要", result: "人工采纳" },
  { id: "A-2402", at: "2026-04-18 09:31", agent: "处置建议 Agent", action: "建议客户回访", result: "主管复核" },
  { id: "A-2403", at: "2026-04-18 10:02", agent: "话术合规 Agent", action: "拦截违规话术", result: "已替换" },
  { id: "A-2404", at: "2026-04-18 10:22", agent: "策略调优 Agent", action: "生成阈值建议", result: "进入仿真" },
];

export default function OpsMonitor() {
  return (
    <ModulePageShell
      title="Agent 运行监控"
      subtitle="监控智能体任务成功率、工具调用、人工采纳率和审计留痕，确保 Agent 可控、可解释、可回滚"
      breadcrumb={["智能体协同", "Agent 运行监控"]}
      actions={
        <Button type="primary" size="small" icon={<ReloadOutlined />}>
          刷新运行态
        </Button>
      }
    >
      <ModuleSectionCard title="Agent 运行指标" subtitle="强调金融场景中 Agent 不是黑箱，需要可观测和可审计">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {AGENT_METRICS.map((metric) => (
            <div className="card-surface layout-p-md" key={metric.label}>
              <Text type="secondary" className="text-[12px] block">
                {metric.label}
              </Text>
              <Text strong className="text-[22px] block layout-mt-xs">
                {metric.value}
              </Text>
              <Tag color={metric.tone} className="layout-mt-sm">
                {metric.note}
              </Tag>
            </div>
          ))}
        </div>
      </ModuleSectionCard>

      <ModuleSectionCard title="智能体状态" subtitle="按 Agent 维度观察成功率、耗时、采纳率和风险等级" noPadding>
        <Table
          rowKey="agent"
          size="small"
          pagination={false}
          dataSource={AGENT_ROWS}
          columns={[
            { title: "Agent", dataIndex: "agent", render: (v: string) => <Text strong>{v}</Text> },
            {
              title: "状态",
              dataIndex: "status",
              width: 100,
              render: (v: string) => <Tag color={v === "运行中" ? "green" : "gold"}>{v}</Tag>,
            },
            { title: "成功率", dataIndex: "success", width: 90 },
            { title: "平均耗时", dataIndex: "latency", width: 90 },
            { title: "人工采纳率", dataIndex: "adoption", width: 110 },
            {
              title: "风险",
              dataIndex: "risk",
              width: 80,
              render: (v: string) => <Tag color={v === "低" ? "green" : "gold"}>{v}</Tag>,
            },
          ]}
        />
      </ModuleSectionCard>

      <ModuleSectionCard title="审计日志" subtitle="关键建议、人工确认、工具调用和拦截事件都需要留痕" noPadding>
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={AUDIT_ROWS}
          columns={[
            { title: "时间", dataIndex: "at", width: 150 },
            { title: "Agent", dataIndex: "agent", width: 150 },
            { title: "动作", dataIndex: "action" },
            {
              title: "结果",
              dataIndex: "result",
              width: 110,
              render: (v: string) => <Tag>{v}</Tag>,
            },
          ]}
        />
      </ModuleSectionCard>

      <ModuleSectionCard title="控制边界">
        <Space direction="vertical" size={8}>
          <Text className="text-[13px]">Agent 可自动分析、归因、草拟建议和生成质检结论。</Text>
          <Text className="text-[13px]">客户触达、策略发布、模型上线、重大风险升级必须走人工确认和审批流程。</Text>
          <Text className="text-[13px]">所有建议、工具调用、人工采纳或驳回都会进入审计日志，支持复盘和持续学习。</Text>
        </Space>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
