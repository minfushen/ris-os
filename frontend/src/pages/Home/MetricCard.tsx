import { Typography, Badge } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend: "up" | "down" | "flat";
  trendValue: string;
  alert?: boolean;
  alertText?: string;
  sparkline?: number[];
}

// 简单的迷你折线图（SVG）
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;

  const width = 60;
  const height = 20;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}

export default function MetricCard({
  title,
  value,
  unit,
  trend,
  trendValue,
  alert,
  alertText,
  sparkline,
}: MetricCardProps) {
  const trendColor =
    trend === "up" ? "#5f9b7a" : trend === "down" ? "#c77b78" : "#6e7c84";

  const TrendIcon =
    trend === "up" ? ArrowUpOutlined : trend === "down" ? ArrowDownOutlined : MinusOutlined;

  return (
    <div
      className={`rounded-lg border border-border-soft bg-white/75 px-3 py-2.5 border-l-[3px] border-solid ${
        alert ? "border-l-accent-danger" : "border-l-primary"
      }`}
    >
      {/* 标题行 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <Text className="text-xs text-text-muted">{title}</Text>
        {alert && (
          <Badge
            count="!"
            style={{
              background: "#c77b78",
              fontSize: 10,
              minWidth: 16,
              height: 16,
            }}
          />
        )}
      </div>

      {/* 数值行 */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          marginBottom: 4,
        }}
      >
        <Text
          className="text-2xl font-semibold text-primary font-mono"
          style={{ fontFamily: "'SF Mono', 'Monaco', monospace" }}
        >
          {value}
        </Text>
        {unit && (
          <Text className="ml-1 text-xs text-text-muted">
            {unit}
          </Text>
        )}
      </div>

      {/* 趋势行 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <TrendIcon style={{ fontSize: 10, color: trendColor }} />
          <Text style={{ fontSize: 11, color: trendColor }}>{trendValue}</Text>
        </span>
        {sparkline && <Sparkline data={sparkline} color={trendColor} />}
      </div>

      {/* 告警提示 */}
      {alert && alertText && (
        <Text className="mt-1 block text-[10px] text-accent-danger">
          {alertText}
        </Text>
      )}
    </div>
  );
}
