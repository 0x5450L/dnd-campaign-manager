import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMeQuery } from "../queries/auth";
import { useRespondToInviteMutation } from "../queries/invites";
import type { ApiError } from "../services/api/errors";

function InvitePage() {
  const { token } = useParams();
  const { data: user, isLoading: isUserLoading } = useMeQuery();
  const navigate = useNavigate();
  const respondToInvite = useRespondToInviteMutation();
  const hasResponded = useRef(false);

  const { mutate: respond } = respondToInvite;

  useEffect(() => {
    if (!token) {
      navigate("/campaigns");
      return;
    }

    if (isUserLoading) return;

    if (!user) {
      navigate("/auth?redirect=/invite/" + token);
      return;
    }

    if (hasResponded.current) return;
    hasResponded.current = true;

    respond(
      { token, action: "accept" },
      {
        onSettled: () => {
          setTimeout(() => {
            navigate("/campaigns", { replace: true });
          }, 1000);
        },
      },
    );
  }, [token, user, isUserLoading, navigate, respond]);

  const isLoading = respondToInvite.isPending || respondToInvite.isIdle;
  const error = respondToInvite.isError
    ? (respondToInvite.error as ApiError).data.error.message
    : null;

  return (
    <div className="flex items-center justify-center h-[calc(100vh-53px)]">
      <div className="bg-surface/50 p-6 rounded-xl border border-rule flex flex-col gap-4 h-fit min-w-72">
        <h1 className="text-3xl font-bold text-gold">Invite</h1>

        {isLoading && <p className="text-sm text-dim">Loading...</p>}
        {respondToInvite.isSuccess && (
          <p className="text-sm text-leaf">Invite accepted successfully</p>
        )}
        {!respondToInvite.isSuccess && error && (
          <p className="text-sm text-rust">{error}</p>
        )}
      </div>
    </div>
  );
}

export default InvitePage;
