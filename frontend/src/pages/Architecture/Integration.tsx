import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Alert, Col, Row, Space, Tag, Typography } from "antd";
import {
  ApiOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  MessageOutlined,
  PartitionOutlined,
  RetweetOutlined,
} from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text, Paragraph } = Typography;

const ARCHITECTURE_LAYERS = [
  {
    title: "信贷系统",
    subtitle: "客户管理、贷款管理、贷后管理、客户经理工作台",
    icon: <CloudServerOutlined />,
    tone: "blue",
  },
  {
    title: "风控建模平台",
    subtitle: "特征工程、规则引擎、模型引擎、决策服务、监控预警、处置工作台",
    icon: <PartitionOutlined />,
    tone: "purple",
  },
  {
    title: "底座服务",
    subtitle: "数据仓库、决策引擎、消息服务",
    icon: <DatabaseOutlined />,
    tone: "green",
  },
] as const;

const PLATFORM_MODULES = ["特征工程", "规则引擎", "模型引擎", "决策服务", "监控预警", "处置工作台"];

const DATA_FLOW_STEPS = [
  { title: "外部数据源", desc: "征信 / 工商 / 司法 / 税务 / 行为" },
  { title: "数据仓库", desc: "行内业务数据与外部数据统一落仓，沉淀变量库" },
  { title: "特征宽表", desc: "按产品线加工还款、涉诉、征信、工商、税务特征" },
  { title: "离线训练 / 在线决策", desc: "离线产出模型版本，在线执行规则 + 模型联合决策" },
  { title: "预警结果", desc: "生成红灯 / 黄灯预警，进入监控大盘和处置队列" },
  { title: "信贷系统", desc: "预警展示、客户经理认领、处置反馈、规则优化回流" },
];

const TALKING_POINTS = [
  {
    title: "监控驱动迭代",
    tag: "策略优化",
    desc: "监控不只是看数，而是触发规则和模型迭代。比如某条规则命中率持续下降，说明规则可能失效；某个变量 PSI 偏高，则优先排查数据源和样本分布。",
  },
  {
    title: "处置闭环设计",
    tag: "业务闭环",
    desc: "预警不是终点，处置才是。链路设计为预警推送、客户经理认领、处置操作、结果反馈、规则优化，处置结论会反哺样本池和调优案例。",
  },
  {
    title: "多渠道预警触达",
    tag: "触达分层",
    desc: "红灯预警实时触达，黄灯预警批量触达。演示版展示站内信、企业微信、短信三种通道的设计边界，避免信息过载并保证高风险及时处理。",
  },
];

const DEFERRED_CAPABILITIES = [
  "真正短信、企业微信、站内信推送",
  "真实决策引擎 / 模型引擎联调",
  "完整后端持久化流程",
  "权限、审批、审计日志等生产级能力",
];

function ArrowDown() {
  return <div className="text-center text-text-tertiary text-[20px] leading-none py-1">↓</div>;
}

function LayerCard({ layer }: { layer: (typeof ARCHITECTURE_LAYERS)[number] }) {
  return (
    <div className="rounded-lg border border-black/[0.08] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-bg)] text-primary">
          {layer.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Text strong className="text-[15px]">{layer.title}</Text>
            <Tag color={layer.tone} className="!m-0 text-[11px]">HTTP API</Tag>
          </div>
          <Text type="secondary" className="block text-[12px] leading-relaxed mt-1">
            {layer.subtitle}
          </Text>
        </div>
      </div>
    </div>
  );
}

export default function IntegrationArchitecture() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    target?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  return (
    <ModulePageShell
      title="系统集成与闭环说明"
      subtitle="演示讲解页：用一页说明系统集成架构、数据流向、业务闭环和暂缓的生产级能力边界"
      breadcrumb={["演示讲解", "系统集成架构"]}
    >
      <Alert
        type="info"
        showIcon
        className="rounded-lg"
        message="演示讲解建议"
        description="先讲业务闭环，再讲系统集成，最后主动说明 P2 暂缓能力边界，避免把原型包装成生产系统。"
      />

      <div id="architecture">
      <ModuleSectionCard title="系统集成架构图" subtitle="从信贷系统到风控建模平台，再到底座服务的集成关系">
        <div className="mx-auto max-w-4xl">
          {ARCHITECTURE_LAYERS.map((layer, index) => (
            <div key={layer.title}>
              <LayerCard layer={layer} />
              {index < ARCHITECTURE_LAYERS.length - 1 ? <ArrowDown /> : null}
            </div>
          ))}

          <div className="mt-4 rounded-lg border border-black/[0.08] bg-[#fafafa] p-4">
            <Text strong className="block text-[13px] mb-3">风控建模平台内部模块</Text>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PLATFORM_MODULES.map((module) => (
                <div key={module} className="rounded-md border border-black/[0.06] bg-white px-3 py-2 text-center">
                  <Text className="text-[13px]">{module}</Text>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModuleSectionCard>
      </div>

      <div id="data-flow">
      <ModuleSectionCard title="数据流向图" subtitle="把外部数据、行内业务数据、特征、模型、决策和处置串成一条线">
        <div className="grid gap-3 lg:grid-cols-6">
          {DATA_FLOW_STEPS.map((step, index) => (
            <div key={step.title} className="relative rounded-lg border border-black/[0.08] bg-white p-4 shadow-sm">
              <Text type="secondary" className="text-[11px]">Step {index + 1}</Text>
              <Text strong className="block text-[14px] mt-1">{step.title}</Text>
              <Text type="secondary" className="block text-[12px] leading-relaxed mt-2">{step.desc}</Text>
            </div>
          ))}
        </div>
        <Paragraph className="!mb-0 mt-4 text-[12px] text-text-secondary">
          讲解口径：外部数据源经 ETL 入仓，和行内业务数据一起形成变量库；特征宽表同时服务离线训练和在线决策；预警结果回到信贷系统完成展示和处置，处置结论再回流规则和样本。
        </Paragraph>
      </ModuleSectionCard>
      </div>

      <div id="closed-loop">
      <ModuleSectionCard title="演示讲解亮点文案区" subtitle="三段可直接口述的设计亮点">
        <Row gutter={[16, 16]}>
          {TALKING_POINTS.map((point) => (
            <Col xs={24} lg={8} key={point.title}>
              <div className="h-full rounded-lg border border-black/[0.08] bg-white p-4 shadow-sm">
                <Space className="mb-2">
                  <RetweetOutlined className="text-primary" />
                  <Text strong className="text-[15px]">{point.title}</Text>
                  <Tag color="processing" className="!m-0 text-[11px]">{point.tag}</Tag>
                </Space>
                <Paragraph className="!mb-0 text-[13px] leading-relaxed text-text-secondary">
                  {point.desc}
                </Paragraph>
              </div>
            </Col>
          ))}
        </Row>
      </ModuleSectionCard>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ModuleSectionCard title="多渠道预警触达" subtitle="演示版展示设计，不接真实消息服务">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { channel: "站内信", desc: "所有预警留痕展示" },
                { channel: "企业微信", desc: "红灯实时提醒" },
                { channel: "短信", desc: "高危超时兜底" },
              ].map((item) => (
                <div key={item.channel} className="rounded-lg border border-black/[0.08] bg-[#fafafa] p-4">
                  <MessageOutlined className="text-primary" />
                  <Text strong className="block mt-2">{item.channel}</Text>
                  <Text type="secondary" className="block text-[12px] mt-1">{item.desc}</Text>
                </div>
              ))}
            </div>
          </ModuleSectionCard>
        </Col>

        <Col xs={24} lg={12}>
          <div id="p2-boundary">
          <ModuleSectionCard title="P2 暂缓能力边界" subtitle="主动说明哪些能力不在演示原型范围内">
            <Space direction="vertical" className="w-full">
              {DEFERRED_CAPABILITIES.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg border border-black/[0.08] bg-[#fafafa] px-3 py-2">
                  <ApiOutlined className="text-text-tertiary" />
                  <Text className="text-[13px]">{item}</Text>
                </div>
              ))}
            </Space>
          </ModuleSectionCard>
          </div>
        </Col>
      </Row>
    </ModulePageShell>
  );
}
