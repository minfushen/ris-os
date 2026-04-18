import {
  Form,
  Select,
  Input,
  Typography,
  Divider,
  DatePicker,
  InputNumber,
} from "antd";

const { TextArea } = Input;
const { Text } = Typography;
const { RangePicker } = DatePicker;

interface InspectionFormProps {
  onSubmit: (values: InspectionFormValues) => void;
  onCancel: () => void;
}

export interface InspectionFormValues {
  inspectionType: "random" | "targeted" | "alert";
  scenario: string;
  sampleSize: number;
  timeRange: [string, string];
  targetGroup: string;
  focusArea: string[];
  description: string;
}

const INSPECTION_TYPES = [
  { value: "random", label: "随机抽检" },
  { value: "targeted", label: "定向抽检" },
  { value: "alert", label: "告警触发" },
];

const FOCUS_AREAS = [
  { label: "欺诈特征", value: "fraud" },
  { label: "信用风险", value: "credit" },
  { label: "合规问题", value: "compliance" },
  { label: "流程缺陷", value: "process" },
];

export default function InspectionForm({ onSubmit }: InspectionFormProps) {
  const [form] = Form.useForm<InspectionFormValues>();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={{ inspectionType: "random", scenario: "credit", sampleSize: 50 }}
      size="small"
    >
      <Text strong style={{ fontSize: 13 }}>
        抽检配置
      </Text>
      <Divider rootClassName="layout-divider-y-sm" />

      <Form.Item
        name="inspectionType"
        label="抽检类型"
        rules={[{ required: true }]}
      >
        <Select options={INSPECTION_TYPES} />
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

      <Form.Item name="sampleSize" label="样本数量" rules={[{ required: true }]}>
        <InputNumber min={1} max={500} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        name="timeRange"
        label="样本时段"
        rules={[{ required: true, message: "请选择样本时段" }]}
      >
        <RangePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="targetGroup" label="目标客群">
        <Input placeholder="如：新客、VIP、高风险客群" />
      </Form.Item>

      <Form.Item name="focusArea" label="关注领域">
        <Select mode="multiple" options={FOCUS_AREAS} placeholder="选择关注领域" />
      </Form.Item>

      <Form.Item name="description" label="抽检目的">
        <TextArea rows={2} placeholder="说明抽检目的和关注点..." maxLength={300} />
      </Form.Item>
    </Form>
  );
}
