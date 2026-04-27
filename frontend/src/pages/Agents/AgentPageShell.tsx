import { Alert, Col, Row, Space, Tag, Timeline, Typography } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

export interface AgentPageSpec {
  title: string;
  subtitle: string;
  scenario: string;
  inputData: string[];
  reasoningSteps: string[];
  outputs: string[];
  boundaries: string[];
  metrics: { label: string; value: string; note: string; color?: string }[];
  sample: {
    title: string;
    content: string;
  };
}

function BulletList({ items }: { items: string[] }) {
  return (
    <Space direction="vertical" size={8} className="w-full">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="layout-flex layout-gap-sm">
          <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <Text className="text-[13px]">{item}</Text>
        </div>
      ))}
    </Space>
  );
}

export default function AgentPageShell({ spec }: { spec: AgentPageSpec }) {
  return (
    <ModulePageShell
      title={spec.title}
      subtitle={spec.subtitle}
      breadcrumb={["智能体协同", spec.title]}
    >
      <Alert
        type="info"
        showIcon
        className="rounded-lg"
        message="Agent 定位"
        description={spec.scenario}
      />

      <Row gutter={[12, 12]}>
        {spec.metrics.map((metric) => (
          <Col xs={24} md={12} xl={6} key={metric.label}>
            <div className="card-surface layout-p-md h-full">
              <Text type="secondary" className="text-[12px] block">
                {metric.label}
              </Text>
              <Text strong className="text-[22px] block layout-mt-xs" style={{ color: metric.color }}>
                {metric.value}
              </Text>
              <Text type="secondary" className="text-[12px]">
                {metric.note}
              </Text>
            </div>
          </Col>
        ))}
      </Row>

      <Row gutter={[12, 12]} align="stretch">
        <Col xs={24} lg={8}>
          <ModuleSectionCard title="输入数据">
            <BulletList items={spec.inputData} />
          </ModuleSectionCard>
        </Col>
        <Col xs={24} lg={8}>
          <ModuleSectionCard title="推理过程">
            <Timeline
              items={spec.reasoningSteps.map((step) => ({
                color: "blue",
                children: <Text className="text-[13px]">{step}</Text>,
              }))}
            />
          </ModuleSectionCard>
        </Col>
        <Col xs={24} lg={8}>
          <ModuleSectionCard title="输出与边界">
            <Space direction="vertical" size={12} className="w-full">
              <div>
                <Tag color="green" className="layout-mb-sm">
                  可输出
                </Tag>
                <BulletList items={spec.outputs} />
              </div>
              <div>
                <Tag color="gold" className="layout-mb-sm">
                  人工确认边界
                </Tag>
                <BulletList items={spec.boundaries} />
              </div>
            </Space>
          </ModuleSectionCard>
        </Col>
      </Row>

      <ModuleSectionCard title={spec.sample.title} subtitle="面试版示例输出">
        <div className="workbench-inset-panel">
          <Space align="start">
            <SafetyCertificateOutlined className="text-primary mt-1" />
            <Text className="text-[13px] leading-relaxed">{spec.sample.content}</Text>
          </Space>
        </div>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
