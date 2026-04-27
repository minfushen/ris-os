import AgentPageShell from "./AgentPageShell";

export default function ScriptComplianceAgent() {
  return (
    <AgentPageShell
      spec={{
        title: "话术合规 Agent",
        subtitle: "面向催收作业推荐场景化话术，并对不合规表达进行预审和替换建议",
        scenario: "服务于催收作业和催收话术库，负责根据客户分层推荐话术，同时检查威胁、诱导、隐私泄露等表达风险。",
        inputData: [
          "客户 DPD、产品线、历史触达和承诺还款情况",
          "催收话术库、合规禁用词、地区监管要求",
          "客户风险等级和敏感标签",
          "过往触达结果与投诉/拒接记录",
        ],
        reasoningSteps: [
          "识别客户逾期阶段和可用触达渠道。",
          "匹配话术模板，并根据客户画像改写语气。",
          "扫描威胁、夸大后果、第三方泄露和诱导承诺风险。",
          "输出可用话术、风险提示和替代表达。",
        ],
        outputs: ["推荐话术", "合规风险标记", "替代表达建议", "触达注意事项"],
        boundaries: ["不自动外呼或发短信", "不绕过人工确认", "不生成超出合规边界的承诺措辞"],
        metrics: [
          { label: "话术命中率", value: "88%", note: "可匹配模板" },
          { label: "合规拦截", value: "31", note: "今日风险表达" },
          { label: "人工采用", value: "79%", note: "催收员确认使用" },
          { label: "投诉风险", value: "低", note: "演示评分" },
        ],
        sample: {
          title: "示例合规改写",
          content:
            "原话术包含“再不还款将立即通知家人”的第三方施压风险。Agent 建议改为：为避免账户状态继续恶化，请您在今天 18:00 前确认还款安排或说明暂时困难，我们会按流程记录并协助申请合理方案。",
        },
      }}
    />
  );
}
