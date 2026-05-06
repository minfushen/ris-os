import { Row, Col, Typography, Table, Tag, Button } from "antd";
import { RiseOutlined, FallOutlined, MinusOutlined, RightOutlined, ThunderboltOutlined, FileTextOutlined, ControlOutlined, HistoryOutlined, SafetyCertificateOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { RiskStrip, type RiskStripVariant } from "./uiPrimitives";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

/* ── 轻量子组件（与 PostLoanCoreKpis / ModelerWorkbench 一致）── */

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

/* ── 策略审批员首页 ── */

interface PendingApproval {
  id: string;
  type: "版本变更" | "新策略上线" | "阈值调优";
  name: string;
  versionFrom: string;
  versionTo: string;
  fpCoverage: string;
  submitter: string;
  submitTime: string;
}

const PENDING_APPROVALS: PendingApproval[] = [
  {
    id: "CHG-20260429-452",
    type: "版本变更",
    name: "经营贷预警包",
    versionFrom: "V2.4.0",
    versionTo: "V2.5.0",
    fpCoverage: "FP-01 / FP-03",
    submitter: "张三 · 风控建模师",
    submitTime: "2026-04-29 09:30",
  },
  {
    id: "CHG-20260428-387",
    type: "阈值调优",
    name: "多头共债预警规则",
    versionFrom: "V1.4.0",
    versionTo: "V1.5.0",
    fpCoverage: "FP-02",
    submitter: "张三 · 风控建模师",
    submitTime: "2026-04-28 16:15",
  },
];

const RECENT_CHANGES = [
  { version: "V2.5.0", name: "经营贷预警包", date: "2026-04-29", change: "制造业多头阈值 35%→38%（RC-02）；税报断档天数 45→30（RC-01）", approver: "王五", status: "已生效" },
  { version: "V2.4.0", name: "经营贷预警包", date: "2026-04-15", change: "新增司法被执行信号权重 0.15→0.22（RC-05）", approver: "王五", status: "已生效" },
  { version: "V1.5.0", name: "多头共债预警规则", date: "2026-04-25", change: "消费贷多头阈值 30%→35%，匹配 RC-02 调优结论", approver: "王五", status: "已生效" },
  { version: "V1.7.4", name: "税报断档风险模型", date: "2026-04-20", change: "断档天数阈值 45→30 天，触发量 +18%", approver: "王五", status: "已生效" },
];

export default function ApproverWorkbench() {
  const navigate = useNavigate();

  const kpiData: KpiCardProps[] = [
    {
      label: "待审批变更",
      value: String(PENDING_APPROVALS.length),
      valueColor: "var(--color-warning-light)",
      trend: { text: "需今日处理", semantic: "bad" },
      footer: "发布审批 · 点击进入审批流程",
      stripVariant: "warning",
      onClick: () => navigate("/strategy/publish"),
    },
    {
      label: "策略命中率",
      value: "87.3%",
      valueColor: "var(--color-success-light)",
      trend: { text: "环比 +2.1ppt", semantic: "good" },
      sparkline: { data: [82, 84, 85, 86, 87.3], color: "var(--color-success-light)" },
      footer: "策略产品 · 查看命中详情",
      stripVariant: "success",
      onClick: () => navigate("/strategy/products"),
    },
    {
      label: "在线规则数",
      value: "7 条",
      valueColor: "var(--color-primary-deep)",
      trend: { text: "覆盖 5 类欺诈模式", semantic: "good" },
      sparkline: { data: [4, 5, 6, 7, 7], color: "var(--color-primary-deep)" },
      footer: "规则库 · 查看规则详情",
      stripVariant: "neutral",
      onClick: () => navigate("/strategy/rules"),
    },
    {
      label: "近期回溯",
      value: "3 次",
      valueColor: "var(--color-success-light)",
      trend: { text: "全部完成评估", semantic: "good" },
      sparkline: { data: [1, 1, 2, 3, 3], color: "var(--color-success-light)" },
      footer: "仿真回溯 · 查看回溯报告",
      stripVariant: "success",
      onClick: () => navigate("/strategy/backtest"),
    },
  ];

  return (
    <>
      {/* KPI 卡片 */}
      <section className="section-shell pl-fade-in-up">
        <div className="section-header">
          <Text className="section-title">策略审批概览</Text>
          <Text type="secondary" className="section-subtitle ml-2">待审批变更、策略命中率与规则在线状态</Text>
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

      {/* 待审批发布单 */}
      <section className="section-shell pl-fade-in-up" style={{ animationDelay: "0.05s" }}>
        <div className="section-header">
          <Text className="section-title">待审批发布单</Text>
          <Text type="secondary" className="section-subtitle ml-2">来自策略发布流程，点击进入审批</Text>
        </div>
        <div className="section-body">
          {PENDING_APPROVALS.length > 0 ? (
            <div className="flex flex-col gap-3">
              {PENDING_APPROVALS.map((item) => (
                <div key={item.id} role="button" tabIndex={0}
                  className="pl-solid-card pl-solid-card--interactive flex overflow-hidden group"
                  onClick={() => navigate("/strategy/publish")}
                  onKeyDown={(e) => e.key === "Enter" && navigate("/strategy/publish")}
                >
                  <RiskStrip variant="warning" />
                  <div className="flex min-w-0 flex-1 items-center justify-between px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag color="orange">{item.type}</Tag>
                        <Text strong className="text-[15px]">{item.name}</Text>
                        <Text className="text-[13px] text-text-muted">{item.versionFrom} → {item.versionTo}</Text>
                      </div>
                      <Text className="text-[12px] text-text-muted">
                        覆盖 {item.fpCoverage} · 提交人：{item.submitter} · {item.submitTime}
                      </Text>
                    </div>
                    <div className="shrink-0 ml-4 flex items-center gap-2">
                      <Button size="small" onClick={(e) => { e.stopPropagation(); navigate(`/strategy/publish?tab=diff`); }}>查看 Diff</Button>
                      <Button type="primary" size="small" onClick={(e) => { e.stopPropagation(); navigate("/strategy/publish"); }}>进入审批</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pl-solid-card p-6 text-center text-[13px] text-gray-500">暂无需审批的变更</div>
          )}
        </div>
      </section>

      {/* 近期策略变更记录 */}
      <section className="section-shell pl-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <div className="section-header">
          <Text className="section-title">近期策略变更</Text>
          <Text type="secondary" className="section-subtitle ml-2">已审批生效的历史版本</Text>
        </div>
        <div className="section-body">
          <Table
            size="small"
            rowKey={(r) => `${r.name}-${r.version}`}
            dataSource={RECENT_CHANGES}
            pagination={false}
            columns={[
              { title: "策略名称", dataIndex: "name", width: 160 },
              { title: "版本", dataIndex: "version", width: 90 },
              { title: "生效日期", dataIndex: "date", width: 110 },
              { title: "变更说明", dataIndex: "change", ellipsis: true },
              { title: "审批人", dataIndex: "approver", width: 80 },
              {
                title: "状态", dataIndex: "status", width: 80,
                render: () => <Tag color="green" icon={<CheckCircleOutlined />}>已生效</Tag>,
              },
            ]}
          />
        </div>
      </section>

      {/* 快捷操作 */}
      <section className="section-shell pl-fade-in-up" style={{ animationDelay: "0.15s" }}>
        <div className="section-header">
          <Text className="section-title">审批工作台</Text>
          <Text type="secondary" className="section-subtitle ml-2">策略审批高频入口</Text>
        </div>
        <div className="section-body">
          <div className="flex flex-wrap gap-3">
            {[
              { k: "diff", label: "查看 Diff", icon: <FileTextOutlined />, path: "/strategy/publish" },
              { k: "approve", label: "审批变更", icon: <SafetyCertificateOutlined />, path: "/strategy/publish" },
              { k: "backtest", label: "回溯验证", icon: <HistoryOutlined />, path: "/strategy/backtest" },
              { k: "products", label: "策略产品", icon: <ControlOutlined />, path: "/strategy/products" },
              { k: "rules", label: "规则库", icon: <ThunderboltOutlined />, path: "/strategy/rules" },
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
