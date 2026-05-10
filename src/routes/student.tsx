import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/student")({
  beforeLoad: () => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("educard_role", "student");
    }
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});
