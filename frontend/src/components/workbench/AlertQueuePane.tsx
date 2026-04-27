import { Typography, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { WorkbenchQueueRow } from "./types";

const { Text } = Typography;

interface AlertQueuePaneProps<T extends WorkbenchQueueRow> {
  title: string;
  hint?: string;
  columns: ColumnsType<T>;
  dataSource: T[];
  selectedRowKey: string | null;
  onRowClick: (row: T) => void;
}

export default function AlertQueuePane<T extends WorkbenchQueueRow>({
  title,
  hint,
  columns,
  dataSource,
  selectedRowKey,
  onRowClick,
}: AlertQueuePaneProps<T>) {
  return (
    <aside className="workbench-pane workbench-pane--queue">
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
      <div className="p-2 overflow-x-hidden">
        <Table<T>
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={dataSource}
          columns={columns}
          tableLayout="fixed"
          onRow={(record) => ({
            onClick: (e) => {
              if ((e.target as HTMLElement).closest("[data-workbench-queue-stop-row]")) return;
              onRowClick(record);
            },
            style: {
              cursor: "pointer",
              background: selectedRowKey === record.id ? "var(--color-queue-row-selected-bg)" : undefined,
            },
          })}
        />
      </div>
    </aside>
  );
}
