import { Button, Result, Space } from "antd";
import { HomeOutlined, RollbackOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Result
        status="404"
        title="页面不存在"
        subTitle="您访问的页面路径不存在或已被移除。请检查 URL 或返回首页。"
        extra={
          <Space>
            <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate("/")}>
              返回首页
            </Button>
            <Button icon={<RollbackOutlined />} onClick={() => navigate(-1)}>
              返回上页
            </Button>
          </Space>
        }
      />
    </div>
  );
}
