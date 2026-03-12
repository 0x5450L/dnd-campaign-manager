import { useAuth } from "../../hooks/useAuth";
import { login } from "../../services/api/auth";
import { useState } from "react";
import type { ApiError } from "../../services/api/errors";

function Login({ handleRedirect }: { handleRedirect: () => void }) {
  const { setAuth } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    if (!email || !password) {
      setLoginError("Email and password are required");
      return;
    }
    login(email, password)
      .then((data) => {
        setAuth(data.user, data.token);
        handleRedirect();
      })
      .catch((error: ApiError) => {
        setLoginError(error.data.message);
      });
  };
  return (
    <div className="flex flex-col items-center gap-4 bg-gray-800/50 p-8 rounded-xl border border-gray-700 w-80">
      <h2 className="text-xl font-bold text-gray-200">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
        <input type="email" name="email" placeholder="Email" className="bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-amber-500" />
        <input type="password" name="password" placeholder="Password" className="bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-amber-500" />
        <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold p-2.5 rounded-lg cursor-pointer transition-colors duration-200">
          Login
        </button>
        {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
      </form>
    </div>
  );
}

export default Login;
