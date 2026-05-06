import { Row, Col, Typography, Table, Tag, Button } from "antd";
import { RiseOutlined, FallOutlined, MinusOutlined, RightOutlined, ExperimentOutlined, LineChartOutlined, DatabaseOutlined, PartitionOutlined, HistoryOutlined } from "@ant-design/icons";
import { RiskStrip, type RiskStripVariant } from "./uiPrimitives";
import { useNavigate } from "react-router-dom";
import { mockModelVersions } from "@/mock/data";

const { Text, Title } = Typography;

/* ── 复用自 PostLoanCoreKpis 的轻量子组件 ── */

interface MiniSparklineProps {
  data: number[];
  color: string;
  height?: number;
}

function MiniSparkline({ data, color, height = 28 }: MiniSparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function Trend({ text, semantic }: { text: string; semantic: "good" | "bad" | "neutral" }) {
  const Icon = semantic === "good" ? RiseOutlined : semantic === "bad" ? FallOutlined : MinusOutlined;
  const bg = semantic === "good" ? "var(--color-success-bg)" : semantic === "bad" ? "var(--color-error-bg)" : "var(--color-bg-interactive-hover)";
  const fg = semantic === "good" ? "var(--color-success)" : semantic === "bad" ? "var(--color-danger)" : "var(--color-text-tertiary)";
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[12px] font-medium" style={{ background: bg, color: fg }}>
      <Icon className="text-[11px]" /><span>{text}</span>
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  valueColor: string;
  trend?: { text: string; semantic: "good" | "bad" | "neutral" };
  sparkline?: { data: number[]; color: string };
  footer: string;
  stripVariant: RiskStripVariant;
  onClick?: () => void;
}

function KpiCard({ label, value, valueColor, trend, sparkline, footer, stripVariant, onClick }: KpiCardProps) {
  return (
    <div role="button" tabIndex={0} className="pl-solid-card pl-solid-card--interactive flex h-full min-h-[190px] overflow-hidden group" onClick={onClick} onKeyDown={(e) => e.key === "Enter" && onClick?.()}>
      <RiskStrip variant={stripVariant} />
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex items-center justify-between mb-3">
          <Text className="pl-kpi-label">{label}</Text>
          <RightOutlined className="text-[11px] text-[var(--color-text-quaternary)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex items-end gap-3 mb-3">
          <Title level={2} className="!m-0 pl-kpi-value" style={{ color: valueColor }}>{value}</Title>
          {sparkline && <div className="pb-1"><MiniSparkline data={sparkline.data} color={sparkline.color} height={32} /></div>}
        </div>
        {trend && <div className="mb-3"><Trend text={trend.text} semantic={trend.semantic} /></div>}
        <Text className="pl-aux-text mt-auto block pt-3 border-t border-black/[0.04] text-[11px]">{footer}</Text>
      </div>
    </div>
  );
}

/* ── 风控建模师首页 ── */

const RECENT_EXPERIMENTS = [
  { id: "EXP-PL-2408", model: "贷后经营异常预警模型", sample: "经营贷 · 制造业 · 近18个月", auc: 0.842, ks: 0.413, status: "候选模型", targetFP: "FP-01/FP-03/FP-05" },
  { id: "EXP-PL-2411", model: "税报断档风险模型", sample: "税易贷 · 全行业 · 近12个月", auc: 0.811, ks: 0.386, status: "训练中", targetFP: "FP-03" },
  { id: "EXP-PL-2414", model: "多头共债跳升模型", sample: "消费贷 · 批发零售 · 近24个月", auc: 0.798, ks: 0.361, status: "待复核", targetFP: "FP-02" },
];

const CHAMPION_VERSIONS = mockModelVersions.filter((v) => v.role === "Champion" && v.stage === "生效中");

export default function ModelerWorkbench() {
  const navigate = useNavigate();

  const kpiData: KpiCardProps[] = [
    {
      label: "在跑实验",
      value: String(RECENT_EXPERIMENTS.length),
      valueColor: "var(--color-primary-deep)",
      trend: { text: "3 组实验中", semantic: "good" },
      sparkline: { data: [1, 2, 2, 3, 3], color: "var(--color-primary-deep)" },
      footer: "模型工厂 · 点击查看全部实验",
      stripVariant: "neutral",
      onClick: () => navigate("/strategy/model-factory"),
    },
    {
      label: "特征 PSI 漂移",
      value: "2 项",
      valueColor: "var(--color-warning-light)",
      trend: { text: "超 0.25 阈值", semantic: "bad" },
      sparkline: { data: [0.12, 0.18, 0.22, 0.28, 0.31], color: "var(--color-warning-light)" },
      footer: "特征工作室 · 点击分析漂移",
      stripVariant: "warning",
      onClick: () => navigate("/feature/studio"),
    },
    {
      label: "Champion 模型",
      value: String(CHAMPION_VERSIONS.length),
      valueColor: "var(--color-success-light)",
      trend: { text: "全部生效中", semantic: "good" },
      sparkline: { data: [2, 2, 3, 3, CHAMPION_VERSIONS.length], color: "var(--color-success-light)" },
      footer: "模型版本库 · 点击管理版本",
      stripVariant: "success",
      onClick: () => navigate("/strategy/model-registry"),
    },
    {
      label: "特征覆盖率",
      value: "18 类",
      valueColor: "var(--color-success-light)",
      trend: { text: "司法/经营/财务全覆盖", semantic: "good" },
      footer: "数据源管理 · 查看变量定义",
      stripVariant: "success",
      onClick: () => navigate("/data/dictionary"),
    },
  ];

  return (
    <>
      {/* KPI 卡片 */}
      <section className="section-shell pl-fade-in-up">
        <div className="section-header">
          <Text className="section-title">模型工作概览</Text>
          <Text type="secondary" className="section-subtitle ml-2">在跑实验、特征漂移监控与模型版本状态</Text>
        </div>
        <div className="section-body">
          <Row gutter={[12, 12]}>
            {kpiData.map((kpi, i) => (
              <Col xs={24} sm={12} lg={6} key={i}>
                <div style={{ animationDelay: `${i * 0.05}s` }} className="pl-fade-in-up">
                  <KpiCard {...kpi} />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* 近期实验 */}
      <section className="section-shell pl-fade-in-up" style={{ animationDelay: "0.05s" }}>
        <div className="section-header">
          <Text className="section-title">近期模型实验</Text>
          <Text type="secondary" className="section-subtitle ml-2">来自模型工厂，点击进入实验详情</Text>
        </div>
        <div className="section-body">
          <Table
            size="small"
            rowKey="id"
            dataSource={RECENT_EXPERIMENTS}
            pagination={false}
            onRow={() => ({ onClick: () => navigate("/strategy/model-factory"), style: { cursor: "pointer" } })}
            columns={[
              { title: "实验 ID", dataIndex: "id", width: 130 },
              { title: "模型名称", dataIndex: "model" },
              { title: "样本范围", dataIndex: "sample", width: 220 },
              { title: "目标模式", dataIndex: "targetFP", width: 180 },
              { title: "AUC", dataIndex: "auc", width: 80 },
              { title: "KS", dataIndex: "ks", width: 80 },
              {
                title: "状态", dataIndex: "status", width: 100,
                render: (s: string) => <Tag color={s === "候选模型" ? "blue" : s === "训练中" ? "processing" : "warning"}>{s}</Tag>,
              },
            ]}
          />
        </div>
      </section>

      {/* Champion 模型版本 */}
      <section className="section-shell pl-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <div className="section-header">
          <Text className="section-title">Champion 模型版本</Text>
          <Text type="secondary" className="section-subtitle ml-2">当前生效中的主力模型，来源模型版本库</Text>
        </div>
        <div className="section-body">
          <Table
            size="small"
            rowKey={(r) => `${r.id}-${r.version}`}
            dataSource={CHAMPION_VERSIONS}
            pagination={false}
            onRow={() => ({ onClick: () => navigate("/strategy/model-registry"), style: { cursor: "pointer" } })}
            columns={[
              { title: "模型名称", dataIndex: "name", width: 180 },
              { title: "版本", dataIndex: "version", width: 90 },
              { title: "AUC", dataIndex: "auc", width: 80 },
              { title: "KS", dataIndex: "ks", width: 80 },
              { title: "PSI", dataIndex: "psi", width: 80 },
              { title: "召回率", dataIndex: "recall", width: 80 },
              { title: "更新时间", dataIndex: "updatedAt", width: 120 },
              { title: "变更说明", dataIndex: "changelog", ellipsis: true },
            ]}
          />
        </div>
      </section>

      {/* 快捷操作 */}
      <section className="section-shell pl-fade-in-up" style={{ animationDelay: "0.15s" }}>
        <div className="section-header">
          <Text className="section-title">建模工作台</Text>
          <Text type="secondary" className="section-subtitle ml-2">风控建模高频入口</Text>
        </div>
        <div className="section-body">
          <div className="flex flex-wrap gap-3">
            {[
              { k: "exp", label: "新建实验", icon: <ExperimentOutlined />, path: "/strategy/model-factory" },
              { k: "feature", label: "特征分析", icon: <LineChartOutlined />, path: "/feature/studio" },
              { k: "dict", label: "数据字典", icon: <DatabaseOutlined />, path: "/data/dictionary" },
              { k: "flow", label: "决策流编排", icon: <PartitionOutlined />, path: "/strategy/decision-flow" },
              { k: "backtest", label: "仿真回溯", icon: <HistoryOutlined />, path: "/strategy/backtest" },
            ].map((a) => (
              <Button key={a.k} type="default" size="large" onClick={() => navigate(a.path)}
                className="pl-solid-card pl-solid-card--interactive !h-auto !py-4 min-w-[140px] flex-1 basis-[calc(50%-6px)] sm:basis-[calc(33.333%-8px)] lg:basis-0 lg:flex-1 lg:max-w-none !bg-[var(--color-bg-container)] !border-[var(--color-border-light)] flex flex-col items-center gap-2 text-text-primary">
                <span className="text-xl text-primary">{a.icon}</span>
                <span className="text-sm font-semibold text-center leading-snug whitespace-normal">{a.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
