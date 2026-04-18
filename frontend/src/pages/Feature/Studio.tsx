import { Typography, Button, Space, Table, Tag } from "antd";
import {
  PlusOutlined,
  SyncOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const FEATURE_LIST = [
  { key: "1", name: "多头查询次数_30d", type: "数值型", source: "百融API", psi: 0.08, status: "normal" },
  { key: "2", name: "负债率", type: "数值型", source: "内部数据", psi: 0.15, status: "normal" },
  { key: "3", name: "近3月逾期次数", type: "数值型", source: "征信中心", psi: 0.32, status: "warning" },
  { key: "4", name: "设备指纹相似度", type: "数值型", source: "反欺诈引擎", psi: 0.05, status: "normal" },
];

export default function FeatureStudio() {
  const columns = [
    {
      title: "特征名称",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text strong style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      render: (text: string) => <Tag style={{ fontSize: 12 }}>{text}</Tag>,
    },
    {
      title: "数据源",
      dataIndex: "source",
      key: "source",
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
    {
      title: "PSI",
      dataIndex: "psi",
      key: "psi",
      render: (value: number) => (
        <Text
          style={{
            fontSize: 13,
            color: value > 0.25 ? "#faad14" : "#52c41a",
          }}
        >
          {value.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "normal" ? "green" : "orange"} style={{ fontSize: 12 }}>
          {status === "normal" ? "正常" : "漂移"}
        </Tag>
      ),
    },
  ];

  return (
    <ModulePageShell
      title="特征工作室"
      subtitle="特征开发、管理与监控"
      breadcrumb={["特征工程", "特征工作室"]}
      actions={
        <Space>
          <Button icon={<SyncOutlined />}>同步特征库</Button>
          <Button type="primary" icon={<PlusOutlined />}>新建特征</Button>
        </Space>
      }
    >
      {/* 特征概览 */}
      <ModuleSectionCard
        title="📊 特征概览"
        subtitle="共 156 个特征"
        extra={<Button size="small" icon={<LineChartOutlined />}>查看分布</Button>}
      >
        <div className="layout-flex layout-gap-xl layout-mb-lg">
          <div>
            <Text type="secondary" style={{ fontSize: 13 }}>数值型</Text>
            <br />
            <Text strong style={{ fontSize: 20 }}>98</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 13 }}>分类型</Text>
            <br />
            <Text strong style={{ fontSize: 20 }}>42</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 13 }}>文本型</Text>
            <br />
            <Text strong style={{ fontSize: 20 }}>16</Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 13 }}>漂移告警</Text>
            <br />
            <Text strong style={{ fontSize: 20, color: "#faad14" }}>3</Text>
          </div>
        </div>
      </ModuleSectionCard>

      {/* 特征列表 */}
      <ModuleSectionCard title="特征列表" noPadding>
        <Table
          dataSource={FEATURE_LIST}
          columns={columns}
          pagination={false}
          size="small"
          rowKey="key"
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
