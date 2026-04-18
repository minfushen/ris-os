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
  { lineNumber: 23, content: "23. IF [多头查询次数] > 10", type: "unchanged" },
  { lineNumber: 24, content: "24. THEN [直接拒绝]", type: "unchanged" },
  { lineNumber: 25, content: "25. AND [负债率] > 0.7", type: "unchanged" },
  { lineNumber: 26, content: "26. RETURN [风险等级: 高]", type: "unchanged" },
];

const DEFAULT_NEW_LINES: StrategyLine[] = [
  { lineNumber: 23, content: "23. IF [多头查询次数] > 15", type: "modified", oldContent: "23. IF [多头查询次数] > 10" },
  { lineNumber: 24, content: "24. AND [负债率] > 0.8", type: "modified", oldContent: "24. THEN [直接拒绝]" },
  { lineNumber: 25, content: "25. THEN [直接拒绝]", type: "added" },
  { lineNumber: 26, content: "26. RETURN [风险等级: 高]", type: "unchanged" },
];

const IMPACT_CHANNELS = [
  { key: "1", channel: "自营 App", passDelta: "+1.1ppt", exposure: "约 38% 影响面" },
  { key: "2", channel: "联营 API", passDelta: "+3.8ppt", exposure: "约 22% 影响面" },
  { key: "3", channel: "地推", passDelta: "+0.6ppt", exposure: "约 9% 影响面" },
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
          影响评估报告（消金授信 / 演示）
        </Text>
        <Text type="secondary" className="text-xs block layout-mb-md">
          除通过率外，需量化影响客户规模、金额敞口与波及的渠道/产品线，供业务与合规双签。
        </Text>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} className="layout-mb-md">
          <Descriptions.Item label="预计通过率影响">+2.3%（全渠道加权）</Descriptions.Item>
          <Descriptions.Item label="影响客户规模（30 天）">约 12.4 万笔进件中 ~8.1 万人可能改变决策结果</Descriptions.Item>
          <Descriptions.Item label="涉及授信敞口（估算）">在批余额区间 ￥42 亿～￥48 亿（按当前在贷敞口口径）</Descriptions.Item>
          <Descriptions.Item label="产品线">现金贷 / 循环额度 / 场景分期（主影响：现金贷）</Descriptions.Item>
        </Descriptions>
        <Text strong className="text-xs block layout-mb-sm">
          渠道维度敏感度（预估）
        </Text>
        <Table
          size="small"
          pagination={false}
          rowKey="key"
          dataSource={IMPACT_CHANNELS}
          columns={[
            { title: "渠道", dataIndex: "channel", width: 120 },
            { title: "通过率敏感度(Δ)", dataIndex: "passDelta", width: 140 },
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
            多头查询阈值: 10 → 15 (放宽)
          </Text>
          <Text type="secondary" className="text-[13px]">
            负债率阈值: 0.7 → 0.8 (收紧)
          </Text>
          <Text type="secondary" className="text-[13px]">
            规则条数变更: +{newStats.added} / ~{newStats.modified} / 删除见 Diff
          </Text>
        </Space>
      </Card>
    </div>
  );
}
