import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, me, register, logout as logoutApi } from "../services/api/auth";
import { resetSocket } from "../services/socket";
import type { User } from "../types/auth";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export const useMeQuery = () =>
  useQuery({
    queryKey: authKeys.me,
    queryFn: async () => (await me()).user,
    retry: false,
  });

export const useIsSignedIn = () => {
  const { data } = useMeQuery();
  return Boolean(data);
};

export const useAuthActions = () => {
  const queryClient = useQueryClient();

  const setAuth = (user: User) => {
    queryClient.clear();
    resetSocket();
    queryClient.setQueryData(authKeys.me, user);
  };

  const logout = () => {
    logoutApi()
      .catch((error: Error) => {
        console.error("Error logging out:", error);
      })
      .finally(() => {
        queryClient.clear();
        resetSocket();
      });
  };

  return { setAuth, logout };
};

export const useLoginMutation = () => {
  const { setAuth } = useAuthActions();
  return useMutation({
    mutationFn: (vars: { email: string; password: string }) =>
      login(vars.email, vars.password),
    onSuccess: (data) => {
      setAuth(data.user);
    },
  });
};

export const useRegisterMutation = () => {
  const { setAuth } = useAuthActions();
  return useMutation({
    mutationFn: (vars: { email: string; password: string; name: string }) =>
      register(vars.email, vars.password, vars.name),
    onSuccess: (data) => {
      setAuth(data.user);
    },
  });
};
