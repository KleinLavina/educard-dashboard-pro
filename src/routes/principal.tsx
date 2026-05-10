import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/principal")({
  beforeLoad: () => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("educard_role", "principal");
    }
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});
