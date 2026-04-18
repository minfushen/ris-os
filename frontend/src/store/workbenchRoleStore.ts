import { create } from "zustand";
import { persist } from "zustand/middleware";

/** 快捷入口与默认视角的角色（千人千面） */
export type WorkbenchRole = "strategy" | "qa" | "ops" | "manager";

export const WORKBENCH_ROLE_LABELS: Record<WorkbenchRole, string> = {
  strategy: "策略岗",
  qa: "质检岗",
  ops: "运营/信审",
  manager: "管理视图",
};

interface WorkbenchRoleState {
  role: WorkbenchRole;
  setRole: (role: WorkbenchRole) => void;
}

export const useWorkbenchRoleStore = create<WorkbenchRoleState>()(
  persist(
    (set) => ({
      role: "ops",
      setRole: (role) => set({ role }),
    }),
    { name: "fk-workbench-role" }
  )
);
