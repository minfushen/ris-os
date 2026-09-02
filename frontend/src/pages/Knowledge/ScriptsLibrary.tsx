/**
 * 催收话术库 — 按行业和逾期档位组织的催收话术管理
 *
 * 对应招标交付：预警处置流程设计方案 — 催收作业话术辅助
 */

import { useState } from "react";
import { Typography, Tag, Input, Space, Select, Card, Collapse, Alert, Table } from "antd";
import { SearchOutlined, BookOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

interface ScriptTemplate {
  id: string;
  industry: string;
  dpdBucket: string;
  scene: string;
  title: string;
  content: string;
  complianceNotes: string[];
  tags: string[];
}

const SCRIPT_DATA: ScriptTemplate[] = [
  {
    id: "SC-01",
    industry: "制造业",
    dpdBucket: "M0",
    scene: "还款提醒",
    title: "早期还款提醒（惠快贷）",
    content: "您好，我是头部农商行客户经理。贵司惠快贷本月还款日临近，提醒您按时归还应还本息。如已安排，请忽略本条。如有临时周转困难，可提前联系沟通。",
    complianceNotes: ["工作日 9:00-18:00 触达", "禁止威胁恐吓", "不泄露债务信息给第三方"],
    tags: ["温和提醒", "征信教育"],
  },
  {
    id: "SC-02",
    industry: "批发零售",
    dpdBucket: "M1",
    scene: "逾期催收",
    title: "首次逾期 — 回款延迟沟通",
    content: "您好，贵司贷款已逾期 X 天。近期批发零售行业回款周期较长，我们理解经营压力。请问预计何时可安排还款？我可为您登记协商还款计划。",
    complianceNotes: ["语气平和共情", "记录客户承诺与还款日期", "不承诺未经审批的还款方案"],
    tags: ["协商还款", "行业理解"],
  },
  {
    id: "SC-03",
    industry: "住宿餐饮",
    dpdBucket: "M2",
    scene: "逾期跟进",
    title: "持续逾期 — 经营核实",
    content: "您好，贷款已逾期超 30 天。根据银行贷后管理要求，需您提供近期经营流水与可行还款计划。如逾期持续将影响后续信贷业务办理。请于 3 个工作日内回复。",
    complianceNotes: ["后果告知需有政策依据", "不夸大法律后果", "全程录音留痕"],
    tags: ["施压沟通", "经营核实"],
  },
  {
    id: "SC-04",
    industry: "建筑业",
    dpdBucket: "M1",
    scene: "工程款延期",
    title: "建筑业专项 — 工程回款延迟场景",
    content: "您好，了解到贵司近期项目工程款回款延迟。建筑业回款周期长属行业常态，我行可为您评估弹性还款方案，请提供工程合同与预期回款时间安排。",
    complianceNotes: ["不代客户做还款承诺", "弹性方案需风控审批后执行"],
    tags: ["行业专项", "弹性方案"],
  },
  {
    id: "SC-05",
    industry: "全行业",
    dpdBucket: "M3+",
    scene: "最后通知",
    title: "深度逾期 — 法律程序告知",
    content: "您好，贷款已逾期超 90 天，触发重大风险预警。请于 5 个工作日内偿还欠款或提交切实可行的还款计划。银行将保留依法追偿的权利。",
    complianceNotes: ["仅风控主管授权后使用", "法律措辞需法务审核", "全程录音录像"],
    tags: ["法律告知", "升级处置"],
  },
  {
    id: "SC-06",
    industry: "批发零售",
    dpdBucket: "M0",
    scene: "节前提醒",
    title: "季节性 — 节前备货资金提醒",
    content: "您好，节假日备货季即将到来，往年此时期资金需求较大。请提前规划还款安排，确保征信记录良好，也便于后续信贷服务的连续性。",
    complianceNotes: ["不暗示可新增贷款", "以征信保护为沟通主线"],
    tags: ["季节性提醒", "征信保护"],
  },
];

const DPD_OPTIONS = [
  { label: "M0 早期提醒（1-7天）", value: "M0" },
  { label: "M1 逾期催收（8-30天）", value: "M1" },
  { label: "M2 中期催收（31-90天）", value: "M2" },
  { label: "M3+ 深度催收（91天+）", value: "M3+" },
];

export default function ScriptsLibrary() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);
  const [dpdFilter, setDpdFilter] = useState<string | null>(null);

  const filtered = SCRIPT_DATA.filter((s) => {
    if (search && !s.title.includes(search) && !s.content.includes(search)) return false;
    if (industryFilter && s.industry !== industryFilter) return false;
    if (dpdFilter && s.dpdBucket !== dpdFilter) return false;
    return true;
  });

  return (
    <ModulePageShell
      title="催收话术库"
      subtitle="按行业与逾期档位组织的合规话术模板，支持搜索筛选与版本管理"
      breadcrumb={["知识沉淀", "催收话术库"]}
    >
      <Alert
        type="info"
        showIcon
        className="rounded-lg mb-2"
        message="对应招标交付：预警处置流程设计方案 — 催收作业话术辅助"
        description="话术经法务审核，挂载合规要点标签，催收人员按场景选用。质检系统可自动比对通话录音与话术合规边界。"
      />

      <ModuleSectionCard title="话术模板库" subtitle={`共 ${filtered.length} 条匹配`}>
        <Space className="mb-4" wrap>
          <Input
            placeholder="搜索话术关键词"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
          <Select
            placeholder="行业"
            value={industryFilter}
            onChange={setIndustryFilter}
            allowClear
            style={{ width: 130 }}
            options={["制造业", "批发零售", "住宿餐饮", "服务业", "建筑业", "全行业"].map((i) => ({ label: i, value: i }))}
          />
          <Select
            placeholder="逾期档位"
            value={dpdFilter}
            onChange={setDpdFilter}
            allowClear
            style={{ width: 200 }}
            options={DPD_OPTIONS}
          />
        </Space>

        {filtered.map((script) => (
          <Card
            key={script.id}
            size="small"
            className="mb-3"
            title={
              <Space wrap>
                <BookOutlined />
                <Text strong className="text-[13px]">{script.title}</Text>
                <Tag>{script.industry}</Tag>
                <Tag color="blue">{script.dpdBucket}</Tag>
              </Space>
            }
          >
            <Collapse
              ghost
              items={[
                {
                  key: "body",
                  label: <Text className="text-[12px]">话术内容</Text>,
                  children: <Text className="text-[14px] leading-relaxed">{script.content}</Text>,
                },
                {
                  key: "compliance",
                  label: <Text className="text-[12px]">合规要点（{script.complianceNotes.length} 条）</Text>,
                  children: (
                    <ul className="list-disc list-inside space-y-1">
                      {script.complianceNotes.map((n, i) => (
                        <li key={i} className="text-[13px] text-orange-700">{n}</li>
                      ))}
                    </ul>
                  ),
                },
              ]}
            />
            <Space className="mt-2" size={[0, 4]}>
              {script.tags.map((t) => (
                <Tag key={t} color="green" className="text-[11px]">{t}</Tag>
              ))}
            </Space>
          </Card>
        ))}
        {filtered.length === 0 && <Alert type="warning" message="未找到匹配话术" showIcon />}
      </ModuleSectionCard>

      <Table
        className="mt-4"
        dataSource={filtered}
        rowKey="id"
        size="small"
        pagination={false}
        columns={[
          { title: "编号", dataIndex: "id", width: 72, render: (v: string) => <Text code>{v}</Text> },
          { title: "场景", dataIndex: "scene", width: 120 },
          { title: "行业", dataIndex: "industry", width: 100, render: (v: string) => <Tag>{v}</Tag> },
          { title: "档位", dataIndex: "dpdBucket", width: 70, render: (v: string) => <Tag color="blue">{v}</Tag> },
          { title: "话术标题", dataIndex: "title" },
          { title: "合规要点", key: "c", width: 100, render: (_: unknown, r: ScriptTemplate) => <Tag color="orange">{r.complianceNotes.length} 项</Tag> },
        ]}
      />
    </ModulePageShell>
  );
}
