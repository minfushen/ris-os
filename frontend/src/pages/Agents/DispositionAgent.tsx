import AgentPageShell from "./AgentPageShell";

export default function DispositionAgent() {
  return (
    <AgentPageShell
      spec={{
        title: "处置建议 Agent",
        subtitle: "根据风险等级、客户画像和处置 SOP 推荐下一步动作，由人工确认后进入闭环",
        scenario: "服务于处置闭环，负责把预警归因结果转成可执行的核查、缓释、升级、观察或转催收建议。",
        inputData: [
          "预警等级、命中规则、归因 Agent 输出",
          "客户产品线、余额、账龄、历史承诺和触达记录",
          "处置 SOP、SLA、分支行权限和升级规则",
          "复盘质检中沉淀的高质量处置样例",
        ],
        reasoningSteps: [
          "判断风险是否属于早期预警、逾期催收或人工复核场景。",
          "匹配对应 SOP 与 SLA，并识别必要补充材料。",
          "评估动作影响和客户触达敏感度。",
          "输出建议动作、依据和人工确认项。",
        ],
        outputs: ["推荐处置动作", "SLA 和责任人建议", "需补充材料清单", "升级/观察/转催收判断"],
        boundaries: ["不自动关闭预警", "不自动升级重大风险", "不自动发起外部触达"],
        metrics: [
          { label: "建议生成量", value: "128", note: "今日演示样本" },
          { label: "SLA 命中率", value: "89%", note: "建议动作覆盖" },
          { label: "人工采纳率", value: "71%", note: "核查人员确认" },
          { label: "拦截高风险", value: "9", note: "需主管复核" },
        ],
        sample: {
          title: "示例处置建议",
          content:
            "建议动作：客户回访 + 补充近 3 个月经营流水。原因：司法风险新近发生但尚未逾期，资金流异常需要核实真实经营压力。建议 4 小时内首次触达，24 小时内补充材料。",
        },
      }}
    />
  );
}
