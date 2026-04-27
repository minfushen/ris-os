import { Typography, Table, Tag, Button, Space, Progress, Select, DatePicker, Tabs, Row, Col, App } from "antd";
import { PlusOutlined, EyeOutlined, DownloadOutlined, ThunderboltOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const BACKTEST_TASKS = [
  {
    id: "BT-P-01",
    name: "经营贷 · 司法包 回测",
    target: "预警规则集 · 司法联动",
    slice: "制造业",
    status: "completed",
    progress: 100,
    advanceDaysP50: 22,
    advanceDaysP80: 18,
    conversionPct: 19.2,
    createTime: "2026-04-15",
  },
  {
    id: "BT-P-02",
    name: "税易贷 · 税报断档 回测",
    target: "预警规则集 · 税报类",
    slice: "全行业",
    status: "running",
    progress: 65,
    advanceDaysP50: null,
    advanceDaysP80: null,
    conversionPct: null,
    createTime: "2026-04-17",
  },
  {
    id: "BT-P-03",
    name: "消费贷 · 多头跳升 回测",
    target: "预警规则集 · 多头",
    slice: "批发零售",
    status: "pending",
    progress: 0,
    advanceDaysP50: null,
    advanceDaysP80: null,
    conversionPct: null,
    createTime: "2026-04-17",
  },
];

const SINGLE_RULE_IMPACTS = [
  { metric: "命中客户数", before: "1,840", after: "2,126", delta: "+286", color: "gold" },
  { metric: "预警提前天数 P50", before: "18 天", after: "21 天", delta: "+3 天", color: "green" },
  { metric: "有效率", before: "68.2%", after: "66.7%", delta: "-1.5%", color: "gold" },
  { metric: "误报率", before: "22.4%", after: "25.1%", delta: "+2.7%", color: "red" },
];

const FLOW_SIM_STEPS = [
  {
    title: "规则命中",
    color: "blue",
    description: "回放历史客户特征，检查单规则与规则组命中。",
  },
  {
    title: "模型评分",
    color: "green",
    description: "调用模型版本库，比较 Champion / Challenger 输出。",
  },
  {
    title: "动作分派",
    color: "gold",
    description: "验证红黄蓝灯和处置动作是否符合发布预案。",
  },
] as const;

export default function Backtest() {
  const { message } = App.useApp();
  const columns = [
    { title: "任务ID", dataIndex: "id", width: 88, render: (v: string) => <Text code className="text-[13px]">{v}</Text> },
    { title: "回测名称", dataIndex: "name", width: 200, render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
    { title: "对象", dataIndex: "target", width: 180, ellipsis: true, render: (v: string) => <Text className="text-[12px]">{v}</Text> },
    { title: "切片", dataIndex: "slice", width: 88, render: (v: string) => <Tag className="!m-0 text-[11px]">{v}</Tag> },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (v: string, record: (typeof BACKTEST_TASKS)[0]) => (
        <Space direction="vertical" size={0}>
          <Tag color={v === "completed" ? "green" : v === "running" ? "blue" : "default"} className="!m-0 text-[12px]">
            {v === "completed" ? "已完成" : v === "running" ? "运行中" : "待执行"}
          </Tag>
          {v === "running" && <Progress percent={record.progress} size="small" />}
        </Space>
      ),
    },
    {
      title: "预警提前天数 P50",
      dataIndex: "advanceDaysP50",
      width: 130,
      render: (v: number | null) => <Text className="text-[13px]">{v != null ? `${v} 天` : "—"}</Text>,
    },
    {
      title: "P80",
      dataIndex: "advanceDaysP80",
      width: 72,
      render: (v: number | null) => <Text className="text-[13px]">{v != null ? `${v} 天` : "—"}</Text>,
    },
    {
      title: "转化率",
      dataIndex: "conversionPct",
      width: 88,
      render: (v: number | null) => <Text className="text-[13px]">{v != null ? `${v}%` : "—"}</Text>,
    },
    { title: "创建时间", dataIndex: "createTime", width: 110, render: (v: string) => <Text className="text-[12px]">{v}</Text> },
    {
      title: "操作",
      key: "actions",
      width: 120,
      render: () => (
        <Space size={0}>
          <Button type="link" size="small" icon={<EyeOutlined />} className="text-[13px]">查看</Button>
          <Button type="link" size="small" icon={<DownloadOutlined />} className="text-[13px]" onClick={() => message.success("导出任务已排队（演示）")}>
            导出
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <ModulePageShell
      title="仿真回溯"
      subtitle="保留业务高频的单规则回溯，同时支持策略包仿真与决策流联调，避免平台化后丢掉业务调参效率"
      breadcrumb={["策略与模型", "仿真回溯"]}
      actions={
        <Space wrap>
          <Select size="small" defaultValue="all" style={{ width: 120 }} options={[{ value: "all", label: "全产品线" }, { value: "biz", label: "经营贷" }, { value: "tax", label: "税易贷" }]} />
          <DatePicker.RangePicker size="small" />
          <Button type="primary" icon={<PlusOutlined />} size="small">
            发起回测
          </Button>
        </Space>
      }
    >
      <ModuleSectionCard>
        <Tabs
          defaultActiveKey="single"
          items={[
            {
              key: "single",
              label: "单规则回溯",
              children: (
                <div>
                  <div className="workbench-inset-panel layout-mb-md">
                    <Space align="start">
                      <ThunderboltOutlined className="text-accent-warning mt-1" />
                      <Text className="text-[13px]">
                        高频业务路径：业务人员只改一条规则或一个阈值时，不需要跑完整决策流，只看该规则在历史样本上的命中、提前量、有效率和误报变化。
                      </Text>
                    </Space>
                  </div>
                  <Row gutter={[12, 12]}>
                    {SINGLE_RULE_IMPACTS.map((item) => (
                      <Col xs={24} md={12} xl={6} key={item.metric}>
                        <div className="card-surface layout-p-md h-full">
                          <Text type="secondary" className="text-[12px] block">
                            {item.metric}
                          </Text>
                          <div className="layout-flex-between layout-mt-sm">
                            <Text className="text-[12px]">调整前 {item.before}</Text>
                            <Text strong className="text-[18px] text-primary">
                              {item.after}
                            </Text>
                          </div>
                          <Tag color={item.color} className="layout-mt-sm">
                            阈值变化影响 {item.delta}
                          </Tag>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              ),
            },
            {
              key: "package",
              label: "策略包仿真",
              children: (
                <Table
                  dataSource={BACKTEST_TASKS}
                  columns={columns}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  scroll={{ x: 1100 }}
                />
              ),
            },
            {
              key: "flow",
              label: "决策流联调",
              children: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {FLOW_SIM_STEPS.map((step, index) => (
                    <div className="card-surface layout-p-md" key={step.title}>
                      <Tag color={step.color}>Step {index + 1}</Tag>
                      <Text strong className="block layout-mt-sm text-[13px]">
                        {step.title}
                      </Text>
                      <Text type="secondary" className="block layout-mt-xs text-[12px]">
                        {step.description}
                      </Text>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
