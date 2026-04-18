import { Row, Col } from "antd";
import MetricCard from "./MetricCard";

// 模拟数据
const METRICS_DATA = [
  {
    title: "今日进件",
    value: "1,247",
    unit: "件",
    trend: "up" as const,
    trendValue: "+12.5%",
    sparkline: [45, 52, 48, 61, 55, 58, 63, 67, 72, 68, 75, 80],
  },
  {
    title: "自动审批率",
    value: "87.3",
    unit: "%",
    trend: "up" as const,
    trendValue: "+2.1%",
    sparkline: [82, 83, 84, 83, 85, 86, 85, 87, 86, 88, 87, 87],
  },
  {
    title: "风险预警",
    value: "23",
    unit: "件",
    trend: "up" as const,
    trendValue: "较昨日+5",
    alert: true,
    alertText: "需关注",
    sparkline: [12, 15, 14, 18, 16, 20, 19, 22, 21, 23, 22, 23],
  },
  {
    title: "积压待办",
    value: "156",
    unit: "件",
    trend: "down" as const,
    trendValue: "-8.2%",
    alert: true,
    alertText: "超阈值",
    sparkline: [180, 175, 170, 168, 165, 162, 160, 158, 157, 156, 155, 156],
  },
];

export default function TopDashboard() {
  return (
    <Row gutter={12} style={{ marginBottom: 12 }}>
      {METRICS_DATA.map((metric) => (
        <Col key={metric.title} xs={12} sm={12} md={6}>
          <MetricCard {...metric} />
        </Col>
      ))}
    </Row>
  );
}
