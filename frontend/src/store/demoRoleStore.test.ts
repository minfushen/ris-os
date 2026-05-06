import { describe, it, expect, beforeEach } from "vitest";
import { useDemoRoleStore, type DemoRole } from "./demoRoleStore";

describe("demoRoleStore", () => {
  beforeEach(() => {
    // 重置为默认角色
    useDemoRoleStore.setState({ role: "relationship_manager" });
    localStorage.clear();
  });

  it("默认角色为 relationship_manager", () => {
    const { role } = useDemoRoleStore.getState();
    expect(role).toBe("relationship_manager");
  });

  it("setRole 切换角色后状态更新", () => {
    useDemoRoleStore.getState().setRole("risk_modeler");
    expect(useDemoRoleStore.getState().role).toBe("risk_modeler");
  });

  it("setRole 切换到 strategy_approver 后状态更新", () => {
    useDemoRoleStore.getState().setRole("strategy_approver");
    expect(useDemoRoleStore.getState().role).toBe("strategy_approver");
  });

  it("setRole 同步写入 localStorage（personName + roleTitle）", () => {
    useDemoRoleStore.getState().setRole("risk_modeler");
    expect(localStorage.getItem("ris_duty_display_name")).toBe("张三");
    expect(localStorage.getItem("ris_duty_role_title")).toBe("风控部 · 策略建模");
  });

  it("3 个角色枚举值均合法", () => {
    const validRoles: DemoRole[] = [
      "relationship_manager",
      "risk_modeler",
      "strategy_approver",
    ];
    for (const role of validRoles) {
      useDemoRoleStore.getState().setRole(role);
      expect(useDemoRoleStore.getState().role).toBe(role);
    }
  });
});
