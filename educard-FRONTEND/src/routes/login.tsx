import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api, token } from "@/lib/api";
import { useRole, type Role } from "@/lib/role-context";
import { SCHOOL_NAME } from "@/lib/school-data";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: `Login — ${SCHOOL_NAME} (EduCard Pro)` }],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter your username and password");
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.auth.login(username, password);
      if (res.access) {
        token.set(res.access);
        if (res.refresh) token.setRefresh(res.refresh);
        const role = (res.user?.role === "admin" ? "admin" : res.user?.role ?? "admin") as Role;
        setRole(role);
        toast.success(`Welcome, ${res.user?.full_name || res.user?.username || username}!`);
        navigate({ to: "/dashboard" });
      }
    } catch {
      toast.error("Invalid username or password", {
        description: "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function enterDemo(role: Role) {
    setRole(role);
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground shadow-lg"
            style={{ background: "var(--gradient-primary)" }}
          >
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">EduCard Pro</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{SCHOOL_NAME}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                style={{ background: "var(--gradient-primary)" }}
                disabled={isLoading}
              >
                {isLoading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <p className="text-center font-ui text-[11px] uppercase tracking-wider text-muted-foreground">
            Demo — no login required
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["admin", "teacher", "parent", "student"] as const).map((r) => (
              <button
                key={r}
                onClick={() => enterDemo(r)}
                className="rounded-lg border bg-card px-3 py-2 text-xs font-medium capitalize transition-colors hover:bg-muted"
              >
                Enter as {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
