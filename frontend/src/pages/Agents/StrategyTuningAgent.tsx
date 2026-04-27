import AgentPageShell from "./AgentPageShell";

export default function StrategyTuningAgent() {
  return (
    <AgentPageShell
      spec={{
        title: "策略调优 Agent",
        subtitle: "从误报、漏报、提前天数和处置反馈中发现规则与模型优化机会",
        scenario: "服务于策略与模型模块，负责把监控指标、仿真回溯、发布灰度和调优案例串成策略迭代建议。",
        inputData: [
          "策略效果追踪、误报率、有效率、提前预警天数",
          "仿真回溯任务、灰度发布指标和回滚记录",
          "行业阈值矩阵、规则版本、模型版本库",
          "处置结论、标注飞轮和规则调优案例",
        ],
        reasoningSteps: [
          "识别异常指标：误报升高、提前天数下降或模型漂移。",
          "定位影响最大的规则、行业、产品线和客户分层。",
          "生成阈值调整或模型重训候选方案。",
          "建议发起仿真回溯，并进入发布审批流程。",
        ],
        outputs: ["调优机会清单", "建议阈值变化", "仿真回溯任务草案", "发布审批影响摘要"],
        boundaries: ["不自动修改生产规则", "不自动发布策略", "不自动替换模型版本"],
        metrics: [
          { label: "发现调优机会", value: "17", note: "近 30 日" },
          { label: "仿真转化率", value: "64%", note: "建议进入回测" },
          { label: "误报改善预估", value: "-3.8ppt", note: "Top 5 规则" },
          { label: "需人工审批", value: "100%", note: "生产变更必须审批" },
        ],
        sample: {
          title: "示例调优建议",
          content:
            "税易贷税报断档规则近 30 日误报率 34%，高于目标线 25%，主要集中在住宿餐饮行业。建议将该行业断档阈值从 30 天放宽到 45 天，并发起单规则仿真回溯。",
        },
      }}
    />
  );
}
