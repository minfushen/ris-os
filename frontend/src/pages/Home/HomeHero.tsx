import { Typography, Button, Tag } from "antd";
import { ThunderboltOutlined, ExperimentOutlined, InboxOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

export interface HeroCta {
  label: string;
  action: string;
}

interface HomeHeroProps {
  onQuickAction?: (action: string) => void;
  myBacklogCount: number;
  urgentSummary: string | null;
  /** 与待办队列占比最高的类型对齐（P1 H2） */
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
}

export default function HomeHero({
  onQuickAction,
  myBacklogCount,
  urgentSummary,
  primaryCta,
  secondaryCta,
}: HomeHeroProps) {
  return (
    <section className="hero-section">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Title level={3} className="!mb-0 text-text-primary">
              风控 OS
            </Title>
            <Tag className="glass-tag-warning text-xs">UAT 环境</Tag>
          </div>
          <Text className="text-text-secondary text-sm">
            实时监控 · 智能归因 · 策略闭环 · 人机共智
          </Text>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            <Tag icon={<InboxOutlined />} color="processing" className="m-0 text-xs">
              我的待办 {myBacklogCount} 条
            </Tag>
            {urgentSummary ? (
              <Text type="secondary" className="text-xs">
                优先处理：<Text strong className="text-xs">{urgentSummary}</Text>
              </Text>
            ) : (
              <Text type="secondary" className="text-xs">
                暂无进行中的优先项
              </Text>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={() => onQuickAction?.(primaryCta.action)}
            className="glass-btn-primary"
          >
            {primaryCta.label}
          </Button>
          <Button
            icon={<ExperimentOutlined />}
            onClick={() => onQuickAction?.(secondaryCta.action)}
            className="glass-btn-secondary"
          >
            {secondaryCta.label}
          </Button>
        </div>
      </div>

      <details className="mt-4 pt-4 border-t border-border-soft group">
        <summary className="text-xs text-text-muted cursor-pointer list-none flex items-center gap-1">
          <span className="group-open:hidden">当班与更新时间（展开）</span>
          <span className="hidden group-open:inline">当班与更新时间（收起）</span>
        </summary>
        <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
          <span>当前值班：张三</span>
          <span>|</span>
          <span>更新时间：{new Date().toLocaleTimeString("zh-CN")}</span>
        </div>
      </details>
    </section>
  );
}
