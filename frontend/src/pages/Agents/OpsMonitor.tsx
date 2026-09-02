/**
 * Agent 运行监控 — 监控任务成功率、工具调用、人工采纳与审计留痕
 */

import { Card, Col, Row, Statistic, Table, Tag, Typography } from "antd";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const AGENT_STATS = [
  { key: "1", agent: "预警归因 Agent", calls: 1284, success: "98.4%", adoption: 87.2, latency: "1.8s" },
  { key: "2", agent: "企业风险评估 Agent", calls: 342, success: "96.8%", adoption: 81.5, latency: "6.2s" },
  { key: "3", agent: "处置建议 Agent", calls: 1180, success: "99.1%", adoption: 76.4, latency: "0.9s" },
  { key: "4", agent: "策略调优 Agent", calls: 46, success: "100%", adoption: 58.7, latency: "12.4s" },
  { key: "5", agent: "话术合规 Agent", calls: 2077, success: "99.6%", adoption: 93.1, latency: "0.4s" },
  { key: "6", agent: "复盘质检 Agent", calls: 965, success: "98.9%", adoption: 84.6, latency: "1.2s" },
];

const AUDIT_LOGS = [
  { key: "1", time: "2026-04-29 10:18:22", agent: "预警归因 Agent", action: "生成归因结论", target: "AL-20260429-012 · 恒力机械制造", trace: "AUDIT-AGT-20260429-0418" },
  { key: "2", time: "2026-04-29 10:02:41", agent: "企业风险评估 Agent", action: "调用企查查 MCP · 9 维评估", target: "恒力机械制造有限公司", trace: "AUDIT-AGT-20260429-0417" },
  { key: "3", time: "2026-04-29 09:47:03", agent: "处置建议 Agent", action: "推送处置待办", target: "RM001 · 张明", trace: "AUDIT-AGT-20260429-0416" },
  { key: "4", time: "2026-04-29 09:31:15", agent: "话术合规 Agent", action: "话术预检通过", target: "HS-012 · 还款提醒", trace: "AUDIT-AGT-20260429-0415" },
  { key: "5", time: "2026-04-29 08:55:37", agent: "复盘质检 Agent", action: "转人工复检", target: "CZ-20260426-041 · 广源建材", trace: "AUDIT-AGT-20260429-0414" },
];

export default function OpsMonitor() {
  return (
    <ModulePageShell
      title="Agent 运行监控"
      subtitle="监控任务成功率、工具调用、人工采纳与审计留痕"
    >
      <ModuleSectionCard title="Agent 运行指标" subtitle="近 7 日滚动窗口 · 数据来自 Agent 网关埋点" className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic title="今日任务调用量" value={5894} suffix="次" valueStyle={{ color: "#2563eb" }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic title="平均任务成功率" value="98.9%" valueStyle={{ color: "#52c41a" }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic title="人工采纳率" value="80.3%" suffix="（均值）" valueStyle={{ color: "#7c3aed" }} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic title="平均响应时延" value="1.4s" valueStyle={{ color: "#d97706" }} />
            </Card>
          </Col>
        </Row>
      </ModuleSectionCard>

      <ModuleSectionCard title="分 Agent 运行明细" subtitle="人工采纳率 = 建议被人工确认执行的比例" noPadding className="mb-4">
        <Table
          size="middle"
          pagination={false}
          rowKey="key"
          dataSource={AGENT_STATS}
          columns={[
            { title: "Agent", dataIndex: "agent" },
            { title: "调用次数", dataIndex: "calls", width: 110 },
            { title: "成功率", dataIndex: "success", width: 100 },
            {
              title: "人工采纳率",
              dataIndex: "adoption",
              width: 130,
              render: (v: number) => <Text>{v.toFixed(1)}%</Text>,
            },
            { title: "平均时延", dataIndex: "latency", width: 100 },
            {
              title: "状态",
              key: "status",
              width: 90,
              render: () => <Tag color="green">运行正常</Tag>,
            },
          ]}
        />
      </ModuleSectionCard>

      <ModuleSectionCard title="审计日志" subtitle="所有 Agent 动作均留痕，支持按留痕编号追溯" noPadding>
        <Table
          size="middle"
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
          rowKey="key"
          dataSource={AUDIT_LOGS}
          columns={[
            { title: "时间", dataIndex: "time", width: 180 },
            { title: "Agent", dataIndex: "agent", width: 180 },
            { title: "动作", dataIndex: "action" },
            { title: "对象", dataIndex: "target" },
            { title: "留痕编号", dataIndex: "trace", width: 210 },
          ]}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
