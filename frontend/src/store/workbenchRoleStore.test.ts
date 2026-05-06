import { describe, it, expect, beforeEach } from "vitest";
import { useWorkbenchRoleStore, type WorkbenchRole } from "./workbenchRoleStore";

describe("workbenchRoleStore", () => {
  beforeEach(() => {
    useWorkbenchRoleStore.setState({ role: "ops" });
    localStorage.clear();
  });

  it("默认角色为 ops", () => {
    expect(useWorkbenchRoleStore.getState().role).toBe("ops");
  });

  it("setRole 切换角色后状态更新", () => {
    useWorkbenchRoleStore.getState().setRole("strategy");
    expect(useWorkbenchRoleStore.getState().role).toBe("strategy");
  });

  it("4 个角色枚举值均合法", () => {
    const validRoles: WorkbenchRole[] = ["strategy", "qa", "ops", "manager"];
    for (const role of validRoles) {
      useWorkbenchRoleStore.getState().setRole(role);
      expect(useWorkbenchRoleStore.getState().role).toBe(role);
    }
  });
});
