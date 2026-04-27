import { useMemo, useState } from "react";
import { Row, Col, Typography, Table, Tag, Button, Progress, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const WARNING_OVERVIEW = [
  { label: "总预警数", value: "156", hint: "今日新增 +18", color: "#4f6970" },
  { label: "红灯", value: "23", hint: "需实时触达", color: "#cf1322" },
  { label: "黄灯", value: "133", hint: "批量提醒", color: "#d46b08" },
  { label: "处置率", value: "87%", hint: "SLA 内闭环", color: "#5f9b7a" },
];

const WARNING_TREND = [
  { day: "9/1", red: 18, yellow: 122 },
  { day: "9/2", red: 21, yellow: 128 },
  { day: "9/3", red: 26, yellow: 136 },
  { day: "9/4", red: 30, yellow: 142 },
  { day: "9/5", red: 24, yellow: 138 },
  { day: "9/6", red: 20, yellow: 131 },
  { day: "9/7", red: 23, yellow: 133 },
];

const WARNING_TYPES = [
  { type: "涉诉预警", pct: 45, color: "#cf1322" },
  { type: "征信预警", pct: 30, color: "#d46b08" },
  { type: "工商预警", pct: 15, color: "#4f6970" },
  { type: "其他", pct: 10, color: "#8c8c8c" },
];

const MODEL_EFFECTS = [
  { label: "PSI: 0.08", status: "正常", color: "green" },
  { label: "KS: 0.42", status: "正常", color: "green" },
  { label: "命中率: 68%", status: "较上周 +3%", color: "blue" },
];

const PENDING_ALERTS = [
  {
    id: "W-240418-01",
    customer: "XX科技有限公司",
    type: "涉诉",
    rule: "RULE_023",
    level: "red" as const,
    manager: "张三",
    time: "09:30",
    sla: "剩 4h",
  },
  {
    id: "W-240418-02",
    customer: "YY贸易有限公司",
    type: "失信",
    rule: "RULE_056",
    level: "red" as const,
    manager: "李四",
    time: "10:15",
    sla: "剩 6h",
  },
  {
    id: "W-240418-03",
    customer: "ZZ物流有限公司",
    type: "征信",
    rule: "RULE_078",
    level: "yellow" as const,
    manager: "王五",
    time: "11:20",
    sla: "剩 1天",
  },
];

type PendingAlertRow = (typeof PENDING_ALERTS)[number];

export default function Dashboard() {
  const navigate = useNavigate();
  const [lastRefresh, setLastRefresh] = useState("10:42");

  const columns = useMemo<ColumnsType<PendingAlertRow>>(() => [
    {
      title: "等级",
      dataIndex: "level",
      width: 72,
      render: (v: "red" | "yellow") => (
        <Tag color={v === "red" ? "red" : "orange"} className="!m-0 text-[12px]">
          {v === "red" ? "红灯" : "黄灯"}
        </Tag>
      ),
    },
    { title: "客户名称", dataIndex: "customer", width: 160, render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
    { title: "预警类型", dataIndex: "type", width: 96, render: (v: string) => <Text className="text-[13px]">{v}</Text> },
    { title: "命中规则", dataIndex: "rule", width: 100, render: (v: string) => <Text code className="text-[12px]">{v}</Text> },
    { title: "预警时间", dataIndex: "time", width: 92, render: (v: string) => <Text className="text-[13px]">{v}</Text> },
    { title: "客户经理", dataIndex: "manager", width: 92, render: (v: string) => <Text className="text-[13px]">{v}</Text> },
    { title: "SLA", dataIndex: "sla", width: 88, render: (v: string) => <Text className="text-[13px] text-[#d46b08]">{v}</Text> },
    {
      title: "操作",
      key: "op",
      width: 120,
      render: (_: unknown, row) => (
        <Button type="primary" size="small" icon={<ThunderboltOutlined />} onClick={() => navigate("/risk/workbench", { state: { alertId: row.id } })}>
          认领并核查
        </Button>
      ),
    },
  ], [navigate]);

  return (
    <ModulePageShell
      title="贷后预警监控大盘"
      subtitle="面向面试演示的贷后预警主看板：监控态势、模型效果与待处置队列一页收口（演示数据）"
      breadcrumb={["预警监控", "预警大盘"]}
      actions={
        <Space wrap>
          <Text type="secondary" className="text-[12px]">最近刷新 {lastRefresh}</Text>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => setLastRefresh(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }))}
          >
            刷新
          </Button>
        </Space>
      }
    >
      <ModuleSectionCard title="今日预警概览" subtitle="红灯实时推送，黄灯批量推送；处置率按 SLA 内结案统计">
        <Row gutter={[16, 16]}>
          {WARNING_OVERVIEW.map((item) => (
            <Col xs={24} sm={12} md={6} key={item.label}>
              <div className="kpi-stat-card">
                <Text className="kpi-stat-card__label">{item.label}</Text>
                <Text strong className="kpi-stat-card__value" style={{ color: item.color }}>
                  {item.value}
                </Text>
                <Text type="secondary" className="text-[12px]">{item.hint}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </ModuleSectionCard>

      <ModuleSectionCard title="预警趋势图" subtitle="近 7 日红灯 / 黄灯预警量走势">
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={WARNING_TREND} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={36} />
              <RTooltip />
              <Line type="monotone" dataKey="red" name="红灯" stroke="#cf1322" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="yellow" name="黄灯" stroke="#d46b08" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ModuleSectionCard>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ModuleSectionCard title="预警类型分布" subtitle="用于判断外部数据源与规则触发结构">
            <Space direction="vertical" className="w-full" size={12}>
              {WARNING_TYPES.map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <Text>{item.type}</Text>
                    <Text type="secondary">{item.pct}%</Text>
                  </div>
                  <Progress percent={item.pct} showInfo={false} strokeColor={item.color} />
                </div>
              ))}
            </Space>
          </ModuleSectionCard>
        </Col>
        <Col xs={24} lg={12}>
          <ModuleSectionCard title="模型效果监控" subtitle="异常时反向驱动数据源排查与规则/模型迭代">
            <Space direction="vertical" className="w-full" size={12}>
              {MODEL_EFFECTS.map((item) => (
                <div key={item.label} className="rounded-lg border border-black/[0.08] bg-[#fafafa] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <Text strong className="text-[15px]">{item.label}</Text>
                    <Tag color={item.color} className="!m-0">{item.status}</Tag>
                  </div>
                </div>
              ))}
              <Text type="secondary" className="text-[12px]">
                讲解口径：PSI 偏高排查数据漂移，KS 下滑排查模型区分度，命中率下降触发规则调优。
              </Text>
            </Space>
          </ModuleSectionCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <ModuleSectionCard title="监控驱动迭代" subtitle="把监控指标直接转成策略动作">
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={WARNING_TYPES} layout="vertical" margin={{ left: 88, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <YAxis type="category" dataKey="type" width={84} tick={{ fontSize: 11 }} />
                  <RTooltip formatter={(v: number) => [`${v}%`, "占比"]} />
                  <Bar dataKey="pct" name="占比%" radius={[0, 4, 4, 0]}>
                    {WARNING_TYPES.map((entry) => (
                      <Cell key={entry.type} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ModuleSectionCard>
        </Col>
        <Col xs={24} lg={14}>
          <ModuleSectionCard title="处置闭环设计" subtitle="预警不是终点，处置结果会反哺规则优化">
            <div className="grid gap-3 md:grid-cols-4">
              {["预警推送", "客户经理认领", "处置反馈", "规则优化"].map((step, index) => (
                <div key={step} className="rounded-lg border border-black/[0.08] bg-[#fafafa] p-4">
                  <Text type="secondary" className="text-[11px]">Step {index + 1}</Text>
                  <Text strong className="block text-[14px] mt-1">{step}</Text>
                </div>
              ))}
            </div>
            <Text type="secondary" className="text-[12px] block mt-3">
              红灯通过站内信 / 企业微信实时触达，黄灯按批次进入客户经理队列；误报多的规则进入调优案例库。
            </Text>
          </ModuleSectionCard>
        </Col>
      </Row>

      <ModuleSectionCard title="待处置预警列表" subtitle="点击红灯预警进入处置工作台，形成面试演示主链路">
        <Table dataSource={PENDING_ALERTS} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 900 }} />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
