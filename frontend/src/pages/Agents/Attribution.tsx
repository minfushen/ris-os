/**
 * 预警归因 Agent — 聚合多源信号，生成预警原因、证据链和核查方向
 *
 * 演示实现：推理链路与结论为内置示例数据，展示 Agent 的输入 / 推理 / 输出边界三段结构。
 */

import { Alert, Card, Col, Descriptions, Progress, Row, Steps, Tag, Typography } from "antd";
import { AlertOutlined, AuditOutlined, DatabaseOutlined, FileSearchOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text, Paragraph } = Typography;

const INPUT_SOURCES = [
  { key: "alert", label: "预警工单", desc: "预警编号、触发规则、等级与触发时间", icon: <AlertOutlined /> },
  { key: "profile", label: "客户画像", desc: "经营行业、授信历史、还款行为与关联企业", icon: <FileSearchOutlined /> },
  { key: "flow", label: "账户与交易流水", desc: "对公账户资金流向、多头借贷与结算量变化", icon: <DatabaseOutlined /> },
  { key: "external", label: "外部数据", desc: "司法涉诉、工商变更、税务申报与舆情信号", icon: <AuditOutlined /> },
];

const REASONING_STEPS = [
  { title: "解析预警信号", description: "识别触发规则 RULE_023（多头借贷跳升）与预警等级" },
  { title: "检索关联证据", description: "拉取近 90 天交易流水、司法与工商数据，构造证据链" },
  { title: "定位驱动因子", description: "因子重要性排序：多头申请次数 +38%，下游回款周期延长 21 天" },
  { title: "生成归因结论", description: "输出归因结论、置信度与建议核查方向，供核查员确认" },
];

const CASE_RESULT = {
  company: "恒力机械制造有限公司",
  rule: "RULE_023 多头借贷跳升",
  conclusion: "疑似下游回款恶化引发短期多头借贷周转，尚无资金挪用直接证据",
  confidence: 87,
  factors: [
    { name: "多头申请次数（90 天）", weight: 38, note: "5 家机构集中申请" },
    { name: "下游回款周期", weight: 27, note: "应收账款周转天数 45 → 66 天" },
    { name: "结算量环比", weight: 21, note: "对公结算量下降 18%" },
    { name: "司法涉诉", weight: 14, note: "近 3 个月涉诉 3 起，均为买卖合同纠纷" },
  ],
  suggestions: ["优先核实事涉诉合同对应的下游客户回款安排", "调取企业征信明细核对多头借贷用途", "暂缓升级为红灯，7 日后复核多头指标走势"],
};

export default function Attribution() {
  return (
    <ModulePageShell
      title="预警归因 Agent"
      subtitle="聚合多源信号，生成预警原因、证据链和核查方向"
    >
      <ModuleSectionCard title="输入数据" subtitle="Agent 的四类输入源，全部来源于风险数据集市与已接入外部数据" className="mb-4">
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
        title="归因结论示例"
        subtitle={`${CASE_RESULT.company} · ${CASE_RESULT.rule}`}
        extra={<Tag color="blue">置信度 {CASE_RESULT.confidence}%</Tag>}
        className="mb-4"
      >
        <Alert
          type="warning"
          showIcon
          message={CASE_RESULT.conclusion}
          description="归因结论仅供核查员参考，不直接触发处置动作"
          className="mb-4"
        />
        <Row gutter={[24, 16]}>
          <Col xs={24} md={14}>
            <Text strong>驱动因子分解</Text>
            <div className="mt-3 space-y-3">
              {CASE_RESULT.factors.map((f) => (
                <div key={f.name}>
                  <div className="flex justify-between mb-1">
                    <Text>{f.name}</Text>
                    <Text type="secondary">{f.note}</Text>
                  </div>
                  <Progress percent={f.weight} showInfo={false} strokeColor="#1677ff" size="small" />
                </div>
              ))}
            </div>
          </Col>
          <Col xs={24} md={10}>
            <Text strong>建议核查方向</Text>
            <ol className="mt-3 pl-4 list-decimal space-y-2">
              {CASE_RESULT.suggestions.map((s) => (
                <li key={s}><Text className="text-[13px]">{s}</Text></li>
              ))}
            </ol>
          </Col>
        </Row>
      </ModuleSectionCard>

      <ModuleSectionCard title="输出与边界" subtitle="Agent 输出结构与能力边界约定">
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Text strong>输出结构</Text>
            <Descriptions size="small" column={1} className="mt-3">
              <Descriptions.Item label="归因结论">一句话结论 + 置信度</Descriptions.Item>
              <Descriptions.Item label="证据链">数据来源、更新时间、可信度</Descriptions.Item>
              <Descriptions.Item label="建议核查方向">结构化核查清单（供工作台引用）</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={12}>
            <Text strong>能力边界</Text>
            <Paragraph className="mt-3 mb-0 text-[13px]" type="secondary">
              Agent 只做归因与解释，不做信贷决策、不自动调整策略；置信度低于 70% 时自动转人工核查；
              所有结论进入处置记录留痕，纳入复盘质检抽样范围。
            </Paragraph>
          </Col>
        </Row>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
