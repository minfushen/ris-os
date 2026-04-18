import { lazy, Suspense } from "react";
import { createHashRouter, Navigate, RouterProvider } from "react-router-dom";
import { Skeleton } from "antd";
import AppLayout from "@/components/AppLayout";

// 路由级懒加载
const Home = lazy(() => import("@/pages/Home"));

// 监控分析模块
const Dashboard = lazy(() => import("@/pages/Monitor/Dashboard"));
const Reports = lazy(() => import("@/pages/Monitor/Reports"));
const O2OMonitor = lazy(() => import("@/pages/Monitor/O2OMonitor"));
const LabelingFlywheel = lazy(() => import("@/pages/Monitor/LabelingFlywheel"));

// 策略引擎模块
const StrategyList = lazy(() => import("@/pages/Strategy/List"));
const Rules = lazy(() => import("@/pages/Strategy/Rules"));
const Backtest = lazy(() => import("@/pages/Strategy/Backtest"));
const PublishPage = lazy(() => import("@/pages/Strategy/PublishPage"));

// 风险核查模块
const Fraud = lazy(() => import("@/pages/Risk/Fraud"));
const Inspection = lazy(() => import("@/pages/Risk/Inspection"));

// 特征工程模块
const FeatureStudio = lazy(() => import("@/pages/Feature/Studio"));

// 数据资产模块
const Dictionary = lazy(() => import("@/pages/Data/Dictionary"));

function PageFallback() {
  return (
    <div className="p-6">
      <Skeleton active paragraph={{ rows: 8 }} />
    </div>
  );
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

const router = createHashRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      // 工作台首页
      { index: true, element: withSuspense(<Home />) },

      // 监控与分析
      { path: "monitor/dashboard", element: withSuspense(<Dashboard />) },
      { path: "monitor/o2o", element: withSuspense(<O2OMonitor />) },
      { path: "monitor/labeling", element: withSuspense(<LabelingFlywheel />) },
      { path: "monitor/reports", element: withSuspense(<Reports />) },

      // 策略管控
      { path: "strategy/list", element: withSuspense(<StrategyList />) },
      { path: "strategy/rules", element: withSuspense(<Rules />) },
      { path: "strategy/backtest", element: withSuspense(<Backtest />) },
      { path: "strategy/publish", element: withSuspense(<PublishPage />) },

      // 风险核查
      { path: "risk/fraud", element: withSuspense(<Fraud />) },
      { path: "risk/inspection", element: withSuspense(<Inspection />) },

      // 特征工程
      { path: "feature/studio", element: withSuspense(<FeatureStudio />) },

      // 数据资产
      { path: "data/dictionary", element: withSuspense(<Dictionary />) },

      // 未匹配路由重定向到首页
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
