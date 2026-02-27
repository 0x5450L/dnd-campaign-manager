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

    register(email, password, name)
      .then((data) => {
        setAuth(data.user, data.token);
        navigate("/");
      })
      .catch((error: ApiError) => {
        setRegisterError(error.data.message);
      });
  };
  return (
    <div className="flex flex-col items-center justify-center fit-content mg-auto">
      <h1 className="text-2xl font-bold">Register</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" className="border-2 border-gray-300 rounded-md p-2" />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border-2 border-gray-300 rounded-md p-2"
        />
        <input type="text" name="name" placeholder="Name" className="border-2 border-gray-300 rounded-md p-2" />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded-md cursor-pointer">
          Register
        </button>
        {registerError && <p className="text-red-500">{registerError}</p>}
      </form>
    </div>
  );
}

export default Register;
