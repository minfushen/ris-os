import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Radio,
  message,
  Row,
  Space,
  Statistic,
  Tag,
  Table,
  Typography,
  Upload,
} from "antd";
import type { UploadProps } from "antd";
import { DownloadOutlined, InboxOutlined, UploadOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import { api } from "@/api/client";
import type {
  BatchOnboardFailureItem,
  BatchOnboardResultItem,
  BatchOnboardWatchlistResponse,
} from "@/types/enterprise";
import { RISK_LEVEL_COLORS, RISK_LEVEL_TEXT } from "@/types/qcc";

const { Text, Paragraph } = Typography;
const { Dragger } = Upload;

function parseCompanyNames(raw: string): string[] {
  return raw
    .split(/[\n,，;；\t]/g)
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function WatchlistUpload() {
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<"low_cost" | "full">("low_cost");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BatchOnboardWatchlistResponse | null>(null);

  const parsedNames = useMemo(() => parseCompanyNames(inputText), [inputText]);

  const uploadProps: UploadProps = {
    multiple: false,
    maxCount: 1,
    accept: ".csv,.txt",
    beforeUpload: async (file) => {
      try {
        const text = await file.text();
        const rows = text
          .split(/\r?\n/g)
          .map((line) => line.split(",")[0]?.trim())
          .filter(Boolean);
        setInputText(rows.join("\n"));
        message.success("文件已解析，可直接提交入池");
      } catch (e) {
        message.error("文件解析失败，请改用粘贴名单");
      }
      return false;
    },
  };

  const handleSubmit = async () => {
    if (parsedNames.length === 0) {
      message.warning("请先输入或上传企业名单");
      return;
    }
    setSubmitting(true);
    try {
      const precheck = await api.precheckWatchlistOnboard(mode, parsedNames.length);
      if (!precheck.can_submit) {
        message.error(precheck.message);
        return;
      }
      if (precheck.message.includes("预检出现异常")) {
        message.warning(precheck.message);
      }

      const data = await api.batchOnboardWatchlist(parsedNames, mode);
      setResult(data);
      message.success(`批量处理完成：成功 ${data.processed} 家，预警 ${data.alerts_triggered} 家`);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "批量处理失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const header = [
      "company_name",
      "credit_code",
      "legal_person",
      "registered_capital",
      "paid_in_capital",
      "established_date",
      "registration_status",
      "industry_category",
      "company_type",
      "major_shareholders",
      "shareholding_ratio",
      "ultimate_beneficiary",
      "business_scope",
      "registered_address",
      "actual_address",
      "phone_number",
      "email",
      "website",
      "employee_count",
      "tax_credit_level",
      "annual_revenue",
      "is_dishonest",
      "court_cases",
      "loan_account_no",
      "credit_limit",
      "loan_balance",
      "loan_status",
      "loan_amount",
      "interest_rate",
      "start_date",
      "end_date",
      "manager_id",
      "shareholder_name",
      "shareholder_type",
      "contribution_amount",
      "contribution_ratio",
    ];
    const sample = [
      "华为技术有限公司",
      "914403001922038216",
      "赵明路",
      "4064113.1820万人民币",
      "4064113.1820万人民币",
      "1987-09-15",
      "存续（在营、开业、在册）",
      "计算机、通信和其他电子设备制造业",
      "有限责任公司（自然人投资或控股的法人独资）",
      "华为投资控股有限公司工会委员会、任正非",
      "99.14%,0.86%",
      "任正非",
      "通信设备研发与销售",
      "深圳市龙岗区坂田华为基地",
      "深圳市龙岗区坂田华为基地",
      "0755-28780808",
      "pr@huawei.com",
      "www.huawei.com",
      "195000",
      "A级",
      "642338000000",
      "否",
      "1245",
      "LN202604280001",
      "50000000.00",
      "12500000.00",
      "正常还款中",
      "50000000.00",
      "4.20",
      "2026-04-28",
      "2027-04-28",
      "RM001",
      "华为投资控股有限公司工会委员会",
      "法人股东",
      "4038384.85",
      "99.14",
    ];
    const csv = `${header.join(",")}\n${sample.join(",")}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "watchlist_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success("模板已下载");
  };

  return (
    <ModulePageShell
      title="监控名单批量上传"
      subtitle="上传贷后监控企业名单，系统自动调用企查查 MCP 评估并将高风险入预警队列"
      breadcrumb={["预警监控", "监控名单批量上传"]}
    >
      <ModuleSectionCard title="名单输入" subtitle="支持粘贴或上传 CSV/TXT（首列为企业名称）">
        <Space direction="vertical" size={12} className="w-full">
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽 CSV/TXT 到此处</p>
            <p className="ant-upload-hint">示例：每行一个企业名称，或逗号分隔</p>
          </Dragger>

          <textarea
            className="w-full min-h-[200px] rounded border border-gray-300 p-3"
            placeholder="请粘贴企业名单：每行一个企业，或逗号分隔"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <Space>
              <Text type="secondary">已解析 {parsedNames.length} 家（自动去空）</Text>
              <Radio.Group
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                optionType="button"
                size="small"
                options={[
                  { label: "低成本模式（推荐）", value: "low_cost" },
                  { label: "全量模式", value: "full" },
                ]}
              />
            </Space>
            <Space>
              <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
                下载 CSV 模板
              </Button>
              <Button onClick={() => setInputText("")}>清空</Button>
              <Button type="primary" icon={<UploadOutlined />} loading={submitting} onClick={handleSubmit}>
                批量入池并评估
              </Button>
            </Space>
          </div>
        </Space>
      </ModuleSectionCard>

      {result && (
        <>
          <Row gutter={[12, 12]} className="mt-4">
            <Col xs={12} md={6}>
              <Card><Statistic title="提交总数" value={result.total_submitted} /></Card>
            </Col>
            <Col xs={12} md={6}>
              <Card><Statistic title="有效企业" value={result.total_valid} /></Card>
            </Col>
            <Col xs={12} md={6}>
              <Card><Statistic title="已评估" value={result.assessed} /></Card>
            </Col>
            <Col xs={12} md={6}>
              <Card><Statistic title="入预警队列" value={result.alerts_triggered} /></Card>
            </Col>
            <Col xs={12} md={6}>
              <Card><Statistic title="自动升级全量" value={result.escalated_to_full || 0} /></Card>
            </Col>
          </Row>

          {result.failures.length > 0 && (
            <Alert
              className="mt-4"
              type="warning"
              showIcon
              message={`有 ${result.failures.length} 家处理失败，请查看失败明细`}
            />
          )}

          <ModuleSectionCard className="mt-4" title="处理结果" subtitle="每家企业的评估与入队状态">
            <Table<BatchOnboardResultItem>
              rowKey={(row) => `${row.enterprise_id}-${row.company_name}`}
              dataSource={result.results}
              pagination={{ pageSize: 10 }}
              columns={[
                { title: "企业名称", dataIndex: "company_name" },
                { title: "企业ID", dataIndex: "enterprise_id", width: 120 },
                {
                  title: "整体风险",
                  dataIndex: "overall_risk",
                  width: 140,
                  render: (risk: string) => (
                    <span style={{ color: RISK_LEVEL_COLORS[risk] || "#555" }}>
                      {RISK_LEVEL_TEXT[risk] || risk}
                    </span>
                  ),
                },
                {
                  title: "评估路径",
                  dataIndex: "assessment_mode",
                  width: 150,
                  render: (_: string, row) => (
                    <Space>
                      <Tag color={row.assessment_mode === "full" ? "blue" : "default"}>
                        {row.assessment_mode === "full" ? "全量" : "低成本"}
                      </Tag>
                      {row.escalated_to_full ? <Tag color="gold">自动升级</Tag> : null}
                    </Space>
                  ),
                },
                {
                  title: "是否入队",
                  dataIndex: "alert_triggered",
                  width: 120,
                  render: (v: boolean) => (v ? "是" : "否"),
                },
              ]}
            />
          </ModuleSectionCard>

          {result.failures.length > 0 && (
            <ModuleSectionCard className="mt-4" title="失败明细">
              <Table<BatchOnboardFailureItem>
                rowKey={(row) => `${row.company_name}-${row.error}`}
                dataSource={result.failures}
                pagination={{ pageSize: 10 }}
                columns={[
                  { title: "企业名称", dataIndex: "company_name", width: 280 },
                  { title: "失败原因", dataIndex: "error" },
                ]}
              />
            </ModuleSectionCard>
          )}
        </>
      )}

      <Paragraph className="mt-4" type="secondary">
        说明：该入口用于“名单入池 + 外部评估 + 预警入队”。低成本模式仅调用高信号风险工具，适合大批量；全量模式会调用更多工具，耗费额度更高。
      </Paragraph>
    </ModulePageShell>
  );
}
