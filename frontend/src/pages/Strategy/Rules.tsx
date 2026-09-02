import { Typography, Tree, Button, Space, Form, Input, InputNumber, Table, Alert, Divider, Card, Slider, Tag, Drawer, Select, message } from "antd";
import { PlusOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import DemoFlowNav from "@/components/DemoFlowNav";
import { mockAlerts } from "@/mock/data";
import { RISK_LEVEL_COLORS, RISK_LEVEL_TEXT } from "@/types/qcc";

const { Text } = Typography;
const { Option } = Select;

const RULE_ALERT_MAP: Record<string, string[]> = {
  "rule-tax-gap": ["税报断档"],
  "rule-energy": ["经营空心化"],
  "rule-executed": ["司法风险"],
  "rule-lawsuit": ["司法风险"],
  "rule-multi-balance": ["多头共债", "多头", "共债"],
  "rule-repay-pattern": ["资金挪用", "资金"],
  "rule-biz-change": ["经营异常"],
};

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
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  const matrixRows = useMemo(() => buildMatrix(matrixBase), [matrixBase]);

  const triggerEstimate = useMemo(() => {
    const base = 1840;
    return Math.max(200, Math.round(base + simBoost * 42 - matrixBase * 4));
  }, [simBoost, matrixBase]);

  const matchedAlerts = useMemo(() => {
    const keywords = RULE_ALERT_MAP[selectedRule] ?? [];
    if (keywords.length === 0) return [];
    return mockAlerts.filter((a) => keywords.some((kw) => a.alert_type.includes(kw))).slice(0, 5);
  }, [selectedRule]);

  return (
    <ModulePageShell
      title="预警规则配置"
      subtitle="贷后规则树 + 行业分层阈值矩阵；原位仿真调整参数后即时预览触发量变化（演示）"
      breadcrumb={["策略与模型", "预警规则配置"]}
    >
      <Alert
        type="info"
        showIcon
        className="rounded-lg mb-2"
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
              <Button type="link" size="small" icon={<PlusOutlined />} className="text-[13px]" onClick={() => setCreateOpen(true)}>
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

            {/* 最近命中预警 — 串联规则 → 预警工作台 */}
            {matchedAlerts.length > 0 && (
              <>
                <Divider className="!my-2" />
                <div>
                  <Text strong className="text-[13px] block mb-2">最近命中预警</Text>
                  <Table
                    size="small"
                    pagination={false}
                    rowKey="id"
                    dataSource={matchedAlerts}
                    columns={[
                      {
                        title: "企业名称",
                        dataIndex: "company_name",
                        render: (name: string, record: import("@/types/enterprise").Alert) => (
                          <Link to={`/risk/workbench?alert_id=${record.id}`} className="text-blue-600 text-xs">
                            {name}
                          </Link>
                        ),
                      },
                      {
                        title: "预警等级",
                        dataIndex: "alert_level",
                        width: 90,
                        render: (level: string) => (
                          <Tag color={RISK_LEVEL_COLORS[level]} className="text-[10px]">{RISK_LEVEL_TEXT[level]}</Tag>
                        ),
                      },
                      {
                        title: "预警类型",
                        dataIndex: "alert_type",
                        width: 100,
                        className: "text-xs",
                      },
                      {
                        title: "触发时间",
                        dataIndex: "triggered_at",
                        width: 110,
                        render: (t: string) => new Date(t).toLocaleDateString("zh-CN"),
                        className: "text-xs",
                      },
                    ]}
                  />
                </div>
              </>
            )}

            <Divider className="!my-2" />

            <Form layout="vertical" size="small">
              <Form.Item label="规则说明（对内）">
                <Input.TextArea rows={2} placeholder="口径、数据来源、例外场景…" defaultValue="环比统计窗口 T-30~T-0，剔除节假日。" />
              </Form.Item>
              <Space>
                <Button type="primary" size="small" onClick={() => message.success("规则已保存")}>保存</Button>
                <Button size="small">取消</Button>
              </Space>
            </Form>
          </div>
        </div>
      </ModuleSectionCard>

      {/* 新建规则抽屉 */}
      <Drawer
        title="新建预警规则"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        width={520}
        footer={
          <Space>
            <Button onClick={() => setCreateOpen(false)}>取消</Button>
            <Button type="primary" loading={createLoading} onClick={async () => {
              try {
                const values = await createForm.validateFields();
                setCreateLoading(true);
                await new Promise((r) => setTimeout(r, 600));
                message.success(`规则「${values.name}」已创建并加入规则树`);
                setCreateOpen(false);
                createForm.resetFields();
              } catch {
                message.error("请完善必填信息");
              } finally {
                setCreateLoading(false);
              }
            }}>
              创建规则
            </Button>
          </Space>
        }
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="name" label="规则名称" rules={[{ required: true, message: "请输入规则名称" }]}>
            <Input placeholder="如：多头余额环比跳升阈值" />
          </Form.Item>
          <Form.Item name="category" label="规则类别" rules={[{ required: true, message: "请选择规则类别" }]}>
            <Select placeholder="选择规则类别">
              <Option value="经营异常">经营异常</Option>
              <Option value="司法风险">司法风险</Option>
              <Option value="资金压力">资金压力</Option>
              <Option value="还款行为">还款行为</Option>
            </Select>
          </Form.Item>
          <Form.Item name="threshold" label="默认阈值（%）" initialValue={35}>
            <InputNumber min={10} max={80} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label="规则说明">
            <Input.TextArea rows={3} placeholder="规则口径、数据来源、例外场景…" />
          </Form.Item>
        </Form>
      </Drawer>

      <DemoFlowNav />
    </ModulePageShell>
  );
}
