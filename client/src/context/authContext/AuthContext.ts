import { createContext } from "react";
import type { User } from "../../types/auth";

type AuthContextType = {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);