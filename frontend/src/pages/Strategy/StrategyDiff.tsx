import { Card, Typography, Space, Tag, Divider, Descriptions, Table } from "antd";
import {
  PlusOutlined,
  MinusOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface StrategyLine {
  lineNumber: number;
  content: string;
  type: "unchanged" | "added" | "removed" | "modified";
  oldContent?: string;
}

interface StrategyDiffProps {
  oldVersion?: string;
  newVersion?: string;
  oldLines?: StrategyLine[];
  newLines?: StrategyLine[];
}

const DEFAULT_OLD_LINES: StrategyLine[] = [
  { lineNumber: 12, content: "12. IF [多头余额环比] > INDUSTRY[制造业].threshold(35%)", type: "unchanged" },
  { lineNumber: 13, content: "13. AND [税报最近申报距今天数] > 45", type: "unchanged" },
  { lineNumber: 14, content: "14. THEN [预警等级: 中]", type: "unchanged" },
  { lineNumber: 15, content: "15. ROUTE [贷后核查队列 · 华东]", type: "unchanged" },
];

const DEFAULT_NEW_LINES: StrategyLine[] = [
  { lineNumber: 12, content: "12. IF [多头余额环比] > INDUSTRY[制造业].threshold(38%)", type: "modified", oldContent: "12. IF [多头余额环比] > INDUSTRY[制造业].threshold(35%)" },
  { lineNumber: 13, content: "13. AND [税报最近申报距今天数] > 30", type: "modified", oldContent: "13. AND [税报最近申报距今天数] > 45" },
  { lineNumber: 14, content: "14. THEN [预警等级: 高]", type: "modified", oldContent: "14. THEN [预警等级: 中]" },
  { lineNumber: 15, content: "15. ROUTE [贷后核查队列 · 华东]", type: "unchanged" },
];

const IMPACT_CHANNELS = [
  { key: "1", channel: "经营贷", passDelta: "日触发 +12%", exposure: "约 1.8k 客户/周进入预警" },
  { key: "2", channel: "税易贷", passDelta: "日触发 +22%", exposure: "误报率预估 +4ppt" },
  { key: "3", channel: "消费贷", passDelta: "日触发 +6%", exposure: "对 M1 池入催影响有限" },
];

function countChanges(lines: StrategyLine[]) {
  const added = lines.filter((l) => l.type === "added").length;
  const removed = lines.filter((l) => l.type === "removed").length;
  const modified = lines.filter((l) => l.type === "modified").length;
  return { added, removed, modified, total: added + removed + modified };
}

export default function StrategyDiff({
  oldVersion = "V3.1",
  newVersion = "V3.2",
  oldLines = DEFAULT_OLD_LINES,
  newLines = DEFAULT_NEW_LINES,
}: StrategyDiffProps) {
  const oldStats = countChanges(oldLines);
  const newStats = countChanges(newLines);

  return (
    <div>
      <div className="layout-flex-between layout-mb-md">
        <Text strong className="text-[13px]">
          1. 策略 Diff 对比 (左旧右新)
        </Text>
        <Space size={12}>
          <div className="layout-flex-center layout-gap-xs">
            <Tag color="green" className="!m-0">
              <PlusOutlined /> +{newStats.added} 新增
            </Tag>
          </div>
          <div className="layout-flex-center layout-gap-xs">
            <Tag color="red" className="!m-0">
              <MinusOutlined /> -{oldStats.removed} 删除
            </Tag>
          </div>
          <div className="layout-flex-center layout-gap-xs">
            <Tag color="orange" className="!m-0">
              <EditOutlined /> ~{newStats.modified} 修改
            </Tag>
          </div>
        </Space>
      </div>

      <div className="layout-flex layout-gap-px border border-[#d9d9d9] bg-[#fafafa]">
        <div className="layout-flex-1 bg-white">
          <div className="layout-diff-header">
            <Text strong className="text-[12px]">
              线上版本 ({oldVersion})
            </Text>
            <Text type="secondary" className="text-[13px]">
              当前生效
            </Text>
          </div>
          <div className="layout-diff-body">
            {oldLines.map((line) => (
              <div
                key={line.lineNumber}
                style={{
                  display: "flex",
                  fontFamily: "monospace",
                  fontSize: 12,
                  lineHeight: "24px",
                  background: line.type === "removed" ? "#fff1f0" : "transparent",
                  textDecoration: line.type === "removed" ? "line-through" : "none",
                  opacity: line.type === "removed" ? 0.7 : 1,
                }}
              >
                <span
                  style={{
                    width: 32,
                    color: "#8c8c8c",
                    textAlign: "right",
                    paddingRight: "var(--spacing-sm)",
                    userSelect: "none",
                  }}
                >
                  {line.lineNumber}
                </span>
                <span style={{ flex: 1, color: line.type === "removed" ? "#ff4d4f" : "#262626" }}>{line.content}</span>
                {line.type === "removed" && (
                  <Tag color="red" className="layout-ml-sm text-[10px]">
                    删除
                  </Tag>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="w-px shrink-0 bg-[#d9d9d9]" aria-hidden />

        <div className="layout-flex-1 bg-white">
          <div className="layout-diff-header">
            <Text strong className="text-[12px]">
              本次修改 ({newVersion})
            </Text>
            <Tag color="blue" className="text-[10px]">
              待审批
            </Tag>
          </div>
          <div className="layout-diff-body">
            {newLines.map((line) => (
              <div
                key={line.lineNumber}
                style={{
                  display: "flex",
                  fontFamily: "monospace",
                  fontSize: 12,
                  lineHeight: "24px",
                  background:
                    line.type === "added" ? "#f6ffed" : line.type === "modified" ? "#fffbe6" : "transparent",
                }}
              >
                <span
                  style={{
                    width: 32,
                    color: "#8c8c8c",
                    textAlign: "right",
                    paddingRight: "var(--spacing-sm)",
                    userSelect: "none",
                  }}
                >
                  {line.lineNumber}
                </span>
                <span
                  style={{
                    flex: 1,
                    color: line.type === "added" ? "#52c41a" : line.type === "modified" ? "#d48806" : "#262626",
                  }}
                >
                  {line.content}
                </span>
                {line.type === "added" && (
                  <Tag color="green" className="layout-ml-sm text-[10px]">
                    新增
                  </Tag>
                )}
                {line.type === "modified" && (
                  <Tag color="orange" className="layout-ml-sm text-[10px]">
                    改动
                  </Tag>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel layout-mt-md p-4 rounded-[var(--radius-card,8px)]">
        <Text strong className="text-sm block layout-mb-md">
          影响评估（贷后预警 / 演示）
        </Text>
        <Text type="secondary" className="text-xs block layout-mb-md">
          量化新增预警客户数、产品线余额结构变化与核查队列 SLA 压力；高价值变更需主管 + 联席会签。
        </Text>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} className="layout-mb-md">
          <Descriptions.Item label="预估新增预警（灰度周）">+18% vs 基线，约 +420 单/日</Descriptions.Item>
          <Descriptions.Item label="影响在贷客户（估算）">约 6.2 万在贷户可能新增或升级预警</Descriptions.Item>
          <Descriptions.Item label="涉及在贷敞口">在贷余额区间 ￥118 亿～￥126 亿（按当前账簿）</Descriptions.Item>
          <Descriptions.Item label="产品线结构">经营贷 / 税易贷 / 消费贷（主增量：税易贷）</Descriptions.Item>
        </Descriptions>
        <Text strong className="text-xs block layout-mb-sm">
          产品线维度敏感度（预估）
        </Text>
        <Table
          size="small"
          pagination={false}
          rowKey="key"
          dataSource={IMPACT_CHANNELS}
          columns={[
            { title: "产品线", dataIndex: "channel", width: 120 },
            { title: "预警触发敏感度(Δ)", dataIndex: "passDelta", width: 160 },
            { title: "影响面说明", dataIndex: "exposure" },
          ]}
        />
      </div>

      <Card
        size="small"
        className="layout-mt-md rounded-none bg-[#fafafa]"
        styles={{
          body: { padding: "var(--spacing-sm) var(--spacing-md)" },
        }}
      >
        <Space split={<Divider type="vertical" />}>
          <Text type="secondary" className="text-[13px]">
            制造业多头阈值: 35% → 38% (收紧)
          </Text>
          <Text type="secondary" className="text-[13px]">
            税报断档天数: 45 → 30 (收紧)
          </Text>
          <Text type="secondary" className="text-[13px]">
            规则条数变更: +{newStats.added} / ~{newStats.modified} / 删除见 Diff
          </Text>
        </Space>
      </Card>
    </div>
  );
}
