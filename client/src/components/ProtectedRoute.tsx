import { Navigate, Outlet } from "react-router-dom";
import { useMeQuery } from "../queries/auth";
import AppLoading from "./app/AppLoading";
import Header from "./app/AppHeader";
import DiceRoller from "./dice/DiceRoller";
import { LiveSessionSocketBridge } from "./app/LiveSessionSocketBridge";

function ProtectedRoute() {
  const { data: user, isLoading } = useMeQuery();
  if (isLoading) {
    return <AppLoading />;
  }
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <LiveSessionSocketBridge />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <DiceRoller />
    </div>
  );
}

export default ProtectedRoute;
