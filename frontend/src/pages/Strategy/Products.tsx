import { Typography, Tag, Button, Space, Modal, Form, Input, Select, Row, Col, Card } from "antd";
import { PlusOutlined, EditOutlined, HistoryOutlined, WarningOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

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
    title: "经营贷",
    subtitle: "经营异常 · 资金流 · 司法",
    accent: "#4f6970",
    strategies: [
      { id: "PL-B-01", name: "经营预警包 A", triggers: 1280, effectivenessPct: 71, falsePositivePct: 22, health: "active", version: "2.4.0", updateTime: "2026-04-17" },
      { id: "PL-B-02", name: "司法与被执行联动", triggers: 420, effectivenessPct: 83, falsePositivePct: 11, health: "active", version: "1.2.1", updateTime: "2026-04-15" },
    ],
  },
  {
    key: "tax",
    title: "税易贷 / 税金贷",
    subtitle: "税报连续性 · 税负偏离",
    accent: "#5f9b7a",
    strategies: [
      { id: "PL-T-01", name: "税报断档预警", triggers: 890, effectivenessPct: 58, falsePositivePct: 34, health: "optimize", version: "1.8.0", updateTime: "2026-04-16" },
      { id: "PL-T-02", name: "税负率行业分层", triggers: 560, effectivenessPct: 65, falsePositivePct: 19, health: "active", version: "1.1.2", updateTime: "2026-04-12" },
    ],
  },
  {
    key: "mortgage",
    title: "抵押类",
    subtitle: "押品状态 · 还款能力",
    accent: "#6f8f95",
    strategies: [
      { id: "PL-M-01", name: "抵押物价值波动", triggers: 210, effectivenessPct: 76, falsePositivePct: 14, health: "active", version: "1.0.4", updateTime: "2026-04-10" },
    ],
  },
  {
    key: "consumer",
    title: "消费贷",
    subtitle: "多头 · 设备簇 · 行为异常",
    accent: "#c77b78",
    strategies: [
      { id: "PL-C-01", name: "多头共债跳升", triggers: 2410, effectivenessPct: 62, falsePositivePct: 28, health: "optimize", version: "3.0.1", updateTime: "2026-04-17" },
    ],
  },
];

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
    <Card
      size="small"
      className="rounded-lg border border-black/[0.08] shadow-sm"
      styles={{ body: { padding: 12 } }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <Text strong className="text-[13px] block truncate">{s.name}</Text>
          <Text code className="text-[11px] text-text-muted">{s.id}</Text>
        </div>
        {needOpt ? (
          <Tag icon={<WarningOutlined />} color="warning" className="!m-0 shrink-0 text-[11px]">
            误报偏高/需优化
          </Tag>
        ) : (
          <Tag color="success" className="!m-0 shrink-0 text-[11px]">生效中</Tag>
        )}
      </div>
      <Row gutter={[8, 8]} className="mb-2">
        <Col span={8}>
          <Text type="secondary" className="text-[11px] block">触发量</Text>
          <Text strong className="text-[15px] tabular-nums">{s.triggers.toLocaleString()}</Text>
        </Col>
        <Col span={8}>
          <Text type="secondary" className="text-[11px] block">有效率</Text>
          <Text strong className="text-[15px] tabular-nums" style={{ color: accent }}>{s.effectivenessPct}%</Text>
        </Col>
        <Col span={8}>
          <Text type="secondary" className="text-[11px] block">误报率</Text>
          <Text strong className="text-[15px] tabular-nums text-[#d46b08]">{s.falsePositivePct}%</Text>
        </Col>
      </Row>
      <div className="flex justify-between items-center text-[11px] text-text-muted">
        <span>v{s.version}</span>
        <span>{s.updateTime}</span>
      </div>
      <Space className="mt-2">
        <Button type="link" size="small" className="!px-0" icon={<EditOutlined />} onClick={onEdit}>编辑</Button>
        <Button type="link" size="small" className="!px-0" icon={<HistoryOutlined />}>历史</Button>
      </Space>
    </Card>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ModulePageShell
      title="产品线策略集"
      subtitle="按产品线聚合贷后预警策略包；一眼识别触发量、有效率与误报率，快速发现「掉队」策略（演示数据）"
      breadcrumb={["预警策略", "产品线策略集"]}
      actions={
        <Space>
          <Button size="small" onClick={() => navigate("/strategy/rules")}>规则引擎</Button>
          <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => setModalOpen(true)}>
            新建策略集
          </Button>
        </Space>
      }
    >
      <ModuleSectionCard>
        <Row gutter={[16, 24]}>
          {PRODUCT_GROUPS.map((g) => (
            <Col xs={24} lg={12} key={g.key}>
              <div
                className="rounded-lg border border-black/[0.08] p-4 h-full"
                style={{ borderLeftWidth: 4, borderLeftColor: g.accent }}
              >
                <div className="mb-3">
                  <Text strong className="text-[15px] block" style={{ color: g.accent }}>{g.title}</Text>
                  <Text type="secondary" className="text-[12px]">{g.subtitle}</Text>
                </div>
                <Space direction="vertical" className="w-full" size={12}>
                  {g.strategies.map((s) => (
                    <StrategyMiniCard
                      key={s.id}
                      s={s}
                      accent={g.accent}
                      onEdit={() => navigate("/strategy/rules")}
                    />
                  ))}
                </Space>
              </div>
            </Col>
          ))}
        </Row>
      </ModuleSectionCard>

      <Modal title="新建策略集" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => setModalOpen(false)}>
        <Form layout="vertical" size="small">
          <Form.Item label="策略名称" required>
            <Input placeholder="输入策略集名称" />
          </Form.Item>
          <Form.Item label="产品线" required>
            <Select
              options={[
                { value: "biz", label: "经营贷" },
                { value: "tax", label: "税易贷 / 税金贷" },
                { value: "mortgage", label: "抵押类" },
                { value: "consumer", label: "消费贷" },
              ]}
            />
          </Form.Item>
          <Form.Item label="描述">
            <Input.TextArea rows={3} placeholder="预警范围、依赖数据源…" />
          </Form.Item>
        </Form>
      </Modal>
    </ModulePageShell>
  );
}
