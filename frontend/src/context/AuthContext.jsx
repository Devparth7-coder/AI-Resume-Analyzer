import { createContext, useEffect, useState } from "react";

import {
  getCurrentUserRequest,
  loginRequest,
  signupRequest,
} from "../api/auth";

export const AuthContext = createContext(null);

const TOKEN_KEY = "resume_analyzer_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function bootstrapAuth() {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        // Rehydrate the session from the API so protected routes survive refreshes.
        const currentUser = await getCurrentUserRequest();
        setUser(currentUser);
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    bootstrapAuth();
  }, [token]);

  async function login(payload) {
    const response = await loginRequest(payload);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  }

  async function signup(payload) {
    const response = await signupRequest(payload);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    authLoading,
    isAuthenticated: Boolean(token && user),
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
