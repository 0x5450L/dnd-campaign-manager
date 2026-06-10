import { useState } from "react";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to={redirect ?? "/campaigns"} replace />;
  }

  const handleRedirect = () => {
    const target = redirect ?? "/campaigns";
    navigate(target, { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold text-gold">DnD Campaign Manager</h1>
      {isLogin ? <Login handleRedirect={handleRedirect} /> : <Register handleRedirect={handleRedirect} />}
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="text-gold-bright hover:text-gold-bright underline cursor-pointer transition-colors duration-200"
      >
        {isLogin ? "Don't have an account?" : "Already have an account?"}
      </button>
    </div>
  );
}

export default AuthPage;
