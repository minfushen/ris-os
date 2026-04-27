import { Button, Col, Row, Space, Tag, Typography } from "antd";
import {
  ApiOutlined,
  BranchesOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";

const { Text } = Typography;

const FLOW_NODES = [
  {
    title: "数据准入节点",
    icon: <DatabaseOutlined />,
    desc: "校验司法、工商、还款、征信与行内流水特征是否齐备",
    output: "特征快照",
    color: "default",
  },
  {
    title: "模型评分节点",
    icon: <ApiOutlined />,
    desc: "调用模型版本库中的 Champion 模型，产出 PD / 风险分 / 解释因子",
    output: "风险评分 0-1000",
    color: "blue",
  },
  {
    title: "规则分层节点",
    icon: <BranchesOutlined />,
    desc: "叠加行业阈值、名单、授信余额、预警等级和人工复核条件",
    output: "红 / 黄 / 蓝灯",
    color: "default",
  },
  {
    title: "触达动作节点",
    icon: <ThunderboltOutlined />,
    desc: "根据等级触发站内待办、企微提醒、短信预案或转人工处置",
    output: "处置任务",
    color: "gold",
  },
  {
    title: "人工复核节点",
    icon: <UserSwitchOutlined />,
    desc: "高风险或模型低置信样本进入 RM 核查工作台形成闭环标签",
    output: "核查结论",
    color: "default",
  },
] as const;

const ROUTING_ROWS = [
  { condition: "模型分 >= 820 且司法命中", level: "红灯", action: "进入预警核查工作台 + 主管提醒", sla: "4 小时" },
  { condition: "650 <= 模型分 < 820 且多头跳升", level: "黄灯", action: "自动生成客户跟进任务", sla: "1 天" },
  { condition: "模型分 < 650 且单规则轻微命中", level: "蓝灯", action: "纳入观察池，等待下次刷新", sla: "7 天" },
];

export default function DecisionFlow() {
  return (
    <ModulePageShell
      title="决策流编排"
      subtitle="类同盾/睿智决策引擎画布：把规则、模型分、名单和触达动作编排成可发布、可回溯的贷后决策流"
      breadcrumb={["策略与模型", "决策流编排"]}
      actions={
        <Space wrap>
          <Button size="small">导入模板</Button>
          <Button type="primary" size="small">
            新建决策流
          </Button>
        </Space>
      }
    >
      <ModuleSectionCard title="决策流画布" subtitle="面试版用节点卡模拟引擎画布能力">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
          {FLOW_NODES.map((node, index) => (
            <div key={node.title} className="card-surface layout-p-md h-full relative">
              <div className="layout-flex-center layout-gap-sm layout-mb-sm">
                <span className="sider-brand-icon">{node.icon}</span>
                <Text strong className="text-[13px]">
                  {node.title}
                </Text>
              </div>
              <Text type="secondary" className="text-[12px] block layout-mb-md">
                {node.desc}
              </Text>
              <Tag color={node.color}>{node.output}</Tag>
              {index < FLOW_NODES.length - 1 ? (
                <span className="hidden xl:block absolute top-1/2 -right-3 text-text-weak">→</span>
              ) : null}
            </div>
          ))}
        </div>
      </ModuleSectionCard>

      <ModuleSectionCard title="分层与动作映射" subtitle="说明模型并非单独存在，而是进入决策执行链路">
        <Row gutter={[12, 12]}>
          {ROUTING_ROWS.map((row) => (
            <Col xs={24} lg={8} key={row.condition}>
              <div className="workbench-inset-panel h-full">
                <Tag color={row.level === "红灯" ? "red" : row.level === "黄灯" ? "gold" : "blue"}>{row.level}</Tag>
                <Text strong className="text-[13px] block layout-mt-sm">
                  {row.condition}
                </Text>
                <Text type="secondary" className="text-[12px] block layout-mt-xs">
                  动作：{row.action}
                </Text>
                <Text type="secondary" className="text-[12px] block layout-mt-xs">
                  SLA：{row.sla}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </ModuleSectionCard>
    </ModulePageShell>
  );
}
