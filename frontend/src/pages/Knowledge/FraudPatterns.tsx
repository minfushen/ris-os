import { Typography, Table, Tag, Button } from "antd";
import { Link } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const PATTERNS = [
  { id: "FP-01", name: "资金挪用 · 对公回流个人账户", industry: "批发零售", tier: "M2", summary: "大额货款分拆转入实控人账户，触发多头+资金流双信号。", refCase: "AL-8802" },
  { id: "FP-02", name: "团伙共债 · 设备簇", industry: "服务业", tier: "M1", summary: "多主体共享设备指纹且还款日高度同步。", refCase: "AL-7711" },
  { id: "FP-03", name: "税报粉饰 · 申报突增", industry: "制造业", tier: "预警", summary: "申报收入与水电能耗背离，季后大幅下修。", refCase: "AL-9022" },
];

export default function FraudPatterns() {
  return (
    <ModulePageShell
      title="风险模式库"
      subtitle="真实贷后风险案例与识别要点，供核查备注引用与模型训练（演示）"
      breadcrumb={["知识沉淀", "风险模式库"]}
      actions={
        <Link to="/risk/workbench">
          <Button type="primary" size="small">打开核查工作台</Button>
        </Link>
      }
    >
      <ModuleSectionCard noPadding>
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={PATTERNS}
          columns={[
            { title: "编号", dataIndex: "id", width: 72, render: (v: string) => <Text code className="text-[12px]">{v}</Text> },
            { title: "模式名称", dataIndex: "name", render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
            { title: "行业", dataIndex: "industry", width: 100 },
            { title: "适用分档", dataIndex: "tier", width: 88, render: (v: string) => <Tag className="!m-0">{v}</Tag> },
            { title: "要点", dataIndex: "summary", ellipsis: true },
            { title: "关联案例", dataIndex: "refCase", width: 100, render: (v: string) => <Text code className="text-[12px]">{v}</Text> },
          ]}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
