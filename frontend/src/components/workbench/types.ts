/** 预警核查工作台队列行（演示数据结构） */
export interface WorkbenchQueueRow {
  id: string;
  customer: string;
  productLine: string;
  riskLevel: "high" | "medium" | "low";
  hitRule: string;
  sla: string;
  balanceWan: number;
}
