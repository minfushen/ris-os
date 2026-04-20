import { useMemo } from "react";
import {
  Typography,
  Table,
  Space,
  Progress,
  Button,
  Tooltip,
  Alert,
  Row,
  Col,
} from "antd";
import { QuestionCircleOutlined, ToolOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

/** 预警有效率评分 0–100：规则命中 → 核查有效 → 实际逾期的链路加权（演示） */
function computeWarningEfficiencyScore(parts: { funnel: number; advance: number; fp: number }): number {
  const wF = 0.42;
  const wA = 0.33;
  const wP = 0.25;
  const s = parts.funnel * wF + parts.advance * wA + parts.fp * wP;
  return Math.round(Math.min(100, Math.max(40, s)));
}

/** 规则触发 → 逾期 转化漏斗（演示，笔数） */
const FUNNEL_STAGES = [
  { stage: "规则触发", value: 2840, pct: 100 },
  { stage: "完成核查", value: 2310, pct: 81 },
  { stage: "核查有效预警", value: 1680, pct: 59 },
  { stage: "30d 内实际逾期", value: 620, pct: 22 },
];

/** 预警提前天数分布（目标 >15 天） */
const ADVANCE_DAYS = [
  { bucket: "0–7天", count: 120, target: false },
  { bucket: "8–15天", count: 210, target: false },
  { bucket: "16–30天", count: 380, target: true },
  { bucket: "31–60天", count: 290, target: true },
  { bucket: ">60天", count: 95, target: true },
];

/** 规则误报率排行（越低越好，演示 %） */
const FALSE_POSITIVE_RANK = [
  { rule: "夜间交易占比", fpRate: 34, samples: 420 },
  { rule: "设备簇相似", fpRate: 28, samples: 310 },
  { rule: "税报波动", fpRate: 19, samples: 265 },
  { rule: "司法涉诉", fpRate: 11, samples: 198 },
];

/** 产品线 × 规则效果矩阵：有效率 %（演示） */
const PRODUCT_LINES = ["经营贷", "税金贷", "消费贷", "小微贷"];
const RULE_COLS = ["司法", "多头", "税报", "设备"];
const EFFECT_MATRIX: number[][] = [
  [82, 68, 71, 55],
  [78, 62, 88, 49],
  [65, 74, 58, 61],
  [71, 59, 63, 52],
];

function cellBg(rate: number): string {
  if (rate >= 75) return "rgba(95, 155, 122, 0.35)";
  if (rate >= 60) return "rgba(111, 143, 149, 0.22)";
  return "rgba(250, 173, 20, 0.2)";
}

export default function O2OMonitor() {
  const navigate = useNavigate();

  const scoreParts = useMemo(
    () => ({
      funnel: 78,
      advance: 72,
      fp: 81,
    }),
    [],
  );
  const compositeScore = useMemo(() => computeWarningEfficiencyScore(scoreParts), [scoreParts]);

  return (
    <ModulePageShell
      title="策略效果追踪"
      subtitle="从「线过线拒一致性」转为预警策略设计预期 vs 实际运营效果；聚焦 15 天预警提前量痛点（演示数据）"
      breadcrumb={["资产监控", "策略效果追踪"]}
      actions={
        <Button type="primary" icon={<ToolOutlined />} onClick={() => navigate("/strategy/rules")}>
          发起规则调优
        </Button>
      }
    >
      <Alert
        type="info"
        showIcon
        className="rounded-lg"
        message="指标口径说明"
        description="预警有效率评分综合漏斗转化、提前量达标占比与误报控制；生产环境请与风控口径、样本窗口对齐。"
      />

      <ModuleSectionCard
        title="预警有效率评分"
        subtitle="原「综合一致性得分」已替换为贷后预警链路评分"
        extra={
          <Tooltip title="加权：漏斗转化 42% + 提前量 33% + 误报控制 25%（演示）">
            <QuestionCircleOutlined className="text-text-muted" />
          </Tooltip>
        }
      >
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={8}>
            <div className="text-center py-2">
              <Text type="secondary" className="text-[12px] block mb-1">综合评分</Text>
              <Text strong className="text-[40px] leading-none text-[#4f6970]">{compositeScore}</Text>
              <Text type="secondary" className="text-[12px] block mt-2">较上周 +3</Text>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Space direction="vertical" className="w-full" size={12}>
              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <Text>漏斗转化（触发→有效预警）</Text>
                  <Text type="secondary">{scoreParts.funnel}</Text>
                </div>
                <Progress percent={scoreParts.funnel} size="small" strokeColor="#5f9b7a" showInfo={false} />
              </div>
              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <Text>提前量（&gt;15 天占比加权）</Text>
                  <Text type="secondary">{scoreParts.advance}</Text>
                </div>
                <Progress percent={scoreParts.advance} size="small" strokeColor="#6f8f95" showInfo={false} />
              </div>
              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <Text>误报控制（反向误报率）</Text>
                  <Text type="secondary">{scoreParts.fp}</Text>
                </div>
                <Progress percent={scoreParts.fp} size="small" strokeColor="#c77b78" showInfo={false} />
              </div>
            </Space>
          </Col>
        </Row>
      </ModuleSectionCard>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ModuleSectionCard title="规则触发 → 逾期转化漏斗" subtitle="观察核查与有效预警断点">
            <div className="space-y-3">
              {FUNNEL_STAGES.map((s, i) => (
                <div key={s.stage}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <Text strong>{s.stage}</Text>
                    <Text type="secondary">
                      {s.value.toLocaleString()} 笔 · {s.pct}%
                    </Text>
                  </div>
                  <Progress
                    percent={s.pct}
                    size="small"
                    strokeColor={i === FUNNEL_STAGES.length - 1 ? "#c77b78" : "#4f6970"}
                    showInfo={false}
                  />
                </div>
              ))}
            </div>
          </ModuleSectionCard>
        </Col>
        <Col xs={24} lg={12}>
          <ModuleSectionCard title="预警提前天数分布" subtitle="目标：主要质量集中在 &gt;15 天（绿色段）">
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={ADVANCE_DAYS} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v: number) => [v, "笔数"]} />
                  <Bar dataKey="count" name="笔数" radius={[4, 4, 0, 0]}>
                    {ADVANCE_DAYS.map((e) => (
                      <Cell key={e.bucket} fill={e.target ? "#5f9b7a" : "#d9d9d9"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Text type="secondary" className="text-[12px] block mt-2">
              当前 &gt;15 天预警占比约 62%（演示），低于目标时可下钻至规则包版本与渠道结构。
            </Text>
          </ModuleSectionCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <ModuleSectionCard title="规则误报率排行" subtitle="核查结论为「非风险」/ 未逾期 占比（演示）">
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={FALSE_POSITIVE_RANK} layout="vertical" margin={{ left: 100, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} unit="%" domain={[0, 40]} />
                  <YAxis type="category" dataKey="rule" width={96} tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v: number, _n, p) => [`${v}%`, `样本 ${(p?.payload as { samples: number }).samples}`]} />
                  <Bar dataKey="fpRate" name="误报率%" fill="#c77b78" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ModuleSectionCard>
        </Col>
        <Col xs={24} lg={14}>
          <ModuleSectionCard title="产品线 × 规则 效果对比矩阵" subtitle="单元格为预警有效率 %（演示）">
            <div className="overflow-x-auto">
              <table className="border-collapse text-xs w-full">
                <thead>
                  <tr>
                    <th className="border border-[#f0f0f0] p-2 bg-[#fafafa] w-20">产品 \ 规则</th>
                    {RULE_COLS.map((h) => (
                      <th key={h} className="border border-[#f0f0f0] p-2 bg-[#fafafa] font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EFFECT_MATRIX.map((row, ri) => (
                    <tr key={PRODUCT_LINES[ri]}>
                      <td className="border border-[#f0f0f0] p-2 bg-[#fafafa] font-medium">{PRODUCT_LINES[ri]}</td>
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="border border-[#f0f0f0] p-2 text-center tabular-nums font-medium"
                          style={{ backgroundColor: cellBg(cell) }}
                        >
                          {cell}%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModuleSectionCard>
        </Col>
      </Row>

      <ModuleSectionCard title="策略版本对照（摘要）" subtitle="替代原自动审批率 / 决策耗时 / 线过线拒打标">
        <Table
          size="small"
          pagination={false}
          rowKey="version"
          dataSource={[
            { version: "规则包 2026.04a", advanceGt15: "64%", effectiveRate: "71%", fp: "22%", note: "收紧多头阈值" },
            { version: "规则包 2026.03b", advanceGt15: "58%", effectiveRate: "66%", fp: "26%", note: "基线" },
          ]}
          columns={[
            { title: "版本", dataIndex: "version", render: (v: string) => <Text strong className="text-[13px]">{v}</Text> },
            { title: ">15天预警占比", dataIndex: "advanceGt15" },
            { title: "有效率", dataIndex: "effectiveRate" },
            { title: "误报率", dataIndex: "fp" },
            { title: "说明", dataIndex: "note", ellipsis: true, render: (v: string) => <Text type="secondary" className="text-[12px]">{v}</Text> },
            {
              title: "操作",
              key: "op",
              width: 120,
              render: () => (
                <Button type="link" size="small" className="!p-0" onClick={() => navigate("/strategy/rules")}>
                  调优
                </Button>
              ),
            },
          ]}
        />
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
