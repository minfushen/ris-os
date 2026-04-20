import {
  Form,
  Select,
  Input,
  DatePicker,
  Checkbox,
  Typography,
  Divider,
} from "antd";
import type { ScenarioNode } from "@/types";

const { TextArea } = Input;
const { Text } = Typography;
const { RangePicker } = DatePicker;

interface AnalysisFormProps {
  onSubmit: (values: AnalysisFormValues) => void;
  onCancel: () => void;
}

export interface AnalysisFormValues {
  analysisType: "metric_change" | "anomaly" | "comparison";
  targetMetric: string;
  scenario: ScenarioNode;
  timeRange: [string, string];
  dimensions: string[];
  comparisonBaseline: "prev_period" | "prev_year" | "custom";
  description: string;
}

const ANALYSIS_TYPES = [
  { value: "metric_change", label: "指标异动分析" },
  { value: "anomaly", label: "异常检测分析" },
  { value: "comparison", label: "对比分析" },
];

const TARGET_METRICS = [
  { value: "approval_rate", label: "通过率" },
  { value: "reject_rate", label: "拒绝率" },
  { value: "conversion_rate", label: "转化率" },
  { value: "overdue_rate", label: "逾期率" },
  { value: "avg_amount", label: "平均金额" },
];

const DIMENSIONS = [
  { label: "渠道", value: "channel" },
  { label: "产品", value: "product" },
  { label: "客群", value: "segment" },
  { label: "地区", value: "region" },
  { label: "时段", value: "time_period" },
];

const BASELINE_OPTIONS = [
  { value: "prev_period", label: "上一周期" },
  { value: "prev_year", label: "去年同期" },
  { value: "custom", label: "自定义基准" },
];

export default function AnalysisForm({ onSubmit }: AnalysisFormProps) {
  const [form] = Form.useForm<AnalysisFormValues>();

  const handleSubmit = async (values: AnalysisFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        analysisType: "metric_change",
        scenario: "post_loan",
        comparisonBaseline: "prev_period",
        dimensions: ["channel"],
      }}
      size="small"
    >
      <Text strong className="text-[13px]">
        分析配置
      </Text>
      <Divider rootClassName="layout-divider-y-sm" />

      <Form.Item
        name="analysisType"
        label="分析类型"
        rules={[{ required: true, message: "请选择分析类型" }]}
      >
        <Select options={ANALYSIS_TYPES} />
      </Form.Item>

      <Form.Item
        name="targetMetric"
        label="目标指标"
        rules={[{ required: true, message: "请选择目标指标" }]}
      >
        <Select placeholder="选择要分析的指标" options={TARGET_METRICS} />
      </Form.Item>

      <Form.Item
        name="scenario"
        label="业务场景"
        rules={[{ required: true }]}
      >
        <Select
          options={[
            { value: "credit", label: "授信" },
            { value: "draw", label: "支用" },
            { value: "post_loan", label: "贷后" },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="timeRange"
        label="分析时段"
        rules={[{ required: true, message: "请选择分析时段" }]}
      >
        <RangePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="dimensions" label="拆解维度">
        <Checkbox.Group options={DIMENSIONS} />
      </Form.Item>

      <Form.Item name="comparisonBaseline" label="对比基准">
        <Select options={BASELINE_OPTIONS} />
      </Form.Item>

      <Form.Item name="description" label="补充说明">
        <TextArea
          rows={3}
          placeholder="描述具体问题或关注点..."
          maxLength={500}
          showCount
        />
      </Form.Item>
    </Form>
  );
}
