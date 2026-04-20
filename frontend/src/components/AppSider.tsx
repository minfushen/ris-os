import { useState } from "react";
import { Typography, Badge } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  DashboardOutlined,
  ControlOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  BookOutlined,
  PartitionOutlined,
  FundOutlined,
  AlertOutlined,
  CustomerServiceOutlined,
  AuditOutlined,
  FileTextOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const { Text } = Typography;

interface NavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: NavItem[];
  badge?: number | string;
}

/** 贷后场景（scenario/post-loan）侧栏：与产品导航改造稿对齐 */
const PRIMARY_NAV: NavItem[] = [
  {
    key: "home",
    label: "首页·贷后资产总览",
    icon: <HomeOutlined />,
    path: "/",
  },
  {
    key: "monitor",
    label: "资产监控",
    icon: <DashboardOutlined />,
    children: [
      { key: "asset-quality", label: "资产质量看板", icon: <FundOutlined />, path: "/monitor/asset-quality" },
      { key: "dashboard", label: "预警探照灯", icon: <AlertOutlined />, path: "/monitor/dashboard" },
      { key: "o2o", label: "策略效果追踪", icon: <DashboardOutlined />, path: "/monitor/o2o", badge: 2 },
      { key: "labeling", label: "标注飞轮", icon: <TagsOutlined />, path: "/monitor/labeling" },
      { key: "reports", label: "报表中心", icon: <FileTextOutlined />, path: "/monitor/reports" },
    ],
  },
  {
    key: "strategy",
    label: "预警策略",
    icon: <ControlOutlined />,
    children: [
      { key: "products", label: "产品线策略集", icon: <ControlOutlined />, path: "/strategy/products" },
      { key: "rules", label: "预警规则配置", icon: <ControlOutlined />, path: "/strategy/rules" },
      { key: "backtest", label: "规则仿真回测", icon: <ControlOutlined />, path: "/strategy/backtest" },
      { key: "publish", label: "策略发布审批", icon: <ControlOutlined />, path: "/strategy/publish" },
    ],
  },
  {
    key: "risk",
    label: "案件处置",
    icon: <SafetyOutlined />,
    children: [
      { key: "workbench", label: "预警核查工作台", icon: <SafetyOutlined />, path: "/risk/workbench" },
      { key: "collection", label: "催收作业管理", icon: <CustomerServiceOutlined />, path: "/risk/collection" },
      { key: "inspection", label: "复盘与质检", icon: <AuditOutlined />, path: "/risk/inspection" },
    ],
  },
  {
    key: "knowledge",
    label: "知识沉淀",
    icon: <BookOutlined />,
    children: [
      { key: "knowledge-home", label: "知识总览", icon: <BookOutlined />, path: "/knowledge" },
      { key: "scripts", label: "催收话术库", icon: <BookOutlined />, path: "/knowledge/scripts" },
      { key: "rule-cases", label: "规则调优案例", icon: <FileTextOutlined />, path: "/knowledge/rule-cases" },
      { key: "fraud-patterns", label: "风险模式库", icon: <SafetyOutlined />, path: "/knowledge/fraud-patterns" },
    ],
  },
  {
    key: "feature-data",
    label: "特征与数据",
    icon: <PartitionOutlined />,
    children: [
      { key: "studio", label: "贷后特征工作室", icon: <PartitionOutlined />, path: "/feature/studio" },
      { key: "dictionary", label: "数据源管理", icon: <DatabaseOutlined />, path: "/data/dictionary" },
    ],
  },
];

function getParentKey(path: string): string | null {
  for (const item of PRIMARY_NAV) {
    if (item.children) {
      for (const child of item.children) {
        if (child.path === path) {
          return item.key;
        }
      }
    }
  }
  return null;
}

export default function AppSider() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    const parentKey = getParentKey(location.pathname);
    return parentKey ? [parentKey] : [];
  });

  const currentPath = location.pathname;

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleNavClick = (path: string | undefined) => {
    if (path) {
      navigate(path);
    }
  };

  const isActive = (item: NavItem): boolean => {
    if (item.path === currentPath) return true;
    if (item.children) {
      return item.children.some((child) => child.path === currentPath);
    }
    return false;
  };

  const isChildActive = (child: NavItem): boolean => {
    return child.path === currentPath;
  };

  return (
    <aside
      className={`glass-panel-strong flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-52"
      }`}
      style={{ minHeight: "calc(100vh - var(--header-height, 44px))" }}
    >
      <div className="flex flex-col items-center justify-center min-h-[3rem] border-b border-border-soft px-1 py-1.5">
        <Text strong className="text-primary text-base leading-tight">
          {collapsed ? "🦐" : "🦐 风控 OS"}
        </Text>
        {!collapsed && (
          <Text type="secondary" className="text-[11px] leading-tight mt-0.5">
            贷后指挥台
          </Text>
        )}
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {PRIMARY_NAV.map((item) => (
          <div key={item.key}>
            {item.children ? (
              <div
                className={`sider-nav-item ${isActive(item) ? "text-primary-deep" : ""}`}
                onClick={() => toggleGroup(item.key)}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm">{item.label}</span>
                    <span className="text-xs text-text-weak">{expandedGroups.includes(item.key) ? "▼" : "▶"}</span>
                  </>
                )}
              </div>
            ) : (
              <div
                className={`sider-nav-item ${isActive(item) ? "sider-nav-item-active" : ""}`}
                onClick={() => handleNavClick(item.path)}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.badge ? <Badge count={item.badge} size="small" /> : null}
                  </>
                )}
              </div>
            )}

            {item.children && expandedGroups.includes(item.key) && !collapsed && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children.map((child) => (
                  <div
                    key={child.key}
                    className={`sider-nav-item py-2 ${isChildActive(child) ? "sider-nav-item-active" : ""}`}
                    onClick={() => handleNavClick(child.path)}
                  >
                    <span className="text-base">{child.icon ?? <span className="inline-block w-3.5" />}</span>
                    <span className="flex-1 text-xs">{child.label}</span>
                    {child.badge ? <Badge count={child.badge} size="small" /> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div
        className="flex items-center justify-center h-10 border-t border-border-soft cursor-pointer hover:bg-[var(--color-bg-interactive-hover)] transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <MenuUnfoldOutlined className="text-text-secondary" />
        ) : (
          <MenuFoldOutlined className="text-text-secondary" />
        )}
      </div>
    </aside>
  );
}
