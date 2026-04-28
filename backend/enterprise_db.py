"""
企业数据中心数据库初始化

包含企业档案、风险评估、预警管理、客户关联等表结构
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "enterprise_hub.db"


def get_db_connection():
    """获取数据库连接"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_enterprise_db():
    """初始化企业数据中心数据库"""

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. 企业档案表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS enterprises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT NOT NULL UNIQUE,
            credit_code TEXT,
            legal_person TEXT,
            registered_capital TEXT,
            paid_in_capital TEXT,
            established_date TEXT,
            registration_status TEXT,
            business_scope TEXT,
            registered_address TEXT,
            actual_address TEXT,
            phone TEXT,
            industry_code TEXT,
            industry_category TEXT,
            company_type TEXT,
            major_shareholders TEXT,
            shareholding_ratio TEXT,
            ultimate_beneficiary TEXT,
            email TEXT,
            website TEXT,
            employee_count INTEGER,
            tax_credit_level TEXT,
            annual_revenue REAL,
            is_dishonest INTEGER,
            court_cases INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    def ensure_column(table_name: str, column_name: str, definition: str) -> None:
        cursor.execute(f"PRAGMA table_info({table_name})")
        existing_columns = {row["name"] for row in cursor.fetchall()}
        if column_name not in existing_columns:
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {definition}")

    # 历史库兼容：补齐新增字段
    ensure_column("enterprises", "paid_in_capital", "TEXT")
    ensure_column("enterprises", "actual_address", "TEXT")
    ensure_column("enterprises", "phone", "TEXT")
    ensure_column("enterprises", "industry_code", "TEXT")
    ensure_column("enterprises", "industry_category", "TEXT")
    ensure_column("enterprises", "company_type", "TEXT")
    ensure_column("enterprises", "major_shareholders", "TEXT")
    ensure_column("enterprises", "shareholding_ratio", "TEXT")
    ensure_column("enterprises", "ultimate_beneficiary", "TEXT")
    ensure_column("enterprises", "email", "TEXT")
    ensure_column("enterprises", "website", "TEXT")
    ensure_column("enterprises", "employee_count", "INTEGER")
    ensure_column("enterprises", "tax_credit_level", "TEXT")
    ensure_column("enterprises", "annual_revenue", "REAL")
    ensure_column("enterprises", "is_dishonest", "INTEGER")
    ensure_column("enterprises", "court_cases", "INTEGER")

    # 2. 风险评估记录表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS risk_assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            enterprise_id INTEGER NOT NULL,
            overall_risk TEXT NOT NULL,
            assessment_data TEXT,
            assessment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (enterprise_id) REFERENCES enterprises(id)
        )
    """)

    # 3. 预警记录表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            enterprise_id INTEGER NOT NULL,
            alert_type TEXT NOT NULL,
            alert_level TEXT NOT NULL,
            alert_source TEXT,
            alert_status TEXT DEFAULT 'active',
            triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP,
            FOREIGN KEY (enterprise_id) REFERENCES enterprises(id)
        )
    """)

    # 4. 客户关联表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            enterprise_id INTEGER NOT NULL,
            customer_name TEXT NOT NULL,
            customer_type TEXT,
            loan_amount REAL,
            loan_status TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (enterprise_id) REFERENCES enterprises(id)
        )
    """)

    # 5. 股东信息关联表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS enterprise_shareholders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id INTEGER NOT NULL,
            shareholder_name TEXT NOT NULL,
            shareholder_type TEXT,
            contribution_amount REAL,
            contribution_ratio REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES enterprises(id),
            UNIQUE(company_id, shareholder_name, contribution_amount, contribution_ratio)
        )
    """)

    # 6. 贷款业务关联表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS enterprise_loans (
            loan_id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id INTEGER NOT NULL,
            loan_account_no TEXT,
            loan_amount REAL,
            credit_limit REAL,
            loan_balance REAL,
            interest_rate REAL,
            start_date TEXT,
            end_date TEXT,
            status TEXT,
            manager_id TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES enterprises(id),
            UNIQUE(company_id, loan_amount, start_date, end_date, status, manager_id)
        )
    """)
    ensure_column("enterprise_loans", "loan_account_no", "TEXT")
    ensure_column("enterprise_loans", "credit_limit", "REAL")
    ensure_column("enterprise_loans", "loan_balance", "REAL")

    # 创建索引
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_enterprises_name
        ON enterprises(company_name)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_enterprises_credit_code
        ON enterprises(credit_code)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_enterprises_industry_code
        ON enterprises(industry_code)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_enterprises_industry_category
        ON enterprises(industry_category)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_risk_assessments_enterprise
        ON risk_assessments(enterprise_id)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_alerts_enterprise
        ON alerts(enterprise_id)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_alerts_status
        ON alerts(alert_status)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_shareholders_company
        ON enterprise_shareholders(company_id)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_loans_company
        ON enterprise_loans(company_id)
    """)

    conn.commit()
    conn.close()

    print(f"✅ 企业数据中心数据库初始化完成: {DB_PATH}")


if __name__ == "__main__":
    init_enterprise_db()
