import { useState } from "react";
import { Button, Col, Progress, Row, Space, Table, Tag, Typography, Drawer, Form, Input, Select, InputNumber, message } from "antd";
import { ExperimentOutlined, PlayCircleOutlined, PlusOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import DemoFlowNav from "@/components/DemoFlowNav";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PIPELINE_STEPS = [
  {
    title: "样本与好坏定义",
    desc: "滚动率分析定好坏；坏样本稀缺（逾期率 <1%）用 SMOTE 过采样、不固定表现窗口",
    status: "已完成",
    pct: 100,
  },
  {
    title: "特征工程与变量筛选",
    desc: "8 大变量域 · 交易行为域 972 行变量清单；IV / VIF / 逐步回归筛选入模变量",
    status: "已完成",
    pct: 100,
  },
  {
    title: "WOE 分箱与评分卡训练",
    desc: "逻辑回归 + WOE 评分卡（可解释优先），缺失值按业务含义灵活分箱",
    status: "进行中",
    pct: 72,
  },
  {
    title: "验证与校准",
    desc: "KS / GINI / PSI 验证；校准基准分 600=好坏比 20:1，每翻倍 +20 分",
    status: "排队中",
    pct: 35,
  },
] as const;

const EXPERIMENTS = [
  {
    id: "EXP-PL-2408",
    model: "惠快贷贷后预警评分卡",
    sample: "惠快贷 · 全行业 · 近 18 个月 · SMOTE 过采样",
    auc: 0.842,
    ks: 0.413,
    gini: 0.61,
    psi: 0.03,
    recall: "72.8%",
    lift: "2.6x",
    status: "候选模型",
    targetFP: "FP-01 资金挪用 · FP-03 税报粉饰 · FP-05 经营空心化",
  },
  {
    id: "EXP-PL-2411",
    model: "税易贷税报断档评分卡",
    sample: "税易贷 · 全行业 · 近 12 个月 · 新老客户分层变量",
    auc: 0.811,
    ks: 0.386,
    gini: 0.55,
    psi: 0.04,
    recall: "68.4%",
    lift: "2.2x",
    status: "训练中",
    targetFP: "FP-03 税报粉饰（新客 DPD30 3.18% vs 老客 1.49%）",
  },
  {
    id: "EXP-PL-2414",
    model: "多头共债跳升评分卡",
    sample: "惠快贷 · 批发零售 · 近 24 个月 · 全部坏样本+好样本 40:1 抽样验证",
    auc: 0.798,
    ks: 0.361,
    gini: 0.52,
    psi: 0.05,
    recall: "64.9%",
    lift: "1.9x",
    status: "待复核",
    targetFP: "FP-02 团伙共债",
  },
];

export default function ModelFactory() {
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      message.success(`训练实验「${values.name}」已创建，进入排队队列`);
      setCreateOpen(false);
      createForm.resetFields();
    } catch {
      message.error("请完善必填信息");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <ModulePageShell
      title="模型工厂"
      subtitle="对照《项目实施计划书》：好坏定义 → 特征筛选（IV/VIF）→ WOE 评分卡 → KS/GINI/PSI 验证与校准，支撑模型评审（M2）"
      breadcrumb={["策略与模型", "模型工厂"]}
      actions={
        <Space wrap>
          <Button size="small">导入样本集</Button>
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
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

      <ModuleSectionCard
        title="样本圈选"
        subtitle="滚动率分析定好坏：观察期 + 表现窗口 + 坏样本定义 + 采样策略"
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <div className="card-surface layout-p-md h-full">
              <Text type="secondary" className="text-[12px]">圈选范围</Text>
              <Text strong className="block mt-1">
                前六大小微产品 · 覆盖余额 88% / 客户 96.75%
              </Text>
              <Text type="secondary" className="text-[12px] block mt-2">
                观察期 2024-10 ~ 2026-03 · 表现窗口不固定（按滚动率分析动态确定）
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="card-surface layout-p-md h-full">
              <Text type="secondary" className="text-[12px]">好坏定义</Text>
              <Text strong className="block mt-1">
                坏样本 = 两次 1 期逾期或单次 2 期以上逾期
              </Text>
              <Text type="secondary" className="text-[12px] block mt-2">
                坏样本不足（部分产品逾期率 &lt;1%）→ SMOTE 过采样 + 全部坏样本入模
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="card-surface layout-p-md h-full">
              <Text type="secondary" className="text-[12px]">采样与验证策略</Text>
              <Text strong className="block mt-1">
                建模样本 18,642 户 · 坏样本 1,214 户
              </Text>
              <Text type="secondary" className="text-[12px] block mt-2">
                全部坏样本建模 + 好样本 40:1 抽样验证 · 时间外样本保留 3 个月
              </Text>
            </div>
          </Col>
        </Row>
      </ModuleSectionCard>

      <ModuleSectionCard title="训练实验" subtitle="候选评分卡指标对比（KS/GINI/PSI），支撑模型评审与 Champion / Challenger 选择" noPadding>
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={EXPERIMENTS}
          columns={[
            { title: "实验编号", dataIndex: "id", width: 110, render: (v: string) => <Text code>{v}</Text> },
            { title: "模型名称", dataIndex: "model", width: 190 },
            { title: "样本口径", dataIndex: "sample", ellipsis: true },
            { title: "AUC", dataIndex: "auc", width: 70 },
            { title: "KS", dataIndex: "ks", width: 70 },
            { title: "GINI", dataIndex: "gini", width: 70 },
            { title: "PSI", dataIndex: "psi", width: 70 },
            { title: "召回率", dataIndex: "recall", width: 80 },
            { title: "Lift", dataIndex: "lift", width: 70 },
            {
              title: "目标欺诈模式",
              dataIndex: "targetFP",
              width: 200,
              render: (v: string) => <Text className="text-[11px]">{v}</Text>,
            },
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

      <ModuleSectionCard title="方法论锚点（计划书口径）">
        <div className="workbench-inset-panel">
          <Space align="start">
            <ExperimentOutlined className="text-primary mt-1" />
            <Text className="text-[13px]">
              可解释性优先：逻辑回归 + WOE + 业务校验是银行风控落地前提；坏样本处理方法论（滚动率定好坏 + SMOTE + 不固定表现窗口 + 40:1 抽样验证）是小微低逾期场景建模成败关键；LTV 双模型（分类+回归）复用同一套特征与训练链路。
            </Text>
          </Space>
        </div>
      </ModuleSectionCard>

      <DemoFlowNav />

      {/* 新建训练实验抽屉 */}
      <Drawer
        title="新建训练实验"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        width={560}
        footer={
          <Space>
            <Button onClick={() => setCreateOpen(false)}>取消</Button>
            <Button type="primary" loading={createLoading} onClick={handleCreateSubmit}>
              创建实验
            </Button>
          </Space>
        }
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="name"
            label="实验名称"
            rules={[{ required: true, message: "请输入实验名称" }]}
          >
            <Input placeholder="如：惠快贷多头共债预警评分卡 V2" />
          </Form.Item>
          <Form.Item
            name="product"
            label="目标产品线"
            rules={[{ required: true, message: "请选择产品线" }]}
          >
            <Select placeholder="选择产品线">
              <Option value="惠快贷">惠快贷</Option>
              <Option value="税易贷">税易贷</Option>
              <Option value="惠微贷">惠微贷</Option>
              <Option value="支小贷">支小贷</Option>
              <Option value="房快贷">房快贷</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="sampleRange"
            label="样本时间范围"
            rules={[{ required: true, message: "请选择样本时间范围" }]}
          >
            <Select placeholder="选择时间范围">
              <Option value="近 6 个月">近 6 个月</Option>
              <Option value="近 12 个月">近 12 个月</Option>
              <Option value="近 18 个月">近 18 个月</Option>
              <Option value="近 24 个月">近 24 个月</Option>
            </Select>
          </Form.Item>
          <Form.Item name="smote" label="SMOTE 过采样" valuePropName="checked" initialValue={true}>
            <Select>
              <Option value={true}>启用（坏样本稀缺时）</Option>
              <Option value={false}>不启用</Option>
            </Select>
          </Form.Item>
          <Form.Item name="testRatio" label="验证集比例" initialValue={0.2}>
            <InputNumber min={0.1} max={0.4} step={0.05} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label="实验说明">
            <TextArea rows={3} placeholder="描述实验目标、预期改进点..." />
          </Form.Item>
        </Form>
      </Drawer>
    </ModulePageShell>
  );
}
