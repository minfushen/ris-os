/**
 * 预警归因 Agent — 聚合多源信号，生成预警原因、证据链和核查方向
 *
 * 企业维度司法数据来自元典法律智能 MCP（后端 /api/agents/attribution）；
 * 后端未启动或未配置 Key 时，降级为内置演示工单，页面不阻断。
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
  Tag,
  Timeline,
  Typography,
} from "antd";
import { AlertOutlined, AuditOutlined, DatabaseOutlined, FileSearchOutlined, SearchOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import { api } from "@/api/client";
import { ATTRIBUTION_LEVEL_COLORS, type AttributionResult } from "@/types/attribution";

const { Text, Paragraph } = Typography;

const INPUT_SOURCES = [
  { key: "alert", label: "预警工单", desc: "预警编号、触发规则、等级与触发时间", icon: <AlertOutlined /> },
  { key: "profile", label: "客户画像", desc: "经营行业、授信历史、还款行为与关联企业", icon: <FileSearchOutlined /> },
  { key: "flow", label: "账户与交易流水", desc: "对公账户资金流向、多头借贷与结算量变化", icon: <DatabaseOutlined /> },
  { key: "external", label: "司法涉诉数据", desc: "元典法律智能 MCP：涉诉统计、被执行、失信记录", icon: <AuditOutlined /> },
];

const REASONING_STEPS = [
  { title: "解析预警信号", description: "识别触发规则与预警等级，锁定归因主体企业" },
  { title: "检索关联证据", description: "元典 MCP 拉取涉诉统计、被执行与失信数据，构造证据链" },
  { title: "定位驱动因子", description: "按案由分布与司法强制执行信号分解驱动因子" },
  { title: "生成归因结论", description: "输出归因结论、置信度与建议核查方向，供核查员确认" },
];

const QUERY_STEPS = [
  "元典 MCP 检索企业主体（enterpriseSearch）",
  "拉取涉诉统计多维分布（enterpriseWritAgg）",
  "核对被执行人与失信被执行记录",
  "规则归因：生成结论、置信度与核查方向",
];

/** 降级演示工单（后端不可用时的内置示例） */
const DEMO_RESULT: AttributionResult = {
  company_name: "恒力机械制造有限公司",
  risk_level: "MEDIUM",
  risk_level_text: "中风险",
  conclusion: "疑似下游回款恶化引发短期多头借贷周转，尚无资金挪用直接证据",
  confidence: 87,
  stats: { total_writs: 3, execution_cases: 0, executed_total: 0, dishonest_total: 0 },
  factors: [
    { name: "多头申请次数（90 天）", weight: 38, note: "5 家机构集中申请" },
    { name: "下游回款周期", weight: 27, note: "应收账款周转天数 45 → 66 天" },
    { name: "结算量环比", weight: 21, note: "对公结算量下降 18%" },
    { name: "司法涉诉", weight: 14, note: "近 3 个月涉诉 3 起，均为买卖合同纠纷" },
  ],
  suggestions: [
    "优先核实事涉诉合同对应的下游客户回款安排",
    "调取企业征信明细核对多头借贷用途",
    "暂缓升级为红灯，7 日后复核多头指标走势",
  ],
  evidence_chain: [
    { data_source: "演示数据 · 多头借贷监测", content: "近 90 天 5 家机构集中申请" },
    { data_source: "演示数据 · 结算流水", content: "对公结算量环比下降 18%" },
  ],
};

export default function Attribution() {
  const [companyName, setCompanyName] = useState("比亚迪股份有限公司");
  const [loading, setLoading] = useState(false);
  const [queryStep, setQueryStep] = useState(0);
  const [result, setResult] = useState<AttributionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAttribution = async () => {
    const name = companyName.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setQueryStep(0);
    const timer = window.setInterval(() => {
      setQueryStep((s) => Math.min(s + 1, QUERY_STEPS.length - 1));
    }, 900);
    try {
      const data = await api.attributeCompany(name);
      setResult(data);
    } catch {
      setError("实时归因不可用：需要启动后端并在 backend/.env 配置 HUAYU_MCP_API_KEY（元典法律智能 MCP）。当前展示内置演示工单。");
      setResult(DEMO_RESULT);
    } finally {
      window.clearInterval(timer);
      setLoading(false);
    }
  };

  const levelColor = result ? ATTRIBUTION_LEVEL_COLORS[result.risk_level] ?? "#d97706" : "#d97706";

  return (
    <ModulePageShell
      title="预警归因 Agent"
      subtitle="聚合多源信号，生成预警原因、证据链和核查方向"
    >
      <ModuleSectionCard
        title="发起归因"
        subtitle="输入企业名称，Agent 将调用元典法律智能 MCP 拉取真实司法数据并生成归因结论"
        className="mb-4"
      >
        <Space.Compact style={{ width: "100%", maxWidth: 560 }}>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onPressEnter={runAttribution}
            placeholder="企业名称（支持全国任意在册企业）"
            disabled={loading}
          />
          <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={runAttribution}>
            开始归因
          </Button>
        </Space.Compact>

        {loading && (
          <Steps
            direction="vertical"
            size="small"
            className="mt-4"
            current={queryStep}
            items={QUERY_STEPS.map((t) => ({ title: t }))}
          />
        )}
      </ModuleSectionCard>

      <ModuleSectionCard title="输入数据" subtitle="Agent 的四类输入源：工单与画像来自预警系统，司法数据来自元典法律智能 MCP" className="mb-4">
        <Row gutter={[16, 16]}>
          {INPUT_SOURCES.map((s) => (
            <Col xs={24} sm={12} md={6} key={s.key}>
              <Card size="small">
                <div className="flex items-start gap-2">
                  <span className="text-primary text-lg">{s.icon}</span>
                  <div>
                    <Text strong>{s.label}</Text>
                    <br />
                    <Text type="secondary" className="text-[12px]">{s.desc}</Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </ModuleSectionCard>

      <ModuleSectionCard title="推理过程" subtitle="可解释的链式推理：每一步的中间产物均留痕，供审计回放" className="mb-4">
        <Steps
          direction="vertical"
          size="small"
          current={3}
          items={REASONING_STEPS.map((s) => ({ title: s.title, description: s.description }))}
        />
      </ModuleSectionCard>

      <ModuleSectionCard
        title="归因结论"
        subtitle={result ? `${result.company_name}${result.credit_code ? ` · ${result.credit_code}` : ""}` : undefined}
        extra={result ? <Tag color={levelColor}>{result.risk_level_text} · 置信度 {result.confidence}%</Tag> : undefined}
        className="mb-4"
      >
        {error && (
          <Alert type="warning" showIcon className="mb-4" message="实时数据源未就绪，已降级为演示工单" description={error} />
        )}
        {result && (
          <>
            <Alert
              type={result.risk_level === "CRITICAL" || result.risk_level === "HIGH" ? "error" : result.risk_level === "LOW" ? "success" : "warning"}
              showIcon
              message={result.conclusion}
              description={
                <span>
                  司法维度统计：涉诉 {result.stats.total_writs} 件 · 执行案件 {result.stats.execution_cases} 件 ·
                  被执行人 {result.stats.executed_total} 条 · 失信记录 {result.stats.dishonest_total} 条
                  {result.risk_level !== "LOW" ? " · 归因结论仅供核查员参考，不直接触发处置动作" : ""}
                </span>
              }
              className="mb-4"
            />
            <Row gutter={[24, 16]}>
              <Col xs={24} md={14}>
                <Text strong>驱动因子分解</Text>
                <div className="mt-3 space-y-3">
                  {result.factors.map((f) => (
                    <div key={f.name}>
                      <div className="flex justify-between mb-1">
                        <Text>{f.name}</Text>
                        <Text type="secondary">{f.note}</Text>
                      </div>
                      <Progress percent={f.weight} showInfo={false} strokeColor={levelColor} size="small" />
                    </div>
                  ))}
                </div>
              </Col>
              <Col xs={24} md={10}>
                <Text strong>建议核查方向</Text>
                <ol className="mt-3 pl-4 list-decimal space-y-2">
                  {result.suggestions.map((s) => (
                    <li key={s}><Text className="text-[13px]">{s}</Text></li>
                  ))}
                </ol>
              </Col>
            </Row>
            <DividerPlain />
            <Text strong>证据链</Text>
            <Timeline
              className="mt-3"
              items={result.evidence_chain.map((e, i) => ({
                key: i,
                children: (
                  <>
                    <Text className="text-[13px]">{e.content}</Text>
                    <br />
                    <Text type="secondary" className="text-[12px]">来源：{e.data_source}</Text>
                  </>
                ),
              }))}
            />
          </>
        )}
      </ModuleSectionCard>

      <ModuleSectionCard title="输出与边界" subtitle="Agent 输出结构与能力边界约定">
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Text strong>输出结构</Text>
            <Descriptions size="small" column={1} className="mt-3">
              <Descriptions.Item label="归因结论">一句话结论 + 风险等级 + 置信度</Descriptions.Item>
              <Descriptions.Item label="证据链">数据来源（元典 MCP 工具级标注）与量化事实</Descriptions.Item>
              <Descriptions.Item label="建议核查方向">结构化核查清单（供工作台引用）</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={12}>
            <Text strong>能力边界</Text>
            <Paragraph className="mt-3 mb-0 text-[13px]" type="secondary">
              Agent 只做归因与解释，不做信贷决策、不自动调整策略；归因规则为确定性规则（可解释优先），
              置信度随司法数据规模动态计算；所有结论进入处置记录留痕，纳入复盘质检抽样范围。
            </Paragraph>
          </Col>
        </Row>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}

function DividerPlain() {
  return <div className="my-4 border-t border-[var(--color-border)]" />;
}
