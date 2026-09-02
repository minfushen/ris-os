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
  Skeleton,
  message,
  Divider,
  Row,
  Col,
  Drawer,
  Timeline,
} from "antd";
import {
  WarningOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ArrowRightOutlined,
  ExperimentOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useSearchParams, Link } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import DemoFlowNav from "@/components/DemoFlowNav";
import EvidenceChain from "@/components/EvidenceChain";
import { api } from "@/api/client";
import type { Alert, RiskAssessment } from "@/types/enterprise";
import type { DimensionRisk, RiskCategory, EvidenceItem } from "@/types/qcc";
import { RISK_LEVEL_COLORS, RISK_LEVEL_TEXT, DIMENSION_NAMES } from "@/types/qcc";

const { Text, Title } = Typography;

/** 演示工单（面试演示口径）：无选中预警时默认展示，全部为内置常量 */
const DEMO_ALERT = {
  company: "恒力机械制造有限公司",
  product: "惠快贷 · 小微企业流水贷",
  exposure: "480 万元",
  manager: "张明（RM001）",
  industry: "制造业",
  level: "黄灯",
  type: "多头共债",
  rule: "RULE_023 · 多头借贷跳升",
  ruleDetail: "近 90 天多头申请机构数环比增幅 ≥ 35%（当前 38%，阈值 35%）",
  triggeredAt: "2026-04-29 09:12",
  riskProfile: [
    "近3个月涉诉3起，均为买卖合同纠纷，涉诉金额合计约 120 万元",
    "近 90 天新增多头借贷申请 5 笔，集中于 4 月中旬",
    "对公账户结算量环比下降 18%，下游回款周期由 45 天延长至 66 天",
    "企业征信查询次数近 30 天 12 次，高于同行业 75 分位",
  ],
};

const DEMO_DISPOSAL_ACTIONS = ["电话核实", "上门走访", "要求增信", "提前回收"];

const DEMO_DISPOSAL_RECORDS = [
  { time: "2026-04-29 09:13", text: "预警归因 Agent 生成归因结论（置信度 87%），处置建议已推送客户经理" },
  { time: "2026-04-29 09:15", text: "张明 认领工单，计划 24 小时内完成电话核实" },
  { time: "2026-04-28 16:40", text: "策略效果追踪：同规则近 30 天 FP 率 22.4%，调优建议已提交策略调优 Agent" },
];

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

  /** 导出证据链为 Markdown 报告 [spec-RISK-6] */
  const handleExportEvidence = () => {
    if (!selectedAlert || !assessment) return;
    const chain: EvidenceItem[] = assessment.assessment_data.evidence_chain ?? [];
    const lines: string[] = [
      `# 预警证据链报告`,
      ``,
      `- 预警ID：${selectedAlert.id}`,
      `- 企业名称：${selectedAlert.company_name}`,
      `- 预警类型：${selectedAlert.alert_type}`,
      `- 预警等级：${RISK_LEVEL_TEXT[selectedAlert.alert_level]}`,
      `- 触发时间：${new Date(selectedAlert.triggered_at).toLocaleString("zh-CN")}`,
      ``,
      `## 证据链（共 ${chain.length} 条）`,
      ``,
    ];
    chain.forEach((ev, idx) => {
      lines.push(`### ${idx + 1}. ${ev.data_source}`);
      lines.push(``);
      lines.push(`- 更新时间：${ev.update_time}`);
      lines.push(`- 可信度：${ev.credibility}`);
      lines.push(`- 证据内容：${ev.content}`);
      lines.push(``);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `证据链报告-${selectedAlert.company_name}-${selectedAlert.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    message.success("证据链报告已导出");
  };

  /** 生成处置报告（抽屉预览 + 下载） */
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false);

  const handleGenerateReport = () => {
    if (!selectedAlert || !assessment) {
      message.warning("请先选择预警并加载风险评估");
      return;
    }
    setReportDrawerOpen(true);
  };

  const handleDownloadReport = () => {
    if (!selectedAlert || !assessment) return;
    const lines: string[] = [
      `# 预警处置报告`,
      ``,
      `## 基本信息`,
      `- 预警ID：${selectedAlert.id}`,
      `- 企业名称：${selectedAlert.company_name}`,
      `- 预警类型：${selectedAlert.alert_type}`,
      `- 预警等级：${RISK_LEVEL_TEXT[selectedAlert.alert_level]}`,
      `- 触发时间：${new Date(selectedAlert.triggered_at).toLocaleString("zh-CN")}`,
      ``,
      `## 风险评估`,
      `- 整体风险等级：${RISK_LEVEL_TEXT[assessment.overall_risk]}`,
      ``,
      `## 处置建议`,
      ...(assessment.assessment_data.disposition_suggestions || []).map(
        (s: { action: string; sla: string; responsible_person: string }) =>
          `- ${s.action}（SLA：${s.sla}，责任人：${s.responsible_person}）`
      ),
      ``,
      `## 证据链`,
      ...(assessment.assessment_data.evidence_chain || []).map(
        (ev: { data_source: string; update_time: string; credibility: string; content: string }, idx: number) =>
          `${idx + 1}. ${ev.data_source}（${ev.update_time}，可信度：${ev.credibility}）\n   ${ev.content}`
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `处置报告-${selectedAlert.company_name}-${selectedAlert.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    message.success("处置报告已导出");
    setReportDrawerOpen(false);
  };
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
      <div className="grid grid-cols-12 gap-4">
        {/* 左侧：预警队列（骨架屏加载，保持可操作） */}
        <div className="col-span-4">
          <ModuleSectionCard
            title="预警队列"
            subtitle={loading ? "加载中..." : `共 ${alerts.length} 条`}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
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
            )}
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

                {/* 风险评估详情：骨架屏 → 数据到达 */}
                {assessmentLoading ? (
                  <ModuleSectionCard title="风险评估详情">
                    <Skeleton active paragraph={{ rows: 10 }} />
                  </ModuleSectionCard>
                ) : assessment ? (
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
                          ([key, dimension]) => {
                            const dim = dimension as DimensionRisk | undefined;
                            if (!dim) return null;
                            return (
                              <Card key={key} size="small">
                                <div className="flex items-center justify-between mb-1">
                                  <Text className="text-xs">{DIMENSION_NAMES[key] || key}</Text>
                                  <Tag color={RISK_LEVEL_COLORS[dim.level]} className="text-[10px]">
                                    {RISK_LEVEL_TEXT[dim.level]}
                                  </Tag>
                                </div>
                                <Text type="secondary" className="text-xs">
                                  分数：{dim.score.toFixed(1)}
                                </Text>
                              </Card>
                            );
                          }
                        )}
                      </div>

                      {/* 风险类别 */}
                      <Title level={5}>风险类别（18 类）</Title>
                      <Collapse accordion className="mb-4">
                        {(assessment.assessment_data.risk_categories as RiskCategory[]).map(
                          (category, idx) => (
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

                      {/* 证据链：按 8 大变量域分组 [spec-RISK-6] */}
                      <Title level={5}>证据链</Title>
                      <EvidenceChain
                        items={assessment.assessment_data.evidence_chain as EvidenceItem[]}
                      />
                    </ModuleSectionCard>
                  ) : (
                    <AntdAlert type="warning" message="该预警暂无风险评估数据" showIcon />
                  )}

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
                    <Button icon={<FileTextOutlined />} onClick={handleGenerateReport}>
                      生成处置报告
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={handleExportEvidence}
                      disabled={!assessment}
                    >
                      导出证据链
                    </Button>
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
              <div className="space-y-4">
                <AntdAlert
                  type="info"
                  showIcon
                  message="当前为内置演示工单"
                  description="从左侧预警队列选择预警，即可加载该客户的风险评估详情与处置操作。"
                />

                {/* 客户信息 + 预警详情 */}
                <ModuleSectionCard title="客户信息">
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="企业名称">{DEMO_ALERT.company}</Descriptions.Item>
                    <Descriptions.Item label="授信产品">{DEMO_ALERT.product}</Descriptions.Item>
                    <Descriptions.Item label="敞口余额">{DEMO_ALERT.exposure}</Descriptions.Item>
                    <Descriptions.Item label="客户经理">{DEMO_ALERT.manager}</Descriptions.Item>
                    <Descriptions.Item label="所属行业">{DEMO_ALERT.industry}</Descriptions.Item>
                    <Descriptions.Item label="触发时间">{DEMO_ALERT.triggeredAt}</Descriptions.Item>
                  </Descriptions>
                </ModuleSectionCard>

                <ModuleSectionCard title="预警详情">
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="预警等级">
                      <Tag color="gold">{DEMO_ALERT.level}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="预警类型">{DEMO_ALERT.type}</Descriptions.Item>
                    <Descriptions.Item label="触发时间">{DEMO_ALERT.triggeredAt}</Descriptions.Item>
                    <Descriptions.Item label="归因结论">多头借贷跳升（Agent 置信度 87%）</Descriptions.Item>
                  </Descriptions>
                </ModuleSectionCard>

                {/* 命中规则 */}
                <ModuleSectionCard title="命中规则">
                  <Card size="small">
                    <Text strong>{DEMO_ALERT.rule}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">{DEMO_ALERT.ruleDetail}</Text>
                  </Card>
                </ModuleSectionCard>

                {/* 风险画像 */}
                <ModuleSectionCard title="风险画像">
                  <ul className="list-disc pl-4 space-y-1 mb-0">
                    {DEMO_ALERT.riskProfile.map((p) => (
                      <li key={p} className="text-[13px]">{p}</li>
                    ))}
                  </ul>
                </ModuleSectionCard>

                <Divider />

                {/* 处置操作（演示按钮） */}
                <ModuleSectionCard title="处置操作">
                  <Space wrap>
                    {DEMO_DISPOSAL_ACTIONS.map((action) => (
                      <Button
                        key={action}
                        type={action === "电话核实" ? "primary" : "default"}
                        onClick={() => message.info(`演示环境：「${action}」动作已记录到处置草稿`)}
                        size="large"
                      >
                        {action}
                      </Button>
                    ))}
                  </Space>
                </ModuleSectionCard>

                {/* 贷后监控报告（客户级） */}
                <ModuleSectionCard
                  title="贷后监控报告"
                  subtitle="基于当前客户预警、企查查 MCP、司法财报与处置记录生成报告"
                  extra={<Tag icon={<SafetyCertificateOutlined />}>审计留档</Tag>}
                >
                  <Space wrap>
                    <Button
                      type="primary"
                      icon={<FileTextOutlined />}
                      onClick={() => message.info("演示环境：监控报告已生成并预览")}
                    >
                      生成贷后监控报告
                    </Button>
                    <Button
                      icon={<FileTextOutlined />}
                      onClick={() => message.info("演示环境：打开报告预览")}
                    >
                      报告预览
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => message.info("演示环境：报告 PDF 已开始下载")}
                    >
                      下载 PDF
                    </Button>
                  </Space>
                  <p className="mt-3 mb-0 text-[12px] text-text-secondary">
                    报告生成后自动写入监控报告库并完成审计留档，供贷后检查与验收抽查调用。
                  </p>
                </ModuleSectionCard>

                {/* 处置记录 */}
                <ModuleSectionCard title="处置记录">
                  <Timeline
                    items={DEMO_DISPOSAL_RECORDS.map((r) => ({
                      children: (
                        <>
                          <Text className="text-[13px]">{r.text}</Text>
                          <br />
                          <Text type="secondary" className="text-xs">{r.time}</Text>
                        </>
                      ),
                    }))}
                  />
                </ModuleSectionCard>
              </div>
            )}
          </div>
        </div>

      {/* 处置报告预览抽屉 */}
      <Drawer
        title="预警处置报告预览"
        open={reportDrawerOpen}
        onClose={() => setReportDrawerOpen(false)}
        width={720}
        footer={
          <Space>
            <Button onClick={() => setReportDrawerOpen(false)}>关闭</Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadReport}>
              下载报告
            </Button>
          </Space>
        }
      >
        {selectedAlert && assessment && (
          <div className="space-y-4">
            <Card size="small" title="基本信息">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="预警ID">{selectedAlert.id}</Descriptions.Item>
                <Descriptions.Item label="企业名称">{selectedAlert.company_name}</Descriptions.Item>
                <Descriptions.Item label="预警类型">{selectedAlert.alert_type}</Descriptions.Item>
                <Descriptions.Item label="预警等级">
                  <Tag color={RISK_LEVEL_COLORS[selectedAlert.alert_level]}>
                    {RISK_LEVEL_TEXT[selectedAlert.alert_level]}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="触发时间">
                  {new Date(selectedAlert.triggered_at).toLocaleString("zh-CN")}
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Card size="small" title="风险评估">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="整体风险等级">
                  <Tag color={RISK_LEVEL_COLORS[assessment.overall_risk]}>
                    {RISK_LEVEL_TEXT[assessment.overall_risk]}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Card size="small" title="处置建议">
              <ul className="list-disc pl-4 space-y-1">
                {(assessment.assessment_data.disposition_suggestions || []).map(
                  (s: { action: string; sla: string; responsible_person: string }, idx: number) => (
                    <li key={idx} className="text-sm">
                      {s.action}（SLA：{s.sla}，责任人：{s.responsible_person}）
                    </li>
                  )
                )}
              </ul>
            </Card>
            <Card size="small" title="证据链">
              <ul className="list-decimal pl-4 space-y-2">
                {(assessment.assessment_data.evidence_chain || []).map(
                  (ev: { data_source: string; update_time: string; credibility: string; content: string }, idx: number) => (
                    <li key={idx} className="text-sm">
                      <Text strong>{ev.data_source}</Text>
                      <Text type="secondary" className="text-xs ml-2">
                        {ev.update_time} · 可信度：{ev.credibility}
                      </Text>
                      <div className="mt-1">{ev.content}</div>
                    </li>
                  )
                )}
              </ul>
            </Card>
          </div>
        )}
      </Drawer>

      <DemoFlowNav />
    </ModulePageShell>
  );
}
