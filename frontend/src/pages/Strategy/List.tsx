import { Typography, Table, Tag, Button, Space, Modal, Form, Input, Select } from "antd";
import { PlusOutlined, EditOutlined, HistoryOutlined } from "@ant-design/icons";
import { useState } from "react";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const STRATEGIES = [
  { id: "S001", name: "授信主流程策略V3", scenario: "credit", status: "active", version: "3.2.1", updateTime: "2026-04-15" },
  { id: "S002", name: "支用主流程策略V2", scenario: "draw", status: "active", version: "2.1.0", updateTime: "2026-04-10" },
  { id: "S003", name: "反欺诈策略集", scenario: "credit", status: "active", version: "1.5.3", updateTime: "2026-04-12" },
  { id: "S004", name: "贷后预警策略", scenario: "post_loan", status: "draft", version: "1.0.0", updateTime: "2026-04-17" },
];

export default function StrategyList() {
  const [modalOpen, setModalOpen] = useState(false);

  const columns = [
    { title: "策略ID", dataIndex: "id", width: 80, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: "策略名称", dataIndex: "name", width: 200, render: (v: string) => <Text strong style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: "场景",
      dataIndex: "scenario",
      width: 80,
      render: (v: string) => (
        <Tag color={v === "credit" ? "blue" : v === "draw" ? "cyan" : "purple"} style={{ fontSize: 10 }}>
          {v === "credit" ? "授信" : v === "draw" ? "支用" : "贷后"}
        </Tag>
      ),
    },
    { title: "版本", dataIndex: "version", width: 80, render: (v: string) => <Text style={{ fontSize: 11 }}>{v}</Text> },
    {
      title: "状态",
      dataIndex: "status",
      width: 80,
      render: (v: string) => (
        <Tag color={v === "active" ? "green" : "default"} style={{ fontSize: 10 }}>
          {v === "active" ? "生效中" : "草稿"}
        </Tag>
      ),
    },
    { title: "更新时间", dataIndex: "updateTime", width: 120, render: (v: string) => <Text style={{ fontSize: 11 }}>{v}</Text> },
    {
      title: "操作",
      key: "actions",
      width: 150,
      render: () => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EditOutlined />} style={{ fontSize: 11 }}>编辑</Button>
          <Button type="link" size="small" icon={<HistoryOutlined />} style={{ fontSize: 11 }}>历史</Button>
        </Space>
      ),
    },
  ];

  return (
    <ModulePageShell
      title="策略集管理"
      subtitle="策略版本与生命周期管理"
      breadcrumb={["策略管控", "策略集管理"]}
      actions={
        <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => setModalOpen(true)}>
          新建策略集
        </Button>
      }
    >
      <ModuleSectionCard noPadding>
        <Table
          dataSource={STRATEGIES}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </ModuleSectionCard>

      <Modal title="新建策略集" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => setModalOpen(false)}>
        <Form layout="vertical" size="small">
          <Form.Item label="策略名称" required>
            <Input placeholder="输入策略集名称" />
          </Form.Item>
          <Form.Item label="业务场景" required>
            <Select options={[{ value: "credit", label: "授信" }, { value: "draw", label: "支用" }, { value: "post_loan", label: "贷后" }]} />
          </Form.Item>
          <Form.Item label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </ModulePageShell>
  );
}
