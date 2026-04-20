import type { ReactNode } from "react";
import { Button, Typography } from "antd";

const { Text } = Typography;

export interface PostLoanQuickActionDef {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

interface PostLoanQuickActionsProps {
  actions: PostLoanQuickActionDef[];
}

export default function PostLoanQuickActions({ actions }: PostLoanQuickActionsProps) {
  return (
    <section className="section-shell">
      <div className="section-header">
        <Text className="section-title">便捷操作</Text>
        <Text type="secondary" className="section-subtitle ml-2">
          贷后高频入口：归因、走访、阈值、催收与资产质量
        </Text>
      </div>
      <div className="section-body">
        <div className="flex flex-wrap gap-3">
          {actions.map((a) => (
            <Button
              key={a.key}
              type="default"
              size="large"
              className="pl-solid-card pl-solid-card--interactive !h-auto !py-4 min-w-[140px] flex-1 basis-[calc(50%-6px)] sm:basis-[calc(33.333%-8px)] lg:basis-0 lg:flex-1 lg:max-w-none !bg-white !border-black/[0.08] flex flex-col items-center gap-2 text-[#262626]"
              onClick={a.onClick}
            >
              <span className="text-xl text-[#1677ff]">{a.icon}</span>
              <span className="text-sm font-semibold text-center leading-snug whitespace-normal">{a.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
