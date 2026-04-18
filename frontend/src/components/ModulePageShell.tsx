import { Typography, Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import WorkbenchHomeLink from "@/components/WorkbenchHomeLink";

const { Text } = Typography;

interface ModulePageShellProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  actions?: ReactNode;
  children: ReactNode;
}

export default function ModulePageShell({
  title,
  subtitle,
  breadcrumb,
  actions,
  children,
}: ModulePageShellProps) {
  return (
    <div>
      {/* 模块头部 */}
      <header className="module-header">
        <div className="flex justify-between items-start">
          <div>
            {/* 面包屑 */}
            {breadcrumb && breadcrumb.length > 0 && (
              <Breadcrumb
                items={[
                  {
                    title: (
                      <WorkbenchHomeLink className="text-text-muted hover:text-primary">
                        <HomeOutlined />
                      </WorkbenchHomeLink>
                    ),
                  },
                  ...breadcrumb.map((item, index) => ({
                    title:
                      index === breadcrumb.length - 1 ? (
                        <span className="text-text-primary">{item}</span>
                      ) : (
                        <Link to="#" className="text-text-muted hover:text-primary">
                          {item}
                        </Link>
                      ),
                  })),
                ]}
                className="mb-2"
              />
            )}

            {/* 标题 */}
            <h1 className="text-lg font-semibold text-text-primary m-0">{title}</h1>

            {/* 副标题 */}
            {subtitle && (
              <p className="text-sm text-text-muted mt-1 mb-0">{subtitle}</p>
            )}
          </div>

          {/* 操作区 */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </header>

      {/* 模块内容 */}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// 模块区块卡片
interface ModuleSectionCardProps {
  title?: string;
  subtitle?: string;
  extra?: ReactNode;
  children: ReactNode;
  noPadding?: boolean;
}

export function ModuleSectionCard({
  title,
  subtitle,
  extra,
  children,
  noPadding = false,
}: ModuleSectionCardProps) {
  return (
    <section className="section-shell">
      {title && (
        <div className="section-header">
          <div className="flex items-center gap-2">
            <Text className="section-title">{title}</Text>
            {subtitle && (
              <Text className="section-subtitle">{subtitle}</Text>
            )}
          </div>
          {extra && <div>{extra}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "section-body"}>{children}</div>
    </section>
  );
}
