import { useState } from "react";
import CommonButton from "../../ui/buttons/CommonButton";
import CommonInput from "../../ui/inputs/CommonInput";
import { useCreateInviteMutation } from "../../../queries/invites";
import type { ApiError } from "../../../services/api/errors";

const PANEL_LABEL =
  "font-fantasy text-xs font-bold uppercase tracking-[0.16em] text-gold-bright";

export default function CreateInvite({ campaignId }: { campaignId: string }) {
  const linkInvite = useCreateInviteMutation();
  const emailInvite = useCreateInviteMutation();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [linkButtonText, setLinkButtonText] = useState("Get invite link");

  const handleGetLink = () => {
    setLinkButtonText("Generating...");
    linkInvite.mutate(
      { campaignId },
      {
        onSuccess: (data) => {
          const link = `${window.location.origin}/invite/${data.response.token}`;
          navigator.clipboard.writeText(link);
          setLinkButtonText("Copied!");
          setTimeout(() => setLinkButtonText("Get invite link"), 2000);
        },
        onError: (error) => {
          console.error((error as ApiError).data.error.message);
          setLinkButtonText("Error!");
          setTimeout(() => setLinkButtonText("Get invite link"), 2000);
        },
      },
    );
  };

  const handleSendInvite = () => {
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!email.includes("@")) {
      setEmailError("Invalid email");
      return;
    }
    setEmailError(null);
    setEmailSuccess(null);

    emailInvite.mutate(
      { campaignId, email },
      {
        onSuccess: () => {
          setEmailSuccess("Invite sent!");
          setEmail("");
          setTimeout(() => setEmailSuccess(null), 3000);
        },
        onError: (error) => {
          setEmailError((error as ApiError).data.error.message);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={PANEL_LABEL}>Invite players</span>
        <div className="flex flex-wrap items-center gap-2">
          <CommonButton onClick={handleGetLink} size="sm" disabled={linkInvite.isPending}>
            {linkButtonText}
          </CommonButton>
          <CommonButton
            onClick={handleSendInvite}
            variant="accept"
            size="sm"
            disabled={emailInvite.isPending}
          >
            {emailInvite.isPending ? "Sending..." : "Send invite"}
          </CommonButton>
        </div>
      </div>

      <CommonInput
        type="email"
        name="email"
        placeholder="Player's email"
        variant="boxed"
        value={email}
        onChange={(value) => {
          setEmail(value);
          setEmailError(null);
          setEmailSuccess(null);
        }}
      />

      {(emailSuccess || emailError) && (
        <div className="flex justify-end">
          {emailSuccess && <p className="text-leaf text-xs">{emailSuccess}</p>}
          {emailError && <p className="text-rust text-xs">{emailError}</p>}
        </div>
      )}
    </div>
  );
}
