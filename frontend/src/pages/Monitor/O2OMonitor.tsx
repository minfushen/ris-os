import { useState } from "react";
import {
  Typography,
  Table,
  Tag,
  Space,
  Progress,
  Divider,
  Button,
  Steps,
  Tooltip,
  Alert,
} from "antd";
import { SearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

/** 偏差在展示层的含义（与表格「偏差」列一致） */
type DriftMode = "abs_ppt" | "relative_pct";

interface O2OMetric {
  key: string;
  metric: string;
  expected: string;
  actual: string;
  /** 相对预期的偏差：rate 类为百分点差；耗时等为相对变化 % */
  deviation: number;
  driftMode: DriftMode;
  status: "normal" | "warning" | "critical";
}

interface CaseItem {
  id: string;
  onlineResult: "pass" | "reject";
  offlineResult: "pass" | "reject";
  deviation: string;
  applicant?: string;
}

/** 单指标打分：容忍带内接近满分，超出后边际递减（避免 |偏差|×权重 线性夸罚） */
interface MetricScoreBand {
  /** 权重（用于加权平均，总和不必为 1，内部会归一） */
  weight: number;
  /** |偏差| ≤ okBand → 满分区 */
  okBand: number;
  /** |偏差| ≤ warnBand → 线性过渡到 70 分 */
  warnBand: number;
}

const METRIC_SCORE_BANDS: Record<string, MetricScoreBand> = {
  自动审批率: { weight: 0.28, okBand: 3, warnBand: 7 },
  平均决策耗时: { weight: 0.18, okBand: 12, warnBand: 22 },
  欺诈拦截率: { weight: 0.22, okBand: 4, warnBand: 10 },
  人工复核率: { weight: 0.16, okBand: 8, warnBand: 18 },
};

/**
 * 单指标对齐分 40–100：在 ok/warn 带内分段，warn 之外按饱和曲线下降。
 * 业务含义：O2O 看的是「是否超出可接受漂移带」，而非偏差绝对值线性扣分。
 */
function metricAlignmentSubscore(absDrift: number, band: MetricScoreBand): number {
  const { okBand, warnBand } = band;
  if (absDrift <= okBand) return 100;
  if (absDrift <= warnBand) {
    const t = (absDrift - okBand) / (warnBand - okBand);
    return 100 - t * 30;
  }
  const excess = absDrift - warnBand;
  const floor = 42;
  const scale = 28;
  return Math.max(floor, 70 - (1 - Math.exp(-excess / scale)) * 28);
}

/**
 * 综合一致性得分：0.42×min(子分) + 0.58×加权平均子分。
 * 体现「任一条链路明显变差会拖累整体」，比单纯 Σ(偏差×权重) 更接近风控 O2O 复盘习惯。
 */
function computeCompositeAlignmentScore(metrics: O2OMetric[]): number {
  const subscores: number[] = [];
  let weighted = 0;
  let wSum = 0;
  for (const m of metrics) {
    const band = METRIC_SCORE_BANDS[m.metric];
    if (!band) continue;
    const abs = Math.abs(m.deviation);
    const s = metricAlignmentSubscore(abs, band);
    subscores.push(s);
    weighted += s * band.weight;
    wSum += band.weight;
  }
  if (!subscores.length) return 100;
  const minS = Math.min(...subscores);
  const avg = wSum ? weighted / wSum : minS;
  const composite = 0.42 * minS + 0.58 * avg;
  return Math.round(Math.max(0, Math.min(100, composite)) * 10) / 10;
}

// —— 模拟 O2O 指标（含 driftMode 供打分解释）——
const O2O_METRICS: O2OMetric[] = [
  {
    key: "1",
    metric: "自动审批率",
    expected: "42.5%",
    actual: "35.0%",
    deviation: -7.5,
    driftMode: "abs_ppt",
    status: "critical",
  },
  {
    key: "2",
    metric: "平均决策耗时",
    expected: "1.2s",
    actual: "1.5s",
    deviation: 25,
    driftMode: "relative_pct",
    status: "warning",
  },
  {
    key: "3",
    metric: "欺诈拦截率",
    expected: "3.2%",
    actual: "3.0%",
    deviation: -6.25,
    driftMode: "relative_pct",
    status: "normal",
  },
  {
    key: "4",
    metric: "人工复核率",
    expected: "15.0%",
    actual: "18.5%",
    deviation: 23.3,
    driftMode: "relative_pct",
    status: "warning",
  },
];

const CASE_DATA: CaseItem[] = [
  { id: "TK-123", onlineResult: "reject", offlineResult: "pass", deviation: "线上拒/线下过", applicant: "张*" },
  { id: "TK-124", onlineResult: "pass", offlineResult: "reject", deviation: "线上过/线下拒", applicant: "李*" },
  { id: "TK-125", onlineResult: "reject", offlineResult: "pass", deviation: "线上拒/线下过", applicant: "王*" },
  { id: "TK-126", onlineResult: "reject", offlineResult: "pass", deviation: "线上拒/线下过", applicant: "赵*" },
  { id: "TK-127", onlineResult: "pass", offlineResult: "reject", deviation: "线上过/线下拒", applicant: "陈*" },
];

type LayerKey = "data" | "rule" | "sample";

interface LayerDiagnosis {
  layer: LayerKey;
  title: string;
  status: "likely" | "suspect" | "ruled_out";
  confidence: number;
  signals: string[];
}

/** 演示：发现偏差后的自动归因（真实环境由特征/规则版本/样本对齐任务产出） */
const DEVIATION_PATH_DIAGNOSIS: LayerDiagnosis[] = [
  {
    layer: "data",
    title: "数据层（特征管道 / 空值 / 分布）",
    status: "likely",
    confidence: 78,
    signals: [
      "近 7 日规则 R-D001 依赖的 6 个轻度特征中，4 个 PSI>0.25（分布漂移）",
      "device_risk_score 线上空值率 2.1% → 4.8%，与离线回测切片不一致",
      "特征落库延迟 P99 从 180ms 升至 520ms，存在截断窗口错位风险",
    ],
  },
  {
    layer: "rule",
    title: "规则层（版本 / 灰度 / 参数）",
    status: "suspect",
    confidence: 44,
    signals: [
      "线上规则包 v202.3.1，离线回放仍绑定 v202.2.8（版本未对齐）",
      "灰度桶 B 命中路径与离线样本默认路径不一致（待双人复核）",
    ],
  },
  {
    layer: "sample",
    title: "样本层（进件结构 / 时段 / 渠道）",
    status: "suspect",
    confidence: 52,
    signals: [
      "夜间小额进件占比 +6.2ppt，与回测训练窗口结构差异扩大",
      "新渠道「联营」首周放量，离线基线未覆盖该子总体",
    ],
  },
];

interface FeatureDriftRow {
  key: string;
  ruleId: string;
  feature: string;
  psi: number;
  nullOnline: number;
  nullOffline: number;
  meanOnline: number;
  meanOffline: number;
  flag: "critical" | "warning" | "watch";
}

const FEATURE_DRIFT_ROWS: FeatureDriftRow[] = [
  {
    key: "1",
    ruleId: "R-D001",
    feature: "device_risk_score",
    psi: 0.31,
    nullOnline: 4.8,
    nullOffline: 2.1,
    meanOnline: 0.42,
    meanOffline: 0.51,
    flag: "critical",
  },
  {
    key: "2",
    ruleId: "R-D001",
    feature: "app_list_entropy_30d",
    psi: 0.19,
    nullOnline: 0.6,
    nullOffline: 0.5,
    meanOnline: 2.84,
    meanOffline: 2.91,
    flag: "warning",
  },
  {
    key: "3",
    ruleId: "R-M014",
    feature: "txn_cnt_7d",
    psi: 0.08,
    nullOnline: 0.1,
    nullOffline: 0.1,
    meanOnline: 4.2,
    meanOffline: 4.1,
    flag: "watch",
  },
  {
    key: "4",
    ruleId: "R-M014",
    feature: "night_ratio_14d",
    psi: 0.27,
    nullOnline: 1.2,
    nullOffline: 0.9,
    meanOnline: 0.33,
    meanOffline: 0.26,
    flag: "critical",
  },
];

interface HistoryPoint {
  week: string;
  score: number;
  note?: string;
}

const O2O_SCORE_HISTORY: HistoryPoint[] = [
  { week: "W-7", score: 93.2 },
  { week: "W-6", score: 92.4 },
  { week: "W-5", score: 91.8 },
  { week: "W-4", score: 91.1 },
  { week: "W-3", score: 90.4 },
  { week: "W-2", score: 89.6 },
  { week: "W-1", score: 88.4 },
  { week: "本周", score: 0, note: "current" },
];

function layerStatusToStepStatus(s: LayerDiagnosis["status"]): "finish" | "error" | "wait" | "process" {
  if (s === "likely") return "error";
  if (s === "suspect") return "process";
  return "finish";
}

export default function O2OMonitor() {
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);

  const overallScore = computeCompositeAlignmentScore(O2O_METRICS);
  const historyWithCurrent = O2O_SCORE_HISTORY.map((p) =>
    p.note === "current" ? { ...p, score: overallScore } : p
  );
  const prevWeekScore = historyWithCurrent[historyWithCurrent.length - 2]?.score ?? overallScore;
  const weekDelta = Math.round((overallScore - prevWeekScore) * 10) / 10;
  const isCritical = overallScore < 90;

  const scoreExplain = (
    <div className="max-w-sm text-xs space-y-1">
      <p className="m-0">
        综合分 = 42%×最弱指标对齐分 + 58%×加权平均对齐分；单指标对齐分按「容忍带」分段衰减，而非 |偏差|×权重 线性扣分。
      </p>
      <p className="m-0 text-text-muted">
        容忍带按指标类型单独配置（见代码 METRIC_SCORE_BANDS）。接入生产后应由策略与数据团队校准 ok/warn 阈值。
      </p>
    </div>
  );

  const metricColumns = [
    {
      title: "核心指标",
      dataIndex: "metric",
      key: "metric",
      width: 120,
      render: (text: string) => <Text strong style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: "预期(离线)",
      dataIndex: "expected",
      key: "expected",
      width: 100,
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: "线上(实际)",
      dataIndex: "actual",
      key: "actual",
      width: 100,
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: "偏差",
      dataIndex: "deviation",
      key: "deviation",
      width: 100,
      render: (deviation: number, record: O2OMetric) => {
        const color = record.status === "critical" ? "#ff4d4f" : record.status === "warning" ? "#faad14" : "#52c41a";
        const unit = record.driftMode === "abs_ppt" ? "ppt" : "%";
        return (
          <Text style={{ fontSize: 13, color }}>
            {deviation > 0 ? "+" : ""}
            {deviation}
            {unit === "ppt" ? " ppt" : "%"}
            {record.status === "critical" && " 🔴"}
          </Text>
        );
      },
    },
    {
      title: "打分口径",
      key: "drift",
      width: 88,
      render: (_: unknown, record: O2OMetric) => (
        <Text type="secondary" className="text-xs">
          {record.driftMode === "abs_ppt" ? "绝对 ppt" : "相对%"}
        </Text>
      ),
    },
  ];

  const featureColumns = [
    { title: "规则", dataIndex: "ruleId", key: "ruleId", width: 88 },
    { title: "特征", dataIndex: "feature", key: "feature", ellipsis: true },
    {
      title: "PSI",
      dataIndex: "psi",
      key: "psi",
      width: 72,
      render: (v: number) => (
        <Text strong={v >= 0.25} style={{ color: v >= 0.25 ? "#cf1322" : undefined }}>
          {v.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "空值率 线上/离线",
      key: "null",
      width: 130,
      render: (_: unknown, r: FeatureDriftRow) => (
        <Text className="text-xs">
          {r.nullOnline.toFixed(1)}% / {r.nullOffline.toFixed(1)}%
        </Text>
      ),
    },
    {
      title: "均值 线上/离线",
      key: "mean",
      width: 130,
      render: (_: unknown, r: FeatureDriftRow) => (
        <Text className="text-xs">
          {r.meanOnline.toFixed(2)} / {r.meanOffline.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "信号",
      dataIndex: "flag",
      key: "flag",
      width: 88,
      render: (f: FeatureDriftRow["flag"]) => {
        const map = { critical: { c: "red", t: "强漂移" }, warning: { c: "orange", t: "关注" }, watch: { c: "default", t: "观察" } };
        const x = map[f];
        return <Tag color={x.c}>{x.t}</Tag>;
      },
    },
  ];

  const caseColumns = [
    {
      title: "案件ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (text: string) => <Text code style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: "线上结果",
      dataIndex: "onlineResult",
      key: "onlineResult",
      width: 80,
      render: (result: "pass" | "reject") => (
        <Tag color={result === "pass" ? "green" : "red"} className="!m-0">
          {result === "pass" ? "通过" : "拒绝"}
        </Tag>
      ),
    },
    {
      title: "线下结果",
      dataIndex: "offlineResult",
      key: "offlineResult",
      width: 80,
      render: (result: "pass" | "reject") => (
        <Tag color={result === "pass" ? "green" : "red"} className="!m-0">
          {result === "pass" ? "通过" : "拒绝"}
        </Tag>
      ),
    },
    {
      title: "偏差类型",
      dataIndex: "deviation",
      key: "deviation",
      width: 120,
      render: (text: string) => (
        <Text style={{ fontSize: 13, color: "#ff4d4f" }}>{text}</Text>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 60,
      render: (_: unknown, record: CaseItem) => (
        <Button
          type="link"
          size="small"
          icon={<SearchOutlined />}
          onClick={() => setSelectedCase(record)}
          style={{ fontSize: 13 }}
        >
          查单
        </Button>
      ),
    },
  ];

  return (
    <ModulePageShell
      title="O2O一致性监控"
      subtitle="线上实际 vs 离线预期：得分、归因路径、特征漂移与历史趋势"
      breadcrumb={["监控与分析", "O2O一致性"]}
    >
      {/* 整体一致性得分 */}
      <ModuleSectionCard
        title={
          <Space size={6}>
            <span>整体一致性得分</span>
            <Tooltip title={scoreExplain}>
              <QuestionCircleOutlined className="text-text-muted cursor-help" />
            </Tooltip>
          </Space>
        }
      >
        <div className="layout-flex-center layout-gap-xl">
          <div style={{ textAlign: "center" }}>
            <Text type="secondary" style={{ fontSize: 13, display: "block" }}>
              综合对齐分（演示）
            </Text>
            <Text
              strong
              style={{
                fontSize: 32,
                color: isCritical ? "#ff4d4f" : "#52c41a",
              }}
            >
              {overallScore}
            </Text>
            {isCritical && (
              <Tag color="red" className="layout-ml-sm">
                低于阈值 90
              </Tag>
            )}
            <div className="layout-mt-sm">
              <Text type="secondary" className="text-xs block">
                环比上周（{prevWeekScore}）：{weekDelta >= 0 ? "+" : ""}
                {weekDelta}（{weekDelta < 0 ? "变差" : weekDelta > 0 ? "改善" : "持平"}）
              </Text>
            </div>
          </div>
          <div className="layout-flex-1">
            <Progress
              percent={overallScore}
              strokeColor={isCritical ? "#ff4d4f" : "#52c41a"}
              showInfo={false}
            />
            <Text type="secondary" style={{ fontSize: 13 }}>
              阈值 90 分 | 当前 {overallScore} 分 | 结合下方「历史趋势」判断偶发或持续劣化
            </Text>
          </div>
        </div>
      </ModuleSectionCard>

      {/* 偏差归因路径 */}
      <ModuleSectionCard title="偏差归因路径（数据 / 规则 / 样本）" subtitle="发现 O2O 偏差后的排查顺序与系统推断（演示数据）">
        <Alert
          type="info"
          showIcon
          className="layout-mb-md"
          message="排查逻辑"
          description="先排数据层（特征空值、PSI、时效）→ 再排规则层（版本/灰度/参数）→ 最后看样本层（进件结构是否与回测切片一致）。以下为基于当前漂移信号的自动排序摘要。"
        />
        <Steps
          direction="vertical"
          size="small"
          items={DEVIATION_PATH_DIAGNOSIS.map((d) => ({
            status: layerStatusToStepStatus(d.status),
            title: (
              <Space wrap>
                <Text strong className="text-sm">{d.title}</Text>
                <Tag color={d.status === "likely" ? "red" : d.status === "suspect" ? "orange" : "default"}>
                  {d.status === "likely" ? "高可能" : d.status === "suspect" ? "待验证" : "已排除"}
                </Tag>
                <Text type="secondary" className="text-xs">
                  置信度 {d.confidence}%
                </Text>
              </Space>
            ),
            description: (
              <ul className="m-0 pl-4 text-xs text-text-secondary space-y-1">
                {d.signals.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            ),
          }))}
        />
      </ModuleSectionCard>

      {/* 历史趋势 */}
      <ModuleSectionCard title="历史 O2O 综合分趋势" subtitle="用于区分趋势性变差与单周偶发（演示：近 8 周）">
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyWithCurrent} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} width={36} />
              <RechartsTooltip formatter={(v: number) => [`${v}`, "综合分"]} />
              <ReferenceLine y={90} stroke="#faad14" strokeDasharray="4 4" label={{ value: "阈值90", fill: "#ad6800", fontSize: 11 }} />
              <Line type="monotone" dataKey="score" stroke="#6f8f95" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Text type="secondary" className="text-xs block layout-mt-sm">
          生产接入：按自然周或发布窗口聚合，与规则版本、特征批次标签关联，支持点击下钻到单次离线回放任务。
        </Text>
      </ModuleSectionCard>

      {/* 特征级突变 */}
      <ModuleSectionCard title="特征级突变检查" subtitle="影响增量的关键规则 × 轻度特征：PSI、空值率、均值对比（演示）">
        <Table
          dataSource={FEATURE_DRIFT_ROWS}
          columns={featureColumns}
          pagination={false}
          size="small"
          rowKey="key"
        />
        <Text type="secondary" className="text-xs block layout-mt-sm">
          经验阈值（可配置）：PSI ≥ 0.25 标红；空值率环比 +2ppt 以上需与数据工程对齐切片口径。
        </Text>
      </ModuleSectionCard>

      {/* 指标对比表 */}
      <ModuleSectionCard title="线上线下核心指标对比">
        <Table
          dataSource={O2O_METRICS}
          columns={metricColumns}
          pagination={false}
          size="small"
          rowKey="key"
        />
      </ModuleSectionCard>

      {/* 异常案件抽检 */}
      <ModuleSectionCard title="异常案件抽检与标注回流">
        <div className="layout-flex layout-gap-md">
          <div className="layout-flex-1">
            <Table
              dataSource={CASE_DATA}
              columns={caseColumns}
              pagination={false}
              size="small"
              rowKey="id"
              onRow={(record) => ({
                onClick: () => setSelectedCase(record),
                style: {
                  cursor: "pointer",
                  background: selectedCase?.id === record.id ? "#e6f7ff" : "transparent",
                },
              })}
            />
          </div>

          <div
            className="layout-p-md border border-[#d9d9d9] bg-[#fafafa] shrink-0"
            style={{ width: 280 }}
          >
            {selectedCase ? (
              <>
                <Text strong className="text-[12px] block layout-mb-sm">
                  标注面板 - {selectedCase.id}
                </Text>
                <div className="layout-mb-md">
                  <Text type="secondary" className="text-[13px]">
                    申请人: {selectedCase.applicant}
                  </Text>
                </div>

                <Divider rootClassName="layout-divider-y-sm" />

                <Text className="text-[13px] block layout-mb-sm">
                  1. 人工定性:
                </Text>
                <Space direction="vertical" size={4}>
                  <Button size="small" block style={{ textAlign: "left" }}>
                    ○ 线上正确
                  </Button>
                  <Button size="small" block style={{ textAlign: "left" }}>
                    ○ 线下结论对
                  </Button>
                  <Button size="small" block style={{ textAlign: "left" }}>
                    ○ 灰黑产
                  </Button>
                </Space>

                <Divider rootClassName="layout-divider-y-md" />

                <Text className="text-[13px] block layout-mb-sm">
                  2. 知识回流:
                </Text>
                <Space direction="vertical" size={4}>
                  <Button size="small" block style={{ textAlign: "left" }}>
                    ☐ 打入黑样本池
                  </Button>
                  <Button size="small" block style={{ textAlign: "left" }}>
                    ☐ 更新特征库
                  </Button>
                </Space>

                <Button type="primary" size="small" block className="layout-mt-lg">
                  提交标注
                </Button>
              </>
            ) : (
              <Text type="secondary" style={{ fontSize: 13 }}>
                请从左侧选择案件进行标注
              </Text>
            )}
          </div>
        </div>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
