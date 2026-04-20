import { Typography, Tabs, Table, Select, DatePicker, Space, Button, Tag, Progress } from "antd";
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

/** 迁徙矩阵 */
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

/** 预警有效率报表：规则精度（演示） */
const WARNING_RULE_ROWS = [
  { rule: "司法被执行", triggers: 420, truePositive: 348, precision: 83, recall: 62 },
  { rule: "多头余额异动", triggers: 1280, truePositive: 908, precision: 71, recall: 55 },
  { rule: "税报断档", triggers: 560, truePositive: 364, precision: 65, recall: 48 },
  { rule: "设备簇", triggers: 890, truePositive: 516, precision: 58, recall: 41 },
];

/** 逾期催收效率：按策略/渠道（演示） */
const COLLECTION_BY_STRATEGY = [
  { dim: "IVR 早触达", contactRate: 78, promiseRate: 22, rollCure: 14 },
  { dim: "人工 T+1", contactRate: 91, promiseRate: 38, rollCure: 21 },
  { dim: "委外 M3+", contactRate: 72, promiseRate: 18, rollCure: 9 },
];

const COLLECTION_BY_CHANNEL = [
  { channel: "自营", dpd7Cure: 41, costPerAccount: 12 },
  { channel: "API", dpd7Cure: 35, costPerAccount: 18 },
  { channel: "地推", dpd7Cure: 38, costPerAccount: 15 },
];

/** RM 业绩看板（演示） */
const RM_PERFORMANCE = [
  { rm: "王敏", region: "华东", assigned: 186, closed30d: 142, avgDays: 4.2, score: 88 },
  { rm: "李涛", region: "华南", assigned: 210, closed30d: 155, avgDays: 5.1, score: 84 },
  { rm: "赵倩", region: "西南", assigned: 98, closed30d: 61, avgDays: 6.8, score: 72 },
];

/** 行业风险热力（演示） */
const INDUSTRY_RISK = [
  { industry: "道路运输", riskIdx: 62, m1plus: 4.2, balanceShare: 8 },
  { industry: "批发零售", riskIdx: 58, m1plus: 3.6, balanceShare: 22 },
  { industry: "住宿餐饮", riskIdx: 55, m1plus: 3.9, balanceShare: 6 },
  { industry: "制造业", riskIdx: 48, m1plus: 2.8, balanceShare: 18 },
  { industry: "软件信息", riskIdx: 35, m1plus: 1.9, balanceShare: 12 },
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
        <Select defaultValue="post_loan" style={{ width: 120 }} size="small">
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
          贷后资产质量常用 cohort 曲线；表格为矩阵明细。
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

function WarningEfficiencyTab() {
  return (
    <div className="space-y-4">
      <Text type="secondary" className="text-xs block">
        预警有效率报表：规则触发量、真阳性、精度与召回（演示）；生产可对接核查结论回流。
      </Text>
      <div className="glass-panel p-4 rounded-[var(--radius-card,8px)]">
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={WARNING_RULE_ROWS} margin={{ top: 8, right: 16, left: 8, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="rule" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={56} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <RTooltip />
              <Legend />
              <Bar dataKey="precision" name="精度%" fill="#5f9b7a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recall" name="召回%" fill="#6f8f95" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Table
        size="small"
        pagination={false}
        rowKey="rule"
        dataSource={WARNING_RULE_ROWS}
        columns={[
          { title: "规则", dataIndex: "rule", render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
          { title: "触发量", dataIndex: "triggers" },
          { title: "真阳性", dataIndex: "truePositive" },
          { title: "精度%", dataIndex: "precision", render: (v: number) => <Tag color="blue" className="!m-0">{v}%</Tag> },
          { title: "召回%", dataIndex: "recall" },
        ]}
      />
    </div>
  );
}

function CollectionEfficiencyTab() {
  return (
    <div className="space-y-4">
      <Text type="secondary" className="text-xs block">
        逾期催收效率：触达率、承诺还款率、滚动治愈（按策略维度）；下表为渠道 DPD7 治愈与单户成本（演示）。
      </Text>
      <div className="glass-panel p-4 rounded-[var(--radius-card,8px)]">
        <Text strong className="text-sm block layout-mb-md">按催收策略</Text>
        <Table
          size="small"
          pagination={false}
          rowKey="dim"
          dataSource={COLLECTION_BY_STRATEGY}
          columns={[
            { title: "策略", dataIndex: "dim" },
            { title: "触达率%", dataIndex: "contactRate", render: (v: number) => <Progress percent={v} size="small" showInfo /> },
            { title: "承诺率%", dataIndex: "promiseRate" },
            { title: "滚动治愈%", dataIndex: "rollCure" },
          ]}
        />
      </div>
      <div className="glass-panel p-4 rounded-[var(--radius-card,8px)]">
        <Text strong className="text-sm block layout-mb-md">按渠道</Text>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={COLLECTION_BY_CHANNEL} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={[0, 50]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <RTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="dpd7Cure" name="DPD7治愈%" fill="#5f9b7a" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="costPerAccount" name="单户成本" fill="#c77b78" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function RmPerformanceTab() {
  return (
    <div className="space-y-4">
      <Text type="secondary" className="text-xs block">
        客户经理（RM）在贷后预警处置、回款闭环上的工作量与结果指标（演示）。
      </Text>
      <Table
        size="small"
        pagination={false}
        rowKey="rm"
        dataSource={RM_PERFORMANCE}
        columns={[
          { title: "RM", dataIndex: "rm", render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
          { title: "区域", dataIndex: "region" },
          { title: "分配件数", dataIndex: "assigned" },
          { title: "30日闭环", dataIndex: "closed30d" },
          { title: "平均处理天数", dataIndex: "avgDays" },
          {
            title: "综合得分",
            dataIndex: "score",
            render: (v: number) => <Progress type="circle" percent={v} width={44} format={(p) => `${p ?? 0}`} />,
          },
        ]}
      />
    </div>
  );
}

function IndustryRiskTab() {
  return (
    <div className="space-y-4">
      <Text type="secondary" className="text-xs block">
        行业风险热力：风险指数、M1+ 与余额占比；可与「资产质量看板」行业 Top 联动（演示）。
      </Text>
      <div className="glass-panel p-4 rounded-[var(--radius-card,8px)]">
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={INDUSTRY_RISK} margin={{ top: 8, right: 16, left: 8, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="industry" tick={{ fontSize: 11 }} interval={0} angle={-10} textAnchor="end" height={52} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: "指数", angle: -90, position: "insideLeft", fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" />
              <RTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="riskIdx" name="风险指数" fill="#c77b78" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="m1plus" name="M1+%" fill="#6f8f95" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Table
        size="small"
        pagination={false}
        rowKey="industry"
        dataSource={INDUSTRY_RISK}
        columns={[
          { title: "行业", dataIndex: "industry" },
          { title: "风险指数", dataIndex: "riskIdx", render: (v: number) => <Tag color={v >= 55 ? "red" : v >= 48 ? "orange" : "default"} className="!m-0">{v}</Tag> },
          { title: "M1+%", dataIndex: "m1plus" },
          { title: "余额占比%", dataIndex: "balanceShare" },
        ]}
      />
    </div>
  );
}

export default function Reports() {
  const items = [
    { key: "vintage", label: "Vintage 分析", children: <VintageTab /> },
    { key: "rollrate", label: "迁徙率 / 矩阵", children: <RollRateTab /> },
    { key: "warning_eff", label: "预警有效率", children: <WarningEfficiencyTab /> },
    { key: "collection", label: "逾期催收效率", children: <CollectionEfficiencyTab /> },
    { key: "rm", label: "RM 业绩", children: <RmPerformanceTab /> },
    { key: "industry", label: "行业风险热力", children: <IndustryRiskTab /> },
  ];

  return (
    <ModulePageShell
      title="报表中心"
      subtitle="贷后扩展报表：Vintage、迁徙矩阵、预警有效率、催收效率、RM 业绩与行业风险（演示数据）；已移除授信期模型监控占位 Tab。"
      breadcrumb={["资产监控", "报表中心"]}
    >
      <ModuleSectionCard noPadding>
        <Tabs items={items} className="layout-px-lg layout-pb-md" />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
