/**
 * 规则调优案例 — 记录策略参数调整前后的效果变化
 *
 * 对应招标交付：策略与模型迭代优化方案
 */

import { useState } from "react";
import { Typography, Table, Tag, Select, Space, Card, Descriptions } from "antd";
import { RiseOutlined, FallOutlined, MinusOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import DemoFlowNav from "@/components/DemoFlowNav";

const { Text } = Typography;

interface TuneCase {
  id: string;
  ruleName: string;
  industry: string;
  paramName: string;
  before: string;
  after: string;
  triggersDelta: string;
  effDelta: string;
  fpDelta: string;
  result: string;
  reason: string;
  date: string;
}

const TUNE_CASES: TuneCase[] = [
  {
    id: "RC-01",
    ruleName: "税报断档天数阈值",
    industry: "全行业",
    paramName: "断档天数",
    before: "45天",
    after: "30天",
    triggersDelta: "+18%",
    effDelta: "-4ppt",
    fpDelta: "+2ppt",
    result: "灰度观察",
    reason: "收紧后覆盖更多风险企业，但误报同步上升，需结合实控人变更信号联合判断",
    date: "2026-03-15",
  },
  {
    id: "RC-02",
    ruleName: "制造业多头余额环比阈值",
    industry: "制造业",
    paramName: "环比跳升%",
    before: "35%",
    after: "38%",
    triggersDelta: "+6%",
    effDelta: "+3ppt",
    fpDelta: "-1ppt",
    result: "已全量",
    reason: "调高阈值后精准命中真实多头跳升，误报下降，制造业主营收入稳定，适度宽容更优",
    date: "2026-03-22",
  },
  {
    id: "RC-03",
    ruleName: "住宿餐饮水电能耗降幅阈值",
    industry: "住宿餐饮",
    paramName: "能耗降幅%",
    before: "50%",
    after: "40%",
    triggersDelta: "+12%",
    effDelta: "+6ppt",
    fpDelta: "+4ppt",
    result: "已全量",
    reason: "季节调整后灵敏度提升，有效识别淡季经营收缩与真实停业的差异",
    date: "2026-04-01",
  },
  {
    id: "RC-04",
    ruleName: "对公回流个人账户金额阈值",
    industry: "批发零售",
    paramName: "单笔金额",
    before: "50万",
    after: "30万",
    triggersDelta: "+24%",
    effDelta: "+8ppt",
    fpDelta: "+5ppt",
    result: "灰度观察",
    reason: "降额后覆盖面扩大，需结合行业回款周期（批发零售旺季回款可达日均百万）判断，建议按季节分层",
    date: "2026-04-10",
  },
  {
    id: "RC-05",
    ruleName: "被执行/限高记录权重",
    industry: "全行业",
    paramName: "模型权重",
    before: "0.15",
    after: "0.22",
    triggersDelta: "+9%",
    effDelta: "+5ppt",
    fpDelta: "+1ppt",
    result: "已全量",
    reason: "司法信号是强风险因子，提权后命中率有效提升，误报增幅可接受",
    date: "2026-04-18",
  },
];

function deltaTag(v: string) {
  const isPositive = v.startsWith("+");
  const isNegative = v.startsWith("-");
  return (
    <Space size={4}>
      {isPositive ? <RiseOutlined className="text-red-500" /> : isNegative ? <FallOutlined className="text-green-500" /> : <MinusOutlined />}
      <Text className={isPositive ? "text-red-600" : isNegative ? "text-green-600" : "text-gray-500"}>{v}</Text>
    </Space>
  );
}

export default function RuleTuneCases() {
  const [selectedCase, setSelectedCase] = useState<TuneCase | null>(null);
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);

  const filtered = industryFilter
    ? TUNE_CASES.filter((c) => c.industry === industryFilter || c.industry === "全行业")
    : TUNE_CASES;

  return (
    <ModulePageShell
      title="策略调优案例"
      subtitle="参数调整前后效果对比，支撑策略迭代决策与发布审批引用"
      breadcrumb={["知识沉淀", "调优案例"]}
    >
      <ModuleSectionCard title="调优案例列表" subtitle={`共 ${filtered.length} 条`}>
        <Space className="mb-3">
          <Select
            placeholder="行业筛选"
            value={industryFilter}
            onChange={setIndustryFilter}
            allowClear
            style={{ width: 150 }}
            options={["制造业", "批发零售", "住宿餐饮", "服务业"].map((i) => ({ label: i, value: i }))}
          />
        </Space>
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={filtered}
          onRow={(r) => ({ onClick: () => setSelectedCase(r), style: { cursor: "pointer", background: selectedCase?.id === r.id ? "#e6f4ff" : undefined } })}
          columns={[
            { title: "编号", dataIndex: "id", width: 72, render: (v: string) => <Text code className="text-[12px]">{v}</Text> },
            { title: "规则", dataIndex: "ruleName", ellipsis: true },
            { title: "行业", dataIndex: "industry", width: 90 },
            { title: "触发量Δ", dataIndex: "triggersDelta", width: 90, render: deltaTag },
            { title: "有效率Δ", dataIndex: "effDelta", width: 90, render: deltaTag },
            { title: "误报Δ", dataIndex: "fpDelta", width: 90, render: deltaTag },
            { title: "结论", dataIndex: "result", width: 100, render: (v: string) => <Tag color={v === "已全量" ? "green" : "gold"}>{v}</Tag> },
          ]}
        />
      </ModuleSectionCard>

      {selectedCase && (
        <Card title={`调优详情 · ${selectedCase.id}`} size="small" className="mt-4">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="规则名称">{selectedCase.ruleName}</Descriptions.Item>
            <Descriptions.Item label="适用行业">{selectedCase.industry}</Descriptions.Item>
            <Descriptions.Item label="调优参数">{selectedCase.paramName}</Descriptions.Item>
            <Descriptions.Item label="调优日期">{selectedCase.date}</Descriptions.Item>
            <Descriptions.Item label="调前值">{selectedCase.before}</Descriptions.Item>
            <Descriptions.Item label="调后值">{selectedCase.after}</Descriptions.Item>
            <Descriptions.Item label="触发量变化">{deltaTag(selectedCase.triggersDelta)}</Descriptions.Item>
            <Descriptions.Item label="有效率变化">{deltaTag(selectedCase.effDelta)}</Descriptions.Item>
            <Descriptions.Item label="误报率变化">{deltaTag(selectedCase.fpDelta)}</Descriptions.Item>
            <Descriptions.Item label="结论"><Tag color={selectedCase.result === "已全量" ? "green" : "gold"}>{selectedCase.result}</Tag></Descriptions.Item>
            <Descriptions.Item label="分析" span={2}>{selectedCase.reason}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <DemoFlowNav />
    </ModulePageShell>
  );
}
