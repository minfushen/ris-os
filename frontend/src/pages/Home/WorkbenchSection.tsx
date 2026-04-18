import { Card, Typography } from "antd";
import type { ReactNode } from "react";

const { Text } = Typography;

interface WorkbenchSectionProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
  children: ReactNode;
  noPadding?: boolean;
}

export default function WorkbenchSection({
  title,
  subtitle,
  extra,
  children,
  noPadding = false,
}: WorkbenchSectionProps) {
  return (
    <Card
      className="module-section"
      styles={{ body: { padding: "var(--spacing-none)" } }}
    >
      <div className="module-section-header">
        <div>
          <Text className="module-section-title">{title}</Text>
          {subtitle && (
            <Text type="secondary" className="text-[12px] layout-ml-sm">
              {subtitle}
            </Text>
          )}
        </div>
        {extra && <div>{extra}</div>}
      </div>
      <div
        className={`module-section-body ${noPadding ? "layout-p-0" : "layout-p-lg"}`}
      >
        {children}
      </div>
    </Card>
  );
}
