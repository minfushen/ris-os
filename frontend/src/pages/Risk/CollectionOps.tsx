import { Typography, Tabs, Table, Tag, Button, Space, Select, Progress } from "antd";
import { Link } from "react-router-dom";
import { PhoneOutlined, CalendarOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

interface AccountRow {
  id: string;
  customer: string;
  productLine: string;
  dpd: number;
  balanceWan: number;
  strategy: string;
  lastContact: string;
  contactResult: "已承诺" | "拒接" | "协商中" | "未触达";
  promiseDate?: string;
  promiseSla?: string;
}

function mockPool(tier: "M1" | "M2" | "M3"): AccountRow[] {
  const base: AccountRow[] = [
    { id: "C-1001", customer: "赵六商贸", productLine: "经营贷", dpd: tier === "M1" ? 5 : tier === "M2" ? 38 : 72, balanceWan: 56, strategy: tier === "M3" ? "委外 M3+ 包" : "IVR 早触达", lastContact: "2026-04-17 10:20", contactResult: "已承诺", promiseDate: "2026-04-25", promiseSla: "剩 5 天" },
    { id: "C-1002", customer: "钱七服务", productLine: "消费贷", dpd: tier === "M1" ? 12 : tier === "M2" ? 45 : 95, balanceWan: 3.2, strategy: "人工 T+1", lastContact: "2026-04-16 15:02", contactResult: "协商中" },
    { id: "C-1003", customer: "孙八制造", productLine: "税易贷", dpd: tier === "M1" ? 8 : tier === "M2" ? 52 : 110, balanceWan: 120, strategy: tier === "M3" ? "法务函 + 委外" : "IVR 早触达", lastContact: "—", contactResult: "未触达" },
  ];
  return base;
}

const columns = [
  { title: "案件", dataIndex: "id", width: 88, render: (v: string) => <Text code className="text-[12px]">{v}</Text> },
  { title: "客户", dataIndex: "customer", render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
  { title: "产品线", dataIndex: "productLine", width: 88, render: (v: string) => <Tag className="!m-0 text-[11px]">{v}</Tag> },
  { title: "DPD", dataIndex: "dpd", width: 56, render: (v: number) => <Text className="text-[13px]">{v}</Text> },
  { title: "余额(万)", dataIndex: "balanceWan", width: 80 },
  { title: "匹配策略", dataIndex: "strategy", width: 120, ellipsis: true },
  { title: "最近触达", dataIndex: "lastContact", width: 130, render: (v: string) => <Text type="secondary" className="text-[11px]">{v}</Text> },
  {
    title: "触达结果",
    dataIndex: "contactResult",
    width: 88,
    render: (v: AccountRow["contactResult"]) => (
      <Tag color={v === "已承诺" ? "green" : v === "拒接" ? "red" : v === "协商中" ? "orange" : "default"} className="!m-0 text-[11px]">{v}</Tag>
    ),
  },
  {
    title: "承诺还款",
    key: "promise",
    width: 140,
    render: (_: unknown, r: AccountRow) =>
      r.promiseDate ? (
        <Space direction="vertical" size={0}>
          <Text className="text-[12px]"><CalendarOutlined className="mr-1" />{r.promiseDate}</Text>
          <Text type="secondary" className="text-[11px]">{r.promiseSla}</Text>
        </Space>
      ) : (
        <Text type="secondary" className="text-[12px]">—</Text>
      ),
  },
  {
    title: "操作",
    key: "op",
    width: 100,
    render: () => (
      <Space size={0}>
        <Button type="link" size="small" icon={<PhoneOutlined />} className="!px-0">记触达</Button>
        <Link to="/knowledge/scripts">
          <Button type="link" size="small" className="!px-0">话术</Button>
        </Link>
      </Space>
    ),
  },
];

function PoolTab({ tier }: { tier: "M1" | "M2" | "M3" }) {
  const data = mockPool(tier);
  return (
    <div className="space-y-3">
      <Space wrap>
        <Select size="small" placeholder="客群画像" style={{ width: 140 }} options={[{ value: "new", label: "首逾" }, { value: "old", label: "老客逾期" }]} />
        <Text type="secondary" className="text-[12px]">策略按逾期分档与客户画像自动匹配（演示）</Text>
      </Space>
      <Table size="small" rowKey="id" pagination={false} dataSource={data} columns={columns} scroll={{ x: 960 }} />
    </div>
  );
}

export default function CollectionOps() {
  return (
    <ModulePageShell
      title="催收作业管理"
      subtitle="M1 / M2 / M3+ 客户池、策略匹配、触达与承诺还款记录；承诺 SLA 跟踪；可跳转话术库（演示）"
      breadcrumb={["案件处置", "催收作业管理"]}
      actions={
        <Link to="/knowledge/scripts">
          <Button type="default" size="small">催收话术库</Button>
        </Link>
      }
    >
      <ModuleSectionCard title="分池概览" subtitle="关键作业指标（演示）">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "M1 在催户数", v: "1,248", sub: "IVR 覆盖率 78%" },
            { label: "M2 在催户数", v: "412", sub: "人工介入率 91%" },
            { label: "M3+ 委外", v: "186", sub: "回款率滚动 14%" },
            { label: "承诺 SLA 临期", v: "23", sub: "48h 内需跟进" },
          ].map((x) => (
            <div key={x.label} className="rounded-lg border border-black/[0.08] bg-[#fafafa] p-3">
              <Text type="secondary" className="text-[11px] block">{x.label}</Text>
              <Text strong className="text-lg block">{x.v}</Text>
              <Text type="secondary" className="text-[11px]">{x.sub}</Text>
            </div>
          ))}
        </div>
      </ModuleSectionCard>

      <ModuleSectionCard title="客户池作业" subtitle="按账龄分 Tab 切换">
        <Tabs
          items={[
            { key: "m1", label: "M1 池", children: <PoolTab tier="M1" /> },
            { key: "m2", label: "M2 池", children: <PoolTab tier="M2" /> },
            { key: "m3", label: "M3+ 池", children: <PoolTab tier="M3" /> },
          ]}
        />
      </ModuleSectionCard>

      <ModuleSectionCard title="承诺还款 SLA" subtitle="临期未兑现自动标红（演示）">
        <Progress percent={72} size="small" status="active" />
        <Text type="secondary" className="text-[12px] block mt-2">本周承诺兑现率 72%；低于目标时推送至班长工作台。</Text>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
