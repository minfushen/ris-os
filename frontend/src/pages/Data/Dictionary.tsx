import { Typography, Table, Tag, Button, Space, Input, Select, Tabs } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const VARIABLES = [
  { id: "V001", name: "multi_lend_30d", cnName: "近30天多头借贷次数", type: "derived", source: "外部数据", status: "active" },
  { id: "V002", name: "device_risk_score", cnName: "设备风险评分", type: "raw", source: "设备指纹", status: "active" },
  { id: "V003", name: "age", cnName: "年龄", type: "raw", source: "申请信息", status: "active" },
  { id: "V004", name: "credit_score_a", cnName: "A卡评分", type: "model", source: "模型平台", status: "active" },
  { id: "V005", name: "overdue_history_m3", cnName: "历史M3逾期次数", type: "derived", source: "内部数据", status: "draft" },
];

const DATA_SOURCES = [
  { id: "DS001", name: "百融云创", type: "反欺诈", status: "connected", lastSync: "2026-04-17 10:30" },
  { id: "DS002", name: "同盾科技", type: "反欺诈", status: "connected", lastSync: "2026-04-17 10:25" },
  { id: "DS003", name: "人行征信", type: "征信", status: "connected", lastSync: "2026-04-17 09:00" },
  { id: "DS004", name: "设备指纹服务", type: "风控", status: "error", lastSync: "2026-04-16 18:00" },
];

export default function Dictionary() {
  const variableColumns = [
    { title: "变量ID", dataIndex: "id", width: 80, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: "变量名", dataIndex: "name", width: 150, render: (v: string) => <Text code style={{ fontSize: 13 }}>{v}</Text> },
    { title: "中文名", dataIndex: "cnName", width: 180, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    {
      title: "类型",
      dataIndex: "type",
      width: 80,
      render: (v: string) => (
        <Tag color={v === "raw" ? "blue" : v === "derived" ? "orange" : "purple"} style={{ fontSize: 12 }}>
          {v === "raw" ? "原始" : v === "derived" ? "衍生" : "模型"}
        </Tag>
      ),
    },
    { title: "数据来源", dataIndex: "source", width: 100, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    {
      title: "状态",
      dataIndex: "status",
      width: 80,
      render: (v: string) => (
        <Tag color={v === "active" ? "green" : "default"} style={{ fontSize: 12 }}>
          {v === "active" ? "生效" : "草稿"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 80,
      render: () => <Button type="link" size="small" icon={<EditOutlined />} style={{ fontSize: 13 }}>编辑</Button>,
    },
  ];

  const sourceColumns = [
    { title: "数据源ID", dataIndex: "id", width: 80, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    { title: "名称", dataIndex: "name", width: 150, render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: "类型", dataIndex: "type", width: 100, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (v: string) => (
        <Tag color={v === "connected" ? "green" : "red"} style={{ fontSize: 12 }}>
          {v === "connected" ? "已连接" : "异常"}
        </Tag>
      ),
    },
    { title: "最后同步", dataIndex: "lastSync", width: 150, render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text> },
    {
      title: "操作",
      key: "actions",
      width: 100,
      render: () => (
        <Space>
          <Button type="link" size="small" style={{ fontSize: 13 }}>配置</Button>
          <Button type="link" size="small" style={{ fontSize: 13 }}>测试</Button>
        </Space>
      ),
    },
  ];

  const items = [
    {
      key: "variables",
      label: <Text style={{ fontSize: 12 }}>变量字典</Text>,
      children: (
        <div>
          <Space className="layout-mb-lg">
            <Input placeholder="变量名/中文名" style={{ width: 150 }} size="small" />
            <Select
              placeholder="类型"
              style={{ width: 100 }}
              size="small"
              options={[
                { value: "raw", label: "原始变量" },
                { value: "derived", label: "衍生变量" },
                { value: "model", label: "模型变量" },
              ]}
            />
            <Button type="primary" icon={<SearchOutlined />} size="small">搜索</Button>
            <Button icon={<PlusOutlined />} size="small">新建变量</Button>
          </Space>
          <Table
            dataSource={VARIABLES}
            columns={variableColumns}
            rowKey="id"
            size="small"
            pagination={false}
          />
        </div>
      ),
    },
    {
      key: "sources",
      label: <Text style={{ fontSize: 12 }}>数据源管理</Text>,
      children: (
        <Table
          dataSource={DATA_SOURCES}
          columns={sourceColumns}
          rowKey="id"
          size="small"
          pagination={false}
        />
      ),
    },
  ];

  return (
    <ModulePageShell
      title="数据字典"
      subtitle="变量与数据源管理"
      breadcrumb={["数据资产", "数据字典"]}
    >
      <ModuleSectionCard noPadding>
        <Tabs items={items} className="layout-px-lg" />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
