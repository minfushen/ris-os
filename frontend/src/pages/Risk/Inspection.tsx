import { Typography, Table, Tag, Button, Space, Progress } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

/** RM 贷后处置记录抽检（替代授信材料专家抽检） */
const RM_QA_TASKS = [
  {
    id: "QA-2401",
    name: "华东 RM · 4月第2周处置抽检",
    status: "processing",
    total: 40,
    completed: 26,
    lead: "质检组A",
    focus: "时效 / 结论准确性 / 留痕完整性",
    createTime: "2026-04-12",
  },
  {
    id: "QA-2402",
    name: "税易贷预警闭环专项",
    status: "processing",
    total: 30,
    completed: 30,
    lead: "质检组B",
    focus: "结论与 30d 逾期对齐",
    createTime: "2026-04-08",
  },
  {
    id: "QA-2350",
    name: "升级协办案件复盘",
    status: "completed",
    total: 20,
    completed: 20,
    lead: "质检组A",
    focus: "跨部门时效",
    createTime: "2026-03-28",
  },
];

export default function Inspection() {
  const columns = [
    { title: "任务ID", dataIndex: "id", width: 96, render: (v: string) => <Text code className="text-[13px]">{v}</Text> },
    { title: "抽检名称", dataIndex: "name", width: 220, render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (v: string, record: (typeof RM_QA_TASKS)[0]) => (
        <Space direction="vertical" size={0}>
          <Tag color={v === "completed" ? "green" : "blue"} className="!m-0 text-[12px]">
            {v === "completed" ? "已完成" : "处理中"}
          </Tag>
          {v !== "completed" && (
            <Text className="text-[12px] text-text-muted">
              {record.completed}/{record.total}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "进度",
      key: "progress",
      width: 120,
      render: (_: unknown, record: (typeof RM_QA_TASKS)[0]) => (
        <Progress percent={Math.round((record.completed / record.total) * 100)} size="small" />
      ),
    },
    { title: "负责人", dataIndex: "lead", width: 100, render: (v: string) => <Text className="text-[13px]">{v}</Text> },
    { title: "质检维度", dataIndex: "focus", ellipsis: true, render: (v: string) => <Text type="secondary" className="text-[12px]">{v}</Text> },
    { title: "创建时间", dataIndex: "createTime", width: 110, render: (v: string) => <Text className="text-[12px]">{v}</Text> },
    {
      title: "操作",
      key: "actions",
      width: 88,
      render: () => <Button type="link" size="small" className="text-[13px]">进入任务</Button>,
    },
  ];

  return (
    <ModulePageShell
      title="复盘与质检"
      subtitle="对象由授信材料改为「RM 预警核查处置记录」：评估处置时效、结论准确性、留痕完整性；不合格样本回流训练 / 规则（演示）。已移除授信侧 PDF 上传与 OCR 流程。"
      breadcrumb={["案件处置", "复盘与质检"]}
      actions={
        <Button type="primary" icon={<PlusOutlined />} size="small">
          创建抽检任务
        </Button>
      }
    >
      <ModuleSectionCard noPadding>
        <Table
          dataSource={RM_QA_TASKS}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 900 }}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
