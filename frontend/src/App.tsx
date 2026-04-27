import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Skeleton } from "antd";
import AppLayout from "@/components/AppLayout";

// 路由级懒加载
const Home = lazy(() => import("@/pages/Home"));

// 监控分析模块
const Dashboard = lazy(() => import("@/pages/Monitor/Dashboard"));
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

// 智能体协同模块
const AgentAttribution = lazy(() => import("@/pages/Agents/AttributionAgent"));
const AgentDisposition = lazy(() => import("@/pages/Agents/DispositionAgent"));
const AgentStrategyTuning = lazy(() => import("@/pages/Agents/StrategyTuningAgent"));
const AgentScriptCompliance = lazy(() => import("@/pages/Agents/ScriptComplianceAgent"));
const AgentReviewQa = lazy(() => import("@/pages/Agents/ReviewQaAgent"));
const AgentOpsMonitor = lazy(() => import("@/pages/Agents/OpsMonitor"));

// 系统架构说明
const IntegrationArchitecture = lazy(() => import("@/pages/Architecture/Integration"));

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

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: withSuspense(<Home />) },

      { path: "monitor/asset-quality", element: withSuspense(<AssetQuality />) },
      { path: "monitor/dashboard", element: withSuspense(<Dashboard />) },
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

      { path: "agents/attribution", element: withSuspense(<AgentAttribution />) },
      { path: "agents/disposition", element: withSuspense(<AgentDisposition />) },
      { path: "agents/strategy-tuning", element: withSuspense(<AgentStrategyTuning />) },
      { path: "agents/script-compliance", element: withSuspense(<AgentScriptCompliance />) },
      { path: "agents/review-qa", element: withSuspense(<AgentReviewQa />) },
      { path: "agents/ops-monitor", element: withSuspense(<AgentOpsMonitor />) },

      { path: "architecture/integration", element: withSuspense(<IntegrationArchitecture />) },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
