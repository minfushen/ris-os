import { useState } from "react";
import {
  Form,
  Input,
  Select,
  Upload,
  Typography,
  Divider,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { ScenarioNode } from "@/types";

const { TextArea } = Input;
const { Text } = Typography;

interface ReviewFormProps {
  onSubmit: (values: ReviewFormValues) => void;
  onCancel: () => void;
}

export interface ReviewFormValues {
  applicationNo: string;
  customerName: string;
  idNumber: string;
  productType: string;
  scenario: ScenarioNode;
  priority: "normal" | "urgent" | "vip";
  description: string;
  attachments: File[];
}

const PRODUCT_OPTIONS = [
  { value: "xingan_loan", label: "兴安贷" },
  { value: "business_loan", label: "经营贷" },
  { value: "consumer_loan", label: "消费贷" },
  { value: "credit_card", label: "信用卡" },
];

const PRIORITY_OPTIONS = [
  { value: "normal", label: "普通" },
  { value: "urgent", label: "紧急" },
  { value: "vip", label: "VIP客户" },
];

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [form] = Form.useForm<ReviewFormValues>();
  const [fileList, setFileList] = useState<any[]>([]);

  const handleSubmit = async (values: ReviewFormValues) => {
    const files = fileList.map((f) => f.originFileObj).filter(Boolean);
    await onSubmit({ ...values, attachments: files as File[] });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        scenario: "credit",
        priority: "normal",
      }}
      size="small"
    >
      <Text strong style={{ fontSize: 13 }}>
        申请信息
      </Text>
      <Divider style={{ margin: "8px 0" }} />

      <Form.Item
        name="applicationNo"
        label="申请编号"
        rules={[
          { required: true, message: "请输入申请编号" },
          { pattern: /^[A-Z]{2}\d{10}$/, message: "格式：2位字母+10位数字" },
        ]}
      >
        <Input placeholder="如：XD202604170001" style={{ textTransform: "uppercase" }} />
      </Form.Item>

      <Form.Item
        name="customerName"
        label="客户姓名"
        rules={[{ required: true, message: "请输入客户姓名" }]}
      >
        <Input placeholder="客户姓名" />
      </Form.Item>

      <Form.Item
        name="idNumber"
        label="身份证号"
        rules={[
          { required: true, message: "请输入身份证号" },
          { pattern: /^\d{17}[\dXx]$/, message: "身份证号格式不正确" },
        ]}
      >
        <Input placeholder="18位身份证号" maxLength={18} />
      </Form.Item>

      <Form.Item
        name="productType"
        label="产品类型"
        rules={[{ required: true, message: "请选择产品类型" }]}
      >
        <Select placeholder="选择产品" options={PRODUCT_OPTIONS} />
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

      <Form.Item name="priority" label="优先级">
        <Select options={PRIORITY_OPTIONS} />
      </Form.Item>

      <Text strong style={{ fontSize: 13 }}>
        材料上传
      </Text>
      <Divider style={{ margin: "8px 0" }} />

      <Form.Item label="申请材料">
        <Upload
          multiple
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
        >
          <Button icon={<UploadOutlined />} size="small">
            上传文件
          </Button>
          <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>
            支持 PDF、图片、Excel
          </Text>
        </Upload>
      </Form.Item>

      <Form.Item name="description" label="备注说明">
        <TextArea rows={2} placeholder="特殊情况说明..." maxLength={300} />
      </Form.Item>
    </Form>
  );
}
