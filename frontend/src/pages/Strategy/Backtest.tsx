import { Typography, Table, Tag, Button, Space, Progress } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const BACKTEST_TASKS = [
  { id: "BT001", name: "V3策略Q1回测", strategy: "授信主流程策略V3", status: "completed", progress: 100, ks: 0.42, auc: 0.85, createTime: "2026-04-15" },
  { id: "BT002", name: "反欺诈策略回测", strategy: "反欺诈策略集", status: "running", progress: 65, ks: null, auc: null, createTime: "2026-04-17" },
  { id: "BT003", name: "支用策略回测", strategy: "支用主流程策略V2", status: "pending", progress: 0, ks: null, auc: null, createTime: "2026-04-17" },
];

export default function Backtest() {
  const columns = [
    { title: "任务ID", dataIndex: "id", width: 80, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: "回测名称", dataIndex: "name", width: 180, render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: "策略集", dataIndex: "strategy", width: 180, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (v: string, record: typeof BACKTEST_TASKS[0]) => (
        <Space direction="vertical" size={0}>
          <Tag color={v === "completed" ? "green" : v === "running" ? "blue" : "default"} style={{ fontSize: 12 }}>
            {v === "completed" ? "已完成" : v === "running" ? "运行中" : "待执行"}
          </Tag>
          {v === "running" && <Progress percent={record.progress} size="small" />}
        </Space>
      ),
    },
    { title: "KS值", dataIndex: "ks", width: 80, render: (v: number | null) => <Text style={{ fontSize: 13 }}>{v ? v.toFixed(2) : "-"}</Text> },
    { title: "AUC值", dataIndex: "auc", width: 80, render: (v: number | null) => <Text style={{ fontSize: 13 }}>{v ? v.toFixed(2) : "-"}</Text> },
    { title: "创建时间", dataIndex: "createTime", width: 120, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    {
      title: "操作",
      key: "actions",
      width: 80,
      render: () => <Button type="link" size="small" icon={<EyeOutlined />} style={{ fontSize: 13 }}>查看</Button>,
    },
  ];

  return (
    <ModulePageShell
      title="仿真回测实验室"
      subtitle="策略离线回测与效果评估"
      breadcrumb={["策略管控", "仿真回测"]}
      actions={
        <Button type="primary" icon={<PlusOutlined />} size="small">
          发起回测
        </Button>
      }
    >
      <ModuleSectionCard noPadding>
        <Table
          dataSource={BACKTEST_TASKS}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
