import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { readWorkbenchReturnQs } from "@/utils/workbenchUrl";

/**
 * 回到工作台首页并恢复上次工作项筛选（sessionStorage 中的 query）。
 */
export default function WorkbenchHomeLink({
  children,
  className,
  "aria-label": ariaLabel = "返回工作台首页",
}: {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const qs = readWorkbenchReturnQs();
  const search = qs.startsWith("?") ? qs.slice(1) : qs;
  return (
    <Link
      to={{ pathname: "/", search: search || undefined }}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  );
}
