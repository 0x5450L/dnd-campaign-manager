import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyInvites, respondToInvite } from "../services/api/invites";
import type { Invite } from "../types/invites";
import { useAuth } from "../hooks/useAuth";
import { useSSE } from "../hooks/useSSE";

export const inviteKeys = {
  all: ["invites"] as const,
  mine: () => [...inviteKeys.all, "mine"] as const,
};

export const useMyInvitesQuery = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: inviteKeys.mine(),
    queryFn: async () => (await getMyInvites()).invites,
    enabled: !!user,
  });
};

export const useRespondToInviteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { token: string; action: "accept" | "reject" }) =>
      respondToInvite(vars.token, vars.action),
    onSuccess: (_data, vars) => {
      queryClient.setQueryData<Invite[]>(inviteKeys.mine(), (current) =>
        current?.filter((invite) => invite.token !== vars.token),
      );
    },
  });
};

export const useInvitesRealtimeSync = () => {
  const { subscribe } = useSSE();
  const queryClient = useQueryClient();

  useEffect(() => {
    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: inviteKeys.mine() });
    const unsubscribeCreated = subscribe("invite_created", invalidate);
    const unsubscribeRevoked = subscribe("invite_revoked", invalidate);
    return () => {
      unsubscribeCreated();
      unsubscribeRevoked();
    };
  }, [subscribe, queryClient]);
};
