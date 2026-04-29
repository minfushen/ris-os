import { create } from "zustand";
import { persist } from "zustand/middleware";

/** 演示角色 — 对应三类真实业务岗位 */
export type DemoRole = "relationship_manager" | "risk_modeler" | "strategy_approver";

export interface DemoRoleMeta {
  key: DemoRole;
  label: string;
  personName: string;
  roleTitle: string;
  color: string;
}

export const DEMO_ROLES: DemoRoleMeta[] = [
  { key: "relationship_manager", label: "客户经理", personName: "张明", roleTitle: "RM001 · 对公客户经理", color: "#1677ff" },
  { key: "risk_modeler", label: "风控建模师", personName: "张三", roleTitle: "风控部 · 策略建模", color: "#52c41a" },
  { key: "strategy_approver", label: "策略审批员", personName: "王五", roleTitle: "授信政策室 · 策略审批", color: "#fa8c16" },
];

const LS_DISPLAY_NAME = "ris_duty_display_name";
const LS_ROLE_TITLE = "ris_duty_role_title";

interface DemoRoleState {
  role: DemoRole;
  setRole: (role: DemoRole) => void;
}

export const useDemoRoleStore = create<DemoRoleState>()(
  persist(
    (set) => ({
      role: "relationship_manager",
      setRole: (role) => {
        const meta = DEMO_ROLES.find((r) => r.key === role);
        if (meta) {
          try {
            localStorage.setItem(LS_DISPLAY_NAME, meta.personName);
            localStorage.setItem(LS_ROLE_TITLE, meta.roleTitle);
          } catch { /* noop */ }
        }
        set({ role });
      },
    }),
    { name: "fk-demo-role" }
  )
);
