import { Typography, Tag, Space, List } from "antd";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const SNIPPETS = [
  { id: "SC-01", industry: "批发零售", tier: "M1", title: "首期友好提醒", body: "您好，关注到账单已进入宽限期，如资金周转可优先部分还款，我可为您登记还款计划…" },
  { id: "SC-02", industry: "制造业", tier: "M2", title: "经营压力共情", body: "理解近期订单波动，我们可协助核对还款日与对公流水，避免影响征信…" },
  { id: "SC-03", industry: "全行业", tier: "M3+", title: "法律后果告知", body: "若持续未履约，将按合同启动后续流程；仍希望与您协商可行方案…" },
];

export default function ScriptsLibrary() {
  return (
    <ModulePageShell
      title="催收话术库"
      subtitle="按行业与逾期分档组织话术，可在催收作业与预警核查工作台引用（演示）"
      breadcrumb={["知识沉淀", "催收话术库"]}
    >
      <ModuleSectionCard title="话术片段" subtitle="合规话术仅供参考，生产环境需法务审核版本号">
        <List
          size="small"
          dataSource={SNIPPETS}
          renderItem={(item) => (
            <List.Item className="!flex-col !items-stretch border-b border-black/[0.06] last:border-0">
              <Space wrap className="mb-1">
                <Text code className="text-[12px]">{item.id}</Text>
                <Tag className="!m-0">{item.industry}</Tag>
                <Tag color="orange" className="!m-0">{item.tier}</Tag>
                <Text strong className="text-[13px]">{item.title}</Text>
              </Space>
              <Text type="secondary" className="text-[13px]">{item.body}</Text>
            </List.Item>
          )}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
