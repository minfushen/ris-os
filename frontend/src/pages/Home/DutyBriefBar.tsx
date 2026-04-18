import { Typography, Tag } from "antd";
import { TeamOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface DutyBriefBarProps {
  /** 如：白班 */
  shiftLabel: string;
  /** 如：张三(值班) */
  dutyOfficer: string;
  /** 距上次打开首页文案，如「8 小时」 */
  sinceLastLoginLabel: string;
  /** 新增/未处理高危异动条数（演示口径） */
  highRiskAlertCount: number;
  /** 我的待办工单数 */
  myPendingWorkCount: number;
  /** 今日关键指标摘要片段，如「授信通过率 -2.1%」 */
  metricSummary: string;
  /** 简报数据刷新时间 HH:mm */
  updatedAtTime: string;
  onClickHighRiskAlerts?: () => void;
  onClickMyPending?: () => void;
  onClickMetricSummary?: () => void;
}

/**
 * 当班简报条：替代大 Hero，首屏一句话回答「有无紧急异常 / 指标是否偏离 / 我该处理什么」。
 */
export default function DutyBriefBar({
  shiftLabel,
  dutyOfficer,
  sinceLastLoginLabel,
  highRiskAlertCount,
  myPendingWorkCount,
  metricSummary,
  updatedAtTime,
  onClickHighRiskAlerts,
  onClickMyPending,
  onClickMetricSummary,
}: DutyBriefBarProps) {
  const sep = <span className="text-text-muted px-1 select-none">|</span>;

  const linkBtn =
    "border-0 bg-transparent p-0 m-0 cursor-pointer text-inherit hover:text-primary underline-offset-2 hover:underline text-left font-inherit";

  return (
    <section className="glass-panel px-4 py-3 rounded-[var(--radius-glass)]">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <Tag icon={<TeamOutlined />} color="processing" className="m-0 text-xs shrink-0">
              当班简报
            </Tag>
            <Text strong className="text-sm text-text-primary shrink-0">
              {shiftLabel}
            </Text>
            <Text type="secondary" className="text-xs">
              值班 {dutyOfficer}
            </Text>
          </div>
          <div className="flex items-center gap-1 text-xs text-text-muted shrink-0">
            <ClockCircleOutlined />
            <span>更新时间 {updatedAtTime}</span>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-text-primary leading-relaxed flex flex-wrap items-center gap-y-1">
          <span className="text-text-secondary">距上次登录</span>
          <Text className="text-xs sm:text-sm !mb-0">{sinceLastLoginLabel}</Text>
          {sep}
          <button type="button" className={linkBtn} onClick={onClickHighRiskAlerts}>
            <Text type="danger" strong className="!mb-0">
              高危告警 {highRiskAlertCount} 条
            </Text>
          </button>
          {sep}
          <button type="button" className={linkBtn} onClick={onClickMyPending}>
            <Text strong className="!mb-0">
              我的待办 {myPendingWorkCount} 条
            </Text>
          </button>
          {sep}
          <button type="button" className={linkBtn} onClick={onClickMetricSummary}>
            <Text className="!mb-0">{metricSummary}</Text>
          </button>
          <span className="hidden sm:inline">{sep}</span>
          <Text type="secondary" className="text-xs sm:text-sm !mb-0 hidden sm:inline">
            更新时间 {updatedAtTime}
          </Text>
        </div>
      </div>
    </section>
  );
}
