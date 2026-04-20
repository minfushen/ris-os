import { Typography, Table, Tag, Button, Space, Progress, Select, DatePicker, message } from "antd";
import { PlusOutlined, EyeOutlined, DownloadOutlined } from "@ant-design/icons";
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

export default function Backtest() {
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
      title="规则仿真回测"
      subtitle="回测对象由评分卡改为「预警规则集」；核心指标为预警提前天数分布与规则→逾期转化率，支持按产品线 / 行业切片（演示）"
      breadcrumb={["预警策略", "规则仿真回测"]}
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
      <ModuleSectionCard noPadding>
        <Table
          dataSource={BACKTEST_TASKS}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 1100 }}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
