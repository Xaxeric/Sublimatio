import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

      <section className="glass-card relative z-10 flex w-full max-w-[432px] flex-col gap-5 p-8 shadow-2xl">
        <header className="flex w-full flex-col gap-2">
          <h1 className="font-chakra text-2xl font-bold tracking-wide text-sublimatio-text">
            Authentication
          </h1>
          <h2 className="font-chakra text-sm font-semibold tracking-wider text-sublimatio-tertiary">
            Sublimatio - Sync. Sublimate. Vanish.
          </h2>
        </header>

        {/* Show Unauthorized Access specifically when on mobile (mobile UA + mobile screen size) */}
        {isMobile && (
          <div className="flex items-start gap-3 rounded border border-sublimatio-red/60 bg-sublimatio-red/15 p-3.5 font-chakra text-xs text-sublimatio-red shadow-[0_0_20px_rgba(243,38,38,0.25)]">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-sublimatio-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                Unauthorized Access
              </p>
              <p className="mt-1 font-rajdhani text-[13px] leading-snug text-slate-300">
                Mobile client device is not authorized. Please authenticate to authorize this client node and access Client Send.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert Box (when credentials fail or empty) */}
        {error && (
          <div className="flex items-center rounded border border-sublimatio-red/50 bg-sublimatio-red/20 p-2.5 font-chakra text-xs text-sublimatio-red">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
          <p className="text-sm font-medium text-sublimatio-muted">
            Please use login using your preconfigured credential
          </p>

          <div>
            <label
              htmlFor="username_id"
              className="text-xs font-semibold uppercase text-sublimatio-subtle"
            >
              Username
            </label>
            <input
              id="username_id"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Input your username"
              className="my-2 w-full border border-[#0b1233] bg-[#09090c3f] p-2 font-mono text-[13px] text-sublimatio-subtle outline-none hover:text-[#afb8e9] focus:border-sublimatio-accent"
            />
          </div>

          <div>
            <label
              htmlFor="password_id"
              className="text-xs font-semibold uppercase text-sublimatio-subtle"
            >
              Password
            </label>
            <input
              id="password_id"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Input your password here"
              className="my-2 w-full border border-[#0b1233] bg-[#09090c3f] p-2 font-mono text-[13px] text-sublimatio-subtle outline-none hover:text-[#afb8e9] focus:border-sublimatio-accent"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="min-w-[90px] border border-[#1a2868] bg-gradient-to-b from-[#1520522d] to-[#0f227737] px-3 py-2 font-chakra text-[11px] font-semibold uppercase text-sublimatio-glow transition-all hover:brightness-125 active:brightness-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-w-[90px] border border-[#1a2868] bg-gradient-to-b from-[#1520522d] to-[#0f227737] px-3 py-2 font-chakra text-[11px] font-semibold uppercase text-sublimatio-glow transition-all hover:brightness-125 active:brightness-50 disabled:opacity-60"
            >
              {submitting ? "Authenticating..." : "Login"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
