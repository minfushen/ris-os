import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppSider from "./AppSider";
import "@/styles/tailwind.css";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-app-bg" style={{ background: "linear-gradient(135deg, #eef4f3 0%, #f8fafc 100%)" }}>
      {/* 顶部栏 */}
      <AppHeader />

      <div className="flex" style={{ minHeight: "calc(100vh - 48px)" }}>
        {/* 左侧导航 */}
        <AppSider />

        {/* 主内容区 */}
        <main className="flex-1 p-4 overflow-auto">
          <div className="max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
