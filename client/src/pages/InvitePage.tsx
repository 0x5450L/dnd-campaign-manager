import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { respondToInvite } from "../services/api/invites";
import type { ApiError } from "../services/api/errors";

function InvitePage() {
  const { token } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/campaigns");
      return;
    }

    if (!user) {
      navigate("/auth?redirect=/invite/" + token);
      return;
    }

    respondToInvite(token as string, "accept")
      .then(() => {
        setSuccess("Invite accepted successfully");
      })
      .catch((error: ApiError) => {
        setError(error.data.error.message);
        console.error(error.data.error.message);
      })
      .finally(async () => {
        setIsLoading(false);
        setTimeout(() => {
          navigate("/campaigns", { replace: true });
        }, 1000);
      });
  }, [token]);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-53px)]">
      <div className="bg-surface/50 p-6 rounded-xl border border-rule flex flex-col gap-4 h-fit min-w-72">
        <h1 className="text-3xl font-bold text-gold">Invite</h1>

        {isLoading && <p className="text-sm text-dim">Loading...</p>}
        {success && <p className="text-sm text-leaf">{success}</p>}
        {!success && error && <p className="text-sm text-rust">{error}</p>}
      </div>
    </div>
  );
}

export default InvitePage;
