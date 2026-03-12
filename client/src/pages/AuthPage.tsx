import { useState } from "react";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import { useNavigate, useSearchParams } from "react-router-dom";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  const navigate = useNavigate();

  const handleRedirect = () => {
    if (redirect) {
      navigate(redirect);
    } else {
      navigate("/campaigns");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold text-amber-400">DnD Campaign Manager</h1>
      {isLogin ? <Login handleRedirect={handleRedirect} /> : <Register handleRedirect={handleRedirect} />}
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="text-amber-300 hover:text-amber-100 underline cursor-pointer transition-colors duration-200"
      >
        {isLogin ? "Don't have an account?" : "Already have an account?"}
      </button>
    </div>
  );
}

export default AuthPage;
