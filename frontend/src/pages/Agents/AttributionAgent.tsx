import AgentPageShell from "./AgentPageShell";

export default function AttributionAgent() {
  return (
    <AgentPageShell
      spec={{
        title: "预警归因 Agent",
        subtitle: "把多源风险信号自动组织成可解释证据链，辅助 RM 快速理解红黄灯原因",
        scenario: "服务于预警大盘和预警核查工作台，负责把命中规则、客户画像、外部风险事件和历史行为整合成一段可审计的归因说明。",
        inputData: [
          "命中规则、模型分、红黄蓝灯等级",
          "司法、工商、税务、征信、还款行为和资金流特征",
          "客户历史预警、核查结论与处置记录",
          "同业/行业风险模式库中的相似案例",
        ],
        reasoningSteps: [
          "识别本次预警触发点和最近 30 天新增异常。",
          "按司法、经营、资金、征信维度聚合证据。",
          "对比历史行为和行业基线，判断风险主因。",
          "生成可追溯摘要，并标记建议核查方向。",
        ],
        outputs: ["风险归因摘要", "证据链清单", "核查重点建议", "可引用的客户经理说明"],
        boundaries: ["不自动调整客户风险等级", "不自动触达客户", "不替代 RM 最终核查结论"],
        metrics: [
          { label: "归因生成耗时", value: "18s", note: "P95 演示值" },
          { label: "证据覆盖率", value: "92%", note: "关键数据源已命中" },
          { label: "人工采纳率", value: "76%", note: "近 7 日 RM 采纳" },
          { label: "需人工复核", value: "24%", note: "低置信或缺数样本" },
        ],
        sample: {
          title: "示例归因",
          content:
            "XX科技有限公司触发红灯预警，主因是新增被执行记录与近 14 日资金流出异常叠加；税报连续性未见明显异常。建议优先核实涉诉金额、真实经营状态和近 1 个月回款来源。",
        },
      }}
    />
  );
}
