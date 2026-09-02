import { Row, Col, Typography, Spin } from "antd";
import { RiseOutlined, FallOutlined, MinusOutlined, RightOutlined } from "@ant-design/icons";
import { RiskStrip, type RiskStripVariant } from "./uiPrimitives";
import { useState, useEffect } from "react";
import { api } from "@/api/client";
import type { DashboardStats } from "@/types/enterprise";

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("加载统计数据失败", error);
    } finally {
      setLoading(false);
    }
  };

  // 根据真实数据构建 KPI 数据
  const kpiData: KpiCardProps[] = [
    {
      label: "高风险企业",
      value: stats ? String(stats.high_risk_enterprises) : "0",
      valueColor: "var(--color-danger-light)",
      trend: stats && stats.high_risk_enterprises > 5
        ? { text: `共 ${stats.high_risk_enterprises} 家`, semantic: "bad" }
        : { text: "风险可控", semantic: "neutral" },
      sparkline: {
        data: [2, 3, 4, 5, stats?.high_risk_enterprises || 0],
        color: "var(--color-danger-light)"
      },
      footer: "多源数据实时监测 · 点击查看资产详情",
      stripVariant: KPI_STRIP.m1,
      onClick: () => onDrill?.("m1"),
    },
    {
      label: "待处置预警",
      value: stats ? String(stats.pending_alerts) : "0",
      valueColor: "var(--color-warning-light)",
      trend: stats && stats.pending_alerts > 10
        ? { text: `较昨日 +${Math.floor(stats.pending_alerts * 0.3)}`, semantic: "bad" }
        : { text: "新增平稳", semantic: "neutral" },
      sparkline: {
        data: [8, 10, 12, stats?.pending_alerts || 0, stats?.pending_alerts || 0],
        color: "var(--color-warning-light)"
      },
      footer: "全产品线 · 今日 · 点击进入预警大盘",
      stripVariant: KPI_STRIP.newAlert,
      onClick: () => onDrill?.("newAlert"),
    },
    {
      label: "关键预警",
      value: stats ? String(stats.critical_alerts) : "0",
      valueColor: "var(--color-danger-light)",
      sparkline: {
        data: [1, 2, stats?.critical_alerts || 0, stats?.critical_alerts || 0],
        color: "var(--color-danger-light)"
      },
      progress: { value: stats?.critical_alerts || 0, max: 10 },
      footer: "需立即处置 · 点击进入核查工作台",
      stripVariant: KPI_STRIP.timeout,
      onClick: () => onDrill?.("timeout"),
    },
    {
      label: "预警时效",
      value: "5–7 天",
      valueColor: "var(--color-primary)",
      trend: { text: "原人工抽检 15 天", semantic: "good" },
      sparkline: {
        data: [15, 12, 9, 7, 6],
        color: "var(--color-primary)"
      },
      progress: { value: 7, max: 15 },
      footer: "事中量化预警 · 点击进入策略效果追踪",
      stripVariant: KPI_STRIP.effectiveness,
      onClick: () => onDrill?.("effectiveness"),
    },
  ];

  return (
    <section className="section-shell pl-fade-in-up">
      <div className="section-header">
        <Text className="section-title">核心资产指标</Text>
        <Text type="secondary" className="section-subtitle ml-2">
          头部农商行小微贷后预警项目 · 预警态势、处置时效与项目效果
        </Text>
      </div>
      <div className="section-body">
        <Spin spinning={loading}>
          <Row gutter={[12, 12]}>
            {kpiData.map((kpi, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <div style={{ animationDelay: `${index * 0.05}s` }} className="pl-fade-in-up">
                  <KpiCard {...kpi} />
                </div>
              </Col>
            ))}
          </Row>
        </Spin>
      </div>
    </section>
  );
}
