import { createContext, useContext, useState } from "react";

export type Role = "admin" | "teacher" | "student" | "parent";

export function parseJwt(token: string): { role?: string; user_id?: number; exp?: number } | null {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isValidRole(v: unknown): v is Role {
  return v === "admin" || v === "teacher" || v === "student" || v === "parent";
}

function readFromToken(): { role: Role; userId: number | null } | null {
  if (typeof localStorage === "undefined") return null;
  const access = localStorage.getItem('educard_access');
  if (!access) return null;
  const payload = parseJwt(access);
  if (!payload || !isValidRole(payload.role)) return null;
  if (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()) return null;
  return { role: payload.role, userId: payload.user_id ?? null };
}

function readStoredRole(): Role {
  const fromToken = readFromToken();
  return fromToken?.role ?? "admin";
}

function readStoredUserId(): number | null {
  return readFromToken()?.userId ?? null;
}

interface RoleContextValue {
  role: Role;
  userId: number | null;
  setRole: (role: Role) => void;
  setUserId: (id: number | null) => void;
}

const RoleContext = createContext<RoleContextValue>({
  role: "admin",
  userId: null,
  setRole: () => {},
  setUserId: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>(readStoredRole);
  const [userId, setUserIdState] = useState<number | null>(readStoredUserId);

  function setRole(newRole: Role) {
    setRoleState(newRole);
  }

  function setUserId(id: number | null) {
    setUserIdState(id);
  }

  return (
    <RoleContext.Provider value={{ role, userId, setRole, setUserId }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
