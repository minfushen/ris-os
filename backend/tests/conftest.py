"""
pytest 共享 fixture：为整个测试会话准备独立的企业数据中心数据库。

CI 是干净环境（数据库文件不入库），测试前必须建表；
同时使用独立临时库，避免测试写入污染开发库 dev.db / enterprise_hub.db。
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import enterprise_db

# 指向测试专用数据库（已被 .gitignore 的 backend/*.db 覆盖）
enterprise_db.DB_PATH = Path(__file__).resolve().parent / ".test_enterprise_hub.db"
enterprise_db.init_enterprise_db()
