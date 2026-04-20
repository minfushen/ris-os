import { useEffect, useMemo, useState } from "react";
import { Typography, Table, Tag, Button, Space, Input, Select, Row, Col, Card, Divider, Radio, Descriptions, List, Alert } from "antd";
import {
  SearchOutlined,
  UserSwitchOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  RiseOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;
const { TextArea } = Input;

interface QueueRow {
  id: string;
  customer: string;
  productLine: string;
  riskLevel: "high" | "medium" | "low";
  hitRule: string;
  sla: string;
  balanceWan: number;
}

const QUEUE: QueueRow[] = [
  { id: "W-240418-01", customer: "张三科技", productLine: "经营贷", riskLevel: "high", hitRule: "司法被执行", sla: "剩 4h", balanceWan: 180 },
  { id: "W-240418-02", customer: "李四贸易", productLine: "税易贷", riskLevel: "medium", hitRule: "税报断档", sla: "剩 1天", balanceWan: 42 },
  { id: "W-240418-03", customer: "王五物流", productLine: "消费贷", riskLevel: "low", hitRule: "多头余额跳升", sla: "剩 3天", balanceWan: 8 },
];

const SIGNALS = [
  { title: "司法", desc: "2026-04-12 新增被执行案号 (2026)浙01执***" },
  { title: "资金流", desc: "近14日对公流出环比 +38%，对手方集中度上升" },
  { title: "征信", desc: "他行贷记卡使用率 89%，查询次数 +6（30d）" },
];

const HISTORY = [
  "2026-03-01 贷后常规回访 · 正常",
  "2025-11-20 支用复核 · 通过",
  "2025-06-10 授信审批 · 通过",
];

export default function Workbench() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<QueueRow | null>(QUEUE[0]);
  const [conclusion, setConclusion] = useState<string>("");
  const [structured, setStructured] = useState<string | undefined>();
  const [notes, setNotes] = useState("");

  const alertFromNav = useMemo(() => (location.state as { alertId?: string } | null)?.alertId, [location.state]);

  useEffect(() => {
    if (alertFromNav) {
      const row = QUEUE.find((q) => q.id === alertFromNav);
      if (row) setSelected(row);
    }
  }, [alertFromNav]);

  const columns = [
    { title: "预警单", dataIndex: "id", width: 120, render: (v: string) => <Text code className="text-[12px]">{v}</Text> },
    { title: "客户", dataIndex: "customer", width: 100, render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
    { title: "产品线", dataIndex: "productLine", width: 88, render: (v: string) => <Tag className="!m-0 text-[11px]">{v}</Tag> },
    {
      title: "风险等级",
      dataIndex: "riskLevel",
      width: 88,
      render: (v: QueueRow["riskLevel"]) => (
        <Tag color={v === "high" ? "red" : v === "medium" ? "orange" : "blue"} className="!m-0 text-[11px]">
          {v === "high" ? "高" : v === "medium" ? "中" : "低"}
        </Tag>
      ),
    },
    { title: "命中规则", dataIndex: "hitRule", ellipsis: true, render: (v: string) => <Text className="text-[12px]">{v}</Text> },
    { title: "SLA", dataIndex: "sla", width: 80, render: (v: string) => <Text className="text-[12px] text-[#d46b08]">{v}</Text> },
  ];

  return (
    <ModulePageShell
      title="预警核查工作台"
      subtitle="合并原预警队列与核查要点：左侧队列筛选，右侧在贷信息 / 触发信号 / 历史记录一体处置（演示）"
      breadcrumb={["案件处置", "预警核查工作台"]}
      actions={
        <Space wrap>
          <Link to="/knowledge">
            <Button size="small" icon={<BookOutlined />}>知识沉淀</Button>
          </Link>
          <Button size="small" onClick={() => navigate("/monitor/dashboard")}>探照灯</Button>
        </Space>
      }
    >
      <ModuleSectionCard>
        <Space wrap className="w-full">
          <Input placeholder="客户 / 证件 / 预警单号" style={{ width: 180 }} size="small" />
          <Select placeholder="风险等级" allowClear style={{ width: 110 }} size="small" options={[{ value: "high", label: "高" }, { value: "medium", label: "中" }, { value: "low", label: "低" }]} />
          <Select placeholder="产品线" allowClear style={{ width: 120 }} size="small" options={[{ value: "经营贷", label: "经营贷" }, { value: "税易贷", label: "税易贷" }, { value: "消费贷", label: "消费贷" }]} />
          <Select placeholder="SLA" allowClear style={{ width: 100 }} size="small" options={[{ value: "4h", label: "4h 内" }, { value: "24h", label: "24h 内" }]} />
          <Button type="primary" icon={<SearchOutlined />} size="small">筛选</Button>
        </Space>
      </ModuleSectionCard>

      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <ModuleSectionCard title="预警客户队列" subtitle="点击行切换右侧快照">
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={QUEUE}
              columns={columns}
              scroll={{ x: 640 }}
              onRow={(record) => ({
                onClick: () => setSelected(record),
                style: { cursor: "pointer", background: selected?.id === record.id ? "#e6f7ff" : undefined },
              })}
            />
          </ModuleSectionCard>
        </Col>
        <Col xs={24} lg={14}>
          <ModuleSectionCard title="客户快照与处置" subtitle="结论录入：4 类定性 + 结构化判断 + 自由备注">
            {selected ? (
              <div className="space-y-3">
                <Descriptions size="small" column={2} bordered>
                  <Descriptions.Item label="客户">{selected.customer}</Descriptions.Item>
                  <Descriptions.Item label="预警单">{selected.id}</Descriptions.Item>
                  <Descriptions.Item label="在贷余额">{selected.balanceWan} 万</Descriptions.Item>
                  <Descriptions.Item label="产品线">{selected.productLine}</Descriptions.Item>
                </Descriptions>

                <Card size="small" title={<Text className="text-[13px]">在贷信息（摘要）</Text>}>
                  <Text type="secondary" className="text-[12px]">
                    合同号 CL-2024-00812 · 到期日 2027-02-28 · 当前逾期天数 0 · 最近还款日 2026-04-10
                  </Text>
                </Card>

                <Card size="small" title={<Text className="text-[13px]">触发信号</Text>}>
                  <List size="small" dataSource={SIGNALS} renderItem={(item) => <List.Item className="!px-0"><Text strong className="text-[12px]">{item.title}</Text> — <Text type="secondary" className="text-[12px]">{item.desc}</Text></List.Item>} />
                </Card>

                <Card size="small" title={<Text className="text-[13px]">历史记录</Text>}>
                  <ul className="text-[12px] text-text-secondary pl-4 m-0 space-y-1">
                    {HISTORY.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </Card>

                <Divider className="!my-2" />

                <Text strong className="text-[12px] block layout-mb-sm">处置结论</Text>
                <Radio.Group value={conclusion} onChange={(e) => setConclusion(e.target.value)} className="w-full">
                  <Space direction="vertical" className="w-full">
                    <Radio value="effective" className="text-[13px]">有效预警 · 建议升级处置</Radio>
                    <Radio value="false_alarm" className="text-[13px]">误报 · 可关闭预警</Radio>
                    <Radio value="watch" className="text-[13px]">待观察 · 补充材料</Radio>
                    <Radio value="transfer" className="text-[13px]">移交 · 跨部门协办</Radio>
                  </Space>
                </Radio.Group>

                <div className="mt-3">
                  <Text type="secondary" className="text-[12px] block mb-1">结构化判断</Text>
                  <Select
                    allowClear
                    placeholder="选择典型情形（可对接码表）"
                    className="w-full"
                    size="small"
                    value={structured}
                    onChange={setStructured}
                    options={[
                      { value: "cash_crunch", label: "现金流紧张 · 可解释" },
                      { value: "malicious", label: "疑似恶意逃废债" },
                      { value: "data_error", label: "数据源噪声 / 口径误差" },
                    ]}
                  />
                </div>

                <div className="mt-2">
                  <Text type="secondary" className="text-[12px] block mb-1">备注</Text>
                  <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="电话纪要、尽调要点、附件编号…" />
                </div>

                <Alert
                  type="info"
                  showIcon
                  className="rounded-md"
                  message="知识闭环"
                  description={(
                    <span>
                      可引用 <Link to="/knowledge/scripts">催收话术库</Link>、
                      <Link to="/knowledge/rule-cases">规则调优案例</Link>、
                      <Link to="/knowledge/fraud-patterns">风险模式库</Link> 中的条目编号写入备注。
                    </span>
                  )}
                />

                <Space wrap className="pt-2">
                  <Button type="primary" icon={<UserSwitchOutlined />}>认领</Button>
                  <Button icon={<EnvironmentOutlined />}>实地尽调</Button>
                  <Button icon={<PhoneOutlined />}>电联核实</Button>
                  <Button icon={<RiseOutlined />} danger>升级协办</Button>
                </Space>
              </div>
            ) : (
              <Text type="secondary">请从左侧选择客户</Text>
            )}
          </ModuleSectionCard>
        </Col>
      </Row>
    </ModulePageShell>
  );
}
