import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

import { loginApi, registerApi } from "../api/payloads.js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
 * Login / registration view backed by the NestJS auth endpoints.
 * - Desktop user-agent: shows the login form normally.
 * - Mobile user-agent + mobile screen size: shows the unauthorized access
 *   warning and goes straight to Client Send after authenticating.
 * - Wrong credentials / validation failures are reported from the API.
 */
export default function LoginView({ token, login, register }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

  // Already authenticated (e.g. after a reload): resume the right view.
  useEffect(() => {
    if (token) {
      navigate(isMobile ? "/client" : "/dashboard", { replace: true });
    }
  }, [token, isMobile, navigate]);

  const switchMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setError("");
    setPassword("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || (mode === "register" && !name.trim())) {
      setError("Email, password dan nama (saat mendaftar) wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "register") {
        // POST /auth/register returns the public user only; exchange the new
        // credentials for a token through POST /auth/login.
        await registerApi({
          name: name.trim(),
          email: email.trim(),
          password,
        });
        register(await loginApi({ email: email.trim(), password }));
      } else {
        login(await loginApi({ email: email.trim(), password }));
      }

      setPassword("");
      navigate(isMobile ? "/client" : "/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.message ||
          (isMobile
            ? "Access Denied: Mobile client authorization rejected. Invalid credentials."
            : "Access Denied: Invalid credentials."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const isRegister = mode === "register";

  return (
    <div className="relative flex min-h-screen items-center justify-center p-5">
      <Card className="relative z-10 flex w-full max-w-[432px] gap-5 p-8 py-8 shadow-2xl">
        <header className="flex w-full flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-wide text-foreground">
            {isRegister ? "Create Account" : "Authentication"}
          </h1>
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground">
            Sublimatio - Sync. Sublimate. Vanish.
          </h2>
        </header>

        {/* Unauthorized Access: only on mobile (mobile UA + mobile screen size) */}
        {isMobile && (
          <Alert variant="destructive" className="text-xs">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <AlertDescription>
              <p className="text-xs font-bold uppercase tracking-wider">
                Unauthorized Access
              </p>
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                Mobile client device is not authorized. Please authenticate to
                authorize this client node and access Client Send.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Error alert when credentials fail or validation rejects input */}
        {error && (
          <Alert variant="destructive" className="text-xs">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {isRegister
              ? "Register a new account to enter the buffer."
              : "Sign in with your registered account."}
          </p>

          {isRegister && (
            <div>
              <Label
                htmlFor="name_id"
                className="text-xs font-semibold uppercase text-muted-foreground"
              >
                Name
              </Label>
              <Input
                id="name_id"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Input your name"
                autoComplete="name"
                className="my-2 p-2 text-[13px] text-foreground"
              />
            </div>
          )}

          <div>
            <Label
              htmlFor="email_id"
              className="text-xs font-semibold uppercase text-muted-foreground"
            >
              Email
            </Label>
            <Input
              id="email_id"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Input your email"
              autoComplete="email"
              className="my-2 p-2 text-[13px] text-foreground"
            />
          </div>

          <div>
            <Label
              htmlFor="password_id"
              className="text-xs font-semibold uppercase text-muted-foreground"
            >
              Password
            </Label>
            <Input
              id="password_id"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Input your password here"
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="password-masked my-2 p-2 text-[13px] text-foreground"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="min-w-[90px] text-[11px] font-semibold uppercase"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="min-w-[90px] text-[11px] font-semibold uppercase disabled:opacity-60"
            >
              {submitting
                ? isRegister
                  ? "Registering..."
                  : "Authenticating..."
                : isRegister
                  ? "Register"
                  : "Login"}
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={switchMode}
            className="justify-start px-0 text-[11px] uppercase text-muted-foreground hover:text-foreground"
          >
            {isRegister
              ? "Already registered? Login"
              : "Need an account? Register"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
