import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Header from "./app/AppHeader";
import DiceRoller from "./dice/DiceRoller";

function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <DiceRoller />
    </div>
  );
}

export default ProtectedRoute;
