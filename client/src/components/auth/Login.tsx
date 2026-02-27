import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { login } from "../../services/api/auth";
import { useState } from "react";
import type { ApiError } from "../../services/api/errors";

function Login() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string|null>(null);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    login(email, password)
      .then((data) => {
        setAuth(data.user, data.token);
        navigate("/");
      })
      .catch((error: ApiError) => {
        setLoginError(error.data.message);
      });
  };
  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" />
        <input type="password" name="password" placeholder="Password" />
        <button type="submit">Login</button>
        {loginError && <p className="text-red-500">{loginError}</p>}
      </form>
    </div>
  );
}

export default Login;
