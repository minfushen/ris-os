import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { API_BASE_URL, formatApiError, api } from "./client";
import { ApiError } from "@/types";

// ─── request 构造与错误映射 smoke test ────────────────────────────────────

describe("api/client", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("API_BASE_URL", () => {
    it("默认值为 http://127.0.0.1:8000", () => {
      expect(API_BASE_URL).toBe("http://127.0.0.1:8000");
    });
  });

  describe("formatApiError", () => {
    it("ApiError 404 返回 '资源不存在'", () => {
      const err = new ApiError("not found", 404);
      expect(formatApiError(err)).toBe("资源不存在");
    });

    it("ApiError 非 404 返回原始 message", () => {
      const err = new ApiError("服务异常", 500);
      expect(formatApiError(err)).toBe("服务异常");
    });

    it("非 ApiError 返回通用提示", () => {
      expect(formatApiError(new Error("random"))).toBe("服务暂时不可用");
    });

    it("null/undefined 返回通用提示", () => {
      expect(formatApiError(null)).toBe("服务暂时不可用");
    });
  });

  describe("请求错误映射", () => {
    it("HTTP 非 2xx 抛出 ApiError 并携带 status", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response("Internal Error", { status: 500 })
      );

      await expect(api.getDashboardStats()).rejects.toMatchObject({
        name: "ApiError",
        status: 500,
      });
    });

    it("网络异常抛出 ApiError（非 AbortError）", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

      await expect(api.getDashboardStats()).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe("请求 URL 构造", () => {
    it("listTasks 正确拼接查询参数", async () => {
      const fetchSpy = vi.fn().mockResolvedValue(
        new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } })
      );
      globalThis.fetch = fetchSpy;

      await api.listTasks({ task_type: "review", status: "open" }, 10);

      const calledUrl = (fetchSpy.mock.calls[0] as [string])[0];
      expect(calledUrl).toContain("/tasks?");
      expect(calledUrl).toContain("task_type=review");
      expect(calledUrl).toContain("status=open");
      expect(calledUrl).toContain("limit=10");
    });
  });
});
