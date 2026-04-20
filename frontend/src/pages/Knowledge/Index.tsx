import { Typography, Row, Col, Card } from "antd";
import { BookOutlined, FileTextOutlined, SafetyCertificateOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const CARDS = [
  {
    key: "scripts",
    title: "催收话术库",
    desc: "按行业与逾期分档组织话术与合规要点，可在催收作业与核查工作台引用。",
    to: "/knowledge/scripts",
    icon: <BookOutlined className="text-2xl text-[#5f9b7a]" />,
  },
  {
    key: "rules",
    title: "规则调优案例库",
    desc: "记录参数调整前后触发量、有效率与误报变化，服务策略效果追踪闭环。",
    to: "/knowledge/rule-cases",
    icon: <FileTextOutlined className="text-2xl text-[#4f6970]" />,
  },
  {
    key: "fraud",
    title: "风险模式库",
    desc: "真实案例沉淀，如资金挪用识别、团伙共债模式，可在工作台备注中引用编号。",
    to: "/knowledge/fraud-patterns",
    icon: <SafetyCertificateOutlined className="text-2xl text-[#c77b78]" />,
  },
];

export default function KnowledgeIndex() {
  return (
    <ModulePageShell
      title="知识沉淀"
      subtitle="贷后风控经验资产：发现问题 → 处置 → 沉淀 → 再调用，与预警核查工作台联动。"
      breadcrumb={["知识沉淀", "总览"]}
    >
      <ModuleSectionCard>
        <Row gutter={[16, 16]}>
          {CARDS.map((c) => (
            <Col xs={24} md={8} key={c.key}>
              <Link to={c.to} className="block no-underline text-inherit h-full">
                <Card
                  hoverable
                  className="h-full rounded-lg border border-black/[0.08] shadow-sm"
                  styles={{ body: { minHeight: 160 } }}
                >
                  <div className="flex items-start gap-3">
                    {c.icon}
                    <div className="flex-1 min-w-0">
                      <Text strong className="text-base block">{c.title}</Text>
                      <Text type="secondary" className="text-[13px] block">{c.desc}</Text>
                      <Text className="text-primary text-[13px] mt-2 inline-flex items-center gap-1">
                        进入 <ArrowRightOutlined />
                      </Text>
                    </div>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
