import { SafetyCertificateOutlined } from "@ant-design/icons";

/** 顶栏 / 侧栏统一品牌图形（与 .sider-brand-icon 样式配套） */
export default function AppBrandMark({
  collapsed,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <span
      className={["sider-brand-icon", collapsed ? "sider-brand-icon--collapsed" : "", className].filter(Boolean).join(" ")}
      aria-hidden
    >
      <SafetyCertificateOutlined className="text-[14px] leading-none" />
    </span>
  );
}
