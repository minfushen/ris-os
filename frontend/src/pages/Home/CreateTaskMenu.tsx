import { Dropdown, Button } from "antd";
import {
  PlusOutlined,
  LineChartOutlined,
  ExperimentOutlined,
  ControlOutlined,
  AuditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { TaskType } from "@/types";

interface CreateTaskMenuProps {
  onSelect: (type: TaskType) => void;
}

const TASK_TYPE_ITEMS = [
  {
    key: "analysis",
    icon: <LineChartOutlined />,
    label: "归因分析",
    description: "指标异动归因分析",
  },
  {
    key: "backtest",
    icon: <ExperimentOutlined />,
    label: "离线回测",
    description: "策略仿真回测实验",
  },
  {
    key: "strategy",
    icon: <ControlOutlined />,
    label: "策略发布申请",
    description: "策略变更审批流程",
  },
  {
    key: "inspection",
    icon: <AuditOutlined />,
    label: "抽检样本",
    description: "专家质检抽检任务",
  },
  {
    key: "fraud",
    icon: <SearchOutlined />,
    label: "欺诈排查",
    description: "团伙欺诈关联排查",
  },
];

export default function CreateTaskMenu({ onSelect }: CreateTaskMenuProps) {
  const menuItems = TASK_TYPE_ITEMS.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: (
      <div>
        <div style={{ fontWeight: 500, fontSize: 13 }}>{item.label}</div>
        <div style={{ fontSize: 13, color: "#8c8c8c" }}>{item.description}</div>
      </div>
    ),
  }));

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: ({ key }) => onSelect(key as TaskType),
      }}
      placement="bottomRight"
      trigger={["click"]}
    >
      <Button type="primary" icon={<PlusOutlined />}>
        发起工作项
      </Button>
    </Dropdown>
  );
}
