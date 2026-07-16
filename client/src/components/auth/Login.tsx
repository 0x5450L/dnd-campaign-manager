import { useState } from "react";
import { useLoginMutation } from "@/queries/auth";
import type { ApiError } from "@/services/api/errors";
import CommonButton from "../ui/buttons/CommonButton";
import CommonInput from "../ui/inputs/CommonInput";

function Login({ handleRedirect }: { handleRedirect: () => void }) {
  const loginMutation = useLoginMutation();
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
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          handleRedirect();
        },
        onError: (error) => {
          setLoginError((error as ApiError).data.error.message);
        },
      },
    );
  };
  return (
    <div className="flex flex-col items-center gap-4 bg-surface/50 p-8 rounded-xl border border-rule w-80">
      <h2 className="text-xl font-bold text-ink">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
        <CommonInput type="email" name="email" placeholder="Email" variant="boxed" />
        <CommonInput type="password" name="password" placeholder="Password" variant="boxed" />
        <CommonButton type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </CommonButton>
        {loginError && <p className="text-rust text-sm">{loginError}</p>}
      </form>
    </div>
  );
}

export default Login;
