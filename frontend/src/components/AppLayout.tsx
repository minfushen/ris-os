import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import AppSider from "./AppSider";
import "@/styles/tailwind.css";

export default function AppLayout() {
  return (
    <div className="page-shell-root">
      <AppHeader />

      <div className="page-shell-body-row">
        <AppSider />

        <main className="page-shell-main">
          <div className="page-shell-main-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
