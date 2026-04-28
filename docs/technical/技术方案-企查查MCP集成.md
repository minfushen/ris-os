# 企查查 MCP 集成技术方案

## 1. MCP 协议介绍

### 1.1 MCP 协议概述

**MCP (Model Context Protocol)** 是一种标准化的协议，用于 AI Agent 与外部工具/数据源的交互。

**核心概念**：
- **Server**：提供工具的服务端（如 qcc-company、qcc-risk）
- **Tool**：具体的工具（如 get_company_registration_info）
- **Resource**：可访问的资源
- **Prompt**：预定义的提示模板

**请求格式**：
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_company_registration_info",
    "arguments": {
      "searchKey": "华为技术有限公司"
    }
  }
}
```

**响应格式**（SSE）：
```
data: {"jsonrpc": "2.0", "id": 1, "result": {...}}
```

### 1.2 企查查 MCP 服务

**4 个服务，65 个工具**：

| 服务 | 工具数量 | 用途 |
|------|---------|------|
| qcc-company | 12 | 企业工商信息 |
| qcc-risk | 34 | 企业风险信息 |
| qcc-operation | 13 | 企业经营信息 |
| qcc-ipr | 6 | 知识产权信息 |

**Base URL**：`https://agent.qcc.com/mcp`

**认证方式**：Bearer Token（API Key）

## 2. 客户端实现

### 2.1 MCP 客户端设计

**文件**：`backend/services/qcc_mcp_client.py`

**核心类**：
```python
class QccMcpClient:
    """企查查 MCP 客户端"""

    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    async def call_tool(
        self,
        server: str,  # company/risk/operation/ipr
        tool_name: str,
        arguments: Dict
    ) -> Dict:
        """调用 MCP 工具"""
        url = f"{self.base_url}/{server}/stream"
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            }
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers=self.headers,
                timeout=10.0
            )
            return self._parse_sse_response(response.text)
```

### 2.2 连接管理

**超时控制**：
```python
timeout = httpx.Timeout(
    connect=5.0,  # 连接超时
    read=10.0,    # 读取超时
    write=5.0,    # 写入超时
    pool=5.0      # 连接池超时
)

async with httpx.AsyncClient(timeout=timeout) as client:
    # ...
```

**重试机制**：
```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10)
)
async def call_tool_with_retry(self, server, tool_name, arguments):
    return await self.call_tool(server, tool_name, arguments)
```

### 2.3 错误处理

**错误类型**：
- **连接错误**：网络问题、服务不可用
- **认证错误**：API Key 无效
- **参数错误**：参数缺失或格式错误
- **业务错误**：企业不存在、数据为空

**错误处理策略**：
```python
try:
    result = await self.call_tool(server, tool_name, arguments)
except httpx.TimeoutException:
    raise McpTimeoutError(f"MCP 调用超时: {tool_name}")
except httpx.HTTPStatusError as e:
    if e.response.status_code == 401:
        raise McpAuthError("API Key 无效")
    elif e.response.status_code == 404:
        raise McpNotFoundError(f"企业不存在: {arguments.get('searchKey')}")
    else:
        raise McpError(f"MCP 调用失败: {e}")
except Exception as e:
    raise McpError(f"未知错误: {e}")
```

## 3. 数据映射

### 3.1 企查查数据结构

**企业工商信息**：
```json
{
  "企业名称": "华为技术有限公司",
  "统一社会信用代码": "91440300123456789X",
  "法定代表人": "任正非",
  "注册资本": "4000000万人民币",
  "成立日期": "1987-09-15",
  "登记机关": "深圳市市场监督管理局",
  "登记状态": "存续（在营、开业、在册）",
  "经营范围": "程控交换机、传输设备...",
  "注册地址": "深圳市龙岗区...",
  "通信地址": "深圳市龙岗区..."
}
```

**风险信息**：
```json
{
  "dishonest": [
    {
      "案号": "(2024)浙01执XXX号",
      "执行法院": "杭州市中级人民法院",
      "立案时间": "2024-01-01",
      "标的额": "80万"
    }
  ],
  "judgment_debtor": [...],
  "high_consumption": [...],
  // ... 其他风险类型
}
```

### 3.2 内部数据模型

**VendorRiskAssessment**：
```python
class VendorRiskAssessment(BaseModel):
    company_name: str
    overall_risk: RiskLevel
    dimensions: Dict[str, DimensionRisk]
    risk_categories: List[RiskCategory]
    evidence_chain: List[EvidenceItem]
    disposition_suggestions: List[DispositionSuggestion]
    assessment_time: str
```

### 3.3 映射规则

**风险等级映射**：
```python
def _map_risk_level(risk_data: Dict) -> RiskLevel:
    """根据风险数据映射风险等级"""

    # CRITICAL: 破产重整、失信信息、被执行人
    if risk_data.get("bankruptcy_reorganization"):
        return RiskLevel.CRITICAL
    if risk_data.get("dishonest"):
        return RiskLevel.CRITICAL
    if risk_data.get("judgment_debtor"):
        return RiskLevel.CRITICAL

    # HIGH: 严重违法、注销备案、股权冻结
    if risk_data.get("serious_violation"):
        return RiskLevel.HIGH
    if risk_data.get("cancellation_filing"):
        return RiskLevel.HIGH
    if risk_data.get("equity_freeze"):
        return RiskLevel.HIGH

    # MEDIUM: 股权出质、欠税、税务异常
    if risk_data.get("equity_pledge"):
        return RiskLevel.MEDIUM
    if risk_data.get("tax_arrears"):
        return RiskLevel.MEDIUM
    if risk_data.get("abnormal_tax"):
        return RiskLevel.MEDIUM

    # LOW: 一般行政处罚
    if risk_data.get("administrative_penalty"):
        return RiskLevel.LOW

    return RiskLevel.LOW
```

**证据链映射**：
```python
def _build_evidence_chain(risk_data: Dict) -> List[EvidenceItem]:
    """构建证据链"""
    evidence_chain = []

    for risk_type, records in risk_data.items():
        if records:
            evidence_chain.append(EvidenceItem(
                data_source=f"企查查-{risk_type}",
                update_time=records[0].get("update_time", "未知"),
                credibility="高",
                content=f"发现 {len(records)} 条{risk_type}记录"
            ))

    return evidence_chain
```

## 4. 性能优化

### 4.1 并发调用

**批量获取风险信息**：
```python
async def _batch_get_risks(self, company_name: str) -> Dict:
    """批量获取18类风险（并发调用）"""

    risk_tools = [
        ("get_dishonest_info", "失信信息"),
        ("get_judgment_debtor_info", "被执行人"),
        ("get_high_consumption_restriction", "限制高消费"),
        # ... 其他风险工具
    ]

    # 并发调用所有风险工具
    tasks = [
        self.call_tool("risk", tool_name, {"searchKey": company_name})
        for tool_name, _ in risk_tools
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # 聚合结果
    risk_data = {}
    for (tool_name, risk_name), result in zip(risk_tools, results):
        if isinstance(result, Exception):
            logger.warning(f"{tool_name} 调用失败: {result}")
            risk_data[risk_name] = []
        else:
            risk_data[risk_name] = result

    return risk_data
```

### 4.2 缓存策略

**内存缓存**（可选）：
```python
from functools import lru_cache
from datetime import datetime, timedelta

class QccMcpClient:
    def __init__(self):
        self._cache = {}
        self._cache_ttl = timedelta(hours=1)

    async def call_tool_with_cache(self, server, tool_name, arguments):
        cache_key = f"{server}:{tool_name}:{arguments}"

        if cache_key in self._cache:
            cached_result, cached_time = self._cache[cache_key]
            if datetime.now() - cached_time < self._cache_ttl:
                return cached_result

        result = await self.call_tool(server, tool_name, arguments)
        self._cache[cache_key] = (result, datetime.now())
        return result
```

### 4.3 超时控制

**全局超时**：
```python
# 整体评估超时：30 秒
OVERALL_TIMEOUT = 30.0

async def assess_vendor_risk(self, company_name: str) -> VendorRiskAssessment:
    try:
        async with asyncio.timeout(OVERALL_TIMEOUT):
            # 执行评估
            ...
    except asyncio.TimeoutError:
        raise McpTimeoutError("企业风险评估超时")
```

**单工具超时**：
```python
# 单个 MCP 工具调用超时：10 秒
TOOL_TIMEOUT = 10.0

async with httpx.AsyncClient(timeout=TOOL_TIMEOUT) as client:
    ...
```

## 5. 安全考虑

### 5.1 API Key 管理

**环境变量**：
```bash
# .env
QCC_MCP_API_KEY=your_api_key_here
QCC_MCP_BASE_URL=https://agent.qcc.com/mcp
```

**加载配置**：
```python
import os
from dotenv import load_dotenv

load_dotenv()

QCC_MCP_API_KEY = os.getenv("QCC_MCP_API_KEY")
QCC_MCP_BASE_URL = os.getenv("QCC_MCP_BASE_URL", "https://agent.qcc.com/mcp")

if not QCC_MCP_API_KEY:
    raise ValueError("QCC_MCP_API_KEY 未配置")
```

### 5.2 数据脱敏

**日志脱敏**：
```python
import logging

def log_sensitive_data(data: str) -> str:
    """脱敏敏感数据"""
    if len(data) <= 4:
        return "***"
    return data[:2] + "***" + data[-2:]

logger.info(f"查询企业: {log_sensitive_data(company_name)}")
```

### 5.3 访问控制

**API 路由保护**（可选）：
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != "valid_token":
        raise HTTPException(status_code=401, detail="Invalid token")
    return credentials

@router.post("/assess-vendor-risk", dependencies=[Depends(verify_token)])
async def assess_vendor_risk(request: AssessVendorRiskRequest):
    ...
```

## 6. 测试策略

### 6.1 单元测试

**MCP 客户端测试**：
```python
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_call_tool():
    client = QccMcpClient("https://test.com", "test_key")

    with patch("httpx.AsyncClient.post") as mock_post:
        mock_post.return_value = AsyncMock(
            text='data: {"result": {"企业名称": "测试公司"}}'
        )

        result = await client.call_tool(
            "company",
            "get_company_registration_info",
            {"searchKey": "测试公司"}
        )

        assert result["企业名称"] == "测试公司"
```

### 6.2 集成测试

**API 端点测试**：
```python
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_assess_vendor_risk():
    response = client.post(
        "/api/qcc/assess-vendor-risk",
        json={"company_name": "华为技术有限公司"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "overall_risk" in data
    assert "dimensions" in data
```

### 6.3 端到端测试

**前端到后端测试**：
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VendorRiskAssessmentAgent from './VendorRiskAssessmentAgent';

test('assesses vendor risk', async () => {
  render(<VendorRiskAssessmentAgent />);

  const input = screen.getByPlaceholderText(/请输入企业名称/);
  const button = screen.getByText(/开始评估/);

  fireEvent.change(input, { target: { value: '华为技术有限公司' } });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(/整体风险评估/)).toBeInTheDocument();
  });
});
```

## 7. 监控与日志

### 7.1 日志记录

**结构化日志**：
```python
import logging
import json

logger = logging.getLogger(__name__)

def log_mcp_call(server, tool_name, arguments, result, duration):
    logger.info(json.dumps({
        "event": "mcp_call",
        "server": server,
        "tool": tool_name,
        "arguments": arguments,
        "result_size": len(str(result)),
        "duration_ms": duration * 1000
    }))
```

### 7.2 性能监控

**指标收集**：
```python
from prometheus_client import Counter, Histogram

mcp_calls_total = Counter(
    'mcp_calls_total',
    'Total MCP tool calls',
    ['server', 'tool_name', 'status']
)

mcp_call_duration = Histogram(
    'mcp_call_duration_seconds',
    'MCP tool call duration',
    ['server', 'tool_name']
)

async def call_tool_with_metrics(self, server, tool_name, arguments):
    start_time = time.time()
    try:
        result = await self.call_tool(server, tool_name, arguments)
        mcp_calls_total.labels(server, tool_name, 'success').inc()
        return result
    except Exception as e:
        mcp_calls_total.labels(server, tool_name, 'error').inc()
        raise
    finally:
        duration = time.time() - start_time
        mcp_call_duration.labels(server, tool_name).observe(duration)
```

## 8. 故障排查

### 8.1 常见问题

**问题 1：API Key 无效**
- 症状：401 认证失败
- 排查：检查环境变量配置
- 解决：确保 API Key 正确且未过期

**问题 2：企业不存在**
- 症状：返回空数据或 404
- 排查：确认企业名称或统一社会信用代码正确
- 解决：提示用户检查输入

**问题 3：超时**
- 症状：请求超时
- 排查：检查网络连接、MCP 服务状态
- 解决：增加超时时间或重试

### 8.2 调试技巧

**启用详细日志**：
```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("qcc_mcp_client")
logger.setLevel(logging.DEBUG)
```

**模拟 MCP 响应**：
```python
# 测试环境使用 Mock 数据
MOCK_COMPANY_DATA = {
    "企业名称": "测试公司",
    "统一社会信用代码": "123456789X",
    # ...
}

if os.getenv("ENV") == "test":
    return MOCK_COMPANY_DATA
```
