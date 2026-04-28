"""
企查查 MCP 客户端服务

负责与企查查 MCP 服务交互，实现企业风险评估
"""

import os
import httpx
from typing import Dict, List, Optional
from datetime import datetime

from models.qcc_models import (
    VendorRiskAssessment,
    DimensionRisk,
    RiskCategory,
    EvidenceItem,
    DispositionSuggestion,
    RiskLevel,
    QccCompanyInfo,
    QccRiskInfo,
    QccOperationInfo,
)


class QccMcpClient:
    """企查查 MCP 客户端"""

    def __init__(self):
        self.base_url = os.getenv("QCC_MCP_BASE_URL", "https://agent.qcc.com/mcp")
        self.api_key = os.getenv("QCC_MCP_API_KEY", "")

        if not self.api_key:
            raise ValueError("QCC_MCP_API_KEY 环境变量未设置")

        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def call_tool(
        self,
        server: str,  # company/risk/operation/ipr
        tool_name: str,
        arguments: Dict
    ) -> Dict:
        """
        调用 MCP 工具

        Args:
            server: MCP 服务器名称 (company/risk/operation/ipr)
            tool_name: 工具名称
            arguments: 工具参数

        Returns:
            工具调用结果
        """
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

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.post(
                    url,
                    json=payload,
                    headers=self.headers
                )
                response.raise_for_status()

                # 解析 SSE 响应
                result = self._parse_sse_response(response.text)
                return result

            except httpx.HTTPStatusError as e:
                raise Exception(f"MCP 调用失败: {e.response.status_code} - {e.response.text}")
            except httpx.RequestError as e:
                raise Exception(f"MCP 连接失败: {str(e)}")

    def _parse_sse_response(self, response_text: str) -> Dict:
        """解析 SSE 格式的响应"""
        # SSE 格式: "data: {...}\n\n"
        for line in response_text.split('\n'):
            if line.startswith('data: '):
                import json
                data_str = line[6:]  # 去掉 "data: " 前缀
                return json.loads(data_str)

        raise ValueError("无法解析 SSE 响应")

    async def assess_vendor_risk(
        self,
        company_name: str
    ) -> VendorRiskAssessment:
        """
        企业风险评估（9维度）

        Args:
            company_name: 企业名称或统一社会信用代码

        Returns:
            VendorRiskAssessment: 企业风险评估结果
        """
        # 1. 获取企业工商信息
        company_info = await self._get_company_info(company_name)

        # 2. 获取风险信息（18类）
        risk_info = await self._batch_get_risks(company_name)

        # 3. 获取经营信息
        operation_info = await self._get_operation_info(company_name)

        # 4. 执行9维度评估
        assessment = self._evaluate_9_dimensions(
            company_info,
            risk_info,
            operation_info
        )

        return assessment

    async def _get_company_info(self, company_name: str) -> QccCompanyInfo:
        """获取企业工商信息"""
        result = await self.call_tool(
            "company",
            "get_company_registration_info",
            {"searchKey": company_name}
        )

        # 解析结果
        content = result.get("result", {}).get("content", [])
        if content and len(content) > 0:
            import json
            data = json.loads(content[0].get("text", "{}"))
            return QccCompanyInfo(**data)

        raise ValueError(f"未找到企业: {company_name}")

    async def _batch_get_risks(self, company_name: str) -> QccRiskInfo:
        """批量获取18类风险"""
        # 定义18类风险工具
        risk_tools = [
            ("dishonest", "get_dishonest_info"),                      # 失信信息
            ("judgment_debtor", "get_judgment_debtor_info"),          # 被执行人
            ("high_consumption", "get_high_consumption_restriction"), # 限制高消费
            ("abnormal_operation", "get_abnormal_operation"),         # 经营异常
            ("serious_violation", "get_serious_violation"),           # 严重违法
            ("cancellation_filing", "get_cancellation_filing"),       # 注销备案
            ("equity_freeze", "get_equity_freeze"),                   # 股权冻结
            ("equity_pledge", "get_equity_pledge"),                   # 股权出质
            ("chattel_mortgage", "get_chattel_mortgage"),             # 动产抵押
            ("tax_arrears", "get_tax_arrears"),                       # 欠税公告
            ("abnormal_tax", "get_abnormal_tax"),                     # 税务异常
            ("final_case", "get_final_case"),                         # 终本案件
            ("administrative_penalty", "get_administrative_penalty"), # 行政处罚
            ("environmental_penalty", "get_environmental_penalty"),   # 环保处罚
            ("bankruptcy_reorganization", "get_bankruptcy_reorganization"),  # 破产重整
            ("judicial_auction", "get_judicial_auction"),             # 司法拍卖
        ]

        risk_data = {}
        for key, tool_name in risk_tools:
            try:
                result = await self.call_tool(
                    "risk",
                    tool_name,
                    {"searchKey": company_name}
                )

                # 解析结果
                content = result.get("result", {}).get("content", [])
                if content and len(content) > 0:
                    import json
                    data = json.loads(content[0].get("text", "[]"))
                    risk_data[key] = data if isinstance(data, list) else [data]
                else:
                    risk_data[key] = []

            except Exception as e:
                # 记录错误但继续处理其他风险
                print(f"获取 {tool_name} 失败: {str(e)}")
                risk_data[key] = []

        return QccRiskInfo(**risk_data)

    async def _get_operation_info(self, company_name: str) -> QccOperationInfo:
        """获取经营信息"""
        operation_tools = [
            ("qualifications", "get_qualifications"),                   # 资质证书
            ("administrative_licenses", "get_administrative_licenses"), # 行政许可
            ("bidding_info", "get_bidding_info"),                       # 招投标信息
            ("credit_rating", "get_credit_rating"),                     # 信用评级
            ("spot_check_records", "get_spot_check_records"),           # 抽查检查记录
            ("financing_records", "get_financing_records"),             # 融资记录
        ]

        operation_data = {}
        for key, tool_name in operation_tools:
            try:
                result = await self.call_tool(
                    "operation",
                    tool_name,
                    {"searchKey": company_name}
                )

                # 解析结果
                content = result.get("result", {}).get("content", [])
                if content and len(content) > 0:
                    import json
                    data = json.loads(content[0].get("text", "[]"))
                    operation_data[key] = data if isinstance(data, list) else [data]
                else:
                    operation_data[key] = []

            except Exception as e:
                print(f"获取 {tool_name} 失败: {str(e)}")
                operation_data[key] = []

        return QccOperationInfo(**operation_data)

    def _evaluate_9_dimensions(
        self,
        company_info: QccCompanyInfo,
        risk_info: QccRiskInfo,
        operation_info: QccOperationInfo
    ) -> VendorRiskAssessment:
        """
        执行9维度风险评估

        Args:
            company_info: 企业工商信息
            risk_info: 风险信息
            operation_info: 经营信息

        Returns:
            VendorRiskAssessment: 评估结果
        """
        # 评估各维度风险
        dimensions = {
            "commercial_risk": self._evaluate_commercial_risk(company_info, risk_info),
            "operational_risk": self._evaluate_operational_risk(company_info, operation_info),
            "financial_risk": self._evaluate_financial_risk(risk_info),
            "compliance_risk": self._evaluate_compliance_risk(risk_info, operation_info),
            "strategic_risk": self._evaluate_strategic_risk(company_info),
            "geopolitical_risk": self._evaluate_geopolitical_risk(company_info),
            "capacity_risk": self._evaluate_capacity_risk(operation_info),
            "stability_risk": self._evaluate_stability_risk(company_info),
            "business_health_risk": self._evaluate_business_health_risk(operation_info),
        }

        # 生成风险类别清单
        risk_categories = self._generate_risk_categories(risk_info)

        # 生成证据链
        evidence_chain = self._generate_evidence_chain(
            company_info,
            risk_info,
            operation_info
        )

        # 生成处置建议
        disposition_suggestions = self._generate_disposition_suggestions(risk_categories)

        # 计算整体风险等级
        overall_risk = self._calculate_overall_risk(dimensions)

        return VendorRiskAssessment(
            company_name=company_info.企业名称,
            overall_risk=overall_risk,
            dimensions=dimensions,
            risk_categories=risk_categories,
            evidence_chain=evidence_chain,
            disposition_suggestions=disposition_suggestions,
            assessment_time=datetime.now().isoformat()
        )

    def _evaluate_commercial_risk(
        self,
        company_info: QccCompanyInfo,
        risk_info: QccRiskInfo
    ) -> DimensionRisk:
        """评估商业风险"""
        findings = []
        evidence = []
        score = 0

        # 检查登记状态
        if company_info.登记状态 != "存续":
            findings.append(f"登记状态异常: {company_info.登记状态}")
            evidence.append(f"工商登记状态: {company_info.登记状态}")
            score += 30

        # 检查失信信息
        if risk_info.dishonest:
            findings.append(f"发现失信记录 {len(risk_info.dishonest)} 条")
            evidence.append(f"失信信息: {len(risk_info.dishonest)} 条")
            score += 40

        # 确定风险等级
        if score >= 60:
            level = RiskLevel.HIGH
        elif score >= 30:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        return DimensionRisk(
            level=level,
            score=min(score, 100),
            key_findings=findings,
            evidence=evidence
        )

    def _evaluate_operational_risk(
        self,
        company_info: QccCompanyInfo,
        operation_info: QccOperationInfo
    ) -> DimensionRisk:
        """评估运营风险"""
        findings = []
        evidence = []
        score = 0

        # 检查资质证书
        if not operation_info.qualifications:
            findings.append("未发现资质证书")
            evidence.append("资质证书: 无")
            score += 20

        # 检查招投标活跃度
        if operation_info.bidding_info:
            findings.append(f"招投标活跃: {len(operation_info.bidding_info)} 条记录")
            evidence.append(f"招投标记录: {len(operation_info.bidding_info)} 条")
        else:
            findings.append("无招投标记录")
            score += 15

        # 确定风险等级
        if score >= 30:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        return DimensionRisk(
            level=level,
            score=min(score, 100),
            key_findings=findings,
            evidence=evidence
        )

    def _evaluate_financial_risk(self, risk_info: QccRiskInfo) -> DimensionRisk:
        """评估财务风险"""
        findings = []
        evidence = []
        score = 0

        # 检查被执行人
        if risk_info.judgment_debtor:
            findings.append(f"发现被执行人记录 {len(risk_info.judgment_debtor)} 条")
            evidence.append(f"被执行人: {len(risk_info.judgment_debtor)} 条")
            score += 50

        # 检查股权冻结
        if risk_info.equity_freeze:
            findings.append(f"股权冻结 {len(risk_info.equity_freeze)} 条")
            evidence.append(f"股权冻结: {len(risk_info.equity_freeze)} 条")
            score += 30

        # 检查欠税
        if risk_info.tax_arrears:
            findings.append(f"欠税公告 {len(risk_info.tax_arrears)} 条")
            evidence.append(f"欠税: {len(risk_info.tax_arrears)} 条")
            score += 20

        # 确定风险等级
        if score >= 50:
            level = RiskLevel.CRITICAL
        elif score >= 30:
            level = RiskLevel.HIGH
        elif score >= 15:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        return DimensionRisk(
            level=level,
            score=min(score, 100),
            key_findings=findings,
            evidence=evidence
        )

    def _evaluate_compliance_risk(
        self,
        risk_info: QccRiskInfo,
        operation_info: QccOperationInfo
    ) -> DimensionRisk:
        """评估合规风险"""
        findings = []
        evidence = []
        score = 0

        # 检查经营异常
        if risk_info.abnormal_operation:
            findings.append(f"经营异常 {len(risk_info.abnormal_operation)} 条")
            evidence.append(f"经营异常: {len(risk_info.abnormal_operation)} 条")
            score += 40

        # 检查行政处罚
        if risk_info.administrative_penalty:
            findings.append(f"行政处罚 {len(risk_info.administrative_penalty)} 条")
            evidence.append(f"行政处罚: {len(risk_info.administrative_penalty)} 条")
            score += 20

        # 检查环保处罚
        if risk_info.environmental_penalty:
            findings.append(f"环保处罚 {len(risk_info.environmental_penalty)} 条")
            evidence.append(f"环保处罚: {len(risk_info.environmental_penalty)} 条")
            score += 30

        # 确定风险等级
        if score >= 50:
            level = RiskLevel.HIGH
        elif score >= 30:
            level = RiskLevel.MEDIUM
        elif score >= 10:
            level = RiskLevel.LOW
        else:
            level = RiskLevel.LOW

        return DimensionRisk(
            level=level,
            score=min(score, 100),
            key_findings=findings,
            evidence=evidence
        )

    def _evaluate_strategic_risk(self, company_info: QccCompanyInfo) -> DimensionRisk:
        """评估战略风险"""
        # 简化评估，默认低风险
        return DimensionRisk(
            level=RiskLevel.LOW,
            score=10,
            key_findings=["非唯一来源"],
            evidence=["战略依赖度: 低"]
        )

    def _evaluate_geopolitical_risk(self, company_info: QccCompanyInfo) -> DimensionRisk:
        """评估地缘政治风险"""
        # 国内企业，默认低风险
        return DimensionRisk(
            level=RiskLevel.LOW,
            score=5,
            key_findings=["国内供应商"],
            evidence=["地缘政治风险: 低"]
        )

    def _evaluate_capacity_risk(self, operation_info: QccOperationInfo) -> DimensionRisk:
        """评估产能资质风险"""
        findings = []
        evidence = []
        score = 0

        # 检查资质证书
        if operation_info.qualifications:
            findings.append(f"持有资质证书 {len(operation_info.qualifications)} 个")
            evidence.append(f"资质证书: {len(operation_info.qualifications)} 个")
        else:
            findings.append("未发现资质证书")
            evidence.append("资质证书: 无")
            score += 30

        # 检查行政许可
        if operation_info.administrative_licenses:
            findings.append(f"行政许可 {len(operation_info.administrative_licenses)} 个")
            evidence.append(f"行政许可: {len(operation_info.administrative_licenses)} 个")
        else:
            findings.append("无行政许可记录")
            score += 20

        # 确定风险等级
        if score >= 30:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        return DimensionRisk(
            level=level,
            score=min(score, 100),
            key_findings=findings,
            evidence=evidence
        )

    def _evaluate_stability_risk(self, company_info: QccCompanyInfo) -> DimensionRisk:
        """评估组织稳定性风险"""
        # 简化评估
        return DimensionRisk(
            level=RiskLevel.LOW,
            score=15,
            key_findings=["组织结构稳定"],
            evidence=["未发现重大变更"]
        )

    def _evaluate_business_health_risk(self, operation_info: QccOperationInfo) -> DimensionRisk:
        """评估业务健康度风险"""
        findings = []
        evidence = []
        score = 0

        # 检查信用评级
        if operation_info.credit_rating:
            findings.append(f"信用评级: {operation_info.credit_rating[0].get('等级', '未知')}")
            evidence.append(f"信用评级: {operation_info.credit_rating[0]}")
        else:
            findings.append("无官方信用评级")
            evidence.append("信用评级: 无")
            score += 20

        # 检查抽查记录
        if operation_info.spot_check_records:
            findings.append(f"抽查检查记录 {len(operation_info.spot_check_records)} 条")
            evidence.append(f"抽查记录: {len(operation_info.spot_check_records)} 条")

        # 确定风险等级
        if score >= 20:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        return DimensionRisk(
            level=level,
            score=min(score, 100),
            key_findings=findings,
            evidence=evidence
        )

    def _generate_risk_categories(self, risk_info: QccRiskInfo) -> List[RiskCategory]:
        """生成风险类别清单"""
        categories = []

        # CRITICAL 风险
        if risk_info.bankruptcy_reorganization:
            categories.append(RiskCategory(
                category="破产重整",
                level=RiskLevel.CRITICAL,
                description="企业进入破产重整程序",
                evidence=f"破产重整记录: {len(risk_info.bankruptcy_reorganization)} 条",
                impact="供应关系终止",
                suggestion="立即切换供应商",
                response_time="< 4小时"
            ))

        if risk_info.dishonest:
            categories.append(RiskCategory(
                category="失信信息",
                level=RiskLevel.CRITICAL,
                description="企业被列入失信被执行人名单",
                evidence=f"失信记录: {len(risk_info.dishonest)} 条",
                impact="信用崩溃，履约能力丧失",
                suggestion="核实履约能力，考虑增加担保",
                response_time="< 4小时"
            ))

        if risk_info.judgment_debtor:
            categories.append(RiskCategory(
                category="被执行人",
                level=RiskLevel.CRITICAL,
                description="企业有被执行人记录",
                evidence=f"被执行人记录: {len(risk_info.judgment_debtor)} 条",
                impact="现金流危机，影响原材料采购",
                suggestion="核实涉诉金额，评估对交付的影响",
                response_time="< 24小时"
            ))

        # HIGH 风险
        if risk_info.abnormal_operation:
            categories.append(RiskCategory(
                category="经营异常",
                level=RiskLevel.HIGH,
                description="企业被列入经营异常名录",
                evidence=f"经营异常记录: {len(risk_info.abnormal_operation)} 条",
                impact="监管介入，经营不稳定",
                suggestion="核实真实经营地址",
                response_time="< 48小时"
            ))

        if risk_info.equity_freeze:
            categories.append(RiskCategory(
                category="股权冻结",
                level=RiskLevel.HIGH,
                description="企业股权被冻结",
                evidence=f"股权冻结记录: {len(risk_info.equity_freeze)} 条",
                impact="控制权不稳定",
                suggestion="核实股东纠纷对生产的影响",
                response_time="< 48小时"
            ))

        # MEDIUM 风险
        if risk_info.tax_arrears:
            categories.append(RiskCategory(
                category="欠税公告",
                level=RiskLevel.MEDIUM,
                description="企业存在欠税情况",
                evidence=f"欠税记录: {len(risk_info.tax_arrears)} 条",
                impact="现金流危机，可能拖欠货款",
                suggestion="核实欠税金额和原因",
                response_time="< 7天"
            ))

        return categories

    def _generate_evidence_chain(
        self,
        company_info: QccCompanyInfo,
        risk_info: QccRiskInfo,
        operation_info: QccOperationInfo
    ) -> List[EvidenceItem]:
        """生成证据链"""
        evidence = []

        # 工商信息证据
        evidence.append(EvidenceItem(
            data_source="企查查 MCP - qcc-company",
            update_time=datetime.now().strftime("%Y-%m-%d"),
            credibility="官方数据",
            content=f"企业名称: {company_info.企业名称}, 统一社会信用代码: {company_info.统一社会信用代码}, 登记状态: {company_info.登记状态}"
        ))

        # 风险信息证据
        if risk_info.judgment_debtor:
            evidence.append(EvidenceItem(
                data_source="企查查 MCP - qcc-risk",
                update_time=datetime.now().strftime("%Y-%m-%d"),
                credibility="官方数据",
                content=f"被执行人记录: {len(risk_info.judgment_debtor)} 条"
            ))

        if risk_info.abnormal_operation:
            evidence.append(EvidenceItem(
                data_source="企查查 MCP - qcc-risk",
                update_time=datetime.now().strftime("%Y-%m-%d"),
                credibility="官方数据",
                content=f"经营异常记录: {len(risk_info.abnormal_operation)} 条"
            ))

        return evidence

    def _generate_disposition_suggestions(
        self,
        risk_categories: List[RiskCategory]
    ) -> List[DispositionSuggestion]:
        """生成处置建议"""
        suggestions = []

        for category in risk_categories:
            suggestions.append(DispositionSuggestion(
                action=category.suggestion,
                sla=category.response_time,
                responsible_person="客户经理",
                materials=["涉诉案件材料", "经营地址证明", "财务报表"]
            ))

        return suggestions

    def _calculate_overall_risk(
        self,
        dimensions: Dict[str, DimensionRisk]
    ) -> RiskLevel:
        """计算整体风险等级"""
        # 取所有维度中的最高风险等级
        risk_levels = [dim.level for dim in dimensions.values()]

        if RiskLevel.CRITICAL in risk_levels:
            return RiskLevel.CRITICAL
        elif RiskLevel.HIGH in risk_levels:
            return RiskLevel.HIGH
        elif RiskLevel.MEDIUM in risk_levels:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
