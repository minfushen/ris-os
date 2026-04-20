import { Typography, Table, Tag } from "antd";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const CASES = [
  { id: "RC-01", rule: "税报断档天数", before: "45", after: "30", triggersDelta: "+18%", effDelta: "-4ppt", fpDelta: "+2ppt", result: "灰度观察中" },
  { id: "RC-02", rule: "制造业多头阈值", before: "35%", after: "38%", triggersDelta: "+6%", effDelta: "+3ppt", fpDelta: "-1ppt", result: "已全量" },
];

export default function RuleTuneCases() {
  return (
    <ModulePageShell
      title="规则调优案例"
      subtitle="记录参数调整前后触发量、有效率与误报变化，供策略效果追踪与发布审批引用（演示）"
      breadcrumb={["知识沉淀", "规则调优案例"]}
    >
      <ModuleSectionCard noPadding>
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={CASES}
          columns={[
            { title: "案例", dataIndex: "id", width: 72, render: (v: string) => <Text code className="text-[12px]">{v}</Text> },
            { title: "规则", dataIndex: "rule" },
            { title: "调前", dataIndex: "before", width: 72 },
            { title: "调后", dataIndex: "after", width: 72 },
            { title: "触发量", dataIndex: "triggersDelta", width: 88 },
            { title: "有效率Δ", dataIndex: "effDelta", width: 88 },
            { title: "误报Δ", dataIndex: "fpDelta", width: 80 },
            { title: "结论", dataIndex: "result", width: 100, render: (v: string) => <Tag className="!m-0">{v}</Tag> },
          ]}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
