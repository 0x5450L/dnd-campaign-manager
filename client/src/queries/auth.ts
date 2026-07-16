import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, me, register, logout as logoutApi } from "../services/api/auth";
import { useAuthStore } from "../state/auth/authStore";
import type { User } from "../types/auth";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export const useMeQuery = () => {
  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clearToken);
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        return (await me()).user;
      } catch (error) {
        clearToken();
        throw error;
      }
    },
    enabled: !!token,
    retry: false,
  });
};

export const useAuthActions = () => {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((s) => s.setToken);
  const clearToken = useAuthStore((s) => s.clearToken);

  const setAuth = (user: User, token: string) => {
    setToken(token);
    queryClient.setQueryData(authKeys.me, user);
  };

  const logout = () => {
    logoutApi()
      .catch((error: Error) => {
        console.error("Error logging out:", error);
      })
      .finally(() => {
        clearToken();
        queryClient.removeQueries({ queryKey: authKeys.me });
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
      setAuth(data.user, data.token);
    },
  });
};

export const useRegisterMutation = () => {
  const { setAuth } = useAuthActions();
  return useMutation({
    mutationFn: (vars: { email: string; password: string; name: string }) =>
      register(vars.email, vars.password, vars.name),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });
};
