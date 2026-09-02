/**
 * 策略调优 Agent — 发现误报、漏报和阈值优化机会，推动仿真与发布流程
 */

import { Alert, Table, Tag, Typography } from "antd";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

interface TuningRow {
  key: string;
  rule: string;
  issue: "误报偏高" | "漏报风险";
  fpRate: string;
  evidence: string;
  suggestion: string;
  ref: string;
  status: string;
}

const TUNING_ROWS: TuningRow[] = [
  {
    key: "1",
    rule: "多头阈值（制造业）",
    issue: "误报偏高",
    fpRate: "FP 率 22.4%",
    evidence: "近 30 天黄灯工单抽样 240 笔，其中 54 笔核查为正常周转",
    suggestion: "阈值 35% → 38%，并叠加行业分层（制造业单独阈值）",
    ref: "RC-02",
    status: "待仿真",
  },
  {
    key: "2",
    rule: "税报断档天数",
    issue: "误报偏高",
    fpRate: "FP 率 18.1%",
    evidence: "季度申报节奏造成的断档被误判为经营异常",
    suggestion: "断档天数 45 → 30，区分申报周期类型",
    ref: "RC-01",
    status: "待仿真",
  },
  {
    key: "3",
    rule: "司法被执行信号",
    issue: "漏报风险",
    fpRate: "召回 76.2%",
    evidence: "3 笔最终进入处置的客户未触发该规则",
    suggestion: "信号权重 0.15 → 0.22，扩大执行标的金额覆盖区间",
    ref: "RC-05",
    status: "仿真中",
  },
];

export default function StrategyTuning() {
  return (
    <ModulePageShell
      title="策略调优 Agent"
      subtitle="发现误报、漏报和阈值优化机会，推动仿真与发布流程"
    >
      <Alert
        type="info"
        showIcon
        className="mb-4"
        message="调优建议必须经过「仿真回溯 → Diff 审查 → 发布审批」流程后才可生效"
        description="Agent 产出的是建议与证据，不直接修改线上策略。"
      />

      <ModuleSectionCard title="调优机会清单" subtitle="基于标注飞轮回流样本的误报 / 漏报分析" noPadding>
        <Table<TuningRow>
          size="middle"
          pagination={false}
          rowKey="key"
          dataSource={TUNING_ROWS}
          columns={[
            { title: "规则", dataIndex: "rule", width: 160 },
            {
              title: "问题类型",
              dataIndex: "issue",
              width: 110,
              render: (v: TuningRow["issue"]) => (
                <Tag color={v === "误报偏高" ? "orange" : "red"}>{v}</Tag>
              ),
            },
            { title: "量化证据", dataIndex: "fpRate", width: 120 },
            { title: "核查证据", dataIndex: "evidence" },
            { title: "调优建议", dataIndex: "suggestion" },
            {
              title: "案例引用",
              dataIndex: "ref",
              width: 100,
              render: (v: string) => <Tag color="blue">{v} 调优案例</Tag>,
            },
            {
              title: "状态",
              dataIndex: "status",
              width: 90,
              render: (v: string) => <Text type={v === "仿真中" ? "warning" : "secondary"}>{v}</Text>,
            },
          ]}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
