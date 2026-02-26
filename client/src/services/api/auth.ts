import { apiClient } from ".";
import type { LoginResponse, MeResponse, RegisterResponse } from "../../types/auth";

export const register = async (email: string, password: string, name: string) => {
  return apiClient<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
};

export const login = async (email: string, password: string) => {
  return apiClient<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
};

export const me = async () => {
  return apiClient<MeResponse>('/api/me', {
    method: 'GET',
  })
};