import { Typography, Tabs, Table, Select, DatePicker, Space, Button, Tag } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

/** Vintage 放款批次 × MOB 逾期率（%） */
const VINTAGE_DATA = [
  { month: "2024-01", m0: 0, m1: 1.2, m2: 2.1, m3: 2.8, m4: 3.2, m5: 3.5, m6: 3.7 },
  { month: "2024-02", m0: 0, m1: 1.1, m2: 1.9, m3: 2.5, m4: 2.9, m5: 3.1, m6: null },
  { month: "2024-03", m0: 0, m1: 1.3, m2: 2.0, m3: 2.6, m4: 3.0, m5: null, m6: null },
  { month: "2024-04", m0: 0, m1: 1.0, m2: 1.8, m3: 2.4, m4: null, m5: null, m6: null },
];

const VINTAGE_COLORS = ["#6f8f95", "#4f6970", "#a8c0c3", "#c77b78"];

/** 迁徙矩阵：行=起始状态，列=次月状态，值为迁徙率%（演示） */
const ROLL_MATRIX_LABELS = ["M0", "M1", "M2", "M3", "M4"];
const ROLL_MATRIX: (number | null)[][] = [
  [null, 3.2, 0.4, 0.1, 0.02],
  [null, null, 15.6, 2.1, 0.6],
  [null, null, null, 28.3, 4.2],
  [null, null, null, null, 42.1],
  [null, null, null, null, 55.0],
];

const ROLL_RATE_ROWS = [
  { bucket: "M0→M1", rate: 3.2, trend: "↑" },
  { bucket: "M1→M2", rate: 15.6, trend: "↓" },
  { bucket: "M2→M3", rate: 28.3, trend: "→" },
  { bucket: "M3→M4", rate: 42.1, trend: "↑" },
];

/** 渠道：通过率 vs 风险分（演示） */
const CHANNEL_DATA = [
  { channel: "自营 App", passRate: 78.2, riskScore: 42, apps: 12500 },
  { channel: "联营 API", passRate: 71.5, riskScore: 48, apps: 8200 },
  { channel: "地推", passRate: 65.3, riskScore: 52, apps: 3100 },
  { channel: "异业导流", passRate: 58.9, riskScore: 58, apps: 5600 },
];

/** 策略上线前后（演示） */
const STRATEGY_EFFECT = [
  { metric: "首逾率(FPD7)", before: 2.8, after: 2.1 },
  { metric: "件均授信(万)", before: 3.2, after: 3.0 },
  { metric: "通过率", before: 72.0, after: 69.5 },
  { metric: "欺诈拦截率", before: 2.9, after: 3.4 },
];

/** 模型监控周序列 */
const MODEL_MONITOR = [
  { week: "W-11", ks: 0.34, auc: 0.76, psi: 0.06 },
  { week: "W-10", ks: 0.33, auc: 0.755, psi: 0.07 },
  { week: "W-9", ks: 0.33, auc: 0.752, psi: 0.08 },
  { week: "W-8", ks: 0.32, auc: 0.748, psi: 0.11 },
  { week: "W-7", ks: 0.31, auc: 0.742, psi: 0.14 },
  { week: "W-6", ks: 0.31, auc: 0.738, psi: 0.19 },
  { week: "W-5", ks: 0.3, auc: 0.731, psi: 0.22 },
];

/** 客群结构 */
const SEGMENT_DATA = [
  { name: "纯新客", value: 38, color: "#6f8f95" },
  { name: "老客复贷", value: 45, color: "#4f6970" },
  { name: "回流客群", value: 17, color: "#a8c0c3" },
];

/** 拒绝原因 TOP */
const REJECT_REASONS = [
  { rule: "R-D001 多头共债", count: 420 },
  { rule: "R-M014 夜间交易占比", count: 310 },
  { rule: "R-C088 收入负债比", count: 265 },
  { rule: "R-F032 设备指纹异常", count: 198 },
  { rule: "R-P001 征信硬查询", count: 156 },
];

function buildVintageChartRows(): Record<string, string | number>[] {
  const mobKeys = ["m0", "m1", "m2", "m3", "m4", "m5", "m6"] as const;
  return mobKeys.map((k, i) => {
    const row: Record<string, string | number> = { mob: `M${i}` };
    for (const cohort of VINTAGE_DATA) {
      const v = cohort[k];
      row[cohort.month] = v == null ? Number.NaN : v;
    }
    return row;
  });
}

function matrixCellColor(v: number | null): string {
  if (v == null) return "#fafafa";
  if (v >= 40) return "rgba(199, 123, 120, 0.35)";
  if (v >= 20) return "rgba(215, 168, 95, 0.28)";
  if (v >= 8) return "rgba(111, 143, 149, 0.22)";
  return "rgba(111, 143, 149, 0.08)";
}

function VintageTab() {
  const chartRows = buildVintageChartRows();
  return (
    <div className="space-y-4">
      <Space className="flex flex-wrap">
        <Select defaultValue="credit" style={{ width: 120 }} size="small">
          <Select.Option value="credit">授信</Select.Option>
          <Select.Option value="draw">支用</Select.Option>
          <Select.Option value="post_loan">贷后</Select.Option>
        </Select>
        <DatePicker picker="month" placeholder="起始月份" size="small" />
        <Button icon={<DownloadOutlined />} size="small">导出</Button>
        <Tag color="processing" className="m-0">演示数据</Tag>
      </Space>
      <div className="glass-panel p-4 rounded-[var(--radius-card,8px)]">
        <Text strong className="text-sm block layout-mb-sm">
          各批次 Vintage 曲线（MOB × 逾期率%）
        </Text>
        <Text type="secondary" className="text-xs block layout-mb-md">
          分析师常用曲线对比放款 cohort 质量；表格见下方矩阵明细。
        </Text>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartRows} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mob" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 4]} width={36} label={{ value: "%", angle: 0, position: "insideTopLeft", offset: 0, fontSize: 11 }} />
              <RTooltip formatter={(val: number) => (Number.isFinite(val) ? `${val}%` : "—")} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {VINTAGE_DATA.map((c, i) => (
                <Line
                  key={c.month}
                  type="monotone"
                  dataKey={c.month}
                  name={c.month}
                  stroke={VINTAGE_COLORS[i % VINTAGE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Table
        dataSource={VINTAGE_DATA}
        columns={[
          { title: "放款月份", dataIndex: "month", fixed: "left" as const, width: 100, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
          { title: "M0", dataIndex: "m0", width: 56, render: (v: number) => <Text style={{ fontSize: 13 }}>{v ?? "—"}</Text> },
          { title: "M1", dataIndex: "m1", width: 56, render: (v: number) => <Text style={{ fontSize: 13 }}>{v ?? "—"}</Text> },
          { title: "M2", dataIndex: "m2", width: 56, render: (v: number) => <Text style={{ fontSize: 13 }}>{v ?? "—"}</Text> },
          { title: "M3", dataIndex: "m3", width: 56, render: (v: number) => <Text style={{ fontSize: 13 }}>{v ?? "—"}</Text> },
          { title: "M4", dataIndex: "m4", width: 56, render: (v: number) => <Text style={{ fontSize: 13 }}>{v ?? "—"}</Text> },
          { title: "M5", dataIndex: "m5", width: 56, render: (v: number) => <Text style={{ fontSize: 13 }}>{v ?? "—"}</Text> },
          { title: "M6", dataIndex: "m6", width: 56, render: (v: number) => <Text style={{ fontSize: 13 }}>{v ?? "—"}</Text> },
        ]}
        rowKey="month"
        size="small"
        pagination={false}
        scroll={{ x: 600 }}
      />
    </div>
  );
}

function RollRateTab() {
  return (
    <div className="space-y-4">
      <div className="glass-panel p-4 rounded-[var(--radius-card,8px)]">
        <Text strong className="text-sm block layout-mb-sm">
          迁徙矩阵（热力）
        </Text>
        <Text type="secondary" className="text-xs block layout-mb-md">
          行：账龄起点 → 列：次月状态；颜色越深迁徙强度越高（演示）。
        </Text>
        <div className="overflow-x-auto">
          <table className="border-collapse text-xs w-full max-w-xl">
            <thead>
              <tr>
                <th className="border border-[var(--color-border-soft)] p-2 bg-[#fafafa] w-14"> </th>
                {ROLL_MATRIX_LABELS.map((h) => (
                  <th key={h} className="border border-[var(--color-border-soft)] p-2 bg-[#fafafa] font-medium text-text-secondary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLL_MATRIX.map((row, ri) => (
                <tr key={ri}>
                  <td className="border border-[var(--color-border-soft)] p-2 bg-[#fafafa] font-medium text-text-secondary">
                    {ROLL_MATRIX_LABELS[ri]}
                  </td>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="border border-[var(--color-border-soft)] p-2 text-center tabular-nums"
                      style={{ backgroundColor: matrixCellColor(cell) }}
                    >
                      {cell == null ? "—" : `${cell}%`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="glass-panel p-4 rounded-[var(--radius-card,8px)]">
        <Text strong className="text-sm block layout-mb-sm">关键路径迁徙率</Text>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={ROLL_RATE_ROWS} layout="vertical" margin={{ left: 72, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} unit="%" />
              <YAxis type="category" dataKey="bucket" tick={{ fontSize: 12 }} width={68} />
              <RTooltip formatter={(v: number) => [`${v}%`, "迁徙率"]} />
              <Bar dataKey="rate" fill="#6f8f95" radius={[0, 4, 4, 0]} name="迁徙率%" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Table
        dataSource={ROLL_RATE_ROWS}
        columns={[
          { title: "迁徙路径", dataIndex: "bucket", width: 120, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
          { title: "迁徙率(%)", dataIndex: "rate", width: 100, render: (v: number) => <Text style={{ fontSize: 13 }}>{v}</Text> },
          { title: "环比", dataIndex: "trend", width: 72, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
        ]}
        rowKey="bucket"
        size="small"
        pagination={false}
      />
    </div>
  );
}

function ChannelTab() {
  return (
    <div className="space-y-4">
      <Text type="secondary" className="text-xs block">
        对比各渠道通过率、件均风险分与进件量，识别结构漂移与渠道质量（演示）。
      </Text>
      <div className="glass-panel p-4 rounded-[var(--radius-card,8px)]">
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={CHANNEL_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={48} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} domain={[50, 85]} label={{ value: "通过率%", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[35, 65]} label={{ value: "风险分", angle: 90, position: "insideRight", fontSize: 11 }} />
              <RTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="passRate" name="通过率%" fill="#5f9b7a" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="riskScore" name="风险分(高差)" fill="#6f8f95" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Table
        dataSource={CHANNEL_DATA}
        columns={[
          { title: "渠道", dataIndex: "channel", render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
          { title: "通过率%", dataIndex: "passRate", render: (v: number) => <Text style={{ fontSize: 13 }}>{v}</Text> },
          { title: "风险分(模型)", dataIndex: "riskScore", render: (v: number) => <Text style={{ fontSize: 13 }}>{v}</Text> },
          { title: "进件量", dataIndex: "apps", render: (v: number) => <Text type="secondary" style={{ fontSize: 13 }}>{v.toLocaleString()}</Text> },
        ]}
        rowKey="channel"
        size="small"
        pagination={false}
      />
    </div>
  );
}

function StrategyTab() {
  const chartData = STRATEGY_EFFECT.map((r) => ({
    metric: r.metric,
    上线前: r.before,
    上线后: r.after,
  }));
  return (
    <div className="space-y-4">
      <Space wrap>
        <Select defaultValue="pkg-2026.04" style={{ width: 200 }} size="small" placeholder="策略包版本" />
        <DatePicker.RangePicker size="small" />
      </Space>
      <Text type="secondary" className="text-xs block">
        策略发布前后核心指标对照（演示）。各指标量纲不同，生产环境建议分面或归一化后再并列对比。
      </Text>
      <div className="glass-panel p-4 rounded-[var(--radius-card,8px)]">
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={56} />
              <YAxis tick={{ fontSize: 12 }} />
              <RTooltip />
              <Legend />
              <Bar dataKey="上线前" fill="#d9d9d9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="上线后" fill="#6f8f95" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ModelTab() {
  return (
    <div className="space-y-4">
      <Text type="secondary" className="text-xs block">
        主模型分箱稳定性：KS、AUC、PSI 周趋势；PSI 持续升高需触发 O2O / 特征排查（演示）。
      </Text>
      <div className="glass-panel p-4 rounded-[var(--radius-card,8px)]">
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={MODEL_MONITOR} margin={{ top: 8, right: 48, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" domain={[0.25, 0.38]} tick={{ fontSize: 12 }} width={40} />
              <YAxis yAxisId="right" orientation="right" domain={[0.7, 0.78]} tick={{ fontSize: 12 }} width={44} />
              <RTooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="ks" name="KS" stroke="#6f8f95" strokeWidth={2} dot />
              <Line yAxisId="right" type="monotone" dataKey="auc" name="AUC" stroke="#5f9b7a" strokeWidth={2} dot />
              <Line yAxisId="left" type="monotone" dataKey="psi" name="PSI" stroke="#d7a85f" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SegmentTab() {
  return (
    <div className="space-y-4">
      <Text type="secondary" className="text-xs block">
        新客 / 老客复贷 / 回流占比与趋势，用于额度与策略分层（演示）。
      </Text>
      <div className="flex flex-wrap gap-6 items-start">
        <div className="glass-panel p-4 rounded-[var(--radius-card,8px)]" style={{ minWidth: 280, flex: "1 1 280px" }}>
          <Text strong className="text-sm block layout-mb-sm">进件结构占比</Text>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={SEGMENT_DATA}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={88}
                  label={(p) => {
                    const pct = (p.percent ?? 0) * 100;
                    return `${String(p.name)} ${pct.toFixed(0)}%`;
                  }}
                >
                  {SEGMENT_DATA.map((e) => (
                    <Cell key={e.name} fill={e.color} />
                  ))}
                </Pie>
                <RTooltip formatter={(v: number) => [`${v}%`, "占比"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-[var(--radius-card,8px)] flex-1 min-w-[240px]">
          <Text strong className="text-sm block layout-mb-sm">说明</Text>
          <ul className="text-xs text-text-secondary pl-4 m-0 space-y-2">
            <li>与 Vintage / 渠道报表联动：按客群切片对比逾期与通过率。</li>
            <li>生产环境建议按「首借 / 复借 / 冷却回流」口径配置 cohort 标签。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function RejectTab() {
  return (
    <div className="space-y-4">
      <Text type="secondary" className="text-xs block">
        按规则/原因聚合拒绝量，定位策略误杀或政策收紧影响（演示）。
      </Text>
      <div className="glass-panel p-4 rounded-[var(--radius-card,8px)]">
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={REJECT_REASONS} layout="vertical" margin={{ left: 120, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="rule" width={112} tick={{ fontSize: 11 }} />
              <RTooltip formatter={(v: number) => [v, "拒绝笔数"]} />
              <Bar dataKey="count" name="拒绝笔数" fill="#c77b78" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const items = [
    { key: "vintage", label: "Vintage分析", children: <VintageTab /> },
    { key: "rollrate", label: "迁徙率 / 矩阵", children: <RollRateTab /> },
    { key: "channel", label: "渠道拆解", children: <ChannelTab /> },
    { key: "strategy", label: "策略效果", children: <StrategyTab /> },
    { key: "model", label: "模型监控", children: <ModelTab /> },
    { key: "segment", label: "客群分析", children: <SegmentTab /> },
    { key: "reject", label: "拒绝原因", children: <RejectTab /> },
  ];

  return (
    <ModulePageShell
      title="报表中心"
      subtitle="消金风控：Vintage 曲线、迁徙矩阵、渠道与策略效果、模型 KS/AUC/PSI、客群与拒绝原因（演示数据）"
      breadcrumb={["监控与分析", "报表中心"]}
    >
      <ModuleSectionCard noPadding>
        <Tabs items={items} className="layout-px-lg layout-pb-md" />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
