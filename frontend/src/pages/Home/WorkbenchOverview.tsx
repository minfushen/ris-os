import { Typography, Row, Col, Tag } from "antd";
import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  SyncOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { QueueOverviewStats } from "@/utils/workbenchStats";

const { Text } = Typography;

export type QueueMetricKey = "pending" | "processing" | "reviewing" | "completed_today";

export interface WorkbenchOverviewProps {
  queueStats: QueueOverviewStats;
  onQueueMetricClick?: (key: QueueMetricKey) => void;
  onRiskCardClick?: (key: "anomaly" | "pass_rate") => void;
}

const RISK_DEMO = [
  {
    key: "anomaly" as const,
    label: "异常告警",
    value: 5,
    hint: "规则/模型命中异常量",
    icon: <AlertOutlined />,
    status: "critical" as const,
  },
  {
    key: "pass_rate" as const,
    label: "授信通过率 vs 基准",
    value: "-2.1%",
    hint: "较上周基准",
    icon: <LineChartOutlined />,
    status: "warning" as const,
  },
];

export default function WorkbenchOverview({
  queueStats,
  onQueueMetricClick,
  onRiskCardClick,
}: WorkbenchOverviewProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "critical":
        return "text-accent-danger";
      case "warning":
        return "text-accent-warning";
      default:
        return "text-accent-success";
    }
  };

  const queueCards: Array<{
    key: QueueMetricKey;
    label: string;
    value: number;
    icon: React.ReactNode;
    status?: "normal" | "warning" | "critical";
  }> = [
    {
      key: "pending",
      label: "待处理",
      value: queueStats.pending,
      icon: <ClockCircleOutlined />,
      status: queueStats.pending > 0 ? "warning" : "normal",
    },
    {
      key: "processing",
      label: "处理中",
      value: queueStats.processing,
      icon: queueStats.processing > 0 ? <SyncOutlined spin /> : <SyncOutlined />,
      status: "normal",
    },
    {
      key: "reviewing",
      label: "待复核",
      value: queueStats.reviewing,
      icon: <WarningOutlined />,
      status: queueStats.reviewing > 0 ? "warning" : "normal",
    },
    {
      key: "completed_today",
      label: "今日完成",
      value: queueStats.completedToday,
      icon: <CheckCircleOutlined />,
      status: "normal",
    },
  ];

  return (
    <section className="section-shell">
      <div className="section-header flex flex-wrap items-center justify-between gap-2">
        <div>
          <Text className="section-title">核心指标与队列</Text>
          <Text className="section-subtitle ml-2">队列来自当前列表；风险项为演示口径</Text>
        </div>
        <Tag className="text-xs m-0">点击卡片下钻工作项</Tag>
      </div>

      <div className="section-body space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Text className="text-xs text-text-muted">队列与待办</Text>
            <Tag color="processing" className="text-[10px] m-0">
              数据来源：当前表实时聚合
            </Tag>
            <Tag className="text-[10px] m-0">刷新即更新</Tag>
          </div>
          <Row gutter={16}>
            {queueCards.map((metric) => (
              <Col span={6} key={metric.key}>
                <button
                  type="button"
                  className="metric-card h-24 w-full text-left cursor-pointer transition hover:opacity-90 border-0 bg-transparent p-0"
                  onClick={() => onQueueMetricClick?.(metric.key)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={getStatusColor(metric.status)}>{metric.icon}</span>
                    <Text className="text-sm text-text-secondary">{metric.label}</Text>
                  </div>
                  <Text strong className={`text-3xl font-semibold ${getStatusColor(metric.status)}`}>
                    {metric.value}
                  </Text>
                </button>
              </Col>
            ))}
          </Row>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Text className="text-xs text-text-muted">风险与运营</Text>
            <Tag color="default" className="text-[10px] m-0">
              演示
            </Tag>
            <Tag color="warning" className="text-[10px] m-0">
              T+1 / 静态样例
            </Tag>
          </div>
          <Row gutter={16}>
            {RISK_DEMO.map((metric) => (
              <Col span={12} key={metric.key}>
                <button
                  type="button"
                  className="metric-card min-h-[5.5rem] w-full text-left cursor-pointer transition hover:opacity-90 border-0 bg-transparent p-0"
                  onClick={() => onRiskCardClick?.(metric.key)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={getStatusColor(metric.status)}>{metric.icon}</span>
                    <Text className="text-sm text-text-secondary">{metric.label}</Text>
                  </div>
                  <Text strong className={`text-2xl font-semibold ${getStatusColor(metric.status)}`}>
                    {metric.value}
                  </Text>
                  <Text className="text-xs text-text-muted block mt-1">{metric.hint}</Text>
                </button>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </section>
  );
}
