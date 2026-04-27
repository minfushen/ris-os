/** 演示环境：顶栏与侧栏共用的当前用户展示（可通过 localStorage 覆盖） */
const LS_DISPLAY_NAME = "ris_duty_display_name";
const LS_ROLE_TITLE = "ris_duty_role_title";

export const DEFAULT_SESSION_DISPLAY_NAME = "王五";
export const DEFAULT_SESSION_ROLE_TITLE = "贷后主管";

export function getSessionDisplayName(): string {
  try {
    const v = window.localStorage.getItem(LS_DISPLAY_NAME)?.trim();
    return v || DEFAULT_SESSION_DISPLAY_NAME;
  } catch {
    return DEFAULT_SESSION_DISPLAY_NAME;
  }
}

export function getSessionRoleTitle(): string {
  try {
    const v = window.localStorage.getItem(LS_ROLE_TITLE)?.trim();
    return v || DEFAULT_SESSION_ROLE_TITLE;
  } catch {
    return DEFAULT_SESSION_ROLE_TITLE;
  }
}

export function getSiderDutySubtitle(): string {
  return `UAT · ${getSessionDisplayName()} / ${getSessionRoleTitle()}`;
}
