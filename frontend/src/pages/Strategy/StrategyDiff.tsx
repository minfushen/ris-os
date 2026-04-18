import { Card, Typography, Space, Tag, Divider } from "antd";
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

// 模拟策略 Diff 数据
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

// 统计变更
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
      {/* 标题栏 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text strong style={{ fontSize: 13 }}>
          1. 策略 Diff 对比 (左旧右新)
        </Text>
        <Space size={12}>
          <Space size={4}>
            <Tag color="green" style={{ margin: 0 }}>
              <PlusOutlined /> +{newStats.added} 新增
            </Tag>
          </Space>
          <Space size={4}>
            <Tag color="red" style={{ margin: 0 }}>
              <MinusOutlined /> -{oldStats.removed} 删除
            </Tag>
          </Space>
          <Space size={4}>
            <Tag color="orange" style={{ margin: 0 }}>
              <EditOutlined /> ~{newStats.modified} 修改
            </Tag>
          </Space>
        </Space>
      </div>

      {/* 左右对比面板 */}
      <div style={{ display: "flex", gap: 1, border: "1px solid #d9d9d9", background: "#fafafa" }}>
        {/* 左侧：线上版本 */}
        <div style={{ flex: 1, background: "#fff" }}>
          <div
            style={{
              padding: "8px 12px",
              background: "#fafafa",
              borderBottom: "1px solid #d9d9d9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong style={{ fontSize: 12 }}>
              线上版本 ({oldVersion})
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              当前生效
            </Text>
          </div>
          <div style={{ padding: 8, minHeight: 200 }}>
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
                    paddingRight: 8,
                    userSelect: "none",
                  }}
                >
                  {line.lineNumber}
                </span>
                <span style={{ flex: 1, color: line.type === "removed" ? "#ff4d4f" : "#262626" }}>
                  {line.content}
                </span>
                {line.type === "removed" && (
                  <Tag color="red" style={{ marginLeft: 8, fontSize: 10 }}>
                    删除
                  </Tag>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 分隔线 */}
        <div style={{ width: 1, background: "#d9d9d9" }} />

        {/* 右侧：本次修改 */}
        <div style={{ flex: 1, background: "#fff" }}>
          <div
            style={{
              padding: "8px 12px",
              background: "#fafafa",
              borderBottom: "1px solid #d9d9d9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong style={{ fontSize: 12 }}>
              本次修改 ({newVersion})
            </Text>
            <Tag color="blue" style={{ fontSize: 10 }}>
              待审批
            </Tag>
          </div>
          <div style={{ padding: 8, minHeight: 200 }}>
            {newLines.map((line) => (
              <div
                key={line.lineNumber}
                style={{
                  display: "flex",
                  fontFamily: "monospace",
                  fontSize: 12,
                  lineHeight: "24px",
                  background:
                    line.type === "added"
                      ? "#f6ffed"
                      : line.type === "modified"
                      ? "#fffbe6"
                      : "transparent",
                }}
              >
                <span
                  style={{
                    width: 32,
                    color: "#8c8c8c",
                    textAlign: "right",
                    paddingRight: 8,
                    userSelect: "none",
                  }}
                >
                  {line.lineNumber}
                </span>
                <span
                  style={{
                    flex: 1,
                    color:
                      line.type === "added"
                        ? "#52c41a"
                        : line.type === "modified"
                        ? "#d48806"
                        : "#262626",
                  }}
                >
                  {line.content}
                </span>
                {line.type === "added" && (
                  <Tag color="green" style={{ marginLeft: 8, fontSize: 10 }}>
                    新增
                  </Tag>
                )}
                {line.type === "modified" && (
                  <Tag color="orange" style={{ marginLeft: 8, fontSize: 10 }}>
                    改动
                  </Tag>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 变更摘要 */}
      <Card
        size="small"
        style={{ marginTop: 12, background: "#fafafa", borderRadius: 0 }}
        styles={{ body: { padding: "8px 12px" } }}
      >
        <Space split={<Divider type="vertical" />}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            多头查询阈值: 10 → 15 (放宽)
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            负债率阈值: 0.7 → 0.8 (收紧)
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            预计影响: 通过率 +2.3%
          </Text>
        </Space>
      </Card>
    </div>
  );
}
