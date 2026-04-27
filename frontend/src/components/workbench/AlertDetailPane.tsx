import type { ReactNode } from "react";
import { Typography } from "antd";

const { Text } = Typography;

interface AlertDetailPaneProps {
  title: string;
  hint?: string;
  /** 未选中时展示 */
  emptyText: string;
  /** 中间可滚动区 */
  children: ReactNode;
  /** 结论区正上方（如知识闭环），不参与主区滚动 */
  preFooter?: ReactNode | null;
  /** 底部结论区；无选中时传 null */
  footer: ReactNode | null;
  hasSelection: boolean;
}

/** 右侧客户快照：上滚动区 → 固定 preFooter → 底结论区（设计稿顺序） */
export default function AlertDetailPane({
  title,
  hint,
  emptyText,
  children,
  preFooter,
  footer,
  hasSelection,
}: AlertDetailPaneProps) {
  return (
    <section className="workbench-pane workbench-pane--detail">
      <div className="workbench-pane__head">
        <Text strong className="text-[14px] font-medium text-text-primary">
          {title}
        </Text>
        {hint ? (
          <Text type="secondary" className="block text-[11px] mt-0.5">
            {hint}
          </Text>
        ) : null}
      </div>

      <div className="workbench-pane__scroll space-y-3">
        {hasSelection ? children : <Text type="secondary" className="text-[13px]">{emptyText}</Text>}
      </div>

      {hasSelection && preFooter ? <div className="workbench-pane__prefoot">{preFooter}</div> : null}

      {hasSelection && footer ? <div className="workbench-pane__foot">{footer}</div> : null}
    </section>
  );
}
