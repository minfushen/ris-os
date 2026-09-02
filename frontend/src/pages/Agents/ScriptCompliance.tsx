/**
 * 话术合规 Agent — 推荐场景化话术并检查威胁、诱导、隐私泄露等合规风险
 */

import { Alert, Card, Col, Row, Table, Tag, Typography } from "antd";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text, Paragraph } = Typography;

const CHECK_ITEMS = [
  { key: "threat", name: "威胁恐吓", result: "未检出", level: "pass" },
  { key: "induce", name: "诱导性承诺", result: "未检出", level: "pass" },
  { key: "privacy", name: "隐私泄露", result: "未检出", level: "pass" },
  { key: "pressure", name: "过度施压", result: "提示：单条话术含两处催促表述", level: "warn" },
  { key: "promise", name: "减免承诺", result: "未检出", level: "pass" },
] as const;

const SAMPLE_SCRIPT =
  "您好，我是头部农商行客户经理。贵司惠快贷本月还款日临近，提醒您按时归还应还本息。如已安排，请忽略本条。如有临时周转困难，可提前联系沟通，我们将协助您了解适用的纾困安排。";

export default function ScriptCompliance() {
  return (
    <ModulePageShell
      title="话术合规 Agent"
      subtitle="推荐场景化话术并检查威胁、诱导、隐私泄露等合规风险"
    >
      <ModuleSectionCard title="话术合规检测示例" subtitle="对催收与还款提醒话术做发送前合规预检" className="mb-4">
        <Alert type="info" showIcon message="待检话术（还款提醒场景 · 模板 HS-012）" className="mb-3" />
        <Paragraph className="bg-[var(--color-bg-interactive-hover)] rounded-md p-3 text-[13px]">
          {SAMPLE_SCRIPT}
        </Paragraph>
        <Table
          size="small"
          pagination={false}
          rowKey="key"
          dataSource={[...CHECK_ITEMS]}
          columns={[
            { title: "检查项", dataIndex: "name", width: 160 },
            {
              title: "检测结果",
              dataIndex: "result",
              render: (v: string, r: (typeof CHECK_ITEMS)[number]) => (
                <span>
                  <Tag color={r.level === "pass" ? "green" : "orange"}>{r.level === "pass" ? "通过" : "提示"}</Tag>
                  <Text type="secondary" className="text-[12px]">{v}</Text>
                </span>
              ),
            },
          ]}
        />
      </ModuleSectionCard>

      <ModuleSectionCard title="合规要点" subtitle="发送前 Agent 自动预检，命中提示项需人工复核">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" title="禁止项">
              <ul className="pl-4 list-disc text-[13px] mb-0">
                <li>威胁、恐吓、辱骂表述</li>
                <li>诱导借款人以贷还贷</li>
                <li>泄露客户负债信息给第三方</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" title="提示项">
              <ul className="pl-4 list-disc text-[13px] mb-0">
                <li>避免非必要时段触达（22:00–8:00）</li>
                <li>催促表述不超过一处</li>
                <li>不承诺未经审批的减免方案</li>
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" title="留痕要求">
              <ul className="pl-4 list-disc text-[13px] mb-0">
                <li>话术模板编号 + 检测结果入审计留档</li>
                <li>人工改写后重新过检</li>
                <li>质检抽样结果回流标注飞轮</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
