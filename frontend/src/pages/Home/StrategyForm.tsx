import { useState } from "react";
import {
  Form,
  Select,
  Input,
  Typography,
  Divider,
  Radio,
  Upload,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

interface StrategyFormProps {
  onSubmit: (values: StrategyFormValues) => void;
  onCancel: () => void;
}

export interface StrategyFormValues {
  changeType: "threshold" | "rule" | "model" | "flow";
  strategySet: string;
  changeReason: string;
  impactAnalysis: string;
  riskLevel: "low" | "medium" | "high";
  effectiveDate: string;
  attachments: File[];
  description: string;
}

const CHANGE_TYPES = [
  { value: "threshold", label: "阈值调整" },
  { value: "rule", label: "规则上下架" },
  { value: "model", label: "模型替换" },
  { value: "flow", label: "决策流变更" },
];

const STRATEGY_SETS = [
  { value: "credit_main", label: "授信主流程策略" },
  { value: "draw_main", label: "支用主流程策略" },
  { value: "anti_fraud", label: "反欺诈策略" },
  { value: "post_loan", label: "贷后预警策略" },
];

export default function StrategyForm({ onSubmit }: StrategyFormProps) {
  const [form] = Form.useForm<StrategyFormValues>();
  const [fileList, setFileList] = useState<any[]>([]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(v) => onSubmit({ ...v, attachments: fileList.map((f) => f.originFileObj).filter(Boolean) })}
      initialValues={{ changeType: "threshold", riskLevel: "medium" }}
      size="small"
    >
      <Text strong style={{ fontSize: 13 }}>
        变更信息
      </Text>
      <Divider style={{ margin: "8px 0" }} />

      <Form.Item
        name="changeType"
        label="变更类型"
        rules={[{ required: true }]}
      >
        <Radio.Group>
          {CHANGE_TYPES.map((t) => (
            <Radio key={t.value} value={t.value}>
              {t.label}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="strategySet"
        label="所属策略集"
        rules={[{ required: true, message: "请选择策略集" }]}
      >
        <Select placeholder="选择策略集" options={STRATEGY_SETS} />
      </Form.Item>

      <Form.Item
        name="changeReason"
        label="变更原因"
        rules={[{ required: true, message: "请输入变更原因" }]}
      >
        <TextArea rows={2} placeholder="说明变更的业务背景和原因..." maxLength={500} />
      </Form.Item>

      <Form.Item
        name="impactAnalysis"
        label="影响分析"
        rules={[{ required: true, message: "请输入影响分析" }]}
      >
        <TextArea rows={2} placeholder="预估影响客户数、通过率变化..." maxLength={500} />
      </Form.Item>

      <Form.Item name="riskLevel" label="风险等级" rules={[{ required: true }]}>
        <Select
          options={[
            { value: "low", label: "低风险" },
            { value: "medium", label: "中风险" },
            { value: "high", label: "高风险" },
          ]}
        />
      </Form.Item>

      <Form.Item label="附件材料">
        <Upload
          multiple
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
        >
          <Button icon={<UploadOutlined />} size="small">
            上传附件
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item name="description" label="补充说明">
        <TextArea rows={2} maxLength={300} />
      </Form.Item>
    </Form>
  );
}
