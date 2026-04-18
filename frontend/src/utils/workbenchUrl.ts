/** 子模块面包屑「工作台」回跳时恢复的查询串（与首页工作项筛选同步） */
export const WORKBENCH_RETURN_QS_KEY = "fk.workbench.return.qs";

export function writeWorkbenchReturnQs(searchString: string): void {
  try {
    if (!searchString || searchString === "?") {
      sessionStorage.removeItem(WORKBENCH_RETURN_QS_KEY);
      return;
    }
    const normalized = searchString.startsWith("?") ? searchString.slice(1) : searchString;
    sessionStorage.setItem(WORKBENCH_RETURN_QS_KEY, normalized);
  } catch {
    /* ignore quota / private mode */
  }
}

/** 返回带 `?` 前缀的查询串，若无则空字符串 */
export function readWorkbenchReturnQs(): string {
  try {
    const raw = sessionStorage.getItem(WORKBENCH_RETURN_QS_KEY);
    if (!raw) return "";
    return raw.startsWith("?") ? raw : `?${raw}`;
  } catch {
    return "";
  }
}
