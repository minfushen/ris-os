import { Typography, Table, Tag, Button, Space, Progress } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const INSPECTION_TASKS = [
  { id: "IN001", name: "4月第一周通过客群抽检", status: "processing", total: 50, completed: 32, inspector: "张三", createTime: "2026-04-10" },
  { id: "IN002", name: "高风险客群专项抽检", status: "processing", total: 30, completed: 30, inspector: "李四", createTime: "2026-04-08" },
  { id: "IN003", name: "秒批单子质检", status: "completed", total: 50, completed: 50, inspector: "王五", createTime: "2026-04-05" },
];

export default function Inspection() {
  const columns = [
    { title: "任务ID", dataIndex: "id", width: 80, render: (v: string) => <Text code style={{ fontSize: 13 }}>{v}</Text> },
    { title: "抽检名称", dataIndex: "name", width: 200, render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    {
      title: "状态",
      dataIndex: "status",
      width: 150,
      render: (v: string, record: typeof INSPECTION_TASKS[0]) => (
        <Space direction="vertical" size={0}>
          <Tag color={v === "completed" ? "green" : "blue"} style={{ fontSize: 12 }}>
            {v === "completed" ? "已完成" : "处理中"}
          </Tag>
          {v !== "completed" && (
            <Text style={{ fontSize: 13 }}>
              {record.completed}/{record.total}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "进度",
      dataIndex: "progress",
      width: 120,
      render: (_: unknown, record: typeof INSPECTION_TASKS[0]) => (
        <Progress percent={Math.round((record.completed / record.total) * 100)} size="small" />
      ),
    },
    { title: "质检人", dataIndex: "inspector", width: 80, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: "创建时间", dataIndex: "createTime", width: 120, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: () => <Button type="link" size="small" style={{ fontSize: 13 }}>查看</Button>,
    },
  ];

  return (
    <ModulePageShell
      title="专家抽检与复盘"
      subtitle="人工质检与经验沉淀"
      breadcrumb={["风险核查", "专家抽检"]}
      actions={
        <Button type="primary" icon={<PlusOutlined />} size="small">
          创建抽检任务
        </Button>
      }
    >
      <ModuleSectionCard noPadding>
        <Table
          dataSource={INSPECTION_TASKS}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
