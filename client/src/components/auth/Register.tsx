import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { register } from "../../services/api/auth";
import type { ApiError } from "../../services/api/errors";
import CommonButton from "../ui/buttons/CommonButton";
import CommonInput from "../ui/inputs/CommonInput";

function Register({ handleRedirect }: { handleRedirect: () => void }) {
  const { setAuth } = useAuth();
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
        handleRedirect();
      })
      .catch((error: ApiError) => {
        setRegisterError(error.data.message);
      });
  };
  return (
    <div className="flex flex-col items-center gap-4 bg-gray-800/50 p-8 rounded-xl border border-gray-700 w-80">
      <h2 className="text-xl font-bold text-gray-200">Register</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
        <CommonInput type="email" name="email" placeholder="Email" variant="boxed" />
        <CommonInput type="password" name="password" placeholder="Password" variant="boxed" />
        <CommonInput type="text" name="name" placeholder="Name" variant="boxed" />
        <CommonButton type="submit">Register</CommonButton>
        {registerError && <p className="text-red-400 text-sm">{registerError}</p>}
      </form>
    </div>
  );
}

export default Register;
