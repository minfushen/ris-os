import { useState } from "react";
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

export default function AppSider() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

  const currentPath = location.pathname;

  const isLeafActive = (child: NavItem) => {
    const hashEntryIsActive = PRIMARY_NAV.some(
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
      {child.badge != null ? <Badge count={child.badge} size="small" className="sider-nav-badge shrink-0" /> : null}
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
        {PRIMARY_NAV.map((item) => (
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
                {item.badge != null ? (
                  <Badge count={item.badge} size="small" className="sider-nav-badge">
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
