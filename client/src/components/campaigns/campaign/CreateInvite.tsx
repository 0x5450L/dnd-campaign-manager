import { useState } from "react";
import CommonButton from "../../ui/buttons/CommonButton";
import CommonInput from "../../ui/inputs/CommonInput";
import { createInvite } from "../../../services/api/invites";
import type { ApiError } from "../../../services/api/errors";

const PANEL_LABEL =
  "font-fantasy text-xs font-bold uppercase tracking-[0.16em] text-gold-bright";

export default function CreateInvite({ campaignId }: { campaignId: string }) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [linkButtonText, setLinkButtonText] = useState("Get invite link");
  const [linkLoading, setLinkLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const handleGetLink = () => {
    setLinkLoading(true);
    setLinkButtonText("Generating...");

    createInvite(campaignId)
      .then((data) => {
        const link = `${window.location.origin}/invite/${data.response.token}`;
        navigator.clipboard.writeText(link);
        setLinkButtonText("Copied!");
        setTimeout(() => setLinkButtonText("Get invite link"), 2000);
      })
      .catch((error: ApiError) => {
        console.error(error.data.error.message);
        setLinkButtonText("Error!");
        setTimeout(() => setLinkButtonText("Get invite link"), 2000);
      })
      .finally(() => setLinkLoading(false));
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
    setEmailLoading(true);

    createInvite(campaignId, email)
      .then(() => {
        setEmailSuccess("Invite sent!");
        setEmail("");
        setTimeout(() => setEmailSuccess(null), 3000);
      })
      .catch((error: ApiError) => {
        setEmailError(error.data.error.message);
        console.error(error.data.error.message);
      })
      .finally(() => setEmailLoading(false));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={PANEL_LABEL}>Invite players</span>
        <div className="flex flex-wrap items-center gap-2">
          <CommonButton onClick={handleGetLink} size="sm" disabled={linkLoading}>
            {linkButtonText}
          </CommonButton>
          <CommonButton
            onClick={handleSendInvite}
            variant="accept"
            size="sm"
            disabled={emailLoading}
          >
            {emailLoading ? "Sending..." : "Send invite"}
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
