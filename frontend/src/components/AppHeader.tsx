import { Space, Typography, Badge, Avatar, Dropdown, Tag, Input, Tooltip } from "antd";
import { BellOutlined, UserOutlined, SettingOutlined, LogoutOutlined, SearchOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { getRouteMeta } from "@/config/routeMeta";
import WorkbenchHomeLink from "@/components/WorkbenchHomeLink";

const { Text } = Typography;

export default function AppHeader() {
  const location = useLocation();
  const routeMeta = getRouteMeta(location.pathname);

  const userMenuItems = [
    { key: "settings", icon: <SettingOutlined />, label: "系统设置" },
    { key: "help", icon: <QuestionCircleOutlined />, label: "帮助文档" },
    { type: "divider" as const, key: "d1" },
    { key: "logout", icon: <LogoutOutlined />, label: "退出登录" },
  ];

  return (
    <header className="topbar flex items-center justify-between">
      {/* 左侧：Logo（回工作台，携带上次筛选 query）+ 模块标题 */}
      <div className="flex items-center gap-3 min-w-0">
        <WorkbenchHomeLink className="flex items-center gap-2 shrink-0 text-text-primary hover:text-primary transition-colors no-underline rounded-md px-1 -ml-1 hover:bg-glass/40">
          <span className="text-xl leading-none" aria-hidden>
            🦐
          </span>
          <Text strong className="!mb-0 text-primary text-sm sm:text-base whitespace-nowrap">
            风控 OS
          </Text>
        </WorkbenchHomeLink>

        {routeMeta && (
          <div className="flex items-center gap-2 min-w-0 border-l border-border-soft pl-3">
            <Text className="text-base font-medium text-text-primary truncate">{routeMeta.title}</Text>
            {routeMeta.subtitle && (
              <Text className="text-sm text-text-muted hidden sm:inline truncate">{routeMeta.subtitle}</Text>
            )}
          </div>
        )}

        {/* 环境标签 */}
        <Tag className="glass-tag-warning text-xs ml-1 shrink-0">UAT</Tag>
      </div>

      {/* 右侧：快捷操作 */}
      <div className="flex items-center gap-4">
        {/* 全局搜索 */}
        <Tooltip title="全局搜索 (Ctrl+K)">
          <Input
            placeholder="搜索..."
            prefix={<SearchOutlined className="text-text-muted" />}
            size="small"
            className="glass-input w-44"
          />
        </Tooltip>

        {/* 通知 */}
        <Tooltip title="通知中心">
          <Badge count={3} size="small">
            <BellOutlined className="text-base cursor-pointer text-text-secondary hover:text-text-primary transition-colors" />
          </Badge>
        </Tooltip>

        {/* 用户菜单 */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space size={6} className="cursor-pointer">
            <Avatar size={24} icon={<UserOutlined />} className="bg-primary" />
            <Text className="text-xs text-text-secondary">张三</Text>
          </Space>
        </Dropdown>
      </div>
    </header>
  );
}
