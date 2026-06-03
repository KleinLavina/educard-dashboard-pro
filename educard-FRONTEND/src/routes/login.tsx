import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, GraduationCap, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api, token, ApiError } from "@/lib/api";
import { useRole, type Role } from "@/lib/role-context";
import { SCHOOL_NAME } from "@/lib/school-data";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    color: "bg-violet-500/10 text-violet-600 border-violet-200 dark:text-violet-400 dark:border-violet-800",
    dot: "bg-violet-500",
    username: "admin",
    password: "admin123",
    label: "Principal / Registrar",
  },
  {
    role: "Teacher",
    color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800",
    dot: "bg-blue-500",
    username: "aurora.aquino",
    password: "teacher123",
    label: "Grade 7 Adviser",
  },
  {
    role: "Parent",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
    dot: "bg-emerald-500",
    username: "maria.delacruz",
    password: "parent123",
    label: "Parent / Guardian",
  },
  {
    role: "Student",
    color: "bg-orange-500/10 text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800",
    dot: "bg-orange-500",
    username: "jose.aguilar",
    password: "student123",
    label: "Grade 7 Student",
  },
] as const;

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-1 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
      title="Copy"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { setRole, setUserId } = useRole();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function fillCredentials(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    toast.info("Credentials filled in — click Sign In", { duration: 2000 });
  }

  function getErrorMessage(err: unknown): { title: string; description: string } {
    if (err instanceof ApiError) {
      const detail =
        typeof err.body?.detail === "string" ? err.body.detail : "";
      switch (err.status) {
        case 400:
        case 401:
          if (detail.toLowerCase().includes("no active account"))
            return {
              title: "Wrong username or password",
              description: "Double-check your credentials and try again.",
            };
          if (detail.toLowerCase().includes("locked") || detail.toLowerCase().includes("disabled"))
            return {
              title: "Account locked",
              description: "Contact your school administrator to unlock your account.",
            };
          return {
            title: "Login failed",
            description: detail || "Invalid credentials — please try again.",
          };
        case 403:
          return {
            title: "Access denied",
            description: "Your account does not have permission to sign in.",
          };
        case 429:
          return {
            title: "Too many attempts",
            description: "You have been temporarily blocked. Please wait a few minutes.",
          };
        case 500:
        case 502:
        case 503:
          return {
            title: "Server error",
            description: "The server is having issues. Please try again in a moment.",
          };
        default:
          return {
            title: `Login error (${err.status})`,
            description: detail || "An unexpected error occurred.",
          };
      }
    }
    if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) {
      return {
        title: "Cannot reach server",
        description: "Check your internet connection or try refreshing the page.",
      };
    }
    return {
      title: "Something went wrong",
      description: "Please try again or contact your administrator.",
    };
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Username is required", {
        description: "Please enter your username to continue.",
      });
      return;
    }
    if (!password) {
      toast.error("Password is required", {
        description: "Please enter your password to continue.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.auth.login(username.trim(), password);
      if (res.access) {
        token.set(res.access);
        if (res.refresh) token.setRefresh(res.refresh);
        const role = (res.user?.role ?? "admin") as Role;
        setRole(role);
        setUserId(res.user?.id ?? null);
        const name = res.user?.full_name || res.user?.username || username;
        toast.success(`Welcome, ${name}!`, {
          description: `Signed in as ${role}`,
        });
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const { title, description } = getErrorMessage(err);
      toast.error(title, { description });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-5">
        {/* Logo + school name */}
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

        {/* Login form */}
        <Card>
          <CardHeader className="pb-3">
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
                    tabIndex={-1}
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

        {/* Demo credentials */}
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-4 px-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Demo Accounts
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.username}
                role="button"
                tabIndex={0}
                onClick={() => fillCredentials(acc.username, acc.password)}
                onKeyDown={(e) => e.key === "Enter" && fillCredentials(acc.username, acc.password)}
                className="w-full cursor-pointer rounded-lg border bg-muted/30 px-3 py-2 text-left hover:bg-muted/60 transition-colors group select-none"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${acc.color} shrink-0`}>
                      {acc.role}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{acc.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                    click to fill
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs font-mono">
                  <span className="flex items-center gap-0.5">
                    <span className="text-muted-foreground">user:</span>
                    <span className="font-semibold">{acc.username}</span>
                    <CopyButton value={acc.username} />
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span className="text-muted-foreground">pw:</span>
                    <span className="font-semibold">{acc.password}</span>
                    <CopyButton value={acc.password} />
                  </span>
                </div>
              </div>
            ))}
            <p className="pt-1 text-[10px] text-muted-foreground text-center">
              Click any row to auto-fill the form above
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Contact your school administrator if you need access.
        </p>
      </div>
    </div>
  );
}
