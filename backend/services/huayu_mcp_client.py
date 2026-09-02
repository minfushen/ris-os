"""
华宇元典法律智能 MCP 客户端

为预警归因 Agent 提供真实司法数据源（涉诉统计、被执行人、失信被执行等）。
协议：Streamable HTTP MCP（JSON-RPC 2.0），Bearer 认证，无状态模式。
文档：https://open.chineselaw.com/mcp-config
"""

import os
import json
import httpx
from typing import Dict

DEFAULT_BASE_URL = "https://open.chineselaw.com/mcp"


class HuayuMcpClient:
    def __init__(self):
        self.api_key = os.getenv("HUAYU_MCP_API_KEY", "")
        self.base_url = os.getenv("HUAYU_MCP_BASE_URL", DEFAULT_BASE_URL)
        # 未配置 Key 时允许服务正常启动，调用时再给出明确错误（与 QccMcpClient 策略一致）
        self.configured = bool(self.api_key)
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
        }

    async def call_tool(self, server: str, tool_name: str, arguments: Dict) -> Dict:
        """调用元典 MCP 工具，返回业务层 data 字段。"""
        if not self.configured:
            raise Exception(
                "HUAYU_MCP_API_KEY 未配置：请在 backend/.env 中设置元典 API Key 后重启后端"
            )

        url = f"{self.base_url}/{server}/stream"
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {"name": tool_name, "arguments": arguments},
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(url, json=payload, headers=self.headers)
                response.raise_for_status()
                result = response.json()
            except httpx.HTTPStatusError as e:
                raise Exception(f"元典 MCP 调用失败: HTTP {e.response.status_code}")
            except httpx.RequestError as e:
                raise Exception(f"元典 MCP 连接失败: {e}")

        if result.get("error"):
            err = result.get("error") or {}
            raise Exception(f"元典 MCP 工具错误: {err.get('message', '未知错误')}")

        try:
            business = json.loads(result["result"]["content"][0]["text"])
        except Exception:
            raise Exception("元典 MCP 响应解析失败")

        if business.get("code") != 200:
            raise Exception(f"元典 MCP 业务错误: {business.get('message', '未知错误')}")
        return business.get("data")

    async def search_company(self, name: str) -> Dict:
        """按企业名称检索，返回 {id, tyshxydm, company_name}。"""
        data = await self.call_tool(
            "company", "yuandian_rh_enterpriseSearch", {"name": name, "top_k": 1}
        )
        items = data if isinstance(data, list) else []
        if not items:
            raise Exception(f"未检索到企业「{name}」")
        first = items[0]
        return {
            "id": first.get("id"),
            "tyshxydm": first.get("统一社会信用代码"),
            "company_name": first.get("企业名称"),
        }

    async def get_litigation_summary(self, enterprise_id: str) -> Dict:
        """涉诉统计：案件类别 / 案由 / 审判程序 / 结案方式等多维分布。"""
        return await self.call_tool(
            "company", "yuandian_rh_enterpriseWritAgg", {"id": enterprise_id}
        )

    async def get_executed_persons(self, enterprise_id: str) -> Dict:
        """被执行人列表。"""
        return await self.call_tool(
            "company", "yuandian_rh_enterpriseExecutedPerson", {"id": enterprise_id, "pageNo": 1}
        )

    async def get_dishonest_list(self, enterprise_id: str) -> Dict:
        """失信被执行人列表。"""
        return await self.call_tool(
            "company", "yuandian_rh_enterpriseExecutions", {"id": enterprise_id, "pageNo": 1}
        )
