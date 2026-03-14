import { useEffect, useState } from "react";
import type { MeResponse, User } from "../../types/auth";
import { me, logout as logoutApi } from "../../services/api/auth";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("dndCampaignManagerJWT"));
  const [isLoading, setIsLoading] = useState(!!token);

  useEffect(() => {
    if (!token) return;
    me()
      .then((data: MeResponse) => {
        setUser(data.user);
      })
      .catch((error: Error) => {
        console.error("Error fetching user:", error);
        localStorage.removeItem("dndCampaignManagerJWT");
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAuth = (user: User, token: string) => {
    localStorage.setItem("dndCampaignManagerJWT", token);
    setUser(user);
    setToken(token);
  };

  const logout = () => {
    logoutApi()
      .catch((error: Error) => {
        console.error("Error logging out:", error);
      })
      .finally(() => {
        localStorage.removeItem("dndCampaignManagerJWT");
        setUser(null);
        setToken(null);
      });
  };

  return <AuthContext.Provider value={{ user, token, setAuth, logout, isLoading }}>{children}</AuthContext.Provider>;
};
