import { Tag, Button, Space, Modal, Form, Input, Select, Row, Col } from "antd";
import { PlusOutlined, EditOutlined, HistoryOutlined, WarningOutlined, SearchOutlined } from "@ant-design/icons";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import DemoFlowNav from "@/components/DemoFlowNav";

type StrategyHealth = "active" | "optimize";

interface StrategyCard {
  id: string;
  name: string;
  triggers: number;
  effectivenessPct: number;
  falsePositivePct: number;
  health: StrategyHealth;
  version: string;
  updateTime: string;
}

interface ProductLineGroup {
  key: string;
  title: string;
  subtitle: string;
  accent: string;
  strategies: StrategyCard[];
}

const PRODUCT_GROUPS: ProductLineGroup[] = [
  {
    key: "biz",
    title: "惠快贷",
    subtitle: "FP-01 资金挪用 · FP-03 税报粉饰 · FP-04 担保链",
    accent: "#1d4ed8",
    strategies: [
      { id: "PL-B-01", name: "经营预警包 A（覆盖 FP-01/FP-03）", triggers: 1280, effectivenessPct: 71, falsePositivePct: 22, health: "active", version: "2.4.0", updateTime: "2026-04-17" },
      { id: "PL-B-02", name: "司法与被执行联动（关联 RC-05）", triggers: 420, effectivenessPct: 83, falsePositivePct: 11, health: "active", version: "1.2.1", updateTime: "2026-04-15" },
    ],
  },
  {
    key: "tax",
    title: "税易贷",
    subtitle: "FP-03 税报粉饰 · RC-01 断档天数调优",
    accent: "#5f9b7a",
    strategies: [
      { id: "PL-T-01", name: "税报断档预警（关联 RC-01）", triggers: 890, effectivenessPct: 58, falsePositivePct: 34, health: "optimize", version: "1.8.0", updateTime: "2026-04-16" },
      { id: "PL-T-02", name: "税负率行业分层", triggers: 560, effectivenessPct: 65, falsePositivePct: 19, health: "active", version: "1.1.2", updateTime: "2026-04-12" },
    ],
  },
  {
    key: "mortgage",
    title: "房快贷",
    subtitle: "押品状态 · 还款能力",
    accent: "#2563eb",
    strategies: [
      { id: "PL-M-01", name: "抵押物价值波动", triggers: 210, effectivenessPct: 76, falsePositivePct: 14, health: "active", version: "1.0.4", updateTime: "2026-04-10" },
    ],
  },
  {
    key: "consumer",
    title: "惠微贷",
    subtitle: "多头 · 设备簇 · 行为异常",
    accent: "#c77b78",
    strategies: [
      { id: "PL-C-01", name: "多头共债跳升（关联 FP-02 / RC-02）", triggers: 2410, effectivenessPct: 62, falsePositivePct: 28, health: "optimize", version: "3.0.1", updateTime: "2026-04-17" },
    ],
  },
];

function parseDimensionLabels(subtitle: string): string[] {
  return subtitle
    .split(/[·•・]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function MetricSpark({ pct, tone }: { pct: number; tone: "success" | "warning" }) {
  const w = Math.min(100, Math.max(0, pct));
  return (
    <div className="strategy-mini-spark" aria-hidden>
      <div
        className={`strategy-mini-spark__fill strategy-mini-spark__fill--${tone}`}
        style={{
          width: `${w}%`,
          minWidth: w > 0 ? 2 : 0,
        }}
      />
    </div>
  );
}

function StrategyMiniCard({
  s,
  accent,
  onEdit,
}: {
  s: StrategyCard;
  accent: string;
  onEdit: () => void;
}) {
  const needOpt = s.health === "optimize";
  return (
    <article className="strategy-mini-card">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="strategy-mini-card__title truncate">{s.name}</div>
          <code className="strategy-mini-card__id">{s.id}</code>
        </div>
        {needOpt ? (
          <Tag icon={<WarningOutlined />} color="warning" className="!m-0 shrink-0 text-[11px]">
            误报偏高/需优化
          </Tag>
        ) : (
          <Tag color="success" className="!m-0 shrink-0 text-[11px]">
            生效中
          </Tag>
        )}
      </div>
      <Row gutter={[8, 8]} className="mb-2">
        <Col span={8}>
          <span className="strategy-mini-card__metric-label block">触发量</span>
          <span className="strategy-mini-card__metric-value block">{s.triggers.toLocaleString()}</span>
        </Col>
        <Col span={8}>
          <span className="strategy-mini-card__metric-label block">有效率</span>
          <span className="strategy-mini-card__metric-value block" style={{ color: accent }}>
            {s.effectivenessPct}%
          </span>
          <MetricSpark pct={s.effectivenessPct} tone="success" />
        </Col>
        <Col span={8}>
          <span className="strategy-mini-card__metric-label block">误报率</span>
          <span className="strategy-mini-card__metric-value block text-accent-warning">{s.falsePositivePct}%</span>
          <MetricSpark pct={s.falsePositivePct} tone="warning" />
        </Col>
      </Row>
      <div className="strategy-mini-card__footer flex justify-between items-center">
        <span>v{s.version}</span>
        <span>{s.updateTime}</span>
      </div>
      <Space className="mt-2">
        <Button type="link" size="small" className="!px-0" icon={<EditOutlined />} onClick={onEdit}>
          编辑
        </Button>
        <Button type="link" size="small" className="!px-0" icon={<HistoryOutlined />}>
          历史
        </Button>
      </Space>
    </article>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [health, setHealth] = useState<"all" | StrategyHealth>("all");

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCT_GROUPS.map((g) => ({
      ...g,
      strategies: g.strategies.filter((s) => {
        if (health !== "all" && s.health !== health) return false;
        if (!q) return true;
        return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      }),
    })).filter((g) => g.strategies.length > 0);
  }, [query, health]);

  return (
    <ModulePageShell
      title="产品线策略集"
      subtitle="按产品线聚合策略包，关注触发与误报（演示）"
      breadcrumb={["策略与模型", "产品线策略集"]}
      actions={
        <>
          <Input
            className="module-header-search"
            allowClear
            prefix={<SearchOutlined className="text-text-weak" />}
            placeholder="搜索策略名称或编号"
            aria-label="搜索策略名称或编号"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Space>
            <Button size="small" onClick={() => navigate("/strategy/rules")}>
              规则引擎
            </Button>
            <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => setModalOpen(true)}>
              新建策略集
            </Button>
          </Space>
        </>
      }
    >
      <ModuleSectionCard>
        <div className="strategy-products-toolbar">
          <span className="strategy-products-toolbar__label">状态</span>
          <Select
            className="strategy-products-toolbar__filter"
            value={health}
            onChange={(v) => setHealth(v)}
            options={[
              { value: "all", label: "全部状态" },
              { value: "active", label: "生效中" },
              { value: "optimize", label: "需优化" },
            ]}
          />
        </div>

        {filteredGroups.length === 0 ? (
          <div className="strategy-products-empty">没有符合筛选条件的策略包，请调整关键词或状态。</div>
        ) : (
          <Row gutter={[16, 24]} align="stretch">
            {filteredGroups.map((g) => (
              <Col xs={24} lg={12} key={g.key} className="h-full">
                <div
                  className="strategy-product-column"
                  style={{ "--strategy-column-accent": g.accent } as CSSProperties}
                >
                  <header className="strategy-product-column__header">
                    <h2 className="strategy-product-column__title" style={{ color: g.accent }}>
                      {g.title}
                    </h2>
                    <div className="strategy-product-dims">
                      {parseDimensionLabels(g.subtitle).map((label, i) => (
                        <span key={`${g.key}-dim-${i}`} className="strategy-product-dim-pill">
                          {label}
                        </span>
                      ))}
                    </div>
                  </header>
                  <div className="strategy-product-column__list">
                    {g.strategies.map((s) => (
                      <StrategyMiniCard
                        key={s.id}
                        s={s}
                        accent={g.accent}
                        onEdit={() => navigate("/strategy/rules")}
                      />
                    ))}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </ModuleSectionCard>

      <Modal title="新建策略集" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => setModalOpen(false)}>
        <Form layout="vertical" size="small">
          <Form.Item label="策略名称" required>
            <Input placeholder="输入策略集名称" />
          </Form.Item>
          <Form.Item label="产品线" required>
            <Select
              options={[
                { value: "biz", label: "惠快贷" },
                { value: "tax", label: "税易贷" },
                { value: "mortgage", label: "房快贷" },
                { value: "consumer", label: "惠微贷" },
              ]}
            />
          </Form.Item>
          <Form.Item label="描述">
            <Input.TextArea rows={3} placeholder="预警范围、依赖数据源…" />
          </Form.Item>
        </Form>
      </Modal>

      <DemoFlowNav />
    </ModulePageShell>
  );
}
