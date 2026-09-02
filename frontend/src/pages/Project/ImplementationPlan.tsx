/**
 * 项目实施全景 — 对照《项目实施计划书-小微贷后预警》
 * 四个页签：一页纸总览 / 阶段与里程碑 / 交付物清单 / 风险与验收。
 * 客户口径：一律按"头部农商行"对外表述（见 brand.ts）。
 */

import { Table, Tag, Typography, Descriptions, List, Tabs, Alert } from "antd";
import type { ColumnsType } from "antd/es/table";
import ModulePageShell, { ModuleSectionCard } from "@/components/ModulePageShell";
import { PROJECT_PROFILE } from "@/config/brand";

const { Text } = Typography;

/* ============ 总览 KPI ============ */

const OVERVIEW_KPIS: { label: string; value: string; suffix?: string; note: string; tone: "primary" | "success" | "warning" | "info" }[] = [
  { label: "预警时效", value: "15 天 → 5–7 天", note: "人工抽检+静态规则 → 事中量化预警", tone: "primary" },
  { label: "人工排查工作量", value: "↓ 30%–40%", note: "模型+规则驱动，处置队列聚焦", tone: "success" },
  { label: "覆盖范围", value: "前六大小微产品", note: "余额占比 88% · 客户数占比 96.75%", tone: "info" },
  { label: "最高限价", value: "200 万", note: PROJECT_PROFILE.duration, tone: "warning" },
];

const KPI_TONE_COLOR: Record<string, string> = {
  primary: "#2563eb",
  success: "#16a34a",
  warning: "#d97706",
  info: "#0891b2",
};

/* ============ 一页纸总览 ============ */

const PROFILE_ITEMS: { key: string; label: string; children: string }[] = [
  { key: "name", label: "项目名称", children: `${PROJECT_PROFILE.name}（${PROJECT_PROFILE.code}）` },
  { key: "client", label: "客户", children: PROJECT_PROFILE.client },
  {
    key: "essence",
    label: "项目本质",
    children: "用低代码建模平台 + 逻辑回归评分卡 + 规则引擎，把贷后风险识别从「人工抽检 + 静态规则」（事后发现，平均滞后 15 天）升级为「事中预警」",
  },
  { key: "mode", label: "服务模式", children: "现场咨询 6 个月 + 落地跟踪 1 年，交付到决策引擎上线并完成知识转移" },
  { key: "payment", label: "付款节点", children: "进场 15% → 咨询验收 35% → 部署上线 20% → 跟踪验收 30%" },
  {
    key: "scope-in",
    label: "范围内",
    children: "8 大变量域数据体系与风险指标集市；逻辑回归 + WOE 评分卡建模（IV/VIF/逐步回归、WOE 分箱、PSI/KS/GINI、校准）；策略模型部署决策引擎并与新信贷系统集成；监控体系与处置闭环；LTV 量化评估扩展；知识转移",
  },
  {
    key: "scope-out",
    label: "范围外",
    children: "决策引擎本身的建设（用行方既有引擎，我方为集成方）；担保圈/关联图谱自建（走行内厂商接口）；贷前审批放款决策；核心交易系统改造",
  },
];

const CORE_CHALLENGES = [
  "坏样本稀缺：小微逾期率偏低（部分产品 <1%），坏样本不足导致建模难",
  "多源数据分散：客户/贷款/还款/资产负债/交易/征信/工商/司法/税务散在各系统，无统一风险数据集市",
  "产品差异大：担保类/政策性/信用类客群风险表现差异显著，需差异化建模",
  "工程化要求高：模型要部署到决策引擎、与新信贷系统集成，工程化与知识转移要求高",
];

const TEAM_COLUMNS: ColumnsType<{ role: string; duty: string; input: string }> = [
  { title: "角色", dataIndex: "role", width: 200 },
  { title: "职责", dataIndex: "duty" },
  { title: "投入", dataIndex: "input", width: 110 },
];

const TEAM_ROWS = [
  { key: "r1", role: "项目/方案负责人", duty: "方案设计、策略梳理、字段映射、集成方案、验收口径、跨部门推动", input: "全程" },
  { key: "r2", role: "模型/算法", duty: "数据体系与指标设计、特征工程、评分卡建模、验证与部署对接", input: "驻场核心" },
  { key: "r3", role: "数据工程", duty: "数据集市建设、变量加工、多源一致性治理", input: "驻场" },
  { key: "r4", role: "行方科技", duty: "决策引擎对接、SIT/UAT 配合、生产环境发布", input: "接口人" },
  { key: "r5", role: "行方风控/业务", duty: "需求确认、好坏定义业务校验、UAT 验收、处置流程落地", input: "接口人" },
];

/* ============ 阶段与里程碑 ============ */

interface PhaseRow {
  key: string;
  phase: string;
  period: string;
  payment: string;
  work: string[];
  deliverables: string[];
  milestone: string;
}

const PHASE_ROWS: PhaseRow[] = [
  {
    key: "p1",
    phase: "阶段一 · 咨询调研与体系设计",
    period: "M1–M2",
    payment: "进场 15%",
    work: [
      "业务调研（前六大产品风险特征、Vintage 曲线分析）",
      "数据质量分析（8 大域数据盘点、多源一致性抽样核查）",
      "贷后预警工作架构与处置流程设计",
      "风险数据集市设计",
    ],
    deliverables: [
      "业务调研报告",
      "数据质量分析报告",
      "《贷后预警规划》《流程整体设计方案》《处置流程设计方案》",
      "《风险数据集市设计方案》",
    ],
    milestone: "M1：咨询方案评审通过",
  },
  {
    key: "p2",
    phase: "阶段二 · 数据准备与模型开发",
    period: "M2–M4",
    payment: "咨询验收 35%",
    work: [
      "8 大变量域指标体系落地（交易行为域基于 972 行变量清单特征工程）",
      "样本处理与好坏定义（滚动率分析、坏样本不足用 SMOTE 过采样、不固定表现窗口）",
      "变量筛选与 WOE 分箱、模型训练与验证（KS/GINI/PSI）",
      "模型校准（基准分 600=好坏比 20:1，每翻倍 +20 分）",
      "LTV 双模型（分类+回归）开发",
    ],
    deliverables: ["变量库及加工逻辑", "模型设计文档", "《预警模型开发及验证报告》", "模型校准说明", "LTV 模型方案"],
    milestone: "M2：模型评审通过",
  },
  {
    key: "p3",
    phase: "阶段三 · 部署集成与上线",
    period: "M4–M6",
    payment: "部署上线 20%",
    work: [
      "策略模型部署到决策引擎、服务调用发布",
      "特征线上线下一致性治理（字段映射表 + 上线前历史回放比对 + PSI 监控）",
      "模型文件服务化封装（pkl/pmml→PMML/ONNX，灰度发布 + 一键回滚）",
      "SIT / UAT / 生产测试 / 历史数据批量验证",
      "贷后管理页面风险信息/预警信息/监控报表集成",
    ],
    deliverables: ["《IT 开发部署需求书》（含变量取数口径、部署方案）", "字段映射表", "部署与回滚预案", "集成/验收/批量验证测试报告", "上线手册"],
    milestone: "M3：模型部署上线、通过行方初验",
  },
  {
    key: "p4",
    phase: "阶段四 · 落地跟踪与优化",
    period: "M7–M18",
    payment: "跟踪验收 30%",
    work: [
      "上线后效果监控（预警时效、人工排查量、PSI/KS 衰减）",
      "模型衰减处置（特征级定位 → 短期规则层调整 → 中期重训 → 回放验证 → 灰度）",
      "知识转移收尾（培训、文档移交、行方自主运营能力验收）",
    ],
    deliverables: ["监控报告（月度）", "《策略与模型迭代优化方案》", "培训课件、项目周报"],
    milestone: "M4：落地跟踪满 1 年、终验",
  },
];

const PAYMENT_STEPS = ["进场 15%", "咨询验收 35%", "部署上线 20%", "跟踪验收 30%"];

/* ============ 交付物 ============ */

const DELIVERABLES: { key: string; no: number; name: string; stage: string }[] = [
  { key: "d1", no: 1, name: "《小微企业贷后预警规划》", stage: "阶段一" },
  { key: "d2", no: 2, name: "《小微企业贷后预警流程整体设计方案》", stage: "阶段一" },
  { key: "d3", no: 3, name: "《风险数据集市设计方案》", stage: "阶段一" },
  { key: "d4", no: 4, name: "《小微企业贷后预警处置流程设计方案》", stage: "阶段一" },
  { key: "d5", no: 5, name: "《小微企业贷后预警策略开发及验证报告》", stage: "阶段二" },
  { key: "d6", no: 6, name: "《小微企业贷后预警模型开发及验证报告》", stage: "阶段二" },
  { key: "d7", no: 7, name: "《小微企业贷后预警策略及模型 IT 开发部署需求书》（含变量取数口径、部署方案）", stage: "阶段三" },
  { key: "d8", no: 8, name: "《小微企业贷后预警处置流程系统改造开发需求书》", stage: "阶段三" },
  { key: "d9", no: 9, name: "《小微企业贷后预警监控方案》", stage: "阶段三/四" },
  { key: "d10", no: 10, name: "《小微企业贷后预警策略与模型迭代优化方案》", stage: "阶段四" },
];

const PROCESS_DOCS = [
  "业务调研报告", "数据质量分析报告", "模型开发部署文档", "变量库及加工逻辑", "代码", "接口定义",
  "测试案例", "集成测试报告", "验收测试报告", "批量验证测试报告", "上线手册", "培训课件", "监控报告", "项目周报",
];

/* ============ 风险与验收 ============ */

const RISK_LEVEL_COLOR: Record<string, string> = { 高: "red", 中: "orange", 低: "blue" };

const RISKS: { key: string; risk: string; level: string; response: string }[] = [
  {
    key: "k1",
    risk: "坏样本稀缺",
    level: "高",
    response: "滚动率分析定好坏；调整定义（2 期逾期扩展为两次 1 期）；SMOTE 过采样；不固定表现窗口；全部坏样本建模 + 好样本 40:1 抽样验证",
  },
  {
    key: "k2",
    risk: "特征线上线下不一致",
    level: "高",
    response: "字段映射表（定义/来源/频率/逻辑/责任部门写死）+ 上线前历史回放比对 + 上线后 PSI 监控，三件套根治（本项目最大工程坑）",
  },
  {
    key: "k3",
    risk: "业务不敢改策略/上线",
    level: "高",
    response: "上线流程「开发→测试→历史回放→灰度→监控→生效」+ 一键回滚；让业务从「不敢改」变「敢上线」",
  },
  {
    key: "k4",
    risk: "产品风险表现差异大",
    level: "中",
    response: "分层建模 / 引入产品类型、新老客户变量（惠快贷新客 DPD30 3.18% vs 老客 1.49%）",
  },
  {
    key: "k5",
    risk: "多源数据不一致",
    level: "中",
    response: "抽样核查 + 结合业务判断以哪张表为准 + 缺失值按业务含义灵活分箱",
  },
  {
    key: "k6",
    risk: "工程落地周期长",
    level: "中",
    response: "预留部署/验证/培训时间；模型上线不止算法，还涉决策引擎、变量加工、接口、测试、培训",
  },
  {
    key: "k7",
    risk: "可解释性监管要求",
    level: "中",
    response: "逻辑回归 + WOE + 业务校验（可解释优先），谨慎使用黑盒模型",
  },
];

const ACCEPTANCE: { key: string; dim: string; standard: string }[] = [
  { key: "a1", dim: "功能", standard: "策略模型部署到决策引擎并上线，通过行方验收；贷后管理页面可展示风险/预警信息" },
  { key: "a2", dim: "模型", standard: "评分卡区分能力（KS/GINI）、稳定性（PSI）达标；投产前验证通过；覆盖六大产品" },
  { key: "a3", dim: "效果", standard: "预警时效 15 天 → 5–7 天；人工排查工作量降 30%–40%" },
  { key: "a4", dim: "知识转移", standard: "行方具备数据→特征→建模→部署→监控→迭代的全流程自主能力" },
  { key: "a5", dim: "付款挂钩", standard: "进场 15% / 咨询验收 35% / 部署上线 20% / 跟踪验收 30%" },
];

const KSF = [
  "坏样本处理方法论是建模成败关键——小微低逾期场景下的定义调整 + 过采样 + 验证策略组合",
  "字段映射表 + 历史回放 + PSI 监控三件套根治特征线上线下不一致",
  "可解释性优先（逻辑回归 + WOE + 业务校验）是银行风控落地的前提",
  "集成商定位（不替换决策引擎、用低代码平台管模型全生命周期）保护客户既有投资",
  "资产化沉淀：策略资产/字段映射表/SOW 模板/验收 Checklist 可复制到同类农商行",
  "LTV 扩展复用同一套低代码平台：贷后预警（风险）与 LTV（价值）共享数据集市、特征工程、部署架构、监控体系",
];

/* ============ 页面 ============ */

const kpiColumns: ColumnsType<(typeof OVERVIEW_KPIS)[number]> = [
  { title: "指标", dataIndex: "label", width: 160 },
  {
    title: "目标值",
    dataIndex: "value",
    width: 200,
    render: (v: string, row) => <Text strong style={{ color: KPI_TONE_COLOR[row.tone] }}>{v}</Text>,
  },
  { title: "口径说明", dataIndex: "note" },
];

const riskColumns: ColumnsType<(typeof RISKS)[number]> = [
  { title: "风险", dataIndex: "risk", width: 180 },
  {
    title: "等级",
    dataIndex: "level",
    width: 80,
    render: (l: string) => <Tag color={RISK_LEVEL_COLOR[l]}>{l}</Tag>,
  },
  { title: "应对（项目实证）", dataIndex: "response" },
];

const acceptanceColumns: ColumnsType<(typeof ACCEPTANCE)[number]> = [
  { title: "维度", dataIndex: "dim", width: 120 },
  { title: "验收标准", dataIndex: "standard" },
];

const deliverableColumns: ColumnsType<(typeof DELIVERABLES)[number]> = [
  { title: "#", dataIndex: "no", width: 48 },
  { title: "交付物（谈判文件要求）", dataIndex: "name" },
  {
    title: "对应阶段",
    dataIndex: "stage",
    width: 110,
    render: (s: string) => <Tag color="blue">{s}</Tag>,
  },
];

const phaseColumns: ColumnsType<PhaseRow> = [
  {
    title: "阶段 / 周期",
    dataIndex: "phase",
    width: 220,
    render: (v: string, row) => (
      <div>
        <Text strong>{v}</Text>
        <div><Text type="secondary" style={{ fontSize: 12 }}>{row.period} · {row.payment}</Text></div>
      </div>
    ),
  },
  {
    title: "重点工作",
    dataIndex: "work",
    render: (work: string[]) => (
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {work.map((w) => <li key={w}><Text style={{ fontSize: 13 }}>{w}</Text></li>)}
      </ul>
    ),
  },
  {
    title: "交付物",
    dataIndex: "deliverables",
    width: 300,
    render: (items: string[]) => (
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {items.map((d) => <li key={d}><Text style={{ fontSize: 13 }}>{d}</Text></li>)}
      </ul>
    ),
  },
  {
    title: "里程碑",
    dataIndex: "milestone",
    width: 180,
    render: (m: string) => <Tag color="geekblue">{m}</Tag>,
  },
];

function OverviewTab() {
  return (
    <div className="module-page-stack">
      <ModuleSectionCard title="核心目标（做成什么样）" subtitle="衡量口径来自计划书一页纸总览" noPadding>
        <Table
          rowKey={(r) => r.label}
          columns={kpiColumns}
          dataSource={OVERVIEW_KPIS}
          pagination={false}
          size="middle"
        />
      </ModuleSectionCard>

      <ModuleSectionCard title="项目要素" noPadding>
        <Descriptions
          column={1}
          size="small"
          bordered
          items={PROFILE_ITEMS.map((i) => ({ key: i.key, label: i.label, children: i.children }))}
          labelStyle={{ width: 120 }}
        />
      </ModuleSectionCard>

      <ModuleSectionCard title="核心难点">
        <List
          size="small"
          dataSource={CORE_CHALLENGES}
          renderItem={(item) => (
            <List.Item>
              <Text style={{ fontSize: 13 }}>{item}</Text>
            </List.Item>
          )}
        />
      </ModuleSectionCard>

      <ModuleSectionCard title="资源与组织" subtitle="服务形式：核心人员驻场咨询，模型专家中期 ≥2 天/周" noPadding>
        <Table rowKey="key" columns={TEAM_COLUMNS} dataSource={TEAM_ROWS} pagination={false} size="middle" />
      </ModuleSectionCard>
    </div>
  );
}

function MilestoneTab() {
  return (
    <div className="module-page-stack">
      <Alert
        type="info"
        showIcon
        message="实施主线：咨询调研 → 数据与模型 → 部署上线 → 跟踪优化；付款节点与里程碑一一挂钩。"
      />
      <ModuleSectionCard title="付款节点" subtitle="与四个里程碑一一挂钩，驱动验收与回款节奏">
        <div className="flex items-center gap-2">
          {PAYMENT_STEPS.map((s, i) => (
            <Tag key={s} color={i === 0 ? "blue" : i === 1 ? "geekblue" : i === 2 ? "cyan" : "green"}>{s}</Tag>
          ))}
        </div>
      </ModuleSectionCard>
      <ModuleSectionCard title="阶段与里程碑" noPadding>
        <Table
          rowKey="key"
          columns={phaseColumns}
          dataSource={PHASE_ROWS}
          pagination={false}
          size="middle"
        />
      </ModuleSectionCard>
    </div>
  );
}

function DeliverablesTab() {
  return (
    <div className="module-page-stack">
      <ModuleSectionCard title="主交付物（端到端 10 项）" noPadding>
        <Table rowKey="key" columns={deliverableColumns} dataSource={DELIVERABLES} pagination={false} size="middle" />
      </ModuleSectionCard>
      <ModuleSectionCard title="过程件">
        {PROCESS_DOCS.map((d) => (
          <Tag key={d} style={{ marginBottom: 8 }}>{d}</Tag>
        ))}
      </ModuleSectionCard>
    </div>
  );
}

function RiskTab() {
  return (
    <div className="module-page-stack">
      <ModuleSectionCard title="风险管理（会踩什么坑、怎么应对）" noPadding>
        <Table rowKey="key" columns={riskColumns} dataSource={RISKS} pagination={false} size="middle" />
      </ModuleSectionCard>
      <ModuleSectionCard title="验收标准（怎么算做成了）" noPadding>
        <Table rowKey="key" columns={acceptanceColumns} dataSource={ACCEPTANCE} pagination={false} size="middle" />
      </ModuleSectionCard>
      <ModuleSectionCard title="关键成功要素（KSF）与经验沉淀">
        <List
          size="small"
          dataSource={KSF}
          renderItem={(item, idx) => (
            <List.Item>
              <Text style={{ fontSize: 13 }}>
                <Text strong>{idx + 1}. </Text>
                {item}
              </Text>
            </List.Item>
          )}
        />
      </ModuleSectionCard>
    </div>
  );
}

export default function ImplementationPlan() {
  return (
    <ModulePageShell
      title="项目实施全景"
      subtitle={`${PROJECT_PROFILE.name}（${PROJECT_PROFILE.code}）· 对照《项目实施计划书》`}
      breadcrumb={["项目实施", "项目实施全景"]}
    >
      <Tabs
        defaultActiveKey="overview"
        items={[
          { key: "overview", label: "一页纸总览", children: <OverviewTab /> },
          { key: "milestones", label: "阶段与里程碑", children: <MilestoneTab /> },
          { key: "deliverables", label: "交付物清单", children: <DeliverablesTab /> },
          { key: "risks", label: "风险与验收", children: <RiskTab /> },
        ]}
      />
    </ModulePageShell>
  );
}
