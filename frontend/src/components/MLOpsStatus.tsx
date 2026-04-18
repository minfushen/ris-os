import { useState, useEffect } from "react";
import { Card, Typography, Tag, Space, Button, Progress, Descriptions, Timeline, Statistic, Row, Col, Alert } from "antd";
import {
  RobotOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export type MLOpsPhase =
  | "idle"
  | "sample_preparation"
  | "training"
  | "evaluation"
  | "deployment_ready"
  | "deployed"
  | "failed";

export interface MLOpsStatus {
  modelId: string;
  modelName: string;
  phase: MLOpsPhase;
  progress: number;
  lastTrainingTime?: string;
  sampleCount?: number;
  newLabelsCount?: number;
  threshold: number;
  currentLabels: number;
  ks?: number;
  auc?: number;
  accuracy?: number;
  previousKs?: number;
  error?: string;
  canDeploy: boolean;
}

interface MLOpsStatusPanelProps {
  status: MLOpsStatus;
  onTriggerTraining?: () => void;
  onDeploy?: () => void;
}

const PHASE_CONFIG: Record<MLOpsPhase, { label: string; color: string; icon: React.ReactNode }> = {
  idle: { label: "待机", color: "default", icon: <ClockCircleOutlined /> },
  sample_preparation: { label: "样本准备", color: "processing", icon: <DatabaseOutlined /> },
  training: { label: "模型训练", color: "processing", icon: <SyncOutlined spin /> },
  evaluation: { label: "模型评估", color: "processing", icon: <LineChartOutlined /> },
  deployment_ready: { label: "待部署", color: "warning", icon: <ThunderboltOutlined /> },
  deployed: { label: "已部署", color: "success", icon: <CheckCircleOutlined /> },
  failed: { label: "失败", color: "error", icon: <CloseCircleOutlined /> },
};

export default function MLOpsStatusPanel({ status, onTriggerTraining, onDeploy }: MLOpsStatusPanelProps) {
  const progressPercent = Math.round((status.currentLabels / status.threshold) * 100);
  const canTriggerTraining = status.currentLabels >= status.threshold && status.phase === "idle";

  return (
    <Card
      size="small"
      title={
        <Space>
          <RobotOutlined style={{ color: "#6f8f95" }} />
          <Text strong style={{ fontSize: 13 }}>
            MLOps 状态
          </Text>
          <Tag color={PHASE_CONFIG[status.phase].color} icon={PHASE_CONFIG[status.phase].icon}>
            {PHASE_CONFIG[status.phase].label}
          </Tag>
        </Space>
      }
      extra={
        status.phase === "deployment_ready" && onDeploy ? (
          <Button size="small" type="primary" onClick={onDeploy}>
            部署模型
          </Button>
        ) : canTriggerTraining && onTriggerTraining ? (
          <Button size="small" type="primary" onClick={onTriggerTraining}>
            触发训练
          </Button>
        ) : null
      }
      style={{ borderRadius: 0 }}
    >
      {/* 样本增量进度 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 12 }}>标注样本增量</Text>
          <Text style={{ fontSize: 12 }}>
            {status.currentLabels} / {status.threshold} (阈值)
          </Text>
        </div>
        <Progress
          percent={Math.min(progressPercent, 100)}
          strokeColor={progressPercent >= 100 ? "#52c41a" : "#1890ff"}
          showInfo={false}
        />
        {status.newLabelsCount !== undefined && (
          <Text type="secondary" style={{ fontSize: 11 }}>
            本次新增 {status.newLabelsCount} 条标注
          </Text>
        )}
      </div>

      {/* 训练进度 */}
      {status.phase !== "idle" && status.phase !== "deployed" && (
        <div style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
            当前阶段进度
          </Text>
          <Progress
            percent={Math.round(status.progress)}
            status={status.phase === "failed" ? "exception" : "active"}
          />
        </div>
      )}

      {/* 错误信息 */}
      {status.phase === "failed" && status.error && (
        <Alert
          type="error"
          showIcon
          message="训练失败"
          description={status.error}
          style={{ marginBottom: 16, borderRadius: 0 }}
        />
      )}

      {/* 模型指标 */}
      {(status.phase === "deployment_ready" || status.phase === "deployed") && status.ks !== undefined && (
        <Row gutter={12} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Statistic
              title={<Text style={{ fontSize: 11 }}>KS 值</Text>}
              value={status.ks}
              suffix="%"
              valueStyle={{
                fontSize: 18,
                color: status.ks >= 30 ? "#52c41a" : status.ks >= 20 ? "#faad14" : "#ff4d4f",
              }}
            />
            {status.previousKs !== undefined && (
              <Text type="secondary" style={{ fontSize: 10 }}>
                上版: {status.previousKs}%
                {status.ks > status.previousKs && (
                  <Tag color="green" style={{ marginLeft: 4, fontSize: 10 }}>↑</Tag>
                )}
              </Text>
            )}
          </Col>
          <Col span={8}>
            <Statistic
              title={<Text style={{ fontSize: 11 }}>AUC</Text>}
              value={status.auc}
              valueStyle={{ fontSize: 18 }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title={<Text style={{ fontSize: 11 }}>准确率</Text>}
              value={status.accuracy}
              suffix="%"
              valueStyle={{ fontSize: 18 }}
            />
          </Col>
        </Row>
      )}

      {/* 详细信息 */}
      <Descriptions size="small" column={2}>
        <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 11 }}>模型ID</Text>}>
          <Text code style={{ fontSize: 11 }}>{status.modelId}</Text>
        </Descriptions.Item>
        <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 11 }}>模型名称</Text>}>
          <Text style={{ fontSize: 11 }}>{status.modelName}</Text>
        </Descriptions.Item>
        {status.sampleCount && (
          <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 11 }}>训练样本</Text>}>
            <Text style={{ fontSize: 11 }}>{status.sampleCount.toLocaleString()}</Text>
          </Descriptions.Item>
        )}
        {status.lastTrainingTime && (
          <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 11 }}>上次训练</Text>}>
            <Text style={{ fontSize: 11 }}>
              {new Date(status.lastTrainingTime).toLocaleString("zh-CN")}
            </Text>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}

// MLOps 历史记录组件
interface MLOpsHistoryItem {
  time: string;
  action: string;
  user?: string;
  result: "success" | "failed";
  ks?: number;
}

interface MLOpsHistoryProps {
  history: MLOpsHistoryItem[];
}

export function MLOpsHistory({ history }: MLOpsHistoryProps) {
  return (
    <Card
      size="small"
      title={
        <Space>
          <ClockCircleOutlined style={{ color: "#6f8f95" }} />
          <Text strong style={{ fontSize: 13 }}>
            训练历史
          </Text>
        </Space>
      }
      style={{ borderRadius: 0, marginTop: 12 }}
    >
      <Timeline
        items={history.map((item) => ({
          color: item.result === "success" ? "green" : "red",
          children: (
            <div>
              <Text style={{ fontSize: 11 }}>{item.time}</Text>
              <br />
              <Text style={{ fontSize: 12 }}>{item.action}</Text>
              {item.ks !== undefined && (
                <Tag color="blue" style={{ marginLeft: 8, fontSize: 10 }}>
                  KS: {item.ks}%
                </Tag>
              )}
              {item.user && (
                <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
                  by {item.user}
                </Text>
              )}
            </div>
          ),
        }))}
      />
    </Card>
  );
}

// 模拟 MLOps 状态的 Hook
export function useMockMLOpsStatus(initialStatus: MLOpsStatus) {
  const [status, setStatus] = useState<MLOpsStatus>(initialStatus);

  useEffect(() => {
    if (status.phase === "idle" || status.phase === "deployed" || status.phase === "failed") {
      return;
    }

    const interval = setInterval(() => {
      setStatus((prev) => {
        const newProgress = prev.progress + Math.random() * 8 + 3;

        if (newProgress >= 100) {
          const phases: MLOpsPhase[] = [
            "sample_preparation",
            "training",
            "evaluation",
            "deployment_ready",
          ];
          const currentIndex = phases.indexOf(prev.phase);

          if (currentIndex === phases.length - 1) {
            return {
              ...prev,
              phase: "deployment_ready",
              progress: 100,
              ks: 32.5 + Math.random() * 5,
              auc: 0.85 + Math.random() * 0.05,
              accuracy: 88 + Math.random() * 5,
              canDeploy: true,
            };
          }

          const nextPhase = phases[currentIndex + 1];
          return {
            ...prev,
            phase: nextPhase,
            progress: 0,
          };
        }

        return {
          ...prev,
          progress: newProgress,
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [status.phase]);

  return status;
}
