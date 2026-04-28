# 企业风险评估 Agent 架构设计文档

## 1. 系统架构

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    前端展示层 (React)                         │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ 预警核查工作台    │  │ 企业风险评估 Agent │                │
│  │ /risk/workbench  │  │ /agents/vendor-   │                │
│  │                  │  │ risk-assessment   │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │ 调用 Agent          │ 独立使用                   │
│           └──────────┬──────────┘                           │
│                      ▼                                       │
│              ┌───────────────┐                               │
│              │  API Client   │                               │
│              │  src/api/     │                               │
│              └───────┬───────┘                               │
└──────────────────────┼──────────────────────────────────────┘
                       │ HTTP
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    后端服务层 (FastAPI)                       │
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │  企业风险评估路由                                   │       │
│  │  /api/qcc/assess-vendor-risk                      │       │
│  │  /api/qcc/company/{name}                          │       │
│  │  /api/qcc/risk/{name}                             │       │
│  └────────────────────┬─────────────────────────────┘       │
│                       │ 调用                                 │
│                       ▼                                       │
│  ┌──────────────────────────────────────────────────┐       │
│  │  企查查 MCP 客户端服务                              │       │
│  │  services/qcc_mcp_client.py                       │       │
│  └────────────────────┬─────────────────────────────┘       │
└───────────────────────┼─────────────────────────────────────┘
                        │ MCP Protocol
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 企查查 MCP 服务层                             │
│                                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│  │qcc-company  │ │ qcc-risk    │ │qcc-operation│ │ qcc-ipr ││
│  │ (12 tools)  │ │ (34 tools)  │ │ (13 tools)  │ │(6 tools)││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Agent 协同关系图

```
┌─────────────────────────────────────────────────────┐
│          预警归因 Agent (AttributionAgent)            │
│  输入：预警信号、客户信息                             │
│  处理：                                              │
│    1. 调用企业风险评估 Agent 获取风险详情             │
│    2. 聚合多源信号（内部+外部）                       │
│    3. 生成归因摘要                                   │
│  输出：风险归因摘要、证据链、核查重点建议             │
└────────────────────┬────────────────────────────────┘
                     │ 调用
                     ▼
┌─────────────────────────────────────────────────────┐
│      企业风险评估 Agent (VendorRiskAssessmentAgent)  │
│  输入：企业名称或统一社会信用代码                     │
│  处理：                                              │
│    1. 调用企查查 MCP（company/risk/operation/ipr）   │
│    2. 9 维度评估                                     │
│    3. 18 类风险排查                                  │
│  输出：风险等级、9维度详情、18类风险清单、处置建议    │
└────────────────────┬────────────────────────────────┘
                     │ 被调用
                     ▲
┌────────────────────┴────────────────────────────────┐
│          处置建议 Agent (DispositionAgent)            │
│  输入：预警等级、归因结果                             │
│  处理：                                              │
│    1. 调用企业风险评估 Agent 获取风险详情             │
│    2. 匹配处置 SOP                                   │
│    3. 生成处置建议                                   │
│  输出：处置动作、SLA、责任人、补充材料清单            │
└─────────────────────────────────────────────────────┘
```

### 1.3 数据流图

```
用户输入企业名称
       │
       ▼
┌─────────────────┐
│  前端 Agent 页面 │
│  输入验证        │
└────────┬────────┘
         │
         ▼ HTTP POST /api/qcc/assess-vendor-risk
┌─────────────────┐
│  FastAPI 路由   │
│  参数校验        │
└────────┬────────┘
         │
         ▼ 调用 MCP 客户端
┌─────────────────────────────────────────┐
│  企查查 MCP 客户端服务                    │
│                                          │
│  1. 调用 qcc-company (12 tools)         │
│     - get_company_registration_info     │
│     - get_shareholder_info              │
│     - get_key_personnel                 │
│     - get_branches                      │
│     - get_change_records                │
│                                          │
│  2. 调用 qcc-risk (34 tools)            │
│     - get_dishonest_info                │
│     - get_judgment_debtor_info          │
│     - get_high_consumption_restriction  │
│     - get_abnormal_operation            │
│     - ... (其他 14 类风险)               │
│                                          │
│  3. 调用 qcc-operation (13 tools)       │
│     - get_qualifications                │
│     - get_administrative_licenses       │
│     - get_bidding_info                  │
│     - get_credit_rating                 │
│                                          │
│  4. 调用 qcc-ipr (6 tools)              │
│     - get_patent_info                   │
│     - get_trademark_info                │
└────────┬────────────────────────────────┘
         │
         ▼ 数据聚合与评估
┌─────────────────────────────────────────┐
│  9 维度风险评估引擎                      │
│                                          │
│  基础6维度：                             │
│  1. 商业风险（合同与交易）               │
│  2. 运营风险（交付能力）                 │
│  3. 财务风险（资金健康）                 │
│  4. 合规风险（认证与处罚）               │
│  5. 战略风险（依赖程度）                 │
│  6. 地缘政治风险（宏观环境）             │
│                                          │
│  供应链特有3维度：                       │
│  7. 产能资质风险（生产许可、质量认证）   │
│  8. 组织稳定性风险（股权变更、单点风险） │
│  9. 业务健康度风险（信用评级、招投标）   │
└────────┬────────────────────────────────┘
         │
         ▼ 风险分级
┌─────────────────────────────────────────┐
│  18 类风险分级引擎                       │
│                                          │
│  🔴 CRITICAL（立即供应中断）             │
│  - 破产重整、失信信息、被执行人          │
│  - 环保处罚(停产)、经营异常              │
│                                          │
│  🔴 HIGH（供应不稳定）                   │
│  - 严重违法、注销备案、股权冻结          │
│  - 限高消费                              │
│                                          │
│  🟡 MEDIUM（财务/合规风险）              │
│  - 股权出质、欠税、税务异常              │
│  - 终本案件、动产抵押                    │
│                                          │
│  🔵 LOW（一般合规风险）                  │
│  - 一般行政处罚                          │
└────────┬────────────────────────────────┘
         │
         ▼ 生成结构化输出
┌─────────────────────────────────────────┐
│  结构化评估报告                          │
│  - 整体风险等级                          │
│  - 9 维度评估详情                        │
│  - 18 类风险清单（含证据链）             │
│  - 处置建议（响应时间+行动清单）         │
└────────┬────────────────────────────────┘
         │
         ▼ JSON 响应
┌─────────────────┐
│  前端 Agent 页面 │
│  结果展示        │
└─────────────────┘
```

## 2. 模块设计

### 2.1 前端模块

#### 2.1.1 Agent 页面组件

**文件**：`frontend/src/pages/Agents/VendorRiskAssessmentAgent.tsx`

**职责**：
- 展示 Agent 规范（Spec）
- 提供企业名称输入框
- 调用 API 进行评估
- 展示评估结果

**关键组件**：
- `VendorRiskAssessmentAgent`：主组件
- `RiskAssessmentResult`：结果展示组件

#### 2.1.2 结果展示组件

**职责**：
- 展示整体风险等级
- 展示 9 维度评估详情
- 展示 18 类风险清单
- 展示证据链
- 展示处置建议

### 2.2 后端模块

#### 2.2.1 MCP 客户端服务

**文件**：`backend/services/qcc_mcp_client.py`

**职责**：
- 与企查查 MCP 服务通信
- 调用 MCP 工具获取企业数据
- 执行 9 维度评估
- 执行 18 类风险分级
- 生成证据链和处置建议

**关键方法**：
- `call_tool(server, tool_name, arguments)`：调用 MCP 工具
- `assess_vendor_risk(company_name)`：企业风险评估
- `_batch_get_risks(company_name)`：批量获取风险信息
- `_evaluate_9_dimensions(...)`：9 维度评估引擎

#### 2.2.2 评估引擎

**职责**：
- 商业风险评估
- 运营风险评估
- 财务风险评估
- 合规风险评估
- 战略风险评估
- 地缘政治风险评估
- 产能资质风险评估
- 组织稳定性风险评估
- 业务健康度风险评估

#### 2.2.3 API 路由

**文件**：`backend/routers/qcc_assessment.py`

**职责**：
- 提供 RESTful API 端点
- 参数校验
- 错误处理

**关键端点**：
- `POST /api/qcc/assess-vendor-risk`：企业风险评估
- `GET /api/qcc/company/{company_name}`：获取企业工商信息
- `GET /api/qcc/risk/{company_name}`：获取企业风险信息
- `GET /api/qcc/operation/{company_name}`：获取企业经营信息

## 3. 数据模型

### 3.1 请求模型

```python
class AssessVendorRiskRequest(BaseModel):
    company_name: str  # 企业名称或统一社会信用代码
    dimensions: Optional[List[str]] = None  # 可选：指定评估维度
```

### 3.2 响应模型

```python
class VendorRiskAssessment(BaseModel):
    company_name: str
    overall_risk: RiskLevel  # CRITICAL/HIGH/MEDIUM/LOW
    dimensions: Dict[str, DimensionRisk]  # 9 维度评估详情
    risk_categories: List[RiskCategory]  # 18 类风险清单
    evidence_chain: List[EvidenceItem]  # 证据链
    disposition_suggestions: List[DispositionSuggestion]  # 处置建议
    assessment_time: str  # 评估时间
```

### 3.3 数据库设计

**无需数据库**：企业风险评估结果不持久化，仅实时查询和展示。

## 4. 接口设计

### 4.1 RESTful API

#### POST /api/qcc/assess-vendor-risk

**请求**：
```json
{
  "company_name": "华为技术有限公司",
  "dimensions": ["financial_risk", "compliance_risk"]  // 可选
}
```

**响应**：
```json
{
  "company_name": "华为技术有限公司",
  "overall_risk": "LOW",
  "dimensions": {
    "financial_risk": {
      "level": "LOW",
      "score": 15.2,
      "key_findings": ["财务状况良好"],
      "evidence": ["2024年财报显示营收增长20%"]
    },
    // ... 其他维度
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
    },
    // ... 其他风险类别
  ],
  "evidence_chain": [
    {
      "data_source": "企查查-财务数据",
      "update_time": "2024-12-31",
      "credibility": "高",
      "content": "2024年财报显示营收增长20%"
    },
    // ... 其他证据
  ],
  "disposition_suggestions": [
    {
      "action": "定期跟踪财务状况",
      "sla": "< 1 周",
      "responsible_person": "风控经理",
      "materials": ["最新财报", "银行流水"]
    },
    // ... 其他建议
  ],
  "assessment_time": "2026-04-27T10:30:00"
}
```

#### GET /api/qcc/company/{company_name}

**响应**：
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

#### GET /api/qcc/risk/{company_name}

**响应**：
```json
{
  "dishonest": [],  // 失信信息
  "judgment_debtor": [],  // 被执行人
  "high_consumption": [],  // 限制高消费
  "abnormal_operation": [],  // 经营异常
  "serious_violation": [],  // 严重违法
  // ... 其他风险类型
}
```

### 4.2 Agent 协同接口

**前端调用**：
```typescript
const assessment = await api.assessVendorRisk(companyName);
```

**Agent 间调用**：
```typescript
// 预警归因 Agent
const riskAssessment = await api.assessVendorRisk(companyName);
const attribution = generateAttribution(riskAssessment, internalSignals);

// 处置建议 Agent
const riskAssessment = await api.assessVendorRisk(companyName);
const disposition = generateDisposition(riskAssessment, alertLevel);
```

## 5. 技术选型

### 5.1 前端技术栈

- **框架**：React 18
- **UI 库**：Ant Design 5
- **状态管理**：Zustand
- **路由**：React Router v6
- **类型检查**：TypeScript
- **HTTP 客户端**：Fetch API

### 5.2 后端技术栈

- **框架**：FastAPI
- **数据验证**：Pydantic
- **HTTP 客户端**：httpx（异步）
- **数据库**：SQLite（其他功能使用）

### 5.3 第三方服务

- **企查查 MCP**：
  - Base URL：`https://agent.qcc.com/mcp`
  - 认证：Bearer Token（API Key）
  - 协议：MCP (Model Context Protocol)
  - 响应格式：SSE (Server-Sent Events)

## 6. 部署架构

### 6.1 开发环境

```
前端：http://localhost:5173
后端：http://127.0.0.1:8000
企查查 MCP：https://agent.qcc.com/mcp
```

### 6.2 生产环境

```
前端：Nginx 静态托管
后端：FastAPI + Uvicorn
企查查 MCP：https://agent.qcc.com/mcp
```

## 7. 扩展性设计

### 7.1 新增评估维度

在 `qcc_mcp_client.py` 中新增评估方法：
```python
def _evaluate_new_dimension(self, ...):
    # 新维度评估逻辑
    pass
```

### 7.2 新增风险类型

在 `_batch_get_risks` 方法中新增 MCP 工具调用：
```python
result = await self.call_tool("risk", "get_new_risk_type", {"searchKey": company_name})
```

### 7.3 新增 Agent 协同

在前端 Agent 组件中调用企业风险评估 Agent：
```typescript
const riskAssessment = await api.assessVendorRisk(companyName);
// 使用 riskAssessment 进行后续处理
```
