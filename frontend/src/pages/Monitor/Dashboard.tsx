import { Row, Col, Typography, Table, Tag, Button } from "antd";
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
} from "recharts";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

/** 近 8 周 M1+ 逾期率（%） */
const M1_TREND = [
  { week: "W-7", m1: 2.9 },
  { week: "W-6", m1: 3.0 },
  { week: "W-5", m1: 3.1 },
  { week: "W-4", m1: 3.15 },
  { week: "W-3", m1: 3.22 },
  { week: "W-2", m1: 3.28 },
  { week: "W-1", m1: 3.35 },
  { week: "本周", m1: 3.42 },
];

/** 按规则分组的预警有效率（演示） */
const RULE_EFFICIENCY = [
  { rule: "司法涉诉", rate: 83, count: 42 },
  { rule: "多头借贷", rate: 71, count: 128 },
  { rule: "经营异常", rate: 65, count: 56 },
  { rule: "设备簇", rate: 58, count: 89 },
];

/** 产品线 × 预警强度（热力演示：0–100） */
const HEAT_PRODUCTS = ["经营贷", "税金贷", "消费贷", "小微贷"];
const HEAT_CHANNELS = ["自营", "API", "地推", "联营"];
const HEAT_MATRIX: number[][] = [
  [72, 88, 45, 62],
  [55, 49, 70, 58],
  [38, 42, 33, 51],
  [64, 71, 52, 66],
];

function heatColor(v: number): string {
  if (v >= 75) return "rgba(207, 19, 34, 0.45)";
  if (v >= 55) return "rgba(250, 140, 22, 0.35)";
  if (v >= 40) return "rgba(250, 173, 20, 0.22)";
  return "rgba(111, 143, 149, 0.12)";
}

const REALTIME_ALERTS = [
  {
    id: "W-240418-01",
    customer: "张三科技",
    rule: "司法被执行",
    level: "high" as const,
    sla: "剩 4h",
    time: "10:32",
    aux: "CL20240312 · 制造业",
  },
  {
    id: "W-240418-02",
    customer: "李四贸易",
    rule: "多头余额异动",
    level: "medium" as const,
    sla: "剩 1天",
    time: "09:15",
    aux: "CL20231220 · 批发零售",
  },
  {
    id: "W-240418-03",
    customer: "王五物流",
    rule: "税报断档",
    level: "low" as const,
    sla: "剩 3天",
    time: "08:40",
    aux: "WH20251088 · 道路运输",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const columns = [
    { title: "预警单号", dataIndex: "id", width: 120, render: (v: string) => <Text code className="text-[13px]">{v}</Text> },
    { title: "客户 / 主体", dataIndex: "customer", width: 100, render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
    { title: "命中规则", dataIndex: "rule", width: 110, render: (v: string) => <Text className="text-[13px]">{v}</Text> },
    {
      title: "级别",
      dataIndex: "level",
      width: 72,
      render: (v: "high" | "medium" | "low") => (
        <Tag color={v === "high" ? "red" : v === "medium" ? "orange" : "blue"} className="!m-0 text-[12px]">
          {v === "high" ? "高" : v === "medium" ? "中" : "低"}
        </Tag>
      ),
    },
    { title: "SLA", dataIndex: "sla", width: 80, render: (v: string) => <Text className="text-[13px] text-[#d46b08]">{v}</Text> },
    { title: "触发", dataIndex: "time", width: 64, render: (v: string) => <Text type="secondary" className="text-[12px]">{v}</Text> },
    {
      title: "辅助信息",
      dataIndex: "aux",
      ellipsis: true,
      render: (v: string) => <Text type="secondary" className="text-[12px]">{v}</Text>,
    },
    {
      title: "操作",
      key: "op",
      width: 120,
      render: (_: unknown, row: (typeof REALTIME_ALERTS)[0]) => (
        <Button type="primary" size="small" icon={<ThunderboltOutlined />} onClick={() => navigate("/risk/workbench", { state: { alertId: row.id } })}>
          认领并核查
        </Button>
      ),
    },
  ];

  return (
    <ModulePageShell
      title="预警探照灯"
      subtitle="贷后资产预警发现与处置入口：从静态看板转为可行动任务流（演示数据）"
      breadcrumb={["资产监控", "预警探照灯"]}
      actions={
        <Button icon={<ReloadOutlined />}>刷新</Button>
      }
    >
      <ModuleSectionCard title="预警概览" subtitle="新增预警客户（今日 / 本周）">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div className="rounded-lg border border-black/[0.08] bg-white p-4 shadow-sm">
              <Text type="secondary" className="text-[12px] block">今日新增预警客户</Text>
              <Text strong className="text-[28px] leading-tight text-[#d46b08] block mt-1">23</Text>
              <Text type="secondary" className="text-[12px]">较昨日 +8</Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="rounded-lg border border-black/[0.08] bg-white p-4 shadow-sm">
              <Text type="secondary" className="text-[12px] block">本周新增预警客户</Text>
              <Text strong className="text-[28px] leading-tight text-[#4f6970] block mt-1">104</Text>
              <Text type="secondary" className="text-[12px]">含司法 / 多头 / 经营类</Text>
            </div>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <div className="rounded-lg border border-black/[0.08] bg-white p-3 shadow-sm h-full min-h-[120px]">
              <Text strong className="text-[13px] block mb-2">M1+ 逾期率趋势</Text>
              <div style={{ width: "100%", height: 140 }}>
                <ResponsiveContainer>
                  <LineChart data={M1_TREND} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis domain={[2.5, 3.6]} tick={{ fontSize: 11 }} width={36} unit="%" />
                    <RTooltip formatter={(v: number) => [`${v}%`, "M1+"]} />
                    <Line type="monotone" dataKey="m1" name="M1+(%)" stroke="#c77b78" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
        </Row>
      </ModuleSectionCard>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <ModuleSectionCard title="预警有效率（按规则）" subtitle="命中后核查为「有效预警」占比（演示）">
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={RULE_EFFICIENCY} layout="vertical" margin={{ left: 88, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <YAxis type="category" dataKey="rule" width={84} tick={{ fontSize: 11 }} />
                  <RTooltip formatter={(v: number, _n, p) => [`${v}%`, `样本 ${(p?.payload as { count: number }).count}`]} />
                  <Bar dataKey="rate" name="有效率%" fill="#5f9b7a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ModuleSectionCard>
        </Col>
        <Col xs={24} lg={14}>
          <ModuleSectionCard title="产品线 × 渠道 预警热力" subtitle="数值越高表示预警密度越大（演示）">
            <div className="overflow-x-auto">
              <table className="border-collapse text-xs w-full max-w-2xl">
                <thead>
                  <tr>
                    <th className="border border-[#f0f0f0] p-2 bg-[#fafafa] w-20">产品 \ 渠道</th>
                    {HEAT_CHANNELS.map((h) => (
                      <th key={h} className="border border-[#f0f0f0] p-2 bg-[#fafafa] font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HEAT_MATRIX.map((row, ri) => (
                    <tr key={HEAT_PRODUCTS[ri]}>
                      <td className="border border-[#f0f0f0] p-2 bg-[#fafafa] font-medium">{HEAT_PRODUCTS[ri]}</td>
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="border border-[#f0f0f0] p-2 text-center tabular-nums font-medium"
                          style={{ backgroundColor: heatColor(cell) }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Text type="secondary" className="text-[12px] block mt-2">下钻：可联动至「策略效果追踪」规则维度与「预警核查工作台」队列。</Text>
          </ModuleSectionCard>
        </Col>
      </Row>

      <ModuleSectionCard title="实时预警列表" subtitle="可认领并进入核查闭环">
        <Table dataSource={REALTIME_ALERTS} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 900 }} />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
