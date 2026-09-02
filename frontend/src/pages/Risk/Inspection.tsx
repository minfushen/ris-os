/**
 * 复盘与质检 — 贷后处置记录抽检、闭环复盘与不合格回流
 *
 * 对应招标交付：预警处置流程设计方案 — 处置质量评估与回溯机制
 */

import { useState } from "react";
import { Typography, Table, Tag, Button, Space, Progress, Row, Col, Statistic, Collapse, Alert, Drawer, Form, Input, Select, DatePicker, message } from "antd";
import { PlusOutlined, WarningOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

/** RM 贷后处置记录抽检（替代授信材料专家抽检） */
const RM_QA_TASKS = [
  {
    id: "QA-2401",
    name: "华东 RM · 4月第2周处置抽检",
    status: "processing",
    total: 40,
    completed: 26,
    lead: "质检组A",
    focus: "时效 / 结论准确性 / 留痕完整性",
    createTime: "2026-04-12",
  },
  {
    id: "QA-2402",
    name: "税易贷预警闭环专项",
    status: "processing",
    total: 30,
    completed: 30,
    lead: "质检组B",
    focus: "结论与 30d 逾期对齐",
    createTime: "2026-04-08",
  },
  {
    id: "QA-2350",
    name: "升级协办案件复盘",
    status: "completed",
    total: 20,
    completed: 20,
    lead: "质检组A",
    focus: "跨部门时效",
    createTime: "2026-03-28",
  },
];

const QC_CRITERIA = [
  {
    dimension: "处置时效",
    weight: 30,
    rules: ["红灯预警 T+4h 内响应", "黄灯预警 T+1d 内完成首次触达", "蓝灯观察池 T+7d 内刷新"],
    passRate: 84,
  },
  {
    dimension: "结论准确性",
    weight: 40,
    rules: ["风险定级与实际逾期偏离 ≤ 1 档", "处置动作与风险等级匹配", "升级/降级有依据说明"],
    passRate: 76,
  },
  {
    dimension: "留痕完整性",
    weight: 20,
    rules: ["通话录音与触达记录齐全", "协商还款计划有文字记录", "外部数据引用标注来源与时间"],
    passRate: 91,
  },
  {
    dimension: "合规边界",
    weight: 10,
    rules: ["催收时段合规（9:00-18:00）", "无威胁恐吓措辞", "债务信息未泄露第三方"],
    passRate: 96,
  },
];

const CLOSED_LOOP_STEPS = [
  { label: "抽检不合格", action: "标记缺陷项", dest: "质检组复核" },
  { label: "确认问题类型", action: "分类：时效/准确/留痕/合规", dest: "问题池" },
  { label: "根因分析", action: "判断是话术、规则阈值还是人为问题", dest: "改进方案" },
  { label: "回流训练", action: "典型错案入样本池 → 模型迭代", dest: "模型工厂" },
  { label: "规则调优", action: "高频误判触发规则参数评估", dest: "调优案例库" },
];

export default function Inspection() {
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);
      await new Promise((r) => setTimeout(r, 600));
      message.success(`抽检任务「${values.name}」已创建`);
      setCreateOpen(false);
      createForm.resetFields();
    } catch {
      message.error("请完善必填信息");
    } finally {
      setCreateLoading(false);
    }
  };
  const columns = [
    { title: "任务ID", dataIndex: "id", width: 96, render: (v: string) => <Text code className="text-[13px]">{v}</Text> },
    { title: "抽检名称", dataIndex: "name", width: 220, render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (v: string, record: (typeof RM_QA_TASKS)[0]) => (
        <Space direction="vertical" size={0}>
          <Tag color={v === "completed" ? "green" : "blue"} className="!m-0 text-[12px]">
            {v === "completed" ? "已完成" : "处理中"}
          </Tag>
          {v !== "completed" && <Text className="text-[12px] text-text-muted">{record.completed}/{record.total}</Text>}
        </Space>
      ),
    },
    {
      title: "进度",
      key: "progress",
      width: 120,
      render: (_: unknown, record: (typeof RM_QA_TASKS)[0]) => (
        <Progress percent={Math.round((record.completed / record.total) * 100)} size="small" />
      ),
    },
    { title: "负责人", dataIndex: "lead", width: 100, render: (v: string) => <Text className="text-[13px]">{v}</Text> },
    { title: "质检维度", dataIndex: "focus", ellipsis: true, render: (v: string) => <Text type="secondary" className="text-[12px]">{v}</Text> },
    { title: "创建时间", dataIndex: "createTime", width: 110, render: (v: string) => <Text className="text-[12px]">{v}</Text> },
    {
      title: "操作",
      key: "actions",
      width: 88,
      render: () => <Button type="link" size="small" className="text-[13px]">进入任务</Button>,
    },
  ];

  return (
    <ModulePageShell
      title="复盘与质检"
      subtitle="对象由授信材料改为「RM 预警核查处置记录」：评估处置时效、结论准确性、留痕完整性；不合格样本回流训练/规则调优（演示）。已移除授信侧 PDF 上传与 OCR 流程。"
      breadcrumb={["处置闭环", "复盘与质检"]}
      actions={
        <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => setCreateOpen(true)}>
          创建抽检任务
        </Button>
      }
    >
      {/* 质检总览统计 */}
      <ModuleSectionCard title="质检总览" subtitle="近 30 天处置记录抽检统计">
        <Row gutter={[12, 12]}>
          {[
            { label: "抽检任务", value: 3, suffix: "个" },
            { label: "已检记录", value: 76, suffix: "条" },
            { label: "综合通过率", value: 82.5, suffix: "%" },
            { label: "回流训练", value: 12, suffix: "条" },
          ].map((s) => (
            <Col xs={12} sm={6} key={s.label}>
              <div className="card-surface layout-p-md text-center">
                <Statistic title={s.label} value={s.value} suffix={s.suffix} valueStyle={{ fontSize: 22 }} />
              </div>
            </Col>
          ))}
        </Row>
      </ModuleSectionCard>

      {/* 质检维度标准 */}
      <ModuleSectionCard title="质检四维标准" subtitle="各维度权重、规则与最新通过率（展示平台治理深度）">
        {QC_CRITERIA.map((c) => (
          <div key={c.dimension} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between mb-1">
              <Space>
                <Text strong className="text-[13px]">{c.dimension}</Text>
                <Tag>权重 {c.weight}%</Tag>
              </Space>
              <Text className="text-[13px]" style={{ color: c.passRate >= 90 ? "#52c41a" : c.passRate >= 80 ? "#faad14" : "#ff4d4f" }}>
                通过率 {c.passRate}%
              </Text>
            </div>
            <Progress percent={c.passRate} size="small" strokeColor={c.passRate >= 90 ? "#52c41a" : c.passRate >= 80 ? "#faad14" : "#ff4d4f"} />
            <ul className="list-disc list-inside mt-2 space-y-0.5">
              {c.rules.map((r, i) => <li key={i} className="text-[12px] text-gray-500">{r}</li>)}
            </ul>
          </div>
        ))}
      </ModuleSectionCard>

      {/* 抽检任务列表 */}
      <ModuleSectionCard noPadding>
        <Table
          dataSource={RM_QA_TASKS}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
        />
      </ModuleSectionCard>

      {/* 不合格回流闭环 */}
      <ModuleSectionCard title="不合格回流闭环" subtitle="从质检发现 → 问题分类 → 改进方案 → 模型/规则迭代">
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message="平台能力说明"
          description="不同于传统 PDF 抽检的单向打分，贷后处置质检的结果直接回流至模型工厂作为负样本，或触发对应规则参数的调优评估，形成「质检驱动迭代」的闭环。"
          className="mb-3 rounded-lg"
        />
        <Collapse
          items={[
            {
              key: "loop",
              label: <Text strong className="text-[13px]">闭环流程（5 步）</Text>,
              children: (
                <div className="flex flex-wrap gap-2">
                  {CLOSED_LOOP_STEPS.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-2">
                      <div className="card-surface layout-p-sm rounded text-center" style={{ minWidth: 120 }}>
                        <Tag color="blue" className="!m-0 mb-1">Step {i + 1}</Tag>
                        <Text strong className="text-[12px] block">{step.label}</Text>
                        <Text type="secondary" className="text-[11px] block">{step.action}</Text>
                        <Text className="text-[11px]" style={{ color: "#1677ff" }}>→ {step.dest}</Text>
                      </div>
                      {i < CLOSED_LOOP_STEPS.length - 1 && (
                        <Text type="secondary" className="text-lg">→</Text>
                      )}
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </ModuleSectionCard>

      {/* 创建抽检任务抽屉 */}
      <Drawer
        title="创建抽检任务"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        width={520}
        footer={
          <Space>
            <Button onClick={() => setCreateOpen(false)}>取消</Button>
            <Button type="primary" loading={createLoading} onClick={handleCreateSubmit}>
              创建任务
            </Button>
          </Space>
        }
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="name" label="任务名称" rules={[{ required: true, message: "请输入任务名称" }]}>
            <Input placeholder="如：华东 RM · 5月第1周处置抽检" />
          </Form.Item>
          <Form.Item name="scope" label="抽检范围" rules={[{ required: true, message: "请选择抽检范围" }]}>
            <Select placeholder="选择抽检范围">
              <Option value="华东">华东区域</Option>
              <Option value="华南">华南区域</Option>
              <Option value="华北">华北区域</Option>
              <Option value="西南">西南区域</Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="时间范围" rules={[{ required: true, message: "请选择时间范围" }]}>
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="focus" label="抽检重点">
            <TextArea rows={3} placeholder="如：时效 / 结论准确性 / 留痕完整性" />
          </Form.Item>
        </Form>
      </Drawer>
    </ModulePageShell>
  );
}
