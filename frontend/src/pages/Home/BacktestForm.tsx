import {
  Form,
  Select,
  Input,
  DatePicker,
  Typography,
  Divider,
  Checkbox,
  InputNumber,
} from "antd";

const { TextArea } = Input;
const { Text } = Typography;
const { RangePicker } = DatePicker;

interface BacktestFormProps {
  onSubmit: (values: BacktestFormValues) => void;
  onCancel: () => void;
}

export interface BacktestFormValues {
  backtestName: string;
  strategySet: string;
  scenario: string;
  timeRange: [string, string];
  sampleRatio: number;
  metrics: string[];
  description: string;
}

const STRATEGY_SETS = [
  { value: "v3_credit", label: "V3 信贷评分策略" },
  { value: "v2_anti_fraud", label: "V2 反欺诈策略" },
  { value: "v1_draw", label: "V1 支用策略" },
];

const METRICS_OPTIONS = [
  { label: "通过率", value: "approval_rate" },
  { label: "拒绝率", value: "reject_rate" },
  { label: "KS值", value: "ks" },
  { label: "AUC值", value: "auc" },
  { label: "PSI", value: "psi" },
];

export default function BacktestForm({ onSubmit }: BacktestFormProps) {
  const [form] = Form.useForm<BacktestFormValues>();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={{ sampleRatio: 100, scenario: "credit" }}
      size="small"
    >
      <Text strong style={{ fontSize: 13 }}>
        回测配置
      </Text>
      <Divider rootClassName="layout-divider-y-sm" />

      <Form.Item
        name="backtestName"
        label="回测名称"
        rules={[{ required: true, message: "请输入回测名称" }]}
      >
        <Input placeholder="如：V3策略Q1回测" />
      </Form.Item>

      <Form.Item
        name="strategySet"
        label="策略集"
        rules={[{ required: true, message: "请选择策略集" }]}
      >
        <Select placeholder="选择要回测的策略集" options={STRATEGY_SETS} />
      </Form.Item>

      <Form.Item name="scenario" label="业务场景" rules={[{ required: true }]}>
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
        label="回测时段"
        rules={[{ required: true, message: "请选择回测时段" }]}
      >
        <RangePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="sampleRatio" label="样本比例(%)" rules={[{ required: true }]}>
        <InputNumber min={1} max={100} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="metrics" label="评估指标">
        <Checkbox.Group options={METRICS_OPTIONS} />
      </Form.Item>

      <Form.Item name="description" label="备注说明">
        <TextArea rows={2} placeholder="回测目的、关注点..." maxLength={300} />
      </Form.Item>
    </Form>
  );
}
