import { useState } from "react";
import { Typography, Badge } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  DashboardOutlined,
  ControlOutlined,
  SafetyOutlined,
  LineChartOutlined,
  DatabaseOutlined,
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

const PRIMARY_NAV: NavItem[] = [
  {
    key: "workbench",
    label: "工作台",
    icon: <HomeOutlined />,
    path: "/",
  },
  {
    key: "monitor",
    label: "监控与分析",
    icon: <DashboardOutlined />,
    children: [
      { key: "dashboard", label: "战情看板", path: "/monitor/dashboard" },
      { key: "o2o", label: "O2O一致性", path: "/monitor/o2o", badge: 2 },
      { key: "labeling", label: "标注飞轮", path: "/monitor/labeling" },
      { key: "reports", label: "报表中心", path: "/monitor/reports" },
    ],
  },
  {
    key: "strategy",
    label: "策略管控",
    icon: <ControlOutlined />,
    children: [
      { key: "list", label: "策略集管理", path: "/strategy/list" },
      { key: "rules", label: "规则引擎", path: "/strategy/rules" },
      { key: "backtest", label: "仿真回测", path: "/strategy/backtest" },
      { key: "publish", label: "策略发布", path: "/strategy/publish" },
    ],
  },
  {
    key: "risk",
    label: "风险核查",
    icon: <SafetyOutlined />,
    children: [
      { key: "fraud", label: "团伙欺诈", path: "/risk/fraud" },
      { key: "inspection", label: "专家抽检", path: "/risk/inspection" },
    ],
  },
  {
    key: "feature",
    label: "特征工程",
    icon: <LineChartOutlined />,
    path: "/feature/studio",
  },
  {
    key: "data",
    label: "数据资产",
    icon: <DatabaseOutlined />,
    path: "/data/dictionary",
  },
];

// 获取父级 key
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
    setExpandedGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
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
      {/* Logo */}
      <div className="flex items-center justify-center h-12 border-b border-border-soft">
        <Text strong className="text-primary text-base">
          {collapsed ? "🦐" : "🦐 风控 OS"}
        </Text>
      </div>

      {/* 导航列表 */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {PRIMARY_NAV.map((item) => (
          <div key={item.key}>
            {/* 一级导航项 */}
            {item.children ? (
              // 有子菜单：点击展开/收起
              <div
                className={`sider-nav-item ${isActive(item) ? "text-primary-deep" : ""}`}
                onClick={() => toggleGroup(item.key)}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm">{item.label}</span>
                    <span className="text-xs text-text-weak">
                      {expandedGroups.includes(item.key) ? "▼" : "▶"}
                    </span>
                  </>
                )}
              </div>
            ) : (
              // 无子菜单：直接导航
              <div
                className={`sider-nav-item ${isActive(item) ? "sider-nav-item-active" : ""}`}
                onClick={() => handleNavClick(item.path)}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm">{item.label}</span>
                    {item.badge && (
                      <Badge count={item.badge} size="small" />
                    )}
                  </>
                )}
              </div>
            )}

            {/* 子菜单 */}
            {item.children && expandedGroups.includes(item.key) && !collapsed && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children.map((child) => (
                  <div
                    key={child.key}
                    className={`sider-nav-item py-2 ${
                      isChildActive(child)
                        ? "sider-nav-item-active"
                        : ""
                    }`}
                    onClick={() => handleNavClick(child.path)}
                  >
                    <span className="text-base">{child.icon}</span>
                    <span className="flex-1 text-xs">{child.label}</span>
                    {child.badge && (
                      <Badge count={child.badge} size="small" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* 折叠按钮 */}
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
