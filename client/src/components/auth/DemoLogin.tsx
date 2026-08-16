import { useState } from "react";
import { useLoginMutation } from "@/queries/auth";
import type { ApiError } from "@/services/api/errors";
import CommonButton from "../ui/buttons/CommonButton";

/**
 * Everything demo-related lives in this one file so the whole feature can be
 * dropped by deleting it and its single usage in AuthPage. The credentials are
 * public by design — they are printed in the README and seeded by db:seed.
 */

const DEMO_PASSWORD = "demo1234";

const DEMO_ROLES = [
  {
    email: "dm@demo.local",
    label: "Enter as Dungeon Master",
    hint: "Run the encounter, see hidden creatures",
  },
  {
    email: "mira@demo.local",
    label: "Enter as Player",
    hint: "Control one character, see only what the party sees",
  },
] as const;

function DemoLogin({ onSuccess }: { onSuccess: () => void }) {
  const loginMutation = useLoginMutation();
  const [error, setError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const enter = (email: string) => {
    setPendingEmail(email);
    setError(null);
    loginMutation.mutate(
      { email, password: DEMO_PASSWORD },
      {
        onSuccess,
        onError: (cause) => {
          setError((cause as ApiError).message);
          setPendingEmail(null);
        },
      },
    );
  };

  return (
    <div className="flex w-80 flex-col gap-3 rounded-xl border border-rule bg-surface/30 p-6">
      <p className="text-center font-fantasy text-xs uppercase tracking-widest text-faint">
        Try it without signing up
      </p>

      {DEMO_ROLES.map((role) => (
        <div key={role.email} className="flex flex-col gap-1">
          <CommonButton
            variant="secondary"
            size="sm"
            disabled={loginMutation.isPending}
            onClick={() => enter(role.email)}
          >
            {pendingEmail === role.email ? "Entering..." : role.label}
          </CommonButton>
          <span className="text-center text-[11px] text-faint">{role.hint}</span>
        </div>
      ))}

      {error && <p className="text-center text-sm text-rust">{error}</p>}
    </div>
  );
}

export default DemoLogin;
