import { createContext, useContext, useState } from "react";

export type Role = "principal" | "teacher" | "student";

const STORAGE_KEY = "educard_role";

function readStored(): Role {
  if (typeof localStorage === "undefined") return "principal";
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "teacher" || v === "student" || v === "principal") return v;
  return "principal";
}

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue>({
  role: "principal",
  setRole: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>(readStored);

  function setRole(newRole: Role) {
    setRoleState(newRole);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newRole);
    }
  }

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
