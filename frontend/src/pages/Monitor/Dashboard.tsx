import { Row, Col, Statistic, Typography, Table, Tag, Button } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

// 模拟数据
const METRICS = [
  { title: "今日进件", value: 1247, trend: 12.5, up: true },
  { title: "自动审批率", value: 87.3, suffix: "%", trend: 2.1, up: true },
  { title: "风险预警", value: 23, trend: 5, up: false },
  { title: "积压待办", value: 156, trend: 8.2, up: false },
];

const ALERTS = [
  { id: 1, type: "PSI超阈值", level: "high", model: "B卡评分模型", time: "10:32" },
  { id: 2, type: "通过率下降", level: "medium", model: "授信主流程", time: "09:15" },
  { id: 3, type: "规则命中异常", level: "low", model: "反欺诈规则集", time: "08:45" },
];

export default function Dashboard() {
  const columns = [
    { title: "告警类型", dataIndex: "type", width: 150, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    { title: "关联模型", dataIndex: "model", width: 150, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: "级别",
      dataIndex: "level",
      width: 80,
      render: (v: string) => (
        <Tag color={v === "high" ? "red" : v === "medium" ? "orange" : "blue"} style={{ fontSize: 10 }}>
          {v === "high" ? "高" : v === "medium" ? "中" : "低"}
        </Tag>
      ),
    },
    { title: "时间", dataIndex: "time", width: 80, render: (v: string) => <Text style={{ fontSize: 11 }}>{v}</Text> },
    { title: "操作", key: "action", render: () => <a style={{ fontSize: 11 }}>查看</a> },
  ];

  return (
    <ModulePageShell
      title="战情看板"
      subtitle="实时业务指标监控"
      breadcrumb={["监控与分析", "战情看板"]}
      actions={
        <Button icon={<ReloadOutlined />}>刷新</Button>
      }
    >
      {/* 核心指标 */}
      <ModuleSectionCard title="📊 核心指标">
        <Row gutter={24}>
          {METRICS.map((m) => (
            <Col key={m.title} span={6}>
              <div style={{ textAlign: "center" }}>
                <Statistic
                  title={<Text style={{ fontSize: 12 }}>{m.title}</Text>}
                  value={m.value}
                  suffix={m.suffix}
                  valueStyle={{ fontSize: 28, fontWeight: 600, color: "#6f8f95" }}
                />
                <Text style={{ fontSize: 11, color: m.up ? "#5f9b7a" : "#c77b78" }}>
                  {m.up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(m.trend)}%
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </ModuleSectionCard>

      {/* 实时告警 */}
      <ModuleSectionCard title="🚨 实时告警" subtitle="共 3 条">
        <Table
          dataSource={ALERTS}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
