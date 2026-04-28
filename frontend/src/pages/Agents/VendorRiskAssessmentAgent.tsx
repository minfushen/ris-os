/**
 * 企业风险评估 Agent 页面
 *
 * 功能：
 * - 输入企业名称进行风险评估
 * - 动态展示推理过程（进度条 + 打字机效果）
 * - 展示 9 维度评估结果
 * - 展示 18 类风险清单
 * - 展示证据链和处置建议
 */

import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Space,
  Alert,
  Spin,
  Card,
  Tag,
  Descriptions,
  Timeline,
  Collapse,
  Progress,
  Typography,
} from "antd";
import {
  SearchOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import { api } from "@/api/client";
import type { VendorRiskAssessment, RiskLevel } from "@/types/qcc";
import { RISK_LEVEL_COLORS, RISK_LEVEL_TEXT, DIMENSION_NAMES } from "@/types/qcc";

const { Text } = Typography;

// 推理步骤定义
const REASONING_STEPS = [
  {
    key: "fetch_data",
    title: "数据获取",
    description: "调用企查查 MCP 获取企业工商、司法、经营、知识产权数据",
  },
  {
    key: "evaluate_dimensions",
    title: "维度评估",
    description: "执行 9 维度风险评估（基础6维+供应链特有3维）",
  },
  {
    key: "classify_risks",
    title: "风险分级",
    description: "排查 18 类风险，按 CRITICAL/HIGH/MEDIUM/LOW 分级",
  },
  {
    key: "generate_output",
    title: "生成报告",
    description: "生成结构化证据链和处置建议",
  },
];

export default function VendorRiskAssessmentAgent() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VendorRiskAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 动态进度状态
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepProgress, setStepProgress] = useState(0);
  const [stepMessages, setStepMessages] = useState<string[]>([]);

  const handleAssess = async () => {
    if (!companyName.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep(0);
    setStepProgress(0);
    setStepMessages([]);

    try {
      // 模拟逐步执行（实际项目中应该使用 SSE 流式接口）
      for (let i = 0; i < REASONING_STEPS.length; i++) {
        setCurrentStep(i);
        setStepProgress(0);

        // 模拟进度更新
        const progressInterval = setInterval(() => {
          setStepProgress((prev) => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return prev + Math.random() * 20;
          });
        }, 200);

        // 添加步骤消息
        setStepMessages((prev) => [...prev, REASONING_STEPS[i].description]);

        // 等待一段时间模拟处理
        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

        clearInterval(progressInterval);
        setStepProgress(100);
      }

      // 调用实际 API
      const assessment = await api.assessVendorRisk(companyName);
      setResult(assessment);
      setCurrentStep(-1); // 完成所有步骤
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "评估失败";
      setError(errorMsg);
      setCurrentStep(-1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModulePageShell
      title="企业风险评估 Agent"
      subtitle="基于企查查 MCP 的 9 维度风险评估，18 类风险分级，专为中国企业设计"
      breadcrumb={["智能体协同", "企业风险评估 Agent"]}
    >
      {/* Agent 定位说明 */}
      <Alert
        type="info"
        showIcon
        className="rounded-lg mb-4"
        message="Agent 定位"
        description="服务于贷后风控全流程，负责企业风险的自动化评估、分级和证据链生成。可被预警归因、处置建议等 Agent 调用，也可独立使用。"
      />

      {/* 输入区域 */}
      <ModuleSectionCard title="企业风险评估" subtitle="输入企业名称开始评估">
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="请输入企业名称或统一社会信用代码"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onPressEnter={handleAssess}
            size="large"
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={loading}
            onClick={handleAssess}
            size="large"
          >
            开始评估
          </Button>
        </Space.Compact>

        {error && (
          <Alert
            type="error"
            message="评估失败"
            description={error}
            className="mt-4"
            showIcon
          />
        )}
      </ModuleSectionCard>

      {/* 动态推理过程展示 */}
      {loading && currentStep >= 0 && (
        <ModuleSectionCard title="推理过程" subtitle="实时展示 Agent 执行进度">
          <div className="space-y-4">
            {/* 步骤进度条 */}
            {REASONING_STEPS.map((step, index) => (
              <div key={step.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {index < currentStep && (
                      <CheckCircleOutlined className="text-green-500" />
                    )}
                    {index === currentStep && (
                      <SyncOutlined spin className="text-blue-500" />
                    )}
                    {index > currentStep && (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <Text
                      strong={index === currentStep}
                      type={index > currentStep ? "secondary" : undefined}
                    >
                      {step.title}
                    </Text>
                  </div>
                  {index <= currentStep && (
                    <Text type="secondary" className="text-sm">
                      {index === currentStep ? `${Math.round(stepProgress)}%` : "完成"}
                    </Text>
                  )}
                </div>
                <Progress
                  percent={index < currentStep ? 100 : index === currentStep ? stepProgress : 0}
                  strokeColor={index === currentStep ? "#1890ff" : "#52c41a"}
                  showInfo={false}
                  size="small"
                />
                {index === currentStep && (
                  <Text type="secondary" className="text-xs">
                    {step.description}
                  </Text>
                )}
              </div>
            ))}

            {/* 实时消息流 */}
            {stepMessages.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <Text type="secondary" className="text-xs block mb-2">
                  执行日志：
                </Text>
                <div className="space-y-1 font-mono text-xs">
                  {stepMessages.map((msg, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ModuleSectionCard>
      )}

      {/* 评估结果 */}
      {result && <RiskAssessmentResult result={result} />}
    </ModulePageShell>
  );
}

/**
 * 风险评估结果展示组件
 */
function RiskAssessmentResult({ result }: { result: VendorRiskAssessment }) {
  const overallRiskColor = RISK_LEVEL_COLORS[result.overall_risk];
  const overallRiskText = RISK_LEVEL_TEXT[result.overall_risk];

  return (
    <div className="mt-6 space-y-6">
      {/* 整体风险等级 */}
      <Card title="整体风险评估" className="shadow-sm">
        <div className="flex items-center gap-4">
          <Tag color={overallRiskColor} className="text-lg px-4 py-2">
            {result.overall_risk === "CRITICAL" && <WarningOutlined className="mr-2" />}
            {result.overall_risk === "LOW" && <CheckCircleOutlined className="mr-2" />}
            {overallRiskText}
          </Tag>
          <div className="text-gray-600">
            <div className="font-semibold">{result.company_name}</div>
            <div className="text-sm">评估时间：{result.assessment_time}</div>
          </div>
        </div>
      </Card>

      {/* 9 维度评估详情 */}
      <Card title="9 维度风险评估" className="shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(result.dimensions).map(([key, dimension]) => {
            if (!dimension) return null;
            const dimName = DIMENSION_NAMES[key] || key;
            const dimColor = RISK_LEVEL_COLORS[dimension.level];
            const dimText = RISK_LEVEL_TEXT[dimension.level];

            return (
              <Card key={key} size="small" className="border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{dimName}</span>
                  <Tag color={dimColor}>{dimText}</Tag>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  风险分数：{dimension.score.toFixed(1)}
                </div>
                {dimension.key_findings.length > 0 && (
                  <div className="text-sm">
                    <div className="font-medium mb-1">关键发现：</div>
                    <ul className="list-disc list-inside text-gray-600">
                      {dimension.key_findings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Card>

      {/* 18 类风险清单 */}
      <Card title="风险清单（18类）" className="shadow-sm">
        <Collapse accordion>
          {result.risk_categories.map((category, idx) => (
            <Collapse.Panel
              key={idx}
              header={
                <div className="flex items-center gap-2">
                  <Tag color={RISK_LEVEL_COLORS[category.level]}>
                    {RISK_LEVEL_TEXT[category.level]}
                  </Tag>
                  <span className="font-medium">{category.category}</span>
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
          ))}
        </Collapse>
      </Card>

      {/* 证据链 */}
      <Card title="证据链" className="shadow-sm">
        <Timeline>
          {result.evidence_chain.map((evidence, idx) => (
            <Timeline.Item key={idx} color="blue">
              <div className="space-y-1">
                <div className="font-semibold">{evidence.data_source}</div>
                <div className="text-sm text-gray-600">
                  更新时间：{evidence.update_time} | 可信度：{evidence.credibility}
                </div>
                <div className="text-sm">{evidence.content}</div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* 处置建议 */}
      <Card title="处置建议" className="shadow-sm">
        <div className="space-y-4">
          {result.disposition_suggestions.map((suggestion, idx) => (
            <Card key={idx} size="small" className="border-l-4 border-l-blue-500">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="处置动作">{suggestion.action}</Descriptions.Item>
                <Descriptions.Item label="SLA">{suggestion.sla}</Descriptions.Item>
                <Descriptions.Item label="责任人">{suggestion.responsible_person}</Descriptions.Item>
                <Descriptions.Item label="补充材料">
                  {suggestion.materials.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {suggestion.materials.map((material, mIdx) => (
                        <li key={mIdx}>{material}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400">无</span>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
