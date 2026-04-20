import { useState } from "react";
import {
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Checkbox,
  Radio,
  Input,
  Divider,
  Alert,
  Statistic,
  Row,
  Col,
  Tabs,
  Card,
  Progress,
  Switch,
  Steps,
} from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  SyncOutlined,
  RobotOutlined,
  CloudUploadOutlined,
  ApiOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import MLOpsStatusPanel, { MLOpsHistory, useMockMLOpsStatus } from "@/components/MLOpsStatus";
import type { MLOpsStatus } from "@/components/MLOpsStatus";

const { Text } = Typography;
const { TextArea } = Input;

interface LabelingCase {
  id: string;
  hitRule: string;
  productLine: string;
  industry: string;
  inspectionConclusion?: "effective" | "false_alarm" | "watch" | "boundary";
  delinquent30d?: boolean | null;
  applicant: string;
  amount: number;
  status: "pending" | "labeled" | "feedback";
  label?: string;
  notes?: string;
  /** 是否已由核查工作台自动回流（演示） */
  autoBackflow?: boolean;
}

const LABELING_CASES: LabelingCase[] = [
  {
    id: "AL-901",
    hitRule: "司法立案",
    productLine: "经营贷",
    industry: "制造业",
    applicant: "张*明",
    amount: 500000,
    status: "pending",
  },
  {
    id: "AL-902",
    hitRule: "多头共债跳升",
    productLine: "税金贷",
    industry: "批发零售",
    applicant: "李*华",
    amount: 120000,
    status: "pending",
  },
  {
    id: "AL-903",
    hitRule: "税报连续断档",
    productLine: "小微贷",
    industry: "道路运输",
    inspectionConclusion: "effective",
    delinquent30d: true,
    applicant: "王*强",
    amount: 80000,
    status: "labeled",
    label: "有效预警",
    autoBackflow: true,
  },
  {
    id: "AL-904",
    hitRule: "设备指纹簇",
    productLine: "消费贷",
    industry: "软件信息",
    inspectionConclusion: "false_alarm",
    delinquent30d: false,
    applicant: "赵*",
    amount: 20000,
    status: "feedback",
    label: "误报",
    notes: "家庭共用设备，已加入白名单建议",
    autoBackflow: true,
  },
];

interface LabelingFlywheelProps {
  onLabel?: (caseId: string, label: string, notes: string) => void;
}

const INITIAL_MLOPS_STATUS: MLOpsStatus = {
  modelId: "model-postloan-v2",
  modelName: "贷后风险模型 V2",
  phase: "idle",
  progress: 0,
  threshold: 1000,
  currentLabels: 642,
  newLabelsCount: 18,
  lastTrainingTime: "2026-04-15T14:30:00",
  canDeploy: false,
};

const TRAINING_HISTORY = [
  { time: "2026-04-15 14:30", action: "模型训练完成", user: "系统", result: "success" as const, ks: 31.2 },
  { time: "2026-04-15 14:00", action: "触发训练", user: "张三", result: "success" as const },
  { time: "2026-04-10 09:15", action: "模型训练完成", user: "系统", result: "success" as const, ks: 29.8 },
  { time: "2026-04-05 16:00", action: "模型部署", user: "李四", result: "success" as const, ks: 28.5 },
];

/** 按产品线 × 行业/场景的样本池（含税易贷冷启动） */
const SAMPLE_POOL_ROWS = [
  { key: "p1", productLine: "经营贷", industry: "制造业", scene: "司法被执行", current: 820, target: 1200, pct: 68 },
  { key: "p2", productLine: "经营贷", industry: "批发零售", scene: "资金流异常", current: 410, target: 900, pct: 46 },
  { key: "p3", productLine: "税易贷", industry: "全行业", scene: "税报核验 / 申报连续性", current: 128, target: 600, pct: 21 },
  { key: "p4", productLine: "税易贷", industry: "道路运输", scene: "税负率偏离", current: 34, target: 280, pct: 12 },
  { key: "p5", productLine: "消费贷", industry: "年轻客群", scene: "行为设备", current: 1100, target: 1500, pct: 73 },
];

const EXTERNAL_MODELS = [
  { name: "征信子分（合作方）", status: "已接入", latency: "45ms", version: "v3.2" },
  { name: "税务申报核验 API", status: "灰度中", latency: "120ms", version: "v1.8-beta" },
  { name: "司法大数据通道", status: "已接入", latency: "210ms", version: "R-2026.04" },
];

/** 核查结论自动回流 — 最近任务（演示） */
const BACKFLOW_LOG = [
  { time: "10:42", alertId: "AL-903", conclusion: "有效预警", target: "训练样本池 · 税报类", source: "工作台结案" },
  { time: "10:18", alertId: "AL-904", conclusion: "误报", target: "白名单建议池", source: "工作台结案" },
  { time: "09:55", alertId: "AL-880", conclusion: "待观察", target: "观察名单特征", source: "定时同步" },
];

function conclusionText(c?: LabelingCase["inspectionConclusion"]): string {
  if (!c) return "—";
  const map: Record<NonNullable<LabelingCase["inspectionConclusion"]>, string> = {
    effective: "有效预警",
    false_alarm: "误报",
    watch: "待观察",
    boundary: "边界需讨论",
  };
  return map[c];
}

export default function LabelingFlywheel({ onLabel }: LabelingFlywheelProps) {
  const [activeTab, setActiveTab] = useState<string>("labeling");
  const [selectedCase, setSelectedCase] = useState<LabelingCase | null>(null);
  const [label, setLabel] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [feedbackOptions, setFeedbackOptions] = useState<string[]>([]);
  const [autoBackflowEnabled, setAutoBackflowEnabled] = useState(true);
  const mlopsStatus = useMockMLOpsStatus(INITIAL_MLOPS_STATUS);

  const pendingCount = LABELING_CASES.filter((c) => c.status === "pending").length;
  const labeledCount = LABELING_CASES.filter((c) => c.status === "labeled").length;
  const feedbackCount = LABELING_CASES.filter((c) => c.status === "feedback").length;

  const columns = [
    {
      title: "预警单",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (text: string) => <Text code className="text-[13px]">{text}</Text>,
    },
    {
      title: "命中规则",
      dataIndex: "hitRule",
      key: "hitRule",
      width: 120,
      ellipsis: true,
      render: (text: string) => <Text className="text-[13px]">{text}</Text>,
    },
    {
      title: "产品 / 行业",
      key: "mix",
      width: 120,
      render: (_: unknown, record: LabelingCase) => (
        <div>
          <Tag className="!m-0 text-[12px]">{record.productLine}</Tag>
          <div><Text type="secondary" className="text-[12px]">{record.industry}</Text></div>
        </div>
      ),
    },
    {
      title: "核查结论",
      dataIndex: "inspectionConclusion",
      key: "inspectionConclusion",
      width: 96,
      render: (c: LabelingCase["inspectionConclusion"]) => {
        if (!c) return <Text type="secondary" className="text-[12px]">待标注</Text>;
        const color = c === "effective" ? "red" : c === "false_alarm" ? "default" : c === "watch" ? "orange" : "blue";
        return <Tag color={color} className="!m-0 text-[12px]">{conclusionText(c)}</Tag>;
      },
    },
    {
      title: "30d 实际逾期",
      dataIndex: "delinquent30d",
      key: "delinquent30d",
      width: 100,
      render: (v: boolean | null | undefined) => {
        if (v === true) return <Tag color="error" className="!m-0 text-[12px]">是</Tag>;
        if (v === false) return <Tag color="success" className="!m-0 text-[12px]">否</Tag>;
        return <Text type="secondary" className="text-[12px]">待观察期</Text>;
      },
    },
    {
      title: "自动回流",
      dataIndex: "autoBackflow",
      key: "autoBackflow",
      width: 88,
      render: (v: boolean | undefined, row: LabelingCase) => {
        if (row.status === "pending") return <Text type="secondary" className="text-[12px]">—</Text>;
        return v ? <Tag color="processing" className="!m-0 text-[12px]">已写入</Tag> : <Tag className="!m-0 text-[12px]">手动</Tag>;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: string) => {
        const config: Record<string, { color: string; text: string }> = {
          pending: { color: "default", text: "待标注" },
          labeled: { color: "blue", text: "已标注" },
          feedback: { color: "green", text: "已回流" },
        };
        return (
          <Tag color={config[status].color} className="!m-0 text-[12px]">
            {config[status].text}
          </Tag>
        );
      },
    },
  ];

  const handleSubmitLabel = () => {
    if (selectedCase && label) {
      onLabel?.(selectedCase.id, label, notes);
      setSelectedCase(null);
      setLabel("");
      setNotes("");
      setFeedbackOptions([]);
    }
  };

  const secondaryPillClass =
    "inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-[#f5f5f5] px-3 py-1.5 text-[12px] text-text-primary hover:bg-[#ebebeb] transition-colors";

  return (
    <ModulePageShell
      title="标注飞轮"
      subtitle="贷后建模闭环：以「预警触发 → 核查结论 → 是否逾期」替代授信期的线过/线拒偏差标注；下方面板为二级支撑能力。"
      breadcrumb={["资产监控", "标注飞轮"]}
      actions={
        <Space wrap size={8}>
          <button type="button" className={secondaryPillClass} onClick={() => setActiveTab("mlops")}>
            <ApiOutlined className="text-[#8c8c8c]" />
            MLOps 状态面板
          </button>
          <button type="button" className={secondaryPillClass} onClick={() => setActiveTab("mlops")}>
            <HistoryOutlined className="text-[#8c8c8c]" />
            训练历史
          </button>
        </Space>
      }
    >
      <Text type="secondary" className="text-[12px] block -mt-2 mb-2">
        已下线（不再使用）：授信 O2O 偏差案件标注、「灰黑产」定性标签。
      </Text>

      <ModuleSectionCard title="贷后标注主链路" subtitle="与核查工作台、策略效果追踪共用同一套结论口径">
        <Steps
          size="small"
          current={-1}
          items={[
            { title: "预警触发", description: "规则 / 模型命中进入样本" },
            { title: "核查结论", description: "人工或半自动定性" },
            { title: "是否逾期", description: "观察期后校验标签真值" },
          ]}
          className="max-w-3xl"
        />
      </ModuleSectionCard>

      <ModuleSectionCard
        title="二级功能 · 标注基础设施"
        subtitle="自动回流、样本池、冷启动与外部模型 — 支撑飞轮运转的系统能力（演示数据）"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <div className="rounded-lg border border-black/[0.08] bg-[#fafafa] p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Text strong className="text-[13px]">预警核查结论自动回流标注</Text>
                <Space align="center">
                  <Text type="secondary" className="text-[12px]">启用回流</Text>
                  <Switch checked={autoBackflowEnabled} onChange={setAutoBackflowEnabled} />
                </Space>
              </div>
              <Text type="secondary" className="text-[12px] block">
                工作台结案或规则引擎回传后，将结论映射到样本池 / 白名单 / 特征字典；关闭后仅保留手工「提交并回流」。
              </Text>
              <Text type="secondary" className="text-[12px]">
                上次批量同步：<Text className="text-[12px] text-text-primary">2026-04-18 10:40</Text> · 成功 24 条 · 失败 0 条
              </Text>
              <Divider className="!my-2" />
              <Text strong className="text-[12px] block layout-mb-sm">最近回流任务</Text>
              <Table
                size="small"
                pagination={false}
                rowKey={(r) => `${r.time}-${r.alertId}`}
                dataSource={BACKFLOW_LOG}
                columns={[
                  { title: "时间", dataIndex: "time", width: 56 },
                  { title: "预警单", dataIndex: "alertId", width: 72, render: (v: string) => <Text code className="text-[12px]">{v}</Text> },
                  { title: "结论", dataIndex: "conclusion", width: 72 },
                  { title: "回流目标", dataIndex: "target", ellipsis: true },
                  { title: "来源", dataIndex: "source", width: 88 },
                ]}
              />
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="rounded-lg border border-black/[0.08] bg-[#fafafa] p-4 space-y-3">
              <Text strong className="text-[13px] block">冷启动提示</Text>
              <Alert
                type="warning"
                showIcon
                className="rounded-md"
                message="税易贷样本不足警告"
                description="税易贷（税报核验 / 申报连续性）有效标注仅 128 / 600，低于冷启动阈值；误报率与提前量指标置信度下降，建议优先补充该池或放宽入池规则。"
              />
              <Alert
                type="info"
                showIcon
                className="rounded-md"
                message="其他提示"
                description="税金贷 · 税报类（非税易贷子品牌）进度 42%，仍建议在一周内补数至 50% 以上。"
              />
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24} lg={14}>
            <div className="rounded-lg border border-black/[0.08] bg-[#fafafa] p-4">
              <Text strong className="text-[13px] block layout-mb-sm">按产品线 / 行业的样本池进度</Text>
              <Table
                size="small"
                pagination={false}
                rowKey="key"
                dataSource={SAMPLE_POOL_ROWS}
                columns={[
                  { title: "产品线", dataIndex: "productLine", width: 80 },
                  { title: "行业", dataIndex: "industry", width: 96, ellipsis: true },
                  { title: "场景", dataIndex: "scene", ellipsis: true },
                  { title: "当前/目标", key: "ct", width: 100, render: (_: unknown, r: (typeof SAMPLE_POOL_ROWS)[0]) => `${r.current} / ${r.target}` },
                  {
                    title: "进度",
                    dataIndex: "pct",
                    width: 160,
                    render: (pct: number, r: (typeof SAMPLE_POOL_ROWS)[0]) => (
                      <Space direction="vertical" className="w-full" size={0}>
                        <Progress percent={pct} size="small" strokeColor={pct < 25 ? "#faad14" : "#4f6970"} />
                        {r.productLine === "税易贷" && pct < 25 ? (
                          <Tag color="warning" className="!m-0 text-[11px]">冷启动</Tag>
                        ) : null}
                      </Space>
                    ),
                  },
                ]}
              />
            </div>
          </Col>
          <Col xs={24} lg={10}>
            <div className="rounded-lg border border-black/[0.08] bg-[#fafafa] p-4 space-y-3">
              <Text strong className="text-[13px] block">外部成熟模型引入状态</Text>
              <div className="flex flex-wrap gap-2">
                {EXTERNAL_MODELS.map((m) => (
                  <span
                    key={m.name}
                    className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[11px] shadow-sm"
                  >
                    <CloudUploadOutlined className="text-[#722ed1]" />
                    <Text className="text-[11px]">{m.name}</Text>
                    <Tag className="!m-0 ml-1 text-[10px] leading-tight" color={m.status === "已接入" ? "success" : "processing"}>
                      {m.status}
                    </Tag>
                  </span>
                ))}
              </div>
              <Table
                size="small"
                pagination={false}
                rowKey="name"
                dataSource={EXTERNAL_MODELS}
                columns={[
                  { title: "能力", dataIndex: "name", ellipsis: true },
                  { title: "版本", dataIndex: "version", width: 96 },
                  { title: "状态", dataIndex: "status", width: 72, render: (v: string) => <Tag className="!m-0 text-[11px]">{v}</Tag> },
                  { title: "P99", dataIndex: "latency", width: 64 },
                ]}
              />
            </div>
          </Col>
        </Row>
      </ModuleSectionCard>

      <ModuleSectionCard>
        <Row gutter={12}>
          <Col xs={12} lg={6}>
            <Card size="small" className="rounded-none">
              <Statistic
                title={<Text className="text-[13px]">待标注</Text>}
                value={pendingCount}
                prefix={<WarningOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ fontSize: 20, color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={12} lg={6}>
            <Card size="small" className="rounded-none">
              <Statistic
                title={<Text className="text-[13px]">已标注</Text>}
                value={labeledCount}
                prefix={<CheckCircleOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ fontSize: 20, color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={12} lg={6}>
            <Card size="small" className="rounded-none">
              <Statistic
                title={<Text className="text-[13px]">已回流</Text>}
                value={feedbackCount}
                prefix={<SyncOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ fontSize: 20, color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={12} lg={6}>
            <Card size="small" className="rounded-none">
              <Statistic
                title={<Text className="text-[13px]">样本增量</Text>}
                value={mlopsStatus.currentLabels}
                suffix={`/ ${mlopsStatus.threshold}`}
                prefix={<RobotOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ fontSize: 16, color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>
      </ModuleSectionCard>

      <ModuleSectionCard noPadding>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="layout-px-lg"
          items={[
            {
              key: "labeling",
              label: <Text className="text-[12px]">预警核查标注</Text>,
              children: (
                <div className="layout-flex layout-gap-md layout-pb-md">
                  <div className="layout-flex-1">
                    <div className="layout-mb-sm">
                      <Text strong className="text-[12px]">
                        预警触发样本（人工补标与自动回流并存）
                      </Text>
                    </div>
                    <Table
                      dataSource={LABELING_CASES}
                      columns={columns}
                      pagination={false}
                      size="small"
                      rowKey="id"
                      scroll={{ x: 720 }}
                      onRow={(record) => ({
                        onClick: () => {
                          setSelectedCase(record);
                          setLabel(record.label || "");
                          setNotes(record.notes || "");
                        },
                        style: {
                          cursor: "pointer",
                          background: selectedCase?.id === record.id ? "#e6f7ff" : "transparent",
                        },
                      })}
                    />
                  </div>

                  <div
                    className="layout-p-md border border-[#d9d9d9] bg-[#fafafa] shrink-0"
                    style={{ width: 300 }}
                  >
                    <Text strong className="text-[12px] block layout-mb-sm">
                      核查结论标注
                    </Text>
                    {selectedCase ? (
                      <>
                        <div className="layout-mb-md">
                          <Text type="secondary" className="text-[13px]">
                            单号: <Text code>{selectedCase.id}</Text>
                          </Text>
                          <br />
                          <Text type="secondary" className="text-[13px]">
                            {selectedCase.applicant} · ¥{selectedCase.amount.toLocaleString()}
                          </Text>
                          <br />
                          <Text type="secondary" className="text-[12px]">
                            规则: {selectedCase.hitRule} · {selectedCase.productLine} / {selectedCase.industry}
                          </Text>
                        </div>

                        <Divider rootClassName="layout-divider-y-sm" />

                        <div className="layout-mb-lg">
                          <Text className="text-[13px] block layout-mb-sm">
                            1. 核查结论（可触发回流）
                          </Text>
                          <Radio.Group
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="w-full"
                          >
                            <Space direction="vertical" className="w-full">
                              <Radio value="有效预警" className="text-[13px]">有效预警</Radio>
                              <Radio value="误报" className="text-[13px]">误报</Radio>
                              <Radio value="待观察" className="text-[13px]">待观察</Radio>
                              <Radio value="边界需讨论" className="text-[13px]">边界需讨论</Radio>
                            </Space>
                          </Radio.Group>
                        </div>

                        <Divider rootClassName="layout-divider-y-sm" />

                        <div className="layout-mb-lg">
                          <Text className="text-[13px] block layout-mb-sm">
                            2. 知识回流
                          </Text>
                          <Checkbox.Group
                            value={feedbackOptions}
                            onChange={(values) => setFeedbackOptions(values as string[])}
                            className="w-full"
                          >
                            <Space direction="vertical" className="w-full">
                              <Checkbox value="sample_pool" className="text-[13px]">写入训练样本池</Checkbox>
                              <Checkbox value="feature" className="text-[13px]">更新特征字典</Checkbox>
                              <Checkbox value="rule" className="text-[13px]">生成规则调优建议</Checkbox>
                            </Space>
                          </Checkbox.Group>
                        </div>

                        <Divider rootClassName="layout-divider-y-sm" />

                        <div className="layout-mb-lg">
                          <Text className="text-[13px] block layout-mb-sm">
                            备注
                          </Text>
                          <TextArea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="核查过程、证据链简述…"
                            rows={2}
                            className="text-[13px]"
                          />
                        </div>

                        <Button
                          type="primary"
                          block
                          onClick={handleSubmitLabel}
                          disabled={!label}
                        >
                          提交并回流
                        </Button>
                      </>
                    ) : (
                      <Alert type="info" message="请从左侧选择预警样本进行核查标注" className="rounded-none" />
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "mlops",
              label: <Text className="text-[12px]">MLOps 状态</Text>,
              children: (
                <div className="layout-pb-md">
                  <MLOpsStatusPanel status={mlopsStatus} />
                  <MLOpsHistory history={TRAINING_HISTORY} />
                </div>
              ),
            },
          ]}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
