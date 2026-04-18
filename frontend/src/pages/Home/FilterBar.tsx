import { useEffect, useState } from "react";
import { Select, Input, Button, Typography } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import type { TaskType, TaskStatus, ScenarioNode } from "@/types";

const { Text } = Typography;

export interface FilterState {
  scenario?: ScenarioNode;
  status?: TaskStatus;
  taskType?: TaskType;
  keyword?: string;
  dateRange?: [string, string];
}

interface FilterBarProps {
  /** source: user=点击查询（可写 URL）；remote=外部 seed 同步（不写 URL） */
  onFilter: (filters: FilterState, source?: "user" | "remote") => void;
  onReset: () => void;
  /** 总览卡片等外部注入：变更 version 时同步筛选项并触发查询 */
  remoteSeed?: Partial<FilterState> | null;
  remoteSeedVersion?: number;
}

const SCENARIO_OPTIONS = [
  { value: "credit", label: "授信" },
  { value: "draw", label: "支用" },
  { value: "post_loan", label: "贷后" },
  { value: "general", label: "综合/其他" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "待处理" },
  { value: "processing", label: "处理中" },
  { value: "reviewing", label: "待复核" },
  { value: "completed", label: "已完成" },
  { value: "failed", label: "已失败" },
];

const TYPE_OPTIONS = [
  { value: "analysis", label: "归因分析" },
  { value: "backtest", label: "仿真回测" },
  { value: "strategy", label: "策略发布" },
  { value: "inspection", label: "专家抽检" },
  { value: "fraud", label: "欺诈排查" },
  { value: "review", label: "信审任务" },
];

export default function FilterBar({
  onFilter,
  onReset,
  remoteSeed,
  remoteSeedVersion = 0,
}: FilterBarProps) {
  const [scenario, setScenario] = useState<ScenarioNode | undefined>();
  const [status, setStatus] = useState<TaskStatus | undefined>();
  const [taskType, setTaskType] = useState<TaskType | undefined>();
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (remoteSeedVersion === 0) return;
    const s = remoteSeed ?? {};
    setScenario(s.scenario);
    setStatus(s.status);
    setTaskType(s.taskType);
    setKeyword(s.keyword ?? "");
    onFilter(
      {
        scenario: s.scenario,
        status: s.status,
        taskType: s.taskType,
        keyword: s.keyword ?? "",
      },
      "remote"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅响应外部 seed 版本
  }, [remoteSeedVersion]);

  const handleSearch = () => {
    onFilter({ scenario, status, taskType, keyword }, "user");
  };

  const handleReset = () => {
    setScenario(undefined);
    setStatus(undefined);
    setTaskType(undefined);
    setKeyword("");
    onReset();
  };

  return (
    <div className="layout-bar-tight">
      <Text className="text-[12px] text-text-muted">筛选</Text>

      <Select
        placeholder="场景"
        value={scenario}
        onChange={setScenario}
        options={SCENARIO_OPTIONS}
        allowClear
        size="small"
        style={{ width: 80 }}
      />

      <Select
        placeholder="状态"
        value={status}
        onChange={setStatus}
        options={STATUS_OPTIONS}
        allowClear
        size="small"
        style={{ width: 90 }}
      />

      <Select
        placeholder="类型"
        value={taskType}
        onChange={setTaskType}
        options={TYPE_OPTIONS}
        allowClear
        size="small"
        style={{ width: 100 }}
      />

      <Input
        placeholder="关键词"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        size="small"
        style={{ width: 120 }}
        allowClear
      />

      <div className="layout-flex-center layout-gap-xs">
        <Button size="small" icon={<ReloadOutlined />} onClick={handleReset}>
          重置
        </Button>
        <Button
          size="small"
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleSearch}
        >
          查询
        </Button>
      </div>
    </div>
  );
}
