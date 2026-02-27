import { useState } from "react";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Auth Page</h1>
      {isLogin ? <Login /> : <Register />}
      <button onClick={() => setIsLogin(!isLogin)} className="bg-blue-500 text-white p-2 rounded-md cursor-pointer">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
      </button>
    </div>
  );
}

export default AuthPage;
