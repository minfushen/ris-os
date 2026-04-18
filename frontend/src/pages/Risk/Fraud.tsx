import { Typography, Table, Tag, Button, Space, Input, Select } from "antd";
import { SearchOutlined, LinkOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const FRAUD_CASES = [
  { id: "F001", type: "中介代办", status: "investigating", victims: 12, relation: "共用WiFi", createTime: "2026-04-15" },
  { id: "F002", type: "团伙欺诈", status: "confirmed", victims: 28, relation: "联系人交叉", createTime: "2026-04-12" },
  { id: "F003", type: "身份冒用", status: "cleared", victims: 3, relation: "设备共用", createTime: "2026-04-10" },
];

export default function Fraud() {
  const columns = [
    { title: "案件ID", dataIndex: "id", width: 80, render: (v: string) => <Text code style={{ fontSize: 11 }}>{v}</Text> },
    { title: "欺诈类型", dataIndex: "type", width: 100, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (v: string) => (
        <Tag color={v === "investigating" ? "blue" : v === "confirmed" ? "red" : "green"} style={{ fontSize: 10 }}>
          {v === "investigating" ? "排查中" : v === "confirmed" ? "已确认" : "已排除"}
        </Tag>
      ),
    },
    { title: "涉及人数", dataIndex: "victims", width: 80, render: (v: number) => <Text style={{ fontSize: 11 }}>{v}</Text> },
    { title: "关联特征", dataIndex: "relation", width: 120, render: (v: string) => <Text style={{ fontSize: 11 }}>{v}</Text> },
    { title: "发现时间", dataIndex: "createTime", width: 120, render: (v: string) => <Text style={{ fontSize: 11 }}>{v}</Text> },
    {
      title: "操作",
      key: "actions",
      width: 120,
      render: () => (
        <Space size={4}>
          <Button type="link" size="small" style={{ fontSize: 11 }}>详情</Button>
          <Button type="link" size="small" icon={<LinkOutlined />} style={{ fontSize: 11 }}>图谱</Button>
        </Space>
      ),
    },
  ];

  return (
    <ModulePageShell
      title="团伙欺诈排查"
      subtitle="欺诈团伙发现与关联分析"
      breadcrumb={["风险核查", "团伙欺诈"]}
    >
      {/* 搜索栏 */}
      <ModuleSectionCard>
        <Space wrap>
          <Input placeholder="客户ID/手机号" style={{ width: 150 }} size="small" />
          <Select
            placeholder="欺诈类型"
            style={{ width: 120 }}
            size="small"
            options={[
              { value: "agent", label: "中介代办" },
              { value: "gang", label: "团伙欺诈" },
              { value: "identity", label: "身份冒用" },
            ]}
          />
          <Select
            placeholder="状态"
            style={{ width: 100 }}
            size="small"
            options={[
              { value: "investigating", label: "排查中" },
              { value: "confirmed", label: "已确认" },
              { value: "cleared", label: "已排除" },
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />} size="small">搜索</Button>
        </Space>
      </ModuleSectionCard>

      {/* 案件列表 */}
      <ModuleSectionCard noPadding>
        <Table
          dataSource={FRAUD_CASES}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
