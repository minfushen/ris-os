import { Row, Col, Typography } from "antd";
import { RiseOutlined, FallOutlined, MinusOutlined, RightOutlined } from "@ant-design/icons";
import { RiskStrip, type RiskStripVariant } from "./uiPrimitives";

const { Text, Title } = Typography;

export type PostLoanKpiKey = "m1" | "newAlert" | "timeout" | "effectiveness";

interface PostLoanCoreKpisProps {
  onDrill?: (key: PostLoanKpiKey) => void;
}

const KPI_STRIP: Record<PostLoanKpiKey, RiskStripVariant> = {
  m1: "danger",
  newAlert: "warning",
  timeout: "warning",
  effectiveness: "success",
};

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
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
  showLabel?: boolean;
}

function ProgressBar({ value, max, color, showLabel = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <>
            <Text className="text-[11px] font-normal text-[var(--color-text-quaternary)]">进度</Text>
            <Text className="text-[11px] font-medium" style={{ color }}>
              {value}/{max}
            </Text>
          </>
        )}
      </div>
      <div className="h-1.5 bg-[rgba(31,42,48,0.06)] overflow-hidden" style={{ borderRadius: "var(--radius-progress, 2px)" }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            borderRadius: "var(--radius-progress, 2px)",
            width: `${percentage}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

function Trend({ text, semantic }: { text: string; semantic: "good" | "bad" | "neutral" }) {
  const Icon = semantic === "good" ? RiseOutlined : semantic === "bad" ? FallOutlined : MinusOutlined;
  const bgColor =
    semantic === "good" ? "var(--color-success-bg)" : semantic === "bad" ? "var(--color-error-bg)" : "var(--color-bg-interactive-hover)";
  const color = semantic === "good" ? "var(--color-success)" : semantic === "bad" ? "var(--color-danger)" : "var(--color-text-tertiary)";

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[12px] font-medium"
      style={{ background: bgColor, color }}
    >
      <Icon className="text-[11px]" />
      <span>{text}</span>
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  valueColor: string;
  trend?: { text: string; semantic: "good" | "bad" | "neutral" };
  sparkline?: { data: number[]; color: string };
  progress?: { value: number; max: number };
  footer: string;
  stripVariant: RiskStripVariant;
  onClick?: () => void;
}

function KpiCard({ label, value, valueColor, trend, sparkline, progress, footer, stripVariant, onClick }: KpiCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="pl-solid-card pl-solid-card--interactive flex h-full min-h-[190px] overflow-hidden group"
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <RiskStrip variant={stripVariant} />
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex items-center justify-between mb-3">
          <Text className="pl-kpi-label">{label}</Text>
          <RightOutlined className="text-[11px] text-[var(--color-text-quaternary)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="flex items-end gap-3 mb-3">
          <Title level={2} className="!m-0 pl-kpi-value" style={{ color: valueColor }}>
            {value}
          </Title>
          {sparkline && (
            <div className="pb-1">
              <MiniSparkline data={sparkline.data} color={sparkline.color} height={32} />
            </div>
          )}
        </div>
        
        {trend && (
          <div className="mb-3">
            <Trend text={trend.text} semantic={trend.semantic} />
          </div>
        )}
        
        {progress && (
          <div className="mb-3">
            <ProgressBar value={progress.value} max={progress.max} color={valueColor} />
          </div>
        )}
        
        <Text className="pl-aux-text mt-auto block pt-3 border-t border-black/[0.04] text-[11px]">
          {footer}
        </Text>
      </div>
    </div>
  );
}

export default function PostLoanCoreKpis({ onDrill }: PostLoanCoreKpisProps) {
  const kpiData: KpiCardProps[] = [
    {
      label: "M1+ 逾期率",
      value: "3.42%",
      valueColor: "var(--color-danger-light)",
      trend: { text: "较上月 +0.18%", semantic: "bad" },
      sparkline: { data: [2.8, 2.9, 3.1, 3.2, 3.3, 3.35, 3.42], color: "var(--color-danger-light)" },
      footer: "经营贷 · 本月 · 点击下钻",
      stripVariant: KPI_STRIP.m1,
      onClick: () => onDrill?.("m1"),
    },
    {
      label: "新增预警客户",
      value: "23",
      valueColor: "var(--color-warning-light)",
      trend: { text: "较昨日 +8", semantic: "bad" },
      sparkline: { data: [12, 15, 18, 14, 16, 20, 23], color: "var(--color-warning-light)" },
      footer: "全产品线 · 今日 · 点击处置",
      stripVariant: KPI_STRIP.newAlert,
      onClick: () => onDrill?.("newAlert"),
    },
    {
      label: "超时未处置工单",
      value: "8",
      valueColor: "var(--color-warning-light)",
      sparkline: { data: [5, 6, 4, 7, 8, 6, 8], color: "var(--color-warning-light)" },
      progress: { value: 8, max: 15 },
      footer: "我的队列 · 最长超时 38h · 点击认领",
      stripVariant: KPI_STRIP.timeout,
      onClick: () => onDrill?.("timeout"),
    },
    {
      label: "本月预警有效率",
      value: "68%",
      valueColor: "var(--color-success-light)",
      trend: { text: "较上月 +5%", semantic: "good" },
      sparkline: { data: [58, 60, 62, 64, 65, 67, 68], color: "var(--color-success-light)" },
      progress: { value: 68, max: 100 },
      footer: "司法涉诉规则最高 83%",
      stripVariant: KPI_STRIP.effectiveness,
      onClick: () => onDrill?.("effectiveness"),
    },
  ];

  return (
    <section className="section-shell pl-fade-in-up">
      <div className="section-header">
        <Text className="section-title">核心资产指标</Text>
        <Text type="secondary" className="section-subtitle ml-2">
          聚焦贷后：资产质量恶化、新增预警与处置时效（演示数据）
        </Text>
      </div>
      <div className="section-body">
        <Row gutter={[12, 12]}>
          {kpiData.map((kpi, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <div style={{ animationDelay: `${index * 0.05}s` }} className="pl-fade-in-up">
                <KpiCard {...kpi} />
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}
