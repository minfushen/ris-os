import { useState } from "react";
import { Typography, Table, Tag, Space, Progress, Divider, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

interface O2OMetric {
  key: string;
  metric: string;
  expected: string;
  actual: string;
  deviation: number;
  status: "normal" | "warning" | "critical";
}

interface CaseItem {
  id: string;
  onlineResult: "pass" | "reject";
  offlineResult: "pass" | "reject";
  deviation: string;
  applicant?: string;
}

// 模拟 O2O 指标数据
const O2O_METRICS: O2OMetric[] = [
  { key: "1", metric: "自动审批率", expected: "42.5%", actual: "35.0%", deviation: -7.5, status: "critical" },
  { key: "2", metric: "平均决策耗时", expected: "1.2s", actual: "1.5s", deviation: 25, status: "warning" },
  { key: "3", metric: "欺诈拦截率", expected: "3.2%", actual: "3.0%", deviation: -6.25, status: "normal" },
  { key: "4", metric: "人工复核率", expected: "15.0%", actual: "18.5%", deviation: 23.3, status: "warning" },
];

// 模拟异常案件
const CASE_DATA: CaseItem[] = [
  { id: "TK-123", onlineResult: "reject", offlineResult: "pass", deviation: "线上拒/线下过", applicant: "张*" },
  { id: "TK-124", onlineResult: "pass", offlineResult: "reject", deviation: "线上过/线下拒", applicant: "李*" },
  { id: "TK-125", onlineResult: "reject", offlineResult: "pass", deviation: "线上拒/线下过", applicant: "王*" },
  { id: "TK-126", onlineResult: "reject", offlineResult: "pass", deviation: "线上拒/线下过", applicant: "赵*" },
  { id: "TK-127", onlineResult: "pass", offlineResult: "reject", deviation: "线上过/线下拒", applicant: "陈*" },
];

// 计算整体一致性得分
function calculateScore(metrics: O2OMetric[]): number {
  const weights = { "自动审批率": 0.4, "平均决策耗时": 0.2, "欺诈拦截率": 0.25, "人工复核率": 0.15 };
  let totalScore = 100;
  metrics.forEach((m) => {
    const weight = weights[m.metric as keyof typeof weights] || 0.1;
    const penalty = Math.abs(m.deviation) * weight;
    totalScore -= penalty;
  });
  return Math.max(0, Math.round(totalScore * 10) / 10);
}

export default function O2OMonitor() {
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);

  const overallScore = calculateScore(O2O_METRICS);
  const isCritical = overallScore < 90;

  const metricColumns = [
    {
      title: "核心指标",
      dataIndex: "metric",
      key: "metric",
      width: 120,
      render: (text: string) => <Text strong style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: "预期(离线)",
      dataIndex: "expected",
      key: "expected",
      width: 100,
      render: (text: string) => <Text style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: "线上(实际)",
      dataIndex: "actual",
      key: "actual",
      width: 100,
      render: (text: string) => <Text style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: "偏差",
      dataIndex: "deviation",
      key: "deviation",
      width: 80,
      render: (deviation: number, record: O2OMetric) => {
        const color = record.status === "critical" ? "#ff4d4f" : record.status === "warning" ? "#faad14" : "#52c41a";
        return (
          <Text style={{ fontSize: 12, color }}>
            {deviation > 0 ? "+" : ""}{deviation}%
            {record.status === "critical" && " 🔴"}
          </Text>
        );
      },
    },
  ];

  const caseColumns = [
    {
      title: "案件ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (text: string) => <Text code style={{ fontSize: 11 }}>{text}</Text>,
    },
    {
      title: "线上结果",
      dataIndex: "onlineResult",
      key: "onlineResult",
      width: 80,
      render: (result: "pass" | "reject") => (
        <Tag color={result === "pass" ? "green" : "red"} style={{ margin: 0 }}>
          {result === "pass" ? "通过" : "拒绝"}
        </Tag>
      ),
    },
    {
      title: "线下结果",
      dataIndex: "offlineResult",
      key: "offlineResult",
      width: 80,
      render: (result: "pass" | "reject") => (
        <Tag color={result === "pass" ? "green" : "red"} style={{ margin: 0 }}>
          {result === "pass" ? "通过" : "拒绝"}
        </Tag>
      ),
    },
    {
      title: "偏差类型",
      dataIndex: "deviation",
      key: "deviation",
      width: 120,
      render: (text: string) => (
        <Text style={{ fontSize: 11, color: "#ff4d4f" }}>{text}</Text>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 60,
      render: (_: unknown, record: CaseItem) => (
        <Button
          type="link"
          size="small"
          icon={<SearchOutlined />}
          onClick={() => setSelectedCase(record)}
          style={{ fontSize: 11 }}
        >
          查单
        </Button>
      ),
    },
  ];

  return (
    <ModulePageShell
      title="O2O一致性监控"
      subtitle="线上线下一致性检查"
      breadcrumb={["监控与分析", "O2O一致性"]}
    >
      {/* 整体一致性得分 */}
      <ModuleSectionCard title="⚖️ 整体一致性得分">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ textAlign: "center" }}>
            <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
              一致性得分
            </Text>
            <Text
              strong
              style={{
                fontSize: 32,
                color: isCritical ? "#ff4d4f" : "#52c41a",
              }}
            >
              {overallScore}
            </Text>
            {isCritical && (
              <Tag color="red" style={{ marginLeft: 8 }}>
                🔴 异常
              </Tag>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <Progress
              percent={overallScore}
              strokeColor={isCritical ? "#ff4d4f" : "#52c41a"}
              showInfo={false}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>
              阈值: 90分 | 当前: {overallScore}分 | 状态: {isCritical ? "异常" : "正常"}
            </Text>
          </div>
        </div>
      </ModuleSectionCard>

      {/* 指标对比表 */}
      <ModuleSectionCard title="📊 线上线下一致性对比">
        <Table
          dataSource={O2O_METRICS}
          columns={metricColumns}
          pagination={false}
          size="small"
          rowKey="key"
        />
      </ModuleSectionCard>

      {/* 异常案件抽检 */}
      <ModuleSectionCard title="✍️ 异常案件抽检与标注回流">
        <div style={{ display: "flex", gap: 12 }}>
          {/* 左侧：案件列表 */}
          <div style={{ flex: 1 }}>
            <Table
              dataSource={CASE_DATA}
              columns={caseColumns}
              pagination={false}
              size="small"
              rowKey="id"
              onRow={(record) => ({
                onClick: () => setSelectedCase(record),
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
            {selectedCase ? (
              <>
                <Text strong style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                  标注面板 - {selectedCase.id}
                </Text>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    申请人: {selectedCase.applicant}
                  </Text>
                </div>

                <Divider style={{ margin: "8px 0" }} />

                <Text style={{ fontSize: 11, display: "block", marginBottom: 8 }}>
                  1. 人工定性:
                </Text>
                <Space direction="vertical" size={4}>
                  <Button size="small" block style={{ textAlign: "left" }}>
                    ○ 线上正确
                  </Button>
                  <Button size="small" block style={{ textAlign: "left" }}>
                    ○ 线下结论对
                  </Button>
                  <Button size="small" block style={{ textAlign: "left" }}>
                    ○ 灰黑产
                  </Button>
                </Space>

                <Divider style={{ margin: "12px 0" }} />

                <Text style={{ fontSize: 11, display: "block", marginBottom: 8 }}>
                  2. 知识回流:
                </Text>
                <Space direction="vertical" size={4}>
                  <Button size="small" block style={{ textAlign: "left" }}>
                    ☐ 打入黑样本池
                  </Button>
                  <Button size="small" block style={{ textAlign: "left" }}>
                    ☐ 更新特征库
                  </Button>
                </Space>

                <Button type="primary" size="small" block style={{ marginTop: 16 }}>
                  提交标注
                </Button>
              </>
            ) : (
              <Text type="secondary" style={{ fontSize: 11 }}>
                请从左侧选择案件进行标注
              </Text>
            )}
          </div>
        </div>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
