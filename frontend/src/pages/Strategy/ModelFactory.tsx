import { Button, Col, Progress, Row, Space, Table, Tag, Typography } from "antd";
import { ExperimentOutlined, PlayCircleOutlined, PlusOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const PIPELINE_STEPS = [
  { title: "样本圈选", desc: "从预警核查、逾期迁徙、处置结果回流样本", status: "已完成", pct: 100 },
  { title: "标签回流", desc: "命中后 30/60/90 天表现生成 bad/good 标签", status: "已完成", pct: 100 },
  { title: "特征选择", desc: "经营、司法、资金流、还款行为特征筛选", status: "进行中", pct: 72 },
  { title: "训练实验", desc: "LightGBM / 评分卡并行实验，沉淀实验报告", status: "排队中", pct: 35 },
] as const;

const EXPERIMENTS = [
  {
    id: "EXP-PL-2408",
    model: "贷后经营异常预警模型",
    sample: "经营贷 · 制造业 · 近 18 个月",
    auc: 0.842,
    ks: 0.413,
    recall: "72.8%",
    lift: "2.6x",
    status: "候选模型",
  },
  {
    id: "EXP-PL-2411",
    model: "税报断档风险模型",
    sample: "税易贷 · 全行业 · 近 12 个月",
    auc: 0.811,
    ks: 0.386,
    recall: "68.4%",
    lift: "2.2x",
    status: "训练中",
  },
  {
    id: "EXP-PL-2414",
    model: "多头共债跳升模型",
    sample: "消费贷 · 批发零售 · 近 24 个月",
    auc: 0.798,
    ks: 0.361,
    recall: "64.9%",
    lift: "1.9x",
    status: "待复核",
  },
];

export default function ModelFactory() {
  return (
    <ModulePageShell
      title="模型工厂"
      subtitle="面向招采交付口径的建模平台：样本圈选、标签回流、特征选择、训练实验、模型评估与注册前复核"
      breadcrumb={["策略与模型", "模型工厂"]}
      actions={
        <Space wrap>
          <Button size="small">导入样本集</Button>
          <Button type="primary" size="small" icon={<PlusOutlined />}>
            新建训练实验
          </Button>
        </Space>
      }
    >
      <ModuleSectionCard title="建模流水线" subtitle="把处置闭环沉淀为可训练样本，而不是只做规则配置">
        <Row gutter={[12, 12]}>
          {PIPELINE_STEPS.map((step, index) => (
            <Col xs={24} md={12} xl={6} key={step.title}>
              <div className="card-surface layout-p-md h-full">
                <div className="layout-flex-between layout-mb-sm">
                  <Text strong className="text-[13px]">
                    {index + 1}. {step.title}
                  </Text>
                  <Tag color={step.pct === 100 ? "green" : step.pct > 50 ? "blue" : "default"} className="!m-0">
                    {step.status}
                  </Tag>
                </div>
                <Text type="secondary" className="text-[12px] block layout-mb-md">
                  {step.desc}
                </Text>
                <Progress percent={step.pct} size="small" />
              </div>
            </Col>
          ))}
        </Row>
      </ModuleSectionCard>

      <ModuleSectionCard title="训练实验" subtitle="候选模型指标对比，支撑 Champion / Challenger 选择" noPadding>
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={EXPERIMENTS}
          columns={[
            { title: "实验编号", dataIndex: "id", width: 110, render: (v: string) => <Text code>{v}</Text> },
            { title: "模型名称", dataIndex: "model", width: 180 },
            { title: "样本口径", dataIndex: "sample", ellipsis: true },
            { title: "AUC", dataIndex: "auc", width: 80 },
            { title: "KS", dataIndex: "ks", width: 80 },
            { title: "召回率", dataIndex: "recall", width: 90 },
            { title: "Lift", dataIndex: "lift", width: 80 },
            {
              title: "状态",
              dataIndex: "status",
              width: 100,
              render: (v: string) => <Tag color={v === "候选模型" ? "green" : v === "训练中" ? "blue" : "gold"}>{v}</Tag>,
            },
            {
              title: "操作",
              key: "action",
              width: 120,
              render: () => (
                <Button type="link" size="small" icon={<PlayCircleOutlined />}>
                  查看报告
                </Button>
              ),
            },
          ]}
        />
      </ModuleSectionCard>

      <ModuleSectionCard title="面试讲解点">
        <div className="workbench-inset-panel">
          <Space align="start">
            <ExperimentOutlined className="text-primary mt-1" />
            <Text className="text-[13px]">
              这里表达的是“类睿智/同盾建模平台”的核心交付：业务结论回流成样本，特征工程沉淀变量，训练实验产出模型报告，最终进入版本库和决策流，而不是停留在静态规则页面。
            </Text>
          </Space>
        </div>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
