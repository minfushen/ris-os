import type { TaskStatus, TaskType } from "@/types";

/**
 * 返回任务状态对应的中文文案。
 * Property 7: 状态文案映射覆盖所有合法组合
 */
export function getStatusText(taskType: TaskType, status: TaskStatus): string {
  if (taskType === "analysis") {
    switch (status) {
      case "created":
      case "accepted":
        return "分析硅基员工已接到任务";
      case "running":
        return "正在按维度拆解数据…";
      case "waiting_user":
        return "需要确认是否继续深挖…";
      case "completed":
        return "分析结果已生成";
      case "failed":
        return "分析执行失败";
      default:
        return "分析任务处理中";
    }
  }

  // review
  switch (status) {
    case "created":
    case "accepted":
      return "信审硅基员工已接到任务";
    case "running":
      return "正在整理资料并识别疑点…";
    case "waiting_user":
      return "需要补充说明或资料…";
    case "completed":
      return "审核辅助结果已生成";
    case "failed":
      return "资料处理失败";
    default:
      return "任务处理中";
  }
}
