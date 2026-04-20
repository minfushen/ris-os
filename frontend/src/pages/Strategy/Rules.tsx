import { Typography, Tree, Button, Space, Form, Input, InputNumber, Table, Alert, Divider, Card, Slider } from "antd";
import { PlusOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

/** 贷后预警规则树 */
const RULE_TREE = [
  {
    title: "经营异常",
    key: "biz-abnormal",
    children: [
      { title: "工商变更 / 法人变更", key: "rule-biz-change" },
      { title: "税报连续断档", key: "rule-tax-gap" },
      { title: "水电能耗骤降", key: "rule-energy" },
    ],
  },
  {
    title: "司法风险",
    key: "legal",
    children: [
      { title: "被执行 / 限高", key: "rule-executed" },
      { title: "立案未结", key: "rule-lawsuit" },
    ],
  },
  {
    title: "资金压力",
    key: "cash",
    children: [
      { title: "多头余额跳升", key: "rule-multi-balance" },
      { title: "在贷账户异常还款", key: "rule-repay-pattern" },
    ],
  },
];

const INDUSTRIES = ["制造业", "服务业", "批发零售", "住宿餐饮"] as const;

const INDUSTRY_META: Record<(typeof INDUSTRIES)[number], { acc: string; fp: string; delta: number }> = {
  制造业: { acc: "71%", fp: "19%", delta: 0 },
  服务业: { acc: "66%", fp: "24%", delta: 3 },
  批发零售: { acc: "63%", fp: "28%", delta: 8 },
  住宿餐饮: { acc: "60%", fp: "31%", delta: 5 },
};

/** 行业分层阈值矩阵（演示：多头余额环比 %） */
function buildMatrix(base: number) {
  return INDUSTRIES.map((ind) => ({
    industry: ind,
    threshold: Math.round(base + INDUSTRY_META[ind].delta),
    acc: INDUSTRY_META[ind].acc,
    fp: INDUSTRY_META[ind].fp,
  }));
}

export default function Rules() {
  const [selectedRule, setSelectedRule] = useState<string>("rule-multi-balance");
  const [matrixBase, setMatrixBase] = useState(35);
  const [simBoost, setSimBoost] = useState(0);

  const matrixRows = useMemo(() => buildMatrix(matrixBase), [matrixBase]);

  const triggerEstimate = useMemo(() => {
    const base = 1840;
    return Math.max(200, Math.round(base + simBoost * 42 - matrixBase * 4));
  }, [simBoost, matrixBase]);

  return (
    <ModulePageShell
      title="预警规则配置"
      subtitle="贷后规则树 + 行业分层阈值矩阵；原位仿真调整参数后即时预览触发量变化（演示）"
      breadcrumb={["预警策略", "预警规则配置"]}
    >
      <Alert
        type="info"
        showIcon
        className="rounded-[var(--radius-card,8px)] mb-2"
        message="与授信规则差异"
        description="已下线年龄准入、黑名单单笔阈值等授信树节点；阈值按行业分面配置，避免一刀切误报。"
      />

      <ModuleSectionCard>
        <div className="layout-flex layout-gap-lg flex-col lg:flex-row">
          <div
            className="layout-p-md border border-border-soft bg-[#fafafa] shrink-0 w-full lg:w-[300px]"
          >
            <div className="layout-flex-between layout-mb-sm">
              <Text strong className="text-[13px]">贷后规则目录</Text>
              <Button type="link" size="small" icon={<PlusOutlined />} className="text-[13px]">
                新建
              </Button>
            </div>
            <Tree
              treeData={RULE_TREE}
              selectedKeys={[selectedRule]}
              onSelect={(keys) => keys[0] && setSelectedRule(keys[0] as string)}
              defaultExpandAll
            />
          </div>

          <div className="layout-flex-1 layout-p-md border border-border-soft space-y-4">
            <Text strong className="text-[13px] block">规则详情 · 行业分层阈值</Text>
            <Text type="secondary" className="text-[12px] block">
              当前节点：{selectedRule === "rule-multi-balance" ? "多头余额跳升" : selectedRule} — 以下为「多头余额环比」阈值（%）按行业矩阵。
            </Text>

            <Table
              size="small"
              pagination={false}
              rowKey="industry"
              dataSource={matrixRows}
              columns={[
                { title: "行业", dataIndex: "industry", width: 100 },
                {
                  title: "阈值（%）",
                  dataIndex: "threshold",
                  render: (v: number, record: { industry: (typeof INDUSTRIES)[number]; threshold: number }) => (
                    <InputNumber
                      min={10}
                      max={80}
                      value={v}
                      size="small"
                      onChange={(nv) => {
                        const next = nv ?? v;
                        setMatrixBase(next - INDUSTRY_META[record.industry].delta);
                      }}
                    />
                  ),
                },
                { title: "近30d精度(演示)", dataIndex: "acc", width: 110 },
                { title: "误报率(演示)", dataIndex: "fp", width: 100 },
              ]}
            />

            <Divider className="!my-2" />

            <Card size="small" className="bg-[#fafafa] border-dashed">
              <Space align="center" wrap>
                <ThunderboltOutlined className="text-[#faad14]" />
                <Text strong className="text-[12px]">原位仿真</Text>
                <Text type="secondary" className="text-[12px]">拖动模拟「阈值整体收紧」对触发量的影响</Text>
              </Space>
              <div className="mt-3 max-w-md">
                <Text type="secondary" className="text-[11px] block mb-1">参数偏移量</Text>
                <Slider min={-5} max={10} value={simBoost} onChange={setSimBoost} marks={{ 0: "基线", 10: "+紧" }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-6">
                <div>
                  <Text type="secondary" className="text-[11px] block">预估日触发量</Text>
                  <Text strong className="text-[20px] text-[#c77b78]">{triggerEstimate.toLocaleString()}</Text>
                  <Text type="secondary" className="text-[11px] ml-2">笔/日</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-[11px] block">预估有效率</Text>
                  <Text strong className="text-[20px] text-[#5f9b7a]">{Math.max(52, 72 - simBoost * 2)}%</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-[11px] block">预估误报率</Text>
                  <Text strong className="text-[20px] text-[#d46b08]">{Math.min(42, 22 + simBoost * 1.5).toFixed(1)}%</Text>
                </div>
              </div>
            </Card>

            <Divider className="!my-2" />

            <Form layout="vertical" size="small">
              <Form.Item label="规则说明（对内）">
                <Input.TextArea rows={2} placeholder="口径、数据来源、例外场景…" defaultValue="环比统计窗口 T-30~T-0，剔除节假日。" />
              </Form.Item>
              <Space>
                <Button type="primary" size="small">保存</Button>
                <Button size="small">取消</Button>
              </Space>
            </Form>
          </div>
        </div>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
