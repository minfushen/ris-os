import { Typography, Tabs, Table, Select, DatePicker, Space, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

// Vintage 模拟数据
const VINTAGE_DATA = [
  { month: "2024-01", m0: 0, m1: 1.2, m2: 2.1, m3: 2.8, m4: 3.2, m5: 3.5, m6: 3.7 },
  { month: "2024-02", m0: 0, m1: 1.1, m2: 1.9, m3: 2.5, m4: 2.9, m5: 3.1, m6: null },
  { month: "2024-03", m0: 0, m1: 1.3, m2: 2.0, m3: 2.6, m4: 3.0, m5: null, m6: null },
  { month: "2024-04", m0: 0, m1: 1.0, m2: 1.8, m3: 2.4, m4: null, m5: null, m6: null },
];

// Roll Rate 模拟数据
const ROLL_RATE_DATA = [
  { bucket: "M0→M1", rate: 3.2, trend: "up" },
  { bucket: "M1→M2", rate: 15.6, trend: "down" },
  { bucket: "M2→M3", rate: 28.3, trend: "stable" },
  { bucket: "M3→M4", rate: 42.1, trend: "up" },
];

export default function Reports() {
  const items = [
    {
      key: "vintage",
      label: "Vintage分析",
      children: (
        <div>
          <Space style={{ marginBottom: 16 }}>
            <Select defaultValue="credit" style={{ width: 120 }} size="small">
              <Select.Option value="credit">授信</Select.Option>
              <Select.Option value="draw">支用</Select.Option>
            </Select>
            <DatePicker picker="month" placeholder="起始月份" size="small" />
            <Button icon={<DownloadOutlined />} size="small">导出</Button>
          </Space>
          <Table
            dataSource={VINTAGE_DATA}
            columns={[
              { title: "放款月份", dataIndex: "month", fixed: "left", width: 100, render: (v: string) => <Text style={{ fontSize: 11 }}>{v}</Text> },
              { title: "M0", dataIndex: "m0", width: 60, render: (v: number) => <Text style={{ fontSize: 11 }}>{v}</Text> },
              { title: "M1", dataIndex: "m1", width: 60, render: (v: number) => <Text style={{ fontSize: 11 }}>{v ?? "-"}</Text> },
              { title: "M2", dataIndex: "m2", width: 60, render: (v: number) => <Text style={{ fontSize: 11 }}>{v ?? "-"}</Text> },
              { title: "M3", dataIndex: "m3", width: 60, render: (v: number) => <Text style={{ fontSize: 11 }}>{v ?? "-"}</Text> },
              { title: "M4", dataIndex: "m4", width: 60, render: (v: number) => <Text style={{ fontSize: 11 }}>{v ?? "-"}</Text> },
              { title: "M5", dataIndex: "m5", width: 60, render: (v: number) => <Text style={{ fontSize: 11 }}>{v ?? "-"}</Text> },
              { title: "M6", dataIndex: "m6", width: 60, render: (v: number) => <Text style={{ fontSize: 11 }}>{v ?? "-"}</Text> },
            ]}
            rowKey="month"
            size="small"
            pagination={false}
            scroll={{ x: 600 }}
          />
        </div>
      ),
    },
    {
      key: "rollrate",
      label: "迁徙率报表",
      children: (
        <Table
          dataSource={ROLL_RATE_DATA}
          columns={[
            { title: "迁徙路径", dataIndex: "bucket", width: 120, render: (v: string) => <Text style={{ fontSize: 11 }}>{v}</Text> },
            { title: "迁徙率(%)", dataIndex: "rate", width: 100, render: (v: number) => <Text style={{ fontSize: 11 }}>{v}</Text> },
            { title: "趋势", dataIndex: "trend", width: 80, render: (v: string) => <Text style={{ fontSize: 11 }}>{v}</Text> },
          ]}
          rowKey="bucket"
          size="small"
          pagination={false}
        />
      ),
    },
    {
      key: "model",
      label: "模型监控",
      children: (
        <div style={{ padding: 24, textAlign: "center" }}>
          <Text type="secondary">模型监控报表开发中...</Text>
        </div>
      ),
    },
  ];

  return (
    <ModulePageShell
      title="报表中心"
      subtitle="Vintage、Roll Rate 等报表"
      breadcrumb={["监控与分析", "报表中心"]}
    >
      <ModuleSectionCard noPadding>
        <Tabs items={items} style={{ padding: "0 16px" }} />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
