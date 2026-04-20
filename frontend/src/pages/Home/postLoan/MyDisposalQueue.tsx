import { Typography, List } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { RiskStrip, StatusHighlight, type RiskStripVariant, type StatusHighlightTone } from "./uiPrimitives";

const { Text } = Typography;

type PendingSlaLevel = "danger" | "warning" | "warning-soft";

const PENDING_ITEMS = [
  { id: "1", name: "王五物流", sub: "借据 WH20251088 · 道路运输", sla: "超时 8h", slaLevel: "danger" as const },
  { id: "2", name: "赵六制造", sub: "借据 ZZ20251102 · 机械制造", sla: "剩 2h", slaLevel: "warning" as const },
  { id: "3", name: "陈七餐饮", sub: "借据 CQ20250930 · 餐饮服务", sla: "剩 18h", slaLevel: "warning-soft" as const },
];

type DoneResult = "有效" | "正常" | "升级";

const DONE_ITEMS: { id: string; summary: string; result: DoneResult }[] = [
  { id: "d1", summary: "挽回客户 9 户，合计约 420 万在贷", result: "有效" },
  { id: "d2", summary: "误报排除 11 条，已归档口径说明", result: "正常" },
  { id: "d3", summary: "升级策略 / 法诉 3 起", result: "升级" },
];

const RESULT_HIGHLIGHT: Record<DoneResult, StatusHighlightTone> = {
  有效: "success",
  正常: "neutral",
  升级: "warning-soft",
};

function stripForPendingLevel(level: PendingSlaLevel): RiskStripVariant {
  if (level === "danger") return "danger";
  if (level === "warning") return "warning";
  return "warning-soft";
}

interface MyDisposalQueueProps {
  onOpenItem?: (id: string) => void;
}

export default function MyDisposalQueue({ onOpenItem }: MyDisposalQueueProps) {
  return (
    <section className="section-shell" id="work-queue">
      <div className="section-header">
        <Text className="section-title">我的处置队列</Text>
        <Text type="secondary" className="section-subtitle ml-2">
          默认本人待办；右侧汇总本周完成与结果分布（演示）
        </Text>
      </div>
      <div className="section-body">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="pl-solid-card flex min-h-[280px] flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-white px-4 py-3">
              <Text strong className="text-[15px] text-[#262626]">
                待核查工单
              </Text>
              <StatusHighlight tone="warning">12 待办</StatusHighlight>
            </div>
            <div className="flex flex-1 flex-col gap-2 bg-[#fafafa] p-3">
              <List
                size="small"
                split={false}
                dataSource={PENDING_ITEMS}
                renderItem={(item) => (
                  <List.Item className="!block !p-0 !border-none">
                    <button
                      type="button"
                      className={`pl-queue-row pl-queue-row--sla-${item.slaLevel} flex w-full overflow-hidden`}
                      onClick={() => onOpenItem?.(item.id)}
                    >
                      <RiskStrip variant={stripForPendingLevel(item.slaLevel)} />
                      <div className="flex min-w-0 flex-1 items-start justify-between gap-2 px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <Text strong className="block text-[15px] text-[#262626]">
                            {item.name}
                          </Text>
                          <span className="pl-aux-text mt-0.5 block">{item.sub}</span>
                        </div>
                        <StatusHighlight
                          tone={
                            item.slaLevel === "danger"
                              ? "danger"
                              : item.slaLevel === "warning"
                                ? "warning"
                                : "warning-soft"
                          }
                          icon={<ClockCircleOutlined />}
                        >
                          {item.sla}
                        </StatusHighlight>
                      </div>
                    </button>
                  </List.Item>
                )}
              />
            </div>
            <Text className="pl-aux-text border-t border-black/[0.06] bg-white px-4 py-2">
              点击卡片进入预警核查工作台
            </Text>
          </div>

          <div className="pl-solid-card flex min-h-[280px] flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-white px-4 py-3">
              <Text strong className="text-[15px] text-[#262626]">
                本周完成
              </Text>
              <span className="pl-aux-text inline-flex items-center gap-1">
                <CheckCircleOutlined className="text-[#8c8c8c]" />
                <Text className="!text-[12px] !text-[#8c8c8c]">28 笔</Text>
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 bg-[#fafafa] p-3">
              <List
                size="small"
                split={false}
                dataSource={DONE_ITEMS}
                renderItem={(item) => (
                  <List.Item className="!block !p-0 !border-none">
                    <div className="pl-solid-card flex overflow-hidden">
                      <RiskStrip
                        variant={
                          item.result === "有效" ? "success" : item.result === "升级" ? "warning" : "neutral"
                        }
                      />
                      <div className="flex min-w-0 flex-1 items-start justify-between gap-2 px-3 py-2.5">
                        <Text className="flex-1 text-[14px] font-medium leading-snug text-[#262626]">{item.summary}</Text>
                        <StatusHighlight tone={RESULT_HIGHLIGHT[item.result]}>{item.result}</StatusHighlight>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
            <Text className="pl-aux-text border-t border-black/[0.06] bg-white px-4 py-2">
              结果分布用于复盘质检与规则调优输入
            </Text>
          </div>
        </div>
      </div>
    </section>
  );
}
