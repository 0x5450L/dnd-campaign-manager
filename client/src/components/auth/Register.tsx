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
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" />
        <input type="password" name="password" placeholder="Password" />
        <input type="text" name="name" placeholder="Name" />
        <button type="submit">Register</button>
        {registerError && <p className="text-red-500">{registerError}</p>}
      </form>
    </div>
  );
}

export default Register;
