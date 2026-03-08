import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { register } from "../../services/api/auth";
import type { ApiError } from "../../services/api/errors";

function Register() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    if (!email || !password || !name) {
      setRegisterError("Email, password and name are required");
      return;
    }
    
    register(email, password, name)
      .then((data) => {
        setAuth(data.user, data.token);
        navigate("/campaigns");
      })
      .catch((error: ApiError) => {
        setRegisterError(error.data.message);
      });
  };
  return (
    <div className="flex flex-col items-center gap-4 bg-gray-800/50 p-8 rounded-xl border border-gray-700 w-80">
      <h2 className="text-xl font-bold text-gray-200">Register</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
        <input type="email" name="email" placeholder="Email" className="bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-amber-500" />
        <input type="password" name="password" placeholder="Password" className="bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-amber-500" />
        <input type="text" name="name" placeholder="Name" className="bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-amber-500" />
        <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold p-2.5 rounded-lg cursor-pointer transition-colors duration-200">
          Register
        </button>
        {registerError && <p className="text-red-400 text-sm">{registerError}</p>}
      </form>
    </div>
  );
}

export default Register;
