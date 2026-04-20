import { useCallback, useEffect, useRef, useState } from "react";
import type { InputRef } from "antd";
import { Space, Typography, Badge, Avatar, Dropdown, Tag, Input, Tooltip } from "antd";
import { BellOutlined, UserOutlined, SettingOutlined, LogoutOutlined, SearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { getRouteMeta } from "@/config/routeMeta";
import WorkbenchHomeLink from "@/components/WorkbenchHomeLink";

const { Text } = Typography;

function buildHomeSearchQuery(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  const p = new URLSearchParams();
  p.set("q", v);
  p.set("tab", "all");
  return `?${p.toString()}`;
}

export default function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeMeta = getRouteMeta(location.pathname);
  const searchInputRef = useRef<InputRef>(null);
  const [searchDraft, setSearchDraft] = useState("");

  const syncDraftFromUrl = useCallback(() => {
    if (location.pathname !== "/") {
      setSearchDraft("");
      return;
    }
    setSearchDraft(new URLSearchParams(location.search).get("q") ?? "");
  }, [location.pathname, location.search]);

  useEffect(() => {
    syncDraftFromUrl();
  }, [syncDraftFromUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commitWorkbenchSearch = () => {
    const q = buildHomeSearchQuery(searchDraft);
    if (location.pathname !== "/") {
      navigate(q ? `/${q}` : "/");
      return;
    }
    navigate({ pathname: "/", search: q ? q.slice(1) : "" }, { replace: true });
  };

  const userMenuItems = [
    { key: "settings", icon: <SettingOutlined />, label: "系统设置" },
    { key: "help", icon: <QuestionCircleOutlined />, label: "帮助文档" },
    { type: "divider" as const, key: "d1" },
    { key: "logout", icon: <LogoutOutlined />, label: "退出登录" },
  ];

  return (
    <header className="topbar flex items-center justify-between">
      {/* 左侧：Logo + 模块标题 */}
      <div className="flex items-center gap-3 min-w-0">
        <WorkbenchHomeLink className="flex items-center gap-2 shrink-0 text-text-primary hover:text-primary transition-colors no-underline rounded-md px-2 -ml-2 hover:bg-[var(--color-bg-interactive-hover)]">
          <span className="text-xl leading-none" aria-hidden>
            🦐
          </span>
          <Text strong className="!mb-0 text-primary text-sm sm:text-base whitespace-nowrap font-semibold">
            风控 OS
          </Text>
        </WorkbenchHomeLink>

        {routeMeta && (
          <div className="flex items-center gap-2 min-w-0 border-l border-black/[0.08] pl-3">
            <Text className="text-[15px] font-semibold text-text-primary truncate">{routeMeta.title}</Text>
            {routeMeta.subtitle && (
              <Text className="text-[13px] text-text-muted hidden sm:inline truncate">{routeMeta.subtitle}</Text>
            )}
          </div>
        )}

        {/* 环境标签 */}
        <Tag 
          className="text-[10px] ml-1 shrink-0 font-medium px-2 py-0.5 rounded border-0"
          style={{ 
            background: "linear-gradient(135deg, rgba(212, 136, 6, 0.12) 0%, rgba(250, 173, 20, 0.08) 100%)",
            color: "#d48806"
          }}
        >
          UAT
        </Tag>
      </div>

      {/* 右侧：快捷操作 */}
      <div className="flex items-center gap-3">
        {/* 搜索框 */}
        <Tooltip title="搜索任务标题 / ID / 发起人（Enter）；⌘/Ctrl+K 聚焦">
          <Input
            ref={searchInputRef}
            placeholder="搜索任务…"
            prefix={<SearchOutlined className="text-text-muted text-[13px]" />}
            size="small"
            className="w-48"
            style={{ borderRadius: 8 }}
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onPressEnter={commitWorkbenchSearch}
            allowClear
            onClear={() => {
                setSearchDraft("");
                if (location.pathname === "/") {
                  navigate({ pathname: "/", search: "" }, { replace: true });
                }
              }}
          />
        </Tooltip>

        {/* 通知 */}
        <Tooltip title="通知中心">
          <Badge count={3} size="small" offset={[-2, 2]}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.04] transition-colors cursor-pointer">
              <BellOutlined className="text-[15px] text-text-secondary" />
            </div>
          </Badge>
        </Tooltip>

        {/* 用户菜单 */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space size={8} className="cursor-pointer hover:bg-black/[0.04] rounded-lg px-2 py-1 transition-colors">
            <Avatar size={28} icon={<UserOutlined />} style={{ backgroundColor: "#3b6b7d" }} />
            <Text className="text-[13px] text-text-secondary font-medium">张三</Text>
          </Space>
        </Dropdown>
      </div>
    </header>
  );
}
