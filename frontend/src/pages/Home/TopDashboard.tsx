import { Row, Col, message } from "antd";
import AnalystIndicatorCard from "./AnalystIndicatorCard";

/** 演示数据：与线框图一致强调「基准 + 口径」，避免各团队对分子分母理解不一致 */
const METRICS_DATA = [
  {
    title: "授信通过率",
    value: "67.3",
    unit: "%",
    trendText: "-2.1%",
    trendSemantic: "bad" as const,
    trendDirection: "down" as const,
    baselineText: "基准: 69.4%（上周同期）",
    caliberFootnote: "口径：授信审批通过笔数 ÷ 授信申请笔数 · 按申请日 T+1 日结 · 不含撤单",
    trendBars: [0.72, 0.7, 0.68, 0.66, 0.64, 0.65, 0.63],
    status: "alert" as const,
    footerMessage: "低于阈值，需关注",
    showTimeTabs: true,
    showSceneTabs: true,
  },
  {
    title: "支用通过率",
    value: "58.1",
    unit: "%",
    trendText: "-2.1%",
    trendSemantic: "bad" as const,
    trendDirection: "down" as const,
    baselineText: "基准: 60.2%（上周同期）",
    caliberFootnote: "口径：支用放款成功笔数 ÷ 支用申请笔数 · 按放款日 T+1",
    trendBars: [0.62, 0.6, 0.59, 0.58, 0.57, 0.56, 0.55],
    status: "attention" as const,
    footerMessage: "低于关注线，建议排查渠道与客群",
    showTimeTabs: true,
    showSceneTabs: true,
  },
  {
    title: "今日进件量",
    value: "12,475",
    unit: "",
    trendText: "+5.5%",
    trendSemantic: "good" as const,
    trendDirection: "up" as const,
    baselineText: "对比：昨日同期 11,820",
    caliberFootnote: "口径：全渠道进件「创建申请」次数 · 自然日 0–24h 实时累计（非漏斗完件）",
    trendBars: [0.45, 0.48, 0.5, 0.52, 0.58, 0.62, 0.68],
    status: "normal" as const,
    footerMessage: "处于正常波动区间",
    showTimeTabs: true,
    showSceneTabs: false,
  },
  {
    title: "待处理工单",
    value: "156",
    unit: "",
    trendText: "+30%",
    trendSemantic: "bad" as const,
    trendDirection: "up" as const,
    baselineText: "队列阈值: 120（本周滚动）",
    caliberFootnote: "口径：状态∈{待处理,处理中,待复核}且责任人为本人或本组的工单计数",
    trendBars: [0.35, 0.42, 0.5, 0.58, 0.65, 0.72, 0.78],
    status: "over_threshold" as const,
    footerMessage: "超出队列阈值，需减压与分流",
    showTimeTabs: true,
    showSceneTabs: false,
  },
];

export default function TopDashboard() {
  return (
    <Row gutter={[16, 16]} className="layout-mb-lg">
      {METRICS_DATA.map((m) => (
        <Col key={m.title} xs={24} sm={12} lg={6}>
          <AnalystIndicatorCard
            title={m.title}
            value={m.value}
            unit={m.unit}
            trendText={m.trendText}
            trendSemantic={m.trendSemantic}
            trendDirection={m.trendDirection}
            baselineText={m.baselineText}
            caliberFootnote={m.caliberFootnote}
            trendBars={m.trendBars}
            status={m.status}
            footerMessage={m.footerMessage}
            showTimeTabs={m.showTimeTabs}
            showSceneTabs={m.showSceneTabs}
            actionLabel="下钻"
            onAction={() => {
              void message.info(`「${m.title}」下钻（演示）：将接入监控 / 渠道拆解 / 工单详情`);
            }}
          />
        </Col>
      ))}
    </Row>
  );
}
