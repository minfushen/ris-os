import { useEffect, useMemo, useState } from "react";
import { Badge } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import AppBrandMark from "@/components/AppBrandMark";
import { PLATFORM_NAME } from "@/config/brand";
import { getSiderDutySubtitle } from "@/config/demoSession";
import { PRIMARY_NAV, type NavItem } from "@/config/navigation";
import { useDemoRoleStore, type DemoRole } from "@/store/demoRoleStore";
import { api } from "@/api/client";

function toPathname(path?: string): string | undefined {
  return path?.split(/[?#]/)[0];
}

function pathInGroup(item: NavItem, pathname: string): boolean {
  if (item.children?.some((c) => toPathname(c.path) === pathname)) return true;
  if (item.moreChildren?.some((c) => toPathname(c.path) === pathname)) return true;
  return false;
}

function isSameNavTarget(path: string | undefined, location: ReturnType<typeof useLocation>) {
  if (!path) return false;
  const currentPath = location.pathname;
  const currentWithHash = `${location.pathname}${location.hash}`;
  const currentWithQuery = `${location.pathname}${location.search}`;
  const currentFull = `${location.pathname}${location.search}${location.hash}`;

  if (path.includes("?")) {
    return path === currentWithQuery || path === currentFull;
  }
  if (path.includes("#")) {
    return path === currentWithHash || path === currentFull;
  }
  return toPathname(path) === currentPath;
}

const ROLE_NAV_KEYS: Record<DemoRole, Set<string>> = {
  relationship_manager: new Set([
    "home",
    "monitor-dashboard", "monitor-watchlist-upload", "monitor-asset-quality",
    "monitor-o2o", "monitor-labeling", "monitor-reports",
    "risk-workbench", "risk-collection", "knowledge-scripts", "risk-inspection",
    "knowledge-fraud-patterns",
    "demo", "architecture-integration", "architecture-data-flow",
    "architecture-closed-loop", "architecture-p2-boundary",
  ]),
  risk_modeler: new Set([
    "home",
    "feature-studio", "data-dictionary", "knowledge-home",
    "strategy-model-factory", "strategy-model-registry",
    "strategy-decision-flow", "strategy-backtest",
    "demo", "architecture-integration", "architecture-data-flow",
    "architecture-closed-loop", "architecture-p2-boundary",
  ]),
  strategy_approver: new Set([
    "home",
    "strategy-backtest", "strategy-publish", "strategy-products",
    "strategy-rules", "knowledge-rule-cases",
    "demo", "architecture-integration", "architecture-data-flow",
    "architecture-closed-loop", "architecture-p2-boundary",
  ]),
};

function filterNavByRole(nav: NavItem[], allowedKeys: Set<string>): NavItem[] {
  return nav
    .map((item) => {
      if (item.children || item.moreChildren) {
        const filteredChildren = (item.children ?? []).filter((c) => allowedKeys.has(c.key));
        const filteredMore = (item.moreChildren ?? []).filter((c) => allowedKeys.has(c.key));
        if (filteredChildren.length === 0 && filteredMore.length === 0) return null;
        return {
          ...item,
          children: filteredChildren,
          moreChildren: filteredMore.length > 0 ? filteredMore : undefined,
        };
      }
      return allowedKeys.has(item.key) ? item : null;
    })
    .filter((item): item is NavItem => item !== null);
}

export default function AppSider() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [dynamicBadges, setDynamicBadges] = useState<Record<string, number>>({});
  const { role } = useDemoRoleStore();

  const currentPath = location.pathname;

  const navByRole = useMemo(
    () => filterNavByRole(PRIMARY_NAV, ROLE_NAV_KEYS[role]),
    [role],
  );

  const isLeafActive = (child: NavItem) => {
    const hashEntryIsActive = navByRole.some(
      (item) =>
        item.children?.some((c) => isSameNavTarget(c.path, location) && c.path?.includes("#")) ||
        item.moreChildren?.some((c) => isSameNavTarget(c.path, location) && c.path?.includes("#")),
    );
    if (hashEntryIsActive && child.path === currentPath && !child.path.includes("#")) {
      return false;
    }
    return isSameNavTarget(child.path, location);
  };

  const handleNavClick = (path: string | undefined) => {
    if (path) {
      navigate(path);
    }
  };

  const isActive = (item: NavItem): boolean => {
    if (isSameNavTarget(item.path, location)) return true;
    if (item.children || item.moreChildren) {
      return pathInGroup(item, currentPath);
    }
    return false;
  };

  const isGroupOpen = (item: NavItem) => isActive(item) || !collapsedGroups.includes(item.key);

  useEffect(() => {
    let mounted = true;
    const loadBadgeStats = async () => {
      try {
        const stats = await api.getDashboardStats();
        if (!mounted) return;
        setDynamicBadges({
          home: stats.high_risk_enterprises || 0,
          "monitor-dashboard": stats.pending_alerts || 0,
          "risk-workbench": (stats.critical_alerts || 0) + (stats.high_alerts || 0),
        });
      } catch {
        // 侧栏角标不阻断页面渲染，失败时保持配置默认值
      }
    };
    void loadBadgeStats();
    return () => {
      mounted = false;
    };
  }, []);

  const resolveBadge = (item: NavItem): number | string | undefined => {
    const dynamic = dynamicBadges[item.key];
    return dynamic !== undefined ? dynamic : item.badge;
  };

  const toggleGroup = (item: NavItem) => {
    if (isActive(item)) return;
    setCollapsedGroups((prev) =>
      prev.includes(item.key) ? prev.filter((key) => key !== item.key) : [...prev, item.key],
    );
  };

  const renderLeaf = (child: NavItem) => (
    <div
      key={child.key}
      className={`sider-nav-item sider-nav-item--l2 ${isLeafActive(child) ? "sider-nav-item-active" : ""}`}
      onClick={() => handleNavClick(child.path)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNavClick(child.path);
        }
      }}
      role="button"
      tabIndex={0}
      aria-current={isLeafActive(child) ? "page" : undefined}
    >
      <span className="sider-nav-item__icon inline-flex">{child.icon ?? <span className="inline-block w-3.5" />}</span>
      <span className="sider-nav-item__text truncate">{child.label}</span>
      {resolveBadge(child) != null ? (
        <Badge count={resolveBadge(child)} size="small" className="sider-nav-badge shrink-0" />
      ) : null}
    </div>
  );

  const renderGroup = (item: NavItem) => {
    const groupOpen = isGroupOpen(item);
    const groupPanelId = `sider-group-${item.key}`;

    return (
      <>
        <div
          className={`sider-nav-item sider-nav-item--l1 ${isActive(item) ? "sider-nav-item--group-active" : ""} ${
            groupOpen ? "sider-nav-item--group-open" : ""
          }`}
          onClick={() => toggleGroup(item)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleGroup(item);
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={groupOpen}
          aria-controls={groupPanelId}
          aria-disabled={isActive(item) ? true : undefined}
          title={isActive(item) ? "当前页面所在分组保持展开" : undefined}
        >
          <span className="sider-nav-item__icon inline-flex">{item.icon}</span>
          {!collapsed ? (
            <>
              <span className="sider-nav-group-title truncate">{item.label}</span>
              <span
                className="sider-nav-item__chevron"
                style={{
                  transform: groupOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
                aria-hidden
              >
                ▶
              </span>
            </>
          ) : null}
        </div>

        {(item.children || item.moreChildren) && !collapsed && groupOpen ? (
          <div id={groupPanelId} className="sider-nav-children" role="group" aria-label={`${item.label}导航`}>
            {item.children?.map(renderLeaf)}
            {item.moreChildren?.map(renderLeaf)}
          </div>
        ) : null}
      </>
    );
  };

  return (
    <aside
      className={`glass-panel-strong flex flex-col shrink-0 transition-all duration-300 ${
        collapsed ? "w-[var(--sider-collapsed-width)]" : "w-[var(--sider-width)]"
      }`}
      style={{ minHeight: "calc(100vh - var(--header-height))" }}
      aria-label="主导航"
    >
      <div className="sider-brand">
        {!collapsed ? (
          <div className="flex items-start gap-2">
            <AppBrandMark className="shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="sider-brand__title">{PLATFORM_NAME}</span>
              <span className="sider-brand__subtitle">{getSiderDutySubtitle()}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1.5">
            <AppBrandMark collapsed />
          </div>
        )}
      </div>

      <nav className="sider-nav flex-1 overflow-y-auto">
        {navByRole.map((item) => (
          <div key={item.key}>
            {item.children || item.moreChildren ? (
              renderGroup(item)
            ) : (
              <div
                className={`sider-nav-item sider-nav-item--l1 ${isActive(item) ? "sider-nav-item-active" : ""}`}
                onClick={() => handleNavClick(item.path)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNavClick(item.path);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-current={isActive(item) ? "page" : undefined}
              >
                {resolveBadge(item) != null ? (
                  <Badge count={resolveBadge(item)} size="small" className="sider-nav-badge">
                    <span className="sider-nav-item__icon inline-flex">{item.icon}</span>
                  </Badge>
                ) : (
                  <span className="sider-nav-item__icon inline-flex">{item.icon}</span>
                )}
                {!collapsed ? <span className="sider-nav-item__text">{item.label}</span> : null}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div
        className="sider-collapse-trigger shrink-0"
        onClick={() => setCollapsed(!collapsed)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setCollapsed((c) => !c);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>
    </aside>
  );
}
