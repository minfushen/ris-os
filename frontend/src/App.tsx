import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Skeleton } from "antd";
import AppLayout from "@/components/AppLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// 路由级懒加载
const Home = lazy(() => import("@/pages/Home"));

// 监控分析模块
const Dashboard = lazy(() => import("@/pages/Monitor/Dashboard"));
const WatchlistUpload = lazy(() => import("@/pages/Monitor/WatchlistUpload"));
const Reports = lazy(() => import("@/pages/Monitor/Reports"));
const O2OMonitor = lazy(() => import("@/pages/Monitor/O2OMonitor"));
const LabelingFlywheel = lazy(() => import("@/pages/Monitor/LabelingFlywheel"));
const AssetQuality = lazy(() => import("@/pages/Monitor/AssetQuality"));

// 预警策略模块
const StrategyProducts = lazy(() => import("@/pages/Strategy/Products"));
const Rules = lazy(() => import("@/pages/Strategy/Rules"));
const Backtest = lazy(() => import("@/pages/Strategy/Backtest"));
const ModelFactory = lazy(() => import("@/pages/Strategy/ModelFactory"));
const ModelRegistry = lazy(() => import("@/pages/Strategy/ModelRegistry"));
const DecisionFlow = lazy(() => import("@/pages/Strategy/DecisionFlow"));
const PublishPage = lazy(() => import("@/pages/Strategy/PublishPage"));

// 处置闭环模块
const Workbench = lazy(() => import("@/pages/Risk/Workbench"));
const CollectionOps = lazy(() => import("@/pages/Risk/CollectionOps"));
const Inspection = lazy(() => import("@/pages/Risk/Inspection"));

// 知识沉淀
const KnowledgeIndex = lazy(() => import("@/pages/Knowledge/Index"));
const ScriptsLibrary = lazy(() => import("@/pages/Knowledge/ScriptsLibrary"));
const RuleTuneCases = lazy(() => import("@/pages/Knowledge/RuleTuneCases"));
const FraudPatterns = lazy(() => import("@/pages/Knowledge/FraudPatterns"));

// 特征工程模块
const FeatureStudio = lazy(() => import("@/pages/Feature/Studio"));

// 数据资产模块
const Dictionary = lazy(() => import("@/pages/Data/Dictionary"));

// 项目实施（对照《项目实施计划书》）
const ImplementationPlan = lazy(() => import("@/pages/Project/ImplementationPlan"));

// 系统架构说明
const IntegrationArchitecture = lazy(() => import("@/pages/Architecture/Integration"));

// 智能体协同
const AgentAttribution = lazy(() => import("@/pages/Agents/Attribution"));
const AgentVendorRiskAssessment = lazy(() => import("@/pages/Agents/VendorRiskAssessment"));
const AgentDisposition = lazy(() => import("@/pages/Agents/Disposition"));
const AgentStrategyTuning = lazy(() => import("@/pages/Agents/StrategyTuning"));
const AgentReviewQa = lazy(() => import("@/pages/Agents/ReviewQa"));
const AgentOpsMonitor = lazy(() => import("@/pages/Agents/OpsMonitor"));

// 404
const NotFound = lazy(() => import("@/pages/NotFound"));

function PageFallback() {
  return (
    <div className="p-6">
      <Skeleton active paragraph={{ rows: 8 }} />
    </div>
  );
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

function withErrorBoundary(element: ReactNode) {
  return <ErrorBoundary>{element}</ErrorBoundary>;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: withErrorBoundary(<AppLayout />),
    children: [
      { index: true, element: withSuspense(<Home />) },

      { path: "monitor/asset-quality", element: withSuspense(<AssetQuality />) },
      { path: "monitor/dashboard", element: withSuspense(<Dashboard />) },
      { path: "monitor/watchlist-upload", element: withSuspense(<WatchlistUpload />) },
      { path: "monitor/o2o", element: withSuspense(<O2OMonitor />) },
      { path: "monitor/labeling", element: withSuspense(<LabelingFlywheel />) },
      { path: "monitor/reports", element: withSuspense(<Reports />) },

      { path: "strategy/list", element: <Navigate to="/strategy/products" replace /> },
      { path: "strategy/products", element: withSuspense(<StrategyProducts />) },
      { path: "strategy/rules", element: withSuspense(<Rules />) },
      { path: "strategy/model-factory", element: withSuspense(<ModelFactory />) },
      { path: "strategy/model-registry", element: withSuspense(<ModelRegistry />) },
      { path: "strategy/decision-flow", element: withSuspense(<DecisionFlow />) },
      { path: "strategy/backtest", element: withSuspense(<Backtest />) },
      { path: "strategy/publish", element: withSuspense(<PublishPage />) },

      { path: "risk/fraud", element: <Navigate to="/risk/workbench" replace /> },
      { path: "risk/workbench", element: withSuspense(<Workbench />) },
      { path: "risk/collection", element: withSuspense(<CollectionOps />) },
      { path: "risk/inspection", element: withSuspense(<Inspection />) },

      { path: "knowledge", element: withSuspense(<KnowledgeIndex />) },
      { path: "knowledge/scripts", element: withSuspense(<ScriptsLibrary />) },
      { path: "knowledge/rule-cases", element: withSuspense(<RuleTuneCases />) },
      { path: "knowledge/fraud-patterns", element: withSuspense(<FraudPatterns />) },

      { path: "feature/studio", element: withSuspense(<FeatureStudio />) },

      { path: "data/dictionary", element: withSuspense(<Dictionary />) },

      { path: "project/plan", element: withSuspense(<ImplementationPlan />) },

      { path: "architecture/integration", element: withSuspense(<IntegrationArchitecture />) },

      { path: "agents/attribution", element: withSuspense(<AgentAttribution />) },
      { path: "agents/vendor-risk-assessment", element: withSuspense(<AgentVendorRiskAssessment />) },
      { path: "agents/disposition", element: withSuspense(<AgentDisposition />) },
      { path: "agents/strategy-tuning", element: withSuspense(<AgentStrategyTuning />) },
      { path: "agents/review-qa", element: withSuspense(<AgentReviewQa />) },
      { path: "agents/ops-monitor", element: withSuspense(<AgentOpsMonitor />) },

      { path: "*", element: withSuspense(<NotFound />) },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
