import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppSider from "./AppSider";
import "@/styles/tailwind.css";

export default function AppLayout() {
  return (
    <div 
      className="min-h-screen" 
      style={{ 
        background: "linear-gradient(135deg, #e8ecf0 0%, #f5f7fa 50%, #f0f2f5 100%)" 
      }}
    >
      {/* 顶部栏 */}
      <AppHeader />

      <div className="flex" style={{ minHeight: "calc(100vh - var(--header-height, 52px))" }}>
        {/* 左侧导航 */}
        <AppSider />

        {/* 主内容区 */}
        <main
          className="flex-1 overflow-auto"
          style={{
            paddingLeft: "var(--content-padding-x, 24px)",
            paddingRight: "var(--content-padding-x, 24px)",
            paddingTop: "var(--content-padding-y, 24px)",
            paddingBottom: "var(--content-padding-y, 24px)",
          }}
        >
          <div className="max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
