import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Typography,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Alert,
  Collapse,
  Radio,
  Tooltip,
  Popover,
  Descriptions,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  UserSwitchOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  RiseOutlined,
  BookOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
  DownloadOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import { WorkbenchLayout } from "@/components/workbench/WorkbenchLayout";
import AlertQueuePane from "@/components/workbench/AlertQueuePane";
import AlertDetailPane from "@/components/workbench/AlertDetailPane";
import type { WorkbenchQueueRow } from "@/components/workbench/types";

const { Text } = Typography;
const { TextArea } = Input;

const QUEUE: WorkbenchQueueRow[] = [
  { id: "W-240418-01", customer: "XX科技有限公司", productLine: "小微经营贷", riskLevel: "high", hitRule: "司法被执行", sla: "剩 4h", balanceWan: 150 },
  { id: "W-240418-02", customer: "YY贸易有限公司", productLine: "税易贷", riskLevel: "high", hitRule: "失信被执行", sla: "剩 6h", balanceWan: 42 },
  { id: "W-240418-03", customer: "ZZ物流有限公司", productLine: "消费贷", riskLevel: "medium", hitRule: "征信查询异常", sla: "剩 1天", balanceWan: 8 },
];

type SignalSeverity = "high" | "medium" | "low";

const SIGNAL_ORDER: Record<SignalSeverity, number> = { high: 0, medium: 1, low: 2 };

type SignalItem = { title: string; desc: string; severity: SignalSeverity };

const SIGNALS_RAW: SignalItem[] = [
  { title: "司法", severity: "high", desc: "2026-04-12 新增被执行案号 (2026)浙01执***" },
  { title: "资金流", severity: "medium", desc: "近14日对公流出环比 +38%，对手方集中度上升" },
  { title: "征信", severity: "low", desc: "他行贷记卡使用率 89%，查询次数 +6（30d）" },
];

const SIGNALS = [...SIGNALS_RAW].sort((a, b) => SIGNAL_ORDER[a.severity] - SIGNAL_ORDER[b.severity]);

const HISTORY = [
  "2026-03-01 贷后常规回访 · 正常",
  "2025-11-20 支用复核 · 通过",
  "2025-06-10 授信审批 · 通过",
];

const HIT_RULES = [
  "RULE_023: 企业新增被执行人记录",
  "RULE_056: 涉诉金额>50万",
];

const RISK_PROFILE = [
  "涉诉情况: 近3个月涉诉3起，金额合计80万",
  "征信情况: 近1月征信查询8次，无新增逾期",
  "工商情况: 正常经营，法人未变更",
  "关联风险: 关联企业YY公司涉诉1起",
];

const REPORT_EVIDENCE_CHAIN = [
  "企查查 MCP：工商登记、司法被执行、股权冻结、经营异常",
  "内部贷后：预警命中规则、在贷余额、处置记录、历史回访",
  "外部财报：现金流、负债率、偿债能力与时间轴对应",
];

interface AlertDetailDemoData {
  riskScore: number;
  warningTime: string;
  hitRules: string[];
  riskProfile: string[];
  signals: SignalItem[];
  history: string[];
  handler: string;
  recordResult: string;
  loanSummary: string;
}

const ALERT_DETAILS: Record<string, AlertDetailDemoData> = {
  "W-240418-01": {
    riskScore: 420,
    warningTime: "2026-04-18 09:30:00",
    hitRules: HIT_RULES,
    riskProfile: RISK_PROFILE,
    signals: SIGNALS,
    history: HISTORY,
    handler: "张三",
    recordResult: "等待客户经理反馈",
    loanSummary: "合同号 CL-2024-00812 · 到期日 2027-02-28 · 当前逾期天数 0 · 最近还款日 2026-04-10",
  },
  "W-240418-02": {
    riskScore: 438,
    warningTime: "2026-04-18 10:15:00",
    hitRules: ["RULE_031: 企业新增失信被执行记录", "RULE_064: 税报连续断档超过30天"],
    riskProfile: [
      "涉诉情况: 新增失信记录1条，执行标的35万",
      "征信情况: 近1月查询5次，授信余额波动较大",
      "工商情况: 经营地址变更，需补充核验",
      "关联风险: 上游客户回款延迟，现金流承压",
    ],
    signals: [
      { title: "司法", severity: "high", desc: "新增失信被执行记录，需实时触达客户经理" },
      { title: "税务", severity: "medium", desc: "连续 35 天无有效税报回传，可能存在经营异常" },
      { title: "经营", severity: "low", desc: "注册地址变更但未触发法人变更" },
    ],
    history: ["2026-03-28 税报补录提醒 · 已完成", "2026-02-12 贷后回访 · 现金流偏紧", "2025-12-06 支用复核 · 通过"],
    handler: "李四",
    recordResult: "建议电话核实并补充税务材料",
    loanSummary: "合同号 TAX-2024-00196 · 到期日 2026-12-15 · 当前逾期天数 0 · 最近还款日 2026-04-05",
  },
  "W-240418-03": {
    riskScore: 510,
    warningTime: "2026-04-18 11:20:00",
    hitRules: ["RULE_078: 征信短期密集查询", "RULE_082: 多头余额环比上升"],
    riskProfile: [
      "涉诉情况: 未发现新增司法风险",
      "征信情况: 近1月征信查询8次，无新增逾期",
      "工商情况: 正常经营，法人未变更",
      "关联风险: 关联物流车队回款周期拉长",
    ],
    signals: [
      { title: "征信", severity: "medium", desc: "近 30 天征信查询 8 次，超过产品线阈值" },
      { title: "资金流", severity: "medium", desc: "在贷余额环比上升 18%，还款规律性下降" },
      { title: "工商", severity: "low", desc: "经营状态正常，无新增工商处罚" },
    ],
    history: ["2026-04-01 贷后短信提醒 · 已送达", "2026-01-22 常规回访 · 正常", "2025-09-09 授信审批 · 通过"],
    handler: "王五",
    recordResult: "黄灯观察，批量推送后跟进",
    loanSummary: "合同号 CON-2025-00666 · 到期日 2027-08-31 · 当前逾期天数 0 · 最近还款日 2026-04-12",
  },
};

function riskLevelLabel(level: WorkbenchQueueRow["riskLevel"]) {
  return level === "high" ? "高" : level === "medium" ? "中" : "低";
}

function riskLevelFull(level: WorkbenchQueueRow["riskLevel"]) {
  const label = riskLevelLabel(level);
  return `风险等级：${label}`;
}

function riskTag(level: WorkbenchQueueRow["riskLevel"]) {
  return (
    <Tag color={level === "high" ? "red" : level === "medium" ? "orange" : "blue"} className="!m-0 text-[11px]">
      {riskLevelLabel(level)}
    </Tag>
  );
}

function QueueOverflowTip({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Tooltip title={title} placement="topLeft" mouseEnterDelay={0.08} trigger={["hover", "click"]}>
      <div className={["min-w-0 max-w-full cursor-default", className].filter(Boolean).join(" ")}>{children}</div>
    </Tooltip>
  );
}

function QueueRowDetailContent({ row }: { row: WorkbenchQueueRow }) {
  return (
    <Descriptions size="small" column={1} className="max-w-[280px] [&_.ant-descriptions-item]:pb-1">
      <Descriptions.Item label="预警单">{row.id}</Descriptions.Item>
      <Descriptions.Item label="客户">{row.customer}</Descriptions.Item>
      <Descriptions.Item label="产品线">{row.productLine}</Descriptions.Item>
      <Descriptions.Item label="风险等级">{riskLevelFull(row.riskLevel)}</Descriptions.Item>
      <Descriptions.Item label="命中规则">{row.hitRule}</Descriptions.Item>
      <Descriptions.Item label="SLA">{row.sla}</Descriptions.Item>
      <Descriptions.Item label="在贷余额">{row.balanceWan} 万</Descriptions.Item>
    </Descriptions>
  );
}

export default function Workbench() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<WorkbenchQueueRow | null>(QUEUE[0]);
  const [conclusion, setConclusion] = useState<string>("");
  const [structured, setStructured] = useState<string | undefined>();
  const [notes, setNotes] = useState("");
  const [reportGenerated, setReportGenerated] = useState(false);

  const alertFromNav = useMemo(() => (location.state as { alertId?: string } | null)?.alertId, [location.state]);

  useEffect(() => {
    if (alertFromNav) {
      const row = QUEUE.find((q) => q.id === alertFromNav);
      if (row) setSelected(row);
    }
  }, [alertFromNav]);

  useEffect(() => {
    setConclusion("");
    setStructured(undefined);
    setNotes("");
    setReportGenerated(false);
  }, [selected?.id]);

  const selectedDetail = selected ? ALERT_DETAILS[selected.id] ?? ALERT_DETAILS["W-240418-01"] : null;

  const columns: ColumnsType<WorkbenchQueueRow> = [
    {
      title: (
        <Tooltip title="预警单号" mouseEnterDelay={0.1}>
          <span className="cursor-help">预警单</span>
        </Tooltip>
      ),
      dataIndex: "id",
      ellipsis: { showTitle: false },
      render: (_: string, row) => (
        <div className="flex items-center gap-0.5 min-w-0">
          <QueueOverflowTip title={row.id} className="min-w-0 flex-1">
            <Text code className="text-[12px] !mb-0 !block truncate">
              {row.id}
            </Text>
          </QueueOverflowTip>
          <Popover title="队列条目详情" content={<QueueRowDetailContent row={row} />} trigger="click" placement="rightTop">
            <span data-workbench-queue-stop-row>
              <Button
                type="text"
                size="small"
                icon={<InfoCircleOutlined className="text-[12px] text-text-tertiary" />}
                className="!px-1 shrink-0 !h-6 !min-w-6"
                aria-label="查看完整字段"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              />
            </span>
          </Popover>
        </div>
      ),
    },
    {
      title: (
        <Tooltip title="客户名称" mouseEnterDelay={0.1}>
          <span className="cursor-help">客户</span>
        </Tooltip>
      ),
      dataIndex: "customer",
      ellipsis: { showTitle: false },
      render: (v: string) => (
        <QueueOverflowTip title={v}>
          <Text strong className="text-[13px] font-medium !mb-0 !block truncate">
            {v}
          </Text>
        </QueueOverflowTip>
      ),
    },
    {
      title: (
        <Tooltip title="产品线" mouseEnterDelay={0.1}>
          <span className="cursor-help">产品</span>
        </Tooltip>
      ),
      dataIndex: "productLine",
      ellipsis: { showTitle: false },
      render: (v: string) => (
        <QueueOverflowTip title={v}>
          <span className="block min-w-0 truncate">
            <Tag className="!m-0 text-[11px]">{v}</Tag>
          </span>
        </QueueOverflowTip>
      ),
    },
    {
      title: (
        <Tooltip title="风险等级" mouseEnterDelay={0.1}>
          <span className="cursor-help">风险</span>
        </Tooltip>
      ),
      dataIndex: "riskLevel",
      ellipsis: { showTitle: false },
      render: (v: WorkbenchQueueRow["riskLevel"]) => (
        <QueueOverflowTip title={riskLevelFull(v)}>
          <span className="inline-flex min-w-0">{riskTag(v)}</span>
        </QueueOverflowTip>
      ),
    },
    {
      title: (
        <Tooltip title="命中规则" mouseEnterDelay={0.1}>
          <span className="cursor-help">命中</span>
        </Tooltip>
      ),
      dataIndex: "hitRule",
      ellipsis: { showTitle: false },
      render: (v: string) => (
        <QueueOverflowTip title={v}>
          <Text className="text-[12px] !mb-0 !block truncate">{v}</Text>
        </QueueOverflowTip>
      ),
    },
    {
      title: (
        <Tooltip title="处置时限（SLA）" mouseEnterDelay={0.1}>
          <span className="cursor-help">SLA</span>
        </Tooltip>
      ),
      dataIndex: "sla",
      ellipsis: { showTitle: false },
      render: (v: string) => (
        <QueueOverflowTip title={v}>
          <Text className="text-[12px] text-sla-emphasis !mb-0 !block truncate">{v}</Text>
        </QueueOverflowTip>
      ),
    },
  ];

  const detailFooter = selected ? (
    <div className="space-y-3">
      <Text strong className="text-[12px] font-medium block text-text-secondary">处置结论</Text>
      <Radio.Group value={conclusion} onChange={(e) => setConclusion(e.target.value)} className="w-full">
        <Space direction="vertical" className="w-full">
          <Radio value="effective" className="text-[13px] font-normal">有效预警 · 建议升级处置</Radio>
          <Radio value="false_alarm" className="text-[13px] font-normal">误报 · 可关闭预警</Radio>
          <Radio value="watch" className="text-[13px] font-normal">待观察 · 补充材料</Radio>
          <Radio value="transfer" className="text-[13px] font-normal">移交 · 跨部门协办</Radio>
        </Space>
      </Radio.Group>

      <div>
        <Text type="secondary" className="text-[12px] font-normal block mb-1">结构化判断</Text>
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

      <div>
        <Text type="secondary" className="text-[12px] font-normal block mb-1">备注</Text>
        <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="电话纪要、尽调要点、附件编号…" />
      </div>

      <Space wrap>
        <Button type="primary" icon={<UserSwitchOutlined />}>认领</Button>
        <Button icon={<EnvironmentOutlined />}>实地尽调</Button>
        <Button icon={<PhoneOutlined />}>电联核实</Button>
        <Button icon={<RiseOutlined />} danger>升级协办</Button>
      </Space>
    </div>
  ) : null;

  const knowledgePreFooter = selected ? (
    <Alert
      type="info"
      showIcon
      className="rounded-[var(--radius-lg)] !mb-0"
      message="知识闭环"
      description={(
        <span className="text-[12px]">
          可引用 <Link to="/knowledge/scripts">催收话术库</Link>、
          <Link to="/knowledge/rule-cases">规则调优案例</Link>、
          <Link to="/knowledge/fraud-patterns">风险模式库</Link> 中的条目编号写入备注。
        </span>
      )}
    />
  ) : null;

  return (
    <ModulePageShell
      title="预警核查工作台"
      subtitle="按预警客户聚合风险画像、核查记录、处置动作与贷后监控报告生成"
      breadcrumb={["处置闭环", "预警核查工作台"]}
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
        <div className="workbench-filter-toolbar">
          <Input className="workbench-filter-toolbar__q" placeholder="客户 / 证件 / 预警单号" size="small" />
          <Select placeholder="风险等级" allowClear size="small" style={{ width: 110 }} options={[{ value: "high", label: "高" }, { value: "medium", label: "中" }, { value: "low", label: "低" }]} />
          <Select placeholder="产品线" allowClear size="small" style={{ width: 120 }} options={[{ value: "经营贷", label: "经营贷" }, { value: "税易贷", label: "税易贷" }, { value: "消费贷", label: "消费贷" }]} />
          <Select placeholder="SLA" allowClear size="small" style={{ width: 100 }} options={[{ value: "4h", label: "4h 内" }, { value: "24h", label: "24h 内" }]} />
          <Button type="primary" icon={<SearchOutlined />} size="small">筛选</Button>
        </div>
      </ModuleSectionCard>

      <WorkbenchLayout>
        <AlertQueuePane
          title="预警客户队列"
          hint="点击行切换右侧"
          columns={columns}
          dataSource={QUEUE}
          selectedRowKey={selected?.id ?? null}
          onRowClick={setSelected}
        />

        <AlertDetailPane
          title="客户快照与处置"
          hint="结论区在底部固定可见"
          emptyText="请从左侧选择客户"
          hasSelection={!!selected}
          preFooter={knowledgePreFooter}
          footer={detailFooter}
        >
          {selected ? (
            <>
              <div className="workbench-inset-panel">
                <h3 className="workbench-inset-panel__title">客户信息</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  <p className="workbench-inset-panel__body">
                    客户名称: <Text strong>{selected.customer}</Text>
                  </p>
                  <p className="workbench-inset-panel__body">
                    贷款余额: <Text strong>{selected.balanceWan}万</Text>
                  </p>
                  <p className="workbench-inset-panel__body">
                    贷款产品: <Text strong>{selected.productLine}</Text>
                  </p>
                  <p className="workbench-inset-panel__body">
                  风险评分: <Text strong className="text-[#cf1322]">{selectedDetail?.riskScore}</Text>
                  </p>
                </div>
              </div>

              <div className="workbench-inset-panel">
                <h3 className="workbench-inset-panel__title">预警详情</h3>
                <div className="space-y-2">
                  <p className="workbench-inset-panel__body">
                    预警级别: {riskTag(selected.riskLevel)} · 预警时间: {selectedDetail?.warningTime}
                  </p>
                  <div>
                    <Text strong className="text-[13px] font-medium block mb-1">命中规则</Text>
                    <ul className="text-[12px] text-text-secondary pl-4 m-0 space-y-1 list-disc">
                      {selectedDetail?.hitRules.map((rule) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="workbench-inset-panel">
                <h3 className="workbench-inset-panel__title">风险画像</h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {selectedDetail?.riskProfile.map((item) => (
                    <p className="workbench-inset-panel__body" key={item}>{item}</p>
                  ))}
                </div>
              </div>

              <div className="workbench-inset-panel">
                <h3 className="workbench-inset-panel__title">处置操作</h3>
                <Space wrap>
                  <Button icon={<PhoneOutlined />}>电话核实</Button>
                  <Button icon={<EnvironmentOutlined />}>上门走访</Button>
                  <Button icon={<UserSwitchOutlined />}>要求增信</Button>
                  <Button icon={<RiseOutlined />} danger>提前回收</Button>
                </Space>
              </div>

              <div className="workbench-inset-panel">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="workbench-inset-panel__title">贷后监控报告</h3>
                    <p className="workbench-inset-panel__body">
                      基于当前客户预警、企查查 MCP、司法财报与处置记录生成报告
                    </p>
                  </div>
                  <Tag color="processing" className="!m-0">v3.0 深度分析版</Tag>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <div className="workbench-snapshot-cell">
                    <span className="workbench-snapshot-cell__label">目标企业</span>
                    <div className="workbench-snapshot-cell__value truncate">{selected.customer}</div>
                  </div>
                  <div className="workbench-snapshot-cell">
                    <span className="workbench-snapshot-cell__label">监控级别</span>
                    <div className="workbench-snapshot-cell__value">日监控 · {riskLevelLabel(selected.riskLevel)}风险</div>
                  </div>
                  <div className="workbench-snapshot-cell">
                    <span className="workbench-snapshot-cell__label">审计留档</span>
                    <div className="workbench-snapshot-cell__value">生成后写入报告库</div>
                  </div>
                </div>
                <ul className="mt-3 text-[12px] text-text-secondary pl-4 m-0 space-y-1 list-disc">
                  {REPORT_EVIDENCE_CHAIN.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Space wrap className="mt-3">
                  <Button type="primary" icon={<FileTextOutlined />} onClick={() => setReportGenerated(true)}>
                    生成贷后监控报告
                  </Button>
                  <Button icon={<EyeOutlined />} disabled={!reportGenerated}>报告预览</Button>
                  <Button icon={<DownloadOutlined />} disabled={!reportGenerated}>下载 PDF</Button>
                  <Button icon={<AuditOutlined />} disabled={!reportGenerated}>审计留档</Button>
                </Space>
              </div>

              <div className="workbench-inset-panel">
                <h3 className="workbench-inset-panel__title">处置记录</h3>
                <div className="grid gap-2 md:grid-cols-3">
                  <p className="workbench-inset-panel__body">处置人: {selectedDetail?.handler}</p>
                  <p className="workbench-inset-panel__body">处置时间: 待填写</p>
                  <p className="workbench-inset-panel__body">处置结果: {selectedDetail?.recordResult}</p>
                </div>
              </div>

              <div className="workbench-snapshot-grid">
                <div className="workbench-snapshot-cell">
                  <span className="workbench-snapshot-cell__label">客户</span>
                  <div className="workbench-snapshot-cell__value truncate">{selected.customer}</div>
                </div>
                <div className="workbench-snapshot-cell">
                  <span className="workbench-snapshot-cell__label">预警单</span>
                  <div className="workbench-snapshot-cell__value"><Text code className="text-[12px]">{selected.id}</Text></div>
                </div>
                <div className="workbench-snapshot-cell">
                  <span className="workbench-snapshot-cell__label">在贷余额</span>
                  <div className="workbench-snapshot-cell__value">{selected.balanceWan} 万</div>
                </div>
                <div className="workbench-snapshot-cell">
                  <span className="workbench-snapshot-cell__label">产品线</span>
                  <div className="workbench-snapshot-cell__value">{selected.productLine}</div>
                </div>
                <div className="workbench-snapshot-cell">
                  <span className="workbench-snapshot-cell__label">风险等级</span>
                  <div className="workbench-snapshot-cell__value">{riskTag(selected.riskLevel)}</div>
                </div>
                <div className="workbench-snapshot-cell">
                  <span className="workbench-snapshot-cell__label">SLA</span>
                  <div className="workbench-snapshot-cell__value text-sla-emphasis">{selected.sla}</div>
                </div>
              </div>

              <div className="workbench-inset-panel">
                <h3 className="workbench-inset-panel__title">在贷信息（摘要）</h3>
                <p className="workbench-inset-panel__body">
                  {selectedDetail?.loanSummary}
                </p>
              </div>

              <div>
                <Text strong className="text-[13px] font-medium block mb-2">触发信号</Text>
                <div className="workbench-signal-list">
                  {selectedDetail?.signals.map((item) => (
                    <article
                      key={item.title}
                      className={`workbench-signal workbench-signal--${item.severity}`}
                    >
                      <h4 className="workbench-signal__title">{item.title}</h4>
                      <p className="workbench-signal__desc">{item.desc}</p>
                    </article>
                  ))}
                </div>
              </div>

              <Collapse
                bordered={false}
                defaultActiveKey={[]}
                className="bg-transparent"
                items={[
                  {
                    key: "history",
                    label: <span className="text-[13px] font-medium">历史处置记录</span>,
                    children: (
                      <ul className="text-[12px] text-text-secondary pl-4 m-0 space-y-1 list-disc">
                        {selectedDetail?.history.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    ),
                  },
                ]}
              />
            </>
          ) : null}
        </AlertDetailPane>
      </WorkbenchLayout>
    </ModulePageShell>
  );
}
