/**
 * ISO 8601 时间戳 → 本地化日期时间字符串
 * 例：2025-06-09T10:30:00+00:00 → 2025-06-09 18:30
 */
export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

/**
 * 0–1 小数 → 百分比字符串
 * 例：0.6667 → "66.67%"
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 数字 → 千分位格式
 * 例：100000 → "100,000"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("zh-CN");
}
