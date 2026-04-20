"""风控管理 OS - 入口文件"""

from app import app

if __name__ == "__main__":
    import uvicorn
    # 与 README / 前端 VITE_API_BASE_URL 默认端口一致（8000）
    uvicorn.run(app, host="127.0.0.1", port=8000)
