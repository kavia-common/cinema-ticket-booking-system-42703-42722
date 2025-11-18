import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context */
  return useContext(AuthContext);
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides auth state and actions to children. */
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token/email from localStorage on mount
  useEffect(() => {
    try {
      const t = localStorage.getItem("auth_token");
      const e = localStorage.getItem("auth_email");
      if (t) setToken(t);
      if (e) setEmail(e);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const value = useMemo(() => {
    return {
      token,
      email,
      authenticated: Boolean(token),
      // PUBLIC_INTERFACE
      async register(emailValue, password, name) {
        /** Registers a new user and auto logs in. */
        await api.register(emailValue, password, name);
        // immediately login
        const res = await api.login(emailValue, password);
        try {
          localStorage.setItem("auth_token", res.access_token);
          localStorage.setItem("auth_email", emailValue);
        } catch {
          // ignore
        }
        setToken(res.access_token);
        setEmail(emailValue);
        return res;
      },
      // PUBLIC_INTERFACE
      async login(emailValue, password) {
        /** Logs in user and stores token. */
        const res = await api.login(emailValue, password);
        try {
          localStorage.setItem("auth_token", res.access_token);
          localStorage.setItem("auth_email", emailValue);
        } catch {
          // ignore
        }
        setToken(res.access_token);
        setEmail(emailValue);
        return res;
      },
      // PUBLIC_INTERFACE
      logout() {
        /** Clears auth token. */
        try {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_email");
        } catch {
          // ignore
        }
        setToken(null);
        setEmail(null);
      },
    };
  }, [token, email]);

  if (loading) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
