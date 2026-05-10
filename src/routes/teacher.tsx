import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/teacher")({
  beforeLoad: () => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("educard_role", "teacher");
    }
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});
