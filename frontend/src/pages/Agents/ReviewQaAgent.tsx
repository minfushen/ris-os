import AgentPageShell from "./AgentPageShell";

export default function ReviewQaAgent() {
  return (
    <AgentPageShell
      spec={{
        title: "复盘质检 Agent",
        subtitle: "批量预筛处置记录质量，识别留痕缺失、结论不一致和样本回流价值",
        scenario: "服务于复盘质检和标注飞轮，负责先对处置记录做自动质检，再把高风险样本推给人工复核。",
        inputData: [
          "预警核查记录、催收触达记录和承诺还款结果",
          "SLA、质检规则、处置结论和客户后续表现",
          "话术合规检查结果与投诉反馈",
          "模型训练样本、规则调优案例和风险模式库",
        ],
        reasoningSteps: [
          "检查处置记录是否完整、及时、可追溯。",
          "比对处置结论与证据链是否一致。",
          "识别不合格记录和高价值训练样本。",
          "生成质检建议、整改项和样本回流标签。",
        ],
        outputs: ["质检预筛结果", "整改建议", "样本回流标签", "规则/模型迭代线索"],
        boundaries: ["不自动判定员工绩效", "不直接处罚人员", "不自动修改历史记录"],
        metrics: [
          { label: "预筛记录", value: "436", note: "今日处理" },
          { label: "高风险样本", value: "28", note: "转人工复核" },
          { label: "留痕完整率", value: "91%", note: "近 7 日" },
          { label: "回流样本", value: "64", note: "进入标注飞轮" },
        ],
        sample: {
          title: "示例质检结论",
          content:
            "QA-2401 中 3 条红灯预警记录存在“结论为正常但未上传回访依据”的留痕缺失，建议转人工复核；其中 2 条客户后续 30 天出现 M1，建议回流为规则调优样本。",
        },
      }}
    />
  );
}
