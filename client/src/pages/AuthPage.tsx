import { useState } from "react";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div>
      <h1>Auth Page</h1>
      {isLogin ? <Login /> : <Register />}
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}
      </button>
    </div>
  );
}

export default AuthPage;
