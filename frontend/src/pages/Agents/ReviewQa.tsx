/**
 * 复盘质检 Agent — 批量预筛处置记录质量，推动样本回流与规则优化
 */

import { Progress, Table, Tag, Typography } from "antd";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

interface QaRow {
  key: string;
  recordId: string;
  customer: string;
  action: string;
  score: number;
  issues: string[];
  reflowStatus: string;
}

const QA_ROWS: QaRow[] = [
  {
    key: "1",
    recordId: "CZ-20260428-018",
    customer: "恒力机械制造",
    action: "电话核实",
    score: 92,
    issues: [],
    reflowStatus: "好样本 · 已回流",
  },
  {
    key: "2",
    recordId: "CZ-20260427-036",
    customer: "隆盛纺织品",
    action: "上门走访",
    score: 64,
    issues: ["走访纪要缺经营状态结论", "未附现场影像"],
    reflowStatus: "待补件",
  },
  {
    key: "3",
    recordId: "CZ-20260426-041",
    customer: "广源建材",
    action: "要求增信",
    score: 38,
    issues: ["缺审批岗签批", "增信方案与 SOP 不符"],
    reflowStatus: "转人工复检",
  },
];

export default function ReviewQa() {
  return (
    <ModulePageShell
      title="复盘质检 Agent"
      subtitle="批量预筛处置记录质量，推动样本回流与规则优化"
    >
      <ModuleSectionCard title="处置记录抽检队列" subtitle="Agent 预筛评分低于 60 分自动转人工复检" noPadding className="mb-4">
        <Table<QaRow>
          size="middle"
          pagination={false}
          rowKey="key"
          dataSource={QA_ROWS}
          columns={[
            { title: "记录编号", dataIndex: "recordId", width: 170 },
            { title: "客户", dataIndex: "customer", width: 140 },
            { title: "处置动作", dataIndex: "action", width: 110 },
            {
              title: "Agent 预筛评分",
              dataIndex: "score",
              width: 180,
              render: (v: number) => (
                <span className="flex items-center gap-2">
                  <Progress percent={v} size="small" showInfo={false}
                    strokeColor={v >= 80 ? "#52c41a" : v >= 60 ? "#faad14" : "#ff4d4f"} />
                  <Text className="text-[12px]">{v}</Text>
                </span>
              ),
            },
            {
              title: "问题标签",
              dataIndex: "issues",
              render: (issues: string[]) =>
                issues.length === 0 ? <Tag color="green">无问题</Tag> : issues.map((i) => <Tag key={i} color="orange">{i}</Tag>),
            },
            {
              title: "样本回流",
              dataIndex: "reflowStatus",
              width: 140,
              render: (v: string) => (
                <Tag color={v.startsWith("好样本") ? "green" : v === "待补件" ? "gold" : "red"}>{v}</Tag>
              ),
            },
          ]}
        />
      </ModuleSectionCard>

      <ModuleSectionCard title="与标注飞轮的联动" subtitle="质检结论决定样本标签质量，直接影响模型重训">
        <ul className="pl-4 list-disc text-[13px] mb-0 space-y-1">
          <li>预筛通过的处置结论自动写入样本池（好 / 坏标签）</li>
          <li>问题记录退回处置岗补件，补件后重新预筛</li>
          <li>规则误报线索同步至策略调优 Agent 的机会清单</li>
        </ul>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
