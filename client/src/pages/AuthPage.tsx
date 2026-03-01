import { useState } from "react";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold text-amber-400">DnD Campaign Manager</h1>
      {isLogin ? <Login /> : <Register />}
      <button onClick={() => setIsLogin(!isLogin)} className="text-amber-300 hover:text-amber-100 underline cursor-pointer transition-colors duration-200">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
      </button>
    </div>
  );
}

export default AuthPage;
