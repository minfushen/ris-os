/**
 * 预警核查工作台 — 处置闭环核心操作页
 *
 * 流程：选中预警 → 查看风险评估详情 → 执行处置操作
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
  Divider,
  Row,
  Col,
} from "antd";
import {
  WarningOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ArrowRightOutlined,
  ControlOutlined,
  ExperimentOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useSearchParams, Link } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import DemoFlowNav from "@/components/DemoFlowNav";
import { api } from "@/api/client";
import type { Alert, RiskAssessment } from "@/types/enterprise";
import { RISK_LEVEL_COLORS, RISK_LEVEL_TEXT, DIMENSION_NAMES } from "@/types/qcc";

const { Text, Title } = Typography;

export default function Workbench() {
  const [searchParams] = useSearchParams();
  const alertId = searchParams.get("alert_id");

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

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
    } catch {
      message.error("加载预警列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlert = async (alert: Alert) => {
    setSelectedAlert(alert);
    setAssessment(null);
    setAssessmentLoading(true);
    try {
      const data = await api.getLatestAssessment(alert.enterprise_id);
      setAssessment(data);
    } catch {
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
    } catch {
      message.error("解决预警失败");
    }
  };

  /** 按预警类型映射策略优化建议，串联操作演示与策略模型功能 */
  function getStrategyLinks(alertType: string) {
    const map: Record<string, { pattern: string; patternId: string; rule: string; rulePath: string; tuneCase: string; tuneId: string; backtestHint: string }> = {
      "资金挪用": { pattern: "FP-01 · 资金挪用 · 对公回流个人账户", patternId: "FP-01", rule: "对公回流个人账户 · 金额阈值 30万", rulePath: "/strategy/rules", tuneCase: "RC-04 对公回流阈值 50→30万", tuneId: "RC-04", backtestHint: "建议回溯该阈值分层（按季节/行业）优化效果" },
      "税报断档": { pattern: "FP-03 · 税报粉饰 · 申报收入骤增", patternId: "FP-03", rule: "税报断档天数阈值 30天", rulePath: "/strategy/rules", tuneCase: "RC-01 断档天数 45→30天", tuneId: "RC-01", backtestHint: "建议评估收紧阈值后有效率变化" },
      "多头共债": { pattern: "FP-02 · 团伙共债 · 设备/地址簇", patternId: "FP-02", rule: "多头余额环比跳升 38%", rulePath: "/strategy/rules", tuneCase: "RC-02 制造业多头阈值 35%→38%", tuneId: "RC-02", backtestHint: "建议回溯各行业分层阈值效果" },
      "经营空心化": { pattern: "FP-05 · 经营空心化 · 社保人数骤降", patternId: "FP-05", rule: "社保人数环比降幅阈值 30%", rulePath: "/strategy/rules", tuneCase: "无直接关联调优案例", tuneId: "", backtestHint: "建议评估该规则在不同行业的误报率" },
      "司法风险": { pattern: "FP-04 · 关联担保链断裂", patternId: "FP-04", rule: "被执行/限高记录权重 0.22", rulePath: "/strategy/rules", tuneCase: "RC-05 司法权重 0.15→0.22", tuneId: "RC-05", backtestHint: "建议回溯权重提升后有效率与误报变化" },
    };

    for (const [key, val] of Object.entries(map)) {
      if (alertType.includes(key)) return val;
    }
    return { pattern: "暂无匹配模式", patternId: "", rule: "暂无匹配规则", rulePath: "/strategy/rules", tuneCase: "暂无关联调优案例", tuneId: "", backtestHint: "建议在规则页面搜索相关阈值配置" };
  }

  return (
    <ModulePageShell title="预警核查工作台" subtitle="查看预警详情、风险评估与执行处置">
      <Spin spinning={loading}>
        <div className="grid grid-cols-12 gap-4">
          {/* 左侧：预警队列 */}
          <div className="col-span-4">
            <ModuleSectionCard title="预警队列" subtitle={`共 ${alerts.length} 条`}>
              <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
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
                {alerts.length === 0 && (
                  <AntdAlert type="info" message="暂无活跃预警" showIcon />
                )}
              </div>
            </ModuleSectionCard>
          </div>

          {/* 右侧：详情 + 处置 */}
          <div className="col-span-8">
            {selectedAlert ? (
              <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
                {/* 基本信息 */}
                <ModuleSectionCard title="预警基本信息">
                  <Descriptions bordered column={2} size="small">
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
                <Spin spinning={assessmentLoading}>
                  {assessment ? (
                    <ModuleSectionCard title="风险评估详情">
                      <AntdAlert
                        type={assessment.overall_risk === "CRITICAL" ? "error" : "warning"}
                        message={`整体风险等级：${RISK_LEVEL_TEXT[assessment.overall_risk]}`}
                        icon={assessment.overall_risk === "CRITICAL" ? <WarningOutlined /> : <CheckCircleOutlined />}
                        showIcon
                        className="mb-3"
                      />

                      {/* 9 维度评估 */}
                      <Title level={5}>9 维度风险评估</Title>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {Object.entries(assessment.assessment_data.dimensions).map(
                          ([key, dimension]: [string, any]) => {
                            if (!dimension) return null;
                            return (
                              <Card key={key} size="small">
                                <div className="flex items-center justify-between mb-1">
                                  <Text className="text-xs">{DIMENSION_NAMES[key] || key}</Text>
                                  <Tag color={RISK_LEVEL_COLORS[dimension.level]} className="text-[10px]">
                                    {RISK_LEVEL_TEXT[dimension.level]}
                                  </Tag>
                                </div>
                                <Text type="secondary" className="text-xs">
                                  分数：{dimension.score.toFixed(1)}
                                </Text>
                              </Card>
                            );
                          }
                        )}
                      </div>

                      {/* 风险类别 */}
                      <Title level={5}>风险类别（18 类）</Title>
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
                                <Descriptions.Item label="风险描述">{category.description}</Descriptions.Item>
                                <Descriptions.Item label="证据内容">{category.evidence}</Descriptions.Item>
                                <Descriptions.Item label="供应链影响">{category.impact}</Descriptions.Item>
                                <Descriptions.Item label="处置建议">{category.suggestion}</Descriptions.Item>
                                <Descriptions.Item label="响应时间">{category.response_time}</Descriptions.Item>
                              </Descriptions>
                            </Collapse.Panel>
                          )
                        )}
                      </Collapse>

                      {/* 证据链 */}
                      <Title level={5}>证据链</Title>
                      <Timeline>
                        {assessment.assessment_data.evidence_chain.map(
                          (evidence: any, idx: number) => (
                            <Timeline.Item key={idx} color="blue">
                              <div>
                                <Text strong>{evidence.data_source}</Text>
                                <br />
                                <Text type="secondary" className="text-xs">
                                  更新：{evidence.update_time} | 可信度：{evidence.credibility}
                                </Text>
                                <br />
                                <Text className="text-sm">{evidence.content}</Text>
                              </div>
                            </Timeline.Item>
                          )
                        )}
                      </Timeline>
                    </ModuleSectionCard>
                  ) : (
                    !assessmentLoading && (
                      <AntdAlert type="warning" message="该预警暂无风险评估数据" showIcon />
                    )
                  )}
                </Spin>

                <Divider />

                {/* 处置操作 */}
                <ModuleSectionCard title="处置操作">
                  <Space wrap>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={handleResolveAlert}
                      size="large"
                    >
                      解决预警
                    </Button>
                    <Button icon={<FileTextOutlined />}>生成处置报告</Button>
                    <Button icon={<DownloadOutlined />}>导出证据链</Button>
                  </Space>
                </ModuleSectionCard>

                {/* 关联策略优化 — 串联预警 → 策略/模型模块 */}
                <ModuleSectionCard title="关联策略优化">
                  {(() => {
                    const links = getStrategyLinks(selectedAlert.alert_type);
                    return (
                      <Row gutter={[12, 12]}>
                        <Col xs={24} sm={12}>
                          <Card size="small">
                            <div className="space-y-1">
                              <Text type="secondary" className="text-xs">
                                <SafetyCertificateOutlined className="mr-1" />
                                命中欺诈模式
                              </Text>
                              <br />
                              {links.patternId ? (
                                <Link to={`/knowledge/fraud-patterns?pattern=${links.patternId}`}>
                                  <Text className="text-sm text-blue-600">{links.pattern}</Text>
                                  <ArrowRightOutlined className="text-xs ml-1 text-blue-400" />
                                </Link>
                              ) : (
                                <Text className="text-sm">{links.pattern}</Text>
                              )}
                            </div>
                          </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Card size="small">
                            <div className="space-y-1">
                              <Text type="secondary" className="text-xs">
                                <ThunderboltOutlined className="mr-1" />
                                触发规则
                              </Text>
                              <br />
                              <Link to={links.rulePath}>
                                <Text className="text-sm text-blue-600">{links.rule}</Text>
                                <ArrowRightOutlined className="text-xs ml-1 text-blue-400" />
                              </Link>
                            </div>
                          </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Card size="small">
                            <div className="space-y-1">
                              <Text type="secondary" className="text-xs">
                                <ExperimentOutlined className="mr-1" />
                                关联调优案例
                              </Text>
                              <br />
                              {links.tuneId ? (
                                <Link to={`/knowledge/rule-cases?case=${links.tuneId}`}>
                                  <Text className="text-sm text-blue-600">{links.tuneCase}</Text>
                                  <ArrowRightOutlined className="text-xs ml-1 text-blue-400" />
                                </Link>
                              ) : (
                                <Text className="text-sm">{links.tuneCase}</Text>
                              )}
                            </div>
                          </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Card size="small">
                            <div className="space-y-1">
                              <Text type="secondary" className="text-xs">
                                <HistoryOutlined className="mr-1" />
                                回溯建议
                              </Text>
                              <br />
                              <Link to="/strategy/backtest">
                                <Text className="text-sm text-blue-600">{links.backtestHint}</Text>
                                <ArrowRightOutlined className="text-xs ml-1 text-blue-400" />
                              </Link>
                            </div>
                          </Card>
                        </Col>
                      </Row>
                    );
                  })()}
                </ModuleSectionCard>
              </div>
            ) : (
              <AntdAlert
                type="info"
                message="请从左侧预警队列中选择一条预警"
                description="选中后将加载风险评估详情"
                showIcon
              />
            )}
          </div>
        </div>
      </Spin>

      <DemoFlowNav />
    </ModulePageShell>
  );
}
