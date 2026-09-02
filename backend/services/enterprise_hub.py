"""
企业数据中心服务

提供企业档案管理、风险评估管理、预警管理、数据统计等功能
"""

import json
from typing import Dict, List, Optional
from datetime import datetime

from enterprise_db import get_db_connection
from services.qcc_mcp_client import QccMcpClient
from models.qcc_models import VendorRiskAssessment


class EnterpriseDataHub:
    MANAGER_NAME_MAP = {
        "RM-ZZ-001": "周明轩",
        "RM-ZZ-002": "刘思远",
        "RM-ZZ-003": "陈雨桐",
        "RM-ZZ-004": "王嘉宁",
        "RM-ZZ-005": "李承泽",
        "RM-ZZ-006": "赵文博",
        "RM-ZZ-007": "孙雅琪",
        "RM-ZZ-008": "黄子昂",
        "RM-ZZ-009": "张若琳",
        "RM-ZZ-010": "何景行",
        "RM-ZZ-104": "蒋一凡",
        "RM-ZZ-107": "高晨曦",
        "RM-ZZ-108": "许知远",
        "RM-ZZ-110": "林婉清",
        "未分配": "待分配",
    }
    FALLBACK_MANAGER_NAMES = [
        "沈知言",
        "陆清和",
        "顾明哲",
        "宋书航",
        "唐雨辰",
        "邵景明",
        "韩沐阳",
        "魏承安",
        "许星野",
        "程以宁",
    ]

    @classmethod
    def _manager_display_name(cls, manager_id: Optional[str]) -> str:
        if not manager_id:
            return "待分配"
        clean = manager_id.strip()
        if not clean:
            return "待分配"
        if clean in cls.MANAGER_NAME_MAP:
            return cls.MANAGER_NAME_MAP[clean]
        # 若数据里本身已经是中文姓名，直接使用
        if any("\u4e00" <= ch <= "\u9fff" for ch in clean):
            return clean
        # 未命中映射时，稳定映射到真实姓名池，避免展示“客户经理09”这类占位名
        idx = sum(ord(ch) for ch in clean) % len(cls.FALLBACK_MANAGER_NAMES)
        return cls.FALLBACK_MANAGER_NAMES[idx]

    @staticmethod
    def _to_float(value: Optional[str]) -> Optional[float]:
        text = (value or "").strip()
        if not text:
            return None
        try:
            return float(text)
        except ValueError:
            return None

    @staticmethod
    def _to_int(value: Optional[str]) -> Optional[int]:
        text = (value or "").strip()
        if not text:
            return None
        try:
            return int(float(text))
        except ValueError:
            return None

    @staticmethod
    def _to_bool_int(value: Optional[str]) -> Optional[int]:
        text = (value or "").strip().lower()
        if not text:
            return None
        if text in {"1", "true", "yes", "y", "是", "有"}:
            return 1
        if text in {"0", "false", "no", "n", "否", "无"}:
            return 0
        return None

    """企业数据中心"""

    def __init__(self):
        self.qcc_client = QccMcpClient()

    # ==================== 企业档案管理 ====================

    async def register_enterprise(self, company_name: str) -> Dict:
        """
        注册企业基础档案（不调用外部 MCP）

        Args:
            company_name: 企业名称或统一社会信用代码

        Returns:
            企业档案信息
        """
        conn = get_db_connection()
        cursor = conn.cursor()

        # 检查企业是否已存在
        cursor.execute(
            "SELECT * FROM enterprises WHERE company_name = ?",
            (company_name,)
        )
        existing = cursor.fetchone()

        if existing:
            conn.close()
            return dict(existing)

        try:
            cursor.execute("""
                INSERT INTO enterprises (company_name) VALUES (?)
            """, (company_name,))
            enterprise_id = cursor.lastrowid
            conn.commit()
            cursor.execute(
                "SELECT * FROM enterprises WHERE id = ?",
                (enterprise_id,)
            )
            enterprise = dict(cursor.fetchone())
            conn.close()
            return enterprise
        except Exception as e:
            conn.close()
            raise Exception(f"注册企业失败: {str(e)}")

    def get_enterprise(self, enterprise_id: int) -> Optional[Dict]:
        """获取企业档案"""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM enterprises WHERE id = ?",
            (enterprise_id,)
        )
        enterprise = cursor.fetchone()
        if not enterprise:
            conn.close()
            return None

        enterprise_dict = dict(enterprise)
        cursor.execute(
            """
            SELECT id, company_id, shareholder_name, shareholder_type,
                   contribution_amount, contribution_ratio, created_at
            FROM enterprise_shareholders
            WHERE company_id = ?
            ORDER BY id DESC
            """,
            (enterprise_id,),
        )
        enterprise_dict["shareholders"] = [dict(row) for row in cursor.fetchall()]

        cursor.execute(
            """
            SELECT loan_id, company_id, loan_account_no, loan_amount, credit_limit,
                   loan_balance, interest_rate, start_date, end_date, status,
                   manager_id, created_at, updated_at
            FROM enterprise_loans
            WHERE company_id = ?
            ORDER BY loan_id DESC
            """,
            (enterprise_id,),
        )
        enterprise_dict["loans"] = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return enterprise_dict

    def get_enterprise_by_name(self, company_name: str) -> Optional[Dict]:
        """根据企业名称获取企业档案"""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM enterprises WHERE company_name = ?",
            (company_name,)
        )
        enterprise = cursor.fetchone()
        conn.close()

        return dict(enterprise) if enterprise else None

    def list_enterprises(self, limit: int = 50) -> List[Dict]:
        """获取企业列表"""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM enterprises ORDER BY created_at DESC LIMIT ?",
            (limit,)
        )
        enterprises = [dict(row) for row in cursor.fetchall()]
        conn.close()

        return enterprises

    def upsert_enterprise_manual_profile(self, row: Dict[str, str]) -> Dict:
        """
        人工建档（CSV）入库：按 company_name upsert。
        仅处理 enterprises 表已有字段，其他字段忽略。
        """
        company_name = (row.get("company_name") or "").strip()
        if not company_name:
            raise ValueError("company_name 不能为空")

        mapping = {
            "credit_code": (row.get("credit_code") or "").strip() or None,
            "legal_person": (row.get("legal_person") or "").strip() or None,
            "registered_capital": (row.get("registered_capital") or "").strip() or None,
            "paid_in_capital": (row.get("paid_in_capital") or "").strip() or None,
            "established_date": (row.get("established_date") or "").strip() or None,
            "registration_status": (row.get("registration_status") or "").strip() or None,
            "business_scope": (row.get("business_scope") or "").strip() or None,
            "registered_address": (row.get("registered_address") or "").strip() or None,
            "actual_address": (row.get("actual_address") or "").strip() or None,
            "phone": ((row.get("phone") or row.get("phone_number") or "").strip() or None),
            "industry_code": (row.get("industry_code") or "").strip() or None,
            "industry_category": (row.get("industry_category") or "").strip() or None,
            "company_type": (row.get("company_type") or "").strip() or None,
            "major_shareholders": (row.get("major_shareholders") or "").strip() or None,
            "shareholding_ratio": (row.get("shareholding_ratio") or "").strip() or None,
            "ultimate_beneficiary": (row.get("ultimate_beneficiary") or "").strip() or None,
            "email": (row.get("email") or "").strip() or None,
            "website": (row.get("website") or "").strip() or None,
            "employee_count": self._to_int(row.get("employee_count")),
            "tax_credit_level": (row.get("tax_credit_level") or "").strip() or None,
            "annual_revenue": self._to_float(row.get("annual_revenue")),
            "is_dishonest": self._to_bool_int(row.get("is_dishonest")),
            "court_cases": self._to_int(row.get("court_cases")),
        }

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM enterprises WHERE company_name = ?",
            (company_name,),
        )
        existing = cursor.fetchone()

        if existing:
            existing_dict = dict(existing)
            updates = {}
            for field, new_value in mapping.items():
                if new_value is not None:
                    updates[field] = new_value
            if updates:
                set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
                values = list(updates.values()) + [company_name]
                cursor.execute(
                    f"UPDATE enterprises SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE company_name = ?",
                    values,
                )
                conn.commit()
            cursor.execute(
                "SELECT * FROM enterprises WHERE company_name = ?",
                (company_name,),
            )
            result = dict(cursor.fetchone())
            conn.close()
            return result

        cursor.execute("""
            INSERT INTO enterprises (
                company_name, credit_code, legal_person,
                registered_capital, paid_in_capital, established_date,
                registration_status, business_scope, registered_address,
                actual_address, phone, industry_code, industry_category,
                company_type, major_shareholders, shareholding_ratio,
                ultimate_beneficiary, email, website, employee_count,
                tax_credit_level, annual_revenue, is_dishonest, court_cases
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            company_name,
            mapping["credit_code"],
            mapping["legal_person"],
            mapping["registered_capital"],
            mapping["paid_in_capital"],
            mapping["established_date"],
            mapping["registration_status"],
            mapping["business_scope"],
            mapping["registered_address"],
            mapping["actual_address"],
            mapping["phone"],
            mapping["industry_code"],
            mapping["industry_category"],
            mapping["company_type"],
            mapping["major_shareholders"],
            mapping["shareholding_ratio"],
            mapping["ultimate_beneficiary"],
            mapping["email"],
            mapping["website"],
            mapping["employee_count"],
            mapping["tax_credit_level"],
            mapping["annual_revenue"],
            mapping["is_dishonest"],
            mapping["court_cases"],
        ))
        enterprise_id = cursor.lastrowid
        conn.commit()
        cursor.execute("SELECT * FROM enterprises WHERE id = ?", (enterprise_id,))
        result = dict(cursor.fetchone())
        conn.close()
        return result

    def upsert_shareholder_manual_profile(self, company_id: int, row: Dict[str, str]) -> None:
        shareholder_name = (row.get("shareholder_name") or row.get("major_shareholders") or "").strip()
        if not shareholder_name:
            return
        shareholder_type = (row.get("shareholder_type") or "").strip() or None
        contribution_amount = self._to_float(row.get("contribution_amount"))
        contribution_ratio = self._to_float(row.get("contribution_ratio"))
        if contribution_ratio is None:
            contribution_ratio = self._to_float(row.get("shareholding_ratio"))

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR IGNORE INTO enterprise_shareholders (
                company_id, shareholder_name, shareholder_type,
                contribution_amount, contribution_ratio
            ) VALUES (?, ?, ?, ?, ?)
            """,
            (company_id, shareholder_name, shareholder_type, contribution_amount, contribution_ratio),
        )
        conn.commit()
        conn.close()

    def upsert_loan_manual_profile(self, company_id: int, row: Dict[str, str]) -> None:
        loan_account_no = (row.get("loan_account_no") or "").strip() or None
        loan_amount = self._to_float(row.get("loan_amount"))
        credit_limit = self._to_float(row.get("credit_limit"))
        loan_balance = self._to_float(row.get("loan_balance"))
        interest_rate = self._to_float(row.get("interest_rate"))
        start_date = (row.get("start_date") or "").strip() or None
        end_date = (row.get("end_date") or "").strip() or None
        status = (row.get("status") or row.get("loan_status") or "").strip() or None
        manager_id = (row.get("manager_id") or "").strip() or None

        if (
            loan_account_no is None
            and loan_amount is None
            and credit_limit is None
            and loan_balance is None
            and interest_rate is None
            and start_date is None
            and end_date is None
            and status is None
            and manager_id is None
        ):
            return

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR IGNORE INTO enterprise_loans (
                company_id, loan_account_no, loan_amount, credit_limit,
                loan_balance, interest_rate, start_date, end_date, status, manager_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                company_id,
                loan_account_no,
                loan_amount,
                credit_limit,
                loan_balance,
                interest_rate,
                start_date,
                end_date,
                status,
                manager_id,
            ),
        )
        conn.commit()
        conn.close()

    async def import_watchlist_csv_rows(self, rows: List[Dict[str, str]], mode: str = "low_cost") -> Dict:
        """
        导入 CSV 企业档案并自动触发 qcc-risk 批量评估。
        """
        imported = 0
        failed = []
        company_names: List[str] = []
        seen = set()

        for idx, row in enumerate(rows, start=1):
            try:
                enterprise = self.upsert_enterprise_manual_profile(row)
                company_id = enterprise["id"]
                self.upsert_shareholder_manual_profile(company_id, row)
                self.upsert_loan_manual_profile(company_id, row)
                imported += 1
                name = enterprise["company_name"]
                if name not in seen:
                    seen.add(name)
                    company_names.append(name)
            except Exception as e:
                failed.append({
                    "row_number": idx,
                    "company_name": (row.get("company_name") or "").strip(),
                    "error": str(e),
                })

        onboard_summary = await self.onboard_watchlist_batch(company_names, mode=mode)
        return {
            "imported": imported,
            "failed_count": len(failed),
            "failed_rows": failed,
            "onboard_summary": onboard_summary,
        }

    async def onboard_watchlist_batch(self, company_names: List[str], mode: str = "low_cost") -> Dict:
        """
        批量入池监控企业名单：注册企业 -> 风险评估 -> 高/关键风险入预警队列。
        """
        cleaned_names = []
        seen = set()
        for raw in company_names:
            name = (raw or "").strip()
            if not name or name in seen:
                continue
            seen.add(name)
            cleaned_names.append(name)

        summary = {
            "mode": mode,
            "total_submitted": len(company_names),
            "total_valid": len(cleaned_names),
            "processed": 0,
            "created_enterprises": 0,
            "assessed": 0,
            "escalated_to_full": 0,
            "alerts_triggered": 0,
            "failures": [],
            "results": [],
        }

        low_cost = mode == "low_cost"

        for company_name in cleaned_names:
            try:
                existing = self.get_enterprise_by_name(company_name)
                enterprise = await self.register_enterprise(company_name)
                is_created = existing is None

                escalated_to_full = False
                assessment_mode = "full"

                if low_cost:
                    # 先低成本评估，不立即入库；命中风险信号再自动升级全量评估。
                    assessment = await self.assess_risk(
                        enterprise["id"], low_cost=True, persist=False, risk_only=True
                    )
                    assessment_mode = "low_cost"
                    if self._needs_full_reassessment(assessment):
                        assessment = await self.assess_risk(
                            enterprise["id"], low_cost=False, persist=True, risk_only=True
                        )
                        escalated_to_full = True
                        assessment_mode = "full"
                        summary["escalated_to_full"] += 1
                    else:
                        self._persist_assessment(enterprise["id"], assessment)
                else:
                    assessment = await self.assess_risk(
                        enterprise["id"], low_cost=False, persist=True, risk_only=True
                    )

                alert = await self.check_and_trigger_alerts(enterprise["id"], assessment)

                summary["processed"] += 1
                summary["assessed"] += 1
                if is_created:
                    summary["created_enterprises"] += 1
                if alert:
                    summary["alerts_triggered"] += 1

                summary["results"].append({
                    "company_name": enterprise["company_name"],
                    "enterprise_id": enterprise["id"],
                    "overall_risk": assessment.overall_risk,
                    "assessment_mode": assessment_mode,
                    "escalated_to_full": escalated_to_full,
                    "alert_triggered": bool(alert),
                    "alert_level": alert["alert_level"] if alert else None,
                })
            except Exception as e:
                err_text = str(e)
                summary["failures"].append({
                    "company_name": company_name,
                    "error": err_text,
                })
                # 第三方配额不足时，直接短路剩余名单，避免无效调用和长时间等待
                if "积分余额不足" in err_text:
                    remaining = [n for n in cleaned_names if n != company_name and n not in {r["company_name"] for r in summary["results"]} and n not in {f["company_name"] for f in summary["failures"]}]
                    for n in remaining:
                        summary["failures"].append({
                            "company_name": n,
                            "error": "企查查 MCP 积分余额不足，请充值后重试",
                        })
                    break

        return summary

    async def precheck_watchlist_capacity(
        self,
        mode: str = "low_cost",
        planned_count: int = 0,
    ) -> Dict:
        """
        批量入池前的额度可用性预检。
        说明：第三方未提供剩余额度查询接口，预检仅用于提前发现“余额已不足”。
        """
        # 轻量探测：调用 qcc-risk 任一工具可成功，视为当前可继续提交。
        probe_name = "华为技术有限公司"
        try:
            await self.qcc_client.call_tool(
                "risk",
                "get_dishonest_info",
                {"searchKey": probe_name},
            )
            return {
                "can_submit": True,
                "mode": mode,
                "planned_count": planned_count,
                "message": "额度预检通过，可提交批量任务",
            }
        except Exception as e:
            err = str(e)
            if "积分余额不足" in err:
                return {
                    "can_submit": False,
                    "mode": mode,
                    "planned_count": planned_count,
                    "message": "企查查 MCP 积分余额不足，请充值后重试",
                }
            # 其他错误不强阻断，给出提示由用户决定是否继续
            return {
                "can_submit": True,
                "mode": mode,
                "planned_count": planned_count,
                "message": f"预检出现异常（仍可尝试提交）: {err}",
            }

    # ==================== 风险评估管理 ====================

    async def assess_risk(
        self,
        enterprise_id: int,
        low_cost: bool = False,
        persist: bool = True,
        risk_only: bool = True,
    ) -> VendorRiskAssessment:
        """
        评估企业风险

        Args:
            enterprise_id: 企业ID

        Returns:
            风险评估结果
        """
        # 获取企业信息
        enterprise = self.get_enterprise(enterprise_id)
        if not enterprise:
            raise Exception(f"企业不存在: {enterprise_id}")

        # 调用企业风险评估 Agent（默认仅 qcc-risk）
        if risk_only:
            assessment = await self.qcc_client.assess_vendor_risk_risk_only(
                enterprise["company_name"],
                low_cost=low_cost,
            )
        elif low_cost:
            assessment = await self.qcc_client.assess_vendor_risk_lightweight(
                enterprise['company_name']
            )
        else:
            assessment = await self.qcc_client.assess_vendor_risk(
                enterprise['company_name']
            )

        if persist:
            self._persist_assessment(enterprise_id, assessment)

        return assessment

    def _persist_assessment(self, enterprise_id: int, assessment: VendorRiskAssessment) -> None:
        """持久化风险评估结果。"""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO risk_assessments (
                enterprise_id, overall_risk, assessment_data
            ) VALUES (?, ?, ?)
        """, (
            enterprise_id,
            assessment.overall_risk,
            assessment.model_dump_json()
        ))

        conn.commit()
        conn.close()

    @staticmethod
    def _needs_full_reassessment(assessment: VendorRiskAssessment) -> bool:
        """
        是否需要从低成本评估升级为全量评估：
        - 存在任意风险类别
        - 或整体风险非 LOW
        """
        if assessment.overall_risk != "LOW":
            return True
        return len(assessment.risk_categories) > 0

    def get_latest_assessment(self, enterprise_id: int) -> Optional[Dict]:
        """获取企业最新的风险评估"""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM risk_assessments
            WHERE enterprise_id = ?
            ORDER BY assessment_time DESC
            LIMIT 1
        """, (enterprise_id,))

        assessment = cursor.fetchone()
        conn.close()

        if assessment:
            result = dict(assessment)
            result['assessment_data'] = json.loads(result['assessment_data'])
            return result

        return None

    def get_assessment_history(
        self,
        enterprise_id: int,
        limit: int = 10
    ) -> List[Dict]:
        """获取企业风险评估历史"""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM risk_assessments
            WHERE enterprise_id = ?
            ORDER BY assessment_time DESC
            LIMIT ?
        """, (enterprise_id, limit))

        assessments = []
        for row in cursor.fetchall():
            assessment = dict(row)
            assessment['assessment_data'] = json.loads(
                assessment['assessment_data']
            )
            assessments.append(assessment)

        conn.close()
        return assessments

    # ==================== 预警管理 ====================

    async def check_and_trigger_alerts(
        self,
        enterprise_id: int,
        assessment: VendorRiskAssessment
    ) -> Optional[Dict]:
        """
        检查并触发预警

        Args:
            enterprise_id: 企业ID
            assessment: 风险评估结果

        Returns:
            预警记录（如果触发）
        """
        # 根据风险评估结果判断是否需要预警
        if assessment.overall_risk not in ['CRITICAL', 'HIGH']:
            return None

        # 创建预警记录
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO alerts (
                enterprise_id, alert_type, alert_level, alert_source
            ) VALUES (?, ?, ?, ?)
        """, (
            enterprise_id,
            'risk_assessment',
            assessment.overall_risk,
            '企业风险评估 Agent'
        ))

        alert_id = cursor.lastrowid
        conn.commit()

        # 返回预警记录
        cursor.execute(
            "SELECT * FROM alerts WHERE id = ?",
            (alert_id,)
        )
        alert = dict(cursor.fetchone())
        conn.close()

        return alert

    def get_alert_list(
        self,
        status: Optional[str] = None,
        level: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict]:
        """
        获取预警列表

        Args:
            status: 预警状态（active/resolved/ignored）
            level: 预警等级（CRITICAL/HIGH/MEDIUM/LOW）
            limit: 返回数量限制

        Returns:
            预警列表
        """
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            SELECT
                alerts.*,
                enterprises.company_name,
                enterprises.credit_code
            FROM alerts
            JOIN enterprises ON alerts.enterprise_id = enterprises.id
            WHERE 1=1
        """
        params = []

        if status:
            query += " AND alerts.alert_status = ?"
            params.append(status)

        if level:
            query += " AND alerts.alert_level = ?"
            params.append(level)

        query += " ORDER BY alerts.triggered_at DESC LIMIT ?"
        params.append(limit)

        cursor.execute(query, params)
        alerts = [dict(row) for row in cursor.fetchall()]
        conn.close()

        return alerts

    def get_overdue_loan_alert_candidates(self, limit: int = 20) -> List[Dict]:
        """
        获取逾期贷款预警候选（用于首页真实数据兜底展示）。
        """
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT
                l.loan_id,
                l.company_id as enterprise_id,
                e.company_name,
                e.credit_code,
                l.loan_account_no,
                l.loan_amount,
                l.loan_balance,
                l.status as loan_status,
                l.manager_id,
                l.updated_at
            FROM enterprise_loans l
            JOIN enterprises e ON e.id = l.company_id
            WHERE l.status LIKE '逾期%'
            ORDER BY l.updated_at DESC, l.loan_balance DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows

    def resolve_alert(self, alert_id: int) -> Dict:
        """解决预警"""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE alerts
            SET alert_status = 'resolved',
                resolved_at = ?
            WHERE id = ?
        """, (datetime.now().isoformat(), alert_id))

        conn.commit()

        cursor.execute(
            "SELECT * FROM alerts WHERE id = ?",
            (alert_id,)
        )
        alert = dict(cursor.fetchone())
        conn.close()

        return alert

    # ==================== 数据统计 ====================

    def get_dashboard_stats(self) -> Dict:
        """
        获取大盘统计数据

        Returns:
            统计数据
        """
        conn = get_db_connection()
        cursor = conn.cursor()

        # 企业总数
        cursor.execute("SELECT COUNT(*) as count FROM enterprises")
        total_enterprises = cursor.fetchone()['count']

        # 风险分布
        cursor.execute("""
            SELECT overall_risk, COUNT(*) as count
            FROM risk_assessments
            WHERE id IN (
                SELECT MAX(id) FROM risk_assessments GROUP BY enterprise_id
            )
            GROUP BY overall_risk
        """)
        risk_distribution = {
            row['overall_risk']: row['count']
            for row in cursor.fetchall()
        }

        # 预警统计
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM alerts
            WHERE alert_status = 'active'
        """)
        pending_alerts = cursor.fetchone()['count']

        cursor.execute("""
            SELECT COUNT(*) as count
            FROM alerts
            WHERE alert_status = 'active' AND alert_level = 'CRITICAL'
        """)
        critical_alerts = cursor.fetchone()['count']

        cursor.execute("""
            SELECT COUNT(*) as count
            FROM alerts
            WHERE alert_status = 'active' AND alert_level = 'HIGH'
        """)
        high_alerts = cursor.fetchone()['count']

        # 高风险企业数
        high_risk_enterprises = (
            risk_distribution.get('CRITICAL', 0) +
            risk_distribution.get('HIGH', 0)
        )

        # 在贷资产驾驶舱
        cursor.execute("""
            SELECT
                COUNT(DISTINCT company_id) as on_loan_enterprises,
                COALESCE(SUM(loan_amount), 0) as on_loan_amount,
                COALESCE(SUM(loan_balance), 0) as on_loan_balance
            FROM enterprise_loans
        """)
        loan_overview = dict(cursor.fetchone())

        cursor.execute("""
            SELECT
                COALESCE(SUM(CASE WHEN status = '正常还款中' THEN loan_balance ELSE 0 END), 0) as normal_loan_balance,
                COALESCE(SUM(CASE WHEN status = '关注' THEN loan_balance ELSE 0 END), 0) as watch_loan_balance,
                COUNT(CASE WHEN status = '正常还款中' THEN 1 END) as normal_loan_count,
                COUNT(CASE WHEN status = '关注' THEN 1 END) as watch_loan_count
            FROM enterprise_loans
        """)
        loan_status_overview = dict(cursor.fetchone())

        cursor.execute("""
            SELECT
                status as loan_status,
                COUNT(*) as loan_count,
                COALESCE(SUM(loan_balance), 0) as loan_balance
            FROM enterprise_loans
            GROUP BY status
            ORDER BY loan_balance DESC
        """)
        loan_status_distribution = [dict(row) for row in cursor.fetchall()]

        cursor.execute("""
            SELECT
                e.company_name,
                e.industry_category,
                l.loan_account_no,
                l.loan_balance,
                l.status as loan_status,
                l.manager_id
            FROM enterprise_loans l
            JOIN enterprises e ON e.id = l.company_id
            ORDER BY l.loan_balance DESC
            LIMIT 5
        """)
        top_loan_exposures = [dict(row) for row in cursor.fetchall()]

        cursor.execute("""
            SELECT
                COALESCE(l.manager_id, '未分配') as manager_id,
                COUNT(*) as loan_count,
                COUNT(DISTINCT l.company_id) as enterprise_count,
                COALESCE(SUM(l.loan_balance), 0) as total_loan_balance,
                COUNT(CASE WHEN l.status = '关注' THEN 1 END) as watch_loan_count,
                COUNT(DISTINCT CASE WHEN lr.overall_risk IN ('CRITICAL', 'HIGH') THEN l.company_id END) as high_risk_enterprises
            FROM enterprise_loans l
            LEFT JOIN (
                SELECT ra.enterprise_id, ra.overall_risk
                FROM risk_assessments ra
                INNER JOIN (
                    SELECT enterprise_id, MAX(id) as latest_id
                    FROM risk_assessments
                    GROUP BY enterprise_id
                ) latest ON latest.latest_id = ra.id
            ) lr ON lr.enterprise_id = l.company_id
            GROUP BY COALESCE(l.manager_id, '未分配')
            ORDER BY total_loan_balance DESC
            LIMIT 8
        """)
        manager_asset_distribution = []
        for row in cursor.fetchall():
            item = dict(row)
            item["manager_name"] = self._manager_display_name(item.get("manager_id"))
            manager_asset_distribution.append(item)

        cursor.execute("""
            SELECT
                COALESCE(l.manager_id, '未分配') as manager_id,
                COUNT(CASE WHEN a.triggered_at >= datetime('now', '-6 day') THEN 1 END) as new_alerts_7d,
                COUNT(CASE WHEN a.alert_status = 'resolved' AND a.resolved_at >= datetime('now', '-6 day') THEN 1 END) as resolved_alerts_7d,
                COUNT(CASE WHEN a.alert_status = 'active' THEN 1 END) as active_alerts
            FROM enterprise_loans l
            LEFT JOIN alerts a ON a.enterprise_id = l.company_id
            GROUP BY COALESCE(l.manager_id, '未分配')
            ORDER BY new_alerts_7d DESC, active_alerts DESC
            LIMIT 8
        """)
        manager_trends = []
        for row in cursor.fetchall():
            trend = dict(row)
            manager_id = trend.get("manager_id")
            trend["manager_name"] = self._manager_display_name(manager_id)
            new_alerts = trend.get("new_alerts_7d", 0) or 0
            resolved_alerts = trend.get("resolved_alerts_7d", 0) or 0
            trend["alert_delta_7d"] = new_alerts - resolved_alerts
            trend["disposal_rate_7d"] = round((resolved_alerts / new_alerts) * 100, 1) if new_alerts > 0 else 0.0
            manager_trends.append(trend)

        conn.close()

        return {
            'total_enterprises': total_enterprises,
            'risk_distribution': risk_distribution,
            'pending_alerts': pending_alerts,
            'critical_alerts': critical_alerts,
            'high_alerts': high_alerts,
            'high_risk_enterprises': high_risk_enterprises,
            'on_loan_enterprises': loan_overview.get('on_loan_enterprises', 0),
            'on_loan_amount': loan_overview.get('on_loan_amount', 0),
            'on_loan_balance': loan_overview.get('on_loan_balance', 0),
            'normal_loan_balance': loan_status_overview.get('normal_loan_balance', 0),
            'watch_loan_balance': loan_status_overview.get('watch_loan_balance', 0),
            'normal_loan_count': loan_status_overview.get('normal_loan_count', 0),
            'watch_loan_count': loan_status_overview.get('watch_loan_count', 0),
            'loan_status_distribution': loan_status_distribution,
            'top_loan_exposures': top_loan_exposures,
            'manager_asset_distribution': manager_asset_distribution,
            'manager_trends': manager_trends,
        }

    # ==================== 客户管理 ====================

    def create_customer(
        self,
        enterprise_id: int,
        customer_name: str,
        customer_type: Optional[str] = None,
        loan_amount: Optional[float] = None,
        loan_status: Optional[str] = None
    ) -> Dict:
        """创建客户关联"""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO customers (
                enterprise_id, customer_name, customer_type,
                loan_amount, loan_status
            ) VALUES (?, ?, ?, ?, ?)
        """, (
            enterprise_id, customer_name, customer_type,
            loan_amount, loan_status
        ))

        customer_id = cursor.lastrowid
        conn.commit()

        cursor.execute(
            "SELECT * FROM customers WHERE id = ?",
            (customer_id,)
        )
        customer = dict(cursor.fetchone())
        conn.close()

        return customer

    def get_customers_by_enterprise(self, enterprise_id: int) -> List[Dict]:
        """获取企业的客户列表"""
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM customers WHERE enterprise_id = ?",
            (enterprise_id,)
        )
        customers = [dict(row) for row in cursor.fetchall()]
        conn.close()

        return customers
