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
      styles={{ body: { padding: 0 } }}
    >
      <div className="module-section-header">
        <div>
          <Text className="module-section-title">{title}</Text>
          {subtitle && (
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              {subtitle}
            </Text>
          )}
        </div>
        {extra && <div>{extra}</div>}
      </div>
      <div
        className="module-section-body"
        style={{ padding: noPadding ? 0 : 16 }}
      >
        {children}
      </div>
    </Card>
  );
}
