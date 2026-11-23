import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Preconfigured authorized credentials
const MOCK_AUTHORIZED_USERS = [
  { username: "admin", password: "password" },
  { username: "admin", password: "admin" },
  { username: "client", password: "client" },
  { username: "client", password: "password" },
  { username: "user", password: "user" },
  { username: "user", password: "password" },
  { username: "sublimatio", password: "sublimatio" },
];

/**
 * Mobile user-agent detection regex.
 */
function isMobileUA() {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

/**
 * Login view.
 * - Desktop user-agent: automatically shows login-page like normally.
 * - Mobile user-agent + mobile screen size: shows unauthorized access warning.
 * - When mobile logs in and is authorized: straight to client send (/client).
 * - When unauthorized/wrong credentials: denied.
 */
export default function LoginView() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Check if both user-agent is mobile AND screen size is mobile (<= 768px)
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = isMobileUA() && isMobileScreen;

  // If already authorized in session on mobile device, go straight to client send
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("sublimatio_auth");
      if (stored) {
        const auth = JSON.parse(stored);
        if (auth && auth.authorized) {
          if (isMobile) {
            navigate("/client");
          } else {
            navigate("/dashboard");
          }
        }
      }
    } catch {
      // Ignore sessionStorage read errors
    }
  }, [isMobile, navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Required fields check
    if (!username.trim() || !password.trim()) {
      setError("Username and password must be fill before login!");
      return;
    }

    // Authorization check
    const isAuthorized = MOCK_AUTHORIZED_USERS.some(
      (user) =>
        user.username.toLowerCase() === username.trim().toLowerCase() &&
        user.password === password.trim(),
    );

    if (!isAuthorized) {
      // Denied when not authorized
      setError(
        isMobile
          ? "Access Denied: Mobile client authorization rejected. Invalid credentials."
          : "Access Denied: Invalid credentials.",
      );
      return;
    }

    // Authorized
    setError("");
    setSubmitting(true);

    const authData = {
      username: username.trim(),
      authorized: true,
      device: isMobile ? "Mobile (Client Node)" : "Desktop (Workstation)",
      loginTime: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem("sublimatio_auth", JSON.stringify(authData));
    } catch (e) {
      console.warn("Could not save session:", e);
    }

    // Mobile goes straight to client send, desktop goes to dashboard
    if (isMobile) {
      setTimeout(() => navigate("/client"), 400);
    } else {
      setTimeout(() => navigate("/dashboard"), 400);
    }
  };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
    setError("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-5">
      <div className="grid-img-decoration mask-img-w-radial" />

      <Card className="glass-card relative z-10 flex w-full max-w-[432px] gap-5 p-8 py-8 shadow-2xl">
        <header className="flex w-full flex-col gap-2">
          <h1 className="font-chakra text-2xl font-bold tracking-wide text-sublimatio-text">
            Authentication
          </h1>
          <h2 className="font-chakra text-sm font-semibold tracking-wider text-sublimatio-tertiary">
            Sublimatio - Sync. Sublimate. Vanish.
          </h2>
        </header>

        {/* Unauthorized Access: only on mobile (mobile UA + mobile screen size) */}
        {isMobile && (
          <Alert
            variant="destructive"
            className="animate-slide-down border-sublimatio-red/60 bg-sublimatio-red/15 font-chakra text-xs text-sublimatio-red shadow-[0_0_20px_rgba(243,38,38,0.25)]"
          >
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-sublimatio-red" />
            <AlertDescription>
              <p className="text-xs font-bold uppercase tracking-wider">
                Unauthorized Access
              </p>
              <p className="mt-1 font-rajdhani text-[13px] leading-snug text-slate-300">
                Mobile client device is not authorized. Please authenticate to
                authorize this client node and access Client Send.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Error alert when credentials fail or empty */}
        {error && (
          <Alert
            variant="destructive"
            className="animate-slide-down border-sublimatio-red/50 bg-sublimatio-red/20 font-chakra text-xs text-sublimatio-red"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
          <p className="text-sm font-medium text-sublimatio-muted">
            Please use login using your preconfigured credential
          </p>

          <div>
            <Label
              htmlFor="username_id"
              className="text-xs font-semibold uppercase text-sublimatio-subtle"
            >
              Username
            </Label>
            <Input
              id="username_id"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Input your username"
              className="ui-input my-2 p-2 font-mono text-[13px] text-sublimatio-subtle hover:text-[#afb8e9]"
            />
          </div>

          <div>
            <Label
              htmlFor="password_id"
              className="text-xs font-semibold uppercase text-sublimatio-subtle"
            >
              Password
            </Label>
            <Input
              id="password_id"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Input your password here"
              className="ui-input password-futuristic my-2 p-2 font-mono text-[13px] text-sublimatio-subtle hover:text-[#afb8e9]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="min-w-[90px] border-[#1a2868] bg-gradient-to-b from-[#1520522d] to-[#0f227737] font-chakra text-[11px] font-semibold uppercase text-sublimatio-glow hover:brightness-125 active:brightness-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline"
              disabled={submitting}
              className="min-w-[90px] border-[#1a2868] bg-gradient-to-b from-[#1520522d] to-[#0f227737] font-chakra text-[11px] font-semibold uppercase text-sublimatio-glow hover:brightness-125 active:brightness-50 disabled:opacity-60"
            >
              {submitting ? "Authenticating..." : "Login"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
