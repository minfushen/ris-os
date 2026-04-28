# 企业风险评估 API 文档

## 1. 概述

### 1.1 基础 URL

```
开发环境: http://127.0.0.1:8000
生产环境: https://api.your-domain.com
```

### 1.2 认证方式

当前版本无需认证（演示环境）。

生产环境建议使用 Bearer Token 认证：
```http
Authorization: Bearer <your_token>
```

### 1.3 请求格式

- **Content-Type**: `application/json`
- **编码**: `UTF-8`

### 1.4 响应格式

**成功响应**：
```json
{
  "company_name": "华为技术有限公司",
  "overall_risk": "LOW",
  // ... 其他字段
}
```

**错误响应**：
```json
{
  "detail": "企业风险评估失败: API Key 无效"
}
```

## 2. 接口列表

### 2.1 企业风险评估

**POST** `/api/qcc/assess-vendor-risk`

企业风险评估 Agent 核心接口，执行 9 维度风险评估和 18 类风险排查。

#### 请求参数

```json
{
  "company_name": "华为技术有限公司",
  "dimensions": ["financial_risk", "compliance_risk"]  // 可选
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| company_name | string | 是 | 企业名称或统一社会信用代码 |
| dimensions | array | 否 | 指定评估维度（默认 9 维度全量） |

#### 响应格式

```json
{
  "company_name": "华为技术有限公司",
  "overall_risk": "LOW",
  "dimensions": {
    "commercial_risk": {
      "level": "LOW",
      "score": 15.2,
      "key_findings": ["商业信誉良好"],
      "evidence": ["无重大合同纠纷"]
    },
    "operational_risk": {
      "level": "LOW",
      "score": 12.5,
      "key_findings": ["经营状况正常"],
      "evidence": ["无经营异常记录"]
    },
    "financial_risk": {
      "level": "LOW",
      "score": 18.3,
      "key_findings": ["财务状况良好"],
      "evidence": ["2024年财报显示营收增长20%"]
    },
    "compliance_risk": {
      "level": "LOW",
      "score": 10.0,
      "key_findings": ["合规记录良好"],
      "evidence": ["无行政处罚记录"]
    },
    "strategic_risk": {
      "level": "LOW",
      "score": 20.0,
      "key_findings": ["客户分布合理"],
      "evidence": ["客户集中度适中"]
    },
    "geopolitical_risk": {
      "level": "LOW",
      "score": 15.0,
      "key_findings": ["区域风险较低"],
      "evidence": ["经营区域稳定"]
    },
    "capacity_risk": {
      "level": "LOW",
      "score": 12.0,
      "key_findings": ["资质齐全"],
      "evidence": ["拥有ISO9001认证"]
    },
    "stability_risk": {
      "level": "LOW",
      "score": 18.5,
      "key_findings": ["股权结构稳定"],
      "evidence": ["近一年无重大股权变更"]
    },
    "business_health_risk": {
      "level": "LOW",
      "score": 16.0,
      "key_findings": ["业务活跃"],
      "evidence": ["近期中标多个项目"]
    }
  },
  "risk_categories": [
    {
      "category": "财务风险",
      "level": "LOW",
      "description": "财务状况良好",
      "evidence": "2024年财报显示营收增长20%",
      "impact": "对供应链影响较小",
      "suggestion": "定期跟踪财务状况",
      "response_time": "< 1 周"
    }
  ],
  "evidence_chain": [
    {
      "data_source": "企查查-财务数据",
      "update_time": "2024-12-31",
      "credibility": "高",
      "content": "2024年财报显示营收增长20%"
    }
  ],
  "disposition_suggestions": [
    {
      "action": "定期跟踪财务状况",
      "sla": "< 1 周",
      "responsible_person": "风控经理",
      "materials": ["最新财报", "银行流水"]
    }
  ],
  "assessment_time": "2026-04-27T10:30:00"
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| company_name | string | 企业名称 |
| overall_risk | string | 整体风险等级（CRITICAL/HIGH/MEDIUM/LOW） |
| dimensions | object | 9 维度评估详情 |
| risk_categories | array | 18 类风险清单 |
| evidence_chain | array | 证据链 |
| disposition_suggestions | array | 处置建议 |
| assessment_time | string | 评估时间（ISO 8601 格式） |

#### 示例

**请求**：
```bash
curl -X POST http://127.0.0.1:8000/api/qcc/assess-vendor-risk \
  -H "Content-Type: application/json" \
  -d '{"company_name": "华为技术有限公司"}'
```

**响应**：
```json
{
  "company_name": "华为技术有限公司",
  "overall_risk": "LOW",
  // ... 其他字段
}
```

### 2.2 获取企业工商信息

**GET** `/api/qcc/company/{company_name}`

从企查查 MCP 获取企业工商信息（名称、法人、注册资本、经营范围等）。

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| company_name | string | 是 | 企业名称或统一社会信用代码 |

#### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| search_key | string | 否 | 搜索关键字（可选） |

#### 响应格式

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

#### 示例

**请求**：
```bash
curl http://127.0.0.1:8000/api/qcc/company/华为技术有限公司
```

**响应**：
```json
{
  "企业名称": "华为技术有限公司",
  // ... 其他字段
}
```

### 2.3 获取企业风险信息

**GET** `/api/qcc/risk/{company_name}`

从企查查 MCP 获取企业风险信息（失信、被执行人、经营异常等 18 类风险）。

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| company_name | string | 是 | 企业名称或统一社会信用代码 |

#### 响应格式

```json
{
  "dishonest": [],
  "judgment_debtor": [],
  "high_consumption": [],
  "abnormal_operation": [],
  "serious_violation": [],
  "cancellation_filing": [],
  "equity_freeze": [],
  "equity_pledge": [],
  "chattel_mortgage": [],
  "tax_arrears": [],
  "abnormal_tax": [],
  "final_case": [],
  "administrative_penalty": [],
  "environmental_penalty": [],
  "bankruptcy_reorganization": [],
  "judicial_auction": []
}
```

#### 风险类型说明

| 字段 | 说明 |
|------|------|
| dishonest | 失信信息（失信被执行人） |
| judgment_debtor | 被执行人 |
| high_consumption | 限制高消费 |
| abnormal_operation | 经营异常 |
| serious_violation | 严重违法 |
| cancellation_filing | 注销备案 |
| equity_freeze | 股权冻结 |
| equity_pledge | 股权出质 |
| chattel_mortgage | 动产抵押 |
| tax_arrears | 欠税公告 |
| abnormal_tax | 税务异常 |
| final_case | 终本案件 |
| administrative_penalty | 行政处罚 |
| environmental_penalty | 环保处罚 |
| bankruptcy_reorganization | 破产重整 |
| judicial_auction | 司法拍卖 |

#### 示例

**请求**：
```bash
curl http://127.0.0.1:8000/api/qcc/risk/华为技术有限公司
```

**响应**：
```json
{
  "dishonest": [],
  // ... 其他字段
}
```

### 2.4 获取企业经营信息

**GET** `/api/qcc/operation/{company_name}`

从企查查 MCP 获取企业经营信息（资质证书、行政许可、招投标、信用评级等）。

#### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| company_name | string | 是 | 企业名称或统一社会信用代码 |

#### 响应格式

```json
{
  "qualifications": [],
  "administrative_licenses": [],
  "bidding_info": [],
  "credit_rating": [],
  "spot_check_records": [],
  "financing_records": []
}
```

#### 经营信息类型说明

| 字段 | 说明 |
|------|------|
| qualifications | 资质证书 |
| administrative_licenses | 行政许可 |
| bidding_info | 招投标信息 |
| credit_rating | 信用评级 |
| spot_check_records | 抽查检查记录 |
| financing_records | 融资记录 |

#### 示例

**请求**：
```bash
curl http://127.0.0.1:8000/api/qcc/operation/华为技术有限公司
```

**响应**：
```json
{
  "qualifications": [],
  // ... 其他字段
}
```

### 2.5 健康检查

**GET** `/api/qcc/health`

检查企查查 MCP 服务连接状态。

#### 响应格式

```json
{
  "status": "healthy",
  "mcp_base_url": "https://agent.qcc.com/mcp",
  "api_key_configured": true
}
```

#### 状态说明

| 状态 | 说明 |
|------|------|
| healthy | 服务正常 |
| unhealthy | 服务异常 |

## 3. 错误码

| HTTP 状态码 | 错误码 | 说明 |
|------------|--------|------|
| 400 | BAD_REQUEST | 请求参数错误 |
| 401 | UNAUTHORIZED | 认证失败 |
| 404 | NOT_FOUND | 企业不存在 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |
| 502 | BAD_GATEWAY | MCP 服务不可用 |
| 504 | GATEWAY_TIMEOUT | MCP 服务超时 |

### 错误响应示例

**400 Bad Request**：
```json
{
  "detail": "企业名称不能为空"
}
```

**404 Not Found**：
```json
{
  "detail": "企业不存在: XXX公司"
}
```

**500 Internal Server Error**：
```json
{
  "detail": "企业风险评估失败: MCP 服务不可用"
}
```

## 4. 最佳实践

### 4.1 请求频率

- 建议请求间隔 > 1 秒
- 避免短时间内大量请求同一企业
- 使用缓存减少重复查询

### 4.2 错误处理

**重试策略**：
```python
import time
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10)
)
async def call_api_with_retry():
    # 调用 API
    pass
```

**降级方案**：
```python
try:
    result = await api.assessVendorRisk(companyName)
except Exception as e:
    # 降级：使用本地缓存或返回默认值
    result = get_cached_result(companyName)
```

### 4.3 性能优化

**并发请求**：
```python
import asyncio

async def batch_assess(companies):
    tasks = [api.assessVendorRisk(company) for company in companies]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return results
```

**缓存策略**：
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_cached_assessment(company_name):
    return api.assessVendorRisk(company_name)
```

### 4.4 安全建议

- 使用 HTTPS 加密传输
- API Key 不要硬编码，使用环境变量
- 定期轮换 API Key
- 记录访问日志，监控异常请求

## 5. 版本历史

### v1.0.0 (2026-04-27)

- 初始版本
- 支持企业风险评估
- 支持获取企业工商信息
- 支持获取企业风险信息
- 支持获取企业经营信息
