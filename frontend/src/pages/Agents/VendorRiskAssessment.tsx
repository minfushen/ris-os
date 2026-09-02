/**
 * 企业风险评估 Agent — 基于企查查 MCP 的 9 维度风险评估与处置建议
 *
 * 调用后端 POST /api/qcc/assess-vendor-risk（需配置 QCC_MCP_API_KEY）。
 * 后端未启动或未配置 Key 时给出明确提示，不阻塞其他演示页面。
 */

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  Progress,
  Row,
  Space,
  Steps,
  Table,
  Tag,
  Timeline,
  Typography,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import { api } from "@/api/client";
import {
  DIMENSION_NAMES,
  RISK_LEVEL_COLORS,
  RISK_LEVEL_TEXT,
  type VendorRiskAssessment,
} from "@/types/qcc";

const { Text } = Typography;

const REASONING_STEPS = [
  "调用企查查 MCP 拉取工商 / 司法 / 经营数据",
  "按 9 个维度逐项排查 18 类风险信号",
  "构造结构化证据链（来源 + 更新时间 + 可信度）",
  "汇总整体风险等级并生成处置建议",
];

const SAMPLE_COMPANY = "恒力机械制造有限公司";

export default function VendorRiskAssessment() {
  const [companyName, setCompanyName] = useState(SAMPLE_COMPANY);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<VendorRiskAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAssessment = async () => {
    const name = companyName.trim();
    if (!name) {
      message.warning("请输入企业名称");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setStep(0);
    // 推理过程可视化：阶段推进（与请求并行）
    const timer = window.setInterval(() => {
      setStep((s) => Math.min(s + 1, REASONING_STEPS.length - 1));
    }, 1200);
    try {
      const data = await api.assessVendorRisk({ company_name: name });
      setResult(data);
    } catch {
      setError(
        "评估服务不可用：需要启动后端（uvicorn app:app）并在 backend/.env 配置 QCC_MCP_API_KEY 后重试。",
      );
    } finally {
      window.clearInterval(timer);
      setLoading(false);
    }
  };

  const dimensionRows = result
    ? Object.entries(result.dimensions)
        .filter(([, v]) => v != null)
        .map(([key, v]) => ({
          key,
          dimension: DIMENSION_NAMES[key] ?? key,
          ...(v as { level: string; score: number; key_findings: string[] }),
        }))
    : [];

  return (
    <ModulePageShell
      title="企业风险评估 Agent"
      subtitle="基于企查查 MCP 的 9 维度风险评估，18 类风险分级"
    >
      <ModuleSectionCard title="发起评估" subtitle="输入企业名称，Agent 将调用企查查 MCP 实时完成风险评估" className="mb-4">
        <Space.Compact style={{ width: "100%", maxWidth: 560 }}>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onPressEnter={runAssessment}
            placeholder="企业名称"
            disabled={loading}
          />
          <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={runAssessment}>
            开始评估
          </Button>
        </Space.Compact>

        {loading && (
          <Steps
            direction="vertical"
            size="small"
            className="mt-4"
            current={step}
            items={REASONING_STEPS.map((t) => ({ title: t }))}
          />
        )}

        {error && (
          <Alert type="warning" showIcon className="mt-4" message="评估服务未就绪" description={error} />
        )}
      </ModuleSectionCard>

      {result && (
        <>
          <ModuleSectionCard
            title="评估结论"
            subtitle={`${result.company_name} · 评估时间 ${new Date(result.assessment_time).toLocaleString("zh-CN")}`}
            extra={<Tag color={RISK_LEVEL_COLORS[result.overall_risk]}>{RISK_LEVEL_TEXT[result.overall_risk]}</Tag>}
            className="mb-4"
          >
            <Row gutter={[16, 16]}>
              {dimensionRows.map((d) => (
                <Col xs={24} sm={12} md={8} key={d.key}>
                  <Card size="small">
                    <Text strong>{d.dimension}</Text>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress
                        type="dashboard"
                        size={56}
                        percent={d.score}
                        strokeColor={RISK_LEVEL_COLORS[d.level]}
                        format={() => `${d.score}`}
                      />
                      <Tag color={RISK_LEVEL_COLORS[d.level]}>{RISK_LEVEL_TEXT[d.level]}</Tag>
                    </div>
                    <ul className="mt-2 pl-4 list-disc text-[12px] text-text-secondary">
                      {d.key_findings.slice(0, 2).map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </Card>
                </Col>
              ))}
            </Row>
          </ModuleSectionCard>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <ModuleSectionCard title="风险明细" subtitle="按维度展开的关键发现" className="mb-4">
                <Table
                  size="small"
                  pagination={false}
                  rowKey="key"
                  dataSource={dimensionRows.flatMap((d) =>
                    d.key_findings.map((f, i) => ({ key: `${d.key}-${i}`, dimension: d.dimension, level: d.level, finding: f })),
                  )}
                  columns={[
                    { title: "维度", dataIndex: "dimension", width: 110 },
                    {
                      title: "等级",
                      dataIndex: "level",
                      width: 90,
                      render: (lv: string) => <Tag color={RISK_LEVEL_COLORS[lv]}>{RISK_LEVEL_TEXT[lv]}</Tag>,
                    },
                    { title: "关键发现", dataIndex: "finding" },
                  ]}
                />
              </ModuleSectionCard>
            </Col>
            <Col xs={24} lg={12}>
              <ModuleSectionCard title="证据链" subtitle="每条证据均含数据来源、更新时间与可信度" className="mb-4">
                <Timeline
                  items={result.evidence_chain.slice(0, 6).map((e, i) => ({
                    key: i,
                    children: (
                      <>
                        <Text>{e.content}</Text>
                        <br />
                        <Text type="secondary" className="text-[12px]">
                          来源：{e.data_source} · 更新：{e.update_time} · 可信度：{e.credibility}
                        </Text>
                      </>
                    ),
                  }))}
                />
              </ModuleSectionCard>
            </Col>
          </Row>

          <ModuleSectionCard title="处置建议" subtitle="含 SLA、责任人与需补充材料">
            <Row gutter={[16, 16]}>
              {result.disposition_suggestions.map((s, i) => (
                <Col xs={24} md={8} key={i}>
                  <Card size="small" title={s.action}>
                    <Descriptions size="small" column={1}>
                      <Descriptions.Item label="SLA">{s.sla}</Descriptions.Item>
                      <Descriptions.Item label="责任人">{s.responsible_person}</Descriptions.Item>
                    </Descriptions>
                    <ul className="pl-4 list-disc text-[12px] mt-2">
                      {s.materials.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </Card>
                </Col>
              ))}
            </Row>
          </ModuleSectionCard>
        </>
      )}
    </ModulePageShell>
  );
}
