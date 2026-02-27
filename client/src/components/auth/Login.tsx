import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { login } from "../../services/api/auth";
import { useState } from "react";
import type { ApiError } from "../../services/api/errors";

function Login() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    console.log(email, password);
    if (!email || !password) {
      setLoginError("Email and password are required");
      return;
    }
    login(email, password)
      .then((data) => {
        console.log(data);
        setAuth(data.user, data.token);
        navigate("/");
      })
      .catch((error: ApiError) => {
        setLoginError(error.data.message);
      });
  };
  return (
    <div className="flex flex-col items-center justify-center fit-content mg-auto">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" className="border-2 border-gray-300 rounded-md p-2" />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border-2 border-gray-300 rounded-md p-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md">
          Login
        </button>
        {loginError && <p className="text-red-500">{loginError}</p>}
      </form>
    </div>
  );
}

export default Login;
