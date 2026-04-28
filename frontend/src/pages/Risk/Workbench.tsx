/**
 * 预警核查工作台 - 使用真实数据
 */

import { useState, useEffect } from "react";
import {
  Typography,
  Tag,
  Button,
  Space,
  Alert as AntdAlert,
  Card,
  Descriptions,
  Collapse,
  Timeline,
  Spin,
  message,
} from "antd";
import {
  WarningOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import { api } from "@/api/client";
import type { Alert, RiskAssessment } from "@/types/enterprise";
import { RISK_LEVEL_COLORS, RISK_LEVEL_TEXT, DIMENSION_NAMES } from "@/types/qcc";

const { Text, Title } = Typography;

export default function Workbench() {
  const [searchParams] = useSearchParams();
  const alertId = searchParams.get("alert_id");

  // 状态
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(false);

  // 加载预警列表
  useEffect(() => {
    loadAlerts();
  }, []);

  // 如果有 alert_id，自动选中
  useEffect(() => {
    if (alertId && alerts.length > 0) {
      const alert = alerts.find((a) => a.id === Number(alertId));
      if (alert) {
        handleSelectAlert(alert);
      }
    }
  }, [alertId, alerts]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlertList({ status: "active", limit: 50 });
      setAlerts(data);
    } catch (error) {
      message.error("加载预警列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlert = async (alert: Alert) => {
    setSelectedAlert(alert);
    setAssessmentLoading(true);
    try {
      // 获取最新的风险评估
      const data = await api.getLatestAssessment(alert.enterprise_id);
      setAssessment(data);
    } catch (error) {
      message.error("加载风险评估失败");
    } finally {
      setAssessmentLoading(false);
    }
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert) return;

    try {
      await api.resolveAlert(selectedAlert.id);
      message.success("预警已解决");
      await loadAlerts();
      setSelectedAlert(null);
      setAssessment(null);
    } catch (error) {
      message.error("解决预警失败");
    }
  };

  return (
    <ModulePageShell title="预警核查工作台" subtitle="查看预警详情并进行处置">
      <Spin spinning={loading}>
        <div className="grid grid-cols-12 gap-4">
          {/* 左侧：预警队列 */}
          <div className="col-span-4">
            <ModuleSectionCard title="预警队列" subtitle={`共 ${alerts.length} 条`}>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <Card
                    key={alert.id}
                    size="small"
                    hoverable
                    className={`cursor-pointer ${
                      selectedAlert?.id === alert.id ? "border-blue-500 border-2" : ""
                    }`}
                    onClick={() => handleSelectAlert(alert)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Tag color={RISK_LEVEL_COLORS[alert.alert_level]}>
                        {RISK_LEVEL_TEXT[alert.alert_level]}
                      </Tag>
                      <Text type="secondary" className="text-xs">
                        {new Date(alert.triggered_at).toLocaleDateString("zh-CN")}
                      </Text>
                    </div>
                    <Text strong className="block mb-1">
                      {alert.company_name}
                    </Text>
                    <Text type="secondary" className="text-xs">
                      {alert.alert_type}
                    </Text>
                  </Card>
                ))}
              </div>
            </ModuleSectionCard>
          </div>

          {/* 右侧：预警详情 */}
          <div className="col-span-8">
            {selectedAlert ? (
              <Spin spinning={assessmentLoading}>
                {/* 基本信息 */}
                <ModuleSectionCard title="预警基本信息" className="mb-4">
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="预警ID">{selectedAlert.id}</Descriptions.Item>
                    <Descriptions.Item label="企业名称">
                      {selectedAlert.company_name}
                    </Descriptions.Item>
                    <Descriptions.Item label="预警等级">
                      <Tag color={RISK_LEVEL_COLORS[selectedAlert.alert_level]}>
                        {RISK_LEVEL_TEXT[selectedAlert.alert_level]}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="预警类型">
                      {selectedAlert.alert_type}
                    </Descriptions.Item>
                    <Descriptions.Item label="预警来源">
                      {selectedAlert.alert_source}
                    </Descriptions.Item>
                    <Descriptions.Item label="触发时间">
                      {new Date(selectedAlert.triggered_at).toLocaleString("zh-CN")}
                    </Descriptions.Item>
                  </Descriptions>
                </ModuleSectionCard>

                {/* 风险评估详情 */}
                {assessment && (
                  <>
                    <ModuleSectionCard title="风险评估详情" className="mb-4">
                      <AntdAlert
                        type={assessment.overall_risk === "CRITICAL" ? "error" : "warning"}
                        message={`整体风险等级：${RISK_LEVEL_TEXT[assessment.overall_risk]}`}
                        icon={
                          assessment.overall_risk === "CRITICAL" ? (
                            <WarningOutlined />
                          ) : (
                            <CheckCircleOutlined />
                          )
                        }
                        showIcon
                        className="mb-4"
                      />

                      {/* 9 维度评估 */}
                      <Title level={5}>9 维度风险评估</Title>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {Object.entries(assessment.assessment_data.dimensions).map(
                          ([key, dimension]: [string, any]) => {
                            if (!dimension) return null;
                            const dimName = DIMENSION_NAMES[key] || key;
                            return (
                              <Card key={key} size="small">
                                <div className="flex items-center justify-between mb-2">
                                  <Text strong>{dimName}</Text>
                                  <Tag color={RISK_LEVEL_COLORS[dimension.level]}>
                                    {RISK_LEVEL_TEXT[dimension.level]}
                                  </Tag>
                                </div>
                                <Text type="secondary" className="text-xs">
                                  风险分数：{dimension.score.toFixed(1)}
                                </Text>
                              </Card>
                            );
                          }
                        )}
                      </div>

                      {/* 风险类别 */}
                      <Title level={5}>风险类别（18类）</Title>
                      <Collapse accordion className="mb-4">
                        {assessment.assessment_data.risk_categories.map(
                          (category: any, idx: number) => (
                            <Collapse.Panel
                              key={idx}
                              header={
                                <div className="flex items-center gap-2">
                                  <Tag color={RISK_LEVEL_COLORS[category.level]}>
                                    {RISK_LEVEL_TEXT[category.level]}
                                  </Tag>
                                  <span>{category.category}</span>
                                </div>
                              }
                            >
                              <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="风险描述">
                                  {category.description}
                                </Descriptions.Item>
                                <Descriptions.Item label="证据内容">
                                  {category.evidence}
                                </Descriptions.Item>
                                <Descriptions.Item label="供应链影响">
                                  {category.impact}
                                </Descriptions.Item>
                                <Descriptions.Item label="处置建议">
                                  {category.suggestion}
                                </Descriptions.Item>
                                <Descriptions.Item label="响应时间">
                                  {category.response_time}
                                </Descriptions.Item>
                              </Descriptions>
                            </Collapse.Panel>
                          )
                        )}
                      </Collapse>

                      {/* 证据链 */}
                      <Title level={5}>证据链</Title>
                      <Timeline className="mb-4">
                        {assessment.assessment_data.evidence_chain.map(
                          (evidence: any, idx: number) => (
                            <Timeline.Item key={idx} color="blue">
                              <div>
                                <Text strong>{evidence.data_source}</Text>
                                <br />
                                <Text type="secondary" className="text-xs">
                                  更新时间：{evidence.update_time} | 可信度：
                                  {evidence.credibility}
                                </Text>
                                <br />
                                <Text className="text-sm">{evidence.content}</Text>
                              </div>
                            </Timeline.Item>
                          )
                        )}
                      </Timeline>
                    </ModuleSectionCard>

                    {/* 处置操作 */}
                    <ModuleSectionCard title="处置操作">
                      <Space>
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          onClick={handleResolveAlert}
                        >
                          解决预警
                        </Button>
                        <Button icon={<FileTextOutlined />}>生成报告</Button>
                        <Button icon={<DownloadOutlined />}>导出证据链</Button>
                      </Space>
                    </ModuleSectionCard>
                  </>
                )}
              </Spin>
            ) : (
              <AntdAlert
                type="info"
                message="请从左侧预警队列中选择一条预警查看详情"
                showIcon
              />
            )}
          </div>
        </div>
      </Spin>
    </ModulePageShell>
  );
}
