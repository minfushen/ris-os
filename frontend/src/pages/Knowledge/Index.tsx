/**
 * 知识沉淀首页 — 贷后风控经验资产总览
 *
 * 对应招标交付：知识库建设（话术、案例、风险模式三大资产）
 */

import { Typography, Row, Col, Card, Statistic, Table, Tag, Timeline } from "antd";
import { BookOutlined, FileTextOutlined, SafetyCertificateOutlined, ArrowRightOutlined, RiseOutlined, FallOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text, Title } = Typography;

const CARDS = [
  {
    key: "scripts",
    title: "催收话术库",
    desc: "按行业与逾期分档组织话术与合规要点，催收作业与核查工作台可引用。",
    to: "/knowledge/scripts",
    icon: <BookOutlined className="text-2xl" style={{ color: "#5f9b7a" }} />,
    stats: { label: "话术模板", value: 6 },
  },
  {
    key: "rules",
    title: "规则调优案例库",
    desc: "记录参数调整前后触发量、有效率与误报变化，服务策略效果追踪闭环。",
    to: "/knowledge/rule-cases",
    icon: <FileTextOutlined className="text-2xl" style={{ color: "#4f6970" }} />,
    stats: { label: "调优案例", value: 5 },
  },
  {
    key: "fraud",
    title: "风险模式库",
    desc: "真实案例沉淀（资金挪用、团伙共债等），可在工作台备注中引用模式编号。",
    to: "/knowledge/fraud-patterns",
    icon: <SafetyCertificateOutlined className="text-2xl" style={{ color: "#c77b78" }} />,
    stats: { label: "风险模式", value: 5 },
  },
];

const RECENT_ACTIVITY = [
  { id: 1, action: "话术模板 SC-05（深度逾期法律程序告知）通过法务复审", time: "2026-04-25", tag: "话术库" },
  { id: 2, action: "调优案例 RC-04（对公回流阈值）触发量超预期 +24%，进入灰度观察", time: "2026-04-18", tag: "调优" },
  { id: 3, action: "新增风险模式 FP-05（经营空心化 · 社保人数骤降），19 个关联案例", time: "2026-04-15", tag: "模式库" },
  { id: 4, action: "RC-05（司法权重调优）已全量发布，有效率提升 +5ppt", time: "2026-04-12", tag: "调优" },
  { id: 5, action: "FP-01（资金挪用模式）新增 3 条识别信号，案例池扩展至 23 例", time: "2026-04-08", tag: "模式库" },
];

const CROSS_REFERENCE = [
  { from: "数据字典", to: "特征工作室", desc: "变量注册后在特征工作室中加工为风险特征" },
  { from: "特征工作室", to: "模型工厂", desc: "特征集被模型工厂实验引用为训练输入" },
  { from: "模型工厂", to: "模型版本库", desc: "候选模型注册进入版本库，走准入评审" },
  { from: "模型版本库", to: "决策流编排", desc: "Champion 模型部署至决策流的模型评分节点" },
  { from: "决策流编排", to: "仿真回溯", desc: "决策流变更前通过回溯验证历史效果" },
  { from: "预警核查工作台", to: "风险模式库", desc: "核查时引用 FP 编号作为判定依据" },
  { from: "预警规则配置", to: "风险模式库", desc: "模式信号直接用于规则设计与阈值设定" },
  { from: "调优案例", to: "仿真回溯", desc: "调优结论反馈到回溯页面验证分层效果" },
];

export default function KnowledgeIndex() {
  return (
    <ModulePageShell
      title="知识沉淀"
      subtitle="贷后风控经验资产：发现问题 → 处置 → 沉淀 → 再调用，与预警核查工作台联动"
      breadcrumb={["数据与特征", "知识沉淀"]}
    >
      {/* 三大资产卡片 */}
      <ModuleSectionCard>
        <Row gutter={[16, 16]}>
          {CARDS.map((c) => (
            <Col xs={24} md={8} key={c.key}>
              <Link to={c.to} className="block no-underline text-inherit h-full">
                <Card
                  hoverable
                  className="h-full rounded-lg border border-black/[0.08] shadow-sm"
                  styles={{ body: { minHeight: 160 } }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {c.icon}
                    <div className="flex-1 min-w-0">
                      <Text strong className="text-base block">{c.title}</Text>
                      <Text type="secondary" className="text-[13px] block mt-1">{c.desc}</Text>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Statistic title={c.stats.label} value={c.stats.value} valueStyle={{ fontSize: 20, color: "#1677ff" }} />
                    <Text className="text-primary text-[13px] inline-flex items-center gap-1">
                      进入 <ArrowRightOutlined />
                    </Text>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </ModuleSectionCard>

      {/* 最近动态 */}
      <ModuleSectionCard title="最近动态" subtitle="知识资产的更新与变更记录">
        <Timeline
          items={RECENT_ACTIVITY.map((item) => ({
            color: item.tag === "话术库" ? "green" : item.tag === "调优" ? "blue" : "red",
            children: (
              <div className="flex items-start justify-between gap-4">
                <Text className="text-[13px] flex-1">{item.action}</Text>
                <Space size={4}>
                  <Tag color={item.tag === "话术库" ? "green" : item.tag === "调优" ? "blue" : "red"} className="!m-0 text-[11px]">
                    {item.tag}
                  </Tag>
                  <Text type="secondary" className="text-[11px] whitespace-nowrap">{item.time}</Text>
                </Space>
              </div>
            ),
          }))}
        />
      </ModuleSectionCard>

      {/* 跨模块引用关系 */}
      <ModuleSectionCard title="跨模块引用" subtitle="知识资产与业务功能模块的联动关系">
        <Table
          size="small"
          rowKey="from"
          pagination={false}
          dataSource={CROSS_REFERENCE}
          columns={[
            { title: "来源模块", dataIndex: "from", width: 160, render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
            {
              title: "关联",
              key: "link",
              width: 40,
              render: () => <ArrowRightOutlined className="text-gray-400" />,
            },
            { title: "目标资产", dataIndex: "to", width: 140, render: (v: string) => <Tag color="blue">{v}</Tag> },
            { title: "联动说明", dataIndex: "desc", render: (v: string) => <Text type="secondary" className="text-[13px]">{v}</Text> },
          ]}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
