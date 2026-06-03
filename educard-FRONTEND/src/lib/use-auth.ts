/**
 * EduCard Pro — Centralised Auth Hook
 *
 * Single source of truth for:
 *   - Login  (with granular toast messages per error type)
 *   - Logout (clears tokens + redirects)
 *   - Session guard (expired / missing token detection)
 *   - Current user state
 *
 * Re-use this hook on every page that needs auth context.
 * The toast messages are defined once here so they're consistent
 * across the whole app.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { api, token, ApiError } from "./api";
import { useRole, type Role, parseJwt } from "./role-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: Role;
  is_2fa_enabled: boolean;
}

// ─── Toast message catalogue  ─────────────────────────────────────────────────
// All auth-related toasts live here. Import the hook; never call toast() for
// auth directly from a component.

const AUTH_TOASTS = {
  loginSuccess: (name: string) =>
    toast.success(`Welcome back, ${name}!`, {
      description: "You are now signed in.",
      duration: 3000,
    }),

  loginEmpty: () =>
    toast.error("Username and password are required.", {
      description: "Please fill in both fields before signing in.",
    }),

  loginWrongCredentials: () =>
    toast.error("Incorrect username or password.", {
      description: "Please double-check your credentials and try again.",
    }),

  loginAccountLocked: () =>
    toast.error("Account locked.", {
      description:
        "Too many failed attempts. Contact your school administrator to unlock your account.",
      duration: 6000,
    }),

  loginAccountInactive: () =>
    toast.error("Account is inactive.", {
      description: "Your account has been disabled. Contact your administrator.",
      duration: 6000,
    }),

  loginServerError: () =>
    toast.error("Server error. Please try again later.", {
      description: "The server encountered an unexpected error.",
    }),

  loginNetworkError: () =>
    toast.error("Cannot reach the server.", {
      description:
        "Check your internet connection or make sure the backend is running on port 8000.",
      duration: 6000,
    }),

  logoutSuccess: () =>
    toast.success("You have been signed out.", { duration: 2000 }),

  sessionExpired: () =>
    toast.warning("Your session has expired.", {
      description: "Please sign in again.",
      duration: 4000,
    }),

  sessionRequired: () =>
    toast.error("You must be signed in to access this page.", {
      duration: 3000,
    }),

  twoFactorRequired: () =>
    toast.info("Two-factor authentication required.", {
      description: "Enter the OTP from your authenticator app.",
    }),
} as const;

// Export so tests / Storybook can reference the catalogue without the hook
export { AUTH_TOASTS };

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const navigate = useNavigate();
  const { setRole, setUserId } = useRole();
  const [isLoading, setIsLoading]       = useState(false);
  const [currentUser, setCurrentUser]   = useState<AuthUser | null>(null);

  // Hydrate current user from the stored JWT on first render
  useEffect(() => {
    const access = token.get();
    if (!access) return;
    const payload = parseJwt(access);
    if (!payload) return;
    // Token expired — clear silently; guard will handle redirect
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
      token.clear();
      return;
    }
    // Minimal user object from token claims (no extra round-trip needed)
    setCurrentUser({
      id:              payload.user_id ?? 0,
      username:        "",
      email:           "",
      full_name:       "",
      role:            (payload.role as Role) ?? "student",
      is_2fa_enabled:  false,
    });
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      if (!username.trim() || !password.trim()) {
        AUTH_TOASTS.loginEmpty();
        return false;
      }

      setIsLoading(true);
      try {
        const res = await api.auth.login(username.trim(), password);

        // Store tokens
        token.set(res.access);
        if (res.refresh) token.setRefresh(res.refresh);

        // 2FA required — backend returns access token of a limited scope
        if (res.user?.is_2fa_enabled) {
          AUTH_TOASTS.twoFactorRequired();
          // Return true so the login page can show the OTP input step
          return true;
        }

        // Set role in context
        const role = (res.user?.role ?? "admin") as Role;
        setRole(role);
        setUserId(res.user?.id ?? null);

        // Hydrate current user
        setCurrentUser({
          id:             res.user?.id ?? 0,
          username:       res.user?.username ?? username,
          email:          res.user?.email ?? "",
          full_name:      res.user?.full_name ?? username,
          role,
          is_2fa_enabled: res.user?.is_2fa_enabled ?? false,
        });

        AUTH_TOASTS.loginSuccess(res.user?.full_name || username);
        navigate({ to: "/dashboard" });
        return true;

      } catch (err) {
        if (err instanceof ApiError) {
          // 401 — wrong credentials
          if (err.status === 401) {
            AUTH_TOASTS.loginWrongCredentials();
            return false;
          }
          // 400 — validation (missing fields, etc.)
          if (err.status === 400) {
            const detail = (err.body?.detail as string) ?? "";
            if (detail.toLowerCase().includes("inactive")) {
              AUTH_TOASTS.loginAccountInactive();
            } else if (detail.toLowerCase().includes("lock")) {
              AUTH_TOASTS.loginAccountLocked();
            } else {
              AUTH_TOASTS.loginWrongCredentials();
            }
            return false;
          }
          // 403 — locked account
          if (err.status === 403) {
            AUTH_TOASTS.loginAccountLocked();
            return false;
          }
          // 5xx — server error
          if (err.status >= 500) {
            AUTH_TOASTS.loginServerError();
            return false;
          }
        }
        // Network / fetch error
        AUTH_TOASTS.loginNetworkError();
        return false;

      } finally {
        setIsLoading(false);
      }
    },
    [navigate, setRole, setUserId]
  );

  // ── Logout ─────────────────────────────────────────────────────────────────

  const logout = useCallback(
    (silent = false) => {
      token.clear();
      setCurrentUser(null);
      setRole("admin"); // reset to default
      setUserId(null);
      if (!silent) AUTH_TOASTS.logoutSuccess();
      navigate({ to: "/login" });
    },
    [navigate, setRole, setUserId]
  );

  // ── Session expired helper (called from __root.tsx on 401) ─────────────────

  const onSessionExpired = useCallback(() => {
    token.clear();
    setCurrentUser(null);
    AUTH_TOASTS.sessionExpired();
    navigate({ to: "/login" });
  }, [navigate]);

  // ── Guard: call this at the top of any protected page ─────────────────────
  //   Returns true if the user is authenticated, false if they were redirected.

  const requireAuth = useCallback((): boolean => {
    const access = token.get();
    if (!access) {
      AUTH_TOASTS.sessionRequired();
      navigate({ to: "/login" });
      return false;
    }
    const payload = parseJwt(access);
    if (!payload) {
      AUTH_TOASTS.sessionRequired();
      navigate({ to: "/login" });
      return false;
    }
    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
      AUTH_TOASTS.sessionExpired();
      token.clear();
      navigate({ to: "/login" });
      return false;
    }
    return true;
  }, [navigate]);

  // ── Derived state ──────────────────────────────────────────────────────────

  const isAuthenticated = !!token.get();
  const role = currentUser?.role ?? null;

  return {
    // State
    currentUser,
    isLoading,
    isAuthenticated,
    role,

    // Actions
    login,
    logout,
    requireAuth,
    onSessionExpired,
  };
}
