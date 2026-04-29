import { useState } from "react";
import { Button, Col, Input, Row, Space, Tag, Typography, Timeline, Card, Divider } from "antd";
import { ApiOutlined, BranchesOutlined, DatabaseOutlined, ThunderboltOutlined, UserSwitchOutlined, PlayCircleOutlined } from "@ant-design/icons";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import DemoFlowNav from "@/components/DemoFlowNav";

const { Text } = Typography;

const FLOW_NODES = [
  { key: "data_check", title: "数据准入节点", icon: <DatabaseOutlined />, desc: "校验司法、工商、还款、征信与行内流水特征是否齐备", output: "特征快照", color: "default" as const },
  { key: "model_score", title: "模型评分节点", icon: <ApiOutlined />, desc: "调用模型版本库中的 Champion 模型，产出 PD / 风险分 / 解释因子", output: "风险评分 0-1000", color: "blue" as const },
  { key: "rule_layer", title: "规则分层节点", icon: <BranchesOutlined />, desc: "叠加行业阈值、名单、授信余额、预警等级和人工复核条件", output: "红 / 黄 / 蓝灯", color: "default" as const },
  { key: "action_dispatch", title: "触达动作节点", icon: <ThunderboltOutlined />, desc: "根据等级触发站内待办、企微提醒、短信预案或转人工处置", output: "处置任务", color: "gold" as const },
  { key: "human_review", title: "人工复核节点", icon: <UserSwitchOutlined />, desc: "高风险或模型低置信样本进入 RM 核查工作台形成闭环标签", output: "核查结论", color: "default" as const },
] as const;

const ROUTING_ROWS = [
  { condition: "模型分 >= 820 且司法命中", level: "红灯", action: "进入预警核查工作台 + 主管提醒", sla: "4 小时" },
  { condition: "650 <= 模型分 < 820 且多头跳升", level: "黄灯", action: "自动生成客户跟进任务", sla: "1 天" },
  { condition: "模型分 < 650 且单规则轻微命中", level: "蓝灯", action: "纳入观察池，等待下次刷新", sla: "7 天" },
];

interface SimResult {
  node: string;
  status: "pass" | "warn" | "fail";
  detail: string;
  output: string;
}

function simulate(name: string): SimResult[] {
  const hash = Array.from(name).reduce((s, c) => s + c.charCodeAt(0), 0);
  const riskScore = 500 + (hash % 500);
  const judicialHit = hash % 3 === 0;
  const multiHeadJump = hash % 2 === 0;
  const dataComplete = hash % 5 !== 0;

  let level = "蓝灯";
  if (riskScore >= 820 && judicialHit) level = "红灯";
  else if (riskScore >= 650 && multiHeadJump) level = "黄灯";

  return [
    { node: "数据准入节点", status: dataComplete ? "pass" : "fail" as const, detail: dataComplete ? "12/12 数据源可用" : "社保数据缺失（最近同步 3月31日），自动降级为低置信模式", output: dataComplete ? "完整特征快照" : "降级特征快照（缺失 1 项）" },
    { node: "模型评分节点", status: riskScore >= 820 ? "fail" as const : riskScore >= 650 ? "warn" as const : "pass" as const, detail: `Champion 模型 MDL-BIZ-002 评分完成 · ${judicialHit ? "司法命中标记" : "司法无异常"} · ${multiHeadJump ? "多头跳升触发" : "多头正常"}`, output: `风险评分：${riskScore}` },
    { node: "规则分层节点", status: level === "红灯" ? "fail" as const : level === "黄灯" ? "warn" as const : "pass" as const, detail: `行业阈值匹配（${["制造业", "批发零售", "住宿餐饮", "建筑业", "服务业"][hash % 5]}）· 授信余额检查通过`, output: level },
    { node: "触达动作节点", status: level === "红灯" ? "fail" as const : level === "黄灯" ? "warn" as const : "pass" as const, detail: level === "红灯" ? "生成红灯处置任务 + 推送主管企微" : level === "黄灯" ? "生成客户跟进任务" : "纳入观察池", output: level === "红灯" ? "处置任务 · SLA 4h" : level === "黄灯" ? "跟进任务 · SLA 1d" : "观察任务 · SLA 7d" },
    { node: "人工复核节点", status: level === "红灯" ? "fail" as const : "pass" as const, detail: level === "红灯" ? "模型低置信（confidence < 0.7），强制进入 RM 核查工作台" : "自动处置通过，不进入人工复核", output: level === "红灯" ? "待核查" : "无需复核" },
  ];
}

export default function DecisionFlow() {
  const [simInput, setSimInput] = useState("");
  const [simResult, setSimResult] = useState<SimResult[] | null>(null);

  const handleSimulate = () => {
    const name = simInput.trim();
    if (!name) return;
    setSimResult(simulate(name));
  };

  return (
    <ModulePageShell
      title="决策流编排"
      subtitle="类同盾/睿智决策引擎画布：把规则、模型分、名单和触达动作编排成可发布、可回溯的贷后决策流"
      breadcrumb={["策略与模型", "决策流编排"]}
      actions={
        <Space wrap>
          <Button size="small">导入模板</Button>
          <Button type="primary" size="small">新建决策流</Button>
        </Space>
      }
    >
      <ModuleSectionCard title="决策流画布" subtitle="面试版用节点卡模拟引擎画布能力">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
          {FLOW_NODES.map((node, index) => (
            <div key={node.key} className="card-surface layout-p-md h-full relative">
              <div className="layout-flex-center layout-gap-sm layout-mb-sm">
                <span className="sider-brand-icon">{node.icon}</span>
                <Text strong className="text-[13px]">{node.title}</Text>
              </div>
              <Text type="secondary" className="text-[12px] block layout-mb-md">{node.desc}</Text>
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
                <Text strong className="text-[13px] block layout-mt-sm">{row.condition}</Text>
                <Text type="secondary" className="text-[12px] block layout-mt-xs">动作：{row.action}</Text>
                <Text type="secondary" className="text-[12px] block layout-mt-xs">SLA：{row.sla}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </ModuleSectionCard>

      {/* 决策流模拟执行 */}
      <ModuleSectionCard title="决策流模拟执行" subtitle="输入企业名称，模拟决策引擎对预警信号的逐节点处理过程">
        <Space className="mb-4">
          <Input
            placeholder="输入企业名称（如：重庆博远实业有限公司）"
            value={simInput}
            onChange={(e) => setSimInput(e.target.value)}
            onPressEnter={handleSimulate}
            style={{ width: 320 }}
          />
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleSimulate}>
            模拟执行
          </Button>
          <Button size="small" onClick={() => { setSimInput("重庆博远实业有限公司"); setSimResult(simulate("重庆博远实业有限公司")); }}>
            快速填充示例
          </Button>
        </Space>

        {simResult && (
          <Card size="small">
            <Timeline
              items={simResult.map((step, i) => ({
                color: step.status === "fail" ? "red" : step.status === "warn" ? "orange" : "green",
                children: (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag color={step.status === "fail" ? "red" : step.status === "warn" ? "orange" : "green"} className="!m-0 text-[11px]">
                        {step.status === "fail" ? "拦截" : step.status === "warn" ? "关注" : "通过"}
                      </Tag>
                      <Text strong className="text-[13px]">{step.node}</Text>
                    </div>
                    <Text className="text-[13px] block">{step.detail}</Text>
                    <div className="mt-1">
                      <Tag className="text-[11px]">{step.output}</Tag>
                    </div>
                    {i < simResult.length - 1 && <Divider className="my-2" />}
                  </div>
                ),
              }))}
            />
          </Card>
        )}
      </ModuleSectionCard>

      <DemoFlowNav />
    </ModulePageShell>
  );
}
