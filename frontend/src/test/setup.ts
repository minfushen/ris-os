import "@testing-library/jest-dom";
import { server } from "./mocks/server";

// ─── jsdom 兼容性补丁 ─────────────────────────────────────────────────────────

// 1. 修复 Ant Design 5 复杂 CSS 选择器在 jsdom/nwsapi 里崩溃的问题
// insertRule 层面的 mock
const originalInsertRule = CSSStyleSheet.prototype.insertRule;
CSSStyleSheet.prototype.insertRule = function (rule: string, index?: number) {
  try {
    return originalInsertRule.call(this, rule, index);
  } catch {
    return 0;
  }
};

// querySelector/querySelectorAll 层面的 mock（nwsapi 不支持某些 :is() 选择器）
const originalQuerySelector = Element.prototype.querySelector;
Element.prototype.querySelector = function (selector: string) {
  try {
    return originalQuerySelector.call(this, selector);
  } catch {
    return null;
  }
};

const originalQuerySelectorAll = Element.prototype.querySelectorAll;
Element.prototype.querySelectorAll = function (selector: string) {
  try {
    return originalQuerySelectorAll.call(this, selector);
  } catch {
    return document.createDocumentFragment().querySelectorAll("*");
  }
};

const originalDocQuerySelector = Document.prototype.querySelector;
Document.prototype.querySelector = function (selector: string) {
  try {
    return originalDocQuerySelector.call(this, selector);
  } catch {
    return null;
  }
};

const originalDocQuerySelectorAll = Document.prototype.querySelectorAll;
Document.prototype.querySelectorAll = function (selector: string) {
  try {
    return originalDocQuerySelectorAll.call(this, selector);
  } catch {
    return document.createDocumentFragment().querySelectorAll("*");
  }
};

// 2. 修复 Ant Design 响应式组件（Descriptions、Grid）依赖 window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// 3. 修复 rc-table / Ant Design Table 依赖 window.getComputedStyle 的噪音
// jsdom 对伪元素参数（pseudoElt）的 getComputedStyle 会打印 "Not implemented" 警告。
// 同时过滤 React Router v6 的 v7 future flag 警告（测试用 MemoryRouter，无法通过
// router 配置消除，过滤是最小侵入方案）。
const _origConsoleError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  if (msg.includes("Not implemented: window.getComputedStyle")) return;
  _origConsoleError(...args);
};

const _origConsoleWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  // React Router v6 → v7 future flag 警告，测试环境无法通过 router 配置消除
  if (msg.includes("React Router Future Flag Warning")) return;
  _origConsoleWarn(...args);
};

// 同时用安全封装保底：先尝试原生，失败时返回最小可用对象。
const _originalGetComputedStyle = window.getComputedStyle.bind(window);
Object.defineProperty(window, "getComputedStyle", {
  writable: true,
  value: (el: Element, pseudoElt?: string | null) => {
    try {
      return _originalGetComputedStyle(el, pseudoElt ?? undefined);
    } catch {
      return {
        getPropertyValue: () => "",
        overflow: "visible",
        overflowX: "visible",
        overflowY: "visible",
        width: "0px",
        height: "0px",
      } as unknown as CSSStyleDeclaration;
    }
  },
});

// 4. 修复 Ant Design Statistic/Card 依赖 ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// ─── MSW ─────────────────────────────────────────────────────────────────────

// 启动 MSW 拦截（仅用于不使用 vi.mock 的测试）
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
