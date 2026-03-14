import { useEffect, useRef, useState } from "react";
import { getMyInvites, respondToInvite } from "../../services/api/invites";
import type { Invite } from "../../types/invites";
import type { ApiError } from "../../services/api/errors";
import CommonButton from "../ui/buttons/CommonButton";
import { useAuth } from "../../hooks/useAuth";
import { useSSE } from "../../hooks/useSSE";

function InvitesDropdown() {
  const { subscribe } = useSSE();
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingTokens, setLoadingTokens] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchInvites = () => {
    getMyInvites()
      .then((data) => setInvites(data.invites))
      .catch(() => setInvites([]));
  };

  useEffect(() => {
    if (!user) return;
    fetchInvites();
    const unsubscribe = subscribe("invite_created", () => fetchInvites());
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRespond = (token: string, action: "accept" | "reject") => {
    setLoadingTokens((prev) => new Set(prev).add(token));
    respondToInvite(token, action)
      .then(() => {
        setInvites((prev) => prev.filter((inv) => inv.token !== token));
      })
      .catch((error: ApiError) => {
        console.error(error.data.message);
      })
      .finally(() => {
        setLoadingTokens((prev) => {
          const next = new Set(prev);
          next.delete(token);
          return next;
        });
      });
  };

  return (
    <div className="relative flex items-center justify-center" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-400 hover:text-amber-300 transition-colors duration-200 cursor-pointer"
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
          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {invites.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-200">
              Invites {invites.length > 0 && `(${invites.length})`}
            </h3>
          </div>

          {invites.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">No pending invites</div>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {invites.map((invite) => (
                <li key={invite.id} className="px-4 py-3 border-b border-gray-700/50 last:border-b-0">
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-200">{invite.campaign?.name ?? "Unknown campaign"}</p>
                      <p className="text-xs text-gray-500">DM: {invite.campaign?.dm.displayName ?? "Unknown"}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <CommonButton
                        onClick={() => handleRespond(invite.token, "reject")}
                        variant="decline"
                        size="sm"
                        disabled={loadingTokens.has(invite.token)}
                      >
                        Reject
                      </CommonButton>
                      <CommonButton
                        onClick={() => handleRespond(invite.token, "accept")}
                        variant="accept"
                        size="sm"
                        disabled={loadingTokens.has(invite.token)}
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
