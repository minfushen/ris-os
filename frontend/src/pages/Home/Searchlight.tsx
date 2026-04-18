import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Typography, Space, Button, Tag, Badge, Tooltip, App, Divider } from "antd";
import {
  SearchOutlined,
  WarningOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  UpOutlined,
  DownOutlined,
  FlagOutlined,
  InfoCircleOutlined,
  LockOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useMockRealtimePush, type RealtimeAlert } from "@/hooks/useRealtimePush";

const { Text } = Typography;

function readDutyDisplayName(): string {
  try {
    return localStorage.getItem("ris_duty_display_name")?.trim() || "本人";
  } catch {
    return "本人";
  }
}

const LEVEL_CONFIG = {
  high: {
    strip: "var(--color-accent-danger, #c77b78)",
    icon: <FlagOutlined />,
    riskTag: "高危",
    riskColor: "red" as const,
  },
  medium: {
    strip: "var(--color-accent-warning, #d7a85f)",
    icon: <WarningOutlined />,
    riskTag: "警告",
    riskColor: "orange" as const,
  },
  low: {
    strip: "var(--color-accent-success, #5f9b7a)",
    icon: <InfoCircleOutlined />,
    riskTag: "提示",
    riskColor: "green" as const,
  },
};

type WorkflowState = "unread" | "claimed" | "snoozed" | "closed";

type FilterTab = "all" | "high" | "alerting" | "pending_claim";

const ALERT_ACTIONS: Record<
  RealtimeAlert["type"],
  { typeLabel: string; primary: string; secondary?: string; slaBudgetMin: number }
> = {
  gang: { typeLabel: "团伙探测", primary: "发起归因", secondary: "查看图谱", slaBudgetMin: 30 },
  false_reject: { typeLabel: "误杀预警", primary: "发起捞回分析", secondary: "查看详情", slaBudgetMin: 60 },
  psi_drift: { typeLabel: "PSI 漂移", primary: "发起归因", secondary: "查看详情", slaBudgetMin: 120 },
  throughput_drop: { typeLabel: "通过率下降", primary: "发起归因", secondary: "查看渠道拆解", slaBudgetMin: 45 },
};

function fmtCN(iso: string): string {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      hour12: false,
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** 每次进入页面刷新「触发时间」，便于 SLA 剩余分钟演示真实递减 */
function buildSeedAlerts(): RealtimeAlert[] {
  const t = Date.now();
  const firstSl001 = new Date(t - 3 * 3600_000).toISOString();
  const firstSl002 = new Date(t - 72 * 3600_000).toISOString();
  const firstSl003 = new Date(t - 30 * 3600_000).toISOString();
  return [
    {
      id: "SL001",
      type: "gang",
      level: "high",
      title: "API-04 渠道发现 12 个高度相似设备组",
      description: "发现 12 个高度相似设备组",
      subtitle: "团伙指纹聚类命中 · 需优先判断是否欺诈链路外溢",
      conclusionLine: "团伙指纹聚类命中，疑似欺诈链路经 API-04 外溢，需优先判断是否立即拦截。",
      impactScope: "API-04 渠道 · 设备指纹簇 · 授信进件环节（不含贷后）",
      firstTriggeredDisplay: `${fmtCN(firstSl001)}（全渠道首触）`,
      timestamp: new Date(t - 26 * 60_000).toISOString(),
      metadata: { channel: "API-04", count: 12 },
      impact: { amountWan: 86, applications: 47, momentum: "近 2h 环比 +18%" },
      recurrence: {
        timesIn30d: 4,
        lastOccurredAt: "2026-04-14 16:20",
        lastResolutionSummary: "收紧 DEVICE_CLUSTER 阈值 + API-04 单渠道限额",
      },
      evidenceRows: [
        { label: "聚类相似度 P95", value: "0.94", hint: "阈值 0.85" },
        { label: "同设备跨单量", value: "12 → 47 笔进件", hint: "2h 窗口" },
        { label: "关联欺诈标签", value: "3 笔历史可疑", hint: "近 90 日" },
        { label: "规则命中路径", value: "DEVICE_CLUSTER → L2", hint: "可下钻规则版本" },
      ],
      detailPairs: [
        { label: "涉及进件", value: "47 笔" },
        { label: "关联渠道", value: "API-04" },
        { label: "影响金额", value: "约 86 万" },
        { label: "首次触发", value: "本窗 08:41:22" },
        { label: "触发规则", value: "DEVICE_CLUSTER" },
        { label: "设备簇 ID", value: "CLU-API04-09F2" },
      ],
    },
    {
      id: "SL002",
      type: "false_reject",
      level: "medium",
      title: "经营贷产品拒件中 24% 在外部借贷成功",
      description: "24% 拒件在外部借贷成功",
      subtitle: "疑似规则误杀或数据源滞后 · 建议对照外部多头",
      conclusionLine: "拒件与外部多头强相关，优先怀疑规则误杀或三方数据滞后，建议先拉样本再决定是否调规则。",
      impactScope: "经营贷产品 · 全渠道授信拒件样本 · 规则集 BR_RULE_V2",
      firstTriggeredDisplay: `${fmtCN(firstSl002)}（指标首触）`,
      timestamp: new Date(t - 48 * 60_000).toISOString(),
      metadata: { product: "经营贷", rate: 24 },
      impact: { amountWan: 120, applications: 1240, momentum: "连续 3 日偏高" },
      recurrence: {
        timesIn30d: 2,
        lastOccurredAt: "2026-04-10 09:15",
        lastResolutionSummary: "复核规则 BR_RULE_V2 阈值，剔除 1 条过时黑名单源",
      },
      evidenceRows: [
        { label: "拒件样本量", value: "1,240 笔（7 日）", hint: "经营贷" },
        { label: "外部多头命中", value: "24%（置信 0.82）", hint: "三方 T+1" },
        { label: "规则集版本", value: "BR_RULE_V2.3", hint: "与上周一致" },
        { label: "数据新鲜度", value: "多头快照 延迟 6h", hint: "疑似滞后" },
      ],
      detailPairs: [
        { label: "涉及拒件", value: "约 1,240 笔" },
        { label: "产品", value: "经营贷" },
        { label: "外部借贷成功占比", value: "24%" },
        { label: "首次异常日", value: "2026-04-15" },
        { label: "关联规则集", value: "BR_RULE_V2" },
        { label: "专家抽检批次", value: "SP-202604-07" },
      ],
    },
    {
      id: "SL003",
      type: "psi_drift",
      level: "low",
      title: "特征「近30天多头查询」PSI 达 0.28",
      description: "PSI 超过阈值 0.25",
      subtitle: "模型侧已冻结该特征入模 · 建议复核口径",
      conclusionLine: "入模特征分布偏离训练基线，模型侧已冻结入模；需策略与模型联合确认是否口径漂移。",
      impactScope: "B卡 v3.2 · 全渠道入模样本 · 特征「近30天多头查询」",
      firstTriggeredDisplay: `${fmtCN(firstSl003)}（漂移首触）`,
      timestamp: new Date(t - 200 * 60_000).toISOString(),
      metadata: { feature: "近30天多头查询", psi: 0.28 },
      impact: { applications: 128_000, momentum: "入模样本覆盖稳定" },
      recurrence: {
        timesIn30d: 1,
        lastOccurredAt: "—",
        lastResolutionSummary: "—",
      },
      evidenceRows: [
        { label: "PSI（7 日滚动）", value: "0.28", hint: "阈 0.25" },
        { label: "训练分布 Q80", value: "6.2 次/人", hint: "当前窗" },
        { label: "线上分布 Q80", value: "8.9 次/人", hint: "偏离主因" },
      ],
      detailPairs: [
        { label: "特征名", value: "近30天多头查询" },
        { label: "当前 PSI", value: "0.28" },
        { label: "阈值", value: "0.25" },
        { label: "影响模型", value: "B卡 v3.2" },
        { label: "首次漂移", value: "昨日 19:12" },
        { label: "责任人", value: "特征平台" },
      ],
    },
  ];
}

function computeSla(iso: string, slaBudgetMin: number) {
  const elapsedMin = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  const remainMin = Math.max(0, slaBudgetMin - elapsedMin);
  const ratio = slaBudgetMin > 0 ? remainMin / slaBudgetMin : 1;
  let urgency: "ok" | "warn" | "critical" = "ok";
  if (slaBudgetMin > 0 && (remainMin <= 5 || ratio <= 0.15)) urgency = "critical";
  else if (slaBudgetMin > 0 && (remainMin <= 15 || ratio <= 0.35)) urgency = "warn";
  return { elapsedMin, remainMin, urgency };
}

interface SearchlightProps {
  onAction?: (itemId: string, action: string) => void;
  onSnoozeToQueue?: (item: RealtimeAlert) => void;
  enableRealtime?: boolean;
}

export default function Searchlight({ onAction, onSnoozeToQueue, enableRealtime = true }: SearchlightProps) {
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const dutyName = useMemo(() => readDutyDisplayName(), []);
  const { status, alerts: realtimeAlerts, acknowledgeAlert } = useMockRealtimePush(8000);
  const [displayItems, setDisplayItems] = useState<RealtimeAlert[]>(buildSeedAlerts);
  const [newAlertCount, setNewAlertCount] = useState(0);
  const [tick, setTick] = useState(0);
  const [workflowById, setWorkflowById] = useState<Record<string, WorkflowState>>({ SL003: "claimed" });
  const [claimById, setClaimById] = useState<Record<string, string>>({ SL003: "王五" });
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({ SL001: true });
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [onlyHighRisk, setOnlyHighRisk] = useState(false);
  const [onlyClaimed, setOnlyClaimed] = useState(false);

  const getWorkflow = useCallback((id: string): WorkflowState => workflowById[id] ?? "unread", [workflowById]);

  useEffect(() => {
    const sl = searchParams.get("sl");
    if (sl === "high") {
      setFilterTab("high");
      setOnlyHighRisk(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (enableRealtime && realtimeAlerts.length > 0) {
      const newAlerts = realtimeAlerts.filter((alert) => !displayItems.some((item) => item.id === alert.id));
      if (newAlerts.length > 0) {
        setDisplayItems((prev) => [...newAlerts, ...prev].slice(0, 10));
        setNewAlertCount((prev) => prev + newAlerts.length);
      }
    }
  }, [realtimeAlerts, enableRealtime, displayItems]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 10_000);
    return () => window.clearInterval(id);
  }, []);

  const handleAction = (itemId: string, action: string) => {
    if (action === "发起归因" || action === "发起捞回分析") {
      acknowledgeAlert(itemId);
    }
    onAction?.(itemId, action);
  };

  const handleClearNew = () => {
    setNewAlertCount(0);
  };

  const visibleItems = useMemo(
    () => displayItems.filter((item) => getWorkflow(item.id) !== "closed"),
    [displayItems, getWorkflow]
  );

  const tabCounts = useMemo(() => {
    const high = visibleItems.filter((i) => i.level === "high").length;
    const alerting = visibleItems.filter((i) => i.level !== "low").length;
    const pending = visibleItems.filter((i) => getWorkflow(i.id) === "unread").length;
    return {
      all: visibleItems.length,
      high,
      alerting,
      pending_claim: pending,
    };
  }, [visibleItems, getWorkflow]);

  const filteredItems = useMemo(() => {
    let list = visibleItems;
    if (onlyHighRisk) list = list.filter((i) => i.level === "high");
    if (onlyClaimed) list = list.filter((i) => getWorkflow(i.id) === "claimed");
    switch (filterTab) {
      case "high":
        return list.filter((i) => i.level === "high");
      case "alerting":
        return list.filter((i) => i.level !== "low");
      case "pending_claim":
        return list.filter((i) => getWorkflow(i.id) === "unread");
      default:
        return list;
    }
  }, [visibleItems, filterTab, onlyHighRisk, onlyClaimed, getWorkflow]);

  const toggleExpand = (id: string) => {
    setExpandedIds((m) => ({ ...m, [id]: !m[id] }));
  };

  const claimItem = (id: string) => {
    const wf = getWorkflow(id);
    const holder = claimById[id];
    if (wf === "claimed" && holder && holder !== dutyName) {
      void message.warning(`该告警已由 ${holder} 认领并锁定，请勿重复介入。如需协作请使用「申请协助转派」。`);
      return;
    }
    setWorkflowById((m) => ({ ...m, [id]: "claimed" }));
    setClaimById((m) => ({ ...m, [id]: dutyName }));
    void message.success(`已认领 · 处理人锁定为「${dutyName}」`);
  };

  const isClaimedByOther = (id: string, wf: WorkflowState) =>
    wf === "claimed" && Boolean(claimById[id]) && claimById[id] !== dutyName;

  const isClaimedByMe = (id: string, wf: WorkflowState) => wf === "claimed" && claimById[id] === dutyName;

  const canRunDisposition = (id: string, wf: WorkflowState) => isClaimedByMe(id, wf);

  const renderSlaLine = (item: RealtimeAlert, slaBudgetMin: number, _tick: number) => {
    const { elapsedMin, remainMin, urgency } = computeSla(item.timestamp, slaBudgetMin);
    const base = "text-[13px] tabular-nums transition-colors duration-300";
    const color =
      urgency === "critical"
        ? "text-red-600 font-semibold"
        : urgency === "warn"
          ? "text-orange-600 font-medium"
          : "text-text-secondary";
    const pulse = urgency === "critical" ? " animate-pulse" : "";
    void _tick;
    return (
      <div className={`${base} ${color}${pulse}`}>
        已持续 {elapsedMin}m · 响应 SLA 剩余 {remainMin}m
        {urgency === "critical" ? (
          <Tag color="error" className="ml-2 align-middle text-[11px] m-0">
            即将超时
          </Tag>
        ) : urgency === "warn" ? (
          <Tag color="warning" className="ml-2 align-middle text-[11px] m-0">
            关注时效
          </Tag>
        ) : null}
      </div>
    );
  };

  const impactScopeText = (item: RealtimeAlert) =>
    item.impactScope ??
    (typeof item.metadata?.channel === "string"
      ? `${item.metadata.channel} 等`
      : typeof item.metadata?.product === "string"
        ? `${item.metadata.product} 产品线`
        : "—");

  const lastSimilarSummary = (item: RealtimeAlert) => {
    const r = item.recurrence;
    if (!r?.lastResolutionSummary || r.lastResolutionSummary === "—") return "暂无历史闭环（或首次出现）";
    return r.lastResolutionSummary;
  };

  const ownerLabel = (item: RealtimeAlert, wf: WorkflowState) => {
    if (wf === "claimed") return claimById[item.id] ?? dutyName;
    if (wf === "snoozed") return "已稍后（工单池）";
    return "待认领";
  };

  return (
    <section id="searchlight-anchor" className="section-shell">
      <div className="section-header flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <SearchOutlined className="text-primary" />
            <Text className="section-title !mb-0">异动探照灯</Text>
          </div>
          <Text type="secondary" className="text-[13px]">
            首屏主动发现 · 把异常作为第一行动入口 · 值班身份「{dutyName}」
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tooltip title={status.connected ? "实时连接正常" : "连接断开"}>
            <Badge status={status.connected ? "success" : "error"} />
          </Tooltip>
          {status.reconnecting && (
            <Tag icon={<SyncOutlined spin />} color="warning" className="text-xs m-0">
              重连中
            </Tag>
          )}
          <Space.Compact size="small" className="!hidden sm:!inline-flex">
            <Button type={onlyHighRisk ? "primary" : "default"} size="small" onClick={() => setOnlyHighRisk((v) => !v)}>
              仅高危
            </Button>
            <Button type={onlyClaimed ? "primary" : "default"} size="small" onClick={() => setOnlyClaimed((v) => !v)}>
              已认领
            </Button>
          </Space.Compact>
          <Tag color={newAlertCount > 0 ? "red" : "default"} className="cursor-pointer m-0 text-xs" onClick={handleClearNew}>
            {newAlertCount > 0 ? `${newAlertCount} 条新告警` : "清除新标"}
          </Tag>
        </div>
      </div>

      <div className="px-3 pt-2 pb-1 border-b border-border-soft flex flex-wrap gap-2">
        {(
          [
            ["all", `全部 (${tabCounts.all})`],
            ["high", `高危 (${tabCounts.high})`],
            ["alerting", `告警中 (${tabCounts.alerting})`],
            ["pending_claim", `待认领 (${tabCounts.pending_claim})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilterTab(key)}
            className={`rounded-full px-3 py-1 text-[13px] transition-colors border ${
              filterTab === key
                ? "border-primary bg-primary/10 text-primary-deep font-medium"
                : "border-border-soft bg-white text-text-secondary hover:border-primary/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="section-body space-y-3 !pt-3">
        {filteredItems.map((item, index) => {
          const levelCfg = LEVEL_CONFIG[item.level];
          const actionCfg = ALERT_ACTIONS[item.type];
          const wf = getWorkflow(item.id);
          const isNew = index < newAlertCount && wf === "unread";
          const expanded = Boolean(expandedIds[item.id]);
          const pairs = item.detailPairs ?? [];
          const claimedOther = isClaimedByOther(item.id, wf);
          const claimedMe = isClaimedByMe(item.id, wf);
          const canDispose = canRunDisposition(item.id, wf);
          const primaryDisabled = wf === "unread" || claimedOther || wf === "snoozed";
          const primaryReason =
            wf === "unread"
              ? "请先认领以锁定处理权，避免多人重复处置"
              : claimedOther
                ? `已由 ${claimById[item.id]} 锁定`
                : wf === "snoozed"
                  ? "已稍后，请在工作项中继续"
                  : "";
          const canSnooze = !claimedOther && wf !== "snoozed" && wf !== "closed";
          const primaryActionLabel = item.type === "false_reject" ? "发起捞回分析" : actionCfg.primary;
          const primaryActionKey = item.type === "false_reject" ? "发起捞回分析" : actionCfg.primary;
          const graphLabel = item.type === "gang" ? "查看图谱" : actionCfg.secondary === "查看渠道拆解" ? "查看渠道拆解" : "查看详情";
          const graphAction =
            item.type === "gang" ? "查看图谱" : actionCfg.secondary === "查看渠道拆解" ? "查看渠道拆解" : actionCfg.secondary ?? "查看详情";

          return (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-lg border bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)] layout-pl-compact ${
                isNew ? "ring-1 ring-red-200" : ""
              } ${wf === "snoozed" ? "opacity-75" : ""} ${
                claimedOther ? "border-slate-300 ring-1 ring-slate-200/80" : "border-border-soft"
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l" style={{ backgroundColor: levelCfg.strip }} />
              <div className="pl-3 pr-3 py-3">
                {claimedOther ? (
                  <div className="mb-2 flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-[12px] text-text-secondary">
                    <LockOutlined className="text-slate-500" />
                    <span>
                      处理权已锁定：<strong>{claimById[item.id]}</strong> 认领中。可展开查看「上次同类处置」与佐证；协作请点「转人工复核」或申请转派。
                    </span>
                  </div>
                ) : null}
                {claimedMe ? (
                  <div className="mb-2 flex flex-wrap items-center gap-2 rounded border border-emerald-200/90 bg-emerald-50/60 px-2 py-1.5 text-[12px] text-emerald-900">
                    <CheckCircleOutlined />
                    <span>
                      您已认领，<strong>排他处理</strong>：推荐动作已全部解锁（除他人锁定场景）。
                    </span>
                  </div>
                ) : null}

                {/* 第一行：告警级别 + 类型 + 是否已认领 */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base" style={{ color: levelCfg.strip }}>
                    {levelCfg.icon}
                  </span>
                  <Tag color={levelCfg.riskColor} className="m-0 text-[12px]">
                    {levelCfg.riskTag}
                  </Tag>
                  <Tag
                    color={item.type === "psi_drift" ? "purple" : undefined}
                    className={`m-0 text-[12px] ${item.type === "psi_drift" ? "" : "border-primary/30 text-primary-deep"}`}
                  >
                    {actionCfg.typeLabel}
                  </Tag>
                  {wf === "claimed" ? (
                    <Tag color="processing" className="m-0 text-[12px]">
                      已认领 · {claimById[item.id] ?? dutyName}
                    </Tag>
                  ) : wf === "snoozed" ? (
                    <Tag icon={<ClockCircleOutlined />} color="warning" className="m-0 text-[12px]">
                      已稍后
                    </Tag>
                  ) : (
                    <Tag color="error" className="m-0 text-[12px]">
                      待认领
                    </Tag>
                  )}
                </div>

                {/* 告警标题 */}
                <Text strong className="text-[16px] leading-snug text-text-primary block mt-2">
                  {item.title}
                </Text>

                {/* 第二行：一句话结论 */}
                <Text className="text-[13px] leading-relaxed text-text-primary block mt-1.5">
                  {item.conclusionLine ?? item.subtitle ?? item.description}
                </Text>

                {/* 第三行：影响量化（含影响范围 + 金额/笔数） */}
                <div className="mt-2 rounded-md border border-amber-200/90 bg-amber-50/70 px-2.5 py-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Text strong className="text-[12px] text-amber-950/90 m-0">
                      影响量化
                    </Text>
                    <Text type="secondary" className="text-[11px] m-0">
                      影响范围：{impactScopeText(item)}
                    </Text>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-text-primary">
                    {item.impact?.amountWan != null && item.impact.amountWan !== "" ? (
                      <span>
                        金额约 <strong>{item.impact.amountWan}</strong> 万
                      </span>
                    ) : null}
                    {item.impact?.applications != null ? (
                      <span>
                        进件{" "}
                        <strong>
                          {typeof item.impact.applications === "number"
                            ? item.impact.applications.toLocaleString()
                            : item.impact.applications}
                        </strong>{" "}
                        笔
                      </span>
                    ) : null}
                    {item.impact?.momentum ? (
                      <Text type="secondary" className="text-[12px] m-0">
                        {item.impact.momentum}
                      </Text>
                    ) : null}
                    {(() => {
                      const im = item.impact;
                      const hasAmt = im != null && im.amountWan != null && im.amountWan !== "";
                      const hasApps = im != null && im.applications != null;
                      if (!hasAmt && !hasApps) {
                        return (
                          <Text type="secondary" className="text-[12px] m-0">
                            金额/笔数待接口回填
                          </Text>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* 必备字段：持续 / 首触 / 责任人 / 上次同类 */}
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[12px]">
                  <div className="rounded border border-border-soft bg-[#faf8f4]/80 px-2 py-1.5">
                    <Text type="secondary" className="text-[11px] block">
                      持续时长 · SLA
                    </Text>
                    <div className="mt-0.5">{renderSlaLine(item, actionCfg.slaBudgetMin, tick)}</div>
                  </div>
                  <div className="rounded border border-border-soft bg-[#faf8f4]/80 px-2 py-1.5">
                    <Text type="secondary" className="text-[11px] block">
                      首次触发时间
                    </Text>
                    <Text className="text-[12px] text-text-primary block mt-0.5 leading-snug">
                      {item.firstTriggeredDisplay ?? fmtCN(item.timestamp)}
                    </Text>
                  </div>
                  <div className="rounded border border-border-soft bg-[#faf8f4]/80 px-2 py-1.5">
                    <Text type="secondary" className="text-[11px] block">
                      当前责任人 / 认领
                    </Text>
                    <Text className="text-[12px] text-text-primary block mt-0.5 font-medium">{ownerLabel(item, wf)}</Text>
                  </div>
                  <div className="rounded border border-border-soft bg-[#faf8f4]/80 px-2 py-1.5 sm:col-span-2 lg:col-span-1">
                    <Text type="secondary" className="text-[11px] block">
                      上次同类处置摘要
                    </Text>
                    <Text className="text-[12px] text-text-primary block mt-0.5 leading-snug line-clamp-2" title={lastSimilarSummary(item)}>
                      {lastSimilarSummary(item)}
                    </Text>
                  </div>
                </div>

                {/* 第四行：推荐动作 */}
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border-soft pt-3">
                  <Text type="secondary" className="text-[11px] w-full sm:w-auto sm:mr-1">
                    推荐动作
                  </Text>
                  <Space wrap size={[8, 8]} className="!gap-y-2">
                    {wf === "unread" ? (
                      <Button type="primary" size="small" onClick={() => claimItem(item.id)}>
                        认领
                      </Button>
                    ) : claimedOther ? (
                      <Tooltip title="需原认领人释放或值班长转派">
                        <Button size="small" disabled>
                          认领不可用
                        </Button>
                      </Tooltip>
                    ) : (
                      <Button size="small" disabled className="border-emerald-300 text-emerald-800">
                        已认领 · {claimById[item.id] ?? dutyName}
                      </Button>
                    )}
                    {canSnooze ? (
                      <Button
                        size="small"
                        onClick={() => {
                          setWorkflowById((m) => ({ ...m, [item.id]: "snoozed" }));
                          onSnoozeToQueue?.(item);
                        }}
                      >
                        稍后处理
                      </Button>
                    ) : null}
                    <Tooltip title={primaryDisabled ? primaryReason : undefined}>
                      <Button
                        size="small"
                        type="primary"
                        className="glass-btn-primary"
                        disabled={primaryDisabled}
                        onClick={() => handleAction(item.id, primaryActionKey)}
                      >
                        {primaryActionLabel}
                      </Button>
                    </Tooltip>
                    <Button size="small" onClick={() => handleAction(item.id, graphAction)}>
                      {graphLabel}
                    </Button>
                    <Button size="small" disabled={claimedOther} onClick={() => onAction?.(item.id, "转策略排查")}>
                      转策略排查
                    </Button>
                    <Button size="small" disabled={claimedOther} onClick={() => onAction?.(item.id, "转人工复核")}>
                      转人工复核
                    </Button>
                    <Button size="small" danger type="text" disabled={!canDispose} className="!px-2" onClick={() => {
                      setWorkflowById((m) => ({ ...m, [item.id]: "closed" }));
                      acknowledgeAlert(item.id);
                      onAction?.(item.id, "忽略并记录原因");
                    }}>
                      忽略并记录原因
                    </Button>
                    <Button
                      type="default"
                      size="small"
                      icon={expanded ? <UpOutlined /> : <DownOutlined />}
                      onClick={() => toggleExpand(item.id)}
                    >
                      {expanded ? "收起佐证" : "展开佐证"}
                    </Button>
                  </Space>
                </div>

                {expanded && (
                  <div className="mt-3 space-y-3 rounded-md bg-[#faf8f4] border border-[#ebe6dc] px-3 py-3">
                    {item.recurrence ? (
                      <div className="rounded border border-[#e0d8cc] bg-white/90 px-3 py-2">
                        <Text strong className="text-[12px] text-text-primary block mb-1">
                          上次同类怎么处理的
                        </Text>
                        <div className="text-[13px] text-text-primary leading-relaxed">
                          近 30 日同类第 <strong>{item.recurrence.timesIn30d}</strong> 次
                          {item.recurrence.lastOccurredAt && item.recurrence.lastOccurredAt !== "—" ? (
                            <>
                              ；上次出现在 <strong>{item.recurrence.lastOccurredAt}</strong>
                            </>
                          ) : null}
                          {item.recurrence.lastResolutionSummary && item.recurrence.lastResolutionSummary !== "—" ? (
                            <>
                              。处置摘要：<strong>{item.recurrence.lastResolutionSummary}</strong>
                            </>
                          ) : (
                            <>。尚无历史闭环记录（首次或新类型）。</>
                          )}
                        </div>
                        <Button type="link" size="small" className="!px-0 mt-1 h-auto" onClick={() => onAction?.(item.id, "查看同类历史工单")}>
                          查看同类历史工单
                        </Button>
                      </div>
                    ) : null}

                    {item.evidenceRows && item.evidenceRows.length > 0 ? (
                      <div>
                        <Text strong className="text-[12px] text-text-primary block mb-2">
                          数据佐证（快速判断：数据问题 / 误杀 / 欺诈外溢）
                        </Text>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.evidenceRows.map((row) => (
                            <div key={`${item.id}-ev-${row.label}`} className="rounded border border-[#e8e0d4] bg-white/80 px-2.5 py-2">
                              <Text type="secondary" className="text-[11px] block">
                                {row.label}
                              </Text>
                              <Text className="text-[14px] font-medium tabular-nums">{row.value}</Text>
                              {row.hint ? (
                                <Text type="secondary" className="text-[11px] block mt-0.5">
                                  {row.hint}
                                </Text>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {pairs.length > 0 ? (
                      <>
                        <Divider className="my-1" plain>
                          <Text type="secondary" className="text-[11px]">
                            明细字段
                          </Text>
                        </Divider>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2">
                          {pairs.map((cell) => (
                            <div key={`${item.id}-${cell.label}`}>
                              <Text type="secondary" className="text-[12px] block">
                                {cell.label}
                              </Text>
                              <Text className="text-[13px]">{cell.value}</Text>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}

                    <div className="flex flex-col gap-2 border-t border-[#ebe6dc] pt-3">
                      <Text type="secondary" className="text-[11px] block">
                        并行处置动作（认领后可用）
                      </Text>
                      <Space wrap size={[8, 8]}>
                        <Button
                          size="small"
                          icon={<StopOutlined />}
                          disabled={!canDispose}
                          onClick={() => onAction?.(item.id, "规则暂停")}
                        >
                          规则暂停
                        </Button>
                        <Button
                          size="small"
                          icon={<DatabaseOutlined />}
                          disabled={!canDispose}
                          onClick={() => onAction?.(item.id, "拉取样数据")}
                        >
                          拉取样数据
                        </Button>
                        <Button
                          size="small"
                          icon={<ThunderboltOutlined />}
                          onClick={() => onAction?.(item.id, "申请协助转派")}
                        >
                          申请协助转派
                        </Button>
                        <Button
                          type="link"
                          size="small"
                          className="px-0"
                          onClick={() => handleAction(item.id, actionCfg.secondary ?? "查看详情")}
                        >
                          {item.type === "gang"
                            ? "查看关联图谱"
                            : actionCfg.secondary === "查看渠道拆解"
                              ? "查看渠道拆解"
                              : "查看详情"}
                        </Button>
                        <Button type="link" size="small" className="px-0" disabled={!canDispose} onClick={() => onAction?.(item.id, "加入黑名单")}>
                          加入黑名单
                        </Button>
                      </Space>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-[#ebe6dc] pt-2">
                      <Button
                        type="default"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        disabled={!canDispose}
                        onClick={() => {
                          setWorkflowById((m) => ({ ...m, [item.id]: "closed" }));
                          acknowledgeAlert(item.id);
                          void message.success("已关闭：处置结果已记录（前端状态，接入工单后写回 CMDB）");
                          onAction?.(item.id, "处置完成关闭");
                        }}
                      >
                        记录处置并关闭
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="py-10 text-center text-text-muted text-[13px]">当前筛选下无异动，或已全部关闭</div>
        )}
      </div>
    </section>
  );
}
