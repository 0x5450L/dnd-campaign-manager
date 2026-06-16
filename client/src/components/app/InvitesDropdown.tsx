import { useEffect, useRef, useState } from "react";
import CommonButton from "../ui/buttons/CommonButton";
import {
  useInvitesRealtimeSync,
  useMyInvitesQuery,
  useRespondToInviteMutation,
} from "../../queries/invites";

function InvitesDropdown() {
  useInvitesRealtimeSync();
  const { data: invites = [] } = useMyInvitesQuery();
  const respondMutation = useRespondToInviteMutation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isResponding = (token: string) =>
    respondMutation.isPending && respondMutation.variables?.token === token;

  const handleRespond = (token: string, action: "accept" | "reject") => {
    respondMutation.mutate({ token, action });
  };

  return (
    <div className="relative flex items-center justify-center" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-dim hover:text-gold-bright transition-colors duration-200 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {invites.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-gold text-ink text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {invites.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-80 bg-surface border border-rule rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-rule">
            <h3 className="text-sm font-semibold text-ink">
              Invites {invites.length > 0 && `(${invites.length})`}
            </h3>
          </div>

          {invites.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-faint">No pending invites</div>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {invites.map((invite) => (
                <li key={invite.id} className="px-4 py-3 border-b border-rule/50 last:border-b-0">
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-sm font-medium text-ink">{invite.campaign?.name ?? "Unknown campaign"}</p>
                      <p className="text-xs text-faint">DM: {invite.campaign?.dm.displayName ?? "Unknown"}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <CommonButton
                        onClick={() => handleRespond(invite.token, "reject")}
                        variant="decline"
                        size="sm"
                        disabled={isResponding(invite.token)}
                      >
                        Reject
                      </CommonButton>
                      <CommonButton
                        onClick={() => handleRespond(invite.token, "accept")}
                        variant="accept"
                        size="sm"
                        disabled={isResponding(invite.token)}
                      >
                        Accept
                      </CommonButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default InvitesDropdown;
