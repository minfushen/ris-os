import { useState } from "react";
import { Typography, Table, Tag, Space, Button, Checkbox, Radio, Input, Divider, Alert, Statistic, Row, Col, Tabs, Card } from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  SyncOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import MLOpsStatusPanel, { MLOpsHistory, useMockMLOpsStatus } from "@/components/MLOpsStatus";
import type { MLOpsStatus } from "@/components/MLOpsStatus";

const { Text } = Typography;
const { TextArea } = Input;

interface LabelingCase {
  id: string;
  scenario: string;
  onlineResult: "pass" | "reject";
  offlineResult: "pass" | "reject";
  deviationType: string;
  applicant: string;
  amount: number;
  status: "pending" | "labeled" | "feedback";
  label?: string;
  notes?: string;
}

// 模拟待标注案件
const LABELING_CASES: LabelingCase[] = [
  {
    id: "TK-123",
    scenario: "授信",
    onlineResult: "reject",
    offlineResult: "pass",
    deviationType: "误杀",
    applicant: "张*明",
    amount: 50000,
    status: "pending",
  },
  {
    id: "TK-124",
    scenario: "支用",
    onlineResult: "pass",
    offlineResult: "reject",
    deviationType: "漏网",
    applicant: "李*华",
    amount: 30000,
    status: "pending",
  },
  {
    id: "TK-125",
    scenario: "授信",
    onlineResult: "reject",
    offlineResult: "pass",
    deviationType: "误杀",
    applicant: "王*强",
    amount: 80000,
    status: "labeled",
    label: "线上正确",
  },
  {
    id: "TK-126",
    scenario: "贷后",
    onlineResult: "reject",
    offlineResult: "pass",
    deviationType: "误杀",
    applicant: "赵*",
    amount: 20000,
    status: "feedback",
    label: "灰黑产",
    notes: "多头借贷异常，建议加入黑名单",
  },
];

interface LabelingFlywheelProps {
  onLabel?: (caseId: string, label: string, notes: string) => void;
}

// 模拟 MLOps 状态
const INITIAL_MLOPS_STATUS: MLOpsStatus = {
  modelId: "model-credit-v3",
  modelName: "信用评分模型 V3",
  phase: "idle",
  progress: 0,
  threshold: 1000,
  currentLabels: 856,
  newLabelsCount: 24,
  lastTrainingTime: "2026-04-15T14:30:00",
  canDeploy: false,
};

// 模拟训练历史
const TRAINING_HISTORY = [
  { time: "2026-04-15 14:30", action: "模型训练完成", user: "系统", result: "success" as const, ks: 31.2 },
  { time: "2026-04-15 14:00", action: "触发训练", user: "张三", result: "success" as const },
  { time: "2026-04-10 09:15", action: "模型训练完成", user: "系统", result: "success" as const, ks: 29.8 },
  { time: "2026-04-05 16:00", action: "模型部署", user: "李四", result: "success" as const, ks: 28.5 },
];

export default function LabelingFlywheel({ onLabel }: LabelingFlywheelProps) {
  const [selectedCase, setSelectedCase] = useState<LabelingCase | null>(null);
  const [label, setLabel] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [feedbackOptions, setFeedbackOptions] = useState<string[]>([]);
  const mlopsStatus = useMockMLOpsStatus(INITIAL_MLOPS_STATUS);

  const pendingCount = LABELING_CASES.filter((c) => c.status === "pending").length;
  const labeledCount = LABELING_CASES.filter((c) => c.status === "labeled").length;
  const feedbackCount = LABELING_CASES.filter((c) => c.status === "feedback").length;

  const columns = [
    {
      title: "案件ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      render: (text: string) => <Text code style={{ fontSize: 11 }}>{text}</Text>,
    },
    {
      title: "场景",
      dataIndex: "scenario",
      key: "scenario",
      width: 60,
      render: (text: string) => <Tag style={{ margin: 0, fontSize: 10 }}>{text}</Tag>,
    },
    {
      title: "线上/线下",
      key: "results",
      width: 100,
      render: (_: unknown, record: LabelingCase) => (
        <Space size={2}>
          <Tag color={record.onlineResult === "pass" ? "green" : "red"} style={{ margin: 0, fontSize: 10 }}>
            {record.onlineResult === "pass" ? "过" : "拒"}
          </Tag>
          <Text type="secondary" style={{ fontSize: 10 }}>/</Text>
          <Tag color={record.offlineResult === "pass" ? "green" : "red"} style={{ margin: 0, fontSize: 10 }}>
            {record.offlineResult === "pass" ? "过" : "拒"}
          </Tag>
        </Space>
      ),
    },
    {
      title: "偏差类型",
      dataIndex: "deviationType",
      key: "deviationType",
      width: 70,
      render: (text: string) => (
        <Text style={{ fontSize: 11, color: text === "误杀" ? "#faad14" : "#ff4d4f" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 70,
      render: (status: string) => {
        const config: Record<string, { color: string; text: string }> = {
          pending: { color: "default", text: "待标注" },
          labeled: { color: "blue", text: "已标注" },
          feedback: { color: "green", text: "已回流" },
        };
        return (
          <Tag color={config[status].color} style={{ margin: 0, fontSize: 10 }}>
            {config[status].text}
          </Tag>
        );
      },
    },
  ];

  const handleSubmitLabel = () => {
    if (selectedCase && label) {
      onLabel?.(selectedCase.id, label, notes);
      setSelectedCase(null);
      setLabel("");
      setNotes("");
      setFeedbackOptions([]);
    }
  };

  return (
    <ModulePageShell
      title="标注飞轮"
      subtitle="专家标注与知识回流"
      breadcrumb={["监控与分析", "标注飞轮"]}
    >
      {/* 统计概览 */}
      <ModuleSectionCard>
        <Row gutter={12}>
          <Col span={6}>
            <Card size="small" style={{ borderRadius: 0 }}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>待标注</Text>}
                value={pendingCount}
                prefix={<WarningOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ fontSize: 20, color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ borderRadius: 0 }}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>已标注</Text>}
                value={labeledCount}
                prefix={<CheckCircleOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ fontSize: 20, color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ borderRadius: 0 }}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>已回流</Text>}
                value={feedbackCount}
                prefix={<SyncOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ fontSize: 20, color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ borderRadius: 0 }}>
              <Statistic
                title={<Text style={{ fontSize: 11 }}>样本增量</Text>}
                value={mlopsStatus.currentLabels}
                suffix={`/ ${mlopsStatus.threshold}`}
                prefix={<RobotOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ fontSize: 16, color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>
      </ModuleSectionCard>

      {/* 主面板 - 使用 Tabs 切换标注和 MLOps */}
      <ModuleSectionCard noPadding>
        <Tabs
          defaultActiveKey="labeling"
          style={{ padding: "0 16px" }}
          items={[
            {
              key: "labeling",
              label: <Text style={{ fontSize: 12 }}>案件标注</Text>,
              children: (
                <div style={{ display: "flex", gap: 12 }}>
                  {/* 左侧：案件列表 */}
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 12 }}>
                        导致偏差的典型案件
                      </Text>
                    </div>
                    <Table
                      dataSource={LABELING_CASES}
                      columns={columns}
                      pagination={false}
                      size="small"
                      rowKey="id"
                      onRow={(record) => ({
                        onClick: () => {
                          setSelectedCase(record);
                          setLabel(record.label || "");
                          setNotes(record.notes || "");
                        },
                        style: {
                          cursor: "pointer",
                          background: selectedCase?.id === record.id ? "#e6f7ff" : "transparent",
                        },
                      })}
                    />
                  </div>

                  {/* 右侧：标注面板 */}
                  <div
                    style={{
                      width: 280,
                      border: "1px solid #d9d9d9",
                      background: "#fafafa",
                      padding: 12,
                    }}
                  >
                    <Text strong style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                      标注面板
                    </Text>
                    {selectedCase ? (
                      <>
                        <div style={{ marginBottom: 12 }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            案件ID: <Text code>{selectedCase.id}</Text>
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            申请人: {selectedCase.applicant} | 金额: ¥{selectedCase.amount.toLocaleString()}
                          </Text>
                        </div>

                        <Divider style={{ margin: "8px 0" }} />

                        {/* 人工定性 */}
                        <div style={{ marginBottom: 16 }}>
                          <Text style={{ fontSize: 11, display: "block", marginBottom: 8 }}>
                            1. 人工定性:
                          </Text>
                          <Radio.Group
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            style={{ width: "100%" }}
                          >
                            <Space direction="vertical" style={{ width: "100%" }}>
                              <Radio value="线上正确" style={{ fontSize: 11 }}>线上正确</Radio>
                              <Radio value="线下结论对" style={{ fontSize: 11 }}>线下结论对</Radio>
                              <Radio value="灰黑产" style={{ fontSize: 11 }}>灰黑产</Radio>
                              <Radio value="边界case" style={{ fontSize: 11 }}>边界case (需讨论)</Radio>
                            </Space>
                          </Radio.Group>
                        </div>

                        <Divider style={{ margin: "8px 0" }} />

                        {/* 知识回流 */}
                        <div style={{ marginBottom: 16 }}>
                          <Text style={{ fontSize: 11, display: "block", marginBottom: 8 }}>
                            2. 知识回流:
                          </Text>
                          <Checkbox.Group
                            value={feedbackOptions}
                            onChange={(values) => setFeedbackOptions(values as string[])}
                            style={{ width: "100%" }}
                          >
                            <Space direction="vertical" style={{ width: "100%" }}>
                              <Checkbox value="blacklist" style={{ fontSize: 11 }}>打入黑样本池</Checkbox>
                              <Checkbox value="feature" style={{ fontSize: 11 }}>更新特征库</Checkbox>
                              <Checkbox value="rule" style={{ fontSize: 11 }}>触发规则优化建议</Checkbox>
                            </Space>
                          </Checkbox.Group>
                        </div>

                        <Divider style={{ margin: "8px 0" }} />

                        {/* 备注 */}
                        <div style={{ marginBottom: 16 }}>
                          <Text style={{ fontSize: 11, display: "block", marginBottom: 8 }}>
                            备注:
                          </Text>
                          <TextArea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="输入标注备注..."
                            rows={2}
                            style={{ fontSize: 11 }}
                          />
                        </div>

                        <Button
                          type="primary"
                          block
                          onClick={handleSubmitLabel}
                          disabled={!label}
                        >
                          提交标注
                        </Button>
                      </>
                    ) : (
                      <Alert
                        type="info"
                        message="请从左侧选择案件进行标注"
                        style={{ borderRadius: 0 }}
                      />
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "mlops",
              label: <Text style={{ fontSize: 12 }}>MLOps 状态</Text>,
              children: (
                <div>
                  <MLOpsStatusPanel status={mlopsStatus} />
                  <MLOpsHistory history={TRAINING_HISTORY} />
                </div>
              ),
            },
          ]}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
