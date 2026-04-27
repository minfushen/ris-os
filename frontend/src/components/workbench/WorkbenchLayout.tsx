import type { ReactNode } from "react";

/** 标准双栏工作台外框：间距与最小高度由 token / semantic-pages.css 控制 */
export function WorkbenchLayout({ children }: { children: ReactNode }) {
  return <div className="workbench-layout">{children}</div>;
}
