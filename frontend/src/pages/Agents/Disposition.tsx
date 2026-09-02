/**
 * 处置建议 Agent — 基于客户画像、预警等级与 SOP 推荐下一步处置动作
 */

import { Alert, Card, Col, Row, Space, Tag, Timeline, Typography } from "antd";
import { PhoneOutlined, RocketOutlined, TeamOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const SUGGESTIONS = [
  {
    icon: <PhoneOutlined />,
    title: "电话核实（推荐）",
    tag: { color: "blue", text: "SLA 4h" },
    basis: "SOP-黄灯-L2 · 归因置信度 87%",
    detail: "核实下游回款安排与多头借贷用途，话术引用话术库模板 HS-012",
  },
  {
    icon: <TeamOutlined />,
    title: "上门走访",
    tag: { color: "default", text: "备用" },
    basis: "SOP-黄灯-L3 · 电话核实未达成时升级",
    detail: "实地核验经营状态、库存与用工情况，输出走访纪要",
  },
  {
    icon: <RocketOutlined />,
    title: "要求增信 / 提前回收",
    tag: { color: "default", text: "升级预案" },
    basis: "SOP-红灯-L1 · 复核多头指标持续恶化时触发",
    detail: "追加抵押物或部分提前归还，同步报授信政策室审批",
  },
];

const TIMELINE_ITEMS = [
  { color: "red", children: "T+0 09:12 · RULE_023 触发黄灯预警，Agent 生成归因结论" },
  { color: "blue", children: "T+0 09:13 · 处置建议 Agent 按 SOP 匹配处置动作，推送客户经理待办" },
  { color: "gray", children: "T+1 17:00 · 电话核实完成，结论回流处置记录并进入标注飞轮" },
];

export default function Disposition() {
  return (
    <ModulePageShell
      title="处置建议 Agent"
      subtitle="基于客户画像、预警等级与 SOP 推荐下一步处置动作"
    >
      <Alert
        type="info"
        showIcon
        className="mb-4"
        message="示例工单：恒力机械制造有限公司 · 黄灯 · RULE_023 多头借贷跳升"
        description="Agent 只推荐动作与排序，执行决定由客户经理与审批岗确认，全程留痕。"
      />

      <ModuleSectionCard title="推荐处置动作" subtitle="按 SOP 匹配度与风险等级排序" className="mb-4">
        <Row gutter={[16, 16]}>
          {SUGGESTIONS.map((s) => (
            <Col xs={24} md={8} key={s.title}>
              <Card size="small" title={<Space>{s.icon}{s.title}</Space>} extra={<Tag color={s.tag.color}>{s.tag.text}</Tag>}>
                <Text type="secondary" className="text-[12px]">{s.basis}</Text>
                <p className="mt-2 mb-0 text-[13px]">{s.detail}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </ModuleSectionCard>

      <ModuleSectionCard title="处置时间线" subtitle="与预警核查工作台、复盘质检双向关联">
        <Timeline items={TIMELINE_ITEMS} />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
