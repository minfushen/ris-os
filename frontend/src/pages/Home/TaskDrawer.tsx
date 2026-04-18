import { Drawer, Button, Space, Typography, App, Alert } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useState } from "react";
import type { TaskType, TaskResponse } from "@/types";
import AnalysisForm from "./AnalysisForm";
import ReviewForm from "./ReviewForm";
import BacktestForm from "./BacktestForm";
import StrategyForm from "./StrategyForm";
import InspectionForm from "./InspectionForm";

const { Text } = Typography;

interface TaskDrawerProps {
  open: boolean;
  taskType: TaskType | null;
  onClose: () => void;
  onSubmit: (type: TaskType, values: unknown) => Promise<TaskResponse>;
  /** 任务写入成功后的回调（用于列表置顶高亮，P1 S4） */
  onCreated?: (taskId: string) => void;
}

const DRAWER_TITLES: Record<TaskType, string> = {
  analysis: "新建归因分析任务",
  backtest: "发起离线回测",
  strategy: "创建策略发布申请",
  inspection: "创建抽检任务",
  fraud: "发起欺诈排查",
  review: "新建信审任务",
};

export default function TaskDrawer({
  open,
  taskType,
  onClose,
  onSubmit,
  onCreated,
}: TaskDrawerProps) {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (values: unknown) => {
    if (!taskType) return;

    setLoading(true);
    try {
      const res = await onSubmit(taskType, values);
      onCreated?.(res.task_id);
      void message.success("任务创建成功");
      handleClose();
    } catch (err) {
      void message.error(err instanceof Error ? err.message : "创建失败");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormKey((k) => k + 1);
    onClose();
  };

  if (!taskType) return null;

  const renderForm = () => {
    switch (taskType) {
      case "analysis":
        return <AnalysisForm key={`analysis-${formKey}`} onSubmit={handleSubmit} onCancel={handleClose} />;
      case "review":
        return <ReviewForm key={`review-${formKey}`} onSubmit={handleSubmit} onCancel={handleClose} />;
      case "backtest":
        return <BacktestForm key={`backtest-${formKey}`} onSubmit={handleSubmit} onCancel={handleClose} />;
      case "strategy":
        return <StrategyForm key={`strategy-${formKey}`} onSubmit={handleSubmit} onCancel={handleClose} />;
      case "inspection":
        return <InspectionForm key={`inspection-${formKey}`} onSubmit={handleSubmit} onCancel={handleClose} />;
      case "fraud":
        return (
          <div style={{ padding: 24, textAlign: "center" }}>
            <Text type="secondary">欺诈排查功能开发中...</Text>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Drawer
      title={
        <Text strong style={{ fontSize: 14 }}>
          {DRAWER_TITLES[taskType]}
        </Text>
      }
      placement="right"
      width={480}
      open={open}
      onClose={handleClose}
      closable={false}
      extra={
        <Button type="text" icon={<CloseOutlined />} onClick={handleClose} />
      }
      footer={
        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
          <Button onClick={handleClose}>取消</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              const form = document.querySelector("form");
              if (form) form.requestSubmit();
            }}
          >
            提交
          </Button>
        </Space>
      }
      styles={{
        body: { padding: 16 },
        footer: { padding: "12px 16px", borderTop: "1px solid #f0f0f0" },
      }}
    >
      <Alert
        type="info"
        showIcon
        className="mb-3 text-xs"
        message="单条闭环（演示说明）"
        description="创建后请在「工作项」中认领 → 处理 → 提交结论；涉及策略发布或抽检时将进入复核环节。"
      />
      {renderForm()}
    </Drawer>
  );
}
